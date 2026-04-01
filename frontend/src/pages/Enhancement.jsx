import UploadBox from "../components/UploadBox";
import StagePreview from "../components/StagePreview";
import ImageSlider from "../components/ImageSlider";
import Loader from "../components/Loader";
import { useState } from "react";
import { theme } from "../theme/theme";

function Enhancement() {
  const [image, setImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "32px",
      }}
    >
      {/* 🔴 HERO SECTION */}
      <div>
        <h1
          style={{
            fontSize: "42px",
            fontWeight: "700",
            marginBottom: "10px",
          }}
        >
          AI Image Enhancement
        </h1>

        <p
          style={{
            color: theme.colors.muted,
            fontSize: "16px",
            maxWidth: "600px",
          }}
        >
          Upload an image and experience a real-time enhancement pipeline —
          denoising, upscaling, contrast correction, and color refinement.
        </p>
      </div>

      {/* 🔴 UPLOAD SECTION */}
      <UploadBox
        setImage={setImage}
        setProcessing={setProcessing}
        setResult={setResult}
      />

      {/* 🔴 PROCESSING STATE */}
      {processing && <Loader />}

      {/* 🔴 PIPELINE PREVIEW */}
      {result && (
        <div>
          <h2 style={{ marginBottom: "16px" }}>Processing Pipeline</h2>
          <StagePreview result={result} />
        </div>
      )}

      {/* 🔴 BEFORE / AFTER */}
      {result && (
        <div>
          <h2 style={{ marginBottom: "16px" }}>Final Comparison</h2>
          <ImageSlider before={image} after={result.final} />
        </div>
      )}
    </div>
  );
}

export default Enhancement;