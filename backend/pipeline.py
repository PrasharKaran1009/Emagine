from modules.conversion import to_grayscale_and_merge
from modules.smoothing import denoise_image
from modules.resize import enhance_resolution
from modules.sharpening import sharpen_image
from modules.color_enhance import boost_saturation, adjust_brightness_contrast

def process_pipeline(image):
    results = {}
    
    image = denoise_image(image)
    results["1_denoise"] = image.copy()

    image = to_grayscale_and_merge(image)
    results["2_histogram"] = image.copy()

    image = enhance_resolution(image, scale=4)
    results["3_upscale"] = image.copy()

    image = boost_saturation(image)
    image = adjust_brightness_contrast(image)
    results["4_color_correction"] = image.copy()

    image = sharpen_image(image)
    results["5_final"] = image.copy()

    return image, results
