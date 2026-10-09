import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

import DropBot from "./components/Bot/DropBot";
import ControlPanel from "./components/Panel/ControlPanel";
import { useBotStore } from "./store/botStore";

import "./styles/globals.css";
import "./styles/bot.css";
import "./styles/panel.css";

export default function App() {
  const [startupError, setStartupError] = useState("");
  const panelOpen = useBotStore(
    (state) => state.panelOpen
  );

  const setPanelOpen = useBotStore(
    (state) => state.setPanelOpen
  );

  const setConnectionState = useBotStore((state) => state.setConnectionState);
  const setDeviceName = useBotStore((state) => state.setDeviceName);
  const setPairingPayload = useBotStore((state) => state.setPairingPayload);

  useEffect(() => {
    window.dropbot?.onConnection((phone) => {
      if (phone) {
        setDeviceName(phone.name);
        setConnectionState("connected");
      } else {
        setConnectionState("disconnected");
      }
    });
    window.dropbot?.onPairing((info) => setPairingPayload(info.payload));
    window.dropbot?.onError((error) => setStartupError(error.message));
  }, [setConnectionState, setDeviceName, setPairingPayload]);

  return (
    <main
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "flex-start",
      }}
    >
      <DropBot />
      {startupError && (
        <div style={{
          position: "absolute",
          top: 8,
          left: 8,
          right: 8,
          zIndex: 200,
          padding: "8px 10px",
          borderRadius: 8,
          background: "#5c1f2a",
          color: "#ffd9df",
          fontSize: 11,
          pointerEvents: "none",
        }}>
          {startupError}
        </div>
      )}

      <AnimatePresence>
        {panelOpen && (
          <div
            style={{
              position: "absolute",
              top: "0",
              left: "0",
              zIndex: 100,
            }}
          >
            <ControlPanel
              onClose={() => {
                setPanelOpen(false);
              }}
            />
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}