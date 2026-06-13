import React from 'react';
import { Sparkles, User, FileJson, Settings } from 'lucide-react';

interface TabsHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function TabsHeader({ activeTab, setActiveTab }: TabsHeaderProps) {
  const tabs = [
    { id: 'playground', name: 'Interactive Simulator', icon: Sparkles },
    { id: 'profile', name: 'Secure Profile Vault', icon: User },
    { id: 'exporter', name: 'Chrome Code Exporter', icon: FileJson },
  ];

  return (
    <div className="border-b border-slate-800 bg-slate-900/80 shadow-lg backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-extrabold shadow-lg shadow-indigo-500/20 text-lg animate-pulse">
              ✨
            </div>
            <div>
              <h1 className="text-base font-black text-white tracking-tight leading-none">
                OmniFill AI <span className="text-slate-500 font-normal ml-1.5 text-xs">v3.4.0</span>
              </h1>
              <p className="text-[10px] font-mono text-indigo-400 tracking-wider font-semibold uppercase mt-1">
                Chrome Manifest V3 Simulator
              </p>
            </div>
          </div>
          
          <nav className="flex space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800" aria-label="Tabs" id="applet_navigation_tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab_button_${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center space-x-2 text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>AI Engine Online</span>
          </div>
        </div>
      </div>
    </div>
  );
}
