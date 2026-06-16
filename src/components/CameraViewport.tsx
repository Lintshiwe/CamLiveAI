import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera } from 'lucide-react';
import { Detection } from '../types';
import { BoundingBox } from './BoundingBox';

interface CameraViewportProps {
  detections: Detection[];
  paired: boolean;
  showBboxes: boolean;
  showLabels: boolean;
  showGrid: boolean;
  mode: string;
  videoRef: React.MutableRefObject<HTMLVideoElement | null>;
}

export const CameraViewport: React.FC<CameraViewportProps> = ({ detections, paired, showBboxes, showLabels, showGrid, mode, videoRef }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [fps, setFps] = useState(30);
  const [resolution, setResolution] = useState('1920x1080');

  const startCamera = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { width: 1920, height: 1080 } });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
      const track = s.getVideoTracks()[0];
      const settings = track.getSettings();
      setResolution(`${settings.width}x${settings.height}`);
    } catch (e) {
      console.error('Camera access denied:', e);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    if (paired) startCamera();
    return () => stopCamera();
  }, [paired, startCamera, stopCamera]);

  // FPS counter
  useEffect(() => {
    let frames = 0;
    let last = performance.now();
    let raf: number;
    const tick = () => {
      frames++;
      const now = performance.now();
      if (now - last >= 1000) {
        setFps(frames);
        frames = 0;
        last = now;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="fixed inset-0 z-0 bg-black overflow-hidden flex items-center justify-center">
      {/* Video or placeholder */}
      {paired && stream ? (
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 text-text-muted">
          <Camera size={48} className="opacity-30" />
          <p className="text-sm">No camera connected</p>
        </div>
      )}

      {/* Grid Overlay */}
      {showGrid && paired && (
        <div className="absolute inset-0 pointer-events-none opacity-30 z-10">
          <div className="w-full h-full" style={{
            backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '20% 20%',
          }} />
        </div>
      )}

      {/* Bounding Boxes */}
      {showBboxes && paired && detections.map(d => d.bbox && (
        <BoundingBox key={d.id} detection={d} showLabel={showLabels} />
      ))}

      {/* FPS Badge */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-sm border border-border">
        <span className="text-xs font-mono text-white/80">{fps} FPS</span>
      </div>

      {/* Resolution Badge */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-sm border border-border">
        <span className="text-xs font-mono text-text-secondary">{resolution}</span>
      </div>

      {/* Detection Count */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-sm border border-border">
        <span className="text-xs font-mono text-white/80">{detections.length}</span>
        <span className="text-xs text-text-muted">detections</span>
      </div>

    </div>
  );
};
