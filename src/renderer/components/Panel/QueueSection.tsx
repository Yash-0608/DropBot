import {
  Clock3,
  FileArchive,
  FileText,
  Film,
  Image,
} from "lucide-react";

type QueueItem = {
  id: number;
  name: string;
  size: string;
  type: "video" | "image" | "archive" | "document";
  status: "waiting" | "preparing" | "transferring";
};

const queueItems: QueueItem[] = [
  {
    id: 1,
    name: "PhoneCast_Final.mp4",
    size: "1.8 GB",
    type: "video",
    status: "waiting",
  },
  {
    id: 2,
    name: "Project_Backup.zip",
    size: "642 MB",
    type: "archive",
    status: "preparing",
  },
];

function getFileIcon(type: QueueItem["type"]) {
  switch (type) {
    case "video":
      return <Film size={16} />;

    case "image":
      return <Image size={16} />;

    case "archive":
      return <FileArchive size={16} />;

    case "document":
      return <FileText size={16} />;

    default:
      return <FileText size={16} />;
  }
}

function getStatusText(status: QueueItem["status"]) {
  switch (status) {
    case "transferring":
      return "Transferring";

    case "preparing":
      return "Preparing";

    default:
      return "Waiting";
  }
}

export default function QueueSection() {
  return (
    <section
      style={{
        padding: "14px",
        borderRadius: "15px",
        border: "1px solid rgba(79, 183, 255, 0.16)",
        background: "rgba(15, 35, 51, 0.44)",
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
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Clock3 size={14} color="#75CFFF" />

          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              color: "rgba(210, 232, 245, 0.60)",
              textTransform: "uppercase",
              letterSpacing: "0.7px",
            }}
          >
            Transfer queue
          </span>
        </div>

        <span
          style={{
            minWidth: "23px",
            height: "23px",
            display: "grid",
            placeItems: "center",
            borderRadius: "8px",
            background: "rgba(79, 183, 255, 0.10)",
            color: "#C8EEFF",
            fontSize: "10px",
            fontWeight: 800,
          }}
        >
          {queueItems.length}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {queueItems.map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "9px 10px",
              borderRadius: "11px",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.04)",
            }}
          >
            <div
              style={{
                width: "30px",
                height: "30px",
                display: "grid",
                placeItems: "center",
                flex: "0 0 auto",
                borderRadius: "9px",
                background: "rgba(79, 183, 255, 0.08)",
                color: "#70D2FF",
              }}
            >
              {getFileIcon(item.type)}
            </div>

            <div
              style={{
                minWidth: 0,
                flex: 1,
              }}
            >
              <div
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  color: "#EFF9FF",
                  fontSize: "11px",
                  fontWeight: 700,
                }}
              >
                {item.name}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginTop: "3px",
                  color: "rgba(210, 232, 245, 0.48)",
                  fontSize: "9px",
                }}
              >
                <span>{item.size}</span>

                <span>•</span>

                <span>{getStatusText(item.status)}</span>
              </div>
            </div>

            <div
              style={{
                width: "6px",
                height: "6px",
                flex: "0 0 auto",
                borderRadius: "50%",
                background:
                  item.status === "preparing"
                    ? "#FFD15A"
                    : "#7CCFFF",
                boxShadow:
                  item.status === "preparing"
                    ? "0 0 8px rgba(255, 209, 90, 0.8)"
                    : "0 0 8px rgba(124, 207, 255, 0.65)",
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}