import { useState } from "react";
import { useTheme } from "../theme/ThemeContext";

function UploadBox({ setImage, setProcessing, setResult }) {
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const { theme } = useTheme();

  const handleFile = async (file) => {
    if (!file) return;

    const url = URL.createObjectURL(file);
    
    // 6. CRUCIAL UX FIX: RESET ALL STATE BEFORE NEW PROCESSING
    setPreview(url);
    setImage(url);
    setResult(null); // wipe previous frontend history cleanly
    setProcessing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:8000/process_stream", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to process image");

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;
      
      let streamedResult = { steps: {} };
      setResult(streamedResult); // initialized clear stream container

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const parts = chunk.split("\n").filter((p) => p.trim());
          for (let p of parts) {
            try {
              const data = JSON.parse(p);
              if (data.step && data.url) {
                streamedResult.steps[data.step] = data.url;
                
                if (data.step === "5_final") {
                  streamedResult.final = data.url;
                }
                
                setResult({ ...streamedResult, steps: { ...streamedResult.steps } });
              }
            } catch (err) {
              console.error("Parse error chunk:", err);
            }
          }
        }
      }
    } catch (err) {
      console.error("Upload failed:", err);
      // Wait to not abruptly empty valid preview on error immediately.
      // But typically we should handle error UI visually.
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
        background: theme.colors.surface,
        border: dragging
          ? `2px solid ${theme.colors.primary}`
          : `2px dashed ${theme.colors.border}`,
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
          <p style={{...styles.replace, color: theme.colors.muted}}>Click or drop to replace</p>
        </div>
      ) : (
        <>
          <h2 style={{...styles.title, color: theme.colors.text}}>Drop your image here</h2>
          <p style={{...styles.sub, color: theme.colors.muted}}>
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
    position: "relative",
    transition: "all 0.3s ease",
    cursor: "pointer",
  },
  title: {
    fontSize: "22px",
    fontWeight: "600",
    marginBottom: "6px",
  },
  sub: {
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
  },
};

export default UploadBox;