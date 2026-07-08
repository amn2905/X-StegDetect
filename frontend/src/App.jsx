import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Detection from './pages/Detection';
import Explainability from './pages/Explainability';
import ModelComparison from './pages/ModelComparison';
import Reports from './pages/Reports';

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [predictionResult, setPredictionResult] = useState(null);
  const [activeModelName, setActiveModelName] = useState('ViT');

  const handlePredictSuccess = (result, modelName) => {
    if (result) {
      setPredictionResult(result);
      setActiveModelName(modelName);

      // Save case details to history
      const history = JSON.parse(localStorage.getItem('xsteg_history') || '[]');
      const exist = history.some(item => item.uuid === result.image_uuid);
      if (!exist) {
        const newCase = {
          uuid: result.image_uuid,
          filename: `Evidence_${result.image_uuid.slice(0, 8)}.png`,
          timestamp: new Date().toLocaleString(),
          model: modelName,
          prediction: result.prediction,
          confidence: result.confidence,
          processingTime: result.processing_time,
          reportUrl: null
        };
        const updated = [newCase, ...history].slice(0, 10);
        localStorage.setItem('xsteg_history', JSON.stringify(updated));
      }
    } else {
      setPredictionResult(null);
    }
  };

  const renderActivePage = () => {
    switch (activeTab) {
      case 'home':
        return <Home setActiveTab={setActiveTab} />;
      case 'detection':
        return (
          <Detection
            predictionResult={predictionResult}
            setPredictionResult={setPredictionResult}
            activeModelName={activeModelName}
            setActiveModelName={setActiveModelName}
            setActiveTab={setActiveTab}
          />
        );
      case 'explainability':
        return (
          <Explainability
            predictionResult={predictionResult}
            activeModelName={activeModelName}
            setActiveTab={setActiveTab}
          />
        );
      case 'comparison':
        return <ModelComparison />;
      case 'reports':
        return (
          <Reports
            predictionResult={predictionResult}
            activeModelName={activeModelName}
            setPredictionResult={setPredictionResult}
            setActiveModelName={setActiveModelName}
          />
        );
      default:
        return <Home setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-cyber-bg font-sans text-slate-100">
      {/* Navigation Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main dashboard content container */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar activeTab={activeTab} />
        
        <main className="flex-1 overflow-y-auto p-8">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
};

export default App;
