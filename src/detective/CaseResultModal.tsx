import React, { useEffect } from 'react';
import { Trophy, AlertTriangle, RotateCcw, ArrowRight, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { CaseData, EndingData, CaseSaveState } from '../cases/types';
import { SaveSystem } from '../system/SaveSystem';
import { soundEngine } from '../system/SoundEngine';
import { hapticEngine } from '../system/HapticEngine';

interface CaseResultModalProps {
  caseData: CaseData;
  ending: EndingData;
  saveState: CaseSaveState;
  onReplayCase: () => void;
  onContinueInvestigation: () => void;
  onOpenCaseSelect: () => void;
}

export const CaseResultModal: React.FC<CaseResultModalProps> = ({
  caseData,
  ending,
  saveState,
  onReplayCase,
  onContinueInvestigation,
  onOpenCaseSelect,
}) => {
  const isSolved = ending.type === 'solved';
  const score = SaveSystem.calculateScore(caseData, saveState, isSolved);
  const artImage = isSolved ? '/assets/case001/case-art/case001_solved.webp' : '/assets/case001/case-art/case001_failed.webp';

  useEffect(() => {
    if (isSolved) {
      soundEngine.playSolvedFanfare();
      hapticEngine.deduction();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#fbbf24', '#34d399', '#f43f5e'],
        });
      } catch {
        // Confetti optional
      }
    } else {
      soundEngine.playWrongAccusation();
      hapticEngine.alert();
    }
  }, [isSolved]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(5, 7, 12, 0.98)',
        backdropFilter: 'blur(24px)',
        zIndex: 130,
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 20px',
        color: '#ffffff',
        overflowY: 'auto',
      }}
    >
      {/* Hero Resolution Artwork */}
      <div
        style={{
          width: '100%',
          height: '160px',
          borderRadius: '16px',
          overflow: 'hidden',
          position: 'relative',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
          marginBottom: '16px',
          flexShrink: 0,
        }}
      >
        <img
          src={artImage}
          alt={ending.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '16px',
            right: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <div
            style={{
              padding: '6px',
              borderRadius: '8px',
              background: isSolved ? '#059669' : '#dc2626',
            }}
          >
            {isSolved ? <Trophy size={18} color="#ffffff" /> : <AlertTriangle size={18} color="#ffffff" />}
          </div>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 800, color: isSolved ? '#6ee7b7' : '#fca5a5', textTransform: 'uppercase' }}>
              {ending.subtitle}
            </div>
            <div style={{ fontSize: '15px', fontWeight: 900, color: '#ffffff' }}>
              {ending.title}
            </div>
          </div>
        </div>
      </div>

      {/* Score Summary Card */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          padding: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.5px' }}>INVESTIGATION RATING</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Award size={16} color="#fbbf24" />
            <span style={{ fontSize: '16px', fontWeight: 900, color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>
              {score.finalScore.toLocaleString()} PTS
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '8px' }}>
            <span style={{ fontSize: '10px', color: '#94a3b8' }}>Evidence</span>
            <p style={{ fontSize: '13px', fontWeight: 800, color: '#38bdf8', margin: '2px 0 0 0' }}>{score.evidencePercent}%</p>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '8px' }}>
            <span style={{ fontSize: '10px', color: '#94a3b8' }}>Deductions</span>
            <p style={{ fontSize: '13px', fontWeight: 800, color: '#a7f3d0', margin: '2px 0 0 0' }}>{score.deductionsPercent}%</p>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '8px' }}>
            <span style={{ fontSize: '10px', color: '#94a3b8' }}>Rank</span>
            <p style={{ fontSize: '13px', fontWeight: 900, color: score.rank === 'S' ? '#fbbf24' : '#ffffff', margin: '2px 0 0 0' }}>
              GRADE {score.rank}
            </p>
          </div>
        </div>
      </div>

      {/* Narrative Resolution */}
      <div
        style={{
          background: 'rgba(18, 24, 38, 0.8)',
          borderRadius: '16px',
          padding: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '16px',
        }}
      >
        <h3 style={{ fontSize: '12px', fontWeight: 800, color: '#f59e0b', marginBottom: '8px', letterSpacing: '0.5px' }}>
          CASE DEBRIEFING
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', lineHeight: '1.5', color: '#cbd5e1' }}>
          {ending.narrative.map((para, idx) => (
            <p key={idx} style={{ margin: 0 }}>{para}</p>
          ))}
        </div>

        {/* Rebuttal Points for Failed Accusations */}
        {ending.rebuttalPoints && ending.rebuttalPoints.length > 0 && (
          <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <h4 style={{ fontSize: '11px', fontWeight: 800, color: '#fca5a5', marginBottom: '4px' }}>
              CONTRADICTIONS IN YOUR THEORY:
            </h4>
            <ul style={{ paddingLeft: '16px', fontSize: '11px', color: '#fecaca', display: 'flex', flexDirection: 'column', gap: '4px', margin: 0 }}>
              {ending.rebuttalPoints.map((pt, i) => (
                <li key={i}>{pt}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
        {!isSolved ? (
          <button
            onClick={() => {
              soundEngine.playTap();
              onContinueInvestigation();
            }}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #0284c7, #0369a1)',
              border: '1px solid #38bdf8',
              borderRadius: '12px',
              padding: '12px',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <span>RE-EXAMINE CLUES ON DESK & PHONE</span>
            <ArrowRight size={15} />
          </button>
        ) : (
          <button
            onClick={() => {
              soundEngine.playTap();
              onOpenCaseSelect();
            }}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #059669, #047857)',
              border: '1px solid #34d399',
              borderRadius: '12px',
              padding: '12px',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <span>RETURN TO CASE ARCHIVES</span>
            <ArrowRight size={15} />
          </button>
        )}

        <button
          onClick={() => {
            soundEngine.playTap();
            onReplayCase();
          }}
          style={{
            width: '100%',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            padding: '10px',
            color: '#cbd5e1',
            fontWeight: 700,
            fontSize: '11.5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <RotateCcw size={13} />
          <span>REPLAY CASE 001 FROM SCRATCH</span>
        </button>
      </div>
    </div>
  );
};
