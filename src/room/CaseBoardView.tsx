import React, { useState } from 'react';
import {
  ArrowLeft,
  Link2,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';
import type { CaseData, CaseSaveState, Deduction } from '../cases/types';
import { soundEngine } from '../system/SoundEngine';
import { hapticEngine } from '../system/HapticEngine';

interface CaseBoardViewProps {
  caseData: CaseData;
  saveState: CaseSaveState;
  onUnlockDeduction: (deduction: Deduction) => void;
  onBackToDesk: () => void;
  onOpenReport: () => void;
}

export const CaseBoardView: React.FC<CaseBoardViewProps> = ({
  caseData,
  saveState,
  onUnlockDeduction,
  onBackToDesk,
  onOpenReport,
}) => {
  const [selectedEvidenceA, setSelectedEvidenceA] = useState<string | null>(null);
  const [selectedEvidenceB, setSelectedEvidenceB] = useState<string | null>(null);
  const [activeDeductionModal, setActiveDeductionModal] = useState<Deduction | null>(null);
  const [connectionMessage, setConnectionMessage] = useState<{ text: string; isSuccess: boolean } | null>(null);
  const [inspectingEvidenceId, setInspectingEvidenceId] = useState<string | null>(null);

  const discoveredEvidence = caseData.evidenceList.filter((e) =>
    saveState.discoveredEvidenceIds.includes(e.id)
  );

  const unlockedDeductions = caseData.deductions.filter((d) =>
    saveState.unlockedDeductionIds.includes(d.id)
  );

  const handleEvidenceClick = (evidenceId: string) => {
    soundEngine.playPinCorkboard();
    hapticEngine.light();
    setConnectionMessage(null);

    if (!selectedEvidenceA) {
      setSelectedEvidenceA(evidenceId);
    } else if (selectedEvidenceA === evidenceId) {
      setSelectedEvidenceA(null);
    } else {
      setSelectedEvidenceB(evidenceId);
    }
  };

  const handleConnectClues = () => {
    if (!selectedEvidenceA || !selectedEvidenceB) return;

    const match = caseData.deductions.find((d) => {
      const [reqA, reqB] = d.requiredEvidenceIds;
      return (
        (reqA === selectedEvidenceA && reqB === selectedEvidenceB) ||
        (reqA === selectedEvidenceB && reqB === selectedEvidenceA)
      );
    });

    if (match) {
      soundEngine.playDeductionSuccess();
      hapticEngine.clueDiscovered();
      onUnlockDeduction(match);
      setActiveDeductionModal(match);
      setConnectionMessage({ text: `Connection Confirmed: ${match.title}`, isSuccess: true });
    } else {
      soundEngine.playWrongAccusation();
      hapticEngine.medium();
      setConnectionMessage({ text: 'No direct investigative connection found between these two clues.', isSuccess: false });
    }

    setSelectedEvidenceA(null);
    setSelectedEvidenceB(null);
  };

  const inspectingEvidence = inspectingEvidenceId
    ? caseData.evidenceList.find((e) => e.id === inspectingEvidenceId)
    : null;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#1a130e',
        color: '#f8fafc',
        position: 'relative',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          height: '52px',
          padding: '0 18px',
          background: 'linear-gradient(to bottom, #382416, #22140a)',
          borderBottom: '2px solid #573319',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 40,
        }}
      >
        <button
          onClick={() => {
            soundEngine.playPaperRustle();
            hapticEngine.light();
            onBackToDesk();
          }}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '8px',
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#e2e8f0',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={15} />
          <span>Back to Desk</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 800,
              color: '#fde047',
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            PHYSICAL INVESTIGATION BOARD
          </div>
          <span style={{ fontSize: '11px', color: '#cbd5e1', background: 'rgba(0,0,0,0.4)', padding: '2px 8px', borderRadius: '9999px', border: '1px solid rgba(255,255,255,0.1)' }}>
            {discoveredEvidence.length} Clues Pinned • {unlockedDeductions.length}/4 Deductions
          </span>
        </div>

        {selectedEvidenceA && selectedEvidenceB ? (
          <button
            onClick={handleConnectClues}
            style={{
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              border: '1px solid #f87171',
              borderRadius: '8px',
              padding: '6px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 0 16px rgba(239, 68, 68, 0.8)',
              animation: 'pulse 1.5s infinite',
            }}
          >
            <Link2 size={14} />
            <span>Connect Selected Clues</span>
          </button>
        ) : (
          <button
            onClick={() => {
              soundEngine.playPaperRustle();
              hapticEngine.medium();
              onOpenReport();
            }}
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '8px',
              padding: '6px 12px',
              color: '#fca5a5',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Final Case Report →
          </button>
        )}
      </div>

      {connectionMessage && (
        <div
          style={{
            background: connectionMessage.isSuccess ? 'rgba(22, 101, 52, 0.92)' : 'rgba(153, 27, 27, 0.92)',
            padding: '8px 16px',
            textAlign: 'center',
            fontSize: '12px',
            fontWeight: 700,
            color: '#ffffff',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
            zIndex: 35,
          }}
        >
          {connectionMessage.text}
        </div>
      )}

      {/* Main Surface */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          overflowY: 'auto',
          padding: '24px 20px 80px 20px',
          background: 'radial-gradient(circle at 50% 30%, #4a2e18 0%, #29180c 70%, #150c06 100%)',
          backgroundImage: 'radial-gradient(rgba(0, 0, 0, 0.2) 2px, transparent 2px)',
          backgroundSize: '16px 16px',
          boxShadow: 'inset 0 0 80px rgba(0, 0, 0, 0.9)',
        }}
      >
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5 }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <line x1="50%" y1="100" x2="15%" y2="160" stroke="#b91c1c" strokeWidth="2" strokeOpacity="0.75" />
          <line x1="50%" y1="100" x2="32%" y2="160" stroke="#b91c1c" strokeWidth="2" strokeOpacity="0.75" />
          <line x1="50%" y1="100" x2="68%" y2="160" stroke="#b91c1c" strokeWidth="2" strokeOpacity="0.75" />
          <line x1="50%" y1="100" x2="85%" y2="160" stroke="#b91c1c" strokeWidth="2" strokeOpacity="0.75" />
        </svg>

        {/* Victim Portrait */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px', position: 'relative', zIndex: 10 }}>
          <div
            style={{
              background: '#ffffff',
              padding: '8px 8px 18px 8px',
              borderRadius: '4px',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.8), 0 0 15px rgba(239, 68, 68, 0.3)',
              transform: 'rotate(-1deg)',
              position: 'relative',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-8px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: '#ef4444',
                boxShadow: '0 3px 6px rgba(0, 0, 0, 0.6)',
                border: '2px solid #7f1d1d',
              }}
            />
            <img
              src={caseData.characters[0]?.avatar || '/assets/characters/sarah_profile.webp'}
              alt="Sarah Mehta"
              style={{ width: '130px', height: '110px', objectFit: 'cover', borderRadius: '2px' }}
            />
            <div style={{ fontSize: '12px', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>
              SARAH MEHTA
            </div>
            <div style={{ fontSize: '10px', fontWeight: 800, color: '#dc2626', letterSpacing: '1px' }}>
              22 • MISSING PERSON
            </div>
          </div>
        </div>

        {/* Suspect Portraits */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
            gap: '16px',
            marginBottom: '36px',
            position: 'relative',
            zIndex: 10,
          }}
        >
          {caseData.characters.slice(1).map((char, index) => {
            const rotations = ['rotate(2deg)', 'rotate(-2deg)', 'rotate(1.5deg)', 'rotate(-1deg)', 'rotate(3deg)'];
            return (
              <div
                key={char.id}
                style={{
                  background: '#f8fafc',
                  padding: '6px 6px 14px 6px',
                  borderRadius: '3px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.7)',
                  transform: rotations[index % rotations.length],
                  position: 'relative',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: char.id === 'unknown' ? '#ef4444' : '#f59e0b',
                    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.5)',
                    border: '1px solid #78350f',
                  }}
                />
                <img
                  src={char.avatar}
                  alt={char.name}
                  style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '2px' }}
                />
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#1e293b', marginTop: '4px' }}>
                  {char.name}
                </div>
                <div style={{ fontSize: '9px', color: '#64748b', fontWeight: 600 }}>
                  {char.role}
                </div>
              </div>
            );
          })}
        </div>

        {/* Unlocked Deductions */}
        {unlockedDeductions.length > 0 && (
          <div style={{ marginBottom: '32px', position: 'relative', zIndex: 10 }}>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#fde047',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Sparkles size={14} color="#fde047" />
              <span>Confirmed Deductions ({unlockedDeductions.length})</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              {unlockedDeductions.map((ded) => (
                <div
                  key={ded.id}
                  onClick={() => setActiveDeductionModal(ded)}
                  style={{
                    background: '#fef08a',
                    border: '1px solid #ca8a04',
                    borderRadius: '6px',
                    padding: '12px 14px',
                    color: '#713f12',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.6)',
                    transform: 'rotate(-0.5deg)',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '12px',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: '#16a34a',
                      border: '1px solid #14532d',
                    }}
                  />
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#854d0e', marginBottom: '4px' }}>
                    ✓ {ded.title}
                  </div>
                  <div style={{ fontSize: '11px', color: '#1e293b', lineHeight: 1.4 }}>
                    {ded.insight}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pinned Extracted Evidence */}
        <div style={{ position: 'relative', zIndex: 10 }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#fde047',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>Extracted Evidence ({discoveredEvidence.length})</span>
            <span style={{ fontSize: '10.5px', color: '#fed7aa' }}>
              Tip: Tap two related clues to connect them
            </span>
          </div>

          {discoveredEvidence.length === 0 ? (
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: '2px dashed rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                padding: '30px 20px',
                textAlign: 'center',
                color: '#cbd5e1',
              }}
            >
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>
                The evidence board is currently empty.
              </p>
              <p style={{ margin: '6px 0 0 0', fontSize: '11.5px', color: '#94a3b8' }}>
                Inspect Sarah\'s recovered smartphone on the desk, examine messages, calls, photos, and notes, and select <strong>"Log to Case Board"</strong> to pin evidence here.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                gap: '14px',
              }}
            >
              {discoveredEvidence.map((ev) => {
                const isSelectedA = selectedEvidenceA === ev.id;
                const isSelectedB = selectedEvidenceB === ev.id;
                const isSelected = isSelectedA || isSelectedB;

                return (
                  <div
                    key={ev.id}
                    onClick={() => handleEvidenceClick(ev.id)}
                    style={{
                      background: isSelected ? '#fef2f2' : '#f8fafc',
                      border: isSelected ? '2px solid #ef4444' : '1px solid #cbd5e1',
                      borderRadius: '4px',
                      padding: '10px 12px',
                      boxShadow: isSelected
                        ? '0 0 20px rgba(239, 68, 68, 0.8), 0 8px 24px rgba(0,0,0,0.6)'
                        : '0 6px 18px rgba(0, 0, 0, 0.5)',
                      transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: '-6px',
                        left: '12px',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: isSelected ? '#ef4444' : '#3b82f6',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.5)',
                        border: '1px solid #1e3a8a',
                      }}
                    />

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        soundEngine.playTap();
                        setInspectingEvidenceId(ev.id);
                      }}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: 'transparent',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                      }}
                    >
                      <Info size={14} />
                    </button>

                    <div style={{ fontSize: '9px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {ev.category} • {ev.timestamp}
                    </div>

                    <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#0f172a', margin: '4px 0 6px 0' }}>
                      {ev.title}
                    </div>

                    <div style={{ fontSize: '10.5px', color: '#334155', lineHeight: 1.4 }}>
                      {ev.description}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Timeline Strip */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '64px',
          background: 'linear-gradient(to top, #140d07, #24150b)',
          borderTop: '2px solid #573319',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          overflowX: 'auto',
          gap: '16px',
          zIndex: 30,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, color: '#fde047', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>
          <Clock size={14} />
          <span>Timeline</span>
        </div>

        {caseData.timeline.map((event) => {
          const isUnlocked =
            !event.isLockedByDefault ||
            (event.unlockedByEvidenceId && saveState.discoveredEvidenceIds.includes(event.unlockedByEvidenceId)) ||
            saveState.unlockedTimelineEventIds.includes(event.id);

          return (
            <div
              key={event.id}
              style={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: isUnlocked
                  ? event.isKey317Event
                    ? 'rgba(239, 68, 68, 0.25)'
                    : 'rgba(255, 255, 255, 0.08)'
                  : 'rgba(0, 0, 0, 0.3)',
                border: isUnlocked
                  ? event.isKey317Event
                    ? '1px solid #ef4444'
                    : '1px solid rgba(255, 255, 255, 0.15)'
                  : '1px dashed rgba(255, 255, 255, 0.08)',
                padding: '6px 10px',
                borderRadius: '6px',
              }}
            >
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  fontWeight: 800,
                  color: isUnlocked ? (event.isKey317Event ? '#f87171' : '#38bdf8') : '#64748b',
                }}
              >
                {event.time}
              </span>
              <span style={{ fontSize: '10.5px', color: isUnlocked ? '#e2e8f0' : '#64748b', maxWidth: '140px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {isUnlocked ? event.title : '??? Undiscovered'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Deduction Unlocked Modal */}
      {activeDeductionModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 160,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setActiveDeductionModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '480px',
              background: '#fef08a',
              borderRadius: '12px',
              border: '2px solid #ca8a04',
              padding: '24px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.9)',
              color: '#713f12',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#854d0e', textTransform: 'uppercase', letterSpacing: '1px' }}>
              INVESTIGATIVE DEDUCTION UNLOCKED
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#451a03', margin: '8px 0' }}>
              {activeDeductionModal.title}
            </div>
            <div style={{ fontSize: '13px', color: '#1e293b', lineHeight: 1.5, margin: '12px 0' }}>
              {activeDeductionModal.insight}
            </div>
            {activeDeductionModal.unlockedQuestion && (
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.6)',
                  padding: '10px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  color: '#854d0e',
                  fontStyle: 'italic',
                }}
              >
                Investigative Question: {activeDeductionModal.unlockedQuestion}
              </div>
            )}

            <button
              onClick={() => {
                soundEngine.playTap();
                setActiveDeductionModal(null);
              }}
              style={{
                width: '100%',
                marginTop: '16px',
                background: '#854d0e',
                border: 'none',
                borderRadius: '8px',
                padding: '10px',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Pin to Board
            </button>
          </div>
        </div>
      )}

      {/* Inspect Evidence Modal */}
      {inspectingEvidence && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 160,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setInspectingEvidenceId(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '440px',
              background: '#f8fafc',
              borderRadius: '10px',
              padding: '20px',
              color: '#0f172a',
              boxShadow: '0 20px 50px rgba(0,0,0,0.9)',
            }}
          >
            <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
              {inspectingEvidence.category} • {inspectingEvidence.timestamp}
            </div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '6px 0 10px 0' }}>
              {inspectingEvidence.title}
            </div>
            <div style={{ fontSize: '12.5px', color: '#334155', lineHeight: 1.5 }}>
              {inspectingEvidence.description}
            </div>

            {inspectingEvidence.tag && (
              <div style={{ marginTop: '12px' }}>
                <span
                  style={{
                    background: '#e2e8f0',
                    color: '#475569',
                    fontSize: '10px',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}
                >
                  #{inspectingEvidence.tag}
                </span>
              </div>
            )}

            <button
              onClick={() => setInspectingEvidenceId(null)}
              style={{
                width: '100%',
                marginTop: '16px',
                background: '#0f172a',
                border: 'none',
                borderRadius: '6px',
                padding: '8px',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
