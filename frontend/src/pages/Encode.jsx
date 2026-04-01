import { useState } from "react";
import UploadBox from "../components/UploadBox";
import Loader from "../components/Loader";
import ImageSlider from "../components/ImageSlider";
import { useTheme } from "../theme/ThemeContext";

function Encode() {
  const [file, setFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState(null);
  const [message, setMessage] = useState("");
  const [processing, setProcessing] = useState(false);
  const [resultImage, setResultImage] = useState(null);
  const [error, setError] = useState(null);
  const { theme, isDark } = useTheme();

  const handleUpload = (selectedFile, url) => {
    setFile(selectedFile);
    setOriginalUrl(url);
    setResultImage(null);
    setError(null);
  };

  const handleEncode = async () => {
    if (!file || !message) {
      setError("Please provide both an image and a secret message.");
      return;
    }
    setProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("message", message);

      const res = await fetch("http://localhost:8000/encode", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || errData.message || "Encoding failed");
      }

      const data = await res.json();
      setResultImage(data.image_url);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setOriginalUrl(null);
    setResultImage(null);
    setMessage("");
    setError(null);
  };

  // Mock an allSteps object to make ImageSlider happy since we only have before/after
  const mockSteps = resultImage ? { "original": originalUrl, "encoded": resultImage } : null;

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
          
          {!resultImage && (
            <div style={styles.header}>
              <h1 style={{...styles.title, color: theme.colors.text}}>Steganography Encoding</h1>
              <p style={{...styles.subtitle, color: theme.colors.muted}}>
                Safely hide an encrypted secret message completely invisibly inside the pixel channels of any cover image.
              </p>
            </div>
          )}

          <div style={styles.interactiveArea}>
            {!resultImage && (
              <div style={{ width: "100%", maxWidth: "800px", display: "flex", flexDirection: "column", gap: "24px" }}>
                <UploadBox onUpload={handleUpload} />
                
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
                  <label style={{ color: theme.colors.text, fontWeight: "600" }}>Secret Message</label>
                  <textarea 
                    style={{
                      ...styles.textArea,
                      background: isDark ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.5)",
                      color: theme.colors.text,
                      borderColor: theme.colors.borderSoft
                    }}
                    rows={4}
                    placeholder="Enter the secret message to hide inside the image..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                {error && (
                  <div style={{...styles.errorBox, background: "rgba(255, 60, 60, 0.1)", color: "#ff4d4d", border: "1px solid rgba(255, 60, 60, 0.3)"}}>
                    ⚠️ {error}
                  </div>
                )}

                <button 
                  style={{
                    ...styles.encodeButton, 
                    background: file && message ? theme.colors.primary : theme.colors.borderSoft,
                    cursor: file && message ? "pointer" : "not-allowed",
                    opacity: processing ? 0.7 : 1
                  }}
                  onClick={handleEncode}
                  disabled={!file || !message || processing}
                >
                  {processing ? "Encoding Secret..." : "Encode Secret"}
                </button>
              </div>
            )}

            {processing && (
              <div style={{ marginTop: "32px" }}>
                <Loader />
              </div>
            )}

            {resultImage && !processing && (
              <div className="card-animated window-glow" style={{ width: "100%", borderRadius: "16px", marginTop: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: `1px solid ${theme.colors.borderSoft}` }}>
                  <h3 style={{ margin: 0, color: theme.colors.text }}>Encoding Verification View</h3>
                  <button onClick={handleReset} style={{...styles.resetButton, color: theme.colors.primary}}>Perform Another</button>
                </div>
                
                <ImageSlider 
                  before={originalUrl} 
                  after={resultImage} 
                  allSteps={mockSteps} 
                  activeStepKey={"encoded"} 
                  onClose={handleReset}
                  processing={false}
                />
                
                <div style={{ padding: "16px 24px", color: theme.colors.muted, textAlign: "center", fontSize: "14px" }}>
                  The encoded image securely contains your payload. There should be practically zero visual interference. Use the slider to verify.
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
  textArea: {
    width: "100%",
    padding: "16px",
    borderRadius: "12px",
    fontSize: "16px",
    fontFamily: "inherit",
    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)",
    resize: "vertical",
    outline: "none",
    transition: "border-color 0.2s"
  },
  encodeButton: {
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
  }
};

export default Encode;
