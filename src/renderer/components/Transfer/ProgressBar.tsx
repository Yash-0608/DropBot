import { motion } from "framer-motion";

type ProgressBarProps = {
  progress: number;
};

export default function ProgressBar({
  progress,
}: ProgressBarProps) {
  const safeProgress = Math.min(
    100,
    Math.max(0, progress)
  );

  return (
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
          width: `${safeProgress}%`,
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
  );
}