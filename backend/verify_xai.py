import sys
from pathlib import Path
import numpy as np
import torch

# Add current directory to path
sys.path.append(str(Path(__file__).resolve().parent))

from app.models import get_model
from app.xai import explain_shap, explain_lime

def test_xai():
    print("--- Starting XAI local diagnosis ---")
    img = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
    
    # Load ResNet50 for test
    try:
        model = get_model("ResNet50", device="cpu")
        print("1. Model loaded successfully.")
    except Exception as e:
        print(f"Error loading model: {e}")
        return
        
    # Test LIME
    try:
        print("2. Launching LIME check...")
        lime_img, lime_contrib = explain_lime(img, model, "cpu")
        print(f"   [SUCCESS] LIME completed. Output shape: {lime_img.shape}")
    except Exception as e:
        import traceback
        print("   [FAILURE] LIME failed with traceback:")
        traceback.print_exc()
        
    # Test SHAP
    try:
        print("3. Launching SHAP check...")
        shap_img, shap_contrib = explain_shap(img, model, "cpu")
        print(f"   [SUCCESS] SHAP completed. Output shape: {shap_img.shape}")
    except Exception as e:
        import traceback
        print("   [FAILURE] SHAP failed with traceback:")
        traceback.print_exc()

if __name__ == "__main__":
    test_xai()
