import React, { useState, useRef, useEffect, useCallback } from 'react';
import { QrCode, X, Camera } from 'lucide-react';
import jsQR from 'jsqr';
import { QRData } from '../types';

interface QRPairingOverlayProps {
  onScan: (data: QRData) => void;
  onClose?: () => void;
}

export const QRPairingOverlay: React.FC<QRPairingOverlayProps> = ({ onScan, onClose }) => {
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);

  const stopScanning = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setScanning(false);
  }, []);

  const startScanning = useCallback(async () => {
    setScanning(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const tick = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code && code.data) {
            try {
              const parsed = JSON.parse(code.data);
              if (parsed.token && parsed.tenantType && parsed.cameraId) {
                stopScanning();
                onScan(parsed as QRData);
                return;
              }
            } catch {
              // Not valid JSON, ignore
            }
          }
        }

        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    } catch (e) {
      console.error('QR scanner camera access denied:', e);
      setScanning(false);
    }
  }, [onScan, stopScanning]);

  useEffect(() => {
    startScanning();
    return () => stopScanning();
  }, [startScanning, stopScanning]);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm px-4">
      {/* Close button */}
      {onClose && (
        <button
          onClick={() => { stopScanning(); onClose(); }}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Close QR pairing"
        >
          <X size={24} />
        </button>
      )}

      {/* QR Placeholder */}
      <div className="relative w-28 h-28 mb-4 shrink-0">
        <div className="absolute inset-0 bg-white rounded-lg p-2 flex items-center justify-center">
          <QrCode size={80} className="text-black" />
        </div>
        <div className="absolute -inset-1.5 border-2 border-white/20 rounded-xl" />
        <div className="absolute -inset-3 border border-white/10 rounded-2xl" />
      </div>

      <h2 className="text-lg font-bold text-white mb-1">Connect Camera</h2>
      <p className="text-sm text-text-secondary text-center max-w-xs mb-6">
        Scan any CamLiveAI QR code to connect
      </p>

      {/* Camera Scanner - larger and more prominent */}
      <div className="relative w-full max-w-sm aspect-[4/3] rounded-xl overflow-hidden bg-bg-surface border border-border mb-4">
        {scanning ? (
          <>
            <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted />
            <canvas ref={canvasRef} className="hidden" />
            {/* Scan line */}
            <div className="absolute left-0 right-0 h-0.5 bg-accent animate-scan-line" />
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <Camera size={32} className="text-text-muted" />
            <p className="text-xs text-text-muted">Camera access required</p>
          </div>
        )}
        {/* Corner brackets */}
        <div className="absolute top-3 left-3 w-10 h-10 border-t-2 border-l-2 border-white rounded-tl-lg" />
        <div className="absolute top-3 right-3 w-10 h-10 border-t-2 border-r-2 border-white rounded-tr-lg" />
        <div className="absolute bottom-3 left-3 w-10 h-10 border-b-2 border-l-2 border-white rounded-bl-lg" />
        <div className="absolute bottom-3 right-3 w-10 h-10 border-b-2 border-r-2 border-white rounded-br-lg" />
      </div>

      {/* Bottom text */}
      <p className="text-xs text-text-muted text-center max-w-xs">
        QR codes are generated from any connected platform (FruitSight, WasteSight, etc.)
      </p>
    </div>
  );
};
