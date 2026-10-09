import { motion } from "framer-motion";

type BotRingProps = {
  mode?: "idle" | "drop-ready" | "transferring" | "completed";
  progress?: number;
};

const RADIUS = 88;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function clampProgress(value: number): number {
  return Math.min(100, Math.max(0, value));
}

export default function BotRing({
  mode = "idle",
  progress = 0,
}: BotRingProps) {
  const safeProgress = clampProgress(progress);

  const isActive =
    mode === "drop-ready" ||
    mode === "transferring";

  const isCompleted =
    mode === "completed";

  const strokeOffset =
    CIRCUMFERENCE -
    (CIRCUMFERENCE * safeProgress) / 100;

  const baseColor = isActive
    ? "#FFD15A"
    : "#44B7FF";

  return (
    <motion.svg
      width="205"
      height="205"
      viewBox="0 0 200 200"
      aria-hidden="true"
      style={{
        position: "absolute",
        top: "16px",
        left: "50%",
        x: "-50%",
        zIndex: 2,
        pointerEvents: "none",
        overflow: "visible",
      }}
      animate={{
        scale: isActive ? 1.06 : 1,
      }}
      transition={{
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {/* Base ring */}
      <motion.circle
        cx="100"
        cy="100"
        r={RADIUS}
        fill="none"
        strokeWidth="2"
        stroke={baseColor}
        strokeOpacity={
          isCompleted
            ? 0.5
            : isActive
              ? 1
              : 0.5
        }
        style={{
          transition:
            "stroke 0.3s ease, stroke-opacity 0.3s ease",
        }}
      />

      {/* Active progress ring */}
      {isActive && (
        <motion.circle
          cx="100"
          cy="100"
          r={RADIUS}
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          stroke="#FFD15A"
          strokeDasharray={CIRCUMFERENCE}
          animate={{
            strokeDashoffset:
              mode === "drop-ready"
                ? 0
                : strokeOffset,
            rotate:
              mode === "transferring"
                ? 360
                : 0,
          }}
          transition={{
            strokeDashoffset: {
              duration: 0.35,
              ease: "linear",
            },
            rotate: {
              duration: 7,
              repeat: Infinity,
              ease: "linear",
            },
          }}
          style={{
            transformOrigin: "100px 100px",
            transformBox: "fill-box",
            filter:
              "drop-shadow(0 0 7px rgba(255, 201, 82, 0.9))",
          }}
        />
      )}

      {/* Small active highlight */}
      {isActive && (
        <motion.circle
          cx="100"
          cy="100"
          r="92"
          fill="none"
          stroke="#FFD76A"
          strokeWidth="1"
          strokeOpacity={0.16}
          animate={{
            opacity: [0.2, 0.55, 0.2],
          }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </motion.svg>
  );
}