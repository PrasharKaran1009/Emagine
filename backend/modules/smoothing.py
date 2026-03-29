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

def denoise_image(image, strength=10):
    """
    Denoise a color image using Non-local Means.
    """
    if image is None:
        return None

    if image.dtype != "uint8":
        image = image.clip(0, 255).astype("uint8")

    return cv2.fastNlMeansDenoisingColored(
        image,
        None,
        strength,
        strength,
        7,
        21,
    )
