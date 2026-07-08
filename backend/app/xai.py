import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
import cv2
import shap
from lime import lime_image
from skimage.segmentation import slic, mark_boundaries

class GradCAM:
    """
    Grad-CAM implementation supporting ResNet, EfficientNet, ViT, and Swin.
    """
    def __init__(self, model, target_layer, model_name):
        self.model = model
        self.target_layer = target_layer
        self.model_name = model_name
        self.activations = None
        self.gradients = None
        
        # Register forward hook only
        self.forward_hook = target_layer.register_forward_hook(self.save_activation)
        
    def save_activation(self, module, input, output):
        # Save activations and attach a gradient hook on the autograd graph tensor
        if isinstance(output, tuple):
            self.activations = output[0].detach()
            output[0].register_hook(self.save_gradient)
        else:
            self.activations = output.detach()
            output.register_hook(self.save_gradient)
            
    def save_gradient(self, grad):
        # Save gradients
        self.gradients = grad.detach()
        
    def __call__(self, x, class_idx=None):
        self.gradients = None
        self.activations = None
        
        self.model.zero_grad()
        output = self.model(x)
        if class_idx is None:
            class_idx = output.argmax(dim=1).item()
        
        loss = output[0, class_idx]
        loss.backward()
        
        if self.gradients is None or self.activations is None:
            # Fallback to zeros if hooks fail to capture
            return np.zeros((224, 224), dtype=np.float32)
            
        gradients = self.gradients
        activations = self.activations
        
        # Format Transformer tokens [B, N, C] to [B, C, H, W] spatial grids
        if self.model_name == "ViT":
            # Remove class token
            activations = activations[:, 1:, :] # [1, 196, 768]
            gradients = gradients[:, 1:, :]     # [1, 196, 768]
            B, N, C = activations.shape
            H = W = int(N ** 0.5)
            activations = activations.transpose(1, 2).reshape(B, C, H, W)
            gradients = gradients.transpose(1, 2).reshape(B, C, H, W)
        elif self.model_name == "Swin":
            if len(activations.shape) == 3: # [B, H*W, C]
                B, L, C = activations.shape
                H = W = int(L ** 0.5)
                activations = activations.transpose(1, 2).reshape(B, C, H, W)
                gradients = gradients.transpose(1, 2).reshape(B, C, H, W)
            elif len(activations.shape) == 4: # [B, H, W, C]
                activations = activations.permute(0, 3, 1, 2)
                gradients = gradients.permute(0, 3, 1, 2)
                
        # Calculate Grad-CAM weights and heatmap
        weights = torch.mean(gradients, dim=(2, 3), keepdim=True)
        cam = torch.sum(weights * activations, dim=1, keepdim=True)
        cam = F.relu(cam)
        
        # Max-min normalization
        cam = cam - cam.min()
        cam = cam / (cam.max() + 1e-8)
        cam = cam.squeeze(0).squeeze(0).cpu().numpy()
        
        return cam
        
    def remove_hooks(self):
        self.forward_hook.remove()


def get_gradcam_target_layer(model_name: str, model: nn.Module):
    """
    Returns the target convolutional layer or normalisation layer for Grad-CAM.
    """
    if model_name == "ResNet50":
        return model.layer4
    elif model_name == "EfficientNet":
        return model.features[-1]
    elif model_name == "ViT":
        return model.encoder.layers[-1].ln_1
    elif model_name == "Swin":
        return model.features[-1][-1].norm1
    return None


def explain_gradcam(image_np: np.ndarray, model: nn.Module, model_name: str, device: str) -> np.ndarray:
    """
    Generates Grad-CAM heatmap and overlays it on the original image.
    image_np: shape [224, 224, 3], range [0, 255], RGB format.
    """
    # Preprocess image for model input
    img_t = torch.tensor(image_np / 255.0).permute(2, 0, 1).float().unsqueeze(0).to(device)
    mean = torch.tensor([0.485, 0.456, 0.406]).view(1, 3, 1, 1).to(device)
    std = torch.tensor([0.229, 0.224, 0.225]).view(1, 3, 1, 1).to(device)
    img_norm = (img_t - mean) / std

    target_layer = get_gradcam_target_layer(model_name, model)
    if target_layer is None:
        # Fallback to dummy mask if target layer configuration is missing
        return image_np.copy()

    gcam = GradCAM(model, target_layer, model_name)
    try:
        # Predict logits
        logits = model(img_norm)
        class_idx = logits.argmax(dim=1).item()
        
        # Calculate CAM
        cam_mask = gcam(img_norm, class_idx)
    finally:
        gcam.remove_hooks()

    # Resize heatmap to original image size
    heatmap = cv2.resize(cam_mask, (224, 224))
    heatmap = np.uint8(255 * heatmap)
    
    # Apply JET colormap (in BGR and then convert back to RGB)
    color_heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
    color_heatmap = cv2.cvtColor(color_heatmap, cv2.COLOR_BGR2RGB)
    
    # Overlay on original image
    overlay = cv2.addWeighted(image_np.astype(np.uint8), 0.5, color_heatmap, 0.5, 0)
    return overlay


def explain_lime(image_np: np.ndarray, model: nn.Module, device: str):
    """
    Generates LIME superpixel segment explanations.
    image_np: shape [224, 224, 3], range [0, 255], RGB format.
    """
    explainer = lime_image.LimeImageExplainer()

    def batch_predict(images):
        model.eval()
        # Convert entire batch of images to float32 and normalize at once
        imgs = np.array(images, dtype=np.float32) / 255.0
        imgs = imgs.transpose(0, 3, 1, 2)  # [B, H, W, C] -> [B, C, H, W]
        
        batch_t = torch.from_numpy(imgs).to(device)
        mean = torch.tensor([0.485, 0.456, 0.406]).view(1, 3, 1, 1).to(device)
        std = torch.tensor([0.229, 0.224, 0.225]).view(1, 3, 1, 1).to(device)
        batch_norm = (batch_t - mean) / std
        
        with torch.no_grad():
            logits = model(batch_norm)
            probs = torch.softmax(logits, dim=1)
        return probs.cpu().numpy()

    # Explain prediction on the image
    # Keep samples low for speed (< 10 seconds)
    explanation = explainer.explain_instance(
        image_np.astype(np.double),
        batch_predict,
        top_labels=1,
        hide_color=0,
        num_samples=40
    )

    top_label = explanation.top_labels[0]
    temp, mask = explanation.get_image_and_mask(
        top_label,
        positive_only=False,
        num_features=8,
        hide_rest=False
    )

    segments = explanation.segments
    local_exp = dict(explanation.local_exp[top_label])

    # Overlay colors on positive (green) and negative (red) contributions
    overlay = image_np.copy().astype(float)
    for seg_id, weight in local_exp.items():
        mask_seg = (segments == seg_id)
        if weight > 0:
            overlay[mask_seg, 1] = np.clip(overlay[mask_seg, 1] + 80, 0, 255) # Add Green
        else:
            overlay[mask_seg, 0] = np.clip(overlay[mask_seg, 0] + 80, 0, 255) # Add Red

    lime_result = mark_boundaries(overlay / 255.0, mask)
    lime_result = np.clip(lime_result * 255.0, 0, 255).astype(np.uint8)

    # Format localized explanation weights for dashboard
    contributions = []
    for seg_id, weight in local_exp.items():
        contributions.append({
            "superpixel_id": int(seg_id),
            "weight": float(weight),
            "evidence": "STEGO" if weight > 0 else "COVER"
        })

    return lime_result, contributions


def explain_shap(image_np: np.ndarray, model: nn.Module, device: str):
    """
    Generates SHAP visualization using superpixel coalitions for hyper-fast execution.
    image_np: shape [224, 224, 3], range [0, 255], RGB format.
    """
    # Create superpixel segments
    segments = slic(image_np / 255.0, n_segments=16, compactness=10, sigma=1, start_label=0)
    num_segments = len(np.unique(segments))
    
    # Gray background for perturbed (masked) superpixels
    bg_color = np.array([128, 128, 128], dtype=np.uint8)

    def shap_predict(z_batch):
        model.eval()
        batch_images = []
        for z in z_batch:
            img_recon = image_np.copy()
            for seg_id in range(num_segments):
                if z[seg_id] == 0:
                    img_recon[segments == seg_id] = bg_color
            batch_images.append(img_recon)
            
        # Convert batch to float32 and normalize at once
        imgs = np.array(batch_images, dtype=np.float32) / 255.0
        imgs = imgs.transpose(0, 3, 1, 2)  # [B, H, W, C] -> [B, C, H, W]
        
        batch_t = torch.from_numpy(imgs).to(device)
        mean = torch.tensor([0.485, 0.456, 0.406]).view(1, 3, 1, 1).to(device)
        std = torch.tensor([0.229, 0.224, 0.225]).view(1, 3, 1, 1).to(device)
        batch_norm = (batch_t - mean) / std
        
        with torch.no_grad():
            logits = model(batch_norm)
            probs = torch.softmax(logits, dim=1)
        # Explain class 1: STEGO
        return probs[:, 1].cpu().numpy()

    # Kernel SHAP on the binary coalition space
    explainer = shap.KernelExplainer(shap_predict, np.zeros((1, num_segments)))
    shap_values = explainer.shap_values(np.ones((1, num_segments)), nsamples=32)
    
    if isinstance(shap_values, list):
        shap_vals = shap_values[0]
    else:
        shap_vals = shap_values[0]

    # Normalize values to scale color overlays
    max_val = np.max(np.abs(shap_vals)) + 1e-8
    shap_vals_norm = shap_vals / max_val

    shap_img = image_np.copy().astype(float)
    for seg_id in range(num_segments):
        val = shap_vals_norm[seg_id]
        mask_seg = (segments == seg_id)
        if val > 0:
            # Positive contribution (Red tint standard in SHAP)
            shap_img[mask_seg, 0] = np.clip(shap_img[mask_seg, 0] + val * 100, 0, 255)
            shap_img[mask_seg, 1] = np.clip(shap_img[mask_seg, 1] - val * 50, 0, 255)
            shap_img[mask_seg, 2] = np.clip(shap_img[mask_seg, 2] - val * 50, 0, 255)
        else:
            # Negative contribution (Blue tint standard in SHAP)
            val = abs(val)
            shap_img[mask_seg, 0] = np.clip(shap_img[mask_seg, 0] - val * 50, 0, 255)
            shap_img[mask_seg, 1] = np.clip(shap_img[mask_seg, 1] - val * 50, 0, 255)
            shap_img[mask_seg, 2] = np.clip(shap_img[mask_seg, 2] + val * 100, 0, 255)

    shap_result = np.clip(shap_img, 0, 255).astype(np.uint8)

    contributions = []
    for i, val in enumerate(shap_vals):
        contributions.append({
            "segment_id": int(i),
            "shap_value": float(val),
            "contribution": "STEGO" if val > 0 else "COVER"
        })

    return shap_result, contributions
