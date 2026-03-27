import cv2

def resize_image(image, scale=2):
    """
    Resize image by scaling factor

    Args:
        image: input image
        scale: scaling factor (default = 2x)

    Returns:
        Resized image
    """
    height, width = image.shape[:2]

    new_width = int(width * scale)
    new_height = int(height * scale)

    resized = cv2.resize(
        image,
        (new_width, new_height),
        interpolation=cv2.INTER_CUBIC  # best for upscaling
    )

    return resized