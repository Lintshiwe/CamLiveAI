import { useState, useRef, useEffect, useCallback } from 'react';
import { Detection, PairingConfig } from '../types';

export function useRealtimeDetection(
  active: boolean,
  videoRef: React.RefObject<HTMLVideoElement | null>,
  pairingConfig: PairingConfig | null,
  mode: string
) {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fps, setFps] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const processingRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const frameCountRef = useRef(0);
  const lastFpsTimeRef = useRef(performance.now());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const retryCountRef = useRef(0);

  const getIntervalMs = useCallback(() => {
    switch (mode) {
      case 'single': return 3000;
      case 'live': return 1000;  // Increased from 500ms to reduce hammering
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

  // Use the pairingConfig's apiUrl, falling back to the default
  const getApiUrl = useCallback(() => {
    if (pairingConfig?.apiUrl) {
      return `${pairingConfig.apiUrl.replace(/\/$/, '')}/detection/single`;
    }
    return 'https://fruitsight-ai.onrender.com/detection/single';
  }, [pairingConfig]);

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

      const apiUrl = getApiUrl();
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ image: base64 }),
        signal: AbortSignal.timeout(30000), // 30s timeout
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setError('Authentication failed — token may be expired');
        } else if (res.status === 503) {
          setError('Detection service unavailable');
        } else {
          setError(`API error: ${res.status}`);
        }
        console.error('Detection API error:', res.status, res.statusText);
        return;
      }

      // Clear error on success
      setError(null);
      retryCountRef.current = 0;

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
    } catch (err: any) {
      if (err?.name === 'TimeoutError' || err?.name === 'AbortError') {
        setError('Detection request timed out');
      } else {
        setError(err?.message || 'Detection request failed');
      }
      console.error('Realtime detection error:', err);
    } finally {
      processingRef.current = false;
      setIsProcessing(false);
    }
  }, [captureFrame, pairingConfig, getApiUrl]);

  // FPS counter (runs always, stable deps)
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

  // Interval-based capture (stable deps — no infinite loop)
  useEffect(() => {
    if (!active) return;

    const intervalMs = getIntervalMs();

    const tick = () => {
      sendFrame();
    };

    intervalRef.current = setInterval(tick, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [active, mode, getIntervalMs, sendFrame]);

  return { detections, isProcessing, fps, error };
}
