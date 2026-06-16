import React, { useState } from 'react';
import { Settings2, Camera, Eye, ScanLine, X, ChevronLeft } from 'lucide-react';
import { ToggleSwitch } from './ToggleSwitch';

export interface AppSettings {
  cameraSource: string;
  resolution: string;
  fpsTarget: number;
  autoFocus: boolean;
  confidenceThreshold: number;
  iouThreshold: number;
  syncWithWebsite: boolean;
  showBboxes: boolean;
  showLabels: boolean;
  showGrid: boolean;
  nightMode: boolean;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: AppSettings) => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  cameraSource: 'Default',
  resolution: '1920x1080',
  fpsTarget: 30,
  autoFocus: true,
  confidenceThreshold: 50,
  iouThreshold: 0.45,
  syncWithWebsite: true,
  showBboxes: true,
  showLabels: true,
  showGrid: true,
  nightMode: false,
};

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave }) => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const Section = ({ icon: Icon, title, children }: { icon: typeof Camera; title: string; children: React.ReactNode }) => (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} className="text-accent" />
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <div className="flex flex-col gap-3 pl-6">
        {children}
      </div>
    </div>
  );

  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex items-center justify-between">
      <span className="text-sm text-text-secondary">{label}</span>
      {children}
    </div>
  );

  if (!isOpen) return null;

    return (
    <div className="fixed inset-0 z-[60] bg-bg-primary flex flex-col animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <button
          onClick={onClose}
          className="flex items-center gap-1 p-2 rounded-lg hover:bg-bg-hover text-text-secondary hover:text-white transition-colors"
          aria-label="Back"
        >
          <ChevronLeft size={20} />
          <span className="text-sm font-medium">Back</span>
        </button>
        <h2 className="text-lg font-semibold text-white">Settings</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-bg-hover text-text-secondary hover:text-white transition-colors"
          aria-label="Close settings"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Camera Section */}
        <Section icon={Camera} title="Camera">
          <Row label="Source">
            <select
              value={settings.cameraSource}
              onChange={e => update('cameraSource', e.target.value)}
              className="bg-bg-surface border border-border rounded-lg px-3 py-1.5 text-sm text-white"
            >
              <option>Default</option>
              <option>USB Camera</option>
              <option>IP Camera</option>
            </select>
          </Row>
          <Row label="Resolution">
            <select
              value={settings.resolution}
              onChange={e => update('resolution', e.target.value)}
              className="bg-bg-surface border border-border rounded-lg px-3 py-1.5 text-sm text-white"
            >
              <option>1920x1080</option>
              <option>1280x720</option>
              <option>640x480</option>
            </select>
          </Row>
          <Row label="FPS Target">
            <input
              type="number"
              value={settings.fpsTarget}
              onChange={e => update('fpsTarget', Number(e.target.value))}
              className="w-20 bg-bg-surface border border-border rounded-lg px-3 py-1.5 text-sm text-white"
            />
          </Row>
          <Row label="Auto Focus">
            <ToggleSwitch active={settings.autoFocus} onChange={() => update('autoFocus', !settings.autoFocus)} />
          </Row>
        </Section>

        {/* Detection Section */}
        <Section icon={ScanLine} title="Detection">
          <Row label="Confidence Threshold">
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={100}
                value={settings.confidenceThreshold}
                onChange={e => update('confidenceThreshold', Number(e.target.value))}
                className="w-24"
                style={{ accentColor: '#007AFF' }}
              />
              <span className="text-xs font-mono text-accent w-10 text-right">{settings.confidenceThreshold}%</span>
            </div>
          </Row>
          <Row label="IOU Threshold">
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(settings.iouThreshold * 100)}
                onChange={e => update('iouThreshold', Number(e.target.value) / 100)}
                className="w-24"
                style={{ accentColor: '#007AFF' }}
              />
              <span className="text-xs font-mono text-accent w-10 text-right">{settings.iouThreshold}</span>
            </div>
          </Row>
          <Row label="Sync with Website">
            <ToggleSwitch active={settings.syncWithWebsite} onChange={() => update('syncWithWebsite', !settings.syncWithWebsite)} />
          </Row>
        </Section>

        {/* Display Section */}
        <Section icon={Eye} title="Display">
          <Row label="Show Bounding Boxes">
            <ToggleSwitch active={settings.showBboxes} onChange={() => update('showBboxes', !settings.showBboxes)} />
          </Row>
          <Row label="Show Labels">
            <ToggleSwitch active={settings.showLabels} onChange={() => update('showLabels', !settings.showLabels)} />
          </Row>
          <Row label="Grid Overlay">
            <ToggleSwitch active={settings.showGrid} onChange={() => update('showGrid', !settings.showGrid)} />
          </Row>
          <Row label="Night Mode">
            <ToggleSwitch active={settings.nightMode} onChange={() => update('nightMode', !settings.nightMode)} />
          </Row>
        </Section>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 px-4 py-4 border-t border-border shrink-0">
        <button
          onClick={onClose}
          className="px-4 py-2.5 rounded-lg border border-border text-text-secondary hover:bg-bg-hover transition-colors text-sm font-medium"
        >
          Cancel
        </button>
        <button
          onClick={() => { onSave(settings); onClose(); }}
          className="px-4 py-2.5 rounded-lg bg-accent hover:bg-accent/90 text-white font-medium transition-colors text-sm"
        >
          Save
        </button>
      </div>
    </div>
  );
};
