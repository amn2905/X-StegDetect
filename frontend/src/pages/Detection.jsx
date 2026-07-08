import React, { useState, useEffect } from 'react';
import { getModels } from '../utils';
import UploadZone from '../components/UploadZone';
import MetricsCard from '../components/MetricsCard';
import ResidualViewer from '../components/ResidualViewer';
import { Cpu, Server, WifiOff } from 'lucide-react';

const Detection = ({ 
  predictionResult, 
  setPredictionResult, 
  activeModelName, 
  setActiveModelName, 
  setActiveTab 
}) => {
  const [models, setModels] = useState({});
  const [modelsLoading, setModelsLoading] = useState(true);
  const [modelsError, setModelsError] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [predictError, setPredictError] = useState(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        setModelsLoading(true);
        const data = await getModels();
        setModels(data.models || {});
        setModelsError(null);
      } catch (err) {
        setModelsError("Failed to fetch available models from the backend.");
      } finally {
        setModelsLoading(false);
      }
    };
    fetchModels();
  }, []);

  const handlePredictStart = () => {
    setIsLoading(true);
    setPredictionResult(null);
    setPredictError(null);
  };

  const handlePredictSuccess = (data, modelNameUsed) => {
    setIsLoading(false);
    if (data) {
      setPredictionResult(data);
      setActiveModelName(modelNameUsed);
    }
  };

  if (modelsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="h-10 w-10 border-4 border-cyber-primary/20 border-t-cyber-primary rounded-full animate-spin" />
        <p className="text-xs font-mono text-slate-400 uppercase tracking-widest animate-pulse">
          INITIALIZING FORENSIC DICTIONARY...
        </p>
      </div>
    );
  }

  if (modelsError) {
    return (
      <div className="text-center py-20 max-w-md mx-auto space-y-4">
        <WifiOff className="h-12 w-12 text-cyber-accent mx-auto" />
        <h3 className="text-lg font-bold text-white tracking-wide">Inference Server Unreachable</h3>
        <p className="text-xs text-slate-400 leading-relaxed font-mono">
          Ensure the FastAPI backend server is running locally on <code>http://localhost:8000</code> and has active internet connection or preloaded torchvision models.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="neon-btn-primary px-4 py-2 font-mono text-xs uppercase"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto py-4">
      {/* Configuration and Upload Section */}
      <div className="grid grid-cols-1 gap-6">
        <UploadZone
          onPredictStart={handlePredictStart}
          onPredictSuccess={handlePredictSuccess}
          models={models}
          isLoading={isLoading}
          error={predictError}
          setError={setPredictError}
        />
      </div>

      {/* Inference Scanner Loader */}
      {isLoading && (
        <div className="glass-panel p-8 text-center space-y-4 scanner-line">
          <div className="inline-flex p-3 bg-cyber-primary/10 rounded-full text-cyber-primary animate-spin">
            <Server className="h-7 w-7" />
          </div>
          <h3 className="text-sm font-mono text-white uppercase tracking-wider animate-pulse">Running Digital Forensic Pipeline</h3>
          <p className="text-xs text-slate-400 font-mono max-w-md mx-auto">
            Extracting spatial matrices, isolating high-frequency sub-bands, and feeding inputs into deep network classifiers. This usually completes in under 2 seconds.
          </p>
        </div>
      )}

      {/* Results Display */}
      {predictionResult && (
        <div className="space-y-6 animate-fade-in">
          {/* Prediction Stats Card */}
          <MetricsCard
            result={predictionResult}
            modelName={activeModelName}
            onViewExplainability={() => setActiveTab('explainability')}
          />

          {/* Residual Analysis View */}
          <ResidualViewer result={predictionResult} />
        </div>
      )}
    </div>
  );
};

export default Detection;
