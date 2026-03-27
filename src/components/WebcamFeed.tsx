import React, { useRef, useEffect, useState } from 'react';
import { Camera, RefreshCw, Settings, RotateCw } from 'lucide-react';

interface WebcamFeedProps {
  onCapture: (base64: string) => void;
  isCapturing: boolean;
  showCaptureButton?: boolean;
}

export const WebcamFeed: React.FC<WebcamFeedProps> = ({ onCapture, isCapturing, showCaptureButton = true }) => {
  console.log('WebcamFeed is rendering');
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [showDeviceList, setShowDeviceList] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [isPlaying, setIsPlaying] = useState(false);

  // Track container size for proper rotation scaling
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    
    window.addEventListener('resize', updateSize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  const rotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Get list of video devices and initialize camera
  useEffect(() => {
    let stream: MediaStream | null = null;

    async function initCamera() {
      setIsLoading(true);
      try {
        // 1. Request initial stream with facingMode to get permission and labels
        const initialConstraints = {
          video: selectedDeviceId 
            ? { deviceId: { exact: selectedDeviceId }, width: { ideal: 1920 }, height: { ideal: 1080 } }
            : { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        };

        stream = await navigator.mediaDevices.getUserMedia(initialConstraints);

        // 2. Enumerate devices now that we have permission
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = allDevices.filter(device => device.kind === 'videoinput');
        setDevices(videoDevices);

        // 3. Set the stream to the video element
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          // iOS Safari requires playsinline and muted for autoplay
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.setAttribute('muted', 'true');
          
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play()
              .then(() => {
                setIsPlaying(true);
                setIsLoading(false);
              })
              .catch(e => {
                console.error("Video play failed:", e);
                // If autoplay fails, we'll show a button or handle it
                setIsPlaying(false);
                setIsLoading(false);
              });
          };
        }

        // 4. Update selectedDeviceId if not already set
        if (!selectedDeviceId && videoDevices.length > 0) {
          const currentTrack = stream.getVideoTracks()[0];
          const settings = currentTrack.getSettings();
          if (settings.deviceId) {
            setSelectedDeviceId(settings.deviceId);
          }
        }
      } catch (err) {
        console.error("Error initializing camera:", err);
        setError("Could not access camera. Please ensure permissions are granted and you are using HTTPS.");
        setIsLoading(false);
      }
    }

    initCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [selectedDeviceId]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // If rotated 90 or 270, swap width and height for the canvas
      const isPortrait = rotation === 90 || rotation === 270;
      canvas.width = isPortrait ? video.videoHeight : video.videoWidth;
      canvas.height = isPortrait ? video.videoWidth : video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.save();
        // Move to the center of the canvas
        ctx.translate(canvas.width / 2, canvas.height / 2);
        // Rotate the context
        ctx.rotate((rotation * Math.PI) / 180);
        // Draw the video frame centered
        ctx.drawImage(video, -video.videoWidth / 2, -video.videoHeight / 2, video.videoWidth, video.videoHeight);
        ctx.restore();
        
        const dataUrl = canvas.toDataURL('image/png');
        onCapture(dataUrl);
      }
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-zinc-900 text-white p-4 text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
        >
          <RefreshCw size={18} /> Retry
        </button>
      </div>
    );
  }

  const isPortrait = rotation === 90 || rotation === 270;

  return (
    <div ref={containerRef} className="relative w-full h-full bg-zinc-950 overflow-hidden flex items-center justify-center">
      {isLoading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-zinc-950 z-10">
          <RefreshCw className="animate-spin text-white/20" size={48} />
          <p className="text-white/40 text-sm font-medium">Initializing Camera...</p>
        </div>
      )}
      
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className={`absolute top-1/2 left-1/2 object-cover transition-all duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        style={{ 
          transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
          width: isPortrait ? containerSize.height : '100%',
          height: isPortrait ? containerSize.width : '100%',
        }}
      />
      
      {/* iOS Autoplay Fallback */}
      {!isLoading && !isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
          <button
            onClick={() => videoRef.current?.play()}
            className="flex items-center gap-3 px-8 py-4 bg-white text-black font-bold rounded-2xl hover:bg-zinc-200 transition-all active:scale-95 shadow-2xl"
          >
            <Camera size={24} /> Start Camera
          </button>
        </div>
      )}
      
      <canvas ref={canvasRef} className="hidden" />

      {/* Camera Selection & Rotation UI */}
      <div className="absolute top-20 right-4 flex flex-col items-end gap-2 z-50">
        <button
          onClick={rotate}
          className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-black/60 transition-colors"
          title="Rotate Camera"
        >
          <RotateCw size={20} />
        </button>

        {devices.length > 1 && (
          <>
            <button
              onClick={() => setShowDeviceList(!showDeviceList)}
              className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-black/60 transition-colors"
            >
              <Settings size={20} />
            </button>
            
            {showDeviceList && (
              <div className="bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl flex flex-col gap-1 min-w-[200px]">
                {devices.map((device) => (
                  <button
                    key={device.deviceId}
                    onClick={() => {
                      setSelectedDeviceId(device.deviceId);
                      setShowDeviceList(false);
                    }}
                    className={`text-left px-4 py-2 rounded-xl text-sm transition-colors ${
                      selectedDeviceId === device.deviceId 
                        ? 'bg-white text-black font-bold' 
                        : 'text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {device.label || `Camera ${devices.indexOf(device) + 1}`}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {showCaptureButton && (
        <div className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-none">
          <button
            onClick={handleCapture}
            disabled={isCapturing}
            className={`pointer-events-auto p-6 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white transition-all active:scale-95 ${
              isCapturing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/20'
            }`}
          >
            {isCapturing ? (
              <RefreshCw className="animate-spin" size={32} />
            ) : (
              <Camera size={32} />
            )}
          </button>
        </div>
      )}
    </div>
  );
};
