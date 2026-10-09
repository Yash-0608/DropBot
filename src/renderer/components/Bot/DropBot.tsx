import {
  AnimatePresence,
  motion,
} from "framer-motion";
import {
  useEffect,
  useRef,
  useMemo,
} from "react";

import BotFace from "./BotFace";
import BotGlow from "./BotGlow";
import BotRing from "./BotRing";
import BotMessage, {
  type BotMessageState,
} from "./BotMessage";

import {
  leftEarAnimation,
  rightEarAnimation,
} from "../../animations/earAnimation";

import {
  dropHeadAnimation,
  dropConnectorAnimation,
  dropBodyAnimation,
  dropContainerAnimation,
  dropFileCatchAnimation,
} from "../../animations/dropAnimation";

import {
  transferBotAnimation,
  transferHeadAnimation,
  transferBodyAnimation,
  transferSideLightAnimation,
  transferBodyStyle,
} from "../../animations/transferAnimation";

import {
  completionCheckAnimation,
} from "../../animations/completionAnimation";

import {
  useBotStore,
} from "../../store/botStore";

const BOT_SCALE = 0.58;

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function getMessageState(
  mode: string,
  connected: boolean
): BotMessageState {
  if (!connected) {
    return "disconnected";
  }

  switch (mode) {
    case "file-over":
      return "drop-ready";

    case "accepted":
      return "accepted";

    case "transferring":
      return "transferring";

    case "completed":
      return "completed";

    default:
      return "idle";
  }
}

export default function DropBot() {
  const dragOrigin = useRef<{ x: number; y: number } | null>(null);
  const {
    botMode,
    connectionState,
    deviceName,
    transfer,

    setBotMode,
    setPanelOpen,
    startTransfer,
    updateTransfer,
    completeTransfer,
    resetTransfer,
    setTransferStatus,
  } = useBotStore();

  const connected =
    connectionState === "connected";

  const isDropReady =
    botMode === "file-over";

  const isAccepted =
    botMode === "accepted";

  const isTransferring =
    botMode === "transferring";

  const isCompleted =
    botMode === "completed";

  const isGolden =
    isAccepted ||
    isTransferring;

  const messageState =
    useMemo(
      () =>
        getMessageState(
          botMode,
          connected
        ),
      [
        botMode,
        connected,
      ]
    );

  const message =
    !connected
      ? "Make a connection"
      : botMode === "file-over"
        ? "Drop your File Here"
        : botMode === "accepted"
          ? "File accepted"
          : botMode === "transferring"
            ? "File is being transferred"
            : botMode === "completed"
              ? "File Transfer Completed"
              : botMode === "error"
                ? "Transfer failed — try again"
                : "Hello, this is DropBot, ready for file transfer";

  useEffect(() => {
    if (!window.dropbot?.onTransferProgress) return;
    let previousBytes = 0;
    let previousTime = performance.now();
    return window.dropbot.onTransferProgress(({ transferredBytes, totalBytes }) => {
      const now = performance.now();
      const elapsedSeconds = Math.max((now - previousTime) / 1000, 0.001);
      const speed = (transferredBytes - previousBytes) / elapsedSeconds;
      previousBytes = transferredBytes;
      previousTime = now;
      updateTransfer(transferredBytes, speed);
      if (transferredBytes >= totalBytes) setTransferStatus("verifying");
    });
  }, [updateTransfer, setTransferStatus]);

  /*
   * Completion message remains visible
   * for 30 seconds.
   */
  useEffect(() => {
    if (
      botMode !== "completed"
    ) {
      return;
    }

    const timer =
      window.setTimeout(() => {
        resetTransfer();
      }, 30000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    botMode,
    resetTransfer,
  ]);

  /*
   * File enters DropBot.
   */
  const handleDragEnter = (
    event: React.DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();

    if (
      event.dataTransfer.types.includes(
        "Files"
      )
    ) {
      setBotMode("file-over");
    }
  };

  /*
   * File remains over DropBot.
   */
  const handleDragOver = (
    event: React.DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();

    if (
      event.dataTransfer.types.includes(
        "Files"
      )
    ) {
      event.dataTransfer.dropEffect =
        "copy";

      if (
        botMode === "idle"
      ) {
        setBotMode("file-over");
      }
    }
  };

  /*
   * File leaves DropBot.
   */
  const handleDragLeave = (
    event: React.DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();

    const currentTarget =
      event.currentTarget;

    const relatedTarget =
      event.relatedTarget as Node | null;

    if (
      relatedTarget &&
      currentTarget.contains(
        relatedTarget
      )
    ) {
      return;
    }

    if (
      botMode === "file-over"
    ) {
      setBotMode("idle");
    }
  };

  /*
   * File dropped on DropBot.
   */
  const handleDrop = (
    event: React.DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();

    const files =
      Array.from(
        event.dataTransfer.files
      );

    if (
      files.length === 0
    ) {
      setBotMode("idle");
      return;
    }

    const file = files[0];

    startTransfer(
      file.name,
      file.size
    );

    const filePath =
      window.dropbot?.getFilePath?.(file) ??
      (file as File & { path?: string }).path;
    if (!filePath || !window.dropbot?.sendFile) {
      setTransferStatus("failed");
      setBotMode("error");
      return;
    }

    setBotMode("transferring");
    void window.dropbot.sendFile(filePath)
      .then(() => {
        completeTransfer();
      })
      .catch(() => {
        setTransferStatus("failed");
        setBotMode("error");
      });
  };

  const handleMoveStart = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    dragOrigin.current = { x: event.screenX, y: event.screenY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragOrigin.current || !window.dropbot?.dragWindow) return;
    const deltaX = event.screenX - dragOrigin.current.x;
    const deltaY = event.screenY - dragOrigin.current.y;
    if (deltaX === 0 && deltaY === 0) return;
    window.dropbot.dragWindow(deltaX, deltaY);
    dragOrigin.current = { x: event.screenX, y: event.screenY };
  };

  const handleMoveEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragOrigin.current = null;
  };

  const botGlowState =
    !connected
      ? "disconnected"
      : isCompleted
        ? "completed"
        : isGolden
          ? "transferring"
          : isDropReady
            ? "drop-ready"
            : "idle";

  const ringMode =
    isDropReady
      ? "drop-ready"
      : isTransferring
        ? "transferring"
        : isCompleted
          ? "completed"
          : "idle";

  return (
    <div
      onDragEnter={
        handleDragEnter
      }
      onDragOver={
        handleDragOver
      }
      onDragLeave={
        handleDragLeave
      }
      onDrop={
        handleDrop
      }
      style={{
        position: "relative",
        width: "260px",
        minHeight: "300px",

        transform:
          `scale(${BOT_SCALE})`,

        transformOrigin:
          "top center",

        // Electron drag regions do not dispatch HTML5 drop events.
        WebkitAppRegion:
          "no-drag",

        cursor: "copy",
      }}
    >
      <div
        title="Drag to move DropBot"
        aria-label="Drag to move DropBot"
        onPointerDown={handleMoveStart}
        onPointerMove={handleMove}
        onPointerUp={handleMoveEnd}
        onPointerCancel={handleMoveEnd}
        style={{
          position: "absolute",
          top: "-8px",
          left: "74px",
          width: "112px",
          height: "26px",
          zIndex: 50,
          WebkitAppRegion: "no-drag",
          cursor: "grab",
          touchAction: "none",
          borderRadius: "999px",
          background: "rgba(255, 255, 255, 0.10)",
          border: "1px solid rgba(255, 255, 255, 0.18)",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.16)",
        }}
      >
        <span style={{
          display: "block",
          width: "26px",
          height: "3px",
          margin: "10px auto 0",
          borderRadius: "999px",
          background: "rgba(255, 255, 255, 0.62)",
        }} />
      </div>
      <motion.div
        className="dropbot"
        variants={
          transferBotAnimation
        }
        initial="idle"
        animate={
          isTransferring
            ? "transferring"
            : "idle"
        }
        style={{
          transformOrigin:
            "50% 0%",
        }}
      >
        <BotGlow
          state={
            botGlowState
          }
        />

        <BotRing
          mode={ringMode}
          progress={
            transfer.progress
          }
        />

        {/* Left ear */}
        <motion.div
          className="dropbot-antenna dropbot-antenna-left"
          variants={
            leftEarAnimation
          }
          animate={
            isTransferring
              ? "transfer"
              : isDropReady
                ? "attention"
                : "idle"
          }
        />

        {/* Right ear */}
        <motion.div
          className="dropbot-antenna dropbot-antenna-right"
          variants={
            rightEarAnimation
          }
          animate={
            isTransferring
              ? "transfer"
              : isDropReady
                ? "attention"
                : "idle"
          }
        />

        {/* Head */}
        <motion.div
          className="dropbot-head"
          variants={
            isTransferring
              ? transferHeadAnimation
              : dropHeadAnimation
          }
          animate={
            isDropReady
              ? "dropReady"
              : isTransferring
                ? "transferring"
                : "idle"
          }
          style={{
            zIndex: 4,
            ...(isGolden
              ? transferBodyStyle
              : {}),
          }}
        >
          {/* Clickable face area */}
          <div
            onClick={() => {
              if (
                botMode === "idle" ||
                botMode === "completed"
              ) {
                setPanelOpen(true);
              }
            }}
            style={{
              WebkitAppRegion:
                "no-drag",
              cursor: "pointer",
            }}
            title="Open DropBot"
          >
            <BotFace
              transferring={
                isGolden
              }
              completed={
                isCompleted
              }
            />
          </div>
        </motion.div>

        {/* Connector */}
        <motion.div
          className="dropbot-neck"
          variants={
            dropConnectorAnimation
          }
          animate={
            isDropReady
              ? "dropReady"
              : "idle"
          }
          style={{
            zIndex: 3,
            ...(isGolden
              ? transferBodyStyle
              : {}),
          }}
        />

        {/* Lower body */}
        <motion.div
          className="dropbot-body"
          variants={
            isTransferring
              ? transferBodyAnimation
              : dropBodyAnimation
          }
          animate={
            isDropReady
              ? "dropReady"
              : isAccepted
                ? "accepted"
                : isTransferring
                  ? "transferring"
                  : "idle"
          }
          style={{
            zIndex: 3,
            ...(isGolden
              ? transferBodyStyle
              : {}),
          }}
        >
          <motion.div
            className="dropbot-body-panel"
            variants={
              dropContainerAnimation
            }
            initial="hidden"
            animate={
              isDropReady
                ? "visible"
                : "hidden"
            }
          />

          <motion.div
            className="dropbot-side-light dropbot-side-light-left"
            variants={
              transferSideLightAnimation
            }
            animate={
              isTransferring
                ? "transferring"
                : "idle"
            }
            style={
              isGolden
                ? {
                    background:
                      "#FFD76A",
                    boxShadow:
                      "0 0 8px rgba(255,215,106,1), 0 0 18px rgba(255,193,66,0.8)",
                  }
                : undefined
            }
          />

          <motion.div
            className="dropbot-side-light dropbot-side-light-right"
            variants={
              transferSideLightAnimation
            }
            animate={
              isTransferring
                ? "transferring"
                : "idle"
            }
            style={
              isGolden
                ? {
                    background:
                      "#FFD76A",
                    boxShadow:
                      "0 0 8px rgba(255,215,106,1), 0 0 18px rgba(255,193,66,0.8)",
                  }
                : undefined
            }
          />
        </motion.div>

        {/* File catch */}
        <AnimatePresence>
          {isAccepted && (
            <motion.div
              variants={
                dropFileCatchAnimation
              }
              initial="initial"
              animate="catch"
              exit="initial"
              style={{
                position:
                  "absolute",
                top: "30px",
                left: "50%",
                x: "-50%",
                zIndex: 15,
                color:
                  "#FFE4A3",
                fontSize: "13px",
                fontWeight: 800,
                whiteSpace:
                  "nowrap",
                textShadow:
                  "0 0 12px rgba(255,196,61,0.95)",
                pointerEvents:
                  "none",
              }}
            >
              {transfer.fileName ||
                "File"}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Completion check */}
        <AnimatePresence>
          {isCompleted && (
            <motion.div
              variants={
                completionCheckAnimation
              }
              initial="hidden"
              animate="visible"
              exit="hidden"
              style={{
                position:
                  "absolute",
                top: "72px",
                left: "50%",
                x: "-50%",
                zIndex: 18,
                fontSize: "32px",
                color:
                  "#FFF0BD",
                textShadow:
                  "0 0 16px rgba(255,201,72,0.95)",
                pointerEvents:
                  "none",
              }}
            >
              ✓
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transfer details */}
        <AnimatePresence>
          {isTransferring && (
            <motion.div
              initial={{
                opacity: 0,
                y: 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -4,
              }}
              style={{
                position:
                  "absolute",
                top: "222px",
                left: "50%",
                x: "-50%",
                width: "238px",
                padding:
                  "8px 10px",
                borderRadius:
                  "12px",
                background:
                  "rgba(20,16,8,0.88)",
                border:
                  "1px solid rgba(255,193,66,0.32)",
                backdropFilter:
                  "blur(12px)",
                boxShadow:
                  "0 0 18px rgba(255,181,52,0.12)",
                zIndex: 20,
                pointerEvents:
                  "none",
              }}
            >
              <div
                style={{
                  overflow:
                    "hidden",
                  textOverflow:
                    "ellipsis",
                  whiteSpace:
                    "nowrap",
                  color:
                    "#FFE8B4",
                  fontSize:
                    "11px",
                  fontWeight: 700,
                  marginBottom:
                    "5px",
                }}
              >
                {transfer.fileName}
              </div>

              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  color:
                    "#F7D889",
                  fontSize:
                    "10px",
                  fontWeight: 600,
                }}
              >
                <span>
                  {formatBytes(
                    transfer.transferredBytes
                  )}
                  {" / "}
                  {formatBytes(
                    transfer.totalBytes
                  )}
                </span>

                <span>
                  {Math.round(
                    transfer.progress
                  )}
                  %
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right-side message */}
        <BotMessage
          state={messageState}
          message={message}
        />

        {/* Connection label */}
        <div
          className="dropbot-connection"
          style={{
            WebkitAppRegion:
              "no-drag",
            cursor:
              "default",
            opacity: 0.75,
          }}
        >
          <span
            className="dropbot-connection-dot"
            style={{
              background:
                connected
                  ? "#2DE49A"
                  : "#FF4D5E",
              boxShadow:
                connected
                  ? "0 0 8px rgba(45,228,154,0.9)"
                  : "0 0 8px rgba(255,77,94,0.8)",
            }}
          />

          <span>
            {deviceName}
          </span>
        </div>

        <div
          className="dropbot-connection-state"
          style={{
            WebkitAppRegion:
              "no-drag",
            cursor:
              "default",
            opacity: 0.75,
          }}
        >
          {connected
            ? "Connected"
            : "Not connected"}
        </div>
      </motion.div>
    </div>
  );
}