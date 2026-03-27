import cv2
from pipeline import process_pipeline

def main():
    # Load image (relative to backend/)
    image = cv2.imread("input/sample.jpg")

    if image is None:
        print("Error: Image not found!")
        return

    # Process image
    output = process_pipeline(image)

    # Save output (also relative to backend/)
    cv2.imwrite("output/result.jpg", output)

    print("Processing complete. Output saved in output/")

if __name__ == "__main__":
    main()