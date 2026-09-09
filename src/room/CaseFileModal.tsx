import React from 'react';
import { X, Folder, AlertCircle, FileText } from 'lucide-react';
import type { CaseData } from '../cases/types';
import { soundEngine } from '../system/SoundEngine';
import { hapticEngine } from '../system/HapticEngine';

interface CaseFileModalProps {
  caseData: CaseData;
  onClose: () => void;
  onOpenPhone: () => void;
}

export const CaseFileModal: React.FC<CaseFileModalProps> = ({
  caseData,
  onClose,
  onOpenPhone,
}) => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 150,
        background: 'rgba(4, 6, 12, 0.88)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.25s ease',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          background: 'linear-gradient(145deg, #2b2318 0%, #1c1711 100%)',
          borderRadius: '16px',
          border: '1px solid rgba(217, 119, 6, 0.3)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Dossier Header Tab */}
        <div
          style={{
            padding: '16px 20px',
            background: 'linear-gradient(to right, #78350f, #451a03)',
            borderBottom: '1px solid rgba(245, 158, 11, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Folder size={20} color="#fbbf24" />
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#fef3c7', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                CONFIDENTIAL DOSSIER • CASE 001
              </div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', marginTop: '1px' }}>
                {caseData.victimName} — MISSING PERSON
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
              color: '#fef3c7',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Dossier Body */}
        <div
          style={{
            padding: '24px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            color: '#e2e8f0',
            fontSize: '13px',
            lineHeight: 1.6,
          }}
        >
          {/* Top Profile Card */}
          <div
            style={{
              display: 'flex',
              gap: '18px',
              background: 'rgba(0, 0, 0, 0.35)',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {/* Pinned Portrait Photo */}
            <div
              style={{
                width: '100px',
                height: '110px',
                background: '#ffffff',
                padding: '6px 6px 18px 6px',
                borderRadius: '4px',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.6)',
                transform: 'rotate(-2deg)',
                flexShrink: 0,
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-6px',
                  left: '42px',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: '#ef4444',
                  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.5)',
                  border: '1px solid #7f1d1d',
                }}
              />
              <img
                src={caseData.characters[0]?.avatar || '/assets/characters/sarah_profile.webp'}
                alt={caseData.victimName}
                style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '2px' }}
              />
              <div style={{ textAlign: 'center', fontSize: '9px', fontWeight: 800, color: '#1e293b', marginTop: '2px' }}>
                SARAH MEHTA
              </div>
            </div>

            {/* Metadata Fields */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Subject:</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', marginLeft: '6px' }}>Sarah Mehta</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Age / Status:</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#ef4444', marginLeft: '6px' }}>22 • Missing</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Occupation:</span>
                <span style={{ fontSize: '13px', color: '#cbd5e1', marginLeft: '6px' }}>Junior Analyst (Ardent Corp)</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Last Signal:</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#f59e0b', marginLeft: '6px' }}>03:17 AM (Sep 9)</span>
              </div>
            </div>
          </div>

          {/* Incident Summary (Minimal Facts, No Spoilers) */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '16px',
              borderRadius: '10px',
              borderLeft: '3px solid #f59e0b',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>
              Incident Summary
            </div>
            <p style={{ color: '#cbd5e1', margin: 0 }}>
              On September 9th, Sarah Mehta failed to report to work and could not be contacted at her apartment. A civilian later located her personal smartphone on the roadside near the northern district. The phone was sealed and transferred into evidence.
            </p>
          </div>

          {/* Recovered Evidence Notice */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              padding: '14px 16px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText size={18} color="#38bdf8" />
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff' }}>Primary Physical Evidence</div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Sarah\'s Personal NOVA Smartphone (Locked)</div>
              </div>
            </div>

            <button
              onClick={() => {
                soundEngine.playTap();
                hapticEngine.medium();
                onClose();
                onOpenPhone();
              }}
              style={{
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                border: '1px solid #60a5fa',
                color: '#ffffff',
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Inspect Phone
            </button>
          </div>

          {/* Investigator Directive */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 14px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <AlertCircle size={16} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '11px', color: '#fca5a5' }}>
              <strong>Investigative Objective:</strong> Extract digital footprints from the phone, connect them on the Evidence Board with physical leads, and determine what transpired at 3:17 AM.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 20px',
            background: 'rgba(0, 0, 0, 0.4)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
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
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#cbd5e1',
              padding: '8px 18px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
