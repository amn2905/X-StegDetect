import React from 'react';
import XAIViewer from '../components/XAIViewer';
import { EyeOff, Play, ShieldAlert } from 'lucide-react';

const Explainability = ({ predictionResult, activeModelName, setActiveTab }) => {
  if (!predictionResult || !predictionResult.image_uuid) {
    return (
      <div className="space-y-6 max-w-xl mx-auto py-12 animate-fade-in">
        <div className="glass-panel p-8 text-center space-y-4">
          <EyeOff className="h-12 w-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white tracking-wide">No Active Investigation Context</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-mono max-w-md mx-auto">
            To view Explainable AI (Grad-CAM, SHAP, LIME) representations, you must first upload an image and execute a forensic scan.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setActiveTab('detection')}
              className="neon-btn-primary flex items-center space-x-2 px-6 py-2.5 mx-auto font-mono text-xs uppercase"
            >
              <Play className="h-4 w-4" />
              <span>Launch Detection Engine</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isStego = predictionResult.prediction === 'STEGO';

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto py-4">
      {/* Target Active Info Bar */}
      <div className="glass-panel px-6 py-4 flex items-center justify-between bg-slate-950/20">
        <div className="flex items-center space-x-3">
          <span className="flex h-3.5 w-3.5 relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isStego ? 'bg-cyber-accent' : 'bg-cyber-safe'}`}></span>
            <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${isStego ? 'bg-cyber-accent' : 'bg-cyber-safe'}`}></span>
          </span>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase block leading-none">TARGET INVESTIGATION CASE</span>
            <span className="text-xs font-mono font-bold text-white mt-1 block">
              UUID: {predictionResult.image_uuid}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-8 text-xs font-mono">
          <div>
            <span className="text-[10px] text-slate-500 block leading-none">VERDICT</span>
            <span className={`font-bold mt-1 block ${isStego ? 'text-cyber-accent' : 'text-cyber-safe'}`}>
              {predictionResult.prediction} ({predictionResult.confidence.toFixed(2)}%)
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block leading-none">EVALUATION MODEL</span>
            <span className="font-bold text-white mt-1 block">
              {predictionResult.model || activeModelName}
            </span>
          </div>
        </div>
      </div>

      {/* Main XAI Viewer */}
      <XAIViewer 
        imageUuid={predictionResult.image_uuid} 
        modelName={activeModelName} 
      />
    </div>
  );
};

export default Explainability;
