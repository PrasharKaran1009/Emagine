import os
from PIL import Image
from steg_bridge import encode_message, decode_message

def run_test():
    test_img_path = "test_fixture.png"
    encoded_img_path = "test_encoded.png"
    
    # Generate 100x100 (200, 200, 200) image
    img = Image.new("RGB", (100, 100), (200, 200, 200))
    img.save(test_img_path)
    
    message = "Testing near-white distortion. This is a secure message. " * 5

    try:
        print(f"Encoding message into {test_img_path}...")
        encoded_img = encode_message(test_img_path, message)
        encoded_img.save(encoded_img_path)
        print(f"Saved encoded image to {encoded_img_path}.")

        print(f"Decoding message from {encoded_img_path}...")
        decoded_msg = decode_message(encoded_img_path)
        
        print("\n--- RESULTS ---")
        if decoded_msg == message:
            print("✅ SUCCESS: Decoded message matches original!")
        else:
            print("❌ FAILURE: Decoded message does NOT match.")
            print(f"Expected: {message[:50]}...")
            print(f"Got:      {decoded_msg[:50]}...")
            if len(decoded_msg) != len(message):
                print(f"Length mismatch: expected {len(message)}, got {len(decoded_msg)}")
                
    except Exception as e:
        print(f"Test failed with exception: {e}")

if __name__ == "__main__":
    run_test()
