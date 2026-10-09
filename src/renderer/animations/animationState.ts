export type DropBotAnimationState =
  | "idle"
  | "attention"
  | "dropReady"
  | "accepted"
  | "transferring"
  | "completed"
  | "error";

export const animationState = {
  idle: "idle",
  attention: "attention",
  dropReady: "dropReady",
  accepted: "accepted",
  transferring: "transferring",
  completed: "completed",
  error: "error",
} as const;

export function isTransferState(
  state: DropBotAnimationState
): boolean {
  return (
    state === "accepted" ||
    state === "transferring" ||
    state === "completed"
  );
}

export function isDropState(
  state: DropBotAnimationState
): boolean {
  return (
    state === "dropReady" ||
    state === "accepted"
  );
}