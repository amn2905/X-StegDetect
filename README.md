# X-StegDetect: AI-Powered Explainable Steganography Forensic Platform

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10+-blue.svg">
  <img src="https://img.shields.io/badge/FastAPI-Backend-green.svg">
  <img src="https://img.shields.io/badge/React-Frontend-61DAFB.svg">
  <img src="https://img.shields.io/badge/PyTorch-Deep%20Learning-red.svg">
  <img src="https://img.shields.io/badge/Docker-Containerized-blue.svg">
  <![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)>
</p>

## Overview

**X-StegDetect** is an AI-powered digital forensic platform developed for the detection, analysis, and interpretation of image steganography generated using the **ViT-DiffSteg** framework. The platform integrates state-of-the-art deep learning models, forensic residual analysis, and Explainable Artificial Intelligence (XAI) to provide transparent, interpretable, and reliable steganographic investigations.

Designed for cybersecurity professionals, digital forensic investigators, researchers, and academic institutions, X-StegDetect delivers an end-to-end forensic workflow through an intuitive web-based interface.

---

# Features

## AI-Based Steganography Detection

- Detects Cover and Stego images
- Confidence score prediction
- High-performance deep learning inference
- Secure image preprocessing pipeline

---

## Multi-Model Deep Learning

Supports multiple state-of-the-art architectures:

- Vision Transformer (ViT)
- Swin Transformer
- ResNet50
- EfficientNet

Supports Ensemble Learning:

- Majority Voting
- Soft Voting
- Weighted Voting

---

## Forensic Residual Analysis

Generate forensic visualization maps including:

- Noise Residual
- High-Pass Residual
- Sobel Edge Residual
- Local Variance Analysis
- Artifact Heat Maps

These visualizations expose hidden embedding artifacts that are difficult to observe using conventional image analysis.

---

## Explainable AI (XAI)

Provides transparent AI predictions using:

- Grad-CAM
- SHAP
- LIME

The explainability module enables investigators to understand why a model classified an image as Stego instead of relying solely on prediction scores.

---

## Interactive Investigation Dashboard

- Modern React Interface
- Responsive Design
- Drag-and-Drop Image Upload
- Live Prediction Results
- Residual Visualization
- Explainability Workspace
- Report Management

---

## Automated Forensic Reports

Generate investigation-ready PDF reports containing:

- Original Evidence
- Prediction Results
- Confidence Scores
- Residual Maps
- Grad-CAM Heatmaps
- SHAP Explanations
- LIME Explanations
- Investigation Metadata

---

## Docker Support

- Docker
- Docker Compose
- Multi-container Deployment
- Cross-platform Support

---

# Technology Stack

## Backend

- Python
- FastAPI
- PyTorch
- OpenCV
- NumPy
- Pillow
- ReportLab

## Frontend

- React
- Vite
- Tailwind CSS
- Axios
- Chart.js

## Explainable AI

- Grad-CAM
- SHAP
- LIME

## Deployment

- Docker
- Docker Compose

---

# Project Structure

```text
X-StegDetect/
│
├── backend/
│   ├── app/
│   ├── requirements.txt
│   └── init_models.py
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── models/
├── uploads/
├── reports/
├── docker/
├── docker-compose.yml
├── README.md
└── API_DOCUMENTATION.md
```

---

# Getting Started

## Prerequisites

Install the following software before running the project.

- Python 3.10+
- Node.js 18+
- Git
- Docker (Optional)

---

# Clone Repository

```bash
git clone https://github.com/amn2905/X-StegDetect.git

cd X-StegDetect
```

---

# Backend Installation

Navigate to backend.

```bash
cd backend
```

Create virtual environment.

```bash
python -m venv venv
```

Activate environment.

### Windows

```bash
venv\Scripts\activate
```

### Linux/macOS

```bash
source venv/bin/activate
```

Install dependencies.

```bash
pip install -r requirements.txt
```

Run FastAPI server.

```bash
uvicorn app.main:app --reload
```

Backend

```
http://localhost:8000
```

Swagger Documentation

```
http://localhost:8000/docs
```

---

# Frontend Installation

Open a new terminal.

```bash
cd frontend
```

Install packages.

```bash
npm install
```

Run React application.

```bash
npm run dev
```

Frontend

```
http://localhost:5173
```

---

# Docker Deployment

Build and start all containers.

```bash
docker compose up --build
```

or

```bash
docker-compose up --build
```

Application URLs

Frontend

```
http://localhost
```

Backend

```
http://localhost:8000
```

API Documentation

```
http://localhost:8000/docs
```

---

# Investigation Workflow

1. Upload an image.
2. Select a deep learning model.
3. Execute forensic detection.
4. Review confidence scores.
5. Analyze residual maps.
6. Explore XAI visualizations.
7. Generate forensic PDF report.
8. Export investigation evidence.

---

# Applications

X-StegDetect is suitable for:

- Digital Forensics
- Cybersecurity Research
- Multimedia Security
- Explainable AI Research
- Image Steganography Detection
- AI-Assisted Investigations
- Academic Research
- Security Education

---

# Future Enhancements

- Video Steganography Detection
- Audio Steganography Detection
- Transformer Ensemble Optimization
- Cloud Deployment
- REST API Authentication
- Multi-user Investigation Workspace
- Real-time Monitoring
- GPU Batch Processing

---

# Research

This project has been developed as part of ongoing research in AI-assisted image steganography and digital forensic analysis using the **ViT-DiffSteg** framework.

The objective is to improve the transparency, interpretability, and reliability of deep learning-based steganalysis through Explainable AI techniques.

---

# License

This project is licensed under the **Apache License 2.0**.

You are free to use, modify, and distribute this software in compliance with the terms and conditions of the Apache License 2.0.

See the **LICENSE** file for complete license details.

---

# Author

**Mohd. Amaan Hamid**

M.Sc. Cybersecurity

Research Interests

- Digital Forensics
- Artificial Intelligence
- Explainable AI
- Image Steganography
- Multimedia Security
- Post-Quantum Cryptography

---

## Citation

If you use this project in your research, please cite the corresponding publication (to be updated after publication).

```bibtex
@software{xstegdetect,
  title={X-StegDetect: AI-Powered Explainable Steganography Forensic Platform},
  author={Mohd. Amaan Hamid},
  year={2026},
  note={Research Software}
}
```
