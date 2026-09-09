import React, { useState } from 'react';
import { ChevronLeft, PlusCircle, FileCheck, Check } from 'lucide-react';
import type { CaseData } from '../cases/types';
import { soundEngine } from '../system/SoundEngine';
import { hapticEngine } from '../system/HapticEngine';

interface NotesAppProps {
  caseData: CaseData;
  discoveredEvidenceIds: string[];
  onDiscoverEvidence: (evidenceId: string) => void;
  onBackToHome: () => void;
}

export const NotesApp: React.FC<NotesAppProps> = ({
  caseData,
  discoveredEvidenceIds,
  onDiscoverEvidence,
  onBackToHome,
}) => {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>('note-1');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleExtractClue = (evidenceId: string) => {
    soundEngine.playEvidenceLogged();
    hapticEngine.clueDiscovered();
    onDiscoverEvidence(evidenceId);
    showToast('✓ Note logged to Investigation Board');
  };

  const activeNote = caseData.notes.find((n) => n.id === selectedNoteId);

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
            if (selectedNoteId) {
              setSelectedNoteId(null);
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

        <span style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
          {activeNote ? activeNote.title : 'Notes'}
        </span>

        <div style={{ width: '28px' }} />
      </div>

      {!selectedNoteId ? (
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {caseData.notes.map((note) => (
            <div
              key={note.id}
              onClick={() => {
                soundEngine.playTap();
                setSelectedNoteId(note.id);
              }}
              style={{
                padding: '14px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                marginBottom: '8px',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>{note.title}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{note.date}</div>
            </div>
          ))}
        </div>
      ) : activeNote ? (
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '17px', fontWeight: 800, color: '#ffffff' }}>{activeNote.title}</div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Last modified: {activeNote.date}</div>
          </div>

          <div
            style={{
              background: '#1e293b',
              padding: '16px',
              borderRadius: '10px',
              color: '#f8fafc',
              fontSize: '13px',
              lineHeight: 1.6,
              whiteSpace: 'pre-line',
            }}
          >
            {activeNote.content}
          </div>

          {activeNote.clueEvidenceId && (
            <div>
              {discoveredEvidenceIds.includes(activeNote.clueEvidenceId) ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#86efac', fontSize: '12px', fontWeight: 600 }}>
                  <FileCheck size={16} />
                  <span>Logged to Investigation Board</span>
                </div>
              ) : (
                <button
                  onClick={() => handleExtractClue(activeNote.clueEvidenceId!)}
                  style={{
                    background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                    border: '1px solid #38bdf8',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <PlusCircle size={15} />
                  <span>Log Note to Case Board</span>
                </button>
              )}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
