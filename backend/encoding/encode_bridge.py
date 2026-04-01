import os
import uuid
import subprocess
from PIL import Image
from fastapi import HTTPException

# Path to the compiled C++ engine
STEG_BIN = os.path.join(os.path.dirname(__file__), "steg")
if os.name == "nt":
    STEG_BIN += ".exe"

def encode_message(image_path: str, message: str) -> Image.Image:
    """
    Encodes a secret message into an image using the C++ steganography engine.
    """
    tmp_dir = os.path.join(os.path.dirname(__file__), "..", "tmp")
    os.makedirs(tmp_dir, exist_ok=True)
    
    input_bin = os.path.join(tmp_dir, f"input_{uuid.uuid4().hex}.bin")
    output_bin = os.path.join(tmp_dir, f"output_{uuid.uuid4().hex}.bin")

    try:
        # Convert image to flat binary
        img = Image.open(image_path).convert("RGB")
        width, height = img.size
        # Pillow tobytes() gets the raw RGB flat stream.
        with open(input_bin, "wb") as f:
            f.write(img.tobytes())

        # Call C++ engine
        result = subprocess.run(
            [STEG_BIN, "encode", input_bin, output_bin, str(width), str(height), message],
            capture_output=True,
            text=True
        )

        if result.returncode != 0:
            raise HTTPException(status_code=400, detail=result.stderr.strip() or "Unknown error during encoding")

        # Reconstruct image from output binary
        with open(output_bin, "rb") as f:
            out_bytes = f.read()
            
        out_img = Image.frombytes("RGB", (width, height), out_bytes)
        return out_img

    finally:
        # Cleanup
        if os.path.exists(input_bin):
            os.remove(input_bin)
        if os.path.exists(output_bin):
            os.remove(output_bin)
