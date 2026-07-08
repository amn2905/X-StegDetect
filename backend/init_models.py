import sys
from pathlib import Path

# Add app to path
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

from app.models import get_model, MODEL_BUILDERS

def init_all_models():
    print("Pre-loading and initializing all model architectures...")
    for model_name in MODEL_BUILDERS.keys():
        try:
            get_model(model_name, device="cpu")
            print(f"Successfully initialized and cached {model_name}.")
        except Exception as e:
            print(f"Failed to initialize {model_name}: {e}")

if __name__ == "__main__":
    init_all_models()
