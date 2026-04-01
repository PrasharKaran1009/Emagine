import { useState, useEffect } from "react";
import { useTheme } from "../theme/ThemeContext";

function DecodeAnimation({ isVisible, isFetching, decodedMessage, apiError, onClose }) {
  const { theme, isDark } = useTheme();
  const [stage, setStage] = useState(0); // 0: hidden, 1: scanning, 2: rain, 3: typing, 4: done
  const [minScanDone, setMinScanDone] = useState(false);
  const [typedMessage, setTypedMessage] = useState("");
  const [rainDrops, setRainDrops] = useState([]);

  // Reset logic
  useEffect(() => {
    if (isVisible) {
      setStage(1);
      setMinScanDone(false);
      setTypedMessage("");
      // Generate random drops array for stage 2 (Cinematic: Less columns, slower fall, longer trail)
      const drops = Array(10).fill(0).map((_, i) => ({
        id: i,
        left: `${Math.random() * 95}%`,
        duration: 3 + Math.random() * 4,
        delay: Math.random() * 2,
        chars: Array(25).fill(0).map(() => (Math.random() > 0.5 ? "1" : "0")).join("\n")
      }));
      setRainDrops(drops);
      
      const t = setTimeout(() => {
        setMinScanDone(true);
      }, 2000);
      return () => clearTimeout(t);
    } else {
      setStage(0);
    }
  }, [isVisible]);

  // Stage 1 -> Stage 2 Router (Syncing with API)
  useEffect(() => {
    if (stage === 1 && minScanDone && !isFetching) {
      if (apiError) {
        // If error, we stop the animation here. The parent Decode.jsx will handle hiding if we close.
        const t = setTimeout(() => onClose(), 1500); // Wait so they see the red flash theoretically
        return () => clearTimeout(t);
      }
      if (decodedMessage) {
        setStage(2);
      }
    }
  }, [stage, minScanDone, isFetching, apiError, decodedMessage, onClose]);

  // Stage 2 -> Stage 3 (Rain transition)
  useEffect(() => {
    if (stage === 2) {
      const t = setTimeout(() => {
        setStage(3);
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [stage]);

  // Stage 3 -> Form message
  useEffect(() => {
    if (stage === 3 && decodedMessage) {
      const cleanMessage = String(decodedMessage).replace(/undefined$/, "").trim();
      let index = 0;
      setTypedMessage("");
      const interval = setInterval(() => {
        if (index < cleanMessage.length) {
          const char = cleanMessage[index] || "";
          setTypedMessage(prev => prev + char);
          index++;
        } else {
          clearInterval(interval);
          const t = setTimeout(() => setStage(4), 500);
          return () => clearTimeout(t);
        }
      }, 40); // Fast typing
      return () => clearInterval(interval);
    }
  }, [stage, decodedMessage]);

  if (!isVisible) return null;

  return (
    <div style={styles.fullscreen}>
      {/* SKIP BUTTON */}
      <button 
        onClick={onClose} 
        style={{
          position: "absolute", top: "24px", right: "24px", 
          background: "none", border: "none", color: theme.colors.muted, 
          cursor: "pointer", fontSize: "14px", zIndex: 9999
        }}
      >
        Skip ✕
      </button>

      <style>
        {`
          @keyframes scan-pan {
            0% { transform: translateY(-100px); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translateY(150px); opacity: 0; }
          }
          .scan-line {
            animation: scan-pan 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
            background: linear-gradient(180deg, transparent, ${theme.colors.primary});
            box-shadow: 0 5px 20px ${theme.colors.primary};
          }
          
          @keyframes rain-fall {
            0% { transform: translateY(-100%); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(100vh); opacity: 0; }
          }
          .binary-drop {
            color: ${theme.colors.primary};
            text-shadow: 0 0 10px ${theme.colors.primary};
            -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 100%);
            mask-image: linear-gradient(to bottom, transparent 0%, black 100%);
          }

          @keyframes pulse-error {
            0%, 100% { color: #ff4d4d; text-shadow: 0 0 8px #ff4d4d; }
            50% { color: #cc0000; text-shadow: none; }
          }
        `}
      </style>

      {/* STAGE 1: SCANNING */}
      {stage === 1 && (
        <div style={styles.centerBox}>
          {apiError ? (
            <h2 style={{ animation: "pulse-error 1s infinite", userSelect: "none" }}>
              Watermark Verification Failed!
            </h2>
          ) : (
            <>
              <h2 style={{ color: theme.colors.text, userSelect: "none", marginBottom: "40px" }}>
                Scanning for Emagine watermark...
              </h2>
              <div style={{ position: "relative", width: "400px", height: "100px", overflow: "hidden", border: `1px solid ${theme.colors.borderSoft}`, borderRadius: "12px", background: "rgba(0,0,0,0.4)" }}>
                 <div className="scan-line" style={{ width: "100%", height: "10px", position: "absolute", top: 0, left: 0 }} />
              </div>
            </>
          )}
        </div>
      )}

      {/* STAGE 2: RAIN */}
      {(stage === 2 || stage === 3) && (
        <div style={styles.rainContainer}>
          {rainDrops.map(drop => (
            <div 
              key={drop.id} 
              className="binary-drop"
              style={{
                ...styles.drop,
                left: drop.left,
                animation: `rain-fall ${drop.duration}s linear infinite`,
                animationDelay: `${drop.delay}s`,
                opacity: stage === 3 ? 0.2 : 1, // fade drops when typing starts
                transition: "opacity 1s"
              }}
            >
              {drop.chars}
            </div>
          ))}
        </div>
      )}

      {/* STAGE 3 & 4: MESSAGE TYPING */}
      {(stage === 3 || stage === 4) && (
        <div style={{...styles.centerBox, zIndex: 10}}>
          <div style={{
            ...styles.messageContainer,
            background: isDark ? "rgba(20,20,20,0.85)" : "rgba(255,255,255,0.9)",
            borderColor: theme.colors.borderSoft,
            boxShadow: `0 0 30px ${theme.colors.primary}40`
          }}>
            <h3 style={{ color: theme.colors.primary, marginTop: 0 }}>Payload Extracted:</h3>
            <p style={{ color: theme.colors.text, fontFamily: "monospace", fontSize: "18px", whiteSpace: "pre-wrap", minHeight: "100px" }}>
              {typedMessage}
              {stage === 3 && <span style={{ color: theme.colors.primary, animation: "flash-cell 0.5s infinite" }}>_</span>}
            </p>

            {stage === 4 && (
              <button 
                onClick={onClose}
                style={{
                  padding: "16px",
                  width: "100%",
                  borderRadius: "8px",
                  border: "none",
                  background: theme.colors.primary,
                  color: isDark ? theme.colors.background : "#fff",
                  fontWeight: "bold",
                  fontSize: "16px",
                  cursor: "pointer",
                  marginTop: "24px",
                  boxShadow: `0 0 15px ${theme.colors.primary}60`
                }}
              >
                Access Decrypted Interface
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

const styles = {
  fullscreen: {
    position: "fixed",
    top: 0, left: 0,
    width: "100vw", height: "100vh",
    background: "rgba(0,0,0,0.5)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    overflow: "hidden"
  },
  centerBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  },
  rainContainer: {
    position: "absolute",
    top: 0, left: 0,
    width: "100%", height: "100%",
    pointerEvents: "none"
  },
  drop: {
    position: "absolute",
    fontSize: "16px",
    fontFamily: "monospace",
    whiteSpace: "pre-wrap",
    lineHeight: "0.8",
    wordBreak: "break-all",
    width: "20px"
  },
  messageContainer: {
    width: "600px",
    padding: "40px",
    borderRadius: "16px",
    border: "1px solid",
  }
};

export default DecodeAnimation;
