import { useState } from 'react'
import './App.css'

function App() {
  const [originalImage, setOriginalImage] = useState(null)
  const [processedImage, setProcessedImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setOriginalImage(URL.createObjectURL(file))
    setProcessedImage(null)
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('http://localhost:8000/process', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to process image')
      }

      const blob = await response.blob()
      setProcessedImage(URL.createObjectURL(blob))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setOriginalImage(null)
    setProcessedImage(null)
    setLoading(false)
    setError(null)
  }

  return (
    <div className="app-wrapper">
      <nav className="navbar">
        <div className="logo">
          E<span>magine</span>
        </div>
        <div className="nav-links">
          {/* Add nav links if needed */}
        </div>
      </nav>

      <div className="container">
        {!originalImage && !loading ? (
          <>
            <h1 className="hero-title">Enhance Image Quality</h1>
            <p className="hero-subtitle">Upscale, sharpen, and improve colors of your images for free.</p>
            
            <div className="main-tool-area">
              <div className="upload-btn-wrapper">
                <button className="btn-primary">Select Image</button>
                <input 
                  type="file" 
                  className="file-input" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                />
              </div>
              <p style={{marginTop: '20px', color: '#666'}}>or drop image here</p>
            </div>

            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">✨</div>
                <h3>AI Sharpening</h3>
                <p>Use Laplacian kernels to bring out hidden details in blurry photos.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🎨</div>
                <h3>Color Boost</h3>
                <p>Advanced CLAHE technology for perfect contrast and vibrant colors.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🔍</div>
                <h3>Upscale</h3>
                <p>Increase resolution using an image enhancement upscaler.</p>
              </div>
            </div>
          </>
        ) : (
          <div className="main-tool-area" style={{padding: '40px'}}>
            {loading ? (
              <div className="loader-container">
                <div className="spinner"></div>
                <h2>Processing your image...</h2>
                <p>Applying DIP algorithms to enhance quality</p>
              </div>
            ) : (
              <div className="result-container">
                <div className="image-preview-grid">
                  <div className="image-box">
                    <h4>Original Image</h4>
                    <div className="image-wrapper">
                      <img src={originalImage} alt="Original" />
                    </div>
                  </div>
                  <div className="image-box">
                    <h4>Enhanced Result</h4>
                    <div className="image-wrapper">
                      <img src={processedImage} alt="Processed" />
                    </div>
                  </div>
                </div>
                
                <div className="action-bar">
                  <a 
                    href={processedImage} 
                    download="enhanced-image.jpg" 
                    className="btn-primary"
                    style={{padding: '12px 32px', fontSize: '18px'}}
                  >
                    Download Image
                  </a>
                  <button className="btn-secondary" onClick={reset}>
                    Start Over
                  </button>
                </div>
              </div>
            )}
            {error && <p className="error-message">{error}</p>}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
