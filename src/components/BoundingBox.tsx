import React from 'react';
import { Detection } from '../types';
import { getConfidenceColor } from '../utils/helpers';

interface BoundingBoxProps {
  detection: Detection;
  showLabel: boolean;
  videoWidth?: number;
  videoHeight?: number;
}

export const BoundingBox: React.FC<BoundingBoxProps> = ({ detection, showLabel, videoWidth, videoHeight }) => {
  if (!detection.bbox || detection.bbox.length < 4) return null;
  const [x, y, w, h] = detection.bbox;

  // bbox values are pixel coordinates in the captured image's coordinate space.
  // Convert to percentage of video container for CSS positioning.
  const vw = videoWidth || 640;
  const vh = videoHeight || 480;
  const pctX = (x / vw) * 100;
  const pctY = (y / vh) * 100;
  const pctW = (w / vw) * 100;
  const pctH = (h / vh) * 100;

  const color = getConfidenceColor(detection.confidence);

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${pctX}%`,
        top: `${pctY}%`,
        width: `${pctW}%`,
        height: `${pctH}%`,
        border: `2.5px solid ${color}`,
        borderRadius: '6px',
      }}
    >
      {/* Corner brackets for visibility */}
      <div className="absolute -top-px -left-px w-3 h-3 border-t-[3px] border-l-[3px]" style={{ borderColor: color }} />
      <div className="absolute -top-px -right-px w-3 h-3 border-t-[3px] border-r-[3px]" style={{ borderColor: color }} />
      <div className="absolute -bottom-px -left-px w-3 h-3 border-b-[3px] border-l-[3px]" style={{ borderColor: color }} />
      <div className="absolute -bottom-px -right-px w-3 h-3 border-b-[3px] border-r-[3px]" style={{ borderColor: color }} />

      {showLabel && (
        <div
          className="absolute -top-6 left-0 px-1.5 py-0.5 rounded-t-md text-[10px] font-semibold whitespace-nowrap flex items-center gap-1"
          style={{ backgroundColor: color, color: '#FFFFFF' }}
        >
          <span>{detection.class_name}</span>
          <span style={{ opacity: 0.8 }}>{detection.confidence}%</span>
        </div>
      )}
    </div>
  );
};
