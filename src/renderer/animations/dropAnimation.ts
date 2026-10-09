import type { Variants } from "framer-motion";

export const dropHeadAnimation: Variants = {
  idle: {
    y: 0,
    scale: 1,
  },

  dropReady: {
    y: -1,
    scale: 1.015,
    transition: {
      duration: 0.28,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export const dropConnectorAnimation: Variants = {
  idle: {
    scaleY: 1,
    y: 0,
  },

  dropReady: {
    scaleY: 0.94,
    y: -1,
    transition: {
      duration: 0.28,
      ease: [0.22, 1, 0.36, 1],
    },
  },

  accepted: {
    scaleY: 1,
    y: 0,
    transition: {
      duration: 0.24,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export const dropBodyAnimation: Variants = {
  idle: {
    scaleX: 1,
    scaleY: 1,
    y: 0,
    borderRadius: "30px 30px 38px 38px",
    transition: {
      duration: 0.28,
      ease: [0.22, 1, 0.36, 1],
    },
  },

  dropReady: {
    scaleX: 1.34,
    scaleY: 1.34,
    y: 10,
    borderRadius: "26px 26px 34px 34px",
    transition: {
      duration: 0.32,
      ease: [0.22, 1, 0.36, 1],
    },
  },

  accepted: {
    scaleX: 1,
    scaleY: 1,
    y: 0,
    borderRadius: "30px 30px 38px 38px",
    transition: {
      duration: 0.26,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export const dropContainerAnimation: Variants = {
  hidden: {
    opacity: 1,
    scaleX: 1,
    scaleY: 1,
    y: 0,
    borderRadius: 13,
  },

  visible: {
    opacity: 1,
    scaleX: 1.22,
    scaleY: 1.16,
    y: 1,
    borderRadius: 15,
    transition: {
      duration: 0.28,
      ease: [0.22, 1, 0.36, 1],
    },
  },

  exit: {
    opacity: 1,
    scaleX: 1,
    scaleY: 1,
    y: 0,
    borderRadius: 13,
    transition: {
      duration: 0.22,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export const dropFileCatchAnimation: Variants = {
  initial: {
    opacity: 0,
    scale: 0.72,
    y: -18,
  },

  catch: {
    opacity: [0, 1, 1, 0],
    scale: [0.72, 1.06, 0.92, 0.5],
    y: [-18, -3, 7, 16],
    transition: {
      duration: 0.65,
      times: [0, 0.22, 0.68, 1],
      ease: [0.22, 1, 0.36, 1],
    },
  },
};