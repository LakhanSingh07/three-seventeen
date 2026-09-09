import React, { useState } from 'react';
import { X, MapPin, Navigation } from 'lucide-react';
import type { CaseData } from '../cases/types';
import { soundEngine } from '../system/SoundEngine';
import { hapticEngine } from '../system/HapticEngine';

interface CityMapModalProps {
  caseData: CaseData;
  onClose: () => void;
}

export const CityMapModal: React.FC<CityMapModalProps> = ({
  caseData,
  onClose,
}) => {
  const [selectedLocId, setSelectedLocId] = useState<string>('loc-station');

  const selectedLoc = caseData.locations.find((l) => l.id === selectedLocId) || caseData.locations[0];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 150,
        background: 'rgba(5, 7, 14, 0.88)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.25s ease',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: '16px',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '14px 20px',
            background: 'rgba(15, 23, 42, 0.95)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Navigation size={18} color="#38bdf8" />
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc', letterSpacing: '1px', textTransform: 'uppercase' }}>
              City Transit & Location Map
            </span>
          </div>

          <button
            onClick={() => {
              soundEngine.playPaperRustle();
              hapticEngine.light();
              onClose();
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Map Visual Canvas */}
        <div
          style={{
            height: '320px',
            background: '#0d131f',
            position: 'relative',
            overflow: 'hidden',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(rgba(56, 189, 248, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.06) 1px, transparent 1px)',
              backgroundSize: '30px 30px',
            }}
          />

          <svg
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M 40,20 Q 180,120 320,160 T 640,300"
              fill="none"
              stroke="rgba(14, 116, 144, 0.35)"
              strokeWidth="24"
            />
            <path
              d="M 180,80 L 260,150 L 380,190 L 520,250"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              strokeDasharray="6 4"
            />
          </svg>

          {caseData.locations.map((loc, idx) => {
            const positions = [
              { top: '65px', left: '170px' },
              { top: '135px', left: '250px' },
              { top: '175px', left: '370px' },
              { top: '235px', left: '505px' },
            ];
            const pos = positions[idx] || { top: '50%', left: '50%' };
            const isSelected = selectedLocId === loc.id;

            return (
              <button
                key={loc.id}
                onClick={() => {
                  soundEngine.playTap();
                  hapticEngine.light();
                  setSelectedLocId(loc.id);
                }}
                style={{
                  position: 'absolute',
                  top: pos.top,
                  left: pos.left,
                  transform: 'translate(-50%, -100%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  zIndex: isSelected ? 20 : 10,
                }}
              >
                <div
                  style={{
                    background: isSelected ? '#ef4444' : '#38bdf8',
                    padding: '6px',
                    borderRadius: '50%',
                    boxShadow: isSelected
                      ? '0 0 16px rgba(239, 68, 68, 0.8)'
                      : '0 4px 10px rgba(0, 0, 0, 0.5)',
                    border: '2px solid #ffffff',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <MapPin size={16} color="#ffffff" />
                </div>

                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.9)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: isSelected ? '#fca5a5' : '#e2e8f0',
                    marginTop: '4px',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
                  }}
                >
                  {loc.name}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Location Details Panel */}
        <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#f8fafc' }}>
              {selectedLoc.name}
            </div>
            <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>{selectedLoc.address}</span>
          </div>

          <div
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '12px 14px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              fontSize: '12.5px',
              color: '#cbd5e1',
              lineHeight: 1.5,
              marginTop: '4px',
            }}
          >
            {selectedLoc.description}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            background: 'rgba(15, 23, 42, 0.95)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={() => {
              soundEngine.playPaperRustle();
              onClose();
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#cbd5e1',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Close Map
          </button>
        </div>
      </div>
    </div>
  );
};
