import os
from PIL import Image
from steg_bridge import encode_message

def test_failure():
    # 2x2 image = 4 pixels = 12 channels. Too small.
    path = "tiny.png"
    img = Image.new("RGB", (2, 2), "black")
    img.save(path)
    try:
        encode_message(path, "a")
        print("FAIL: Should have raised exception")
    except Exception as e:
        print(f"SUCCESS: Caught exception: {e}")

test_failure()
