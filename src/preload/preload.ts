import { contextBridge, ipcRenderer, webUtils } from "electron";

type PairingInfo = { payload: string; token: string; port: number };
type PhoneInfo = { name: string; host: string; port: number } | null;
type TransferProgress = { transferredBytes: number; totalBytes: number };
type DropBotError = { message: string };

let pairingCallback: ((info: PairingInfo) => void) | undefined;
let connectionCallback: ((phone: PhoneInfo) => void) | undefined;
let pendingPairing: PairingInfo | undefined;
let pendingConnection: PhoneInfo | undefined;
let errorCallback: ((error: DropBotError) => void) | undefined;
let pendingError: DropBotError | undefined;

ipcRenderer.on("dropbot:pairing", (_event, info: PairingInfo) => {
  if (pairingCallback) {
    pairingCallback(info);
  } else {
    pendingPairing = info;
  }
});

ipcRenderer.on("dropbot:connection", (_event, phone: PhoneInfo) => {
  if (connectionCallback) {
    connectionCallback(phone);
  } else {
    pendingConnection = phone;
  }
});

ipcRenderer.on("dropbot:error", (_event, error: DropBotError) => {
  if (errorCallback) errorCallback(error);
  else pendingError = error;
});

contextBridge.exposeInMainWorld("dropbot", {
  moveWindow: (x: number, y: number) => {
    ipcRenderer.send("dropbot:move-window", { x, y });
  },
  dragWindow: (x: number, y: number) => {
    ipcRenderer.send("dropbot:drag-window", { x, y });
  },
  onPairing: (callback: (info: { payload: string; token: string; port: number }) => void) => {
    pairingCallback = callback;
    if (pendingPairing) {
      callback(pendingPairing);
      pendingPairing = undefined;
    }
  },
  onConnection: (callback: (phone: { name: string; host: string; port: number } | null) => void) => {
    connectionCallback = callback;
    if (pendingConnection !== undefined) {
      callback(pendingConnection);
      pendingConnection = undefined;
    }
  },
  sendFile: (filePath: string) => ipcRenderer.invoke("dropbot:send-file", filePath),
  getFilePath: (file: File) => webUtils.getPathForFile(file),
  onTransferProgress: (callback: (progress: TransferProgress) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, progress: TransferProgress) => callback(progress);
    ipcRenderer.on("dropbot:transfer-progress", listener);
    return () => ipcRenderer.removeListener("dropbot:transfer-progress", listener);
  },
  onError: (callback: (error: DropBotError) => void) => {
    errorCallback = callback;
    if (pendingError) {
      callback(pendingError);
      pendingError = undefined;
    }
  },
});