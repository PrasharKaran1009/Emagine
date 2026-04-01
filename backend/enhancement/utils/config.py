# Denoise
DENOISE_STRENGTH = 5

# Upscale
UPSCALE_FACTOR = 4

# CLAHE
CLAHE_CLIP_LIMIT = 1.5
CLAHE_TILE_SIZE = (8, 8)

# Color
SATURATION_SCALE = 1.1
BRIGHTNESS = 5
CONTRAST = 1.08

# Sharpen
SHARPEN_STRENGTH = 1.2

USE_AI_UPSCALE = True

AUTO_UPSCALE = True

# If image already large, skip AI (avoid overkill)
MAX_AI_PIXELS = 1_000_000   # ~1MP

# Force disable AI if needed
FORCE_CPU_RESIZE = False