import { motion } from "framer-motion";
import { ArrowUp, File } from "lucide-react";

type TransferOverlayProps = {
  fileName?: string;
  transferredBytes?: number;
  totalBytes?: number;
  speed?: string;
  visible?: boolean;
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

export default function TransferOverlay({
  fileName = "Movie.mp4",
  transferredBytes = 1.24 * 1024 * 1024 * 1024,
  totalBytes = 1.8 * 1024 * 1024 * 1024,
  speed = "32 MB/s",
  visible = true,
}: TransferOverlayProps) {
  const progress =
    totalBytes > 0
      ? Math.min(
          100,
          Math.max(
            0,
            (transferredBytes / totalBytes) * 100
          )
        )
      : 0;

  if (!visible) {
    return null;
  }

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 8,
        scale: 0.96,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        y: -5,
        scale: 0.98,
      }}
      transition={{
        duration: 0.28,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        width: "250px",
        padding: "12px",
        borderRadius: "15px",
        background:
          "linear-gradient(135deg, rgba(19, 16, 9, 0.94), rgba(29, 23, 12, 0.90))",
        border:
          "1px solid rgba(255, 193, 66, 0.34)",
        boxShadow:
          "0 10px 28px rgba(0,0,0,0.22), 0 0 22px rgba(255,185,49,0.10)",
        backdropFilter: "blur(16px)",
        color: "#FFF0C7",
        fontFamily:
          'Inter, "Segoe UI", system-ui, sans-serif',
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "9px",
          marginBottom: "10px",
        }}
      >
        <div
          style={{
            width: "30px",
            height: "30px",
            display: "grid",
            placeItems: "center",
            borderRadius: "9px",
            background: "rgba(255, 193, 66, 0.10)",
            color: "#FFD15A",
          }}
        >
          <File size={15} />
        </div>

        <div
          style={{
            minWidth: 0,
            flex: 1,
          }}
        >
          <div
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontSize: "11px",
              fontWeight: 750,
              color: "#FFF3D1",
            }}
          >
            {fileName}
          </div>

          <div
            style={{
              marginTop: "2px",
              fontSize: "9px",
              color: "rgba(255, 232, 180, 0.56)",
            }}
          >
            Sending to Yash's Phone
          </div>
        </div>
      </div>

      <div
        style={{
          width: "100%",
          height: "7px",
          overflow: "hidden",
          borderRadius: "999px",
          background: "rgba(255, 255, 255, 0.08)",
        }}
      >
        <motion.div
          animate={{
            width: `${progress}%`,
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
              "0 0 10px rgba(255, 193, 66, 0.60)",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "8px",
        }}
      >
        <span
          style={{
            fontSize: "10px",
            fontWeight: 650,
            color: "#F5D98F",
          }}
        >
          {formatBytes(transferredBytes)}
          {" / "}
          {formatBytes(totalBytes)}
        </span>

        <span
          style={{
            fontSize: "10px",
            fontWeight: 800,
            color: "#FFD76A",
          }}
        >
          {Math.round(progress)}%
        </span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
          marginTop: "7px",
          color: "rgba(255, 232, 180, 0.58)",
          fontSize: "9px",
        }}
      >
        <ArrowUp size={11} />
        <span>{speed}</span>
      </div>
    </motion.div>
  );
}