import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Enhancement from "./pages/Enhancement";
import Encode from "./pages/Encode";
import Decode from "./pages/Decode";
import { useTheme } from "./theme/ThemeContext";

function App() {
  const { theme } = useTheme();
  const [showPipeline, setShowPipeline] = useState(true);

  return (
    <Router>
      <div
        style={{
          minHeight: "100vh",
          background: theme.colors.background,
          color: theme.colors.text,
          fontFamily: "Inter, sans-serif",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header />
        
        <div style={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
          <Sidebar showPipeline={showPipeline} setShowPipeline={setShowPipeline} />

          <Routes>
            <Route path="/" element={<Enhancement showPipeline={showPipeline} />} />
            <Route path="/encode" element={<Encode />} />
            <Route path="/decode" element={<Decode />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;