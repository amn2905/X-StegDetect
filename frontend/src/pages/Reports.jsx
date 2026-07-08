import React, { useState, useEffect } from 'react';
import { generateReport, getImageUrl } from '../utils';
import { FileText, Download, Archive, Loader, ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react';

const Reports = ({ predictionResult, activeModelName, setPredictionResult, setActiveModelName }) => {
  const [generating, setGenerating] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [error, setError] = useState(null);
  const [caseHistory, setCaseHistory] = useState([]);

  // Load case history from localStorage on mount
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('xsteg_history') || '[]');
    setCaseHistory(history);
  }, [predictionResult]);

  const handleGenerateReport = async () => {
    if (!predictionResult || !predictionResult.image_uuid) return;

    setGenerating(true);
    setDownloadUrl(null);
    setError(null);

    try {
      // Trigger report compilation on the backend
      const res = await generateReport(predictionResult.image_uuid);
      const fullUrl = getImageUrl(res.report_url);
      setDownloadUrl(fullUrl);
      
      // Update the case in history with the report URL
      const history = JSON.parse(localStorage.getItem('xsteg_history') || '[]');
      const updated = history.map(item => {
        if (item.uuid === predictionResult.image_uuid) {
          return { ...item, reportUrl: fullUrl };
        }
        return item;
      });
      localStorage.setItem('xsteg_history', JSON.stringify(updated));
      setCaseHistory(updated);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to compile PDF. Ensure all XAI overlays are generated.");
    } finally {
      setGenerating(false);
    }
  };

  const handleReloadCase = (item) => {
    setActiveModelName(item.model);
    setPredictionResult({
      image_uuid: item.uuid,
      prediction: item.prediction,
      confidence: item.confidence,
      model: item.model,
      processing_time: item.processingTime || 'N/A',
      original_url: `/static/${item.uuid}_original.png`,
      noise_url: `/static/${item.uuid}_noise.png`,
      edge_url: `/static/${item.uuid}_edge.png`,
      artifact_url: `/static/${item.uuid}_artifact.png`
    });
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear the forensic case history archive?")) {
      localStorage.removeItem('xsteg_history');
      setCaseHistory([]);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto py-4">
      {/* active case section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 glass-panel p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-900 pb-3">
              <FileText className="h-5 w-5 text-cyber-primary" />
              <h3 className="text-sm font-mono text-slate-300">REPORT COMPILER</h3>
            </div>
            
            {predictionResult ? (
              <div className="space-y-3 font-mono text-xs text-slate-400">
                <p>
                  Click the compile button below to build a formalized digital forensic investigation report. The compiler will aggregate tabular parameters, original pixel layers, noise residuals, and available attribution grids (Grad-CAM, SHAP, LIME) into a standardized PDF.
                </p>
                <div className="bg-slate-950/60 p-4 rounded border border-slate-900 grid grid-cols-2 gap-4 text-slate-300">
                  <div>
                    <span className="text-[10px] text-slate-500 block">CASE UUID</span>
                    <span className="font-bold">{predictionResult.image_uuid}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">CLASSIFIER</span>
                    <span className="font-bold">{predictionResult.model || activeModelName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">FORENSIC VERDICT</span>
                    <span className={`font-bold ${predictionResult.prediction === 'STEGO' ? 'text-cyber-accent' : 'text-cyber-safe'}`}>
                      {predictionResult.prediction}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">CONFIDENCE</span>
                    <span className="font-bold text-white">{predictionResult.confidence.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 font-mono py-6">
                No active scan loaded. Select an image in the Detection tab to configure case file details.
              </p>
            )}
          </div>

          <div className="pt-6 border-t border-slate-900/60 mt-4 flex space-x-4">
            <button
              onClick={handleGenerateReport}
              disabled={!predictionResult || generating}
              className="neon-btn-primary flex items-center space-x-2 px-6 py-2.5 font-mono text-xs uppercase"
            >
              {generating ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>COMPILING DATA FIELDS...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  <span>COMPILE FORENSIC PDF</span>
                </>
              )}
            </button>
            
            {downloadUrl && (
              <a
                href={downloadUrl}
                download
                className="bg-cyber-safe hover:bg-cyber-safe/90 text-white font-mono text-xs uppercase px-6 py-2.5 rounded-lg flex items-center space-x-2 shadow-neon-green transition-all"
              >
                <Download className="h-4 w-4" />
                <span>DOWNLOAD REPORT</span>
              </a>
            )}
          </div>

          {error && (
            <div className="mt-4 flex items-center space-x-2 bg-red-950/40 border border-red-900/50 text-red-400 p-3 rounded-lg text-xs font-mono">
              <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Tip information panel */}
        <div className="glass-panel p-6 flex flex-col justify-between bg-slate-950/20">
          <div className="space-y-4">
            <h4 className="text-xs font-mono text-slate-400 uppercase border-b border-slate-900 pb-3">REPORT SPECIFICATIONS</h4>
            <ul className="space-y-2 text-[10px] font-mono text-slate-500 list-disc list-inside">
              <li>Includes MD5 equivalent hashes</li>
              <li>Includes model inference speed metrics</li>
              <li>Exports side-by-side residual noise grids</li>
              <li>Saves Grad-CAM, SHAP, and LIME activation maps</li>
              <li>Attaches automated text verdicts and summaries</li>
            </ul>
          </div>
          <div className="bg-slate-950 border border-slate-900 p-3 rounded text-[10px] font-mono text-slate-400 mt-6 leading-relaxed">
            <strong>Investigator Notice:</strong> Generated PDF reports are stored under the <code>/reports</code> folder of the server and are cached using the active Case UUID.
          </div>
        </div>
      </div>

      {/* Case history section */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-900 pb-4">
          <div className="flex items-center space-x-2">
            <Archive className="h-5 w-5 text-cyber-secondary" />
            <h3 className="text-sm font-mono text-slate-300">FORENSIC ARCHIVES (CASE FILES)</h3>
          </div>
          {caseHistory.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="text-[10px] font-mono text-slate-500 hover:text-cyber-accent uppercase border border-slate-900 px-3 py-1 rounded hover:border-cyber-accent transition-colors"
            >
              Clear Archives
            </button>
          )}
        </div>

        {caseHistory.length === 0 ? (
          <p className="text-xs text-slate-500 font-mono py-8 text-center border border-dashed border-slate-900 rounded-lg">
            No case files currently logged in this session database.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-[11px] text-slate-400">
              <thead>
                <tr className="border-b border-slate-900 bg-slate-950/80 text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 font-mono font-normal">Timestamp</th>
                  <th className="py-3 px-4 font-mono font-normal">Case UUID</th>
                  <th className="py-3 px-4 font-mono font-normal">Filename</th>
                  <th className="py-3 px-4 font-mono font-normal">Model</th>
                  <th className="py-3 px-4 font-mono font-normal">Verdict</th>
                  <th className="py-3 px-4 font-mono font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60">
                {caseHistory.map((item, idx) => {
                  const isItemStego = item.prediction === 'STEGO';
                  return (
                    <tr key={idx} className="hover:bg-slate-900/20 transition-colors">
                      <td className="py-3 px-4 text-slate-500">{item.timestamp}</td>
                      <td className="py-3 px-4 text-white font-semibold">{item.uuid.slice(0, 8)}...</td>
                      <td className="py-3 px-4 text-slate-300 max-w-[150px] truncate">{item.filename}</td>
                      <td className="py-3 px-4">{item.model}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isItemStego ? 'bg-red-950/40 text-cyber-accent border border-red-900/30' : 'bg-emerald-950/40 text-cyber-safe border border-emerald-900/30'
                        }`}>
                          {item.prediction} ({item.confidence.toFixed(1)}%)
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-3">
                        <button
                          onClick={() => handleReloadCase(item)}
                          className="text-cyber-primary hover:underline font-mono text-[10px]"
                        >
                          LOAD SCAN
                        </button>
                        {item.reportUrl && (
                          <a
                            href={item.reportUrl}
                            download
                            className="text-cyber-safe hover:underline font-mono text-[10px] inline-flex items-center space-x-1"
                          >
                            <Download className="h-3 w-3" />
                            <span>PDF</span>
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
