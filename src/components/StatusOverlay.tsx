import React from 'react';
import { Camera, Zap } from 'lucide-react';

interface StatusOverlayProps {
  connected: boolean;
  fps: number;
  detectionCount: number;
  userName?: string;
  projectName?: string;
  error?: string | null;
}

export const StatusOverlay: React.FC<StatusOverlayProps> = ({ connected, fps, detectionCount, userName, projectName, error }) => {
  return (
    <div className="absolute top-0 left-0 right-0 z-30 flex flex-col pointer-events-none">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-600/90 backdrop-blur-sm text-white text-xs text-center py-2 px-4 pointer-events-auto">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 text-white">
            <Camera size={18} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">CamLiveAI</h1>
            <p className="text-[10px] text-text-muted leading-tight">Detection</p>
          </div>
        </div>

        {/* Right side: Badges + User info */}
        <div className="flex items-center gap-2">
          {/* Detection Count */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm border border-border">
            <Zap size={12} className="text-white/80" />
            <span className="text-xs font-mono text-white">{detectionCount}</span>
          </div>

          {/* FPS */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm border border-border">
            <span className="text-xs font-mono text-white/80">{fps} FPS</span>
          </div>

          {/* Connection Status */}
          <div className="flex items-center px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-border">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-accent-green animate-pulse-dot' : 'bg-accent-danger'}`} />
          </div>

          {/* User Profile */}
          {connected && userName && (
            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center">
                <span className="text-xs font-bold text-white">{userName.charAt(0)}</span>
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-medium text-white leading-tight">{userName}</div>
                {projectName && (
                  <div className="text-[10px] text-text-muted leading-tight">{projectName}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
