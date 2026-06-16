import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Scan, QrCode, X, Camera } from 'lucide-react';
import jsQR from 'jsqr';
import { QRData } from '../types';

interface QRPairingOverlayProps {
  onScan: (data: QRData) => void;
  onClose?: () => void;
}

export const QRPairingOverlay: React.FC<QRPairingOverlayProps> = ({ onScan, onClose }) => {
  const [scanning, setScanning] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopScanning = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setScanning(false);
  }, []);

  const startScanning = useCallback(async () => {
    setScanning(true);
    setShowManual(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // 30-second timeout for manual setup
      timeoutRef.current = setTimeout(() => {
        setShowManual(true);
      }, 30000);

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
      setShowManual(true);
    }
  }, [onScan, stopScanning]);

  useEffect(() => {
    return () => stopScanning();
  }, [stopScanning]);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm">
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
      <div className="relative w-48 h-48 mb-6">
        <div className="absolute inset-0 bg-white rounded-xl p-3 flex items-center justify-center">
          <QrCode size={140} className="text-black" />
        </div>
        <div className="absolute -inset-2 border-2 border-white/20 rounded-2xl" />
        <div className="absolute -inset-4 border border-white/10 rounded-3xl" />
      </div>

      <h2 className="text-xl font-bold text-white mb-2">Connect to FruitSight</h2>
      <p className="text-sm text-text-secondary text-center max-w-xs mb-6">
        Pair this device with your FruitSight AI account to start live detection
      </p>

      {/* 3 Steps */}
      <div className="flex flex-col gap-3 mb-6 w-full max-w-xs">
        {[
          'Open FruitSight AI → Cameras → Add Camera',
          'Click Generate QR Code',
          'Scan QR with this app',
        ].map((step, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-bg-surface border border-border">
            <div className="w-6 h-6 rounded-full border border-white/20 text-white flex items-center justify-center text-xs font-bold shrink-0">
              {i + 1}
            </div>
            <span className="text-sm text-text-secondary">{step}</span>
          </div>
        ))}
      </div>

      {/* Camera Scanner */}
      <div className="relative w-64 h-48 mb-6 rounded-xl overflow-hidden bg-bg-surface border border-border">
        {scanning ? (
          <>
            <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted />
            <canvas ref={canvasRef} className="hidden" />
            {/* Scan line */}
            <div className="absolute left-0 right-0 h-0.5 bg-accent animate-scan-line" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Camera size={32} className="text-text-muted" />
          </div>
        )}
        {/* Corner brackets */}
        <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-white rounded-tl-lg" />
        <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-white rounded-tr-lg" />
        <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-white rounded-bl-lg" />
        <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-white rounded-br-lg" />
      </div>

      {/* Manual Setup */}
      {showManual && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-accent-danger/15 border border-accent-danger/30 text-center max-w-xs">
          <p className="text-sm text-accent-danger font-medium mb-1">No QR code detected</p>
          <p className="text-xs text-text-secondary">Try manual setup or check your camera permissions.</p>
        </div>
      )}

      <button
        onClick={scanning ? stopScanning : startScanning}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent hover:bg-accent/90 text-white font-semibold transition-colors"
        aria-label={scanning ? 'Stop scanning' : 'Scan QR code'}
      >
        <Scan size={18} />
        {scanning ? 'Stop Scanning' : 'Scan QR Code'}
      </button>
    </div>
  );
};
