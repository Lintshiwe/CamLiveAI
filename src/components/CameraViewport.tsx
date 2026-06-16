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
  const [cameraError, setCameraError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  // Track if video was ever started — once started, keep showing it
  const startedRef = useRef(false);

  const startCamera = useCallback(async () => {
    if (streamRef.current) {
      console.log('[CAM] Already streaming — skipping start');
      return;
    }
    console.log('[CAM] Starting camera...');
    setCameraError(null);
    try {
      const constraints = { video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } };
      console.log('[CAM] getUserMedia with:', JSON.stringify(constraints));
      const s = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('[CAM] getUserMedia resolved, tracks:', s.getTracks().length);
      streamRef.current = s;
      setStream(s);
    } catch (e: any) {
      console.error('[CAM] Camera error:', e.name, e.message);
      setCameraError(`${e.name}: ${e.message}`);
    }
  }, []);

  const stopCamera = useCallback(() => {
    const s = streamRef.current;
    if (s) {
      s.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      setStream(null);
      startedRef.current = false;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  }, [videoRef]);

  // Sync stream to video element AFTER DOM commit (when video element exists)
  // Also start playback explicitly for browsers that need it.
  useEffect(() => {
    if (stream && videoRef.current && videoRef.current instanceof HTMLVideoElement) {
      if (videoRef.current.srcObject !== stream) {
        console.log('[CAM] Attaching stream to video element');
        videoRef.current.srcObject = stream;
      }
      // Explicit play() required on some mobile browsers even with autoPlay
      if (videoRef.current.paused) {
        console.log('[CAM] Starting video playback');
        videoRef.current.play().catch((err: any) => {
          console.warn('[CAM] play() failed:', err.name, err.message);
        });
      }
      startedRef.current = true;
      console.log('[CAM] Camera active — video element ready');
    }
  }, [stream, videoRef]);

  // Start/stop when paired status changes
  useEffect(() => {
    console.log('[CAM] paired changed:', paired);
    if (paired) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      const s = streamRef.current;
      if (s) {
        console.log('[CAM] Cleanup — stopping camera');
        s.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paired]);

  const showVideo = paired && stream;

  return (
    <div className="fixed inset-0 z-0 bg-black overflow-hidden flex items-center justify-center">
      {/* Video always rendered, always visible — never use visibility:hidden
          because iOS Safari stops rendering frames to invisible elements.
          When inactive, the placeholder overlay covers it via z-index. */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Placeholder overlay — z-10 covers video when not active */}
      {!showVideo && (
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
        <BoundingBox
          key={d.id}
          detection={d}
          showLabel={showLabels}
          videoWidth={videoRef.current?.videoWidth ?? 640}
          videoHeight={videoRef.current?.videoHeight ?? 480}
        />
      ))}
    </div>
  );
};
