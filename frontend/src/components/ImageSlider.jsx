import { useState, useRef, useCallback, useEffect } from "react";


function ImageSlider({ before, after }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const updatePosition = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(2, Math.min(98, percentage)));
  }, []);

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;
      updatePosition(e.clientX);
    },
    [isDragging, updatePosition]
  );

  const handleTouchMove = useCallback(
    (e) => {
      if (!isDragging) return;
      updatePosition(e.touches[0].clientX);
    },
    [isDragging, updatePosition]
  );

  const stopDragging = useCallback(() => setIsDragging(false), []);

  const handleDownload = useCallback(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const link = document.createElement("a");
      link.download = "after.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = after;
  }, [after]);

  if (!before || !after) {
    return <div style={styles.loading}>Loading comparison...</div>;
  }

  return (
    <div style={styles.wrapper}>
      <div
        ref={containerRef}
        style={styles.container}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDragging}
        onMouseLeave={stopDragging}
        onTouchMove={handleTouchMove}
        onTouchEnd={stopDragging}
      >
        {/* AFTER image — full background */}
        <img src={after} alt="After" style={styles.image} draggable={false} />

        {/* BEFORE overlay — clips at slider position */}
        <div
          style={{
            ...styles.beforeOverlay,
            width: `${sliderPosition}%`,
          }}
        >
          <img
            src={before}
            alt="Before"
            style={{ ...styles.beforeImage, width: containerWidth > 0 ? `${containerWidth}px` : "100vw" }}
            draggable={false}
          />
        </div>

        {/* Divider line */}
        <div
          style={{
            ...styles.divider,
            left: `${sliderPosition}%`,
          }}
        />

        {/* Drag handle */}
        <div
          style={{
            ...styles.handle,
            left: `${sliderPosition}%`,
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onTouchStart={() => setIsDragging(true)}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 5L2 10l5 5M13 5l5 5-5 5"
              stroke="#555"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Labels */}
        <span style={{ ...styles.label, left: "16px" }}>Before</span>
        <span style={{ ...styles.label, right: "16px" }}>After</span>
      </div>

      {/* Download button */}
      <div style={styles.downloadRow}>
        <button style={styles.downloadBtn} onClick={handleDownload}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ flexShrink: 0 }}
          >
            <path
              d="M8 1v9M4.5 6.5L8 10l3.5-3.5M2 12h12"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Download result
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    position: "relative",
    width: "100%",
    maxWidth: "900px",
    margin: "0 auto",
    userSelect: "none",
  },

  container: {
    position: "relative",
    width: "100%",
    aspectRatio: "16 / 9",
    overflow: "hidden",
    borderRadius: "16px",
    cursor: "col-resize",
  },

  loading: {
    padding: "2rem",
    textAlign: "center",
    color: "#888",
  },

  // After image — sits as the base layer, full size, cover
  image: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    pointerEvents: "none",
    display: "block",
  },

  // Clip container — shrinks/grows horizontally
  beforeOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    overflow: "hidden",
  },

  // Before image — must always be full container width,
  // NOT the clip div's width, so it doesn't squish
  beforeImage: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    objectFit: "cover",
    pointerEvents: "none",
    display: "block",
  },

  divider: {
    position: "absolute",
    top: 0,
    height: "100%",
    width: "2px",
    background: "#ffffff",
    transform: "translateX(-50%)",
    pointerEvents: "none",
    zIndex: 5,
  },

  handle: {
    position: "absolute",
    top: "50%",
    transform: "translate(-50%, -50%)",
    width: "44px",
    height: "44px",
    background: "#ffffff",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "grab",
    boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
    zIndex: 10,
  },

  label: {
    position: "absolute",
    bottom: "14px",
    background: "rgba(0,0,0,0.45)",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "500",
    padding: "4px 12px",
    borderRadius: "20px",
    pointerEvents: "none",
    zIndex: 6,
    backdropFilter: "blur(4px)",
  },

  downloadRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "12px",
  },

  downloadBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 18px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#ffffff",
    background: "#111111",
    border: "none",
    borderRadius: "20px",
    cursor: "pointer",
    transition: "background 0.15s ease",
  },
};

export default ImageSlider;