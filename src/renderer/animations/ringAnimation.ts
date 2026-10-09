import type {
  Transition,
  Variants,
} from "framer-motion";

export type RingMode =
  | "idle"
  | "dropReady"
  | "transferring"
  | "completed";

export const ringBaseAnimation: Variants = {
  idle: {
    opacity: 0.5,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },

  dropReady: {
    opacity: 1,
    scale: 1.06,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1],
    },
  },

  transferring: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },

  completed: {
    opacity: 0.5,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export const ringColor = {
  idle: {
    borderColor: "rgba(68, 183, 255, 0.26)",
    boxShadow:
      "0 0 18px rgba(68, 183, 255, 0.08)",
  },

  active: {
    borderColor: "rgba(255, 202, 82, 0.95)",
    boxShadow:
      "0 0 22px rgba(255, 193, 66, 0.34), inset 0 0 18px rgba(255, 193, 66, 0.08)",
  },

  completed: {
    borderColor: "rgba(68, 183, 255, 0.26)",
    boxShadow:
      "0 0 18px rgba(68, 183, 255, 0.08)",
  },
};

export const ringRotationAnimation = {
  animate: {
    rotate: 360,
  },

  transition: {
    duration: 6,
    repeat: Infinity,
    ease: "linear",
  } satisfies Transition,
};

export function getRingProgress(
  progress: number
): number {
  return Math.min(
    100,
    Math.max(0, progress)
  );
}

export function getRingDashOffset(
  progress: number,
  circumference = 565.48
): number {
  const safeProgress =
    getRingProgress(progress);

  return (
    circumference -
    (circumference * safeProgress) / 100
  );
}

export const ringProgressAnimation: {
  transition: Transition;
} = {
  transition: {
    duration: 0.35,
    ease: "linear",
  },
};