import React, { useState } from 'react';
import { getImageUrl } from '../utils';
import { Eye, Info, X } from 'lucide-react';

const ResidualViewer = ({ result }) => {
  if (!result) return null;

  const [expandedImage, setExpandedImage] = useState(null);

  const residualSpecs = [
    {
      key: 'original',
      label: 'Original Image',
      url: getImageUrl(result.original_url),
      description: 'Standard uploaded image scaled to 224x224 input resolution.',
      details: 'This is the base image under inspection, converted to RGB. No filters applied.'
    },
    {
      key: 'noise',
      label: 'High-Pass Noise Residual',
      url: getImageUrl(result.noise_url),
      description: 'Isolates high-frequency noise by Gaussian-blur subtraction.',
      details: 'Steganographic payloads (especially from generative ViT-DiffSteg) disrupt high-frequency pixel distributions. This filter filters out low-frequency shapes to inspect artificial noise artifacts.'
    },
    {
      key: 'edge',
      label: 'Edge Texture Residual',
      url: getImageUrl(result.edge_url),
      description: 'Highlights structural edges using directional Sobel filters.',
      details: 'Steganographic insertion is typically masked inside complex textures and sharp edges to avoid human detection. Visualizing edges highlights changes in these masks.'
    },
    {
      key: 'artifact',
      label: 'Statistical Artifact Map',
      url: getImageUrl(result.artifact_url),
      description: 'Plots local standard deviation to map spatial entropy.',
      details: 'Unnatural embedding algorithms distort local pixel correlation vectors. High variance and local disruptions appear as statistical anomalies in this cold metal mapping.'
    }
  ];

  return (
    <div className="glass-panel p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-900 pb-4">
        <div className="flex items-center space-x-2">
          <Eye className="h-5 w-5 text-cyber-secondary animate-pulse" />
          <h3 className="text-sm font-mono text-slate-300">FORENSIC RESIDUAL DECONSTRUCTION</h3>
        </div>
        <span className="text-[10px] font-mono text-slate-500 uppercase">METHODOLOGY: HIGH-FREQUENCY ISOLATION</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {residualSpecs.map((spec) => (
          <div key={spec.key} className="glass-card flex flex-col justify-between group overflow-hidden relative">
            <div className="space-y-3">
              {/* Header Label */}
              <div className="flex items-start justify-between">
                <span className="text-xs font-bold text-white tracking-wide">{spec.label}</span>
                <button 
                  type="button"
                  title="Filter details"
                  onClick={() => alert(`${spec.label}:\n\n${spec.details}`)}
                  className="text-slate-500 hover:text-slate-300"
                >
                  <Info className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Image Preview Container */}
              <div className="relative rounded overflow-hidden bg-slate-950 border border-slate-900 flex justify-center items-center h-44 group">
                <img 
                  src={spec.url} 
                  alt={spec.label} 
                  className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Overlay Zoom Action */}
                <div 
                  onClick={() => setExpandedImage(spec)}
                  className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity duration-300"
                >
                  <span className="text-xs font-mono text-white flex items-center space-x-2 border border-slate-700 px-3 py-1.5 rounded-full bg-slate-900">
                    <Eye className="h-3.5 w-3.5" />
                    <span>MAGNIFY</span>
                  </span>
                </div>
              </div>

              {/* Short description */}
              <p className="text-[10px] text-slate-400 font-mono leading-tight">{spec.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Expanded Magnify Modal */}
      {expandedImage && (
        <div className="fixed inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 max-w-2xl w-full rounded-xl overflow-hidden shadow-2xl relative flex flex-col">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/60">
              <div>
                <h3 className="font-bold text-white text-base">{expandedImage.label}</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{expandedImage.description}</p>
              </div>
              <button 
                onClick={() => setExpandedImage(null)}
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex flex-col items-center justify-center bg-slate-950/30">
              <div className="border border-slate-800 rounded-lg p-2 bg-slate-950 max-w-sm w-full flex justify-center items-center">
                <img 
                  src={expandedImage.url} 
                  alt={expandedImage.label} 
                  className="max-h-[350px] object-contain rounded"
                />
              </div>
              
              <div className="mt-6 border-t border-slate-800/80 pt-4 w-full">
                <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider">Forensic Investigation Context</h4>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed bg-slate-950/40 p-3 rounded border border-slate-900 font-mono">
                  {expandedImage.details}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResidualViewer;
