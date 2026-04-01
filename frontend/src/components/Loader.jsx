import { theme } from "../theme/theme";

function Loader() {
  return (
    <div
      style={{
        padding: "30px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
      }}
    >
      {/* Spinner */}
      <div
        style={{
          width: "40px",
          height: "40px",
          border: "4px solid rgba(255,255,255,0.1)",
          borderTop: `4px solid ${theme.colors.primary}`,
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />

      <p style={{ color: "#9ca3af", fontSize: "14px" }}>
        Enhancing your image...
      </p>

      {/* Inline keyframes */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

export default Loader;