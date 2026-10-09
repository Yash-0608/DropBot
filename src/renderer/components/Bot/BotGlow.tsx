import { motion } from "framer-motion";

export type BotGlowState =
  | "idle"
  | "drop-ready"
  | "transferring"
  | "completed"
  | "disconnected";

type BotGlowProps = {
  state?: BotGlowState;
};

const glowStyles = {
  idle: {
    background:
      "radial-gradient(circle, rgba(61,166,255,0.30) 0%, rgba(61,166,255,0.14) 35%, rgba(61,166,255,0.04) 62%, transparent 76%)",
  },

  "drop-ready": {
    background:
      "radial-gradient(circle, rgba(255,205,92,0.40) 0%, rgba(255,170,40,0.18) 35%, rgba(255,170,40,0.05) 62%, transparent 76%)",
  },

  transferring: {
    background:
      "radial-gradient(circle, rgba(255,205,92,0.46) 0%, rgba(255,170,40,0.22) 35%, rgba(255,170,40,0.06) 62%, transparent 76%)",
  },

  completed: {
    background:
      "radial-gradient(circle, rgba(61,166,255,0.30) 0%, rgba(61,166,255,0.14) 35%, rgba(61,166,255,0.04) 62%, transparent 76%)",
  },

  disconnected: {
    background:
      "radial-gradient(circle, rgba(255,77,94,0.22) 0%, rgba(255,77,94,0.08) 38%, transparent 72%)",
  },
};

export default function BotGlow({
  state = "idle",
}: BotGlowProps) {
  const style = glowStyles[state];

  return (
    <motion.div
      aria-hidden="true"
      initial={{
        opacity: 0,
        scale: 0.9,
      }}
      animate={{
        opacity:
          state === "transferring"
            ? [0.7, 1, 0.7]
            : state === "drop-ready"
              ? [0.75, 1, 0.75]
              : 0.75,
        scale:
          state === "transferring"
            ? [1, 1.12, 1]
            : state === "drop-ready"
              ? 1.1
              : 1,
      }}
      transition={{
        duration:
          state === "transferring"
            ? 1.6
            : state === "drop-ready"
              ? 0.5
              : 2.8,
        repeat:
          state === "transferring" ||
          state === "drop-ready"
            ? Infinity
            : 0,
        ease: "easeInOut",
      }}
      style={{
        position: "absolute",
        top: "42px",
        left: "50%",
        width: "190px",
        height: "190px",
        transform: "translateX(-50%)",
        background: style.background,
        filter: "blur(10px)",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}