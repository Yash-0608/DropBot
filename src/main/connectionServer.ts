import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { createReadStream, createWriteStream, promises as fs } from "node:fs";
import { networkInterfaces } from "node:os";
import { basename, extname, join } from "node:path";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { pipeline } from "node:stream/promises";
import { Transform } from "node:stream";

export type PairingInfo = {
  payload: string;
  token: string;
  port: number;
};

export type PairedPhone = {
  name: string;
  host: string;
  port: number;
};

type StatusListener = (phone: PairedPhone | null) => void;

const PREFERRED_PORT = 8765;
const maxBodyBytes = 4096;

let pairedPhone: PairedPhone | null = null;
let token = "";
let listener: StatusListener | undefined;
let activePort = PREFERRED_PORT;

function localAddress(): string {
  const addresses = Object.values(networkInterfaces())
    .flatMap((entries) => entries ?? [])
    .filter((entry) => entry.family === "IPv4" && !entry.internal)
    .map((entry) => entry.address)
    .filter((address) => !address.startsWith("169.254."));

  const privateAddress = addresses.find((address) =>
    address.startsWith("10.") ||
    address.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(address)
  );
  if (privateAddress) return privateAddress;
  if (addresses[0]) return addresses[0];
  return "127.0.0.1";
}

function json(response: ServerResponse, status: number, body: unknown): void {
  const data = JSON.stringify(body);
  response.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(data),
    "Access-Control-Allow-Origin": "*",
  });
  response.end(data);
}

function matchesToken(value: string | string[] | undefined): boolean {
  if (Array.isArray(value)) return false;
  if (!value || value.length !== token.length) return false;
  return timingSafeEqual(Buffer.from(value), Buffer.from(token));
}

function safeFilename(value: string): string {
  const decoded = decodeURIComponent(value);
  const name = basename(decoded).replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_").trim();
  return name || "dropbot-file";
}

async function uniqueOutputPath(directory: string, filename: string): Promise<string> {
  const extension = extname(filename);
  const stem = filename.slice(0, filename.length - extension.length);
  let candidate = join(directory, filename);
  let suffix = 1;
  while (true) {
    try {
      const reservation = await fs.open(candidate, "wx");
      await reservation.close();
      return candidate;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "EEXIST") {
        candidate = join(directory, `${stem} (${suffix++})${extension}`);
        continue;
      }
      throw error;
    }
  }
}

async function readBody(request: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = Buffer.from(chunk);
    size += buffer.length;
    if (size > maxBodyBytes) throw new Error("Request body is too large");
    chunks.push(buffer);
  }
  return Buffer.concat(chunks).toString("utf8");
}

const server = createServer(async (request, response) => {
  try {
    if (request.method === "OPTIONS") {
      response.writeHead(204, { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type" });
      response.end();
      return;
    }

    if (request.method === "GET" && request.url === "/health") {
      json(response, 200, { service: "DropBot", paired: pairedPhone !== null });
      return;
    }

    if (request.method === "POST" && request.url === "/pair") {
      const body = JSON.parse(await readBody(request)) as Partial<PairedPhone> & { token?: string };
      if (typeof body.token !== "string" || body.token.length !== token.length ||
          !timingSafeEqual(Buffer.from(body.token), Buffer.from(token)) ||
          typeof body.name !== "string" || typeof body.host !== "string" ||
          typeof body.port !== "number") {
        json(response, 401, { error: "Invalid pairing token or device details" });
        return;
      }
      if (!/^[a-zA-Z0-9._:-]+$/.test(body.host) || !Number.isInteger(body.port) || body.port < 1 || body.port > 65535) {
        json(response, 400, { error: "Invalid phone network address" });
        return;
      }
      pairedPhone = { name: body.name, host: body.host, port: body.port };
      listener?.(pairedPhone);
      json(response, 200, { paired: true, desktop: localAddress() });
      return;
    }

    if (request.method === "POST" && request.url === "/unpair") {
      pairedPhone = null;
      listener?.(null);
      json(response, 200, { paired: true });
      return;
    }

    if (request.method === "POST" && request.url === "/upload") {
      if (!matchesToken(request.headers["x-dropbot-token"])) {
        json(response, 401, { error: "Invalid transfer token" });
        return;
      }
      const filename = request.headers["x-dropbot-filename"];
      if (typeof filename !== "string" || filename.length === 0 || filename.length > 255) {
        json(response, 400, { error: "Missing x-dropbot-filename header" });
        return;
      }
      const downloads = join(process.env.USERPROFILE ?? process.cwd(), "Downloads");
      await fs.mkdir(downloads, { recursive: true });
      const output = await uniqueOutputPath(downloads, safeFilename(filename));
      const temporary = `${output}.${randomBytes(8).toString("hex")}.part`;
      try {
        await pipeline(request, createWriteStream(temporary, { flags: "wx", highWaterMark: 1024 * 1024 }));
        await fs.rename(temporary, output);
      } catch (error) {
        await fs.rm(temporary, { force: true });
        await fs.rm(output, { force: true });
        throw error;
      } finally {
        response.once("close", () => void fs.rm(temporary, { force: true }));
      }
      json(response, 201, { saved: output });
      return;
    }

    json(response, 404, { error: "Not found" });
  } catch (error) {
    json(response, 400, { error: error instanceof Error ? error.message : "Request failed" });
  }
});

export async function startConnectionServer(onStatus: StatusListener): Promise<PairingInfo> {
  listener = onStatus;
  token = randomBytes(18).toString("hex");
  if (server.listening) {
    return {
      token,
      port: activePort,
      payload: JSON.stringify({ v: 1, host: localAddress(), port: activePort, token }),
    };
  }

  await new Promise<void>((resolve, reject) => {
    const handleError = (error: NodeJS.ErrnoException) => {
      if (error.code !== "EADDRINUSE") {
        reject(error);
        return;
      }
      server.removeListener("error", handleError);
      server.listen(0, "0.0.0.0", () => resolve());
    };
    server.once("error", handleError);
    server.listen(PREFERRED_PORT, "0.0.0.0", () => resolve());
  });
  const address = server.address();
  activePort = typeof address === "object" && address !== null ? address.port : PREFERRED_PORT;
  return {
    token,
    port: activePort,
    payload: JSON.stringify({ v: 1, host: localAddress(), port: activePort, token }),
  };
}

export function getPairedPhone(): PairedPhone | null {
  return pairedPhone;
}

export async function stopConnectionServer(): Promise<void> {
  if (!server.listening) return;
  await new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
}

export async function sendFileToPhone(
  filePath: string,
  onProgress?: (transferredBytes: number, totalBytes: number) => void
): Promise<void> {
  if (!pairedPhone) throw new Error("No phone is paired");
  const stats = await fs.stat(filePath);
  if (!stats.isFile()) throw new Error("The selected path is not a file");
  let transferredBytes = 0;
  let lastReport = 0;
  const source = createReadStream(filePath, { highWaterMark: 1024 * 1024 });
  const progress = new Transform({
    transform(chunk, _encoding, callback) {
      transferredBytes += chunk.length;
      const now = Date.now();
      if (now - lastReport >= 100 || transferredBytes === stats.size) {
        lastReport = now;
        onProgress?.(transferredBytes, stats.size);
      }
      callback(null, chunk);
    },
  });
  source.pipe(progress);
  const response = await fetch(`http://${pairedPhone.host}:${pairedPhone.port}/upload`, {
    method: "POST",
    headers: {
      "X-DropBot-Filename": encodeURIComponent(basename(filePath)),
      "X-DropBot-Token": token,
      "Content-Length": String(stats.size),
    },
    body: progress as unknown as BodyInit,
    // Node's fetch requires duplex for streaming request bodies.
    duplex: "half",
  } as RequestInit & { duplex: "half" });
  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(
      `Phone rejected transfer (${response.status})${details ? `: ${details}` : ""}`
    );
  }
}
