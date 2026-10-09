import { create } from "zustand";

export type BotMode =
  | "idle"
  | "file-over"
  | "accepted"
  | "transferring"
  | "completed"
  | "error";

export type ConnectionState =
  | "connected"
  | "reconnecting"
  | "disconnected";

export type TransferStatus =
  | "idle"
  | "preparing"
  | "transferring"
  | "verifying"
  | "completed"
  | "failed"
  | "cancelled";

type TransferState = {
  fileName: string;
  totalBytes: number;
  transferredBytes: number;
  progress: number;
  speed: number;
  status: TransferStatus;
};

type BotStore = {
  botMode: BotMode;
  connectionState: ConnectionState;
  deviceName: string;
  pairingPayload: string;

  panelOpen: boolean;

  transfer: TransferState;

  setBotMode: (mode: BotMode) => void;
  setConnectionState: (state: ConnectionState) => void;
  setDeviceName: (name: string) => void;
  setPairingPayload: (payload: string) => void;
  setPanelOpen: (open: boolean) => void;

  startTransfer: (
    fileName: string,
    totalBytes: number
  ) => void;

  updateTransfer: (
    transferredBytes: number,
    speed?: number
  ) => void;

  setTransferStatus: (
    status: TransferStatus
  ) => void;

  completeTransfer: () => void;
  resetTransfer: () => void;
};

const initialTransfer: TransferState = {
  fileName: "",
  totalBytes: 0,
  transferredBytes: 0,
  progress: 0,
  speed: 0,
  status: "idle",
};

export const useBotStore = create<BotStore>((set) => ({
  botMode: "idle",

  connectionState: "disconnected",

  deviceName: "Yash's Phone",
  pairingPayload: "",

  panelOpen: false,

  transfer: initialTransfer,

  setBotMode: (mode) => {
    set({
      botMode: mode,
    });
  },

  setConnectionState: (state) => {
    set({
      connectionState: state,
    });
  },

  setDeviceName: (name) => {
    set({
      deviceName: name,
    });
  },

  setPairingPayload: (payload) => {
    set({ pairingPayload: payload });
  },

  setPanelOpen: (open) => {
    set({
      panelOpen: open,
    });
  },

  startTransfer: (
    fileName,
    totalBytes
  ) => {
    set({
      botMode: "accepted",

      transfer: {
        fileName,
        totalBytes,
        transferredBytes: 0,
        progress: 0,
        speed: 0,
        status: "preparing",
      },
    });
  },

  updateTransfer: (
    transferredBytes,
    speed = 0
  ) => {
    set((state) => {
      const totalBytes =
        state.transfer.totalBytes;

      const safeTransferred =
        Math.min(
          Math.max(
            0,
            transferredBytes
          ),
          totalBytes
        );

      const progress =
        totalBytes > 0
          ? (safeTransferred /
              totalBytes) *
            100
          : 0;

      return {
        botMode: "transferring",

        transfer: {
          ...state.transfer,
          transferredBytes:
            safeTransferred,
          progress,
          speed,
          status:
            "transferring",
        },
      };
    });
  },

  setTransferStatus: (
    status
  ) => {
    set((state) => ({
      transfer: {
        ...state.transfer,
        status,
      },
    }));
  },

  completeTransfer: () => {
    set((state) => ({
      botMode: "completed",

      transfer: {
        ...state.transfer,
        transferredBytes:
          state.transfer.totalBytes,
        progress: 100,
        status: "completed",
      },
    }));
  },

  resetTransfer: () => {
    set({
      botMode: "idle",
      transfer: {
        ...initialTransfer,
      },
    });
  },
}));