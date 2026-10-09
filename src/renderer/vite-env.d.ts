/// <reference types="vite/client" />

import "react";

declare module "react" {
  interface CSSProperties {
    WebkitAppRegion?: "drag" | "no-drag" | "none";
  }
}
declare global {
  interface Window {
    dropbot?: {
      moveWindow: (x: number, y: number) => void;
      dragWindow: (x: number, y: number) => void;
      onPairing: (callback: (info: { payload: string; token: string; port: number }) => void) => void;
      onConnection: (callback: (phone: { name: string; host: string; port: number } | null) => void) => void;
      sendFile: (filePath: string) => Promise<void>;
      getFilePath: (file: File) => string;
      onTransferProgress: (
        callback: (progress: { transferredBytes: number; totalBytes: number }) => void
      ) => () => void;
      onError: (callback: (error: { message: string }) => void) => void;
    };
  }
}