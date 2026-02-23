import React from 'react';
import { Scale, Shield, FileText, Mic } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  onVoiceClick: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, onVoiceClick }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-[#1e293b] text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <Scale className="h-8 w-8 text-blue-400 flex-shrink-0" />
            <h1 className="text-lg sm:text-xl font-bold tracking-tight truncate">
              JurisCore 
              <span className="hidden sm:inline text-slate-400 font-normal text-sm ml-2">Universal Legal AI Dashboard</span>
            </h1>
          </div>
          <div className="flex items-center space-x-4 flex-shrink-0">
            <button 
              onClick={onVoiceClick}
              className="flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 transition-colors text-xs sm:text-sm font-medium"
            >
              <Mic className="h-4 w-4" />
              <span>Voice Mode</span>
            </button>
            <div className="hidden md:flex items-center space-x-1 text-slate-400 text-xs">
              <Shield className="h-3 w-3" />
              <span>Secure Environment</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 mt-auto border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <p>© 2024 JurisCore AI. All rights reserved.</p>
          <p className="mt-2 text-xs text-slate-500">
            DISCLAIMER: JurisCore is an AI tool and not a substitute for legal advice. 
            Always consult with a qualified attorney for professional legal counsel.
          </p>
        </div>
      </footer>
    </div>
  );
};
