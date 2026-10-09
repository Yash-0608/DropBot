import type { Variants } from "framer-motion";

export const transferBotAnimation: Variants = {
  idle: {
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },

  transferring: {
    scale: [1, 1.015, 1],
    transition: {
      duration: 2.2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const transferHeadAnimation: Variants = {
  idle: {
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },

  transferring: {
    y: [0, -1.5, 0],
    transition: {
      duration: 2.4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const transferBodyAnimation: Variants = {
  idle: {
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },

  transferring: {
    y: [0, 1, 0],
    scale: [1, 1.012, 1],
    transition: {
      duration: 2.4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const transferGlowAnimation: Variants = {
  idle: {
    opacity: 0.65,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },

  transferring: {
    opacity: [0.7, 1, 0.7],
    scale: [1, 1.12, 1],
    transition: {
      duration: 1.6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const transferSideLightAnimation: Variants = {
  idle: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
    },
  },

  transferring: {
    opacity: [0.75, 1, 0.75],
    scale: [1, 1.12, 1],
    transition: {
      duration: 1.3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const transferGoldenStyle = {
  background: "#FFD76A",

  boxShadow:
    "0 0 8px rgba(255, 215, 106, 1), " +
    "0 0 18px rgba(255, 193, 66, 0.85), " +
    "0 0 32px rgba(255, 176, 46, 0.35)",
};

export const transferFaceStyle = {
  borderColor: "rgba(255, 201, 82, 0.65)",

  boxShadow:
    "inset 0 1px 2px rgba(255, 255, 255, 0.08), " +
    "0 0 18px rgba(255, 190, 58, 0.30)",
};

export const transferBodyStyle = {
  borderColor: "rgba(255, 214, 120, 0.78)",

  boxShadow:
    "inset 0 3px 7px rgba(255, 255, 255, 0.82), " +
    "inset 0 -8px 14px rgba(176, 126, 35, 0.18), " +
    "0 10px 20px rgba(255, 181, 52, 0.14)",
};

export const transferStatusStyle = {
  borderColor: "rgba(255, 193, 66, 0.42)",

  boxShadow:
    "0 0 16px rgba(255, 185, 49, 0.12)",
};

export const transferAnimationTiming = {
  glowPulse: 1.6,
  bodyMovement: 2.4,
  statusPulse: 1.3,
};