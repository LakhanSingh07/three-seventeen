import React, { useState } from 'react';
import {
  Gavel,
  ArrowRight,
} from 'lucide-react';
import type { CaseData, AccusationTheory } from '../cases/types';
import { soundEngine } from '../system/SoundEngine';
import { hapticEngine } from '../system/HapticEngine';

interface TheoryBuilderProps {
  caseData: CaseData;
  discoveredEvidenceCount: number;
  unlockedDeductionsCount: number;
  onSubmitAccusation: (theory: AccusationTheory) => void;
}

export const TheoryBuilder: React.FC<TheoryBuilderProps> = ({
  caseData,
  discoveredEvidenceCount: _discoveredEvidenceCount,
  unlockedDeductionsCount: _unlockedDeductionsCount,
  onSubmitAccusation,
}) => {
  const [selectedSuspect, setSelectedSuspect] = useState<string>('unknown');
  const [selectedLocation, setSelectedLocation] = useState<string>('loc-riverside');
  const [selectedTime, setSelectedTime] = useState<string>('03:17 AM');
  const [selectedMotive, setSelectedMotive] = useState<string>('corporate_interception');

  const suspects = caseData.characters.filter((c) => c.isSuspect);

  const locations = [
    { id: 'loc-riverside', name: 'Riverside Overlook (Final Cellular Ping)' },
    { id: 'loc-central-station', name: 'Central Station (Locker 28 & Concourse)' },
    { id: 'loc-bluebird-cafe', name: 'Bluebird Café (Surveillance Sedan Spotted)' },
    { id: 'loc-sarah-apt', name: "Sarah's Apartment (Departure at 02:14 AM)" },
  ];

  const times = ['02:47 AM', '02:58 AM', '03:17 AM', '03:24 AM'];

  const motives = [
    {
      id: 'corporate_interception',
      label: 'Corporate Handler Interception (Project Vanguard Whistleblower Suppression)',
    },
    {
      id: 'personal_confrontation',
      label: 'Personal Confrontation & Stalking (Alex Rivera trying to stop the leak)',
    },
    {
      id: 'corporate_sabotage',
      label: 'Internal IT Sabotage (Ryan Vance deleting audit records)',
    },
    {
      id: 'botched_extraction',
      label: 'Failed Private Extraction (Daniel Hayes safehouse rendezvous)',
    },
  ];

  const handleSubmit = () => {
    soundEngine.playTap();
    hapticEngine.heavy();

    const theory: AccusationTheory = {
      suspectId: selectedSuspect,
      locationId: selectedLocation,
      criticalTime: selectedTime,
      keyActionMotive: selectedMotive,
      supportingEvidenceIds: [],
    };

    onSubmitAccusation(theory);
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
        overflowY: 'auto',
        padding: '16px',
      }}
    >
      {/* Title Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(255, 87, 34, 0.2), rgba(157, 78, 221, 0.2))',
          borderRadius: '16px',
          padding: '14px',
          border: '1px solid rgba(255, 87, 34, 0.4)',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Gavel size={18} color="#ff7043" />
          <h2 style={{ fontSize: '16px', fontWeight: 800 }}>Case Theory & Accusation</h2>
        </div>
        <p style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px', lineHeight: '1.4' }}>
          Formulate your final forensic hypothesis based on discovered messages, GPS trail, and Locker 28 deductions.
        </p>
      </div>

      {/* 1. Select Suspect */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '12px', fontWeight: 700, color: '#ffab91', display: 'block', marginBottom: '8px' }}>
          1. WHO IS RESPONSIBLE FOR SARAH'S DISAPPEARANCE?
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {suspects.map((suspect) => {
            const isSelected = selectedSuspect === suspect.id;

            return (
              <div
                key={suspect.id}
                onClick={() => {
                  setSelectedSuspect(suspect.id);
                  soundEngine.playTap();
                  hapticEngine.light();
                }}
                style={{
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(255, 87, 34, 0.3), rgba(18, 24, 38, 0.9))'
                    : 'rgba(18, 24, 38, 0.7)',
                  border: isSelected ? '2px solid #ff5722' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                }}
              >
                <img
                  src={suspect.avatar}
                  alt={suspect.name}
                  style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>{suspect.name}</h4>
                  <p style={{ fontSize: '10px', color: '#94a3b8' }}>{suspect.role}</p>
                </div>
                {isSelected && <span style={{ fontSize: '11px', color: '#ff7043', fontWeight: 800 }}>PRIMARY TARGET ✓</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Select Location */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '12px', fontWeight: 700, color: '#00f2fe', display: 'block', marginBottom: '8px' }}>
          2. WHERE DID THE CRITICAL INTERCEPTION OCCUR?
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {locations.map((loc) => {
            const isSelected = selectedLocation === loc.id;
            return (
              <button
                key={loc.id}
                onClick={() => {
                  setSelectedLocation(loc.id);
                  soundEngine.playTap();
                }}
                style={{
                  background: isSelected ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  border: isSelected ? '1px solid #00f2fe' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  color: isSelected ? '#00f2fe' : '#cbd5e1',
                  fontSize: '12px',
                  fontWeight: 600,
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                {loc.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Select Key Time */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '12px', fontWeight: 700, color: '#ffd200', display: 'block', marginBottom: '8px' }}>
          3. WHAT WAS THE PIVOTAL TIMESTAMP OF THE CRIME?
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          {times.map((t) => {
            const isSelected = selectedTime === t;
            return (
              <button
                key={t}
                onClick={() => {
                  setSelectedTime(t);
                  soundEngine.playTap();
                }}
                style={{
                  background: isSelected ? 'rgba(255, 210, 0, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: isSelected ? '1px solid #ffd200' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '10px',
                  color: isSelected ? '#ffd200' : '#cbd5e1',
                  fontSize: '13px',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Select Motive */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ fontSize: '12px', fontWeight: 700, color: '#a7f3d0', display: 'block', marginBottom: '8px' }}>
          4. WHAT WAS THE TRUE UNDERLYING MOTIVE?
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {motives.map((m) => {
            const isSelected = selectedMotive === m.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  setSelectedMotive(m.id);
                  soundEngine.playTap();
                }}
                style={{
                  background: isSelected ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  border: isSelected ? '1px solid #00e676' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  color: isSelected ? '#a7f3d0' : '#cbd5e1',
                  fontSize: '11px',
                  fontWeight: 600,
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit Accusation Button */}
      <button
        onClick={handleSubmit}
        style={{
          width: '100%',
          background: 'linear-gradient(135deg, #ff5722 0%, #b71c1c 100%)',
          border: 'none',
          borderRadius: '14px',
          padding: '16px',
          color: '#ffffff',
          fontWeight: 800,
          fontSize: '14px',
          letterSpacing: '0.5px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          cursor: 'pointer',
          boxShadow: '0 8px 25px rgba(255, 87, 34, 0.5)',
        }}
      >
        <Gavel size={18} />
        <span>SUBMIT FORMAL ACCUSATION</span>
        <ArrowRight size={16} />
      </button>
    </div>
  );
};
