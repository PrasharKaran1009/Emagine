from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import shutil
import os
import cv2
from pipeline import process_pipeline

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

INPUT_DIR = "input"
OUTPUT_DIR = "output"

os.makedirs(INPUT_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)


@app.post("/process")
async def process(image: UploadFile = File(...)):
    input_path = os.path.join(INPUT_DIR, "input.jpg")

    # Save uploaded file
    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    # Read image
    img = cv2.imread(input_path)

    # Run pipeline
    output, steps = process_pipeline(img)

    # Save outputs
    step_paths = {}
    for name, im in steps.items():
        path = os.path.join(OUTPUT_DIR, f"{name}.jpg")
        cv2.imwrite(path, im)
        step_paths[name] = f"http://127.0.0.1:8000/output/{name}.jpg"

    final_path = os.path.join(OUTPUT_DIR, "result.jpg")
    cv2.imwrite(final_path, output)

    return {
        "final": "http://127.0.0.1:8000/output/result.jpg",
        "steps": step_paths
    }


@app.get("/output/{filename}")
def get_output(filename: str):
    path = os.path.join(OUTPUT_DIR, filename)
    return FileResponse(path)