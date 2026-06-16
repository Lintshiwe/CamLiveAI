import React from 'react';
import { Camera, Circle, RefreshCw, Settings2, Monitor, Video } from 'lucide-react';

interface ControlsOverlayProps {
  onSnapshot: () => void;
  onCapture: () => void;
  onSwitch: () => void;
  onSettings: () => void;
  onToggleStream: () => void;
  isStreamMode: boolean;
}

export const ControlsOverlay: React.FC<ControlsOverlayProps> = ({ onSnapshot, onCapture, onSwitch, onSettings, onToggleStream, isStreamMode }) => {
  return (
    <div className="absolute bottom-20 left-0 right-0 z-40 flex items-center justify-center">
      <div className="flex items-center gap-6 px-6 py-3">
        <button
          onClick={onSnapshot}
          className="p-2.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          aria-label="Take snapshot"
        >
          <Camera size={20} />
        </button>

        {/* iOS-style shutter: white circle with thin red ring */}
        <button
          onClick={onCapture}
          className="flex items-center justify-center w-16 h-16 rounded-full border-[3px] border-white bg-transparent active:scale-95 transition-transform"
          aria-label="Capture"
        >
          <div className="w-12 h-12 rounded-full bg-accent-danger" />
        </button>

        <button
          onClick={onToggleStream}
          className="p-2.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          aria-label={isStreamMode ? 'Switch to overlay mode' : 'Switch to annotated stream'}
        >
          {isStreamMode ? <Video size={20} /> : <Monitor size={20} />}
        </button>

        <button
          onClick={onSwitch}
          className="p-2.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          aria-label="Switch camera"
        >
          <RefreshCw size={20} />
        </button>

        <button
          onClick={onSettings}
          className="p-2.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          aria-label="Settings"
        >
          <Settings2 size={20} />
        </button>
      </div>
    </div>
  );
};
