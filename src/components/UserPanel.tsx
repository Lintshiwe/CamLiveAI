import React from 'react';
import { Users, Check, X } from 'lucide-react';
import { MockUser } from '../types';
import { MOCK_USERS } from '../constants';

interface UserPanelProps {
  isOpen: boolean;
  currentUser: MockUser;
  onSelectUser: (user: MockUser) => void;
  onClose: () => void;
}

export const UserPanel: React.FC<UserPanelProps> = ({ isOpen, currentUser, onSelectUser, onClose }) => {
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
            <Users size={14} />
            <span className="text-xs font-semibold uppercase tracking-wide">Users</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-bg-hover text-text-muted hover:text-white transition-colors"
            aria-label="Close user panel"
          >
            <X size={18} />
          </button>
        </div>

        {/* Current User */}
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Current User</h3>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/15 text-accent flex items-center justify-center text-sm font-bold">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{currentUser.name}</p>
              <p className="text-xs text-text-secondary">{currentUser.role} · {currentUser.tenant}</p>
            </div>
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto">
          <h3 className="px-4 py-2 text-xs font-semibold text-text-muted uppercase tracking-wide">Switch User</h3>
          {MOCK_USERS.map(user => (
            <button
              key={user.id}
              onClick={() => { onSelectUser(user); onClose(); }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-bg-hover transition-colors text-left"
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
                user.id === currentUser.id ? 'bg-accent/15 text-accent' : 'bg-white/10 text-white/70'
              }`}>
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${user.id === currentUser.id ? 'text-accent' : 'text-white'}`}>{user.name}</span>
                  {user.id === currentUser.id && <Check size={14} className="text-accent" />}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-text-muted">{user.role}</span>
                  <span className="text-text-muted">·</span>
                  <span className="text-xs text-text-muted truncate">{user.tenant}</span>
                </div>
              </div>
              {user.active && (
                <div className="w-2 h-2 rounded-full bg-accent-green shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
