import React, { useState, useRef, useEffect, useCallback } from 'react';
import { UserCircle, CircleHelp, X } from 'lucide-react';
import jsQR from 'jsqr';
import { QRData } from '../types';

interface QRPairingOverlayProps {
  onScan: (data: QRData) => void;
}

function getProjectName(tenantType: string): string {
  switch (tenantType) {
    case 'agriculture': return 'FruitSight AI';
    case 'waste_management': return 'WasteSight AI';
    case 'warehouse': return 'InventorySight AI';
    default: return 'Custom Platform';
  }
}

export const QRPairingOverlay: React.FC<QRPairingOverlayProps> = ({ onScan }) => {
  const [scanning, setScanning] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connectedInfo, setConnectedInfo] = useState<{ name: string; project: string } | null>(null);
  const [showInfo, setShowInfo] = useState(false);
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
                const qrData = parsed as QRData;
                const name = qrData.tenantSlug || 'Connected';
                const project = getProjectName(qrData.tenantType);
                setConnectedInfo({ name, project });
                setConnected(true);
                setTimeout(() => {
                  onScan(qrData);
                }, 1500);
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
    <div className="fixed inset-0 z-[60] flex flex-col items-center bg-black px-4 py-8">
      {/* Top User Area */}
      <div className="flex flex-col items-center gap-2 mt-4 mb-8">
        {connected && connectedInfo ? (
          <>
            <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center">
              <span className="text-lg font-bold text-white">{connectedInfo.name.charAt(0)}</span>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-white">Connected!</div>
              <div className="text-xs text-accent-green">Welcome to {connectedInfo.project}</div>
            </div>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
              <UserCircle size={28} className="text-text-muted" />
            </div>
            <div className="text-sm text-text-muted">Not Connected</div>
          </>
        )}
      </div>

      {/* QR Scanner Viewport */}
      <div className="relative w-[85vw] max-w-sm aspect-[3/4] rounded-xl overflow-hidden bg-bg-surface border border-border">
        {scanning ? (
          <>
            <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted />
            <canvas ref={canvasRef} className="hidden" />
            {/* Scan line */}
            <div className="absolute left-0 right-0 h-0.5 bg-accent animate-scan-line" />
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
              <UserCircle size={28} className="text-text-muted" />
            </div>
            <p className="text-xs text-text-muted">Camera access required</p>
          </div>
        )}

        {/* Corner brackets */}
        <div className="absolute top-4 left-4 w-12 h-12 border-t-[3px] border-l-[3px] border-white rounded-tl-lg" />
        <div className="absolute top-4 right-4 w-12 h-12 border-t-[3px] border-r-[3px] border-white rounded-tr-lg" />
        <div className="absolute bottom-4 left-4 w-12 h-12 border-b-[3px] border-l-[3px] border-white rounded-bl-lg" />
        <div className="absolute bottom-4 right-4 w-12 h-12 border-b-[3px] border-r-[3px] border-white rounded-br-lg" />
      </div>

      {/* Subtitle */}
      <p className="mt-6 text-sm text-text-secondary text-center max-w-xs">
        Point camera at a QR code to connect
      </p>

      {/* Info Button */}
      <button
        onClick={() => setShowInfo(true)}
        className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        aria-label="How to connect"
      >
        <CircleHelp size={20} />
      </button>

      {/* Info Modal */}
      {showInfo && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm px-6"
          onClick={() => setShowInfo(false)}
        >
          <div
            className="relative w-full max-w-sm bg-bg-surface rounded-2xl border border-border p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowInfo(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 text-text-secondary transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <h2 className="text-lg font-bold text-white mb-4 pr-8">How to Connect</h2>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-accent">1</span>
                </div>
                <p className="text-sm text-text-secondary">
                  Open FruitSight AI (or any platform) → Cameras → Add Camera
                </p>
              </div>
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-accent">2</span>
                </div>
                <p className="text-sm text-text-secondary">
                  Click Generate QR Code
                </p>
              </div>
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-accent">3</span>
                </div>
                <p className="text-sm text-text-secondary">
                  Scan the QR code with this app
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};