import React from 'react';
import { RotateCcw, FolderOpen } from 'lucide-react';
import type { CaseData, CaseSaveState } from '../cases/types';
import { soundEngine } from '../system/SoundEngine';
import { hapticEngine } from '../system/HapticEngine';

interface CaseSelectScreenProps {
  caseData: CaseData;
  saveState: CaseSaveState | null;
  onStartCase: () => void;
  onResetCase?: () => void;
}

export const CaseSelectScreen: React.FC<CaseSelectScreenProps> = ({
  caseData,
  saveState,
  onStartCase,
  onResetCase,
}) => {
  const hasStarted = saveState && (saveState.discoveredEvidenceIds.length > 0 || saveState.unlockedDeductionIds.length > 0);
  const isFinished = saveState?.caseFinished;

  const handleLaunch = () => {
    soundEngine.playDeskLampToggle();
    hapticEngine.medium();
    onStartCase();
  };

  return (
    <div
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundImage: 'url(/assets/case001/case-art/case001_cover.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#f8fafc',
        padding: '36px 24px 28px 24px',
        position: 'relative',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* Dark Vignette Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(7, 9, 14, 0.7) 0%, rgba(7, 9, 14, 0.4) 40%, rgba(7, 9, 14, 0.95) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Top Header */}
      <div style={{ zIndex: 10, textAlign: 'center' }}>
        <div
          style={{
            fontSize: '11px',
            color: '#94a3b8',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            fontWeight: 700,
          }}
        >
          AN INTERACTIVE DETECTIVE INVESTIGATION
        </div>
      </div>

      {/* Center Cinematic Title Branding */}
      <div style={{ zIndex: 10, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <h1
          style={{
            fontSize: '80px',
            fontWeight: 900,
            fontFamily: 'var(--font-mono)',
            letterSpacing: '8px',
            lineHeight: 1,
            margin: '0 0 8px 0',
            background: 'linear-gradient(180deg, #ffffff 30%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 10px 40px rgba(0, 0, 0, 0.9)',
          }}
        >
          3:17
        </h1>

        <p
          style={{
            fontSize: '14px',
            color: '#cbd5e1',
            letterSpacing: '2px',
            margin: '0 0 28px 0',
            fontWeight: 400,
            fontStyle: 'italic',
          }}
        >
          Every phone has a story.
        </p>

        {/* Case Dossier Card */}
        <div
          style={{
            width: '100%',
            maxWidth: '380px',
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#f59e0b', letterSpacing: '1px', textTransform: 'uppercase' }}>
              CASE 001 // OPEN INVESTIGATION
            </span>
            <span style={{ fontSize: '10px', color: '#94a3b8', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '4px' }}>
              Standard • ~30m
            </span>
          </div>

          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>
              {caseData.title.replace('Case 001: ', '')}
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
              Subject: {caseData.victimName} • Age {caseData.victimAge}
            </div>
          </div>

          <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
            A young data analyst vanishes in the dead of night. Her recovered smartphone is your only lead.
          </p>

          {hasStarted && (
            <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 600 }}>
              Progress: {saveState.discoveredEvidenceIds.length} Clues Logged • {saveState.unlockedDeductionIds.length} Deductions
            </div>
          )}

          {isFinished && (
            <div style={{ fontSize: '11px', color: '#86efac', fontWeight: 700 }}>
              ✓ Case Completed & Solved
            </div>
          )}

          <button
            onClick={handleLaunch}
            style={{
              marginTop: '4px',
              background: 'linear-gradient(135deg, #0284c7, #0369a1)',
              border: '1px solid #38bdf8',
              borderRadius: '10px',
              padding: '12px',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 800,
              letterSpacing: '1px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(2, 132, 199, 0.4)',
              transition: 'transform 0.15s ease',
            }}
          >
            <FolderOpen size={16} />
            <span>{hasStarted ? 'RESUME INVESTIGATION' : 'ENTER INVESTIGATION ROOM'}</span>
          </button>
        </div>
      </div>

      {/* Bottom Controls / Reset */}
      <div style={{ zIndex: 10, display: 'flex', alignItems: 'center', gap: '16px' }}>
        {hasStarted && onResetCase && (
          <button
            onClick={() => {
              soundEngine.playTap();
              onResetCase();
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '11.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={12} />
            <span>Reset Case Progress</span>
          </button>
        )}
      </div>
    </div>
  );
};
