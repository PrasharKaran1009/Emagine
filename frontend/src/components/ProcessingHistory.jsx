import React from "react";
import { useTheme } from "../theme/ThemeContext";

function ProcessingHistory({ result, selectedStep, onStepClick }) {
  const { theme } = useTheme();

  if (!result || !result.steps) {
    return (
      <div style={{...styles.emptyContainer, background: theme.colors.surface}}>
        <p style={{ color: theme.colors.muted, fontSize: "14px" }}>Awaiting process...</p>
      </div>
    );
  }

  const stepOrder = ["1_denoise", "2_upscale", "3_clahe", "4_color", "5_final"];

  const labels = {
    "1_denoise": "Step 1: Denoise",
    "2_upscale": "Step 2: Upscale",
    "3_clahe": "Step 3: CLAHE",
    "4_color": "Step 4: Color Profile",
    "5_final": "Final Render",
  };

  return (
    <div style={{...styles.container, background: theme.colors.surface}}>
      <h3 style={{...styles.heading, color: theme.colors.text, borderBottom: `1px solid ${theme.colors.borderSoft}`}}>
        Processing Timeline
      </h3>
      <div style={styles.stack}>
        {stepOrder.map((key) => {
          if (!result.steps[key]) return null;
          
          const isActive = selectedStep === key;
          
          return (
            <div 
              key={key} 
              className="card-animated window-glow" 
              onClick={() => onStepClick(isActive ? null : key)}
              style={{
                ...styles.historyCard,
                background: isActive ? theme.colors.surfaceHover : theme.colors.background,
                border: `1px solid ${isActive ? theme.colors.primary : theme.colors.border}`,
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              <div style={styles.cardInfo}>
                <span style={{
                  ...styles.stepName, 
                  color: isActive ? theme.colors.primary : theme.colors.text
                }}>
                  {labels[key]}
                </span>
                
                {isActive && (
                  <div style={{fontSize: "11px", color: theme.colors.muted, marginTop: "4px"}}>
                    Viewing stage...
                  </div>
                )}
              </div>
              
              <img 
                src={result.steps[key]} 
                alt={key} 
                style={{
                  ...styles.thumb, 
                  border: `1px solid ${isActive ? theme.colors.primary : theme.colors.borderSoft}`
                }} 
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
    height: "100%",
    padding: "32px 24px",
    overflowY: "auto",
  },
  emptyContainer: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  heading: {
    fontSize: "13px",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: "32px",
    paddingBottom: "16px",
  },
  stack: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  historyCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px",
    borderRadius: "16px",
  },
  cardInfo: {
    flexGrow: 1,
  },
  stepName: {
    fontSize: "13px",
    fontWeight: "600",
  },
  thumb: {
    width: "64px",
    height: "64px",
    borderRadius: "10px",
    objectFit: "cover",
    marginLeft: "16px",
  },
};

export default ProcessingHistory;
