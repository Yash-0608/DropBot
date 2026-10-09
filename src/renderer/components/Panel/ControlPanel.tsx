import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock3,
  Smartphone,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import QRCode from "qrcode";

import { useBotStore } from "../../store/botStore";

type ControlPanelProps = {
  onClose?: () => void;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default function ControlPanel({
  onClose,
}: ControlPanelProps) {
  const pairingPayload = useBotStore((state) => state.pairingPayload);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const deviceName = useBotStore(
    (state) => state.deviceName
  );

  const connectionState = useBotStore(
    (state) => state.connectionState
  );

  const transfer = useBotStore(
    (state) => state.transfer
  );

  const connected =
    connectionState === "connected";

  useEffect(() => {
    if (!pairingPayload) return;
    QRCode.toDataURL(pairingPayload, {
      margin: 1,
      width: 220,
      color: { dark: "#182231", light: "#FFFFFF" },
    }).then(setQrDataUrl).catch(() => setQrDataUrl(""));
  }, [pairingPayload]);

  const hasActiveTransfer =
    transfer.totalBytes > 0 &&
    (
      transfer.status === "preparing" ||
      transfer.status === "transferring" ||
      transfer.status === "verifying"
    );

  const statusText =
    transfer.status === "preparing"
      ? "Preparing"
      : transfer.status === "transferring"
        ? "Transferring"
        : transfer.status === "verifying"
          ? "Verifying"
          : "";

  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.94,
        y: 8,
      }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        scale: 0.96,
        y: 4,
      }}
      transition={{
        duration: 0.28,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        width: "320px",
        maxHeight: "520px",
        overflowY: "auto",
        padding: "16px",
        borderRadius: "20px",
        background:
          "linear-gradient(145deg, rgba(8,18,29,0.97), rgba(12,28,43,0.94))",
        border:
          "1px solid rgba(79,183,255,0.28)",
        boxShadow:
          "0 18px 50px rgba(0,0,0,0.35), 0 0 28px rgba(40,165,255,0.10)",
        backdropFilter: "blur(20px)",
        color: "#EDF8FF",
        fontFamily:
          'Inter, "Segoe UI", system-ui, sans-serif',
        userSelect: "none",
        WebkitAppRegion: "no-drag",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "16px",
              fontWeight: 800,
            }}
          >
            DropBot
          </div>

          <div
            style={{
              marginTop: "3px",
              fontSize: "10px",
              color: "rgba(210,232,245,0.58)",
            }}
          >
            Your file transfer companion
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close DropBot panel"
          style={{
            width: "30px",
            height: "30px",
            display: "grid",
            placeItems: "center",
            borderRadius: "10px",
            background: "rgba(255,255,255,0.05)",
            color: "#CFEAF8",
            cursor: "pointer",
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Device */}
      {!connected && qrDataUrl && (
        <section
          style={{
            padding: "13px",
            borderRadius: "14px",
            border: "1px solid rgba(79,183,255,0.20)",
            background: "rgba(255,255,255,0.96)",
            marginBottom: "10px",
            textAlign: "center",
          }}
        >
          <div style={{ color: "#182231", fontSize: "12px", fontWeight: 800 }}>
            Scan to connect your phone
          </div>
          <img src={qrDataUrl} alt="DropBot pairing QR code" style={{ width: "190px", height: "190px", margin: "10px auto" }} />
          <div style={{ color: "#718096", fontSize: "10px" }}>
            Keep both devices on the same Wi-Fi network.
          </div>
        </section>
      )}

      <section
        style={{
          padding: "13px",
          borderRadius: "14px",
          border:
            "1px solid rgba(79,183,255,0.20)",
          background:
            "rgba(15,35,51,0.62)",
          marginBottom: "10px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              display: "grid",
              placeItems: "center",
              borderRadius: "11px",
              background:
                "rgba(77,190,255,0.10)",
              color: "#64CFFF",
            }}
          >
            <Smartphone size={18} />
          </div>

          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              {deviceName}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginTop: "3px",
                fontSize: "10px",
                color: connected
                  ? "#9FE6C5"
                  : "#FFB0B7",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: connected
                    ? "#2DE49A"
                    : "#FF4D5E",
                  boxShadow: connected
                    ? "0 0 8px rgba(45,228,154,0.9)"
                    : "0 0 8px rgba(255,77,94,0.8)",
                }}
              />

              {connected
                ? "Connected · Ready"
                : "Not connected"}
            </div>
          </div>
        </div>
      </section>

      {/* Current transfer */}
      <section
        style={{
          padding: "13px",
          borderRadius: "14px",
          border: hasActiveTransfer
            ? "1px solid rgba(255,193,66,0.20)"
            : "1px solid rgba(79,183,255,0.16)",
          background: hasActiveTransfer
            ? "rgba(36,29,15,0.46)"
            : "rgba(15,35,51,0.44)",
          marginBottom: "10px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            marginBottom: "10px",
          }}
        >
          <Upload
            size={14}
            color={
              hasActiveTransfer
                ? "#FFD15A"
                : "#75CFFF"
            }
          />

          <span
            style={{
              fontSize: "10px",
              color: hasActiveTransfer
                ? "#F3D78D"
                : "rgba(210,232,245,0.60)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.7px",
            }}
          >
            Current transfer
          </span>
        </div>

        {hasActiveTransfer ? (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "10px",
                marginBottom: "7px",
              }}
            >
              <div
                style={{
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
                title={transfer.fileName}
              >
                {transfer.fileName}
              </div>

              <span
                style={{
                  flex: "0 0 auto",
                  color: "#FFD76A",
                  fontSize: "10px",
                  fontWeight: 700,
                }}
              >
                {statusText}
              </span>
            </div>

            <div
              style={{
                width: "100%",
                height: "6px",
                borderRadius: "999px",
                background:
                  "rgba(255,255,255,0.08)",
                overflow: "hidden",
              }}
            >
              <motion.div
                animate={{
                  width:
                    `${Math.min(
                      100,
                      Math.max(
                        0,
                        transfer.progress
                      )
                    )}%`,
                }}
                transition={{
                  duration: 0.35,
                  ease: "linear",
                }}
                style={{
                  height: "100%",
                  borderRadius: "999px",
                  background:
                    "linear-gradient(90deg, #E9A92E, #FFD76A)",
                  boxShadow:
                    "0 0 10px rgba(255,193,66,0.55)",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "7px",
                fontSize: "10px",
                color:
                  "rgba(255,232,180,0.72)",
              }}
            >
              <span>
                {formatBytes(
                  transfer.transferredBytes
                )}
                {" / "}
                {formatBytes(
                  transfer.totalBytes
                )}
              </span>

              <span>
                {Math.round(
                  transfer.progress
                )}
                %
              </span>
            </div>
          </>
        ) : (
          <div
            style={{
              padding:
                "12px 8px",
              textAlign: "center",
              color:
                "rgba(210,232,245,0.48)",
              fontSize: "11px",
              fontWeight: 600,
            }}
          >
            No active transfer
          </div>
        )}
      </section>

      {/* Queue */}
      <section
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 13px",
          borderRadius: "14px",
          border:
            "1px solid rgba(79,183,255,0.16)",
          background:
            "rgba(15,35,51,0.44)",
          marginBottom: "10px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "9px",
          }}
        >
          <Clock3
            size={16}
            color="#75CFFF"
          />

          <div>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
              }}
            >
              Transfer Queue
            </div>

            <div
              style={{
                marginTop: "2px",
                fontSize: "9px",
                color:
                  "rgba(210,232,245,0.52)",
              }}
            >
              Queue manager will appear here
            </div>
          </div>
        </div>

        <div
          style={{
            minWidth: "28px",
            height: "28px",
            display: "grid",
            placeItems: "center",
            borderRadius: "9px",
            background:
              "rgba(79,183,255,0.10)",
            color: "#BDEBFF",
            fontSize: "11px",
            fontWeight: 800,
          }}
        >
          0
        </div>
      </section>

      {/* Recent transfers */}
      <section
        style={{
          padding: "12px 13px",
          borderRadius: "14px",
          border:
            "1px solid rgba(79,183,255,0.16)",
          background:
            "rgba(15,35,51,0.44)",
        }}
      >
        <div
          style={{
            marginBottom: "9px",
            fontSize: "10px",
            color:
              "rgba(210,232,245,0.56)",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.7px",
          }}
        >
          Recent transfers
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "9px",
            padding: "8px 0",
          }}
        >
          <CheckCircle2
            size={16}
            color="#50D7A2"
          />

          <div>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#CFE5F0",
              }}
            >
              No completed transfers yet
            </div>

            <div
              style={{
                marginTop: "3px",
                fontSize: "9px",
                color:
                  "rgba(210,232,245,0.42)",
              }}
            >
              Completed files will appear here
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}