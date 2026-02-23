import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clipboard, CheckCircle, AlertTriangle, Calendar, FileText, Search, Volume2, Loader2 } from 'lucide-react';
import { AnalysisResult, TabId, TabConfig } from '../types';
import { generateSpeech, verifyCitations } from '../services/gemini';
import clsx from 'clsx';
import ReactMarkdown from 'react-markdown';

interface AnalysisDashboardProps {
  analysis: AnalysisResult;
}

const TABS: TabConfig[] = [
  { id: 'summary', label: 'Summary', icon: <FileText className="w-4 h-4" /> },
  { id: 'deadlines', label: 'Deadlines', icon: <Calendar className="w-4 h-4" /> },
  { id: 'citations', label: 'Citations', icon: <Search className="w-4 h-4" /> },
  { id: 'logic_check', label: 'Logic Check', icon: <AlertTriangle className="w-4 h-4" /> },
];

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ analysis }) => {
  const [activeTab, setActiveTab] = useState<TabId>('summary');
  const [copied, setCopied] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handlePlaySummary = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      const audioBuffer = await generateSpeech(analysis.summary);
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createBufferSource();
      const buffer = await audioContext.decodeAudioData(audioBuffer);
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start(0);
      source.onended = () => setIsPlaying(false);
    } catch (error) {
      console.error("Failed to play summary:", error);
      setIsPlaying(false);
    }
  };

  const handleVerifyCitations = async () => {
    if (verifying) return;
    setVerifying(true);
    try {
      const result = await verifyCitations(analysis.citations);
      setVerificationResult(result);
    } catch (error) {
      console.error("Failed to verify citations:", error);
      setVerificationResult("Verification failed.");
    } finally {
      setVerifying(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'summary':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Executive Summary</h3>
              <button
                onClick={handlePlaySummary}
                disabled={isPlaying}
                className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                {isPlaying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
                <span>{isPlaying ? "Playing..." : "Read Aloud"}</span>
              </button>
            </div>
            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
              <ReactMarkdown>{analysis.summary}</ReactMarkdown>
            </div>
          </div>
        );
      case 'deadlines':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Critical Deadlines</h3>
            <ul className="space-y-3">
              {analysis.deadlines.map((deadline, index) => (
                <li key={index} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <Calendar className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700">{deadline}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      case 'citations':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Legal Citations</h3>
              <button
                onClick={handleVerifyCitations}
                disabled={verifying}
                className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
              >
                {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                <span>Verify Citations</span>
              </button>
            </div>
            <ul className="space-y-2 mb-6">
              {analysis.citations.map((citation, index) => (
                <li key={index} className="flex items-center space-x-2 text-slate-700 p-2 hover:bg-slate-50 rounded transition-colors">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                  <span>{citation}</span>
                </li>
              ))}
            </ul>
            {verificationResult && (
              <div className="mt-6 p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
                <h4 className="text-sm font-semibold text-emerald-800 mb-2">Verification Report</h4>
                <div className="prose prose-sm prose-emerald text-emerald-700">
                  <ReactMarkdown>{verificationResult}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        );
      case 'logic_check':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Risk Assessment & Logic Check</h3>
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg text-amber-900">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="prose prose-amber max-w-none">
                  <ReactMarkdown>{analysis.logic_check}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
      {/* Tabs Header */}
      <div className="flex border-b border-slate-200 bg-slate-50/50 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "flex-1 min-w-[120px] flex items-center justify-center space-x-2 py-4 px-4 text-sm font-medium transition-all relative outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset whitespace-nowrap",
              activeTab === tab.id ? "text-blue-600 bg-white" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
              />
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="p-4 sm:p-6 min-h-[400px] relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>

        {/* Copy Button */}
        <div className="absolute top-6 right-6">
          <button
            onClick={() => {
              const content = activeTab === 'summary' ? analysis.summary :
                              activeTab === 'deadlines' ? analysis.deadlines.join('\n') :
                              activeTab === 'citations' ? analysis.citations.join('\n') :
                              analysis.logic_check;
              handleCopy(content, activeTab);
            }}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Copy to clipboard"
          >
            {copied === activeTab ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Clipboard className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
