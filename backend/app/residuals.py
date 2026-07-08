import cv2
import numpy as np

def compute_noise_residual(image_np: np.ndarray) -> np.ndarray:
    """
    Computes high-frequency noise residual by subtracting a Gaussian-blurred 
    version of the image from the original (Difference of Gaussians style).
    Amplifies high frequencies for enhanced forensic visualization.
    """
    # Channel-wise Gaussian blur subtraction
    blurred = cv2.GaussianBlur(image_np, (5, 5), 0)
    residual = cv2.subtract(image_np, blurred)
    
    # Amplify the high-frequency noise components for visual analysis
    amplified = cv2.multiply(residual, 4)
    return np.clip(amplified, 0, 255).astype(np.uint8)


def compute_edge_residual(image_np: np.ndarray) -> np.ndarray:
    """
    Computes spatial edges using Sobel filters to highlight structural details 
    where embedding algorithms typically hide data.
    """
    gray = cv2.cvtColor(image_np, cv2.COLOR_RGB2GRAY)
    
    # Sobel gradients in X and Y directions
    sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
    sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
    
    # Combine gradients
    magnitude = np.sqrt(sobelx**2 + sobely**2)
    norm_mag = cv2.normalize(magnitude, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
    
    # Apply a high-contrast colormap (e.g. HOT/INFERNO theme) for forensic style
    color_mapped = cv2.applyColorMap(norm_mag, cv2.COLORMAP_HOT)
    return cv2.cvtColor(color_mapped, cv2.COLOR_BGR2RGB)


def compute_artifact_map(image_np: np.ndarray) -> np.ndarray:
    """
    Computes the local pixel variance (standard deviation) in a spatial window.
    Steganographic embedding disrupts local correlations, leaving statistical 
    anomalies in complex textured regions.
    """
    gray = cv2.cvtColor(image_np, cv2.COLOR_RGB2GRAY).astype(float) / 255.0
    
    # Mean of image and mean of squared image in a local window
    window_size = (5, 5)
    mean = cv2.blur(gray, window_size)
    sq_mean = cv2.blur(gray**2, window_size)
    
    # Local variance = E[X^2] - (E[X])^2
    variance = np.maximum(sq_mean - mean**2, 0)
    std_dev = np.sqrt(variance)
    
    # Normalize to [0, 255]
    norm_std = cv2.normalize(std_dev, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
    
    # Apply a cold metal colormap (COLORMAP_BONE) for a distinct forensic visual style
    color_mapped = cv2.applyColorMap(norm_std, cv2.COLORMAP_BONE)
    return cv2.cvtColor(color_mapped, cv2.COLOR_BGR2RGB)
