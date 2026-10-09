import { Smartphone, Wifi } from "lucide-react";

type DeviceSectionProps = {
  deviceName?: string;
  connected?: boolean;
};

export default function DeviceSection({
  deviceName = "Yash's Phone",
  connected = true,
}: DeviceSectionProps) {
  return (
    <section
      style={{
        padding: "14px",
        borderRadius: "15px",
        border: "1px solid rgba(79, 183, 255, 0.18)",
        background: "rgba(15, 35, 51, 0.46)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "12px",
        }}
      >
        <div
          style={{
            fontSize: "10px",
            fontWeight: 700,
            color: "rgba(210, 232, 245, 0.56)",
            textTransform: "uppercase",
            letterSpacing: "0.7px",
          }}
        >
          Paired device
        </div>

        <Wifi
          size={14}
          color={connected ? "#62D6A7" : "#FF6170"}
        />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "11px",
        }}
      >
        <div
          style={{
            width: "38px",
            height: "38px",
            display: "grid",
            placeItems: "center",
            borderRadius: "11px",
            background: connected
              ? "rgba(71, 190, 255, 0.10)"
              : "rgba(255, 77, 94, 0.08)",
            color: connected ? "#69D0FF" : "#FF6876",
          }}
        >
          <Smartphone size={19} />
        </div>

        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#F0F8FD",
            }}
          >
            {deviceName}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginTop: "4px",
              fontSize: "10px",
              color: connected
                ? "#9FE6C5"
                : "#FF9CA6",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: connected
                  ? "#2DE49A"
                  : "#FF4D5E",
                boxShadow: connected
                  ? "0 0 8px rgba(45, 228, 154, 0.9)"
                  : "0 0 8px rgba(255, 77, 94, 0.8)",
              }}
            />

            {connected
              ? "Connected · Ready"
              : "Not connected"}
          </div>
        </div>
      </div>
    </section>
  );
}