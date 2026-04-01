from enhancement.modules.conversion import apply_clahe_hsv
from enhancement.modules.smoothing import denoise_image
from enhancement.modules.resize import enhance_resolution
from enhancement.modules.sharpening import sharpen_image
from enhancement.modules.color_enhance import boost_saturation, adjust_brightness_contrast
from enhancement.utils import config
from enhancement.utils.analyzer import analyze_image


def process_pipeline(image):
    if image is None:
        raise ValueError("process_pipeline requires a valid image array")

    results = {}

    # 🔥 Analyze image FIRST
    analysis = analyze_image(image)
    print("Analysis:", analysis)

    brightness = analysis["brightness"]
    noise = analysis["noise"]

    # =========================
    # 1. Adaptive Denoise
    # =========================
    if noise < 50:
        strength = 3
    elif noise < 150:
        strength = 5
    else:
        strength = 8

    print("Denoise strength:", strength)

    image = denoise_image(image, strength=strength)
    results["1_denoise"] = image.copy()

    # =========================
    # 2. Upscale
    # =========================
    image = enhance_resolution(image, scale=config.UPSCALE_FACTOR)
    results["2_upscale"] = image.copy()

    # =========================
    # 3. Adaptive CLAHE
    # =========================
    if brightness < 80:
        clip = 2.5
    elif brightness < 150:
        clip = 1.8
    else:
        clip = 1.2

    print("CLAHE clip:", clip)

    image = apply_clahe_hsv(
        image,
        clip_limit=clip,
        tile_size=config.CLAHE_TILE_SIZE
    )
    results["3_clahe"] = image.copy()

    # =========================
    # 4. Adaptive Color
    # =========================
    if brightness < 80:
        sat = 1.2
    elif brightness > 180:
        sat = 1.05
    else:
        sat = 1.1

    print("Saturation:", sat)

    image = boost_saturation(image, scale=sat)

    image = adjust_brightness_contrast(
        image,
        brightness=config.BRIGHTNESS,
        contrast=config.CONTRAST
    )
    results["4_color"] = image.copy()

    # =========================
    # 5. Sharpen
    # =========================
    sharpness = analysis["sharpness"]

    if sharpness < 50:
        sharp_strength = 2.0   # very blurry
    elif sharpness < 150:
        sharp_strength = 1.5
    else:
        sharp_strength = 1.0   # already sharp → don't overdo

    print("Sharpen strength:", sharp_strength)

    image = sharpen_image(image, strength=sharp_strength)
    results["5_final"] = image.copy()

    return image, results


def process_pipeline_stream(image):
    """
    Generator version of process_pipeline.
    Yields (step_name, current_image) after each pipeline step.
    """
    if image is None:
        raise ValueError("process_pipeline requires a valid image array")

    # Analyze
    analysis = analyze_image(image)
    brightness = analysis["brightness"]
    noise = analysis["noise"]

    # 1. Adaptive Denoise
    strength = 3 if noise < 50 else 5 if noise < 150 else 8
    image = denoise_image(image, strength=strength)
    yield ("1_denoise", image.copy())

    # 2. Upscale
    image = enhance_resolution(image, scale=config.UPSCALE_FACTOR)
    yield ("2_upscale", image.copy())

    # 3. Adaptive CLAHE
    clip = 2.5 if brightness < 80 else 1.8 if brightness < 150 else 1.2
    image = apply_clahe_hsv(image, clip_limit=clip, tile_size=config.CLAHE_TILE_SIZE)
    yield ("3_clahe", image.copy())

    # 4. Adaptive Color
    sat = 1.2 if brightness < 80 else 1.05 if brightness > 180 else 1.1
    image = boost_saturation(image, scale=sat)
    image = adjust_brightness_contrast(image, brightness=config.BRIGHTNESS, contrast=config.CONTRAST)
    yield ("4_color", image.copy())

    # 5. Sharpen
    sharpness = analysis["sharpness"]
    sharp_strength = 2.0 if sharpness < 50 else 1.5 if sharpness < 150 else 1.0
    image = sharpen_image(image, strength=sharp_strength)
    yield ("5_final", image.copy())