import React, { useState } from 'react';
import { ChevronLeft, FileCheck, Check, PlusCircle } from 'lucide-react';
import type { CaseData } from '../cases/types';
import { soundEngine } from '../system/SoundEngine';
import { hapticEngine } from '../system/HapticEngine';

interface MessagesAppProps {
  caseData: CaseData;
  discoveredEvidenceIds: string[];
  onDiscoverEvidence: (evidenceId: string) => void;
  onBackToHome: () => void;
  initialThreadId?: string;
}

export const MessagesApp: React.FC<MessagesAppProps> = ({
  caseData,
  discoveredEvidenceIds,
  onDiscoverEvidence,
  onBackToHome,
  initialThreadId = 'thread-alex',
}) => {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(initialThreadId);
  const [inspectingMessage, setInspectingMessage] = useState<{
    id: string;
    senderId: string;
    text?: string;
    timestamp: string;
    clueEvidenceId?: string;
    clueTooltip?: string;
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeThread = caseData.messages.find((t) => t.id === selectedThreadId);
  const activeParticipant = activeThread
    ? caseData.characters.find((c) => c.id === activeThread.participantId)
    : null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleExtractClue = (evidenceId: string) => {
    soundEngine.playEvidenceLogged();
    hapticEngine.clueDiscovered();
    onDiscoverEvidence(evidenceId);
    showToast('✓ Evidence logged to Investigation Board');
    setInspectingMessage(null);
  };

  return (
    <div
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#0a0d14',
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
            boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <Check size={14} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => {
              if (selectedThreadId) {
                setSelectedThreadId(null);
                soundEngine.playTap();
              } else {
                onBackToHome();
              }
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

          {activeParticipant ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img
                src={activeParticipant.avatar}
                alt={activeParticipant.name}
                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
                  {activeParticipant.name}
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                  {activeParticipant.role}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>
              Messages
            </div>
          )}
        </div>
      </div>

      {/* Threads or Active Chat */}
      {!selectedThreadId ? (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {caseData.messages.map((thread) => {
            const char = caseData.characters.find((c) => c.id === thread.participantId);
            const lastMsg = thread.messages[thread.messages.length - 1];
            if (!char || !lastMsg) return null;

            return (
              <div
                key={thread.id}
                onClick={() => {
                  soundEngine.playTap();
                  hapticEngine.light();
                  setSelectedThreadId(thread.id);
                }}
                style={{
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  cursor: 'pointer',
                }}
              >
                <img
                  src={char.avatar}
                  alt={char.name}
                  style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>{char.name}</span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>{lastMsg.timestamp}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {lastMsg.text}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {activeThread?.messages.map((msg) => {
            const isSarah = msg.senderId === 'sarah';
            const isLogged = msg.clueEvidenceId ? discoveredEvidenceIds.includes(msg.clueEvidenceId) : false;

            return (
              <div
                key={msg.id}
                onClick={() => {
                  soundEngine.playTap();
                  setInspectingMessage(msg);
                }}
                style={{
                  alignSelf: isSarah ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  background: isSarah ? '#0284c7' : '#1e293b',
                  color: '#ffffff',
                  padding: '10px 14px',
                  borderRadius: isSarah ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                <div style={{ fontSize: '13px', lineHeight: 1.4 }}>{msg.text}</div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '4px',
                    fontSize: '10px',
                    color: isSarah ? '#bae6fd' : '#94a3b8',
                    marginTop: '4px',
                  }}
                >
                  <span>{msg.timestamp}</span>
                  {isLogged && <FileCheck size={11} color="#86efac" />}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Message Inspection Bottom Sheet */}
      {inspectingMessage && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            zIndex: 90,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}
          onClick={() => setInspectingMessage(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#111827',
              borderRadius: '18px 18px 0 0',
              padding: '20px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
              Message Details • {inspectingMessage.timestamp}
            </div>

            <div style={{ fontSize: '13.5px', color: '#f8fafc', lineHeight: 1.4, background: '#1f2937', padding: '12px', borderRadius: '8px' }}>
              "{inspectingMessage.text}"
            </div>

            {inspectingMessage.clueEvidenceId ? (
              discoveredEvidenceIds.includes(inspectingMessage.clueEvidenceId) ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#86efac', fontSize: '12px', fontWeight: 600 }}>
                  <FileCheck size={16} />
                  <span>Logged to Investigation Board</span>
                </div>
              ) : (
                <button
                  onClick={() => handleExtractClue(inspectingMessage.clueEvidenceId!)}
                  style={{
                    background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                    border: '1px solid #38bdf8',
                    borderRadius: '8px',
                    padding: '10px',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <PlusCircle size={15} />
                  <span>Log to Case Board</span>
                </button>
              )
            ) : (
              <div style={{ fontSize: '11.5px', color: '#64748b', fontStyle: 'italic' }}>
                Standard message record.
              </div>
            )}

            <button
              onClick={() => setInspectingMessage(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                fontSize: '12px',
                padding: '6px',
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
