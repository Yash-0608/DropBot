import type { Variants } from "framer-motion";

export const completionBotAnimation: Variants = {
  completed: {
    scale: [1, 1.035, 1],
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export const completionGlowAnimation: Variants = {
  completed: {
    opacity: [0.8, 1, 0.9, 0.65],
    scale: [1, 1.18, 1.08, 1],
    transition: {
      duration: 1.2,
      ease: "easeOut",
    },
  },
};

export const completionRingAnimation: Variants = {
  completed: {
    opacity: [1, 1, 0.8],
    scale: [1, 1.12, 1],
    transition: {
      duration: 1,
      ease: "easeOut",
    },
  },
};

export const completionMessageAnimation: Variants = {
  hidden: {
    opacity: 0,
    y: 8,
    scale: 0.96,
  },

  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1],
    },
  },

  exit: {
    opacity: 0,
    y: -4,
    scale: 0.98,
    transition: {
      duration: 0.3,
      ease: "easeIn",
    },
  },
};

export const completionCheckAnimation: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.4,
    rotate: -20,
  },

  visible: {
    opacity: 1,
    scale: [0.4, 1.15, 1],
    rotate: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export const completionParticleAnimation = {
  initial: {
    opacity: 0,
    scale: 0.4,
    x: 0,
    y: 0,
  },

  animate: {
    opacity: [0, 1, 0],
    scale: [0.4, 1, 0.2],
    transition: {
      duration: 0.9,
      ease: "easeOut",
    },
  },
};

export const completionTiming = {
  celebrationDuration: 1200,
  messageDuration: 30000,
};