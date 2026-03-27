/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { WebcamFeed } from './components/WebcamFeed';
import { ToolOverlay } from './components/ToolOverlay';
import { removeBackgroundLocal } from './services/backgroundRemoval';
import { motion, AnimatePresence } from 'motion/react';
import { Info, HelpCircle, X } from 'lucide-react';

interface CapturedTool {
  id: string;
  url: string;
}

export default function App() {
  console.log('App is rendering');
  const [tool, setTool] = useState<CapturedTool | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showHelp, setShowHelp] = useState(true);

  const handleCapture = useCallback(async (base64: string) => {
    setIsProcessing(true);
    try {
      const processedUrl = await removeBackgroundLocal(base64);
      if (processedUrl) {
        setTool({ id: Date.now().toString(), url: processedUrl });
      }
    } catch (error: any) {
      console.error("Capture failed:", error);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      {/* Main Camera View */}
      <div className="relative w-full h-full z-0">
        <WebcamFeed
          onCapture={handleCapture}
          isCapturing={isProcessing}
          showCaptureButton={!tool && !isProcessing}
        />

        {/* Overlays Container */}
        <div className="absolute inset-0 pointer-events-none z-10">
          <AnimatePresence>
            {tool && (
              <div key={tool.id} className="absolute inset-0 pointer-events-none">
                <ToolOverlay
                  imageUrl={tool.url}
                  onClose={() => setTool(null)}
                />
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Crosshair Overlay */}
        <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center opacity-80">
          <div className="relative w-16 h-16">
            <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-green-500/80 -translate-y-1/2 drop-shadow-md" />
            <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-green-500/80 -translate-x-1/2 drop-shadow-md" />
            <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white -translate-x-1/2 -translate-y-1/2 rounded-full drop-shadow-md" />
          </div>
        </div>

        {/* UI Controls */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none z-[100]">
          <div className="pointer-events-auto flex flex-col gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white drop-shadow-md">
              Lathe Tool Overlay
            </h1>
            <p className="text-xs text-white/70 drop-shadow-md">
              Capture tools to compare them with live work.
            </p>
            {tool && (
              <button
                onClick={() => setTool(null)}
                className="mt-2 text-[10px] uppercase tracking-wider font-bold bg-red-500/20 hover:bg-red-500/40 text-red-200 px-2 py-1 rounded border border-red-500/30 transition-colors w-fit"
              >
                Clear Tool
              </button>
            )}
          </div>

          <button
            onClick={() => setShowHelp(true)}
            className="pointer-events-auto p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white/80 hover:bg-black/60 transition-colors"
          >
            <HelpCircle size={20} />
          </button>
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-[100]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
              <p className="text-white font-medium animate-pulse">Processing Locally...</p>
            </div>
          </div>
        )}

        {/* Build Info */}
        <div className="absolute bottom-4 left-4 pointer-events-none z-[100]">
          <p className="text-[10px] text-white/30 font-mono drop-shadow-sm">
            Build: {__BUILD_DATE__}
          </p>
        </div>

        {/* Help Modal */}
        <AnimatePresence>
          {showHelp && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl relative"
              >
                <button
                  onClick={() => setShowHelp(false)}
                  className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>

                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-emerald-500/20 rounded-2xl">
                    <Info className="text-emerald-400" size={24} />
                  </div>
                  <h2 className="text-2xl font-bold">How to use</h2>
                </div>

                <ul className="space-y-4 text-zinc-400">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-200">1</span>
                    <p>Point your camera at a lathe tool against a relatively clear background.</p>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-200">2</span>
                    <p>Tap the camera button to capture. AI will automatically remove the background.</p>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-200">3</span>
                    <p>Scale and adjust the transparency of the tool overlay to compare it with your workpiece.</p>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-200">4</span>
                    <p>Tap the clear button to remove the tool overlay and capture a new one.</p>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-200">5</span>
                    <p><a href="https://www.boohoo.us/wood-workings/HollowFormAssist" target="_blank" rel="noopener noreferrer"> <u>Web Home and Help</u></a></p>
                  </li>
                </ul>

                <button
                  onClick={() => setShowHelp(false)}
                  className="w-full mt-8 py-4 bg-white text-black font-bold rounded-2xl hover:bg-zinc-200 transition-colors"
                >
                  Got it
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
