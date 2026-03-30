import cv2
import numpy as np

def apply_clahe_hsv(image):
    # Convert to HSV
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    
    h, s, v = cv2.split(hsv)
    
    # CLAHE on brightness channel
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    v_eq = clahe.apply(v)
    
    # Merge back
    hsv_eq = cv2.merge([h, s, v_eq])
    
    result = cv2.cvtColor(hsv_eq, cv2.COLOR_HSV2BGR)
    return result