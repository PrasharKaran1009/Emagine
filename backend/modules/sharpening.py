import cv2
import numpy as np

def sharpen_image(image):
    """
    High pass sharpening:
    subtract blurred from original and add back (unsharp mask style)
    """
    # Create blurred version
    blurred = cv2.GaussianBlur(image, (5, 5), 0)

    # High pass = original - blurred, added back to original
    sharpened = cv2.addWeighted(image, 1.5, blurred, -0.5, 0)

    return sharpened