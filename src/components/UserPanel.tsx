import React from 'react';
import { Link, X, Camera, Globe } from 'lucide-react';
import { PairingConfig } from '../types';

interface UserPanelProps {
  isOpen: boolean;
  pairingConfig: PairingConfig | null;
  onDisconnect: () => void;
  onClose: () => void;
}

export const UserPanel: React.FC<UserPanelProps> = ({ isOpen, pairingConfig, onDisconnect, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative w-full bg-bg-surface border-t border-border rounded-t-2xl max-h-[70vh] flex flex-col animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2 text-text-muted">
            <Link size={14} />
            <span className="text-xs font-semibold uppercase tracking-wide">Connection</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-bg-hover text-text-muted hover:text-white transition-colors"
            aria-label="Close connection panel"
          >
            <X size={18} />
          </button>
        </div>

        {/* Connection Info */}
        <div className="px-4 py-3">
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">Current Connection</h3>

          {pairingConfig ? (
            <div className="space-y-3">
              {/* Tenant / Project */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/15 text-accent flex items-center justify-center">
                  <Globe size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {pairingConfig.tenantSlug}
                  </p>
                  <p className="text-xs text-text-secondary capitalize">
                    {pairingConfig.tenantType.replace('_', ' ')}
                  </p>
                </div>
              </div>

              {/* Camera ID */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 text-white/70 flex items-center justify-center">
                  <Camera size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{pairingConfig.cameraId}</p>
                  <p className="text-xs text-text-secondary">Camera ID</p>
                </div>
              </div>

              {/* API URL */}
              <div className="px-4 py-2.5 rounded-lg bg-black/40 border border-border">
                <p className="text-xs text-text-muted mb-1">API Endpoint</p>
                <p className="text-xs font-mono text-text-secondary truncate">{pairingConfig.apiUrl}</p>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center">
              <p className="text-sm text-text-muted">No active connection</p>
            </div>
          )}
        </div>

        {/* Disconnect Button */}
        {pairingConfig && (
          <div className="px-4 py-3 border-t border-border">
            <button
              onClick={() => { onDisconnect(); onClose(); }}
              className="w-full py-2.5 rounded-lg bg-accent-danger/15 text-accent-danger text-sm font-medium hover:bg-accent-danger/25 transition-colors"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
