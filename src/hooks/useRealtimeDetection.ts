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
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const frameCountRef = useRef(0);
  const lastFpsTimeRef = useRef(performance.now());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
    // Downscale detection frames to 320x240 for faster uploads
    const targetW = 320;
    const targetH = 240;
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    // Use the full video as source but draw into smaller canvas
    const vw = video.videoWidth || 640;
    const vh = video.videoHeight || 480;
    // Crop to center square then scale down
    const size = Math.min(vw, vh);
    const sx = (vw - size) / 2;
    const sy = (vh - size) / 2;
    ctx.drawImage(video, sx, sy, size, size, 0, 0, targetW, targetH);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.4);
    return dataUrl.replace(/^data:image\/jpeg;base64,/, '');
  }, [videoRef]);

  // Use the pairingConfig's apiUrl, falling back to the default
  const getApiUrl = useCallback(() => {
    const base = pairingConfig?.apiUrl
      ? `${pairingConfig.apiUrl.replace(/\/$/, '')}`
      : 'https://fruitsight-ai.onrender.com';
    const path = mode === 'stream' ? '/detection/ingest' : '/detection/single';
    return `${base}${path}`;
  }, [pairingConfig, mode]);

  const sendFrame = useCallback(async () => {
    const base64 = captureFrame();
    if (!base64) return;

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
        body: JSON.stringify({
          image: base64,
          confidence: 0.65,
          ...(pairingConfig?.tenantType ? { domain: pairingConfig.tenantType } : {}),
        }),
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

      const data = await res.json();
      // The model runs on a 320x240 center-crop of the 640x480 video.
      // bbox coordinates are in 320x240 space — transform to video space.
      const videoEl = videoRef.current;
      const videoW = videoEl?.videoWidth || 640;
      const videoH = videoEl?.videoHeight || 480;
      const cropSize = Math.min(videoW, videoH);
      const cropX = (videoW - cropSize) / 2;
      const cropY = (videoH - cropSize) / 2;
      const scaleX = cropSize / 320;
      const scaleY = cropSize / 240;

      const apiDetections: Detection[] = (data.detections || []).map((d: any, idx: number) => {
        const [bx, by, bw, bh] = d.bbox || [0, 0, 0, 0];
        // Transform from model space (320x240 center-crop) to video pixel space
        const videoBbox = [
          (bx * scaleX) + cropX,
          (by * scaleY) + cropY,
          bw * scaleX,
          bh * scaleY,
        ];
        // Transform mask polygon points the same way
        const videoMask = d.mask
          ? d.mask.map((pt: number[]) => [(pt[0] * scaleX) + cropX, (pt[1] * scaleY) + cropY])
          : undefined;
        return {
          id: `${Date.now()}-${idx}`,
          bbox: videoBbox,
          class_name: d.class_name || d.class || 'Unknown',
          confidence: typeof d.confidence === 'number' ? Math.round(d.confidence * 100) : 0,
          class_id: d.class_id,
          grade: d.grade,
          mask: videoMask,
        };
      });

      setDetections(apiDetections);

      frameCountRef.current++;
    } catch (err: any) {
      if (err?.name === 'TimeoutError' || err?.name === 'AbortError') {
        setError('Detection request timed out');
      } else {
        setError(err?.message || 'Detection request failed');
      }
      console.error('Realtime detection error:', err);
    } finally {
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
