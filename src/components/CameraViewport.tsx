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
      // DON'T set videoRef.current.srcObject here — the video element may not
      // be in the DOM yet (stream state controls conditional rendering).
      // A separate useEffect syncs it when both exist.
      setStream(s);
      const track = s.getVideoTracks()[0];
      const settings = track.getSettings();
      setResolution(`${settings.width}x${settings.height}`);
    } catch (e: any) {
      console.error('Camera access denied:', e);
      setCameraError(e.message || 'Camera access denied');
    }
  }, []);

  const stopCamera = useCallback(() => {
    const s = streamRef.current;
    if (s) {
      s.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      setStream(null);
      // Also detach from video element to prevent "aborted" errors
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  }, [videoRef]);

  // Sync stream to video element whenever stream state or video ref changes.
  // This handles the critical case: startCamera() resolves before the video
  // element exists (because stream is null on first render), so we defer the
  // srcObject assignment until this effect runs after the DOM commit.
  useEffect(() => {
    if (stream && videoRef.current && videoRef.current instanceof HTMLVideoElement) {
      if (videoRef.current.srcObject !== stream) {
        videoRef.current.srcObject = stream;
      }
    }
  }, [stream, videoRef]);

  // Start/stop when paired status changes
  useEffect(() => {
    if (paired) {
      startCamera();
    } else {
      stopCamera();
    }
    // Cleanup: stop camera when this component unmounts
    return () => {
      const s = streamRef.current;
      if (s) {
        s.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paired]);

  return (
    <div className="fixed inset-0 z-0 bg-black overflow-hidden flex items-center justify-center">
      {/* Always-rendered video element — ensures videoRef always points to it.
          Hidden via CSS when not active so ref stays valid from first mount. */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover ${!paired || !stream ? 'invisible' : ''}`}
      />

      {/* Placeholder overlay (covers the invisible video element) */}
      {(!paired || !stream) && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 text-text-muted bg-black">
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
