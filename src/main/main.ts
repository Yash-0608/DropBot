import { app, BrowserWindow, ipcMain } from "electron";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { startConnectionServer, sendFileToPhone, stopConnectionServer } from "./connectionServer.ts";

let botWindow: BrowserWindow | null = null;
const currentDirectory = dirname(fileURLToPath(import.meta.url));

function createBotWindow(): void {
  botWindow = new BrowserWindow({
    width: 300,
    height: 390,

    frame: false,
    transparent: true,
    resizable: false,
    movable: true,

    alwaysOnTop: true,
    skipTaskbar: true,

    hasShadow: false,

    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: join(currentDirectory, "../preload/preload.js")
    }
  });

  botWindow.loadURL("http://localhost:5173");

  botWindow.on("closed", () => {
    botWindow = null;
  });
}

ipcMain.on(
  "dropbot:move-window",
  (_event, position: { x: number; y: number }) => {
    if (!botWindow) {
      return;
    }

    if (!Number.isFinite(position.x) || !Number.isFinite(position.y)) {
      return;
    }

    botWindow.setPosition(
      Math.round(position.x),
      Math.round(position.y),
      false
    );
  }
);

ipcMain.on(
  "dropbot:drag-window",
  (_event, delta: { x: number; y: number }) => {
    if (!botWindow || !Number.isFinite(delta.x) || !Number.isFinite(delta.y)) {
      return;
    }
    const [x, y] = botWindow.getPosition();
    botWindow.setPosition(x + Math.round(delta.x), y + Math.round(delta.y), false);
  }
);

app.whenReady().then(async () => {
  createBotWindow();
  try {
    const pairing = await startConnectionServer((phone) => {
      botWindow?.webContents.send("dropbot:connection", phone);
    });
    botWindow?.webContents.once("did-finish-load", () => {
      botWindow?.webContents.send("dropbot:pairing", pairing);
    });
  } catch (error) {
    botWindow?.webContents.once("did-finish-load", () => {
      botWindow?.webContents.send("dropbot:error", {
        message: error instanceof Error ? error.message : "Could not start connection server",
      });
    });
  }
});

ipcMain.handle("dropbot:send-file", async (event, filePath: unknown) => {
  if (typeof filePath !== "string" || filePath.length === 0) {
    throw new Error("A file path is required");
  }
  await sendFileToPhone(filePath, (transferredBytes, totalBytes) => {
    event.sender.send("dropbot:transfer-progress", { transferredBytes, totalBytes });
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    void stopConnectionServer().finally(() => app.quit());
  }
});