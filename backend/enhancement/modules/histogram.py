import cv2

def apply_histogram_equalization(image):
    """
    Apply Histogram Equalization to enhance contrast

    Args:
        image: grayscale image

    Returns:
        Contrast enhanced image
    """
    equalized = cv2.equalizeHist(image)
    return equalized