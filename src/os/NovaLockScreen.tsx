import React, { useState } from 'react';
import { Fingerprint, Lock, PhoneCall, MessageSquare } from 'lucide-react';
import { soundEngine } from '../system/SoundEngine';
import { hapticEngine } from '../system/HapticEngine';

interface NovaLockScreenProps {
  onUnlock: () => void;
  victimName: string;
}

export const NovaLockScreen: React.FC<NovaLockScreenProps> = ({ onUnlock, victimName }) => {
  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleUnlock = () => {
    setIsUnlocking(true);
    soundEngine.playUnlockClick();
    hapticEngine.heavy();
    setTimeout(() => {
      onUnlock();
    }, 400);
  };

  return (
    <div
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 20px',
        backgroundImage: 'url(/assets/case001/wallpapers/sarah_lock_wallpaper.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#ffffff',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* Dark gradient overlay for readability */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.75) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Top Lock Status */}
      <div
        style={{
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(10px)',
            padding: '4px 12px',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
          }}
        >
          <Lock size={12} color="#94a3b8" />
          <span style={{ fontSize: '11px', color: '#cbd5e1', fontWeight: 600, letterSpacing: '0.5px' }}>
            NOVA OS SECURED
          </span>
        </div>
      </div>

      {/* Clock & Notifications */}
      <div
        style={{
          zIndex: 10,
          textAlign: 'center',
          margin: 'auto 0 16px 0',
        }}
      >
        <div
          style={{
            fontSize: '60px',
            fontWeight: 300,
            fontFamily: 'var(--font-mono)',
            letterSpacing: '-2px',
            lineHeight: 1,
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.8)',
          }}
        >
          03:17
        </div>
        <div
          style={{
            fontSize: '13px',
            color: '#e2e8f0',
            marginTop: '8px',
            fontWeight: 500,
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
          }}
        >
          Wednesday, September 9
        </div>

        {/* Notifications preview on lockscreen */}
        <div
          style={{
            marginTop: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '320px',
              background: 'rgba(15, 23, 42, 0.8)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '14px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textAlign: 'left',
              boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ background: '#0284c7', padding: '6px', borderRadius: '8px' }}>
              <MessageSquare size={16} color="#ffffff" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#f8fafc' }}>Unknown</span>
                <span style={{ fontSize: '9px', color: '#94a3b8' }}>03:17</span>
              </div>
              <div style={{ fontSize: '11px', color: '#cbd5e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Don't look for me. It's done.
              </div>
            </div>
          </div>

          <div
            style={{
              width: '100%',
              maxWidth: '320px',
              background: 'rgba(15, 23, 42, 0.8)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '14px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textAlign: 'left',
              boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ background: '#ef4444', padding: '6px', borderRadius: '8px' }}>
              <PhoneCall size={16} color="#ffffff" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#f8fafc' }}>Alex</span>
                <span style={{ fontSize: '9px', color: '#94a3b8' }}>02:58</span>
              </div>
              <div style={{ fontSize: '11px', color: '#cbd5e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Missed call (2)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Unlock Button */}
      <div
        style={{
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <button
          onClick={handleUnlock}
          disabled={isUnlocking}
          style={{
            background: isUnlocking
              ? 'rgba(56, 189, 248, 0.5)'
              : 'rgba(255, 255, 255, 0.14)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            borderRadius: '32px',
            padding: '12px 28px',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
            transition: 'all 0.2s ease',
            transform: isUnlocking ? 'scale(0.95)' : 'none',
          }}
        >
          <Fingerprint size={24} color={isUnlocking ? '#38bdf8' : '#ffffff'} />
          <span style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.5px' }}>
            {isUnlocking ? 'DECRYPTING...' : 'TOUCH TO UNLOCK'}
          </span>
        </button>

        <div style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '0.3px' }}>
          Device Owner: {victimName}
        </div>
      </div>
    </div>
  );
};
