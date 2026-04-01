import { useState, useMemo } from "react";
import UploadBox from "../components/UploadBox";
import ImageSlider from "../components/ImageSlider";
import Loader from "../components/Loader";
import ProcessingHistory from "../components/ProcessingHistory";
import { useTheme } from "../theme/ThemeContext";

function Enhancement({ showPipeline }) {
  const [image, setImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedStep, setSelectedStep] = useState(null);
  const { theme, isDark } = useTheme();

  const stepOrder = ["1_denoise", "2_upscale", "3_clahe", "4_color", "5_final"];

  const activeStepKey = useMemo(() => {
    if (!result || !result.steps) return null;
    
    // Explicit step inspection
    if (selectedStep && result.steps[selectedStep]) {
        return selectedStep;
    }
    
    // Default to latest finished state automatically dynamically
    for (let i = stepOrder.length - 1; i >= 0; i--) {
      const key = stepOrder[i];
      if (result.steps[key]) {
        return key;
      }
    }
    return null;
  }, [result, selectedStep]);

  const activeStepImage = activeStepKey ? result.steps[activeStepKey] : null;

  const displayBefore = useMemo(() => {
    if (!selectedStep) return image;
    if (selectedStep === "5_final") return image; // override: final always compares to original

    const index = stepOrder.indexOf(selectedStep);
    
    if (index > 0) {
       const previousKey = stepOrder[index - 1];
       if (result && result.steps && result.steps[previousKey]) {
          return result.steps[previousKey];
       }
    }
    return image;
  }, [selectedStep, result, image]);

  const handleReset = () => {
    setImage(null);
    setResult(null);
    setSelectedStep(null);
  };

  return (
    <div style={{ 
      display: "flex", 
      width: "100%", 
      height: "100%", 
      flexGrow: 1,
    }}>
      
      {/* --- CENTER CANVAS --- */}
      <div style={{
        ...styles.centerPanel,
        background: theme.colors.surface,
        backgroundImage: isDark 
          ? "conic-gradient(from 0deg, rgba(214,205,191,0.06), rgba(214,205,191,0.01), rgba(214,205,191,0.06))" 
          : "conic-gradient(from 0deg, rgba(0,179,107,0.08), rgba(0,179,107,0.01), rgba(0,179,107,0.08))",
        border: `1px solid ${theme.colors.borderSoft}`,
        boxShadow: `inset 0 0 40px ${isDark ? "rgba(214,205,191,0.05)" : "rgba(0,179,107,0.12)"}, ${theme.glow}`, // Adding the inspectionInsetGlow from the snippet to the surface
      }}>
        
        <div style={{
           width: "100%", 
           display: "flex",
           flexDirection: "column",
           alignItems: "center",
        }}>
          {!image && (
            <div style={styles.header}>
              <h1 style={{...styles.title, color: theme.colors.text}}>Live Interactive Console</h1>
              <p style={{...styles.subtitle, color: theme.colors.muted}}>
                Upload a low-quality image and watch the intelligence pipeline progressively upscale, clean, and color-correct it in real-time.
              </p>
            </div>
          )}

          <div style={styles.interactiveArea}>
          {!image && (
            <UploadBox
              setImage={setImage}
              setProcessing={setProcessing}
              setResult={setResult}
            />
          )}

          {image && !activeStepImage && processing && (
            <div style={{
              ...styles.loadingContainer,
              background: theme.colors.surface,
              border: `1px dashed ${theme.colors.border}`
            }}>
              <Loader />
              <p style={{ marginTop: "16px", color: theme.colors.muted }}>Initializing stream...</p>
            </div>
          )}

          {image && activeStepImage && (
            <div className="card-animated window-glow" style={{ width: "100%", borderRadius: "16px" }}>
              <ImageSlider 
                before={displayBefore} 
                after={activeStepImage} 
                allSteps={result?.steps} 
                activeStepKey={activeStepKey} 
                onClose={handleReset}
                processing={processing}
              />
              
              {processing && (
                <div style={{
                  ...styles.processingPill,
                  background: `${theme.colors.primary}15`,
                  border: `1px solid ${theme.colors.primary}30`,
                  color: theme.colors.primary,
                }}>
                  <div className="pulse-dot"></div>
                  Generating next stage...
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>

      {/* --- RIGHT PANEL --- */}
      {showPipeline && (
        <aside style={{...styles.rightPanel, borderLeft: `1px solid ${theme.colors.borderSoft}`}}>
          <ProcessingHistory 
            result={result} 
            selectedStep={selectedStep} 
            onStepClick={setSelectedStep} 
          />
        </aside>
      )}

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
    maxWidth: "1000px", // widened for premium stage feel
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  loadingContainer: {
    width: "100%",
    height: "400px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "24px",
  },
  processingPill: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    marginTop: "24px",
    padding: "10px 20px",
    borderRadius: "30px",
    fontSize: "14px",
    fontWeight: "500",
    width: "fit-content",
    margin: "24px auto 0",
  },
  rightPanel: {
    width: "350px",
    minWidth: "350px",
    height: "100%",
  },
};

export default Enhancement;