import type { Variants } from "framer-motion";

export const leftEarAnimation: Variants = {
  idle: {
    rotate: [-24, -13, -29, -16, -24],
    transformOrigin: "100% 50%",
    transition: {
      duration: 3.6,
      repeat: Infinity,
      ease: "easeInOut",
      times: [0, 0.25, 0.5, 0.75, 1],
    },
  },

  attention: {
    rotate: [-24, -8, -32, -12, -24],
    transformOrigin: "100% 50%",
    transition: {
      duration: 1.6,
      repeat: Infinity,
      ease: "easeInOut",
      times: [0, 0.25, 0.5, 0.75, 1],
    },
  },

  transfer: {
    rotate: [-24, -15, -28, -17, -24],
    transformOrigin: "100% 50%",
    transition: {
      duration: 2.4,
      repeat: Infinity,
      ease: "easeInOut",
      times: [0, 0.25, 0.5, 0.75, 1],
    },
  },
};

export const rightEarAnimation: Variants = {
  idle: {
    rotate: [24, 13, 29, 16, 24],
    transformOrigin: "0% 50%",
    transition: {
      duration: 3.6,
      repeat: Infinity,
      ease: "easeInOut",
      times: [0, 0.25, 0.5, 0.75, 1],
    },
  },

  attention: {
    rotate: [24, 8, 32, 12, 24],
    transformOrigin: "0% 50%",
    transition: {
      duration: 1.6,
      repeat: Infinity,
      ease: "easeInOut",
      times: [0, 0.25, 0.5, 0.75, 1],
    },
  },

  transfer: {
    rotate: [24, 15, 28, 17, 24],
    transformOrigin: "0% 50%",
    transition: {
      duration: 2.4,
      repeat: Infinity,
      ease: "easeInOut",
      times: [0, 0.25, 0.5, 0.75, 1],
    },
  },
};