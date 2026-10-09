import {
  CheckCircle2,
  FileArchive,
  FileText,
  Film,
  Image,
} from "lucide-react";

type HistoryItem = {
  id: number;
  name: string;
  size: string;
  time: string;
  type: "video" | "image" | "archive" | "document";
};

const historyItems: HistoryItem[] = [
  {
    id: 1,
    name: "Project_Final.zip",
    size: "842 MB",
    time: "Today · 09:42 AM",
    type: "archive",
  },
  {
    id: 2,
    name: "Presentation.pdf",
    size: "18.4 MB",
    time: "Yesterday · 06:18 PM",
    type: "document",
  },
  {
    id: 3,
    name: "Vacation.jpg",
    size: "4.8 MB",
    time: "Yesterday · 05:52 PM",
    type: "image",
  },
];

function getFileIcon(type: HistoryItem["type"]) {
  switch (type) {
    case "video":
      return <Film size={15} />;

    case "image":
      return <Image size={15} />;

    case "archive":
      return <FileArchive size={15} />;

    case "document":
      return <FileText size={15} />;

    default:
      return <FileText size={15} />;
  }
}

export default function HistorySection() {
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
          marginBottom: "12px",
          fontSize: "10px",
          fontWeight: 700,
          color: "rgba(210, 232, 245, 0.60)",
          textTransform: "uppercase",
          letterSpacing: "0.7px",
        }}
      >
        Recent transfers
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {historyItems.map((item) => (
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
                <span>{item.time}</span>
              </div>
            </div>

            <CheckCircle2
              size={16}
              color="#50D7A2"
              style={{
                flex: "0 0 auto",
                filter:
                  "drop-shadow(0 0 5px rgba(80, 215, 162, 0.35))",
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}