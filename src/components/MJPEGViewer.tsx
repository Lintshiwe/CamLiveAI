import React, { useState, useEffect, useRef } from 'react';

interface MJPEGViewerProps {
  streamUrl: string;
  active: boolean;
}

export const MJPEGViewer: React.FC<MJPEGViewerProps> = ({ streamUrl, active }) => {
  const [hasFrame, setHasFrame] = useState(false);
  const [stale, setStale] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const staleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!active) {
      setHasFrame(false);
      setStale(false);
      if (staleTimeoutRef.current) {
        clearTimeout(staleTimeoutRef.current);
        staleTimeoutRef.current = null;
      }
      return;
    }

    // Reset state when stream URL changes
    setHasFrame(false);
    setStale(false);

    const img = imgRef.current;
    if (!img) return;

    const onLoad = () => {
      setHasFrame(true);
      setStale(false);
      // Reset stale timeout on every load
      if (staleTimeoutRef.current) clearTimeout(staleTimeoutRef.current);
      staleTimeoutRef.current = setTimeout(() => {
        setStale(true);
      }, 5000);
    };

    const onError = () => {
      // Keep showing last frame if we already have one
      if (!hasFrame) {
        setStale(false);
      }
    };

    img.addEventListener('load', onLoad);
    img.addEventListener('error', onError);

    return () => {
      img.removeEventListener('load', onLoad);
      img.removeEventListener('error', onError);
      if (staleTimeoutRef.current) {
        clearTimeout(staleTimeoutRef.current);
        staleTimeoutRef.current = null;
      }
    };
  }, [streamUrl, active, hasFrame]);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black">
      {!hasFrame && active && (
        <p className="text-white/50 text-sm">Waiting for camera feed...</p>
      )}
      {stale && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
          <p className="text-red-400 text-sm">Camera disconnected</p>
        </div>
      )}
      <img
        ref={imgRef}
        src={active ? streamUrl : ''}
        alt="Annotated MJPEG stream"
        className="w-full h-full object-cover"
        style={{ opacity: hasFrame ? 1 : 0, transition: 'opacity 0.3s' }}
      />
    </div>
  );
};
