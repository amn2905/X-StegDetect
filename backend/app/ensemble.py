import numpy as np

def run_ensemble(probs_dict: dict, method: str = "soft") -> tuple:
    """
    Combines prediction probabilities from multiple models.
    probs_dict: dictionary mapping model_name to list of probabilities [prob_cover, prob_stego].
    method: Voting strategy - 'majority', 'soft', or 'weighted'.
    
    Returns: (predicted_label: str, confidence: float)
    """
    labels = ["COVER", "STEGO"]
    
    if not probs_dict:
        return "COVER", 0.5
        
    model_names = list(probs_dict.keys())
    probs = np.array([probs_dict[name] for name in model_names]) # Shape: [NumModels, 2]
    
    if method == "majority":
        # Get binary prediction for each model
        preds = np.argmax(probs, axis=1) # Array of 0s and 1s
        
        # Count occurrences of classes
        counts = np.bincount(preds, minlength=2)
        final_idx = np.argmax(counts)
        
        # Confidence is the average confidence of the models that predicted the majority label
        voted_models_idx = np.where(preds == final_idx)[0]
        confidence = np.mean(probs[voted_models_idx, final_idx])
        
    elif method == "weighted":
        # Performance-based weights matching benchmark accuracies
        weights_config = {
            "ResNet50": 0.15,
            "EfficientNet": 0.20,
            "ViT": 0.30,
            "Swin": 0.35
        }
        
        # Normalise weights for loaded models
        w_list = [weights_config.get(name, 1.0 / len(model_names)) for name in model_names]
        w_arr = np.array(w_list)
        w_arr = w_arr / np.sum(w_arr)
        
        # Compute weighted average probability
        weighted_probs = np.average(probs, axis=0, weights=w_arr)
        final_idx = np.argmax(weighted_probs)
        confidence = weighted_probs[final_idx]
        
    else: # "soft" (default)
        # Average probability values across all models
        avg_probs = np.mean(probs, axis=0)
        final_idx = np.argmax(avg_probs)
        confidence = avg_probs[final_idx]
        
    return labels[final_idx], float(confidence)
