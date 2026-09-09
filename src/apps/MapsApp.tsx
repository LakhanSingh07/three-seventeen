import React, { useState } from 'react';
import { ChevronLeft, MapPin, FileCheck, PlusCircle, Check } from 'lucide-react';
import type { CaseData, MapLocation } from '../cases/types';
import { soundEngine } from '../system/SoundEngine';
import { hapticEngine } from '../system/HapticEngine';

interface MapsAppProps {
  caseData: CaseData;
  discoveredEvidenceIds: string[];
  onDiscoverEvidence: (evidenceId: string) => void;
  onBackToHome: () => void;
}

export const MapsApp: React.FC<MapsAppProps> = ({
  caseData,
  discoveredEvidenceIds,
  onDiscoverEvidence,
  onBackToHome,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<MapLocation>(caseData.locations[2]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleExtractClue = (evidenceId: string) => {
    soundEngine.playEvidenceLogged();
    hapticEngine.clueDiscovered();
    onDiscoverEvidence(evidenceId);
    showToast('✓ Location log saved to Investigation Board');
  };

  const clueId = selectedLocation.pings.find((p) => p.clueEvidenceId)?.clueEvidenceId;

  return (
    <div
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#090b10',
        color: '#f8fafc',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {toastMessage && (
        <div
          style={{
            position: 'absolute',
            top: '56px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #0284c7, #0369a1)',
            color: '#ffffff',
            padding: '8px 16px',
            borderRadius: '9999px',
            fontSize: '11px',
            fontWeight: 700,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Check size={14} />
          <span>{toastMessage}</span>
        </div>
      )}

      <div
        style={{
          height: '50px',
          padding: '0 14px',
          background: 'rgba(15, 23, 42, 0.95)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <button
          onClick={() => {
            soundEngine.playTap();
            onBackToHome();
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#38bdf8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            padding: '4px',
          }}
        >
          <ChevronLeft size={22} />
        </button>

        <span style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
          Location History
        </span>

        <div style={{ width: '28px' }} />
      </div>

      <div style={{ height: '220px', background: '#0b1320', position: 'relative', overflow: 'hidden' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(56, 189, 248, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.05) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {caseData.locations.map((loc, idx) => {
          const positions = [
            { top: '40px', left: '80px' },
            { top: '80px', left: '160px' },
            { top: '120px', left: '240px' },
            { top: '160px', left: '320px' },
          ];
          const pos = positions[idx] || { top: '50%', left: '50%' };
          const isSelected = selectedLocation.id === loc.id;

          return (
            <button
              key={loc.id}
              onClick={() => {
                soundEngine.playTap();
                setSelectedLocation(loc);
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
              }}
            >
              <div
                style={{
                  background: isSelected ? '#ef4444' : '#0284c7',
                  padding: '4px',
                  borderRadius: '50%',
                  border: '2px solid #ffffff',
                }}
              >
                <MapPin size={14} color="#ffffff" />
              </div>
              <span style={{ fontSize: '9px', fontWeight: 700, color: isSelected ? '#fca5a5' : '#cbd5e1', background: 'rgba(0,0,0,0.6)', padding: '1px 4px', borderRadius: '3px', marginTop: '2px' }}>
                {loc.name}
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff' }}>{selectedLocation.name}</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>{selectedLocation.address}</div>
        </div>

        <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', fontSize: '12.5px', color: '#cbd5e1', lineHeight: 1.5 }}>
          {selectedLocation.description}
        </div>

        {clueId && (
          <div>
            {discoveredEvidenceIds.includes(clueId) ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#86efac', fontSize: '11px', fontWeight: 600 }}>
                <FileCheck size={14} />
                <span>Logged to Investigation Board</span>
              </div>
            ) : (
              <button
                onClick={() => handleExtractClue(clueId)}
                style={{
                  background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                  border: '1px solid #38bdf8',
                  borderRadius: '6px',
                  padding: '8px 14px',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <PlusCircle size={13} />
                <span>Log Location to Case Board</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
