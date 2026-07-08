import React from 'react';
import { ShieldCheck, ShieldAlert, Clock, Cpu, BarChart } from 'lucide-react';

const MetricsCard = ({ result, modelName, onViewExplainability }) => {
  if (!result) return null;

  const isStego = result.prediction === 'STEGO';

  return (
    <div className={`glass-panel p-6 overflow-hidden relative ${isStego ? 'glow-stego border-red-900/60' : 'glow-cover border-emerald-900/60'}`}>
      {/* Decorative side color strip */}
      <div className={`absolute top-0 left-0 w-2.5 h-full ${isStego ? 'bg-cyber-accent' : 'bg-cyber-safe'}`} />

      <div className="space-y-6 pl-2">
        {/* Title */}
        <div className="flex items-center justify-between border-b border-slate-900 pb-4">
          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">SCAN ANALYSIS RESPONSE</span>
          <span className="text-[10px] font-mono bg-slate-950 px-2 py-1 border border-slate-900 rounded text-slate-400">
            UUID: {result.image_uuid ? result.image_uuid.slice(0, 18) : 'N/A'}...
          </span>
        </div>

        {/* Big Verdict Display */}
        <div className="flex items-center space-x-5">
          <div className={`p-4 rounded-xl ${isStego ? 'bg-red-950/40 text-cyber-accent' : 'bg-emerald-950/40 text-cyber-safe'}`}>
            {isStego ? <ShieldAlert className="h-10 w-10 animate-bounce" /> : <ShieldCheck className="h-10 w-10" />}
          </div>
          <div>
            <h3 className="text-xs font-mono text-slate-500 uppercase tracking-wider">Classification Verdict</h3>
            <h1 className={`text-3xl font-extrabold font-sans tracking-wide mt-1 ${isStego ? 'text-cyber-accent' : 'text-cyber-safe'}`}>
              {isStego ? 'STEGANOGRAPHY' : 'CLEAN COVER'}
            </h1>
          </div>
        </div>

        {/* Visual progress bar or metrics grid */}
        <div className="grid grid-cols-3 gap-4">
          {/* Confidence */}
          <div className="glass-card flex flex-col justify-between">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Model Confidence</span>
            <div className="mt-2 flex items-baseline">
              <span className={`text-2xl font-bold font-mono ${isStego ? 'text-cyber-accent' : 'text-cyber-safe'}`}>
                {result.confidence.toFixed(2)}
              </span>
              <span className="text-sm font-mono text-slate-400 ml-1">%</span>
            </div>
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-3">
              <div 
                className={`h-full ${isStego ? 'bg-cyber-accent' : 'bg-cyber-safe'}`} 
                style={{ width: `${result.confidence}%` }}
              />
            </div>
          </div>

          {/* Model name */}
          <div className="glass-card flex flex-col justify-between">
            <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-500 uppercase">
              <Cpu className="h-3.5 w-3.5" />
              <span>Evaluated model</span>
            </div>
            <div className="mt-2">
              <span className="text-lg font-bold text-white block truncate">{result.model || modelName}</span>
              <span className="text-[9px] font-mono text-slate-500 uppercase">STATIC CHECKPOINT</span>
            </div>
          </div>

          {/* Processing speed */}
          <div className="glass-card flex flex-col justify-between">
            <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-500 uppercase">
              <Clock className="h-3.5 w-3.5" />
              <span>Scan latency</span>
            </div>
            <div className="mt-2">
              <span className="text-lg font-bold text-white block">{result.processing_time}</span>
              <span className="text-[9px] font-mono text-slate-500 uppercase">EXECUTION METRIC</span>
            </div>
          </div>
        </div>

        {/* Explainability Call-to-action */}
        <div className="flex pt-2 justify-end">
          <button
            onClick={onViewExplainability}
            className="neon-btn-primary flex items-center space-x-2 px-6"
          >
            <BarChart className="h-4 w-4" />
            <span className="text-xs uppercase font-mono tracking-wider">Inspect Explainability Matrices</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MetricsCard;
