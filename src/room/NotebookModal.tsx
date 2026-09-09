import React, { useState } from 'react';
import { X, BookOpen, HelpCircle, CheckCircle2, Lightbulb, KeyRound } from 'lucide-react';
import type { CaseData, CaseSaveState } from '../cases/types';
import { soundEngine } from '../system/SoundEngine';
import { hapticEngine } from '../system/HapticEngine';

interface NotebookModalProps {
  caseData: CaseData;
  saveState: CaseSaveState;
  onClose: () => void;
}

export const NotebookModal: React.FC<NotebookModalProps> = ({
  caseData,
  saveState,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'questions' | 'confirmed' | 'leads' | 'codes'>('questions');

  // Dynamic Questions based on deductions and discovered evidence
  const questions = [
    {
      id: 'q-alex-alibi',
      text: 'Why did Alex lie about being asleep at home?',
      isResolved: saveState.unlockedDeductionIds.includes('DED_ALEX_ALIBI'),
      resolution: 'Alex traveled to Central Station to intercept Sarah regarding the corporate files.',
    },
    {
      id: 'q-locker-28',
      text: 'What is Locker 28 and code 8-3-1-7?',
      isResolved: saveState.unlockedDeductionIds.includes('DED_LOCKER_OPERATION'),
      resolution: 'Sarah secured the master whistleblowing archive in Locker 28 before fleeing.',
    },
    {
      id: 'q-317-call',
      text: 'Who connected the 42-second call at 3:17 AM?',
      isResolved: saveState.unlockedDeductionIds.includes('DED_THE_BLACKMAIL_THREAT'),
      resolution: 'An unknown corporate operative tracked Sarah and issued an extortion demand.',
    },
    {
      id: 'q-riverside',
      text: 'What happened between 3:17 AM and 3:24 AM at Riverside?',
      isResolved: saveState.unlockedDeductionIds.includes('DED_THE_RIVERSIDE_PURSUIT'),
      resolution: 'Sarah fled toward Daniel\'s vehicle but was intercepted near Riverside Pier.',
    },
    {
      id: 'q-who-is-unknown',
      text: 'What was the motive behind Sarah\'s disappearance?',
      isResolved: saveState.unlockedDeductionIds.length >= 4,
      resolution: 'Suppression of the Project Vanguard falsification audit evidence.',
    },
  ];

  // Confirmed Facts based on evidence discovered
  const confirmedFacts: string[] = [];
  if (saveState.discoveredEvidenceIds.includes('EVD_MSG_ALEX_HOME') && saveState.discoveredEvidenceIds.includes('EVD_MAP_ALEX_STATION')) {
    confirmedFacts.push('Alex was physically present at Central Station concourse at 02:47 AM.');
  }
  if (saveState.discoveredEvidenceIds.includes('EVD_NOTE_LOCKER28')) {
    confirmedFacts.push('Locker #28 at Central Station contains an encrypted drive with passcode 8-3-1-7.');
  }
  if (saveState.discoveredEvidenceIds.includes('EVD_CALL_317')) {
    confirmedFacts.push('An incoming call from +1 (555) 000-3170 connected for 42 seconds at exactly 03:17 AM.');
  }
  if (saveState.discoveredEvidenceIds.includes('EVD_VOICE_MEMO_317')) {
    confirmedFacts.push('A black surveillance sedan pursued Sarah\'s vehicle northward from 42nd Street.');
  }
  if (saveState.discoveredEvidenceIds.includes('EVD_MAP_RIVERSIDE_PING')) {
    confirmedFacts.push('Final cellular telemetry transmission occurred at Riverside Overlook at 03:24 AM.');
  }

  // Discovered codes
  const discoveredCodes: Array<{ label: string; code: string; source: string }> = [];
  if (saveState.discoveredEvidenceIds.includes('EVD_NOTE_LOCKER28') || saveState.discoveredEvidenceIds.includes('EVD_PHOTO_LOCKER_CODE')) {
    discoveredCodes.push({ label: 'Station Locker #28 Access Code', code: '8 - 3 - 1 - 7', source: 'Sarah\'s Notes / Photo Memo' });
  }
  if (saveState.discoveredEvidenceIds.includes('EVD_CALL_317') || saveState.discoveredEvidenceIds.includes('EVD_MSG_UNKNOWN_EXTORTION')) {
    discoveredCodes.push({ label: 'Unregistered Number', code: '+1 (555) 000-3170', source: 'Call Telemetry / Messages' });
  }

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
          maxWidth: '580px',
          maxHeight: '88vh',
          background: '#fefce8',
          borderRadius: '12px',
          border: '2px solid #ca8a04',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 10px 10px 0 rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Spiral Binding Header Simulation */}
        <div
          style={{
            height: '24px',
            background: '#422006',
            borderBottom: '2px solid #713f12',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '0 20px',
          }}
        >
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: '8px',
                height: '14px',
                borderRadius: '4px',
                background: 'linear-gradient(to bottom, #d4d4d8, #71717a)',
                border: '1px solid #3f3f46',
              }}
            />
          ))}
        </div>

        {/* Notebook Top Bar */}
        <div
          style={{
            padding: '12px 18px',
            background: '#fef08a',
            borderBottom: '1px solid #facc15',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={18} color="#854d0e" />
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#713f12', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Investigator\'s Field Notebook
            </span>
          </div>

          <button
            onClick={() => {
              soundEngine.playPaperRustle();
              hapticEngine.light();
              onClose();
            }}
            style={{
              background: 'rgba(0, 0, 0, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#713f12',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Notebook Tabs */}
        <div
          style={{
            display: 'flex',
            background: '#fef9c3',
            borderBottom: '2px solid #eab308',
            padding: '0 12px',
            gap: '4px',
          }}
        >
          {[
            { id: 'questions', label: 'Questions', icon: <HelpCircle size={13} /> },
            { id: 'confirmed', label: 'Confirmed Facts', icon: <CheckCircle2 size={13} /> },
            { id: 'leads', label: 'Leads & Intel', icon: <Lightbulb size={13} /> },
            { id: 'codes', label: 'Codes & Notes', icon: <KeyRound size={13} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                soundEngine.playPaperRustle();
                hapticEngine.light();
                setActiveTab(tab.id as typeof activeTab);
              }}
              style={{
                padding: '8px 12px',
                border: 'none',
                borderBottom: activeTab === tab.id ? '3px solid #854d0e' : '3px solid transparent',
                background: activeTab === tab.id ? '#fefce8' : 'transparent',
                color: activeTab === tab.id ? '#713f12' : '#a16207',
                fontSize: '11px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Lined Notebook Paper Content */}
        <div
          style={{
            flex: 1,
            padding: '20px 24px',
            overflowY: 'auto',
            background: 'repeating-linear-gradient(#fefce8, #fefce8 27px, #e2e8f0 28px)',
            color: '#1e293b',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '13px',
            lineHeight: '28px',
          }}
        >
          {/* TAB 1: QUESTIONS */}
          {activeTab === 'questions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#854d0e', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Open Investigative Questions
              </div>
              {questions.map((q) => (
                <div
                  key={q.id}
                  style={{
                    background: q.isResolved ? 'rgba(34, 197, 94, 0.12)' : 'rgba(255, 255, 255, 0.7)',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: q.isResolved ? '1px solid #86efac' : '1px solid #cbd5e1',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    {q.isResolved ? (
                      <CheckCircle2 size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: '5px' }} />
                    ) : (
                      <HelpCircle size={16} color="#ca8a04" style={{ flexShrink: 0, marginTop: '5px' }} />
                    )}
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          color: q.isResolved ? '#166534' : '#1e293b',
                          textDecoration: q.isResolved ? 'line-through' : 'none',
                        }}
                      >
                        {q.text}
                      </div>
                      {q.isResolved && (
                        <div style={{ fontSize: '12px', color: '#15803d', marginTop: '2px', fontWeight: 500 }}>
                          ✓ Resolved: {q.resolution}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: CONFIRMED FACTS */}
          {activeTab === 'confirmed' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#854d0e', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Solid Facts Proved Through Evidence ({confirmedFacts.length})
              </div>
              {confirmedFacts.length === 0 ? (
                <div style={{ color: '#64748b', fontStyle: 'italic', padding: '10px 0' }}>
                  No facts confirmed yet. Extract messages, calls, and location records from Sarah\'s phone to establish facts.
                </div>
              ) : (
                confirmedFacts.map((fact, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(255, 255, 255, 0.8)',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      borderLeft: '4px solid #16a34a',
                      fontSize: '12.5px',
                      color: '#0f172a',
                      fontWeight: 500,
                    }}
                  >
                    • {fact}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: LEADS & INTEL */}
          {activeTab === 'leads' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#854d0e', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Investigator Guidance & Leads
              </div>
              {caseData.hints.map((hint) => {
                const isUnlocked = saveState.usedHintIds.includes(hint.id);
                return (
                  <div
                    key={hint.id}
                    style={{
                      background: isUnlocked ? 'rgba(254, 240, 138, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontWeight: 700, color: '#713f12', fontSize: '12.5px' }}>
                        Lead {hint.tier}: {hint.title}
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#334155', marginTop: '4px' }}>
                      {hint.text}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 4: CODES & NOTES */}
          {activeTab === 'codes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#854d0e', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Extracted Passcodes & Numerical Data
              </div>
              {discoveredCodes.length === 0 ? (
                <div style={{ color: '#64748b', fontStyle: 'italic', padding: '10px 0' }}>
                  No codes logged yet. Inspect Sarah\'s Notes app or Photos for lock codes.
                </div>
              ) : (
                discoveredCodes.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'rgba(255, 255, 255, 0.85)',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                    }}
                  >
                    <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>{c.label}</div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#b45309', fontFamily: 'monospace', letterSpacing: '2px', margin: '4px 0' }}>
                      {c.code}
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>Source: {c.source}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Notebook Footer */}
        <div
          style={{
            padding: '10px 18px',
            background: '#fef9c3',
            borderTop: '1px solid #facc15',
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
              background: '#854d0e',
              border: 'none',
              color: '#ffffff',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Close Notebook
          </button>
        </div>
      </div>
    </div>
  );
};
