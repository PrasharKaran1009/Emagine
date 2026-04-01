import React, { createContext, useState, useContext } from "react";

export const lightTheme = {
  colors: {
    primary: "#00B36B", // emerald
    secondary: "#00995C", 
    background: "#F4F6F4", 
    surface: "#FFFFFF",
    surfaceHover: "#EDEFF0",
    surfaceGlass: "rgba(255, 255, 255, 0.85)",
    border: "rgba(0,150,90,0.15)",
    borderSoft: "rgba(0,150,90,0.08)",
    text: "#1A1A1A",
    muted: "#5A5A5A",
    error: "#DC2626",
    success: "#10b981",
  },
  glow: "0 8px 30px rgba(0, 0, 0, 0.04), 0 0 20px rgba(0, 179, 107, 0.15)", // emerald ambient bounce
};

export const darkTheme = {
  colors: {
    primary: "#D6CDBF", // champagne / gold
    secondary: "#E7DFD2",
    background: "#080808", // ultra deep black
    surface: "#121212", // pure black interface
    surfaceHover: "#1A1A1A", 
    surfaceGlass: "rgba(18, 18, 18, 0.8)",
    border: "rgba(255, 255, 255, 0.06)", 
    borderSoft: "rgba(255, 255, 255, 0.03)",
    text: "#E8E6E3",
    muted: "#8A8A8A",
    error: "#F04444",
    success: "#34d399",
  },
  glow: "0 15px 40px rgba(0, 0, 0, 0.4), 0 0 24px rgba(214, 205, 191, 0.08)", // champagne ambient tint
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
