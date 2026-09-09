import React, { useState } from 'react';
import {
  ShieldAlert,
  Link,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Layers,
  Zap,
} from 'lucide-react';
import type { CaseData, Deduction } from '../cases/types';
import { CaseEngine } from '../cases/case-engine';
import { soundEngine } from '../system/SoundEngine';
import { hapticEngine } from '../system/HapticEngine';

interface EvidenceBoardProps {
  caseData: CaseData;
  discoveredEvidenceIds: string[];
  unlockedDeductionIds: string[];
  onUnlockDeduction: (deduction: Deduction) => void;
  onOpenAppForClue?: (appId: string) => void;
}

export const EvidenceBoard: React.FC<EvidenceBoardProps> = ({
  caseData,
  discoveredEvidenceIds,
  unlockedDeductionIds,
  onUnlockDeduction,
}) => {
  const [selectedEvidenceIds, setSelectedEvidenceIds] = useState<string[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<'board' | 'deductions'>('board');

  const discoveredItems = caseData.evidenceList.filter((e) =>
    discoveredEvidenceIds.includes(e.id)
  );

  const unlockedDeductions = caseData.deductions.filter((d) =>
    unlockedDeductionIds.includes(d.id)
  );

  const handleToggleSelect = (evidenceId: string) => {
    soundEngine.playTap();
    hapticEngine.light();
    setFeedbackMessage(null);

    if (selectedEvidenceIds.includes(evidenceId)) {
      setSelectedEvidenceIds(selectedEvidenceIds.filter((id) => id !== evidenceId));
    } else {
      if (selectedEvidenceIds.length >= 2) {
        setSelectedEvidenceIds([selectedEvidenceIds[1], evidenceId]);
      } else {
        setSelectedEvidenceIds([...selectedEvidenceIds, evidenceId]);
      }
    }
  };

  const handleConnectClues = () => {
    if (selectedEvidenceIds.length < 2) {
      setFeedbackMessage({
        text: 'Select 2 evidence cards to synthesize a connection.',
        type: 'info',
      });
      return;
    }

    const [idA, idB] = selectedEvidenceIds;
    const result = CaseEngine.tryConnectEvidence(caseData, idA, idB, unlockedDeductionIds);

    if (result.success && result.deduction) {
      if (result.isContradiction) {
        soundEngine.playContradictionSting();
      } else {
        soundEngine.playDeductionSuccess();
      }
      hapticEngine.deduction();
      onUnlockDeduction(result.deduction);
      setFeedbackMessage({
        text: `★ ${result.deduction.title}: ${result.deduction.insight}`,
        type: 'success',
      });
      setSelectedEvidenceIds([]);
    } else {
      soundEngine.playTap();
      hapticEngine.light();
      setFeedbackMessage({
        text: "These clues don't appear connected yet. Try comparing timestamps or statements.",
        type: 'error',
      });
    }
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
      }}
    >
      {/* Sub Tabs: Evidence Board vs Deductions */}
      <div
        style={{
          display: 'flex',
          padding: '10px 14px',
          gap: '8px',
          background: 'rgba(15, 20, 30, 0.95)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <button
          onClick={() => {
            setActiveTab('board');
            soundEngine.playTap();
          }}
          style={{
            flex: 1,
            background: activeTab === 'board' ? '#ff5722' : 'rgba(255, 255, 255, 0.06)',
            border: 'none',
            borderRadius: '8px',
            padding: '8px',
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <Layers size={14} />
          <span>EVIDENCE CARDS ({discoveredItems.length}/{caseData.evidenceList.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('deductions');
            soundEngine.playTap();
          }}
          style={{
            flex: 1,
            background: activeTab === 'deductions' ? '#9d4edd' : 'rgba(255, 255, 255, 0.06)',
            border: 'none',
            borderRadius: '8px',
            padding: '8px',
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <Zap size={14} />
          <span>DEDUCTIONS ({unlockedDeductions.length}/{caseData.deductions.length})</span>
        </button>
      </div>

      {/* Main Content View */}
      {activeTab === 'board' ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Top Instruction & Action Bar */}
          <div
            style={{
              padding: '10px 14px',
              background: 'rgba(255, 87, 34, 0.1)',
              borderBottom: '1px solid rgba(255, 87, 34, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: '11px', color: '#ffab91', fontWeight: 600 }}>
              {selectedEvidenceIds.length === 0 && 'Tap 2 clues below to test a connection.'}
              {selectedEvidenceIds.length === 1 && 'Select 1 more clue to connect.'}
              {selectedEvidenceIds.length === 2 && '2 clues selected. Tap CONNECT!'}
            </span>

            <button
              onClick={handleConnectClues}
              disabled={selectedEvidenceIds.length < 2}
              style={{
                background:
                  selectedEvidenceIds.length === 2
                    ? 'linear-gradient(135deg, #ff5722, #e64a19)'
                    : 'rgba(255, 255, 255, 0.1)',
                border: selectedEvidenceIds.length === 2 ? '1px solid #ffab91' : 'none',
                borderRadius: '8px',
                padding: '6px 14px',
                color: selectedEvidenceIds.length === 2 ? '#ffffff' : '#64748b',
                fontSize: '11px',
                fontWeight: 800,
                cursor: selectedEvidenceIds.length === 2 ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: selectedEvidenceIds.length === 2 ? '0 0 15px rgba(255, 87, 34, 0.5)' : 'none',
              }}
            >
              <Link size={13} />
              <span>CONNECT</span>
            </button>
          </div>

          {/* Feedback Toast */}
          {feedbackMessage && (
            <div
              style={{
                padding: '10px 14px',
                background:
                  feedbackMessage.type === 'success'
                    ? 'rgba(0, 230, 118, 0.15)'
                    : feedbackMessage.type === 'error'
                    ? 'rgba(255, 23, 68, 0.15)'
                    : 'rgba(56, 189, 248, 0.15)',
                borderBottom: `1px solid ${
                  feedbackMessage.type === 'success'
                    ? '#00e676'
                    : feedbackMessage.type === 'error'
                    ? '#ff1744'
                    : '#38bdf8'
                }`,
                fontSize: '11px',
                color:
                  feedbackMessage.type === 'success'
                    ? '#a7f3d0'
                    : feedbackMessage.type === 'error'
                    ? '#fca5a5'
                    : '#bae6fd',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {feedbackMessage.type === 'success' ? (
                <CheckCircle2 size={15} color="#00e676" />
              ) : (
                <AlertCircle size={15} color="#ff1744" />
              )}
              <span>{feedbackMessage.text}</span>
            </div>
          )}

          {/* Evidence Cards List */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            {discoveredItems.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: '#64748b',
                }}
              >
                <ShieldAlert size={36} color="#ff5722" style={{ margin: '0 auto 12px auto' }} />
                <h3 style={{ fontSize: '15px', color: '#e2e8f0', fontWeight: 700 }}>No Clues Discovered Yet</h3>
                <p style={{ fontSize: '12px', marginTop: '6px', lineHeight: '1.4' }}>
                  Open Messages, Photos, Calls, Maps, Notes, and Files to find suspicious inconsistencies and extract evidence!
                </p>
              </div>
            ) : (
              discoveredItems.map((evidence) => {
                const isSelected = selectedEvidenceIds.includes(evidence.id);

                return (
                  <div
                    key={evidence.id}
                    onClick={() => handleToggleSelect(evidence.id)}
                    style={{
                      background: isSelected
                        ? 'linear-gradient(135deg, rgba(255, 87, 34, 0.25), rgba(157, 78, 221, 0.25))'
                        : 'rgba(18, 24, 38, 0.75)',
                      borderRadius: '14px',
                      padding: '12px 14px',
                      border: isSelected
                        ? '2px solid #ff5722'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 0 16px rgba(255, 87, 34, 0.35)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: '9px',
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: 'rgba(255, 255, 255, 0.1)',
                          color: '#38bdf8',
                        }}
                      >
                        {evidence.sourceApp.toUpperCase()} • {evidence.category.toUpperCase()}
                      </span>
                      <span style={{ fontSize: '10px', color: '#94a3b8' }}>{evidence.timestamp}</span>
                    </div>

                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>
                      {evidence.title}
                    </h4>

                    <p style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px', lineHeight: '1.4' }}>
                      {evidence.description}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                      <span style={{ fontSize: '10px', color: '#64748b', fontStyle: 'italic' }}>
                        Source: {evidence.sourceDetail}
                      </span>
                      {isSelected && (
                        <span style={{ fontSize: '10px', fontWeight: 800, color: '#ff7043' }}>
                          SELECTED ✓
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        // Deductions View
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {unlockedDeductions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
              <Zap size={36} color="#9d4edd" style={{ margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '15px', color: '#e2e8f0', fontWeight: 700 }}>No Deductions Synthesized</h3>
              <p style={{ fontSize: '12px', marginTop: '6px' }}>
                Go back to the Evidence Cards tab and pair related clues (e.g. Alex’s home claim + Central Station GPS) to unlock critical deductions.
              </p>
            </div>
          ) : (
            unlockedDeductions.map((ded) => (
              <div
                key={ded.id}
                style={{
                  background: 'linear-gradient(135deg, rgba(157, 78, 221, 0.2), rgba(18, 24, 38, 0.9))',
                  borderRadius: '16px',
                  padding: '14px',
                  border: '1px solid rgba(157, 78, 221, 0.4)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={14} color="#ffd200" />
                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#d8b4fe' }}>
                      {ded.contradictionType?.toUpperCase() || 'DEDUCTION'}
                    </span>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#00e676' }}>+{ded.impactScore} PTS</span>
                </div>

                <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff', marginTop: '6px' }}>
                  {ded.title}
                </h3>

                <p style={{ fontSize: '12px', color: '#e2e8f0', marginTop: '6px', lineHeight: '1.5' }}>
                  {ded.insight}
                </p>

                {ded.unlockedQuestion && (
                  <div
                    style={{
                      marginTop: '8px',
                      padding: '6px 10px',
                      background: 'rgba(255, 87, 34, 0.15)',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: '#ffab91',
                      fontWeight: 600,
                    }}
                  >
                    Investigative Query: {ded.unlockedQuestion}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
