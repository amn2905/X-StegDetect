import os
import torch
import torch.nn as nn
import torchvision.models as tv_models
from app.config import MODELS_DIR

# Dict mapping model identifiers to torchvision constructor functions
MODEL_BUILDERS = {
    "ResNet50": lambda: tv_models.resnet50(weights=None),
    "EfficientNet": lambda: tv_models.efficientnet_b0(weights=None),
    "ViT": lambda: tv_models.vit_b_16(weights=None),
    "Swin": lambda: tv_models.swin_t(weights=None)
}

# Pretrained configurations to use during fallback or initialization
PRETRAINED_WEIGHTS = {
    "ResNet50": tv_models.ResNet50_Weights.DEFAULT,
    "EfficientNet": tv_models.EfficientNet_B0_Weights.DEFAULT,
    "ViT": tv_models.ViT_B_16_Weights.DEFAULT,
    "Swin": tv_models.Swin_T_Weights.DEFAULT
}

def modify_head(model_name: str, model: nn.Module):
    """
    Modifies the classifier head of a torchvision model to output 2 classes (0: COVER, 1: STEGO).
    """
    if model_name == "ResNet50":
        in_features = model.fc.in_features
        model.fc = nn.Linear(in_features, 2)
    elif model_name == "EfficientNet":
        in_features = model.classifier[1].in_features
        model.classifier[1] = nn.Linear(in_features, 2)
    elif model_name == "ViT":
        in_features = model.heads.head.in_features
        model.heads.head = nn.Linear(in_features, 2)
    elif model_name == "Swin":
        in_features = model.head.in_features
        model.head = nn.Linear(in_features, 2)
    return model

def get_model(model_name: str, device: str = "cpu") -> nn.Module:
    """
    Loads and returns a PyTorch model with binary steganography classification head.
    Loads weight from MODELS_DIR. If not found, downloads ImageNet base and initializes head.
    """
    if model_name not in MODEL_BUILDERS:
        raise ValueError(f"Unknown model architecture: {model_name}")

    path_name = model_name.lower()
    weights_path = MODELS_DIR / f"{path_name}.pth"
    
    print(f"Loading model {model_name} onto {device}...")
    
    # 1. Instantiate the base model
    if weights_path.exists():
        # Load architecture structure first
        model = MODEL_BUILDERS[model_name]()
        model = modify_head(model_name, model)
        # Load weights
        state_dict = torch.load(weights_path, map_location=device)
        model.load_state_dict(state_dict)
    else:
        print(f"Weights file not found at {weights_path}. Initializing with base pre-trained weights.")
        # Instantiate with pre-trained weights from ImageNet
        weights_config = PRETRAINED_WEIGHTS[model_name]
        
        # We construct the model with pre-trained weights first
        if model_name == "ResNet50":
            model = tv_models.resnet50(weights=weights_config)
        elif model_name == "EfficientNet":
            model = tv_models.efficientnet_b0(weights=weights_config)
        elif model_name == "ViT":
            model = tv_models.vit_b_16(weights=weights_config)
        elif model_name == "Swin":
            model = tv_models.swin_t(weights=weights_config)
            
        # Modify classifier head
        model = modify_head(model_name, model)
        
        # Save these initialized weights to the directory so it's cached as a .pth file
        os.makedirs(MODELS_DIR, exist_ok=True)
        torch.save(model.state_dict(), weights_path)
        print(f"Saved initialized weights to {weights_path}")
        
    model.to(device)
    model.eval()
    return model
