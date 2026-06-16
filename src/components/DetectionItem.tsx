import React from 'react';
import { Apple, Trash2, Package, Camera } from 'lucide-react';
import { Detection } from '../types';
import { getConfidenceColor, getConfidenceLabel } from '../utils/helpers';

const DOMAIN_ICON_COMPONENTS: Record<string, React.ElementType> = {
  agriculture: Apple,
  waste_management: Trash2,
  warehouse: Package,
};

const DOMAIN_COLORS: Record<string, string> = {
  agriculture: 'text-accent bg-accent/15',
  waste_management: 'text-accent-green bg-accent-green/15',
  warehouse: 'text-accent-warning bg-accent-warning/15',
};

interface DetectionItemProps {
  detection: Detection;
  tenantType?: string;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const DetectionItem: React.FC<DetectionItemProps> = ({ detection, tenantType }) => {
  const color = getConfidenceColor(detection.confidence);
  const label = getConfidenceLabel(detection.confidence);
  const domain = tenantType || 'general';
  const IconComponent = DOMAIN_ICON_COMPONENTS[domain] || Camera;
  const domainColor = DOMAIN_COLORS[domain] || 'text-text-muted bg-white/10';

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-bg-hover transition-colors border-b border-border last:border-0">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${domainColor}`}>
        <IconComponent size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white truncate">{capitalize(detection.class_name)}</span>
          {detection.grade && (
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${domainColor}`}>
              {detection.grade}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-text-muted">ID: {detection.class_id ?? '-'}</span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-sm font-bold" style={{ color }}>{detection.confidence}%</div>
        <div className="text-[10px] text-text-muted">{label}</div>
      </div>
    </div>
  );
};
