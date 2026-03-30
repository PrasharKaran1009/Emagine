from modules.conversion import apply_clahe_hsv
from modules.smoothing import denoise_image
from modules.resize import enhance_resolution
from modules.sharpening import sharpen_image
from modules.color_enhance import boost_saturation, adjust_brightness_contrast

def process_pipeline(image):
    results = {}

    # 1. Light denoise (preserve details)
    image = denoise_image(image, strength=5)
    results["1_denoise"] = image.copy()

    # 2. Upscale FIRST (critical)
    image = enhance_resolution(image, scale=4)
    results["2_upscale"] = image.copy()

    # 3. CLAHE (after upscale)
    image = apply_clahe_hsv(image)
    results["3_clahe"] = image.copy()

    # 4. Color correction (controlled)
    image = boost_saturation(image, scale=1.1)
    image = adjust_brightness_contrast(image, brightness=5, contrast=1.08)
    results["4_color"] = image.copy()

    # 5. Sharpen (final touch only)
    image = sharpen_image(image)
    results["5_final"] = image.copy()

    return image, results