import React from "react";
import { useTheme } from "../theme/ThemeContext";

function Header() {
  const { theme } = useTheme();

  return (
    <header
      style={{
        ...styles.header,
        background: theme.colors.background,
        borderBottom: `1px solid ${theme.colors.border}`,
      }}
    >
      <div style={styles.left}>
        <span style={{ ...styles.brand, color: theme.colors.text }}>EMAGINE</span>
      </div>
      <div style={styles.right}>
        <span style={{ color: theme.colors.muted, fontSize: "12px", fontWeight: "600" }}>v1.0</span>
      </div>
    </header>
  );
}

const styles = {
  header: {
    height: "80px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 32px",
    position: "sticky",
    top: 0,
    zIndex: 50,
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: "18px", // slightly more breathing room
  },
  brand: {
    fontSize: "20px",
    fontWeight: "900",
    letterSpacing: "1px",
    marginTop: "2px", 
  },
  right: {
    display: "flex",
    alignItems: "center",
  },
};

export default Header;
