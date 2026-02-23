import React, { useEffect, useRef } from 'react';
import { Mic, MicOff, X, Activity, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLiveSession } from '../hooks/useLiveSession';
import clsx from 'clsx';

interface LiveConsultationProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LiveConsultation: React.FC<LiveConsultationProps> = ({ isOpen, onClose }) => {
  const { isConnected, isSpeaking, error, transcript, startSession, stopSession } = useLiveSession();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen) {
      startSession();
    } else {
      stopSession();
    }
  }, [isOpen, startSession, stopSession]);

  // Simple visualizer effect
  useEffect(() => {
    if (!isConnected || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (isSpeaking) {
        const time = Date.now() / 1000;
        const centerY = canvas.height / 2;
        
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        
        for (let x = 0; x < canvas.width; x++) {
          const y = centerY + Math.sin(x * 0.05 + time * 10) * 20 * Math.sin(time * 2);
          ctx.lineTo(x, y);
        }
        
        ctx.strokeStyle = '#3b82f6'; // blue-500
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        // Flat line
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.strokeStyle = '#cbd5e1'; // slate-300
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isConnected, isSpeaking]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden mx-4"
          >
            {/* Header */}
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-white">
                <Activity className="w-5 h-5 text-blue-400" />
                <h2 className="font-semibold">Live Consultation</h2>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-8 flex flex-col items-center space-y-8">
              {/* Status Indicator */}
              <div className="relative">
                <div className={clsx(
                  "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500",
                  isConnected ? "bg-blue-50" : "bg-slate-100"
                )}>
                  {isConnected ? (
                    <div className="relative">
                      <span className="absolute inset-0 rounded-full bg-blue-400 opacity-20 animate-ping"></span>
                      <Mic className="w-10 h-10 text-blue-600" />
                    </div>
                  ) : (
                    <MicOff className="w-10 h-10 text-slate-400" />
                  )}
                </div>
                {isSpeaking && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center space-x-1 shadow-sm">
                    <Volume2 className="w-3 h-3" />
                    <span>AI Speaking</span>
                  </div>
                )}
              </div>

              {/* Visualizer */}
              <div className="w-full h-16 bg-slate-50 rounded-lg border border-slate-100 overflow-hidden relative">
                <canvas ref={canvasRef} width={300} height={64} className="w-full h-full" />
              </div>

              {/* Transcript / Status Text */}
              <div className="text-center space-y-2 w-full">
                <p className="text-lg font-medium text-slate-800">
                  {isConnected ? (isSpeaking ? "JurisCore is speaking..." : "Listening...") : "Connecting..."}
                </p>
                {error ? (
                  <p className="text-sm text-red-500">{error}</p>
                ) : (
                  <div className="h-32 overflow-y-auto bg-slate-50 rounded p-2 text-left text-sm text-slate-600 border border-slate-100">
                    {transcript ? (
                      <pre className="whitespace-pre-wrap font-sans">{transcript}</pre>
                    ) : (
                      <p className="text-slate-400 text-center italic mt-10">
                        Conversation transcript will appear here...
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-center">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-full font-medium transition-colors text-sm"
              >
                End Session
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
