import React from 'react';
import { Camera, List, ScanLine, User } from 'lucide-react';
import { MobileTab } from '../types';

interface BottomTabBarProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
}

const TABS: { key: MobileTab; label: string; icon: typeof Camera }[] = [
  { key: 'camera', label: 'Camera', icon: Camera },
  { key: 'feed', label: 'Feed', icon: List },
  { key: 'qr', label: 'QR', icon: ScanLine },
  { key: 'user', label: 'User', icon: User },
];

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeTab, onTabChange }) => (
  <nav className="absolute bottom-0 left-0 right-0 z-50 bg-black/70 backdrop-blur-md border-t border-border flex items-center justify-around px-2 py-2">
    {TABS.map(t => (
      <button
        key={t.key}
        onClick={() => onTabChange(t.key)}
        className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-lg min-w-[44px] transition-colors ${
          activeTab === t.key ? 'text-white' : 'text-text-muted hover:text-text-secondary'
        }`}
        aria-label={t.label}
      >
        <t.icon size={22} />
        <span className="text-[10px] font-medium">{t.label}</span>
        {activeTab === t.key && (
          <div className="w-1 h-1 rounded-full bg-white mt-0.5" />
        )}
      </button>
    ))}
  </nav>
);
