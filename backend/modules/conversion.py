import cv2
import numpy as np

def to_grayscale_and_merge(image):
    # Convert to HSV — S is saturation, V is brightness
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    
    h, s, v = cv2.split(hsv)
    
    # Equalize only the V (brightness) channel
    v_eq = cv2.equalizeHist(v)
    
    # Merge back with original H and S (colors untouched)
    hsv_eq = cv2.merge([h, s, v_eq])
    
    result = cv2.cvtColor(hsv_eq, cv2.COLOR_HSV2BGR)
    return result