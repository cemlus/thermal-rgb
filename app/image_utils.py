import torch
from torchvision import transforms
from PIL import Image
import io

# Define transforms exactly as they were in your training
transform = transforms.Compose([
    transforms.Resize((256, 256)), 
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.5], std=[0.5]) 
])

def prepare_image(image_bytes):
    """Converts uploaded bytes to a tensor ready for the model"""
    # Open image and force convert to Grayscale (L)
    image = Image.open(io.BytesIO(image_bytes)).convert("L")
    return transform(image).unsqueeze(0) 

def tensor_to_image(tensor):
    """Converts the output tensor back to a PIL Image"""
    tensor = tensor.squeeze(0).detach().cpu()
    # Inverse normalization
    tensor = (tensor * 0.5) + 0.5
    tensor = torch.clamp(tensor, 0, 1)
    
    to_pil = transforms.ToPILImage()
    return to_pil(tensor)