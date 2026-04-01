import cv2
import numpy as np


def analyze_image(image):
    if image is None:
        return {
            "brightness": 0.0,
            "noise": 0.0,
            "sharpness": 0.0
        }

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    brightness = np.mean(gray)

    # Sharpness detection: Laplacian variance
    laplacian = cv2.Laplacian(gray, cv2.CV_64F)
    sharpness = np.var(laplacian)

    # Noise estimation: residual of median blur (strong edge-preserving smoothing)
    blurred = cv2.medianBlur(gray, 3)
    noise_map = (gray.astype(np.float32) - blurred.astype(np.float32)) ** 2
    noise = np.mean(noise_map)

    return {
        "brightness": float(brightness),
        "noise": float(noise),
        "sharpness": float(sharpness)
    }