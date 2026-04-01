import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../theme/ThemeContext";

function Sidebar({ showPipeline, setShowPipeline }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { theme, isDark, toggleTheme } = useTheme();

  const navItemStyle = (path) => {
    const isActive = location.pathname === path;
    return {
      display: "flex",
      alignItems: "center",
      gap: "16px",
      color: isActive ? theme.colors.text : theme.colors.muted,
      fontWeight: isActive ? "600" : "500",
      textDecoration: "none",
      padding: "12px 14px",
      borderRadius: "14px",
      background: isActive ? theme.colors.surfaceHover : "transparent",
      color: isActive ? theme.colors.primary : theme.colors.muted,
      transition: "all 0.2s ease-in-out",
      justifyContent: collapsed ? "center" : "flex-start",
      cursor: "pointer",
      border: "none",
      width: "100%",
      textAlign: "left",
      fontFamily: "inherit",
    };
  };

  return (
    <aside
      style={{
        ...styles.sidebar,
        width: collapsed ? "100px" : "260px",
        minWidth: collapsed ? "100px" : "260px",
        background: "transparent",
        borderRight: "none",
      }}
    >
      <nav 
        style={{
          ...styles.floatingCard,
          background: theme.colors.surface,
          border: `1px solid ${theme.colors.borderSoft}`,
          boxShadow: theme.glow,
        }}
      >
        <div style={styles.topSection}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              ...styles.collapseBtn,
              background: theme.colors.surfaceHover,
              color: theme.colors.text,
            }}
          >
            {collapsed ? ">" : "<"}
          </button>
        </div>
        <Link to="/" style={navItemStyle("/")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 12h4l3-9 5 18 3-9h5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {!collapsed && <span>Enhancement</span>}
        </Link>
        
        {/* Toggle Pipeline Button (only visible when on enhancement page) */}
        {location.pathname === "/" && (
          <button 
            onClick={() => setShowPipeline(prev => !prev)} 
            style={{...navItemStyle("#"), background: showPipeline ? theme.colors.surfaceHover : "transparent", color: showPipeline ? theme.colors.primary : theme.colors.muted}}
            title="Toggle Timeline"  
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="3" x2="16" y2="21"></line>
            </svg>
            {!collapsed && <span>{showPipeline ? "Hide Timeline" : "Show Timeline"}</span>}
          </button>
        )}
        
        <Link to="/encode" style={navItemStyle("/encode")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
             <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
             <path d="M7 11V7a5 5 0 0110 0v4"></path>
          </svg>
          {!collapsed && <span>Encoding</span>}
        </Link>

        <Link to="/decode" style={navItemStyle("/decode")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
          </svg>
          {!collapsed && <span>Decoding</span>}
        </Link>

        <div style={{ marginTop: "auto", borderTop: `1px solid ${theme.colors.borderSoft}`, paddingTop: "24px" }}>
          <div onClick={toggleTheme} style={navItemStyle("#")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isDark ? (
                <>
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </>
              ) : (
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              )}
            </svg>
            {!collapsed && <span>{isDark ? "Light Mode" : "Dark Mode"}</span>}
          </div>
        </div>
      </nav>
    </aside>
  );
}

const styles = {
  sidebar: {
    height: "100%",
    padding: "24px 16px",
    transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    zIndex: 40,
  },
  floatingCard: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    borderRadius: "24px",
    padding: "16px 12px",
    gap: "8px",
    overflow: "hidden", // hide text overflow when collapsing
    whiteSpace: "nowrap",
  },
  topSection: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "16px",
    paddingBottom: "16px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  collapseBtn: {
    width: "100%",
    maxWidth: "180px",
    height: "40px",
    borderRadius: "12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    transition: "background 0.2s",
    border: "1px solid transparent",
  },
};

export default Sidebar;
