function PipelineSteps({ steps }) {
  const stepOrder = [
    "1_denoise",
    "2_upscale",
    "3_clahe",
    "4_color",
    "5_final",
  ];

  const stepLabels = {
    "1_denoise": "1. Denoise",
    "2_upscale": "2. Upscale",
    "3_clahe": "3. CLAHE",
    "4_color": "4. Color",
    "5_final": "5. Final",
  };

  return (
    <div style={styles.pipelineContainer}>
      <h2 style={styles.title}>Processing Pipeline</h2>
      <div style={styles.stepsGrid}>
        {stepOrder.map((stepKey) => (
          <div key={stepKey} style={styles.stepCard}>
            <div style={styles.stepLabel}>
              {stepLabels[stepKey]}
            </div>
            {steps[stepKey] ? (
              <img
                src={steps[stepKey]}
                alt={stepKey}
                style={styles.stepImage}
              />
            ) : (
              <div style={styles.placeholder}>Loading...</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  pipelineContainer: {
    marginTop: "40px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    marginBottom: "24px",
    color: "#ffffff",
  },
  stepsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
  },
  stepCard: {
    borderRadius: "12px",
    background: "rgba(255, 255, 255, 0.02)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
  },
  stepLabel: {
    padding: "12px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#6366f1",
    background: "rgba(99, 102, 241, 0.08)",
  },
  stepImage: {
    width: "100%",
    height: "auto",
    display: "block",
  },
  placeholder: {
    width: "100%",
    aspectRatio: "1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#9ca3af",
  },
};

export default PipelineSteps;
