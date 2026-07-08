import React, { useEffect, useState } from 'react';
import { getHealth } from '../utils';
import { Cpu, Wifi, WifiOff } from 'lucide-react';

const Navbar = ({ activeTab }) => {
  const [healthInfo, setHealthInfo] = useState({ status: 'offline', device: 'N/A' });
  const [lastCheck, setLastCheck] = useState(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const data = await getHealth();
        setHealthInfo(data);
        setLastCheck(new Date().toLocaleTimeString());
      } catch (err) {
        setHealthInfo({ status: 'offline', device: 'N/A' });
      }
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, []);

  const getPageTitle = () => {
    switch (activeTab) {
      case 'home': return 'Digital Forensic Operations Center';
      case 'detection': return 'Steganography Detection Engine';
      case 'explainability': return 'Explainable AI Analysis Suite';
      case 'comparison': return 'Model Architecture Comparison';
      case 'reports': return 'Forensic Evidence Archives';
      default: return 'X-StegDetect Portal';
    }
  };

  const isOnline = healthInfo.status === 'healthy';

  return (
    <header className="h-20 bg-slate-950/40 border-b border-slate-900 px-8 flex items-center justify-between sticky top-0 backdrop-blur-md z-10">
      <div>
        <h2 className="text-xl font-bold font-sans text-white tracking-wide">{getPageTitle()}</h2>
        <p className="text-xs text-cyber-muted font-mono uppercase tracking-wider">
          CASEFILE ACTIVE // STATUS: {isOnline ? 'ONLINE' : 'OFFLINE'}
        </p>
      </div>

      <div className="flex items-center space-x-6">
        {/* Computing device indicator */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded bg-slate-950/80 border border-slate-900 text-xs font-mono">
          <Cpu className="h-4 w-4 text-cyber-primary" />
          <span className="text-slate-400">DEVICE:</span>
          <span className={healthInfo.device.includes('cuda') ? 'text-cyber-safe font-bold' : 'text-cyber-primary font-bold'}>
            {healthInfo.device.toUpperCase()}
          </span>
        </div>

        {/* Health connection state indicator */}
        <div className={`flex items-center space-x-2 px-3 py-1.5 rounded bg-slate-950/80 border border-slate-900 text-xs font-mono`}>
          {isOnline ? (
            <>
              <Wifi className="h-4 w-4 text-cyber-safe animate-pulse" />
              <span className="text-cyber-safe">API CONNECTED</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-cyber-accent" />
              <span className="text-cyber-accent">API OFFLINE</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
