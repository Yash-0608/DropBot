import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  LoaderCircle,
  Smartphone,
  XCircle,
} from "lucide-react";

export type ConnectionCardState =
  | "connected"
  | "reconnecting"
  | "disconnected";

type ConnectionCardProps = {
  deviceName?: string;
  state?: ConnectionCardState;
  compact?: boolean;
};

const stateConfig = {
  connected: {
    label: "Connected",
    color: "#2DE49A",
    textColor: "#9FE6C5",
    Icon: CheckCircle2,
  },

  reconnecting: {
    label: "Reconnecting...",
    color: "#FFD15A",
    textColor: "#FFE3A0",
    Icon: LoaderCircle,
  },

  disconnected: {
    label: "Not connected",
    color: "#FF4D5E",
    textColor: "#FFB0B7",
    Icon: XCircle,
  },
};

export default function ConnectionCard({
  deviceName = "Yash's Phone",
  state = "connected",
  compact = false,
}: ConnectionCardProps) {
  const config = stateConfig[state];
  const StatusIcon = config.Icon;

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 4,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.25,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: compact ? "8px" : "10px",
        width: compact ? "190px" : "100%",
        padding: compact ? "9px 11px" : "11px 13px",
        borderRadius: compact ? "13px" : "14px",
        border: `1px solid ${config.color}33`,
        background:
          "linear-gradient(135deg, rgba(7,17,28,0.92), rgba(11,27,41,0.86))",
        backdropFilter: "blur(14px)",
        boxShadow:
          `0 8px 22px rgba(0,0,0,0.16), 0 0 16px ${config.color}14`,
        color: "#EEF8FF",
        userSelect: "none",
        WebkitAppRegion: "no-drag",
      }}
    >
      <div
        style={{
          width: compact ? "30px" : "34px",
          height: compact ? "30px" : "34px",
          display: "grid",
          placeItems: "center",
          flex: "0 0 auto",
          borderRadius: compact ? "9px" : "10px",
          background: `${config.color}12`,
          color: config.color,
        }}
      >
        <Smartphone size={compact ? 15 : 17} />
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
            fontSize: compact ? "11px" : "12px",
            fontWeight: 700,
          }}
          title={deviceName}
        >
          {deviceName}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginTop: "3px",
            color: config.textColor,
            fontSize: "9px",
            fontWeight: 600,
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              flex: "0 0 auto",
              borderRadius: "50%",
              background: config.color,
              boxShadow: `0 0 8px ${config.color}`,
            }}
          />

          <span>{config.label}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={state}
          initial={{
            opacity: 0,
            rotate: -20,
          }}
          animate={{
            opacity: 1,
            rotate: 0,
          }}
          transition={{
            duration: 0.2,
          }}
          style={{
            display: "grid",
            placeItems: "center",
            color: config.color,
          }}
        >
          <StatusIcon
            size={compact ? 14 : 15}
            style={
              state === "reconnecting"
                ? {
                    animation:
                      "dropbot-spin 1.2s linear infinite",
                  }
                : undefined
            }
          />
        </motion.div>
      </AnimatePresence>

      <style>
        {`
          @keyframes dropbot-spin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </motion.div>
  );
}