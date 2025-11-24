from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from contextlib import asynccontextmanager
import torch
from app.model_arch import DenseUNetGenerator
from app.image_utils import prepare_image, tensor_to_image
import io

models = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- LOAD MODEL ON STARTUP ---
    print("Loading 506MB GAN Model... Please wait.")
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")
    
    model = DenseUNetGenerator(in_channels=1, out_channels=3)
    
    # Load weights
    try:
        # We use strict=False because sometimes saved models have extra keys
        checkpoint = torch.load("model_weights/model.pt", map_location=device)
        if isinstance(checkpoint, dict) and "gen_state_dict" in checkpoint:
            model.load_state_dict(checkpoint["gen_state_dict"])
        else:
            model.load_state_dict(checkpoint)
    except Exception as e:
        print(f"Error loading model: {e}")
        print("Make sure 'model.pt' is in the 'model_weights' folder!")
        raise e
        
    model.to(device)
    model.eval()
    models["generator"] = model
    models["device"] = device
    print("Model Loaded Successfully!")
    
    yield
    models.clear()

app = FastAPI(lifespan=lifespan)

# Allow external access (Required for Ngrok/Frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"status": "Thermal GAN is Running"}

@app.post("/generate")
async def generate_rgb(file: UploadFile = File(...)):
    # 1. Read
    image_bytes = await file.read()
    
    # 2. Process
    input_tensor = prepare_image(image_bytes).to(models["device"])
    
    # 3. Predict
    with torch.no_grad():
        output_tensor = models["generator"](input_tensor)
    
    # 4. Return
    result_image = tensor_to_image(output_tensor)
    img_byte_arr = io.BytesIO()
    result_image.save(img_byte_arr, format='PNG')
    img_byte_arr.seek(0)
    
    return StreamingResponse(img_byte_arr, media_type="image/png")