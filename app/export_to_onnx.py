import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

import torch
# ...
import torch
from model_arch import DenseUNetGenerator  # Ensure this file exists from previous steps

# 1. Load the model
device = torch.device("cpu") # ONNX export works best on CPU
model = DenseUNetGenerator(in_channels=1, out_channels=3)
checkpoint = torch.load("../model_weights/model.pt", map_location=device)

# Handle dictionary vs direct weights
if isinstance(checkpoint, dict) and "gen_state_dict" in checkpoint:
    model.load_state_dict(checkpoint["gen_state_dict"])
else:
    model.load_state_dict(checkpoint)

model.eval()

# 2. Create a dummy input (Shape: Batch=1, Channels=1, Height=256, Width=256)
dummy_input = torch.randn(1, 1, 256, 256)

# 3. Export to ONNX
print("Exporting model to ONNX... This might take a minute.")
torch.onnx.export(
        model, 
        dummy_input, 
        "../model_weights/thermal_gan.onnx", 
        export_params=True, 
        opset_version=18,          # <--- CHANGED FROM 11 TO 18
        do_constant_folding=True,
        input_names = ['input'],
        output_names = ['output'],
        dynamic_axes={'input' : {0 : 'batch_size'},
                      'output' : {0 : 'batch_size'}}
    )
print("Success! Created thermal_gan.onnx")