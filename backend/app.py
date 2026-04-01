import cv2
import numpy as np
import os
import glob
import json
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse, FileResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pipeline import process_pipeline, process_pipeline_stream

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

def clear_output_directory():
    try:
        files = glob.glob(os.path.join(OUTPUT_DIR, "*.jpg"))
        for f in files:
            try:
                os.remove(f)
            except Exception as e:
                print(f"Error deleting old file {f}: {e}")
    except Exception as e:
        print(f"Error clearing output dir: {e}")

# Clear on startup
clear_output_directory()


@app.post("/process")
async def process_image(file: UploadFile = File(...)):
    clear_output_directory()
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


@app.post("/process_stream")
async def process_image_stream(file: UploadFile = File(...)):
    clear_output_directory()
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if image is None:
            return JSONResponse(status_code=400, content={"message": "Invalid image"})

        def stream_generator():
            try:
                yield json.dumps({"status": "analyzing"}) + "\n"
                
                for step_name, step_image in process_pipeline_stream(image):
                    path = os.path.join(OUTPUT_DIR, f"{step_name}.jpg")
                    cv2.imwrite(path, step_image)
                    url = f"http://127.0.0.1:8000/output/{step_name}.jpg"
                    
                    yield json.dumps({
                        "step": step_name,
                        "url": url,
                        "status": "processing"
                    }) + "\n"
                    
                yield json.dumps({"status": "done"}) + "\n"
                
            except Exception as e:
                yield json.dumps({"error": str(e)}) + "\n"

        return StreamingResponse(stream_generator(), media_type="application/x-ndjson")

    except Exception as e:
        return JSONResponse(status_code=500, content={"message": str(e)})


@app.get("/output/{filename}")
def get_output(filename: str):
    return FileResponse(os.path.join(OUTPUT_DIR, filename))


@app.get("/")
def root():
    return {"message": "API is running 🚀"}