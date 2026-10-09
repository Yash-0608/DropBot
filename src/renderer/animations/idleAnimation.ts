import type { Variants } from "framer-motion";

export const idleBotAnimation: Variants = {
  idle: {
    y: [0, -2, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const idleHeadAnimation: Variants = {
  idle: {
    y: [0, -2, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const idleBodyAnimation: Variants = {
  idle: {
    y: [0, 1.5, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const idleGlowAnimation: Variants = {
  idle: {
    opacity: [0.65, 0.9, 0.65],
    scale: [1, 1.04, 1],
    transition: {
      duration: 2.8,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};