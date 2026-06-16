import React, { useState, useRef, useCallback } from 'react';
import { CameraViewport } from './components/CameraViewport';
import { QRPairingOverlay } from './components/QRPairingOverlay';
import { DetectionSheet } from './components/DetectionSheet';
import { BottomTabBar } from './components/BottomTabBar';
import { SettingsModal, AppSettings } from './components/SettingsModal';
import { UserPanel } from './components/UserPanel';
import { StatusOverlay } from './components/StatusOverlay';
import { ControlsOverlay } from './components/ControlsOverlay';
import { useRealtimeDetection } from './hooks/useRealtimeDetection';
import { DetectMode, MobileTab, QRData, PairingConfig } from './types';
import './index.css';

function getProjectName(tenantType: string): string {
  switch (tenantType) {
    case 'agriculture': return 'FruitSight AI';
    case 'waste_management': return 'WasteSight AI';
    case 'warehouse': return 'InventorySight AI';
    default: return 'Custom Platform';
  }
}

export default function App() {
  const [mode, setMode] = useState<DetectMode>('single');
  const [paired, setPaired] = useState(false);
  const [pairingConfig, setPairingConfig] = useState<PairingConfig | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [userPanelOpen, setUserPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<MobileTab>('camera');
  const [settings, setSettings] = useState<AppSettings>({
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
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const { detections, isProcessing, fps } = useRealtimeDetection(
    paired && activeTab === 'camera',
    videoRef,
    pairingConfig,
    mode
  );

  const handlePair = useCallback((data: QRData) => {
    setPairingConfig(data);
    setPaired(true);
    setActiveTab('camera');
  }, []);

  const handleSaveSettings = useCallback((s: AppSettings) => {
    setSettings(s);
  }, []);

  const handleDisconnect = useCallback(() => {
    setPaired(false);
    setPairingConfig(null);
  }, []);

  const handleTabChange = useCallback((tab: MobileTab) => {
    if (tab === activeTab) {
      if (tab === 'feed') {
        setActiveTab('camera');
      } else if (tab === 'user') {
        setUserPanelOpen(false);
      }
      return;
    }
    setActiveTab(tab);
    if (tab === 'user') {
      setUserPanelOpen(true);
    } else {
      setUserPanelOpen(false);
    }
  }, [activeTab]);

  const handleSnapshot = useCallback(() => {
    console.log('Snapshot triggered');
  }, []);

  const handleSwitchCamera = useCallback(() => {
    console.log('Switch camera triggered');
  }, []);

  // QR Gate: if not paired, render ONLY the QR pairing overlay
  if (!paired) {
    return (
      <div className="fixed inset-0 bg-bg-primary text-text-primary overflow-hidden">
        <QRPairingOverlay onScan={handlePair} />
      </div>
    );
  }

  const userName = pairingConfig?.tenantSlug ?? 'User';
  const projectName = pairingConfig ? getProjectName(pairingConfig.tenantType) : '';

  return (
    <div className="fixed inset-0 bg-bg-primary text-text-primary overflow-hidden">
      {/* Full-screen Camera Background */}
      <CameraViewport
        detections={detections}
        paired={paired}
        showBboxes={settings.showBboxes}
        showLabels={settings.showLabels}
        showGrid={settings.showGrid}
        mode={mode}
        videoRef={videoRef}
      />

      {/* Status Overlay */}
      <StatusOverlay
        connected={paired}
        fps={fps}
        detectionCount={detections.length}
        userName={userName}
        projectName={projectName}
      />

      {/* Controls Overlay */}
      {activeTab === 'camera' && (
        <ControlsOverlay
          onSnapshot={handleSnapshot}
          onCapture={() => console.log('Capture')}
          onSwitch={handleSwitchCamera}
          onSettings={() => setSettingsOpen(true)}
        />
      )}

      {/* Bottom Tab Bar */}
      <BottomTabBar activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Detection Sheet (Feed tab) */}
      <DetectionSheet
        detections={detections}
        pairingConfig={pairingConfig}
        isOpen={activeTab === 'feed'}
        onClose={() => setActiveTab('camera')}
      />

      {/* User Panel */}
      <UserPanel
        isOpen={userPanelOpen}
        pairingConfig={pairingConfig}
        onDisconnect={handleDisconnect}
        onClose={() => { setUserPanelOpen(false); setActiveTab('camera'); }}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSave={handleSaveSettings}
      />
    </div>
  );
}
