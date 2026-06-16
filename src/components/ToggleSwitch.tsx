import React from 'react';

interface ToggleSwitchProps {
  active: boolean;
  onChange: () => void;
  label?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ active, onChange, label }) => (
  <div className="flex items-center gap-3">
    <div
      className={`toggle-switch ${active ? 'active' : ''}`}
      onClick={onChange}
      role="switch"
      aria-checked={active}
      aria-label={label}
    />
    {label && <span className="text-sm text-text-secondary">{label}</span>}
  </div>
);
