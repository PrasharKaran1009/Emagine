import { Link, useLocation } from "react-router-dom";
import { theme } from "../theme/theme";

function Navbar() {
  const location = useLocation();

  const navItemStyle = (path) => ({
    color: location.pathname === path ? theme.colors.primary : theme.colors.muted,
    fontWeight: location.pathname === path ? "600" : "400",
  });

  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>
        E<span style={{ color: theme.colors.primary }}>magine</span>
      </div>

      <div style={styles.links}>
        <Link to="/" style={navItemStyle("/")}>Enhance</Link>
        <Link to="/encode" style={navItemStyle("/encode")}>Encode</Link>
        <Link to="/decode" style={navItemStyle("/decode")}>Decode</Link>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 40px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    background: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(10px)",
  },
  logo: {
    fontSize: "24px",
    fontWeight: "700",
    letterSpacing: "1px",
  },
  links: {
    display: "flex",
    gap: "30px",
    fontSize: "16px",
  },
};

export default Navbar;