import { useState, useEffect } from "react";
import { useTheme } from "../theme/ThemeContext";

function EncodeAnimation({ message, isVisible, isFetching, onComplete }) {
  const { theme, isDark } = useTheme();
  const [convertedChars, setConvertedChars] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gridBits, setGridBits] = useState(
    Array(200).fill(0).map(() => (Math.random() > 0.5 ? 1 : 0))
  );
  const [flashingCells, setFlashingCells] = useState([]);

  // Grid background fast-flicker
  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setGridBits(prev => prev.map(() => (Math.random() > 0.5 ? 1 : 0)));
    }, 120);
    return () => clearInterval(interval);
  }, [isVisible]);

  // Progressive String to Binary typing
  useEffect(() => {
    if (!isVisible) return;
    if (currentIndex < message.length) {
      const timer = setTimeout(() => {
        const char = message[currentIndex];
        const bin = char.charCodeAt(0).toString(2).padStart(8, "0");
        setConvertedChars(prev => [...prev, { char, bin }]);

        // Send a burst of flashes to the grid matrix simulating injection
        const flashes = [];
        for (let i = 0; i < 8; i++) flashes.push(Math.floor(Math.random() * 200));
        setFlashingCells(flashes);

        setCurrentIndex(prev => prev + 1);
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [isVisible, currentIndex, message]);

  // Completion detector: Type finished AND backend fetch is closed
  useEffect(() => {
    if (!isVisible) {
      setConvertedChars([]);
      setCurrentIndex(0);
      return;
    }

    if (currentIndex >= message.length && !isFetching) {
      const t = setTimeout(() => {
        onComplete();
      }, 500); // Small visual wait post-fetch before snapping out
      return () => clearTimeout(t);
    }
  }, [currentIndex, message.length, isFetching, isVisible, onComplete]);

  if (!isVisible) return null;

  const progressPct = message.length > 0 ? (currentIndex / message.length) * 100 : 0;

  return (
    <div style={styles.overlay}>
      {/* INJECT DYNAMIC CSS VARIABLES FOR KEYFRAMES HERE */}
      <style>
        {`
          @keyframes flash-cell {
            0% { color: inherit; text-shadow: none; font-weight: normal; }
            30% { 
              color: ${theme.colors.primary}; 
              text-shadow: 0 0 12px ${theme.colors.primary}; 
              font-weight: 800;
            }
            100% { color: inherit; text-shadow: none; font-weight: normal; }
          }
          
          .grid-cell {
            transition: color 0.1s;
          }
          .grid-cell.flash {
            animation: flash-cell 0.3s ease-out;
          }
          
          .binary-line {
            animation: slide-in 0.2s ease-out forwards;
            opacity: 0;
            transform: translateY(10px);
          }
          
          @keyframes slide-in {
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>

      <div style={{
        ...styles.modal,
        background: isDark ? "rgba(20, 20, 20, 0.85)" : "rgba(255, 255, 255, 0.9)",
        borderColor: theme.colors.borderSoft,
        position: "relative"
      }}>
        
        <button 
          onClick={onComplete} 
          style={{
            position: "absolute", top: "24px", right: "24px",
            background: "none", border: "none", color: theme.colors.muted,
            fontSize: "14px", cursor: "pointer", zIndex: 10
          }}
        >
          Skip ✕
        </button>

        <div style={styles.panelsContainer}>
          {/* LEFT: Binary Feed */}
          <div style={{...styles.leftPanel, borderRight: `1px solid ${theme.colors.borderSoft}`}}>
            <h3 style={{ margin: "0 0 16px 0", color: theme.colors.text }}>Encrypting Payload</h3>
            
            <div style={styles.feedBox}>
              {convertedChars.map((item, i) => (
                <div key={i} className="binary-line" style={{ display: "flex", gap: "16px", color: theme.colors.muted, fontFamily: "monospace", fontSize: "14px", marginBottom: "4px" }}>
                  <span style={{ color: theme.colors.text }}>{item.char}</span>
                  <span>→</span>
                  <span style={{ color: theme.colors.primary }}>{item.bin}</span>
                </div>
              ))}
              {/* Dummy row scrolling anchor */}
              <div ref={(el) => el?.scrollIntoView()} />
            </div>

            <div style={{ marginTop: "16px", fontSize: "12px", color: theme.colors.muted, fontFamily: "monospace" }}>
              Bits Processed: {(currentIndex * 8).toString().padStart(6, '0')}
            </div>
          </div>

          {/* RIGHT: Pixel Matrix */}
          <div style={styles.rightPanel}>
            <div style={{...styles.matrixGrid, color: theme.colors.muted}}>
              {gridBits.map((bit, i) => (
                <span 
                  key={i} 
                  className={`grid-cell ${flashingCells.includes(i) ? 'flash' : ''}`}
                >
                  {bit}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM: Progress Bar */}
        <div style={{ padding: "0 24px 24px" }}>
          <div style={{ ...styles.progressTrack, background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" }}>
            <div style={{
              ...styles.progressBar,
              background: theme.colors.primary,
              width: `${progressPct}%`,
              boxShadow: `0 0 10px ${theme.colors.primary}80`
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0, 0, 0, 0.4)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  modal: {
    width: "800px",
    height: "500px",
    borderRadius: "24px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
    border: "1px solid",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden"
  },
  panelsContainer: {
    display: "flex",
    flexGrow: 1,
    height: "calc(100% - 40px)",
  },
  leftPanel: {
    width: "40%",
    padding: "32px",
    display: "flex",
    flexDirection: "column",
  },
  feedBox: {
    flexGrow: 1,
    overflowY: "hidden", // Let it just stack smoothly and push, or overflow hidden with scrolling anchor
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end", // Bottom aligned feed
  },
  rightPanel: {
    width: "60%",
    padding: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  matrixGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(20, 1fr)",
    gridGap: "4px",
    fontFamily: "monospace",
    fontSize: "14px",
    userSelect: "none"
  },
  progressTrack: {
    width: "100%",
    height: "6px",
    borderRadius: "3px",
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    transition: "width 0.1s ease-out",
  }
};

export default EncodeAnimation;
