import React from 'react';
import { ChevronLeft, Circle, Square } from 'lucide-react';
import { soundEngine } from '../system/SoundEngine';
import { hapticEngine } from '../system/HapticEngine';

interface NovaBottomBarProps {
  onBack: () => void;
  onHome: () => void;
  canGoBack?: boolean;
}

export const NovaBottomBar: React.FC<NovaBottomBarProps> = ({
  onBack,
  onHome,
  canGoBack = true,
}) => {
  return (
    <div
      style={{
        height: '46px',
        background: 'rgba(6, 7, 10, 0.95)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 50,
        padding: '0 24px',
        userSelect: 'none',
      }}
    >
      {/* Back Icon */}
      <button
        onClick={() => {
          soundEngine.playTap();
          hapticEngine.light();
          onBack();
        }}
        title="Back"
        style={{
          background: 'transparent',
          border: 'none',
          color: canGoBack ? '#94a3b8' : '#475569',
          cursor: 'pointer',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <ChevronLeft size={20} />
      </button>

      {/* Home Icon */}
      <button
        onClick={() => {
          soundEngine.playTap();
          hapticEngine.medium();
          onHome();
        }}
        title="Home"
        style={{
          background: 'transparent',
          border: 'none',
          color: '#cbd5e1',
          cursor: 'pointer',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Circle size={16} />
      </button>

      {/* Recent Apps Icon */}
      <button
        onClick={() => {
          soundEngine.playTap();
          hapticEngine.light();
          onHome();
        }}
        title="Overview"
        style={{
          background: 'transparent',
          border: 'none',
          color: '#94a3b8',
          cursor: 'pointer',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Square size={14} />
      </button>
    </div>
  );
};
