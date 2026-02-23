import React, { useState, useRef } from 'react';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { DocumentFile } from '../types';

interface FileUploadProps {
  onFileSelect: (file: DocumentFile) => void;
  isLoading: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    setError(null);
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are supported.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = (e.target?.result as string).split(',')[1];
      onFileSelect({
        name: file.name,
        type: file.type,
        data: base64,
      });
    };
    reader.onerror = () => setError('Failed to read file.');
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={clsx(
          "relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ease-in-out cursor-pointer",
          isDragging ? "border-blue-500 bg-blue-50/50 scale-[1.02]" : "border-slate-300 hover:border-slate-400 bg-white",
          isLoading && "opacity-50 pointer-events-none"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="application/pdf"
          onChange={handleFileChange}
        />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className={clsx("p-4 rounded-full bg-slate-100", isDragging && "bg-blue-100")}>
            {isLoading ? (
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            ) : (
              <Upload className={clsx("h-8 w-8 text-slate-500", isDragging && "text-blue-600")} />
            )}
          </div>
          
          <div className="space-y-1">
            <p className="text-lg font-medium text-slate-900">
              {isLoading ? "Analyzing Document..." : "Drop your legal document here"}
            </p>
            <p className="text-sm text-slate-500">
              Supports PDF (Max 10MB)
            </p>
          </div>
        </div>

        {error && (
          <div className="absolute bottom-4 left-0 right-0 text-center text-red-500 text-sm font-medium animate-pulse">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};
