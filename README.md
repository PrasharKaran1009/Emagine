# Emagine  
### Reimagine Every Image.

---

## 📌 Overview

Emagine is a digital image enhancement system designed to transform low-quality, noisy, or blurred images into clearer and more visually useful outputs using core Digital Image Processing techniques.

It focuses on practical enhancement scenarios such as improving low-light images, reducing noise, and enhancing structural details for better interpretation.

---

## ❗ Problem Statement

Low-quality images—whether due to noise, poor lighting, or low resolution—often fail to convey critical visual information. Existing tools are either too complex or not optimized for fast, modular enhancement.

Emagine aims to provide a simple, efficient, and extensible pipeline to enhance image clarity using foundational DIP techniques.

---

## 🚀 Features

* 📥 Seamless Image Input Processing  
* 🔄 RGB to Grayscale Conversion  
* 📈 Resolution Upscaling for improved clarity  
* 🎚 Contrast Enhancement using Histogram Equalization  
* 🧹 Noise Reduction with Gaussian Filtering  
* ✨ Detail Enhancement via Sharpening  
* ⚡ Modular pipeline for easy extension  

---

## 🧠 Project Workflow

1. Input Image  
2. Convert to Grayscale  
3. Resize (Increase Pixel Count)  
4. Apply Histogram Equalization  
5. Apply Smoothing (Gaussian Blur)  
6. Apply Sharpening  
7. Output Enhanced Image  

---

## 🖼 Results

| Original Image | Enhanced Image |
|---------------|----------------|
| *(Add sample image here)* | *(Add processed output here)* |

---

## 🏗 Project Structure


backend/
│
├── main.py
├── modules/
│ ├── conversion.py
│ ├── resize.py
│ ├── histogram.py
│ ├── smoothing.py
│ ├── sharpening.py


---

## ⚙️ Technologies Used

* Python  
* OpenCV  
* NumPy  

---

## ▶️ How to Run

1. Install dependencies:


pip install opencv-python numpy


2. Run the main file:


python main.py


3. Input image will be processed and output will be saved.

---

## 🎯 Objective

To design a modular and efficient image enhancement pipeline that improves visual clarity and usability of degraded images using core Digital Image Processing techniques.

---

## 🔮 Future Improvements

* Web-based interface using React  
* Real-time parameter tuning (sliders for contrast, sharpness, etc.)  
* Frequency domain processing (FFT-based enhancement)  
* AI-based super-resolution integration  

---

## 👨‍💻 Author

* Karan Prashar

---