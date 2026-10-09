import { motion } from "framer-motion";

export type BotMessageState =
  | "idle"
  | "disconnected"
  | "drop-ready"
  | "accepted"
  | "transferring"
  | "completed";

type BotMessageProps = {
  state: BotMessageState;
  message: string;
};

const stateStyles = {
  idle: {
    border: "rgba(71, 183, 255, 0.32)",
    text: "#E8F7FF",
    dot: "#2DE49A",
    glow: "rgba(32, 165, 255, 0.10)",
  },

  disconnected: {
    border: "rgba(255, 77, 94, 0.38)",
    text: "#FFE5E8",
    dot: "#FF4D5E",
    glow: "rgba(255, 77, 94, 0.10)",
  },

  "drop-ready": {
    border: "rgba(255, 193, 66, 0.48)",
    text: "#FFE7AE",
    dot: "#FFD15A",
    glow: "rgba(255, 185, 49, 0.14)",
  },

  accepted: {
    border: "rgba(255, 193, 66, 0.48)",
    text: "#FFE7AE",
    dot: "#FFD15A",
    glow: "rgba(255, 185, 49, 0.14)",
  },

  transferring: {
    border: "rgba(255, 193, 66, 0.48)",
    text: "#FFE7AE",
    dot: "#FFD15A",
    glow: "rgba(255, 185, 49, 0.14)",
  },

  completed: {
    border: "rgba(255, 193, 66, 0.48)",
    text: "#FFE7AE",
    dot: "#FFD15A",
    glow: "rgba(255, 185, 49, 0.14)",
  },
};

export default function BotMessage({
  state,
  message,
}: BotMessageProps) {
  const style = stateStyles[state];

  return (
    <motion.div
      initial={{
        opacity: 0,
        x: 8,
        scale: 0.96,
      }}
      animate={{
        opacity: 1,
        x: 0,
        scale: 1,
      }}
      transition={{
        duration: 0.28,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        position: "absolute",
        left: "152px",
        top: "82px",

        width: "170px",
        minHeight: "58px",

        padding: "11px 13px",

        display: "flex",
        alignItems: "center",
        gap: "8px",

        borderRadius: "15px 15px 15px 5px",

        background:
          "linear-gradient(135deg, rgba(7,17,28,0.94), rgba(10,24,37,0.88))",

        border: `1px solid ${style.border}`,

        backdropFilter: "blur(16px)",

        boxShadow:
          `0 10px 28px rgba(0,0,0,0.18), ` +
          `0 0 20px ${style.glow}`,

        color: style.text,

        fontSize: "12px",
        lineHeight: 1.4,
        fontWeight: 600,

        userSelect: "none",
        pointerEvents: "none",

        WebkitAppRegion: "no-drag",

        zIndex: 25,
      }}
    >
      <span
        style={{
          width: "7px",
          height: "7px",
          flex: "0 0 auto",

          borderRadius: "50%",

          background: style.dot,

          boxShadow:
            `0 0 8px ${style.dot}`,
        }}
      />

      <span>{message}</span>

      <span
        style={{
          position: "absolute",

          left: "-6px",
          bottom: "0",

          width: "12px",
          height: "12px",

          background:
            "rgba(7,17,28,0.94)",

          borderLeft:
            `1px solid ${style.border}`,

          borderBottom:
            `1px solid ${style.border}`,

          transform: "skewX(-28deg)",

          borderBottomLeftRadius: "3px",
        }}
      />
    </motion.div>
  );
}