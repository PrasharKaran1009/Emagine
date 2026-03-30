import cv2
import numpy as np

def sharpen_image(image, strength=1.5):
    """
    Unsharp Masking:
    Produces natural sharpening without amplifying noise too much
    """

    if image is None:
        return None

    # Blur image (low-pass filter)
    blurred = cv2.GaussianBlur(image, (0, 0), sigmaX=1.0, sigmaY=1.0)

    # Combine original + detail
    sharpened = cv2.addWeighted(
        image, 
        1 + strength,   # original weight
        blurred, 
        -strength,      # subtract blur
        0
    )

    return sharpened