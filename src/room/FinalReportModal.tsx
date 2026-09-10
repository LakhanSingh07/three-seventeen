import React, { useState } from 'react';
import type { CaseData, AccusationTheory, CaseSaveState } from '../cases/types';
import { soundEngine } from '../system/SoundEngine';
import { hapticEngine } from '../system/HapticEngine';
import { environmentAssets } from '../scene/assetRegistry';

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
      setValidationError('You must attach at least 3 supporting pieces of evidence to validate this charge.');
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
        background: 'rgba(5, 4, 3, 0.88)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.22s ease-out',
        userSelect: 'none',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="paper-sheet dossier-sheet"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '92vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          padding: '24px 22px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9)',
          backgroundImage: `url(${environmentAssets.clutter.paperSingle.real})`,
        }}
      >
        {/* Header: Official Police / Investigation Docket */}
        <header style={{ borderBottom: '1px solid rgba(136, 118, 89, 0.45)', paddingBottom: '12px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <small style={{ font: '9px/1.4 monospace', letterSpacing: '1.5px', color: '#68543d', display: 'block' }}>
                CASE {caseData.caseNumber} · SPECIAL INVESTIGATION BRANCH
              </small>
              <h1 style={{ font: '24px/1.15 Georgia, serif', color: '#271b10', margin: '4px 0 2px' }}>
                Official Charge Docket
              </h1>
              <p style={{ font: 'italic 12px Georgia, serif', color: '#54412c', margin: 0 }}>
                In re: Disappearance of {caseData.victimName}, Age {caseData.victimAge}
              </p>
            </div>
            <span
              style={{
                font: '10px/1 monospace',
                letterSpacing: '1px',
                color: '#8b1e16',
                border: '1.5px solid #8b1e16',
                padding: '3px 8px',
                transform: 'rotate(-4deg)',
                fontWeight: 'bold',
                flexShrink: 0,
              }}
            >
              INDICTMENT
            </span>
          </div>
        </header>

        {/* Form Body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px', color: '#3b2b1b' }}>
          {/* Section 1: Primary Suspect */}
          <div>
            <label style={{ display: 'block', font: 'bold 10.5px/1 monospace', letterSpacing: '1px', color: '#7a5a3a', textTransform: 'uppercase', marginBottom: '8px' }}>
              1. Principal Accused / Responsible Party
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '8px' }}>
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
                      background: isSelected ? '#322214' : 'rgba(160, 138, 102, 0.12)',
                      border: isSelected ? '1.5px solid #8b1e16' : '1px solid rgba(136, 118, 89, 0.35)',
                      borderRadius: '2px',
                      padding: '8px 6px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      boxShadow: isSelected ? '0 3px 8px rgba(0,0,0,0.4)' : 'none',
                    }}
                  >
                    <img
                      src={c.avatar}
                      alt={c.name}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '2px',
                        objectFit: 'cover',
                        filter: isSelected ? 'none' : 'grayscale(0.35) sepia(0.2)',
                      }}
                    />
                    <div style={{ font: 'bold 11px Georgia, serif', color: isSelected ? '#f5eedb' : '#322315' }}>
                      {c.name}
                    </div>
                    <div style={{ font: '9px monospace', color: isSelected ? '#c4b59b' : '#705b42' }}>
                      {c.role}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2 & 3: Location & Time */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', font: 'bold 10px/1 monospace', letterSpacing: '1px', color: '#7a5a3a', textTransform: 'uppercase', marginBottom: '5px' }}>
                2. Key Scene / Crime Site
              </label>
              <select
                value={locationId}
                onChange={(e) => {
                  soundEngine.playTap();
                  setLocationId(e.target.value);
                }}
                style={{
                  width: '100%',
                  background: '#eae0c8',
                  border: '1px solid #9c8a6f',
                  borderRadius: '2px',
                  padding: '7px 8px',
                  color: '#2a1d12',
                  font: '11px Georgia, serif',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="loc-riverside">Riverside Overlook (Last Signal)</option>
                <option value="loc-station">Central Station (Locker 28)</option>
                <option value="loc-bluebird">Bluebird Cafe (4th Ave)</option>
                <option value="loc-apartment">Sarah's Apartment</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', font: 'bold 10px/1 monospace', letterSpacing: '1px', color: '#7a5a3a', textTransform: 'uppercase', marginBottom: '5px' }}>
                3. Critical Event Timestamp
              </label>
              <select
                value={criticalTime}
                onChange={(e) => {
                  soundEngine.playTap();
                  setCriticalTime(e.target.value);
                }}
                style={{
                  width: '100%',
                  background: '#eae0c8',
                  border: '1px solid #9c8a6f',
                  borderRadius: '2px',
                  padding: '7px 8px',
                  color: '#2a1d12',
                  font: '11px Georgia, serif',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="03:17 AM">03:17 AM (The Locker Call)</option>
                <option value="02:47 AM">02:47 AM (Station Entry)</option>
                <option value="02:35 AM">02:35 AM (Maya Warning)</option>
                <option value="11:30 PM">11:30 PM (Tech Park Departure)</option>
              </select>
            </div>
          </div>

          {/* Section 4: Motive & Modus Operandi */}
          <div>
            <label style={{ display: 'block', font: 'bold 10px/1 monospace', letterSpacing: '1px', color: '#7a5a3a', textTransform: 'uppercase', marginBottom: '5px' }}>
              4. Motive & Theory of the Crime
            </label>
            <select
              value={keyActionMotive}
              onChange={(e) => {
                soundEngine.playTap();
                setKeyActionMotive(e.target.value);
              }}
              style={{
                width: '100%',
                background: '#eae0c8',
                border: '1px solid #9c8a6f',
                borderRadius: '2px',
                padding: '7px 8px',
                color: '#2a1d12',
                font: '11px Georgia, serif',
                outline: 'none',
                cursor: 'pointer',
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

          {/* Section 5: Evidence Exhibits Checklist */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ font: 'bold 10px/1 monospace', letterSpacing: '1px', color: '#7a5a3a', textTransform: 'uppercase' }}>
                5. Attached Physical Exhibits ({selectedEvidenceIds.length}/3 min)
              </label>
              <span style={{ font: '9px monospace', color: '#887358' }}>
                {saveState.discoveredEvidenceIds.length} logged to file
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '5px',
                maxHeight: '140px',
                overflowY: 'auto',
                padding: '4px',
                background: 'rgba(160, 138, 102, 0.12)',
                border: '1px solid rgba(136, 118, 89, 0.35)',
                borderRadius: '2px',
              }}
            >
              {saveState.discoveredEvidenceIds.map((evId) => {
                const ev = caseData.evidenceList.find((e) => e.id === evId);
                if (!ev) return null;
                const isSelected = selectedEvidenceIds.includes(evId);

                return (
                  <button
                    key={evId}
                    type="button"
                    onClick={() => toggleEvidence(evId)}
                    style={{
                      padding: '6px 10px',
                      background: isSelected ? '#dfcfab' : 'transparent',
                      border: isSelected ? '1px solid #7c5c37' : '1px solid transparent',
                      borderRadius: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span
                      style={{
                        width: '14px',
                        height: '14px',
                        border: '1px solid #6b533b',
                        background: isSelected ? '#8b1e16' : '#f5eedb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#f5eedb',
                        fontSize: '9px',
                        fontWeight: 'bold',
                        flexShrink: 0,
                      }}
                    >
                      {isSelected ? '✓' : ''}
                    </span>
                    <span style={{ font: '11px Georgia, serif', color: '#302214' }}>
                      {ev.title} <small style={{ font: '9px monospace', color: '#725e46' }}>({ev.sourceApp})</small>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Validation Error Message */}
          {validationError && (
            <div
              style={{
                padding: '8px 10px',
                background: '#f8d7da',
                border: '1px solid #f5c6cb',
                color: '#721c24',
                font: 'italic 12px Georgia, serif',
                borderRadius: '2px',
              }}
            >
              {validationError}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <footer
          style={{
            borderTop: '1px solid rgba(136, 118, 89, 0.45)',
            paddingTop: '14px',
            marginTop: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <button
            className="paper-action"
            onClick={() => {
              soundEngine.playPaperRustle();
              onClose();
            }}
          >
            ‹ Return to desk
          </button>

          <button
            className="report-stamp"
            onClick={handleFormSubmit}
            style={{ margin: 0 }}
          >
            FILE CHARGES WITH DISTRICT ATTORNEY ↗
          </button>
        </footer>
      </div>
    </div>
  );
};
