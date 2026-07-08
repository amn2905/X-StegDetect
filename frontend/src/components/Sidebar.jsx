import React from 'react';
import { 
  Shield, 
  Home, 
  UploadCloud, 
  Eye, 
  FileText, 
  BarChart3, 
  Cpu 
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'detection', label: 'Detection Engine', icon: UploadCloud },
    { id: 'explainability', label: 'Explainable AI', icon: Eye },
    { id: 'comparison', label: 'Model Comparison', icon: BarChart3 },
    { id: 'reports', label: 'Forensic Reports', icon: FileText },
  ];

  return (
    <aside className="w-64 bg-slate-950/80 border-r border-slate-900 flex flex-col h-screen sticky top-0 backdrop-blur-md z-20">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-900 flex items-center space-x-3">
        <Shield className="h-7 w-7 text-cyber-primary animate-pulse" />
        <div>
          <h1 className="font-extrabold font-sans text-white text-lg tracking-wider">X-StegDetect</h1>
          <span className="text-[10px] text-cyber-muted uppercase tracking-widest font-mono">Forensic Portal</span>
        </div>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium tracking-wide transition-all duration-300 ${
                isActive 
                  ? 'bg-cyber-primary/10 border-l-4 border-cyber-primary text-white shadow-inner shadow-cyber-primary/5' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border-l-4 border-transparent'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-cyber-primary' : 'text-slate-500 group-hover:text-slate-300'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* System Status Footer */}
      <div className="p-4 border-t border-slate-900 bg-slate-950/40">
        <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-500">
          <div className="h-2.5 w-2.5 rounded-full bg-cyber-safe animate-ping" />
          <span>PORTAL SECURE (v1.0.0)</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
