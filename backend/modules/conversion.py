import cv2
import numpy as np

def to_grayscale_and_merge(image):
    # Convert to HSV — S is saturation, V is brightness
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    
    h, s, v = cv2.split(hsv)
    
    # Use CLAHE (Contrast Limited Adaptive Histogram Equalization)
    # This is better than global equalization as it works on small tiles
    # to avoid over-amplifying noise in homogeneous areas.
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    v_eq = clahe.apply(v)
    
    # Merge back with original H and S (colors untouched)
    hsv_eq = cv2.merge([h, s, v_eq])
    
    result = cv2.cvtColor(hsv_eq, cv2.COLOR_HSV2BGR)
    return result