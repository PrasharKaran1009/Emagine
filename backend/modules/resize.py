import cv2
import os
import subprocess
import tempfile

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

    model_name = os.getenv("EMAGINE_REALESRGAN_MODEL_NAME", "realesr-general-x4v3")
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
            "-i",
            input_path,
            "-o",
            output_path,
            "-s",
            str(requested_scale),
            "-n",
            model_name,
            "-t",
            str(tile_size),
            "-f",
            "png",
        ]

        if model_dir:
            cmd.extend(["-m", model_dir])

        if gpu_id is not None and str(gpu_id).strip() != "":
            cmd.extend(["-g", str(gpu_id)])

        try:
            subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        except Exception:
            return None

        if not os.path.exists(output_path):
            return None

        upscaled = cv2.imread(output_path, cv2.IMREAD_COLOR)
        return upscaled

def enhance_resolution(image, scale=2, model_path=None, model_name="espcn"):
    """
    Upscale image using a super-resolution model when available, otherwise fall back to bicubic resize.
    """
    if image is None:
        return None

    env_model_path = os.getenv("EMAGINE_SR_MODEL")
    resolved_model_path = env_model_path or model_path
    resolved_model_name = os.getenv("EMAGINE_SR_MODEL_NAME", model_name)

    if not resolved_model_path:
        default_model_path = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "models", f"sr_x{int(scale)}.pb")
        )
        if os.path.exists(default_model_path):
            resolved_model_path = default_model_path

    if resolved_model_path and os.path.exists(resolved_model_path):
        try:
            dnn_superres = cv2.dnn_superres.DnnSuperResImpl_create()
            dnn_superres.readModel(resolved_model_path)
            dnn_superres.setModel(resolved_model_name, int(scale))
            return dnn_superres.upsample(image)
        except Exception:
            pass

    upscaled = _upscale_with_realesrgan_ncnn_vulkan(image, scale=scale)
    if upscaled is not None:
        return upscaled

    return resize_image(image, scale=scale)
