from modules.conversion import to_grayscale_and_merge
from modules.smoothing import gaussian_blur
from modules.resize import resize_image
from modules.sharpening import sharpen_image
from modules.color_enhance import boost_saturation, adjust_brightness_contrast

def process_pipeline(image):
    # Step 1: Histogram EQ (contrast fix, color preserved)
    image = to_grayscale_and_merge(image)

    # Step 2: Richer colors
    image = boost_saturation(image)

    # Step 3: Brightness & contrast pop
    image = adjust_brightness_contrast(image)

    # Step 4: Smooth noise
    image = gaussian_blur(image)

    # Step 5: Sharpen edges
    image = sharpen_image(image)

    # Step 6: Upscale last
    image = resize_image(image, scale=2)

    return image