import React, { useState, useEffect } from 'react';
import { getModels } from '../utils';
import { Bar } from 'react-chartjs-2';
import { BarChart3, Info, Cpu, Award } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Re-insure ChartJS elements are mapped
try {
  ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
} catch (e) {
  console.log("Chart JS registry hook active");
}

const ModelComparison = () => {
  const [modelsInfo, setModelsInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const data = await getModels();
        setModelsInfo(data.models || {});
        setError(null);
      } catch (err) {
        setError("Failed to load model metrics from api server.");
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  const renderComparisonChart = () => {
    if (Object.keys(modelsInfo).length === 0) return null;

    const modelNames = Object.keys(modelsInfo);
    
    // Group metrics
    const accuracyData = modelNames.map(name => modelsInfo[name].accuracy);
    const f1Data = modelNames.map(name => modelsInfo[name].f1_score);
    const aucData = modelNames.map(name => modelsInfo[name].roc_auc);

    const chartData = {
      labels: modelNames,
      datasets: [
        {
          label: 'Accuracy Score',
          data: accuracyData,
          backgroundColor: 'rgba(2, 132, 199, 0.75)', // Sky blue
          borderColor: '#0284c7',
          borderWidth: 1,
        },
        {
          label: 'F1 Score',
          data: f1Data,
          backgroundColor: 'rgba(13, 148, 136, 0.75)', // Teal
          borderColor: '#0d9488',
          borderWidth: 1,
        },
        {
          label: 'ROC-AUC Index',
          data: aucData,
          backgroundColor: 'rgba(168, 85, 247, 0.75)', // Purple
          borderColor: '#a855f7',
          borderWidth: 1,
        }
      ]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#94a3b8',
            font: { family: 'JetBrains Mono', size: 10 }
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => `${context.dataset.label}: ${(context.raw * 100).toFixed(1)}%`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono', size: 10 } }
        },
        y: {
          grid: { color: 'rgba(30, 41, 59, 0.5)' },
          min: 0.8, // Zoom in on the high performance range [80% - 100%]
          max: 1.0,
          ticks: { 
            color: '#94a3b8', 
            font: { family: 'JetBrains Mono', size: 9 },
            callback: (value) => `${(value * 100).toFixed(0)}%`
          }
        }
      }
    };

    return (
      <div className="h-80 bg-slate-950/40 border border-slate-900 rounded-xl p-5">
        <Bar data={chartData} options={options} />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="h-10 w-10 border-4 border-cyber-primary/20 border-t-cyber-primary rounded-full animate-spin" />
        <p className="text-xs font-mono text-slate-400 uppercase tracking-widest animate-pulse">
          COMPILING METRICS ARCHITECTURE PLOT...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 max-w-md mx-auto space-y-4">
        <h3 className="text-lg font-bold text-white">Metrics Server Unreachable</h3>
        <p className="text-xs text-slate-400 leading-relaxed font-mono">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto py-4">
      {/* Chart Section */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-900 pb-4">
          <BarChart3 className="h-5 w-5 text-cyber-primary" />
          <h3 className="text-sm font-mono text-slate-300">BENCHMARK PERFORMANCE INDEX</h3>
        </div>
        {renderComparisonChart()}
      </div>

      {/* Specifications Table Section */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-900 pb-4">
          <Cpu className="h-5 w-5 text-cyber-secondary" />
          <h3 className="text-sm font-mono text-slate-300">MODEL ARCHITECTURE SPECS</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-[11px] text-slate-400">
            <thead>
              <tr className="border-b border-slate-900 bg-slate-950/80 text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 font-mono font-normal">Model ID</th>
                <th className="py-3 px-4 font-mono font-normal">Params Size</th>
                <th className="py-3 px-4 font-mono font-normal">Accuracy</th>
                <th className="py-3 px-4 font-mono font-normal">Precision</th>
                <th className="py-3 px-4 font-mono font-normal">Recall</th>
                <th className="py-3 px-4 font-mono font-normal">F1 Score</th>
                <th className="py-3 px-4 font-mono font-normal">ROC-AUC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/60">
              {Object.keys(modelsInfo).map((modelId) => {
                const item = modelsInfo[modelId];
                return (
                  <tr key={modelId} className="hover:bg-slate-900/20 transition-colors">
                    <td className="py-4 px-4 text-white font-bold">{modelId}</td>
                    <td className="py-4 px-4 text-slate-400">{item.parameters}</td>
                    <td className="py-4 px-4 text-cyber-primary font-bold">{(item.accuracy * 100).toFixed(1)}%</td>
                    <td className="py-4 px-4">{(item.precision * 100).toFixed(1)}%</td>
                    <td className="py-4 px-4">{(item.recall * 100).toFixed(1)}%</td>
                    <td className="py-4 px-4">{(item.f1_score * 100).toFixed(1)}%</td>
                    <td className="py-4 px-4 text-cyber-safe font-bold">{item.roc_auc.toFixed(3)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Narrative Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.keys(modelsInfo).map((modelId) => {
          const item = modelsInfo[modelId];
          return (
            <div key={modelId} className="glass-card p-5 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white tracking-wide">{modelId} Backbone</h4>
                  <Award className="h-4.5 w-4.5 text-cyber-secondary" />
                </div>
                <p className="text-[11px] text-slate-400 font-mono leading-relaxed mt-2">
                  {item.description}
                </p>
              </div>
              <div className="pt-3 border-t border-slate-900 text-[10px] font-mono text-slate-500">
                RECOMMENDED FOR: {modelId.includes('ViT') || modelId.includes('Swin') ? 'TRANSFORMER PAYLOAD ANALYSIS' : 'HIGH-SPEED SPATIAL SCREENING'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ModelComparison;
