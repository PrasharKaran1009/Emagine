import cv2
import numpy as np
import os
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pipeline import process_pipeline

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OUTPUT_DIR = "output"
os.makedirs(OUTPUT_DIR, exist_ok=True)


@app.post("/process")
async def process_image(file: UploadFile = File(...)):
    try:
        # Read image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if image is None:
            return JSONResponse(status_code=400, content={"message": "Invalid image"})

        #  Run pipeline
        final_image, steps = process_pipeline(image)

        #  Save steps
        step_urls = {}
        for name, img in steps.items():
            path = os.path.join(OUTPUT_DIR, f"{name}.jpg")
            cv2.imwrite(path, img)
            step_urls[name] = f"http://127.0.0.1:8000/output/{name}.jpg"

        #  Save final
        final_path = os.path.join(OUTPUT_DIR, "result.jpg")
        cv2.imwrite(final_path, final_image)

        return {
            "final": "http://127.0.0.1:8000/output/result.jpg",
            "steps": step_urls
        }

    except Exception as e:
        return JSONResponse(status_code=500, content={"message": str(e)})


@app.get("/output/{filename}")
def get_output(filename: str):
    return FileResponse(os.path.join(OUTPUT_DIR, filename))


@app.get("/")
def root():
    return {"message": "API is running 🚀"}