import { motion } from "framer-motion";

type BotFaceProps = {
  eyeColor?: string;
  eyeGlow?: string;
  transferring?: boolean;
  completed?: boolean;
};

export default function BotFace({
  eyeColor = "#50BFFF",
  eyeGlow = "0 0 8px rgba(80,191,255,1), 0 0 18px rgba(80,191,255,0.75)",
  transferring = false,
  completed = false,
}: BotFaceProps) {
  const activeColor = transferring || completed
    ? "#FFD76A"
    : eyeColor;

  const activeGlow = transferring || completed
    ? "0 0 8px rgba(255,215,106,1), 0 0 18px rgba(255,193,66,0.8)"
    : eyeGlow;

  return (
    <div className="dropbot-face">
      <motion.div
        className="dropbot-eye dropbot-eye-left"
        animate={{
          scaleY: [1, 1, 0.08, 1, 1],
        }}
        transition={{
          duration: 1,
          delay: 4,
          repeat: Infinity,
          repeatDelay: 5,
          ease: "easeInOut",
        }}
        style={{
          background: activeColor,
          boxShadow: activeGlow,
        }}
      />

      <motion.div
        className="dropbot-eye dropbot-eye-right"
        animate={{
          scaleY: [1, 1, 0.08, 1, 1],
        }}
        transition={{
          duration: 1,
          delay: 4,
          repeat: Infinity,
          repeatDelay: 5,
          ease: "easeInOut",
        }}
        style={{
          background: activeColor,
          boxShadow: activeGlow,
        }}
      />

      <motion.div
        className="dropbot-smile"
        animate={{
          scaleX: completed
            ? 1.16
            : transferring
              ? [1, 1.05, 1]
              : [1, 1.08, 1],
        }}
        transition={{
          duration: completed ? 0.4 : 2.5,
          repeat: completed ? 0 : Infinity,
          ease: "easeInOut",
        }}
        style={{
          borderBottomColor: activeColor,
          filter: `drop-shadow(0 0 7px ${activeColor})`,
        }}
      />
    </div>
  );
}