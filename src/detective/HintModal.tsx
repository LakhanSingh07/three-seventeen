import React from 'react';
import { Lightbulb, Sparkles, X } from 'lucide-react';
import type { CaseData, HintItem } from '../cases/types';
import { soundEngine } from '../system/SoundEngine';
import { hapticEngine } from '../system/HapticEngine';

interface HintModalProps {
  caseData: CaseData;
  usedHintIds: string[];
  onUseHint: (hintId: string) => void;
  onClose: () => void;
}

export const HintModal: React.FC<HintModalProps> = ({
  caseData,
  usedHintIds,
  onUseHint,
  onClose,
}) => {
  const handleUnlockHint = (hint: HintItem) => {
    soundEngine.playEvidenceSting();
    hapticEngine.medium();
    onUseHint(hint.id);
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(5, 7, 12, 0.95)',
        backdropFilter: 'blur(20px)',
        zIndex: 120,
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 16px',
        color: '#ffffff',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lightbulb size={20} color="#ffd200" />
          <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Investigative Intel & Hints</h2>
        </div>

        <button
          onClick={() => {
            soundEngine.playTap();
            onClose();
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          <X size={22} />
        </button>
      </div>

      <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px', lineHeight: '1.4' }}>
        Progressive intelligence tiers guide you toward overlooked clues without spoiling the solution directly.
      </p>

      {/* Hint Tiers List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto' }}>
        {caseData.hints.map((hint) => {
          const isUnlocked = usedHintIds.includes(hint.id);

          return (
            <div
              key={hint.id}
              style={{
                background: isUnlocked
                  ? 'linear-gradient(135deg, rgba(255, 210, 0, 0.15), rgba(18, 24, 38, 0.9))'
                  : 'rgba(18, 24, 38, 0.75)',
                borderRadius: '16px',
                padding: '16px',
                border: isUnlocked ? '1px solid #ffd200' : '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background:
                      hint.tier === 1
                        ? 'rgba(56, 189, 248, 0.2)'
                        : hint.tier === 2
                        ? 'rgba(255, 112, 67, 0.2)'
                        : 'rgba(255, 210, 0, 0.2)',
                    color: hint.tier === 1 ? '#38bdf8' : hint.tier === 2 ? '#ff7043' : '#ffd200',
                  }}
                >
                  TIER {hint.tier} • {hint.tier === 1 ? 'GENERAL DIRECTION' : hint.tier === 2 ? 'APP INCONSISTENCY' : 'DIRECT DEDUCTION'}
                </span>

                <span style={{ fontSize: '10px', color: isUnlocked ? '#a7f3d0' : '#64748b' }}>
                  {isUnlocked ? 'DECRYPTED ✓' : `-${hint.costPoints} SCORE`}
                </span>
              </div>

              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', marginTop: '8px' }}>
                {hint.title}
              </h4>

              {isUnlocked ? (
                <p style={{ fontSize: '12px', color: '#fef08a', marginTop: '6px', lineHeight: '1.5' }}>
                  {hint.text}
                </p>
              ) : (
                <button
                  onClick={() => handleUnlockHint(hint)}
                  style={{
                    marginTop: '12px',
                    width: '100%',
                    background: 'linear-gradient(135deg, #ffd200, #f59e0b)',
                    color: '#000000',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px',
                    fontSize: '12px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                  }}
                >
                  <Sparkles size={14} />
                  <span>REVEAL TIER {hint.tier} HINT</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
