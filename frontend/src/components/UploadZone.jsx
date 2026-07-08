import React, { useState, useRef } from 'react';
import { predict, ensemble, getModels } from '../utils';
import { UploadCloud, File, AlertTriangle, ShieldAlert, Cpu } from 'lucide-react';

const UploadZone = ({
  onPredictSuccess,
  onPredictStart,
  models,
  isLoading,
  error,
  setError
}) => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedModel, setSelectedModel] = useState('ViT');
  const [isEnsemble, setIsEnsemble] = useState(false);
  const [ensembleModels, setEnsembleModels] = useState(['ViT', 'Swin']);
  const [ensembleMethod, setEnsembleMethod] = useState('soft');
  
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (selectedFile) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(selectedFile.type)) {
      setError("Invalid file format. Please upload PNG, JPG, or JPEG.");
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > maxSize) {
      setError("File exceeds 10MB limit. Select a smaller image.");
      return;
    }

    setError(null);
    setFile(selectedFile);
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleCheckboxChange = (modelId) => {
    if (ensembleModels.includes(modelId)) {
      if (ensembleModels.length > 2) {
        setEnsembleModels(ensembleModels.filter(m => m !== modelId));
      } else {
        setError("Ensemble mode requires at least 2 models.");
      }
    } else {
      setError(null);
      setEnsembleModels([...ensembleModels, modelId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    onPredictStart();
    setError(null);

    try {
      let data;
      if (isEnsemble) {
        // Ensembles require an initial /predict or dynamic predict.
        // We first upload/predict using the first model to get the image UUID
        const initData = await predict(file, ensembleModels[0]);
        // Then execute the multi-model ensemble using the cached UUID
        data = await ensemble(initData.image_uuid, ensembleModels, ensembleMethod);
        
        // Add URL details from original image
        data.original_url = initData.original_url;
        data.noise_url = initData.noise_url;
        data.edge_url = initData.edge_url;
        data.artifact_url = initData.artifact_url;
      } else {
        // Single Model mode
        data = await predict(file, selectedModel);
      }
      onPredictSuccess(data, isEnsemble ? 'ensemble' : selectedModel);
    } catch (err) {
      setError(err.response?.data?.detail || "Inference failed. Check backend connection.");
      onPredictSuccess(null);
    }
  };

  return (
    <div className="glass-panel p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Toggle Mode */}
        <div className="flex border-b border-slate-900 pb-4 justify-between items-center">
          <span className="text-sm font-mono text-slate-400">DETECTION MODE CONTEXT</span>
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-900">
            <button
              type="button"
              onClick={() => { setIsEnsemble(false); setError(null); }}
              className={`px-3 py-1.5 rounded text-xs font-mono tracking-wider transition-all duration-300 ${
                !isEnsemble ? 'bg-cyber-primary text-white shadow-neon-blue' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              SINGLE MODEL
            </button>
            <button
              type="button"
              onClick={() => { setIsEnsemble(true); setError(null); }}
              className={`px-3 py-1.5 rounded text-xs font-mono tracking-wider transition-all duration-300 ${
                isEnsemble ? 'bg-cyber-primary text-white shadow-neon-blue' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              ENSEMBLE
            </button>
          </div>
        </div>

        {/* Configurations based on mode */}
        {!isEnsemble ? (
          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-500 uppercase">Select Target Model</label>
            <div className="grid grid-cols-4 gap-3">
              {Object.keys(models).map((modelId) => (
                <button
                  type="button"
                  key={modelId}
                  onClick={() => setSelectedModel(modelId)}
                  className={`p-3 rounded-lg border text-left transition-all duration-300 ${
                    selectedModel === modelId
                      ? 'border-cyber-primary bg-cyber-primary/5 text-white'
                      : 'border-slate-900 bg-slate-950/40 text-slate-400 hover:border-slate-800'
                  }`}
                >
                  <div className="text-xs font-bold font-sans">{modelId}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">PARAMS: {models[modelId].parameters}</div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-500 uppercase">Select Coalition Models (Min 2)</label>
              <div className="grid grid-cols-4 gap-3">
                {Object.keys(models).map((modelId) => {
                  const checked = ensembleModels.includes(modelId);
                  return (
                    <div
                      key={modelId}
                      onClick={() => handleCheckboxChange(modelId)}
                      className={`p-3 rounded-lg border text-left transition-all duration-300 cursor-pointer ${
                        checked
                          ? 'border-cyber-secondary bg-cyber-secondary/5 text-white'
                          : 'border-slate-900 bg-slate-950/40 text-slate-400 hover:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold font-sans">{modelId}</span>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {}} // Handled by div onClick
                          className="rounded border-slate-800 bg-slate-950 text-cyber-secondary focus:ring-cyber-secondary/30 h-4.5 w-4.5"
                        />
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-1">ACCURACY: {(models[modelId].accuracy * 100).toFixed(1)}%</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-500 uppercase">Ensemble Voting Method</label>
              <div className="grid grid-cols-3 gap-3">
                {['soft', 'majority', 'weighted'].map((method) => (
                  <button
                    type="button"
                    key={method}
                    onClick={() => setEnsembleMethod(method)}
                    className={`p-2.5 rounded-lg border text-xs font-mono transition-all duration-300 ${
                      ensembleMethod === method
                        ? 'border-cyber-primary bg-cyber-primary/5 text-white'
                        : 'border-slate-900 bg-slate-950/40 text-slate-400 hover:border-slate-800'
                    }`}
                  >
                    {method.toUpperCase()} VOTING
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Dropzone */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileSelect}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 scanner-line ${
            dragActive 
              ? 'border-cyber-primary bg-cyber-primary/5 shadow-neon-blue' 
              : 'border-slate-800 hover:border-slate-700 bg-slate-950/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleChange}
            accept=".png, .jpg, .jpeg"
            className="hidden"
          />
          
          <div className="flex flex-col items-center justify-center space-y-3">
            <UploadCloud className={`h-12 w-12 ${dragActive ? 'text-cyber-primary' : 'text-slate-500'} transition-colors`} />
            <div>
              <p className="text-sm text-slate-300 font-semibold">
                Drag & Drop forensic image file here
              </p>
              <p className="text-xs text-slate-500 mt-1">
                or click to browse local files (PNG, JPG, JPEG)
              </p>
            </div>
            {file && (
              <div className="inline-flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800 mt-4 animate-fade-in">
                <File className="h-4 w-4 text-cyber-primary" />
                <span className="text-xs text-slate-300 max-w-[200px] truncate font-mono">{file.name}</span>
                <span className="text-[10px] text-slate-500 font-mono">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
              </div>
            )}
          </div>
        </div>

        {/* Errors / Warnings */}
        {error && (
          <div className="flex items-center space-x-3 bg-red-950/40 border border-red-900/50 text-red-400 p-3 rounded-lg text-xs font-mono">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>ERROR: {error}</span>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!file || isLoading}
          className="w-full neon-btn-primary flex items-center justify-center space-x-2 py-3 rounded-xl"
        >
          {isLoading ? (
            <>
              <div className="h-4.5 w-4.5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
              <span className="font-mono text-sm tracking-widest uppercase">SCANNING ENVELOPE PIXELS...</span>
            </>
          ) : (
            <>
              <ShieldAlert className="h-5 w-5" />
              <span className="font-mono text-sm tracking-widest uppercase">EXECUTE STEG-FORENSIC SCAN</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default UploadZone;
