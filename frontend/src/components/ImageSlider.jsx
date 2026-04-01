import { useState, useEffect, useCallback, useRef } from "react";
import { useTheme } from "../theme/ThemeContext";

function ImageSlider({ before, after, allSteps, activeStepKey, onClose, processing }) {
  const { theme, isDark } = useTheme();
  const [view, setView] = useState("after"); // 'before' | 'after'
  const [downloadStep, setDownloadStep] = useState(activeStepKey || "5_final");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (activeStepKey) setDownloadStep(activeStepKey);
  }, [activeStepKey]);

  // Forces view to 'after' when a new step is clicked in the timeline
  useEffect(() => {
    setView("after");
  }, [activeStepKey]);

  const handleDownload = useCallback(() => {
    const urlToDownload = (allSteps && downloadStep && allSteps[downloadStep]) ? allSteps[downloadStep] : after;
    const stepName = downloadStep || "final_stage";

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const link = document.createElement("a");
      link.download = `emagine_${stepName}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = urlToDownload;
  }, [after, allSteps, downloadStep]);

  if (!before || !after) {
    return <div style={{ padding: "2rem", textAlign: "center", color: theme.colors.muted }}>Optimizing visuals...</div>;
  }

  // Pure aesthetic toggle styles
  const activeTabStyle = {
    padding: "6px 16px",
    background: isDark ? "#ffffff" : theme.colors.surface,
    color: isDark ? "#000000" : theme.colors.text,
    fontWeight: "600",
    borderRadius: "20px",
    fontSize: "13px",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    transition: "all 0.2s",
  };

  const inactiveTabStyle = {
    padding: "6px 16px",
    background: "transparent",
    color: isDark ? "rgba(255,255,255,0.7)" : theme.colors.muted,
    fontWeight: "500",
    borderRadius: "20px",
    fontSize: "13px",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s",
  };

  return (
    <div style={styles.wrapper}>
      {/* Container simulating the reference screenshots */}
      <div style={{ ...styles.card, background: theme.colors.surfaceGlass, border: `1px solid ${theme.colors.borderSoft}` }}>
        <div style={styles.imageContainer}>
          
          <img 
            src={view === "before" ? before : after} 
            alt={view}
            style={styles.image} 
          />

          {/* Top Left Floating Toggle Pill */}
          <div style={{...styles.toggleWrapper, background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}}>
            <button 
              onClick={() => setView("before")} 
              style={view === "before" ? activeTabStyle : inactiveTabStyle}
            >
              Before
            </button>
            <button 
              onClick={() => setView("after")} 
              style={view === "after" ? activeTabStyle : inactiveTabStyle}
            >
              After
            </button>
          </div>

          {/* Top Right Close Button (Only valid when not actively streaming) */}
          {!processing && onClose && (
            <button
               onClick={onClose}
               style={styles.closeBtn}
               title="Clear Session"
            >
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                 <line x1="18" y1="6" x2="6" y2="18"></line>
                 <line x1="6" y1="6" x2="18" y2="18"></line>
               </svg>
            </button>
          )}

        </div>
      </div>

      {/* BOTTOM ACTIONS LAYER */}
      <div style={styles.downloadRow}>
        {allSteps && (
          <div style={{ position: "relative" }} ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{
                ...styles.selectDropdown,
                background: theme.colors.surface,
                color: theme.colors.text,
                border: `1px solid ${theme.colors.border}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <span>
                {{
                  "1_denoise": "Step 1: Denoise",
                  "2_upscale": "Step 2: Upscale",
                  "3_clahe": "Step 3: CLAHE",
                  "4_color": "Step 4: Color",
                  "5_final": "Final Render",
                }[downloadStep] || downloadStep}
              </span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            {isDropdownOpen && (
              <div style={{
                position: "absolute",
                bottom: "calc(100% + 12px)",
                left: 0,
                width: "100%",
                background: theme.colors.surface,
                border: `1px solid ${theme.colors.borderSoft}`,
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 -8px 30px rgba(0,0,0,0.5)",
                zIndex: 100,
                display: "flex",
                flexDirection: "column",
                padding: "8px",
                gap: "4px",
                backdropFilter: "blur(12px)",
              }}>
                {Object.keys(allSteps).map((stepKey) => {
                  const label = {
                    "1_denoise": "Step 1: Denoise",
                    "2_upscale": "Step 2: Upscale",
                    "3_clahe": "Step 3: CLAHE",
                    "4_color": "Step 4: Color",
                    "5_final": "Final Render",
                  }[stepKey] || stepKey;
                  
                  const isSelected = downloadStep === stepKey;

                  return (
                    <button
                      key={stepKey}
                      onClick={() => {
                        setDownloadStep(stepKey);
                        setIsDropdownOpen(false);
                      }}
                      style={{
                        padding: "10px 16px",
                        background: isSelected ? theme.colors.primary + "20" : "transparent",
                        color: isSelected ? theme.colors.primary : theme.colors.text,
                        border: "none",
                        borderRadius: "10px",
                        textAlign: "left",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: isSelected ? "700" : "500",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.target.style.background = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.target.style.background = "transparent";
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <button 
          style={{
            ...styles.downloadBtn,
            background: "#b829e3", // vibrant purple from reference image
            color: "#ffffff",
            boxShadow: `0 4px 15px rgba(184, 41, 227, 0.4)`
          }} 
          onClick={handleDownload}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Download
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  card: {
    width: "100%",
    borderRadius: "16px",
    padding: "8px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    borderRadius: "12px",
    overflow: "hidden",
  },
  image: {
    width: "auto",
    maxWidth: "100%",
    maxHeight: "70vh", // dynamically fits to full image correctly without cropping
    objectFit: "contain",
    display: "block",
    borderRadius: "8px",
  },
  toggleWrapper: {
    position: "absolute",
    top: "16px",
    left: "16px",
    display: "flex",
    gap: "2px",
    padding: "4px",
    borderRadius: "24px",
    backdropFilter: "blur(8px)",
  },
  downloadRow: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "12px",
    marginTop: "24px",
  },
  selectDropdown: {
    padding: "16px 20px",
    fontSize: "14px",
    fontWeight: "600",
    borderRadius: "30px",
    cursor: "pointer",
    outline: "none",
    appearance: "none",
    minWidth: "180px",
  },
  downloadBtn: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "16px 36px",
    fontSize: "16px",
    fontWeight: "700",
    border: "none",
    borderRadius: "30px",
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  closeBtn: {
    position: "absolute",
    top: "16px",
    right: "16px",
    width: "30px",
    height: "30px",
    background: "rgba(0, 0, 0, 0.45)",
    color: "#ffffff",
    border: "none",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    backdropFilter: "blur(4px)",
    padding: 0,
    zIndex: 10,
  },
};

export default ImageSlider;