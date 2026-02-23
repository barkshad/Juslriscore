import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { FileUpload } from './components/FileUpload';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { LiveConsultation } from './components/LiveConsultation';
import { DocumentFile, AnalysisResult } from './types';
import { analyzeDocument } from './services/gemini';
import { Loader2, AlertCircle } from 'lucide-react';

export default function App() {
  const [file, setFile] = useState<DocumentFile | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  const handleFileSelect = async (selectedFile: DocumentFile) => {
    setFile(selectedFile);
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const result = await analyzeDocument(selectedFile);
      setAnalysis(result);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze document. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceClick = () => {
    setIsVoiceOpen(true);
  };

  return (
    <Layout onVoiceClick={handleVoiceClick}>
      <div className="space-y-12">
        {/* Hero Section */}
        {!analysis && !isLoading && (
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              AI-Powered Legal Analysis
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              Upload your legal documents for instant summary, deadline extraction, and risk assessment.
            </p>
          </div>
        )}

        {/* Upload Section */}
        {!analysis && (
          <div className="flex justify-center">
            <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center space-y-4 py-12">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <p className="text-slate-600 font-medium animate-pulse">
              JurisCore is analyzing your document...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3 text-red-700">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold">Analysis Failed</h3>
              <p className="text-sm mt-1">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="mt-2 text-sm font-medium underline hover:text-red-800"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Results Dashboard */}
        {analysis && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Analysis Report</h2>
              <button 
                onClick={() => { setAnalysis(null); setFile(null); }}
                className="text-sm text-slate-500 hover:text-blue-600 transition-colors"
              >
                Upload New Document
              </button>
            </div>
            <AnalysisDashboard analysis={analysis} />
          </div>
        )}
      </div>

      {/* Voice Modal */}
      <LiveConsultation isOpen={isVoiceOpen} onClose={() => setIsVoiceOpen(false)} />
    </Layout>
  );
}
