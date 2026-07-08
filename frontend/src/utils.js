import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export const getModels = async () => {
  const response = await api.get('/models');
  return response.data;
};

export const predict = async (file, modelName) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('model_name', modelName);
  
  const response = await api.post('/predict', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const ensemble = async (imageUuid, modelsList, method) => {
  const formData = new FormData();
  formData.append('image_uuid', imageUuid);
  modelsList.forEach((model) => {
    formData.append('models_list', model);
  });
  formData.append('method', method);

  const response = await api.post('/ensemble', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getGradCam = async (imageUuid, modelName) => {
  const formData = new FormData();
  formData.append('image_uuid', imageUuid);
  formData.append('model_name', modelName);

  const response = await api.post('/gradcam', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getShap = async (imageUuid, modelName) => {
  const formData = new FormData();
  formData.append('image_uuid', imageUuid);
  formData.append('model_name', modelName);

  const response = await api.post('/shap', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getLime = async (imageUuid, modelName) => {
  const formData = new FormData();
  formData.append('image_uuid', imageUuid);
  formData.append('model_name', modelName);

  const response = await api.post('/lime', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const generateReport = async (imageUuid) => {
  const formData = new FormData();
  formData.append('image_uuid', imageUuid);

  const response = await api.post('/generate-report', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getImageUrl = (path) => {
  if (!path) return '';
  // Check if path is already a full URL or starts with slash
  if (path.startsWith('http')) return path;
  return `${API_BASE_URL}${path}`;
};
