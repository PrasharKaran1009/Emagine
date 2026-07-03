import os


def _env_bool(name, default):
    val = os.getenv(name)
    if val is None:
        return default
    return val.strip().lower() in ("1", "true", "yes", "on")


def _env_int(name, default):
    try:
        return int(os.getenv(name))
    except (TypeError, ValueError):
        return default


# =========================
# Input guard
# =========================
# Longest side of the INPUT image. Larger inputs are downscaled first so no
# pipeline step (denoise / upscale / CLAHE / sharpen) blows past the memory and
# request-time budget of a small CPU host like Render's free tier.
MAX_INPUT_SIDE = _env_int("EMAGINE_MAX_INPUT_SIDE", 1000)

# =========================
# Denoise
# =========================
DENOISE_STRENGTH = 5

# =========================
# Upscale
# =========================
# ESPCN ships x2/x3/x4. Default x2 keeps the upscaled image small enough for the
# free tier; bump to 4 (EMAGINE_UPSCALE_FACTOR=4) on a beefier instance.
UPSCALE_FACTOR = _env_int("EMAGINE_UPSCALE_FACTOR", 2)

# CPU deep-learning super-resolution (OpenCV dnn_superres). Works without a GPU,
# so this is the default upscaler in production.
USE_DNN_SUPERRES = _env_bool("EMAGINE_USE_DNN_SR", True)
SR_MODEL = os.getenv("EMAGINE_SR_MODEL", "espcn")  # espcn | fsrcnn | edsr | lapsrn

# =========================
# CLAHE
# =========================
CLAHE_CLIP_LIMIT = 1.5
CLAHE_TILE_SIZE = (8, 8)

# =========================
# Color
# =========================
SATURATION_SCALE = 1.1
BRIGHTNESS = 5
CONTRAST = 1.08

# =========================
# Sharpen
# =========================
SHARPEN_STRENGTH = 1.2

# =========================
# Real-ESRGAN (ncnn / Vulkan) — GPU only
# =========================
# Requires a Vulkan-capable GPU + drivers, which Render web services do NOT have.
# OFF by default; enable only on a local machine with a GPU.
USE_AI_UPSCALE = _env_bool("EMAGINE_USE_REALESRGAN", False)
MAX_AI_PIXELS = _env_int("EMAGINE_MAX_AI_PIXELS", 1_000_000)  # ~1MP

# Force plain bicubic and skip every model path.
FORCE_CPU_RESIZE = _env_bool("EMAGINE_FORCE_CPU_RESIZE", False)
