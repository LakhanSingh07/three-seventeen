import React, { useState } from 'react';
import { X, FileSpreadsheet, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { CaseData, AccusationTheory, CaseSaveState } from '../cases/types';
import { soundEngine } from '../system/SoundEngine';
import { hapticEngine } from '../system/HapticEngine';

interface FinalReportModalProps {
  caseData: CaseData;
  saveState: CaseSaveState;
  onSubmitAccusation: (theory: AccusationTheory) => void;
  onClose: () => void;
}

export const FinalReportModal: React.FC<FinalReportModalProps> = ({
  caseData,
  saveState,
  onSubmitAccusation,
  onClose,
}) => {
  const [suspectId, setSuspectId] = useState<string>('unknown');
  const [locationId, setLocationId] = useState<string>('loc-riverside');
  const [criticalTime, setCriticalTime] = useState<string>('03:17 AM');
  const [keyActionMotive, setKeyActionMotive] = useState<string>('corporate_interception');
  const [selectedEvidenceIds, setSelectedEvidenceIds] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  const toggleEvidence = (id: string) => {
    soundEngine.playTap();
    hapticEngine.light();
    if (selectedEvidenceIds.includes(id)) {
      setSelectedEvidenceIds(selectedEvidenceIds.filter((e) => e !== id));
    } else {
      setSelectedEvidenceIds([...selectedEvidenceIds, id]);
    }
    setValidationError(null);
  };

  const handleFormSubmit = () => {
    if (selectedEvidenceIds.length < 3) {
      soundEngine.playWrongAccusation();
      hapticEngine.heavy();
      setValidationError('You must select at least 3 supporting pieces of evidence to validate this theory in court.');
      return;
    }

    soundEngine.playPaperRustle();
    hapticEngine.medium();
    const theory: AccusationTheory = {
      suspectId,
      locationId,
      criticalTime,
      keyActionMotive,
      supportingEvidenceIds: selectedEvidenceIds,
    };
    onSubmitAccusation(theory);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 160,
        background: 'rgba(4, 6, 12, 0.92)',
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
          maxWidth: '640px',
          maxHeight: '90vh',
          background: 'linear-gradient(145deg, #1e2532 0%, #11151e 100%)',
          borderRadius: '16px',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.95), 0 0 20px rgba(239, 68, 68, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            background: 'linear-gradient(to right, #7f1d1d, #450a0a)',
            borderBottom: '1px solid rgba(239, 68, 68, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileSpreadsheet size={20} color="#fca5a5" />
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#fecaca', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                FINAL THEORY REPORT • CASE 001
              </div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', marginTop: '1px' }}>
                Official Investigative Case Conclusion
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playPaperRustle();
              hapticEngine.light();
              onClose();
            }}
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fecaca',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div
          style={{
            padding: '20px 24px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            color: '#e2e8f0',
            fontSize: '13px',
          }}
        >
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#fca5a5', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
              1. Primary Responsible Party (Who intercepted Sarah?)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
              {caseData.characters.map((c) => {
                const isSelected = suspectId === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      soundEngine.playTap();
                      hapticEngine.light();
                      setSuspectId(c.id);
                    }}
                    style={{
                      background: isSelected ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                      border: isSelected ? '2px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '8px',
                      padding: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <img
                      src={c.avatar}
                      alt={c.name}
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div style={{ fontSize: '11.5px', fontWeight: 700, color: isSelected ? '#fca5a5' : '#ffffff' }}>
                      {c.name}
                    </div>
                    <div style={{ fontSize: '9.5px', color: '#94a3b8' }}>{c.role}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#fca5a5', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>
                2. Key Scene (Where?)
              </label>
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                style={{
                  width: '100%',
                  background: '#090b10',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 600,
                  outline: 'none',
                }}
              >
                <option value="loc-riverside">Riverside Overlook (Last Signal)</option>
                <option value="loc-station">Central Station (Locker 28)</option>
                <option value="loc-bluebird">Bluebird Cafe (4th Ave)</option>
                <option value="loc-apartment">Sarah\'s Apartment</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#fca5a5', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>
                3. Critical Time (When?)
              </label>
              <select
                value={criticalTime}
                onChange={(e) => setCriticalTime(e.target.value)}
                style={{
                  width: '100%',
                  background: '#090b10',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 600,
                  outline: 'none',
                }}
              >
                <option value="03:17 AM">03:17 AM (The Locker Call)</option>
                <option value="02:47 AM">02:47 AM (Station Entry)</option>
                <option value="02:35 AM">02:35 AM (Maya Warning)</option>
                <option value="11:30 PM">11:30 PM (Tech Park Departure)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#fca5a5', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>
              4. Core Motive & Sequence (Why / What happened?)
            </label>
            <select
              value={keyActionMotive}
              onChange={(e) => setKeyActionMotive(e.target.value)}
              style={{
                width: '100%',
                background: '#090b10',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                padding: '10px 12px',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 600,
                outline: 'none',
              }}
            >
              <option value="corporate_interception">
                Corporate Operative Interception to Suppress Project Vanguard Evidence
              </option>
              <option value="alex_stalking">
                Domestic Dispute / Alex Confrontation at Central Station
              </option>
              <option value="ryan_sabotage">
                Ryan System Administrator Server Key Cover-up
              </option>
              <option value="voluntary_disappearance">
                Sarah Orchestrated Voluntary Disappearance with Daniel
              </option>
            </select>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '11px', fontWeight: 800, color: '#fca5a5', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                5. Select Supporting Evidence ({selectedEvidenceIds.length}/3 min)
              </label>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                {saveState.discoveredEvidenceIds.length} Discovered
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '6px',
                maxHeight: '160px',
                overflowY: 'auto',
                padding: '4px',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              {saveState.discoveredEvidenceIds.map((evId) => {
                const ev = caseData.evidenceList.find((e) => e.id === evId);
                if (!ev) return null;
                const isSelected = selectedEvidenceIds.includes(evId);

                return (
                  <button
                    key={evId}
                    onClick={() => toggleEvidence(evId)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '6px',
                      background: isSelected ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      border: isSelected ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '4px',
                        border: isSelected ? '1px solid #ef4444' : '1px solid #64748b',
                        background: isSelected ? '#ef4444' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {isSelected && <CheckCircle2 size={12} color="#ffffff" />}
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: isSelected ? '#ffffff' : '#cbd5e1' }}>
                      {ev.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {validationError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '6px', border: '1px solid #ef4444' }}>
              <AlertTriangle size={16} color="#f87171" />
              <span style={{ fontSize: '11.5px', color: '#fca5a5' }}>{validationError}</span>
            </div>
          )}
        </div>

        <div
          style={{
            padding: '14px 20px',
            background: 'rgba(10, 14, 22, 0.95)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <button
            onClick={() => {
              soundEngine.playPaperRustle();
              onClose();
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleFormSubmit}
            style={{
              background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
              border: '1px solid #f87171',
              color: '#ffffff',
              padding: '9px 20px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '0.5px',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(220, 38, 38, 0.4)',
            }}
          >
            FILE CASE REPORT & ACCUSATION
          </button>
        </div>
      </div>
    </div>
  );
};
