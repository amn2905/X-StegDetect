import os
import uuid
from pathlib import Path
from PIL import Image
from fastapi import HTTPException, UploadFile
from app.config import ALLOWED_EXTENSIONS, MAX_FILE_SIZE_MB, UPLOADS_DIR

def validate_image(file: UploadFile) -> Path:
    """
    Validates uploaded file type, size, and corruption status.
    Saves and returns the temporary path if valid.
    """
    # 1. Validate extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file format: {file_ext}. Supported formats are {', '.join(ALLOWED_EXTENSIONS)}"
        )
        
    # Create secure random name to prevent path traversals and collisions
    safe_filename = f"{uuid.uuid4()}{file_ext}"
    temp_path = UPLOADS_DIR / safe_filename
    
    # 2. Save file chunk-by-chunk and validate size
    size_bytes = 0
    max_bytes = MAX_FILE_SIZE_MB * 1024 * 1024
    
    try:
        with open(temp_path, "wb") as buffer:
            while chunk := file.file.read(1024 * 1024):
                size_bytes += len(chunk)
                if size_bytes > max_bytes:
                    # Clean up
                    buffer.close()
                    temp_path.unlink()
                    raise HTTPException(
                        status_code=413, 
                        detail=f"File exceeds size limit of {MAX_FILE_SIZE_MB}MB."
                    )
                buffer.write(chunk)
    except Exception as e:
        if temp_path.exists():
            temp_path.unlink()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")
        
    # 3. Validate image integrity (corruption check)
    try:
        with Image.open(temp_path) as img:
            img.verify()  # Verifies integrity without loading full pixel data
            
        # Re-open and verify shape/mode
        with Image.open(temp_path) as img:
            img.transpose(Image.FLIP_LEFT_RIGHT) # Forces loading and decoding pixels
    except Exception:
        if temp_path.exists():
            temp_path.unlink()
        raise HTTPException(
            status_code=400, 
            detail="Uploaded file is corrupted or not a valid image structure."
        )
        
    return temp_path


def preprocess_image_to_np(img_path: Path) -> tuple:
    """
    Loads an image, resizes to 224x224, converts to RGB, and returns:
    1. RGB Numpy array of shape (224, 224, 3) in range [0, 255]
    2. PIL Image object of shape (224, 224)
    """
    try:
        # Load and convert to RGB
        pil_img = Image.open(img_path).convert("RGB")
        # Resize to standard input shape
        pil_img_resized = pil_img.resize((224, 224), Image.Resampling.BILINEAR)
        # Convert to numpy array
        np_img = np.array(pil_img_resized, dtype=np.float32)
        return np_img, pil_img_resized
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image preprocessing failed: {str(e)}")

# Import numpy inside function or at top of file
import numpy as np
