import React, { useState, useEffect } from 'react';
import { getGradCam, getShap, getLime, getImageUrl } from '../utils';
import { Eye, ShieldAlert, Cpu, BarChart2, CheckCircle } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend
} from 'chart.js';

// Ensure Chart.js features are registered properly
try {
  ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend);
} catch (e) {
  console.log("Chart JS registry hook active");
}

const XAIViewer = ({ imageUuid, modelName }) => {
  const [activeXaiTab, setActiveXaiTab] = useState('gradcam');
  
  // Data caches for current imageUuid
  const [xaiData, setXaiData] = useState({
    gradcam: { url: null, loading: false, loaded: false },
    shap: { url: null, contributions: [], loading: false, loaded: false },
    lime: { url: null, contributions: [], loading: false, loaded: false }
  });
  const [error, setError] = useState(null);

  // Clear cache if imageUuid changes
  useEffect(() => {
    setXaiData({
      gradcam: { url: null, loading: false, loaded: false },
      shap: { url: null, contributions: [], loading: false, loaded: false },
      lime: { url: null, contributions: [], loading: false, loaded: false }
    });
    setError(null);
  }, [imageUuid]);

  // Load XAI outputs when tab changes
  useEffect(() => {
    if (!imageUuid) return;
    
    const loadXai = async () => {
      const current = xaiData[activeXaiTab];
      if (current.loaded || current.loading) return;

      // Update loading state
      setXaiData(prev => ({
        ...prev,
        [activeXaiTab]: { ...prev[activeXaiTab], loading: true }
      }));
      setError(null);

      try {
        let res;
        if (activeXaiTab === 'gradcam') {
          res = await getGradCam(imageUuid, modelName);
          setXaiData(prev => ({
            ...prev,
            gradcam: { url: res.gradcam_url, loaded: true, loading: false }
          }));
        } else if (activeXaiTab === 'shap') {
          res = await getShap(imageUuid, modelName);
          setXaiData(prev => ({
            ...prev,
            shap: { 
              url: res.shap_url, 
              contributions: res.contributions || [],
              loaded: true, 
              loading: false 
            }
          }));
        } else if (activeXaiTab === 'lime') {
          res = await getLime(imageUuid, modelName);
          setXaiData(prev => ({
            ...prev,
            lime: { 
              url: res.lime_url, 
              contributions: res.contributions || [],
              loaded: true, 
              loading: false 
            }
          }));
        }
      } catch (err) {
        setError(`Failed to generate ${activeXaiTab.toUpperCase()} explanation map.`);
        setXaiData(prev => ({
          ...prev,
          [activeXaiTab]: { ...prev[activeXaiTab], loading: false }
        }));
      }
    };

    loadXai();
  }, [activeXaiTab, imageUuid, modelName]);

  const renderShapChart = () => {
    const contributions = xaiData.shap.contributions;
    if (!contributions || contributions.length === 0) return null;

    // Sort contributions to make chart readable
    const sorted = [...contributions].sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value)).slice(0, 10);
    
    const labels = sorted.map(c => `Seg #${c.segment_id}`);
    const dataValues = sorted.map(c => c.shap_value);
    // Red color for positive contributions (adds to stego verdict)
    // Blue color for negative contributions (adds to cover verdict)
    const backgroundColors = sorted.map(c => c.contribution === 'STEGO' ? 'rgba(239, 68, 68, 0.7)' : 'rgba(2, 132, 199, 0.7)');
    const borderColors = sorted.map(c => c.contribution === 'STEGO' ? '#ef4444' : '#0284c7');

    const chartData = {
      labels,
      datasets: [
        {
          label: 'Shapley Contribution Value',
          data: dataValues,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
        }
      ]
    };

    const options = {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => `SHAP: ${context.raw.toFixed(4)}`
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(30, 41, 59, 0.5)' },
          ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono', size: 9 } }
        },
        y: {
          grid: { display: false },
          ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono', size: 9 } }
        }
      }
    };

    return (
      <div className="h-56 bg-slate-950/40 border border-slate-900 rounded-lg p-3">
        <Bar data={chartData} options={options} />
      </div>
    );
  };

  const getActiveView = () => {
    const tabInfo = xaiData[activeXaiTab];

    if (tabInfo.loading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="h-10 w-10 border-4 border-cyber-primary/20 border-t-cyber-primary rounded-full animate-spin" />
          <p className="text-xs font-mono text-slate-400 uppercase tracking-widest animate-pulse">
            COMPUTING {activeXaiTab.toUpperCase()} ATTRIBUTION MATRICES...
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-16 space-y-3 bg-red-950/20 border border-red-950 rounded-lg">
          <ShieldAlert className="h-10 w-10 text-cyber-accent mx-auto" />
          <p className="text-sm font-mono text-red-400">{error}</p>
        </div>
      );
    }

    if (!tabInfo.loaded) return null;

    if (activeXaiTab === 'gradcam') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white tracking-wide">Attention Region Heatmap</h4>
            <div className="border border-slate-900 rounded-xl p-3 bg-slate-950 flex justify-center items-center h-72">
              <img 
                src={getImageUrl(tabInfo.url)} 
                alt="Grad-CAM" 
                className="max-h-full object-contain rounded"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-900 pb-3">
              <Cpu className="h-5 w-5 text-cyber-primary" />
              <h4 className="text-xs font-mono uppercase text-slate-400">Interpretation Details</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-950/40 p-4 rounded-lg border border-slate-900">
              Grad-CAM (Gradient-weighted Class Activation Mapping) uses the gradients of the steganography verdict logits, 
              flowing into the final convolutional feature maps (or reshaped token sequences in ViT/Swin architectures). 
              The red/warm hotspots isolate the specific image coordinates where neural attention detected embedding noise. 
              Diffusion anomalies generally group in structured local networks rather than spreading flatly across homogeneous pixels.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-slate-950/60 rounded border border-slate-900 text-center">
                <div className="text-xs font-mono text-slate-500">TARGET LAYER</div>
                <div className="text-xs font-bold text-white mt-1">Final Block Output</div>
              </div>
              <div className="p-3 bg-slate-950/60 rounded border border-slate-900 text-center">
                <div className="text-xs font-mono text-slate-500">HOTSPOT RESOLUTION</div>
                <div className="text-xs font-bold text-white mt-1">224 x 224 Pixels</div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeXaiTab === 'shap') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white tracking-wide">SHAP Segment Coalitions</h4>
            <div className="border border-slate-900 rounded-xl p-3 bg-slate-950 flex justify-center items-center h-72">
              <img 
                src={getImageUrl(tabInfo.url)} 
                alt="SHAP" 
                className="max-h-full object-contain rounded"
              />
            </div>
          </div>

          <div className="space-y-4 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-mono uppercase text-slate-400 border-b border-slate-900 pb-3">
                Top 10 Feature Contributions
              </h4>
              <p className="text-[11px] text-slate-500 font-mono mt-2 mb-3">
                Red blocks pull towards STEGO, Blue blocks pull towards COVER. Chart represents relative Shapley weight magnitudes.
              </p>
              {renderShapChart()}
            </div>
            
            <p className="text-[11px] text-slate-400 font-mono leading-relaxed bg-slate-950/40 p-3 rounded border border-slate-900">
              SHAP calculates game-theoretic Shapley values by training linear surrogate classifiers over binary superpixel coalitions. 
              It guarantees additive feature attribution, ensuring the sum of segment weights equals the margin between prediction and base average probability.
            </p>
          </div>
        </div>
      );
    }

    if (activeXaiTab === 'lime') {
      const positiveSuperpixels = tabInfo.contributions.filter(c => c.evidence === 'STEGO');
      const negativeSuperpixels = tabInfo.contributions.filter(c => c.evidence === 'COVER');

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white tracking-wide">LIME Boundaries Mapping</h4>
            <div className="border border-slate-900 rounded-xl p-3 bg-slate-950 flex justify-center items-center h-72">
              <img 
                src={getImageUrl(tabInfo.url)} 
                alt="LIME" 
                className="max-h-full object-contain rounded"
              />
            </div>
          </div>

          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <h4 className="text-xs font-mono uppercase text-slate-400 border-b border-slate-900 pb-3">
                Superpixel Evidence Registry
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-cyber-accent uppercase flex items-center space-x-1.5">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    <span>Stego Evidence ({positiveSuperpixels.length})</span>
                  </span>
                  <div className="bg-slate-950/60 rounded border border-slate-900 max-h-36 overflow-y-auto p-2 space-y-1">
                    {positiveSuperpixels.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[10px] font-mono p-1 bg-red-950/10 rounded">
                        <span className="text-slate-400">Superpixel #{item.superpixel_id}</span>
                        <span className="text-cyber-accent">+{item.weight.toFixed(4)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-cyber-safe uppercase flex items-center space-x-1.5">
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>Cover Evidence ({negativeSuperpixels.length})</span>
                  </span>
                  <div className="bg-slate-950/60 rounded border border-slate-900 max-h-36 overflow-y-auto p-2 space-y-1">
                    {negativeSuperpixels.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[10px] font-mono p-1 bg-emerald-950/10 rounded">
                        <span className="text-slate-400">Superpixel #{item.superpixel_id}</span>
                        <span className="text-cyber-safe">{item.weight.toFixed(4)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 font-mono leading-relaxed bg-slate-950/40 p-3 rounded border border-slate-900">
              LIME builds local interpretable models by perturbing the target image (turning superpixel segments black) and fitting 
              a weighted ridge regression model over the output probabilities. Green regions indicate Cover supporting superpixels, 
              whereas Red boundaries label the suspicious embedding matrices.
            </p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="glass-panel p-6 space-y-6">
      <div className="flex border-b border-slate-900 pb-4 justify-between items-center">
        <div className="flex items-center space-x-2">
          <BarChart2 className="h-5 w-5 text-cyber-primary" />
          <h3 className="text-sm font-mono text-slate-300">EXPLAINABLE AI SUB-EXAMINATION</h3>
        </div>

        {/* XAI Mode Selectors */}
        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-900">
          {['gradcam', 'shap', 'lime'].map((xaiTab) => (
            <button
              type="button"
              key={xaiTab}
              onClick={() => setActiveXaiTab(xaiTab)}
              className={`px-3 py-1.5 rounded text-xs font-mono tracking-wider transition-all duration-300 ${
                activeXaiTab === xaiTab ? 'bg-cyber-primary text-white shadow-neon-blue' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {xaiTab.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div>
        {getActiveView()}
      </div>
    </div>
  );
};

export default XAIViewer;
