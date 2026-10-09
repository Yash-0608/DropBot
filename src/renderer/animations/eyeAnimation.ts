import type { Variants } from "framer-motion";

export type EyeConnectionState = "connected" | "disconnected";

export const eyeAnimation: Variants = {
  idle: {
    scaleY: [1, 1, 0.08, 1, 1],
    transition: {
      duration: 1,
      delay: 4,
      repeat: Infinity,
      repeatDelay: 5,
      ease: "easeInOut",
    },
  },
};

export const getEyeGlow = (
  connectionState: EyeConnectionState
) => {
  if (connectionState === "connected") {
    return {
      background: "#FFD76A",
      boxShadow:
        "0 0 8px rgba(255, 215, 106, 1), 0 0 18px rgba(255, 193, 66, 0.8)",
    };
  }

  return {
    background: "#50BFFF",
    boxShadow:
      "0 0 8px rgba(80, 191, 255, 1), 0 0 18px rgba(80, 191, 255, 0.75)",
  };
};