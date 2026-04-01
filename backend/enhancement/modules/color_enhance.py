import cv2
import numpy as np

def boost_saturation(image, scale=1.3):
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV).astype("float32")
    h, s, v = cv2.split(hsv)
    s = np.clip(s * scale, 0, 255)
    hsv = cv2.merge([h, s, v])
    return cv2.cvtColor(hsv.astype("uint8"), cv2.COLOR_HSV2BGR)

def adjust_brightness_contrast(image, brightness=5, contrast=1.1):
    # reduced from brightness=10, contrast=1.2
    result = cv2.convertScaleAbs(image, alpha=contrast, beta=brightness)
    return result
