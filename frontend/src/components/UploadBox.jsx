import { useState } from "react";
import { theme } from "../theme/theme";

function UploadBox({ setImage, setProcessing, setResult }) {
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleFile = async (file) => {
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreview(url);
    setImage(url);
    setProcessing(true);

    try {
      const formData = new FormData();
      formData.append("file", file); // Changed from "image" to "file"

      const res = await fetch("http://localhost:8000/process", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to process image");
      }

      const data = await res.json();

      console.log("BACKEND RESPONSE:", data);

      setResult(data);
    } catch (err) {
      console.error("Upload failed:", err);
      setResult(null);
    } finally {
      setProcessing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div
      style={{
        ...styles.box,
        border: dragging
          ? `2px solid ${theme.colors.primary}`
          : "2px dashed rgba(255,255,255,0.1)",
        boxShadow: dragging
          ? `0 0 20px ${theme.colors.primary}40`
          : "none",
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      {preview ? (
        <div style={styles.previewContainer}>
          <img src={preview} alt="preview" style={styles.image} />
          <p style={styles.replace}>Click or drop to replace</p>
        </div>
      ) : (
        <>
          <h2 style={styles.title}>Drop your image here</h2>
          <p style={styles.sub}>
            or <span style={{ color: theme.colors.primary }}>browse files</span>
          </p>
        </>
      )}

      <input
        type="file"
        accept="image/*"
        style={styles.input}
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  );
}

const styles = {
  box: {
    width: "100%",
    height: "320px",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    background: "rgba(255,255,255,0.02)",
    position: "relative",
    transition: "0.3s ease",
    cursor: "pointer",
  },
  title: {
    fontSize: "22px",
    fontWeight: "600",
    marginBottom: "6px",
  },
  sub: {
    color: "#9ca3af",
    fontSize: "14px",
  },
  input: {
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 0,
    cursor: "pointer",
  },
  previewContainer: {
    position: "relative",
    textAlign: "center",
  },
  image: {
    maxHeight: "220px",
    maxWidth: "100%",
    borderRadius: "12px",
    marginBottom: "10px",
  },
  replace: {
    fontSize: "12px",
    color: "#9ca3af",
  },
};

export default UploadBox;