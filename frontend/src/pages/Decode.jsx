import { useState } from "react";
import UploadBox from "../components/UploadBox";
import Loader from "../components/Loader";
import { useTheme } from "../theme/ThemeContext";

function Decode() {
  const [file, setFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [secretMessage, setSecretMessage] = useState(null);
  const [error, setError] = useState(null);
  const { theme, isDark } = useTheme();

  const handleUpload = (selectedFile, url) => {
    setFile(selectedFile);
    setOriginalUrl(url);
    setSecretMessage(null);
    setError(null);
  };

  const handleDecode = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:8000/decode", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || errData.message || "Decoding failed");
      }

      const data = await res.json();
      setSecretMessage(data.secret_message);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setOriginalUrl(null);
    setSecretMessage(null);
    setError(null);
  };

  return (
    <div style={{ display: "flex", width: "100%", height: "100%", flexGrow: 1 }}>
      <div style={{
        ...styles.centerPanel,
        background: theme.colors.surface,
        backgroundImage: isDark 
          ? "conic-gradient(from 0deg, rgba(214,205,191,0.06), rgba(214,205,191,0.01), rgba(214,205,191,0.06))" 
          : "conic-gradient(from 0deg, rgba(0,179,107,0.08), rgba(0,179,107,0.01), rgba(0,179,107,0.08))",
        border: `1px solid ${theme.colors.borderSoft}`,
        boxShadow: `inset 0 0 40px ${isDark ? "rgba(214,205,191,0.05)" : "rgba(0,179,107,0.12)"}, ${theme.glow}`,
      }}>
        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
          
          {!secretMessage && (
            <div style={styles.header}>
              <h1 style={{...styles.title, color: theme.colors.text}}>Steganography Decoding</h1>
              <p style={{...styles.subtitle, color: theme.colors.muted}}>
                Upload an encrypted cover image to instantly extract its hidden contents using the Emagine engine.
              </p>
            </div>
          )}

          <div style={styles.interactiveArea}>
            {!secretMessage && (
              <div style={{ width: "100%", maxWidth: "800px", display: "flex", flexDirection: "column", gap: "24px" }}>
                <UploadBox onUpload={handleUpload} />
                
                {error && (
                  <div style={{...styles.errorBox, background: "rgba(255, 60, 60, 0.1)", color: "#ff4d4d", border: "1px solid rgba(255, 60, 60, 0.3)"}}>
                    ⚠️ {error}
                  </div>
                )}

                <button 
                  style={{
                    ...styles.decodeButton, 
                    background: file ? theme.colors.primary : theme.colors.borderSoft,
                    cursor: file ? "pointer" : "not-allowed",
                    opacity: processing ? 0.7 : 1
                  }}
                  onClick={handleDecode}
                  disabled={!file || processing}
                >
                  {processing ? "Extracting..." : "Decrypt Image Data"}
                </button>
              </div>
            )}

            {processing && (
              <div style={{ marginTop: "32px" }}>
                <Loader />
              </div>
            )}

            {secretMessage && (
              <div className="card-animated window-glow" style={{ width: "100%", maxWidth: "800px", borderRadius: "16px", marginTop: "20px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: `1px solid ${theme.colors.borderSoft}`, background: isDark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.05)" }}>
                  <h3 style={{ margin: 0, color: theme.colors.primary }}>🔒 Decrypted Payload</h3>
                  <button onClick={handleReset} style={{...styles.resetButton, color: theme.colors.primary}}>Perform Another</button>
                </div>
                
                <div style={{ padding: "40px", width: "100%", minHeight: "300px" }}>
                  <p style={{
                    ...styles.messageBox, 
                    background: isDark ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.7)",
                    color: theme.colors.text,
                    border: `1px solid ${theme.colors.borderSoft}`,
                    whiteSpace: "pre-wrap"
                  }}>
                    {secretMessage}
                  </p>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  centerPanel: {
    flexGrow: 1,
    margin: "16px",
    padding: "64px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    borderRadius: "24px",
  },
  header: {
    width: "100%",
    maxWidth: "960px",
    marginBottom: "48px",
    textAlign: "center",
  },
  title: {
    fontSize: "36px",
    fontWeight: "800",
    marginBottom: "16px",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: "16px",
    maxWidth: "600px",
    margin: "0 auto",
    lineHeight: "1.6",
  },
  interactiveArea: {
    width: "100%",
    maxWidth: "1000px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  decodeButton: {
    width: "100%",
    padding: "18px",
    borderRadius: "12px",
    color: "#fff",
    fontSize: "18px",
    fontWeight: "600",
    border: "none",
    transition: "all 0.2s ease"
  },
  resetButton: {
    background: "transparent",
    border: "none",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  errorBox: {
    padding: "16px",
    borderRadius: "12px",
    fontWeight: "500",
    textAlign: "center"
  },
  messageBox: {
    margin: 0,
    padding: "24px",
    borderRadius: "12px",
    fontSize: "18px",
    lineHeight: "1.6",
    fontFamily: "monospace",
    boxShadow: "inset 0 2px 10px rgba(0,0,0,0.05)"
  }
};

export default Decode;
