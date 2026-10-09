import {
  Archive,
  File,
  FileImage,
  FileText,
  Film,
  Music,
} from "lucide-react";

type FilePreviewProps = {
  fileName: string;
  fileSize: number;
};

function formatFileSize(bytes: number): string {
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

function getFileIcon(fileName: string) {
  const extension =
    fileName.split(".").pop()?.toLowerCase() ?? "";

  if (
    ["mp4", "mkv", "avi", "mov", "webm"].includes(extension)
  ) {
    return <Film size={18} />;
  }

  if (
    ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(
      extension
    )
  ) {
    return <FileImage size={18} />;
  }

  if (
    ["mp3", "wav", "flac", "aac", "m4a"].includes(extension)
  ) {
    return <Music size={18} />;
  }

  if (
    ["zip", "rar", "7z", "tar", "gz"].includes(extension)
  ) {
    return <Archive size={18} />;
  }

  if (
    ["pdf", "doc", "docx", "txt", "xlsx", "xls", "ppt", "pptx"].includes(
      extension
    )
  ) {
    return <FileText size={18} />;
  }

  return <File size={18} />;
}

export default function FilePreview({
  fileName,
  fileSize,
}: FilePreviewProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        width: "100%",
        padding: "10px 12px",
        borderRadius: "12px",
        background: "rgba(255, 255, 255, 0.04)",
        border: "1px solid rgba(255, 193, 66, 0.18)",
        color: "#FFF0C7",
      }}
    >
      <div
        style={{
          width: "34px",
          height: "34px",
          flex: "0 0 auto",
          display: "grid",
          placeItems: "center",
          borderRadius: "9px",
          background: "rgba(255, 193, 66, 0.10)",
          color: "#FFD15A",
        }}
      >
        {getFileIcon(fileName)}
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
            fontSize: "11px",
            fontWeight: 700,
          }}
          title={fileName}
        >
          {fileName}
        </div>

        <div
          style={{
            marginTop: "3px",
            fontSize: "9px",
            color: "rgba(255, 232, 180, 0.55)",
          }}
        >
          {formatFileSize(fileSize)}
        </div>
      </div>
    </div>
  );
}