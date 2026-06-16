import React, { useState, useCallback, useEffect, useRef } from 'react';
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

export const CameraViewport: React.FC<CameraViewportProps> = ({ detections, paired, showBboxes, showLabels, showGrid, videoRef }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [resolution, setResolution] = useState('1920x1080');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    // Don't start if already streaming
    if (streamRef.current) return;

    setCameraError(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = s;
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
      const track = s.getVideoTracks()[0];
      const settings = track.getSettings();
      setResolution(`${settings.width}x${settings.height}`);
    } catch (e: any) {
      console.error('Camera access denied:', e);
      setCameraError(e.message || 'Camera access denied');
    }
  }, [videoRef]);

  const stopCamera = useCallback(() => {
    const s = streamRef.current;
    if (s) {
      s.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      setStream(null);
    }
  }, []);

  // Start/stop when paired status changes (stable deps — no infinite loop)
  useEffect(() => {
    if (paired) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [paired, startCamera, stopCamera]);

  return (
    <div className="fixed inset-0 z-0 bg-black overflow-hidden flex items-center justify-center">
      {/* Video or placeholder */}
      {paired && stream ? (
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 text-text-muted">
          <Camera size={48} className="opacity-30" />
          <p className="text-sm">{cameraError || 'No camera connected'}</p>
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
    </div>
  );
};
