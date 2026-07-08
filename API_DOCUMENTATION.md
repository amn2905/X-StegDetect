# X-StegDetect API Documentation

The X-StegDetect backend is built using FastAPI. It exposes endpoints to analyze images, generate forensic residual images, compute explainable AI attributions, and compile PDF investigation reports.

## Base URL
* Local Dev: `http://localhost:8000`
* Docker: `http://localhost:8000` (FastAPI container)

---

## Endpoints Overview

### 1. Health Status
Checks backend API connection and checks active compute hardware (CPU/CUDA).

* **Route**: `GET /health`
* **Response**: `200 OK`
  ```json
  {
    "status": "healthy",
    "device": "cpu",
    "cuda_available": false,
    "timestamp": "2026-06-19T04:00:00Z"
  }
  ```

---

### 2. Available Models & Metrics
Returns the list of supported architectures along with parameter size counts and benchmark accuracies.

* **Route**: `GET /models`
* **Response**: `200 OK`
  ```json
  {
    "device": "cpu",
    "models": {
      "ResNet50": {
        "accuracy": 0.924,
        "precision": 0.912,
        "recall": 0.908,
        "f1_score": 0.91,
        "roc_auc": 0.965,
        "parameters": "25.6M",
        "description": "..."
      },
      "ViT": {
        "accuracy": 0.978,
        "precision": 0.981,
        "recall": 0.972,
        "f1_score": 0.976,
        "roc_auc": 0.994,
        "parameters": "86.6M",
        "description": "..."
      }
    }
  }
  ```

---

### 3. Steganographic Prediction
Uploads an image, calculates Cover/Stego predictions, and extracts high-pass, edge, and variance residuals, caching results under a new Case UUID.

* **Route**: `POST /predict`
* **Content-Type**: `multipart/form-data`
* **Parameters**:
  * `file`: Uploaded file (PNG/JPG/JPEG, <10MB)
  * `model_name`: String selection - `ResNet50`, `EfficientNet`, `ViT`, or `Swin`. (Default: `ViT`)
* **Response**: `200 OK`
  ```json
  {
    "image_uuid": "3be5b078-43d2-4560-b26a-932efba0b11e",
    "prediction": "STEGO",
    "confidence": 99.84,
    "model": "ViT",
    "processing_time": "1.34 sec",
    "original_url": "/static/3be5b078-43d2-4560-b26a-932efba0b11e_original.png",
    "noise_url": "/static/3be5b078-43d2-4560-b26a-932efba0b11e_noise.png",
    "edge_url": "/static/3be5b078-43d2-4560-b26a-932efba0b11e_edge.png",
    "artifact_url": "/static/3be5b078-43d2-4560-b26a-932efba0b11e_artifact.png"
  }
  ```

---

### 4. Ensemble Classification
Combines predictions from multiple select models using a specified voting strategy.

* **Route**: `POST /ensemble`
* **Content-Type**: `multipart/form-data`
* **Parameters**:
  * `image_uuid`: String UUID of the pre-uploaded image.
  * `models_list`: List of model strings (e.g. `ViT`, `Swin`). FastAPI expects multiple parameters with this key.
  * `method`: String selection - `soft`, `majority`, or `weighted`. (Default: `soft`)
* **Response**: `200 OK`
  ```json
  {
    "image_uuid": "3be5b078-43d2-4560-b26a-932efba0b11e",
    "prediction": "STEGO",
    "confidence": 98.67,
    "voting_method": "soft",
    "models_evaluated": ["ViT", "Swin"],
    "processing_time": "2.10 sec"
  }
  ```

---

### 5. Grad-CAM Activation Map
Generates a Grad-CAM attention heatmap overlaid on the original image.

* **Route**: `POST /gradcam`
* **Content-Type**: `multipart/form-data`
* **Parameters**:
  * `image_uuid`: String UUID of the pre-uploaded image.
  * `model_name`: Target model name.
* **Response**: `200 OK`
  ```json
  {
    "image_uuid": "3be5b078-43d2-4560-b26a-932efba0b11e",
    "model": "ViT",
    "gradcam_url": "/static/3be5b078-43d2-4560-b26a-932efba0b11e_gradcam.png"
  }
  ```

---

### 6. SHAP Coalition Weights
Runs superpixel-based coalition Kernel SHAP to weight feature contributions.

* **Route**: `POST /shap`
* **Content-Type**: `multipart/form-data`
* **Parameters**:
  * `image_uuid`: String UUID of the pre-uploaded image.
  * `model_name`: Target model name.
* **Response**: `200 OK`
  ```json
  {
    "image_uuid": "3be5b078-43d2-4560-b26a-932efba0b11e",
    "model": "ViT",
    "shap_url": "/static/3be5b078-43d2-4560-b26a-932efba0b11e_shap.png",
    "contributions": [
      { "segment_id": 0, "shap_value": 0.0456, "contribution": "STEGO" },
      { "segment_id": 1, "shap_value": -0.0123, "contribution": "COVER" }
    ]
  }
  ```

---

### 7. LIME Evidence Registry
Perturbs segmented superpixels to identify supportive or contradictory evidence zones.

* **Route**: `POST /lime`
* **Content-Type**: `multipart/form-data`
* **Parameters**:
  * `image_uuid`: String UUID of the pre-uploaded image.
  * `model_name`: Target model name.
* **Response**: `200 OK`
  ```json
  {
    "image_uuid": "3be5b078-43d2-4560-b26a-932efba0b11e",
    "model": "ViT",
    "lime_url": "/static/3be5b078-43d2-4560-b26a-932efba0b11e_lime.png",
    "contributions": [
      { "superpixel_id": 0, "weight": 0.0124, "evidence": "STEGO" },
      { "superpixel_id": 1, "weight": -0.0034, "evidence": "COVER" }
    ]
  }
  ```

---

### 8. Generate Forensic PDF Report
Compiles all image and analysis fields cached under the UUID into a formalized digital forensic PDF.

* **Route**: `POST /generate-report`
* **Content-Type**: `multipart/form-data`
* **Parameters**:
  * `image_uuid`: String UUID of the pre-uploaded image.
* **Response**: `200 OK`
  ```json
  {
    "image_uuid": "3be5b078-43d2-4560-b26a-932efba0b11e",
    "report_url": "/reports/forensic_report_3be5b078-43d2-4560-b26a-932efba0b11e.pdf"
  }
  ```
