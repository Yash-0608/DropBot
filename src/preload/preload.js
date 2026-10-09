const { contextBridge, ipcRenderer, webUtils } = require("electron");

let pairingCallback;
let connectionCallback;
let pendingPairing;
let pendingConnection;
let errorCallback;
let pendingError;

ipcRenderer.on("dropbot:pairing", (_event, info) => {
  if (pairingCallback) {
    pairingCallback(info);
  } else {
    pendingPairing = info;
  }
});

ipcRenderer.on("dropbot:connection", (_event, phone) => {
  if (connectionCallback) {
    connectionCallback(phone);
  } else {
    pendingConnection = phone;
  }
});

ipcRenderer.on("dropbot:error", (_event, error) => {
  if (errorCallback) {
    errorCallback(error);
  } else {
    pendingError = error;
  }
});

contextBridge.exposeInMainWorld("dropbot", {
  moveWindow(x, y) {
    ipcRenderer.send("dropbot:move-window", { x, y });
  },
  dragWindow(x, y) {
    ipcRenderer.send("dropbot:drag-window", { x, y });
  },
  onPairing(callback) {
    pairingCallback = callback;
    if (pendingPairing) {
      callback(pendingPairing);
      pendingPairing = undefined;
    }
  },
  onConnection(callback) {
    connectionCallback = callback;
    if (pendingConnection !== undefined) {
      callback(pendingConnection);
      pendingConnection = undefined;
    }
  },
  sendFile(filePath) {
    return ipcRenderer.invoke("dropbot:send-file", filePath);
  },
  getFilePath(file) {
    return webUtils.getPathForFile(file);
  },
  onTransferProgress(callback) {
    const listener = (_event, progress) => callback(progress);
    ipcRenderer.on("dropbot:transfer-progress", listener);
    return () => ipcRenderer.removeListener("dropbot:transfer-progress", listener);
  },
  onError(callback) {
    errorCallback = callback;
    if (pendingError) {
      callback(pendingError);
      pendingError = undefined;
    }
  },
});
