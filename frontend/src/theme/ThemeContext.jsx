import React, { createContext, useState, useContext } from "react";

export const lightTheme = {
  colors: {
    primary: "#6366f1",
    secondary: "#8b5cf6",
    background: "#f8fafc",
    surface: "#ffffff",
    surfaceHover: "rgba(0, 0, 0, 0.05)",
    surfaceGlass: "rgba(255, 255, 255, 0.9)",
    border: "rgba(0, 0, 0, 0.1)",
    borderSoft: "rgba(0, 0, 0, 0.05)",
    text: "#0f172a",
    muted: "#64748b",
    error: "#ef4444",
    success: "#10b981",
  },
  glow: "0 4px 30px rgba(99, 102, 241, 0.1), 0 1px 5px rgba(0,0,0,0.05)",
};

export const darkTheme = {
  colors: {
    primary: "#818cf8",
    secondary: "#a78bfa",
    background: "#08080a",
    surface: "rgba(20, 20, 26, 0.6)",
    surfaceHover: "rgba(255, 255, 255, 0.08)",
    surfaceGlass: "rgba(12, 12, 16, 0.8)",
    border: "rgba(255, 255, 255, 0.1)",
    borderSoft: "rgba(255, 255, 255, 0.04)",
    text: "#ffffff",
    muted: "#9ca3af",
    error: "#f87171",
    success: "#34d399",
  },
  glow: "0 0 40px rgba(129, 140, 248, 0.1), 0 0 15px rgba(255,255,255,0.02)",
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => setIsDark(!isDark);
  
  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
