import React, { useState, useRef, useCallback } from 'react';
import { ChevronDown, Download, Target } from 'lucide-react';
import { Detection, PairingConfig } from '../types';
import { DetectionItem } from './DetectionItem';

interface DetectionSheetProps {
  detections: Detection[];
  pairingConfig: PairingConfig | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DetectionSheet: React.FC<DetectionSheetProps> = ({ detections, pairingConfig, isOpen, onClose }) => {
  const [dragY, setDragY] = useState(0);
  const startY = useRef(0);
  const isDragging = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    isDragging.current = true;
    startY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) setDragY(delta);
  }, []);

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
    if (dragY > 80) {
      onClose();
    }
    setDragY(0);
  }, [dragY, onClose]);

  const download = () => {
    const data = detections.map(d => ({
      class: d.class_name,
      confidence: d.confidence,
      bbox: d.bbox,
      time: new Date().toISOString(),
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `detections-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-50 bg-bg-surface/95 border-t border-border rounded-t-2xl flex flex-col backdrop-blur-xl"
      style={{ height: '60vh', transform: `translateY(${dragY}px)`, transition: isDragging.current ? 'none' : 'transform 0.3s ease-out' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Drag Handle */}
      <div className="flex flex-col items-center pt-3 pb-2 shrink-0 relative">
        <div className="w-10 h-1 rounded-full bg-text-muted/40" />
        <button
          onClick={onClose}
          className="absolute right-3 top-2 p-1 text-text-muted hover:text-text-secondary transition-colors"
          aria-label="Close detection sheet"
        >
          <ChevronDown size={20} />
        </button>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-white">Detections</h3>
          <span className="px-2 py-0.5 rounded-full bg-accent/15 text-accent text-xs font-bold">
            {detections.length}
          </span>
        </div>
        <button
          onClick={download}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-text-secondary hover:text-white transition-colors text-xs"
          aria-label="Download detections"
        >
          <Download size={14} />
          Download
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2">
        {detections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-text-muted">
            <Target size={32} className="mb-2 opacity-30" />
            <p className="text-sm">No detections yet</p>
            <p className="text-xs mt-1">Waiting for camera input...</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {detections.slice().reverse().map(d => (
              <DetectionItem key={d.id} detection={d} tenantType={pairingConfig?.tenantType} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
