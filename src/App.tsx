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
import { DetectMode, MockUser, MobileTab, QRData, PairingConfig } from './types';
import { CURRENT_USER } from './constants';
import './index.css';

export default function App() {
  const [mode, setMode] = useState<DetectMode>('single');
  const [paired, setPaired] = useState(false);
  const [pairingConfig, setPairingConfig] = useState<PairingConfig | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [userPanelOpen, setUserPanelOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<MockUser>(CURRENT_USER);
  const [activeTab, setActiveTab] = useState<MobileTab>('qr');
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
  const connectionTime = useRef(new Date());

  const handlePair = useCallback((data: QRData) => {
    setPairingConfig(data);
    setPaired(true);
    setActiveTab('camera');
  }, []);

  const handleSaveSettings = useCallback((s: AppSettings) => {
    setSettings(s);
  }, []);

  const handleSelectUser = useCallback((user: MockUser) => {
    setCurrentUser(user);
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
    if (tab === 'qr') {
      setPaired(false);
      setPairingConfig(null);
    }
  }, [activeTab]);

  const handleSnapshot = useCallback(() => {
    console.log('Snapshot triggered');
  }, []);

  const handleSwitchCamera = useCallback(() => {
    console.log('Switch camera triggered');
  }, []);

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
      />

      {/* Controls Overlay */}
      {paired && activeTab === 'camera' && (
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

      {/* QR Pairing Overlay (QR tab) */}
      {activeTab === 'qr' && (
        <QRPairingOverlay
          onScan={handlePair}
          onClose={() => setActiveTab('camera')}
        />
      )}

      {/* User Panel */}
      <UserPanel
        isOpen={userPanelOpen}
        currentUser={currentUser}
        onSelectUser={handleSelectUser}
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
