import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Enhancement from "./pages/Enhancement";
import Encode from "./pages/Encode";
import Decode from "./pages/Decode";
import { theme } from "./theme/theme";

function App() {
  return (
    <Router>
      <div
        style={{
          minHeight: "100vh",
          background: theme.colors.background,
          color: theme.colors.text,
          fontFamily: "Inter, sans-serif", // ✅ fixed (no theme.fonts)
        }}
      >
        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <main
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "20px 24px",
          }}
        >
          <Routes>
            <Route path="/" element={<Enhancement />} />
            <Route path="/encode" element={<Encode />} />
            <Route path="/decode" element={<Decode />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;