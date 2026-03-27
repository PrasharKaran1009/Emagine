import cv2

def gaussian_blur(image, kernel_size=(5, 5)):
    """
    Apply Gaussian Blur to reduce noise

    Args:
        image: input image
        kernel_size: size of blur kernel (must be odd numbers)

    Returns:
        Blurred image
    """
    blurred = cv2.GaussianBlur(image, kernel_size, 0)
    return blurred