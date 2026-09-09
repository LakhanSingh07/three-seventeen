import React from 'react';
import { ChevronLeft, PhoneIncoming, PhoneOutgoing, PhoneMissed, Voicemail, PlusCircle, Check, FileCheck } from 'lucide-react';
import type { CaseData } from '../cases/types';
import { soundEngine } from '../system/SoundEngine';
import { hapticEngine } from '../system/HapticEngine';

interface PhoneAppProps {
  caseData: CaseData;
  discoveredEvidenceIds: string[];
  onDiscoverEvidence: (evidenceId: string) => void;
  onBackToHome: () => void;
}

export const PhoneApp: React.FC<PhoneAppProps> = ({
  caseData,
  discoveredEvidenceIds,
  onDiscoverEvidence,
  onBackToHome,
}) => {
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleExtractClue = (evidenceId: string) => {
    soundEngine.playEvidenceLogged();
    hapticEngine.clueDiscovered();
    onDiscoverEvidence(evidenceId);
    showToast('✓ Call record logged to Investigation Board');
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
          Recents & Voicemails
        </span>

        <div style={{ width: '28px' }} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        {caseData.calls.map((call) => {
          const char = caseData.characters.find((c) => c.id === call.contactId);
          const isKey = call.timestamp === '03:17 AM';
          const isLogged = call.clueEvidenceId ? discoveredEvidenceIds.includes(call.clueEvidenceId) : false;

          return (
            <div
              key={call.id}
              style={{
                padding: '12px 14px',
                borderRadius: '8px',
                background: isKey ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                border: isKey ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.06)',
                marginBottom: '8px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {call.type === 'missed' ? (
                    <PhoneMissed size={16} color="#ef4444" />
                  ) : call.type === 'incoming' ? (
                    <PhoneIncoming size={16} color="#38bdf8" />
                  ) : (
                    <PhoneOutgoing size={16} color="#22c55e" />
                  )}
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
                    {char ? char.name : 'Unknown Number'}
                  </span>
                </div>

                <span style={{ fontSize: '11px', color: '#94a3b8' }}>{call.timestamp}</span>
              </div>

              {call.hasAudioVoicemail && (
                <div style={{ marginTop: '6px', fontSize: '11.5px', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Voicemail size={13} />
                  <span>Voicemail: {call.voicemailTranscript}</span>
                </div>
              )}

              {call.clueEvidenceId && (
                <div style={{ marginTop: '8px' }}>
                  {isLogged ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#86efac', fontSize: '11px', fontWeight: 600 }}>
                      <FileCheck size={13} />
                      <span>Logged to Investigation Board</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleExtractClue(call.clueEvidenceId!)}
                      style={{
                        background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                        border: '1px solid #38bdf8',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <PlusCircle size={12} />
                      <span>Log Call to Case Board</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
