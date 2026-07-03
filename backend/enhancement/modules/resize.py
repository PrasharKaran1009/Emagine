import cv2
import os
import subprocess
import tempfile
from enhancement.utils import config


def resize_image(image, scale=2):
    """
    Plain bicubic resize. Safe CPU fallback and final guarantee that the
    pipeline always returns an upscaled image.
    """
    height, width = image.shape[:2]
    new_width = int(width * scale)
    new_height = int(height * scale)
    return cv2.resize(
        image,
        (new_width, new_height),
        interpolation=cv2.INTER_CUBIC,
    )


def cap_input_size(image, max_side=None):
    """
    Downscale very large inputs so no downstream step overruns the memory /
    request-time budget of a small CPU host. Preserves aspect ratio and returns
    the image untouched when it is already within bounds.
    """
    if image is None:
        return image

    if max_side is None:
        max_side = getattr(config, "MAX_INPUT_SIDE", 1000)
    if not max_side or max_side <= 0:
        return image

    h, w = image.shape[:2]
    longest = max(h, w)
    if longest <= max_side:
        return image

    ratio = max_side / float(longest)
    new_w = max(1, int(round(w * ratio)))
    new_h = max(1, int(round(h * ratio)))
    print(f"Capping input {w}x{h} -> {new_w}x{new_h} (max_side={max_side})")
    return cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_AREA)


# ---------------------------------------------------------------------------
# CPU deep-learning super-resolution (OpenCV dnn_superres).
# Real learned upscaling with no GPU/Vulkan required -> runs fine on Render.
# ---------------------------------------------------------------------------
_SR_CACHE = {}


def _superres_model_path(model, scale):
    base = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "tools", "dnn_superres")
    )
    return os.path.join(base, f"{model.upper()}_x{scale}.pb")


def _get_superres(model, scale):
    """Build (and cache) a DnnSuperResImpl for the given model/scale, or None."""
    key = (model, scale)
    if key in _SR_CACHE:
        return _SR_CACHE[key]

    sr = None
    if hasattr(cv2, "dnn_superres"):
        path = _superres_model_path(model, scale)
        if os.path.exists(path):
            try:
                sr = cv2.dnn_superres.DnnSuperResImpl_create()
                sr.readModel(path)
                sr.setModel(model.lower(), scale)
            except Exception as e:
                print("DNN super-res init failed:", e)
                sr = None
        else:
            print(f"DNN super-res model missing: {path}")
    else:
        print("cv2.dnn_superres unavailable (need opencv-contrib-python-headless)")

    _SR_CACHE[key] = sr
    return sr


def _upscale_with_dnn_superres(image, scale=2):
    scale = int(scale)
    if scale not in (2, 3, 4):
        scale = 2
    model = getattr(config, "SR_MODEL", "espcn").lower()
    sr = _get_superres(model, scale)
    if sr is None:
        return None
    try:
        return sr.upsample(image)
    except Exception as e:
        print("DNN super-res upsample failed:", e)
        return None


# ---------------------------------------------------------------------------
# Real-ESRGAN (ncnn / Vulkan) — GPU only, optional local path.
# ---------------------------------------------------------------------------
def _upscale_with_realesrgan_ncnn_vulkan(image, scale=2):
    exe_path = os.getenv("EMAGINE_REALESRGAN_EXE")
    model_dir = os.getenv("EMAGINE_REALESRGAN_MODEL_DIR")

    backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

    if not exe_path:
        candidates = [
            os.path.join(backend_dir, "tools", "realesrgan", "realesrgan-ncnn-vulkan"),
            os.path.join(backend_dir, "tools", "realesrgan", "realesrgan-ncnn-vulkan.exe"),
            os.path.join(backend_dir, "realesrgan", "realesrgan-ncnn-vulkan"),
        ]
        for candidate in candidates:
            if os.path.exists(candidate):
                exe_path = candidate
                break

    if not model_dir:
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

    # Must match the shipped model files (realesrgan-x4plus.param / .bin).
    model_name = os.getenv("EMAGINE_REALESRGAN_MODEL", "realesrgan-x4plus")
    tile_size = os.getenv("EMAGINE_REALESRGAN_TILE", "0")
    gpu_id = os.getenv("EMAGINE_REALESRGAN_GPU")

    requested_scale = int(scale)
    if requested_scale not in (2, 3, 4):
        requested_scale = 4

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
            # timeout guards against the Vulkan binary hanging on a host with no
            # GPU/driver instead of exiting cleanly.
            subprocess.run(
                cmd,
                check=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                timeout=120,
            )
        except Exception as e:
            print("RealESRGAN failed:", str(e))
            return None

        if not os.path.exists(output_path):
            return None

        return cv2.imread(output_path, cv2.IMREAD_COLOR)


def enhance_resolution(image, scale=2):
    if image is None:
        return None

    # Hard override: plain CPU bicubic, skip every model path.
    if config.FORCE_CPU_RESIZE:
        print("Forced OpenCV bicubic resize")
        return resize_image(image, scale=scale)

    # Preferred: CPU deep-learning super-resolution (Render-safe).
    if getattr(config, "USE_DNN_SUPERRES", True):
        upscaled = _upscale_with_dnn_superres(image, scale=scale)
        if upscaled is not None:
            print(f"Using DNN super-res ({getattr(config, 'SR_MODEL', 'espcn')} x{scale})")
            return upscaled
        print("DNN super-res unavailable -> trying next option")

    # Optional: Real-ESRGAN (GPU/Vulkan), only when explicitly enabled.
    if config.USE_AI_UPSCALE:
        height, width = image.shape[:2]
        if height * width <= config.MAX_AI_PIXELS:
            upscaled = _upscale_with_realesrgan_ncnn_vulkan(image, scale=scale)
            if upscaled is not None:
                print("Using RealESRGAN (GPU)")
                return upscaled
        print("RealESRGAN unavailable -> bicubic")

    print("Using OpenCV bicubic resize")
    return resize_image(image, scale=scale)
