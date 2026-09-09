import React from 'react';
import {
  MessageSquare,
  Camera,
  Phone,
  MapPin,
  FileText,
  Globe,
  FolderLock,
  Users,
  Mic,
} from 'lucide-react';
import { soundEngine } from '../system/SoundEngine';
import { hapticEngine } from '../system/HapticEngine';

export type AppId =
  | 'messages'
  | 'photos'
  | 'phone'
  | 'maps'
  | 'notes'
  | 'browser'
  | 'files'
  | 'contacts'
  | 'voice_memos';

interface NovaHomeScreenProps {
  onOpenApp: (appId: AppId) => void;
}

export const NovaHomeScreen: React.FC<NovaHomeScreenProps> = ({
  onOpenApp,
}) => {
  const handleLaunch = (appId: AppId) => {
    soundEngine.playTap();
    hapticEngine.medium();
    onOpenApp(appId);
  };

  const apps: Array<{
    id: AppId;
    name: string;
    icon: React.ReactNode;
    gradient: string;
    borderColor: string;
    badgeCount?: number;
  }> = [
    {
      id: 'messages',
      name: 'Messages',
      icon: <MessageSquare size={26} color="#ffffff" />,
      gradient: 'linear-gradient(135deg, #0284c7, #0369a1)',
      borderColor: 'rgba(56, 189, 248, 0.4)',
      badgeCount: 2,
    },
    {
      id: 'photos',
      name: 'Gallery',
      icon: <Camera size={26} color="#ffffff" />,
      gradient: 'linear-gradient(135deg, #e11d48, #be123c)',
      borderColor: 'rgba(244, 63, 94, 0.4)',
    },
    {
      id: 'phone',
      name: 'Phone',
      icon: <Phone size={26} color="#ffffff" />,
      gradient: 'linear-gradient(135deg, #059669, #047857)',
      borderColor: 'rgba(16, 185, 129, 0.4)',
      badgeCount: 1,
    },
    {
      id: 'maps',
      name: 'Maps',
      icon: <MapPin size={26} color="#ffffff" />,
      gradient: 'linear-gradient(135deg, #d97706, #b45309)',
      borderColor: 'rgba(245, 158, 11, 0.4)',
    },
    {
      id: 'notes',
      name: 'Notes',
      icon: <FileText size={26} color="#ffffff" />,
      gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)',
      borderColor: 'rgba(99, 102, 241, 0.4)',
    },
    {
      id: 'browser',
      name: 'Browser',
      icon: <Globe size={26} color="#ffffff" />,
      gradient: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
      borderColor: 'rgba(14, 165, 233, 0.4)',
    },
    {
      id: 'voice_memos',
      name: 'Voice Memos',
      icon: <Mic size={26} color="#ffffff" />,
      gradient: 'linear-gradient(135deg, #e11d48, #9f1239)',
      borderColor: 'rgba(225, 29, 72, 0.4)',
      badgeCount: 1,
    },
    {
      id: 'files',
      name: 'Vault',
      icon: <FolderLock size={26} color="#ffffff" />,
      gradient: 'linear-gradient(135deg, #475569, #334155)',
      borderColor: 'rgba(100, 116, 139, 0.4)',
    },
    {
      id: 'contacts',
      name: 'Contacts',
      icon: <Users size={26} color="#ffffff" />,
      gradient: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
      borderColor: 'rgba(124, 58, 237, 0.4)',
    },
  ];

  return (
    <div
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '16px 20px 24px 20px',
        position: 'relative',
        backgroundImage: 'url(/assets/case001/wallpapers/sarah_home_wallpaper.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Subtle overlay for contrast */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.5) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Top Clock & Weather Widget */}
      <div style={{ zIndex: 10, marginTop: '8px', textAlign: 'center' }}>
        <div
          style={{
            fontSize: '52px',
            fontWeight: 300,
            fontFamily: 'var(--font-mono)',
            color: '#f8fafc',
            letterSpacing: '-1px',
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
            marginTop: '6px',
            fontWeight: 500,
            letterSpacing: '0.4px',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
          }}
        >
          Wednesday, September 9 • 17°C Overcast
        </div>
      </div>

      {/* Middle Grid of Authentic Apps */}
      <div style={{ zIndex: 10, margin: 'auto 0' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '22px 14px',
            justifyItems: 'center',
          }}
        >
          {apps.map((app) => (
            <button
              key={app.id}
              onClick={() => handleLaunch(app.id)}
              style={{
                background: 'transparent',
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                width: '78px',
                transition: 'transform 0.15s ease',
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.92)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              onTouchStart={(e) => (e.currentTarget.style.transform = 'scale(0.92)')}
              onTouchEnd={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {/* App Icon Tile */}
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: app.gradient,
                  border: `1px solid ${app.borderColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.55)',
                  position: 'relative',
                }}
              >
                {app.icon}
                {app.badgeCount && app.badgeCount > 0 ? (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      background: '#ef4444',
                      color: '#ffffff',
                      fontSize: '10px',
                      fontWeight: 800,
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid #06070a',
                      boxShadow: '0 2px 8px rgba(239, 68, 68, 0.6)',
                    }}
                  >
                    {app.badgeCount}
                  </span>
                ) : null}
              </div>

              {/* App Name Label */}
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 500,
                  color: '#f8fafc',
                  textShadow: '0 2px 6px rgba(0, 0, 0, 0.9)',
                  textAlign: 'center',
                  letterSpacing: '0.2px',
                }}
              >
                {app.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom App Dock */}
      <div
        style={{
          zIndex: 10,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          padding: '10px 16px',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
        }}
      >
        <button
          onClick={() => handleLaunch('phone')}
          style={{
            background: 'linear-gradient(135deg, #059669, #047857)',
            border: 'none',
            borderRadius: '14px',
            width: '46px',
            height: '46px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)',
          }}
        >
          <Phone size={22} color="#ffffff" />
        </button>

        <button
          onClick={() => handleLaunch('messages')}
          style={{
            background: 'linear-gradient(135deg, #0284c7, #0369a1)',
            border: 'none',
            borderRadius: '14px',
            width: '46px',
            height: '46px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
          }}
        >
          <MessageSquare size={22} color="#ffffff" />
        </button>

        <button
          onClick={() => handleLaunch('photos')}
          style={{
            background: 'linear-gradient(135deg, #e11d48, #be123c)',
            border: 'none',
            borderRadius: '14px',
            width: '46px',
            height: '46px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(225, 29, 72, 0.35)',
          }}
        >
          <Camera size={22} color="#ffffff" />
        </button>

        <button
          onClick={() => handleLaunch('browser')}
          style={{
            background: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
            border: 'none',
            borderRadius: '14px',
            width: '46px',
            height: '46px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
          }}
        >
          <Globe size={22} color="#ffffff" />
        </button>
      </div>
    </div>
  );
};
