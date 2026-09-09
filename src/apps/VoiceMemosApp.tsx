import React, { useState } from 'react';
import { ChevronLeft, Play, Pause, FileCheck, PlusCircle, Check } from 'lucide-react';
import type { CaseData } from '../cases/types';
import { soundEngine } from '../system/SoundEngine';
import { hapticEngine } from '../system/HapticEngine';

interface VoiceMemosAppProps {
  caseData: CaseData;
  discoveredEvidenceIds: string[];
  onDiscoverEvidence: (evidenceId: string) => void;
  onBackToHome: () => void;
}

export const VoiceMemosApp: React.FC<VoiceMemosAppProps> = ({
  caseData: _caseData,
  discoveredEvidenceIds,
  onDiscoverEvidence,
  onBackToHome,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const evidenceId = 'EVD_VOICE_MEMO_317';
  const isDiscovered = discoveredEvidenceIds.includes(evidenceId);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    soundEngine.playTap();
    hapticEngine.medium();
  };

  const handleExtractClue = () => {
    soundEngine.playEvidenceLogged();
    hapticEngine.clueDiscovered();
    onDiscoverEvidence(evidenceId);
    showToast('✓ Voice memo logged to Investigation Board');
  };

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
          Voice Memos
        </span>

        <div style={{ width: '28px' }} />
      </div>

      <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div
          style={{
            background: '#1e293b',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>Emergency Audio Memo 03:20 AM</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Recorded 03:20 AM • 0:34</div>
            </div>

            <button
              onClick={togglePlayback}
              style={{
                background: isPlaying ? '#ef4444' : '#0284c7',
                border: 'none',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                cursor: 'pointer',
              }}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: '2px' }} />}
            </button>
          </div>

          <div
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#cbd5e1',
              lineHeight: 1.5,
              fontStyle: 'italic',
            }}
          >
            "(Heavy breathing, vehicle engine acceleration in background) Someone was waiting by the locker exit... a black sedan has been tailing me since 42nd Street. If you find this phone, the master drive is in Locker 28. Code 8-3-1-7. Don't let Ardent take it..."
          </div>

          <div>
            {isDiscovered ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#86efac', fontSize: '11px', fontWeight: 600 }}>
                <FileCheck size={14} />
                <span>Logged to Investigation Board</span>
              </div>
            ) : (
              <button
                onClick={handleExtractClue}
                style={{
                  background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                  border: '1px solid #38bdf8',
                  borderRadius: '6px',
                  padding: '6px 12px',
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
                <span>Log Memo to Case Board</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
