import requests
import io
from PIL import Image
import numpy as np

def test_api():
    print("--- Starting end-to-end API HTTP diagnostics ---")
    url = "http://127.0.0.1:8000"
    
    # 1. Create a dummy image in memory
    img = Image.fromarray(np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8))
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    img_byte_arr.seek(0)
    
    # 2. Trigger /predict
    print("1. Sending POST /predict request...")
    files = {'file': ('test.png', img_byte_arr, 'image/png')}
    data = {'model_name': 'ViT'}
    try:
        res = requests.post(f"{url}/predict", files=files, data=data)
        print(f"   Response Code: {res.status_code}")
        if res.status_code != 200:
            print(f"   Response Body: {res.text}")
            return
        pred_data = res.json()
        image_uuid = pred_data["image_uuid"]
        print(f"   [SUCCESS] Image UUID: {image_uuid}")
    except Exception as e:
        print(f"   [CONNECTION ERROR] /predict failed: {e}")
        return

    # 3. Trigger /gradcam
    print("2. Sending POST /gradcam request...")
    try:
        res = requests.post(f"{url}/gradcam", data={"image_uuid": image_uuid, "model_name": "ViT"})
        print(f"   Response Code: {res.status_code}")
        if res.status_code != 200:
            print(f"   Response Body: {res.text}")
    except Exception as e:
        print(f"   [ERROR] /gradcam failed: {e}")

    # 4. Trigger /shap
    print("3. Sending POST /shap request...")
    try:
        res = requests.post(f"{url}/shap", data={"image_uuid": image_uuid, "model_name": "ViT"})
        print(f"   Response Code: {res.status_code}")
        if res.status_code != 200:
            print(f"   Response Body: {res.text}")
    except Exception as e:
        print(f"   [ERROR] /shap failed: {e}")

    # 5. Trigger /lime
    print("4. Sending POST /lime request...")
    try:
        res = requests.post(f"{url}/lime", data={"image_uuid": image_uuid, "model_name": "ViT"})
        print(f"   Response Code: {res.status_code}")
        if res.status_code != 200:
            print(f"   Response Body: {res.text}")
    except Exception as e:
        print(f"   [ERROR] /lime failed: {e}")

if __name__ == "__main__":
    test_api()
