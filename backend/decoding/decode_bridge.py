import os
import uuid
import subprocess
from PIL import Image
from fastapi import HTTPException

# Path to the compiled C++ engine (up one dir into encoding folder)
STEG_BIN = os.path.join(os.path.dirname(__file__), "..", "encoding", "steg")
if os.name == "nt":
    STEG_BIN += ".exe"

def decode_message(image_path: str) -> str:
    """
    Decodes a message from an image using the C++ steganography engine.
    """
    tmp_dir = os.path.join(os.path.dirname(__file__), "..", "tmp")
    os.makedirs(tmp_dir, exist_ok=True)
    
    input_bin = os.path.join(tmp_dir, f"input_{uuid.uuid4().hex}.bin")

    try:
        # Convert image to flat binary
        img = Image.open(image_path).convert("RGB")
        width, height = img.size
        with open(input_bin, "wb") as f:
            f.write(img.tobytes())

        # Call C++ engine
        result = subprocess.run(
            [STEG_BIN, "decode", input_bin, str(width), str(height)],
            capture_output=True,
            text=True
        )

        if result.returncode != 0:
            raise HTTPException(status_code=400, detail=result.stderr.strip() or "Unknown error during decoding")

        # stdout is the decoded message
        return result.stdout

    finally:
        # Cleanup
        if os.path.exists(input_bin):
            os.remove(input_bin)
