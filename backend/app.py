import cv2
import numpy as np
import os
import glob
import json
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse, FileResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from enhancement.pipeline import process_pipeline, process_pipeline_stream
import uuid
from encoding.encode_bridge import encode_message
from decoding.decode_bridge import decode_message

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


@app.post("/encode")
async def process_encode(file: UploadFile = File(...), message: str = Form(...)):
    try:
        temp_id = uuid.uuid4().hex
        ext = os.path.splitext(file.filename)[1] or ".png"
        temp_input_path = os.path.join(OUTPUT_DIR, f"temp_in_{temp_id}{ext}")
        
        contents = await file.read()
        with open(temp_input_path, "wb") as f:
            f.write(contents)
            
        try:
            out_img = encode_message(temp_input_path, message)
        except Exception as e:
            if os.path.exists(temp_input_path): os.remove(temp_input_path)
            raise e
            
        out_filename = f"encoded_{temp_id}.png"
        out_path = os.path.join(OUTPUT_DIR, out_filename)
        out_img.save(out_path)
        
        if os.path.exists(temp_input_path): os.remove(temp_input_path)
        
        return {
            "image_url": f"http://127.0.0.1:8000/output/{out_filename}",
            "message": "Encoded successfully"
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": str(e)})


@app.post("/decode")
async def process_decode(file: UploadFile = File(...)):
    try:
        temp_id = uuid.uuid4().hex
        ext = os.path.splitext(file.filename)[1] or ".png"
        temp_input_path = os.path.join(OUTPUT_DIR, f"temp_in_{temp_id}{ext}")
        
        contents = await file.read()
        with open(temp_input_path, "wb") as f:
            f.write(contents)
            
        try:
            secret_message = decode_message(temp_input_path)
        except Exception as e:
            if os.path.exists(temp_input_path): os.remove(temp_input_path)
            raise e
            
        if os.path.exists(temp_input_path): os.remove(temp_input_path)
        
        return {
            "secret_message": secret_message
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": str(e)})


@app.get("/output/{filename}")
def get_output(filename: str):
    return FileResponse(os.path.join(OUTPUT_DIR, filename))


@app.get("/")
def root():
    return {"message": "API is running 🚀"}