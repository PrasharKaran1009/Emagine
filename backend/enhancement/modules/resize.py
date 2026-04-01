import cv2
import os
import subprocess
import tempfile
from enhancement.utils import config


def resize_image(image, scale=2):
    """
    Resize image by scaling factor (fallback only)
    """
    height, width = image.shape[:2]

    new_width = int(width * scale)
    new_height = int(height * scale)

    resized = cv2.resize(
        image,
        (new_width, new_height),
        interpolation=cv2.INTER_CUBIC
    )

    return resized


def _upscale_with_realesrgan_ncnn_vulkan(image, scale=2):
    exe_path = os.getenv("EMAGINE_REALESRGAN_EXE")
    model_dir = os.getenv("EMAGINE_REALESRGAN_MODEL_DIR")

    if not exe_path:
        backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        candidates = [
            os.path.join(backend_dir, "tools", "realesrgan", "realesrgan-ncnn-vulkan.exe"),
            os.path.join(backend_dir, "realesrgan", "realesrgan-ncnn-vulkan.exe"),
        ]
        for candidate in candidates:
            if os.path.exists(candidate):
                exe_path = candidate
                break

    if not model_dir:
        backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        candidates = [
            os.path.join(backend_dir, "tools", "realesrgan", "models"),
            os.path.join(backend_dir, "realesrgan", "models"),
        ]
        for candidate in candidates:
            if os.path.isdir(candidate):
                model_dir = candidate
                break

    if not exe_path or not os.path.exists(exe_path):
        return None

    model_name = "RealESRGAN_General_x4_v3"
    tile_size = os.getenv("EMAGINE_REALESRGAN_TILE", "0")
    gpu_id = os.getenv("EMAGINE_REALESRGAN_GPU")

    requested_scale = int(scale)
    if requested_scale not in (2, 3, 4):
        requested_scale = 2

    with tempfile.TemporaryDirectory() as tmp_dir:
        input_path = os.path.join(tmp_dir, "input.png")
        output_path = os.path.join(tmp_dir, "output.png")

        if not cv2.imwrite(input_path, image):
            return None

        cmd = [
            exe_path,
            "-i", input_path,
            "-o", output_path,
            "-s", str(requested_scale),
            "-n", model_name,
            "-t", str(tile_size),
            "-f", "png",
        ]

        if model_dir:
            cmd.extend(["-m", model_dir])

        if gpu_id is not None and str(gpu_id).strip() != "":
            cmd.extend(["-g", str(gpu_id)])

        try:
            subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        except Exception as e:
            print("RealESRGAN failed:", str(e))
            return None

        if not os.path.exists(output_path):
            return None

        upscaled = cv2.imread(output_path, cv2.IMREAD_COLOR)
        return upscaled


def enhance_resolution(image, scale=2):
    if image is None:
        return None

    height, width = image.shape[:2]
    total_pixels = height * width

    # 🔥 Rule 1: Forced CPU mode
    if config.FORCE_CPU_RESIZE:
        print("Forced OpenCV resize")
        return resize_image(image, scale=scale)

    # 🔥 Rule 2: Auto decision
    if config.AUTO_UPSCALE:
        if total_pixels > config.MAX_AI_PIXELS:
            print("Image too large, skipping AI upscale")
            return resize_image(image, scale=scale)

        upscaled = _upscale_with_realesrgan_ncnn_vulkan(image, scale=scale)
        if upscaled is not None:
            print("Using RealESRGAN (auto)")
            return upscaled

        print("AI failed → fallback to OpenCV")
        return resize_image(image, scale=scale)

    # 🔥 Rule 3: Manual mode
    if config.USE_AI_UPSCALE:
        upscaled = _upscale_with_realesrgan_ncnn_vulkan(image, scale=scale)
        if upscaled is not None:
            print("Using RealESRGAN")
            return upscaled

    print("Using OpenCV resize")
    return resize_image(image, scale=scale)