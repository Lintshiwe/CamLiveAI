import React from 'react';
import { Detection } from '../types';
import { getConfidenceColor } from '../utils/helpers';

interface BoundingBoxProps {
  detection: Detection;
  showLabel: boolean;
}

export const BoundingBox: React.FC<BoundingBoxProps> = ({ detection, showLabel }) => {
  if (!detection.bbox || detection.bbox.length < 4) return null;
  const [x, y, w, h] = detection.bbox;
  const color = getConfidenceColor(detection.confidence);

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${w}%`,
        height: `${h}%`,
        border: '1px solid rgba(255,255,255,0.6)',
        borderLeft: `3px solid ${color}`,
      }}
    >
      {showLabel && (
        <div
          className="absolute -top-5 left-0 px-1.5 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#FFFFFF' }}
        >
          {detection.class_name} {detection.confidence}%
        </div>
      )}
    </div>
  );
};
