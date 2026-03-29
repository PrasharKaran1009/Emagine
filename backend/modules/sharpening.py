import cv2
import numpy as np

def sharpen_image(image):
    """
    Laplacian sharpening:
    Use a Laplacian kernel to emphasize the high-frequency components (edges)
    """
    # Define a common sharpening kernel
    # [ 0, -1,  0]
    # [-1,  5, -1]
    # [ 0, -1,  0]
    kernel = np.array([[0, -1, 0],
                      [-1, 5, -1],
                      [0, -1, 0]])

    # Filter the image using the kernel
    sharpened = cv2.filter2D(image, -1, kernel)

    return sharpened