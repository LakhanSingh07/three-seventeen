import React from 'react';
import { Wifi, BatteryMedium, Volume2, VolumeX, ArrowLeft } from 'lucide-react';
import { soundEngine } from '../system/SoundEngine';
import { hapticEngine } from '../system/HapticEngine';

interface NovaStatusBarProps {
  onBackToDesk: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const NovaStatusBar: React.FC<NovaStatusBarProps> = ({
  onBackToDesk,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div
      style={{
        height: '42px',
        padding: '0 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 50,
        background: 'linear-gradient(to bottom, rgba(5, 7, 12, 0.95), rgba(5, 7, 12, 0.3))',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        color: '#f1f5f9',
        fontSize: '12px',
        fontWeight: 600,
        userSelect: 'none',
      }}
    >
      {/* Return to Desk Environmental Button */}
      <button
        onClick={() => {
          soundEngine.playTap();
          hapticEngine.light();
          onBackToDesk();
        }}
        style={{
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '9999px',
          padding: '4px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          color: '#e2e8f0',
          cursor: 'pointer',
          fontSize: '11px',
          fontWeight: 600,
          transition: 'all 0.15s ease',
        }}
      >
        <ArrowLeft size={12} color="#94a3b8" />
        <span>Desk</span>
      </button>

      {/* Clock Display */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            letterSpacing: '0.5px',
            color: '#ffffff',
            fontWeight: 700,
          }}
        >
          03:17
        </span>
      </div>

      {/* Standard Phone Status Icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={() => {
            onToggleMute();
            hapticEngine.light();
          }}
          title={isMuted ? 'Unmute' : 'Mute'}
          style={{
            background: 'transparent',
            border: 'none',
            color: isMuted ? '#64748b' : '#94a3b8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            padding: '2px',
          }}
        >
          {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
        </button>
        <span style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8' }}>5G</span>
        <Wifi size={13} color="#94a3b8" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <BatteryMedium size={14} color="#38ef7d" />
          <span style={{ fontSize: '10px', color: '#cbd5e1' }}>78%</span>
        </div>
      </div>
    </div>
  );
};
