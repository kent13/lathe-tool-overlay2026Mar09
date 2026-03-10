import React from 'react';
import { motion } from 'motion/react';
import { X, Maximize2, Minimize2 } from 'lucide-react';

interface ToolOverlayProps {
  imageUrl: string;
  onClose: () => void;
}

export const ToolOverlay: React.FC<ToolOverlayProps> = ({ imageUrl, onClose }) => {
  console.log('ToolOverlay is rendering');
  const [scale, setScale] = React.useState(1);
  const [opacity, setOpacity] = React.useState(0.7);
  const [showControls, setShowControls] = React.useState(true);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-50 group pointer-events-none"
    >
      <div className="relative w-full h-full pointer-events-none">
        {/* Controls - visible on hover or when toggled, positioned at bottom */}
        <div 
          onPointerDown={(e) => e.stopPropagation()}
          className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 transition-all bg-black/80 backdrop-blur-xl rounded-2xl p-3 border border-white/20 pointer-events-auto shadow-2xl z-[60] ${
            showControls ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
          } group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto`}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => setScale(s => Math.min(s + 0.1, 5))}
              className="p-2 hover:bg-white/10 rounded-xl text-white transition-colors"
              title="Zoom In"
            >
              <Maximize2 size={20} />
            </button>
            <button
              onClick={() => setScale(s => Math.max(s - 0.1, 0.1))}
              className="p-2 hover:bg-white/10 rounded-xl text-white transition-colors"
              title="Zoom Out"
            >
              <Minimize2 size={20} />
            </button>
          </div>
          
          <div className="w-px h-8 bg-white/20 mx-1" />
          
          <div className="flex items-center gap-3 px-2">
            <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Opacity</span>
            <input 
              type="range" 
              min="0.1" 
              max="1" 
              step="0.05" 
              value={opacity} 
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="w-24 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>

          <div className="w-px h-8 bg-white/20 mx-1" />

          <button
            onClick={onClose}
            className="p-2 hover:bg-red-500/50 rounded-xl text-white transition-colors"
            title="Remove Overlay"
          >
            <X size={20} />
          </button>
        </div>

        <motion.img
          src={imageUrl}
          alt="Captured Tool"
          onClick={() => setShowControls(!showControls)}
          className="w-full h-full object-cover pointer-events-auto select-none"
          style={{ 
            filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.8))',
            mixBlendMode: 'normal'
          }}
          animate={{ 
            scale,
            opacity
          }}
          transition={{ 
            scale: { duration: 0.2 },
            opacity: { duration: 0.2 }
          }}
        />
      </div>
    </motion.div>
  );
};
