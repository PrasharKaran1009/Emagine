import cv2
import os
from pipeline import process_pipeline

def main():
    # Load image (relative to backend/)
    image = cv2.imread("input/sample.jpg")

    if image is None:
        print("Error: Image not found!")
        return

    # Process image
    output, intermediate_results = process_pipeline(image)

    # Ensure output directory exists
    output_dir = "output"
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Save intermediate results for verification
    for name, img in intermediate_results.items():
        cv2.imwrite(f"{output_dir}/{name}.jpg", img)

    # Save final output
    cv2.imwrite(f"{output_dir}/result.jpg", output)

    print(f"Processing complete. {len(intermediate_results)} steps saved in {output_dir}/")

if __name__ == "__main__":
    main()