import { useState, useRef, useEffect, useCallback } from 'react';
import { Detection, PairingConfig } from '../types';

const API_URL = 'https://fruitsight-ai.onrender.com/detection/single';

export function useRealtimeDetection(
  active: boolean,
  videoRef: React.RefObject<HTMLVideoElement | null>,
  pairingConfig: PairingConfig | null,
  mode: string
) {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fps, setFps] = useState(0);
  const processingRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const frameCountRef = useRef(0);
  const lastFpsTimeRef = useRef(performance.now());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const getIntervalMs = useCallback(() => {
    switch (mode) {
      case 'single': return 3000;
      case 'live': return 500;
      case 'batch': return 5000;
      default: return 3000;
    }
  }, [mode]);

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return null;

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
    return dataUrl.replace(/^data:image\/jpeg;base64,/, '');
  }, [videoRef]);

  const sendFrame = useCallback(async () => {
    if (processingRef.current) return;
    const base64 = captureFrame();
    if (!base64) return;

    processingRef.current = true;
    setIsProcessing(true);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (pairingConfig?.token) {
        headers['Authorization'] = `Bearer ${pairingConfig.token}`;
      }

      const res = await fetch(API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({ image: base64 }),
      });

      if (!res.ok) {
        console.error('Detection API error:', res.status, res.statusText);
        return;
      }

      const data = await res.json();
      const apiDetections: Detection[] = (data.detections || []).map((d: any, idx: number) => ({
        id: `${Date.now()}-${idx}`,
        bbox: d.bbox || [0, 0, 0, 0],
        class_name: d.class_name || d.class || 'Unknown',
        confidence: typeof d.confidence === 'number' ? Math.round(d.confidence * 100) : 0,
        class_id: d.class_id,
        grade: d.grade,
      }));

      setDetections(prev => {
        const next = [...prev, ...apiDetections];
        return next.slice(-50);
      });

      frameCountRef.current++;
    } catch (err) {
      console.error('Realtime detection error:', err);
    } finally {
      processingRef.current = false;
      setIsProcessing(false);
    }
  }, [captureFrame, pairingConfig]);

  // FPS counter
  useEffect(() => {
    let raf: number;
    const tick = () => {
      const now = performance.now();
      if (now - lastFpsTimeRef.current >= 1000) {
        setFps(frameCountRef.current);
        frameCountRef.current = 0;
        lastFpsTimeRef.current = now;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Interval-based capture
  useEffect(() => {
    if (!active) return;

    const intervalMs = getIntervalMs();

    if (mode === 'batch') {
      // Batch: 3 frames in quick succession every 5 seconds
      intervalRef.current = setInterval(() => {
        for (let i = 0; i < 3; i++) {
          setTimeout(() => sendFrame(), i * 300);
        }
      }, intervalMs);
    } else {
      intervalRef.current = setInterval(() => {
        sendFrame();
      }, intervalMs);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [active, mode, getIntervalMs, sendFrame]);

  return { detections, isProcessing, fps };
}
