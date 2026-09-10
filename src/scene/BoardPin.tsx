import React from 'react';
import type { EvidenceItem, CaseData } from '../cases/types';
import { environmentAssets } from './assetRegistry';
import { ProductionArt } from './ProductionArt';

interface Props {
  evidence: EvidenceItem;
  caseData: CaseData;
  xPct: number;
  yPx: number;
  rotationDeg: number;
  isSelected: boolean;
  onTap: (id: string) => void;
  registerAnchor: (id: string, el: HTMLElement | null) => void;
}

export const BoardPin: React.FC<Props> = ({
  evidence,
  caseData,
  xPct,
  yPx,
  rotationDeg,
  isSelected,
  onTap,
  registerAnchor,
}) => {
  const photo = caseData.photos.find((p) => p.clueEvidenceId === evidence.id);
  const asset = photo
    ? environmentAssets.board_pin_frames.polaroid
    : evidence.category === 'Document'
    ? environmentAssets.board_pin_frames.printout
    : evidence.category === 'Timeline'
    ? environmentAssets.board_pin_frames.stickyNote
    : environmentAssets.board_pin_frames.indexCard;

  return (
    <button
      type="button"
      className={`board-pin ${photo ? 'photo-pin' : 'text-pin'}`}
      ref={(el) => registerAnchor(evidence.id, el)}
      aria-label={`${evidence.title} — ${evidence.category} evidence`}
      aria-pressed={isSelected}
      onClick={() => onTap(evidence.id)}
      style={{
        left: `${xPct}%`,
        top: `${yPx}px`,
        transform: `rotate(${rotationDeg}deg) scale(${isSelected ? 1.04 : 1})`,
        zIndex: isSelected ? 15 : 4,
      }}
    >
      {/* Background paper / polaroid / index card frame */}
      <ProductionArt asset={asset} />

      {/* Actual photo if photo evidence */}
      {photo && <img className="evidence-photo" src={photo.fullImage} alt={evidence.title} />}

      {/* Clue details stamped onto paper */}
      <span className="evidence-ink">
        {evidence.id === 'EVD_VOICE_MEMO_SAR_VM_001' ? (
          <>
            <small className="evidence-meta">
              AUDIO RECORDING · SAR-VM-001 · {evidence.timestamp}
            </small>
            <strong className="evidence-heading">NOTE TO SELF</strong>
            <span className="evidence-detail" style={{ fontStyle: 'italic', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <span>"Talk to Ryan tomorrow about those numbers..."</span>
              <span style={{ fontSize: '9px', opacity: 0.7, letterSpacing: '1px' }}>∿∿∿ AUDIO TRANSCRIPT SLIP ∿∿∿</span>
            </span>
          </>
        ) : evidence.id === 'EVD_VOICE_MEMO_SAR_VM_002' ? (
          <>
            <small className="evidence-meta">
              AUDIO EXTRACTION · SAR-VM-002 · {evidence.timestamp}
            </small>
            <strong className="evidence-heading">NUMBERS DON'T MATCH</strong>
            <span className="evidence-detail" style={{ fontStyle: 'italic', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <span>"They don't match what Ryan showed me yesterday."</span>
              <span>"...entries here that shouldn't exist."</span>
              <span style={{ fontSize: '9px', opacity: 0.7, letterSpacing: '1px' }}>∿∿∿ AUDIO EXTRACTION SLIP ∿∿∿</span>
            </span>
          </>
        ) : evidence.id === 'EVD_VOICE_MEMO_SAR_VM_003' ? (
          <>
            <small className="evidence-meta">
              AUDIO EXTRACTION · SAR-VM-003 · {evidence.timestamp}
            </small>
            <strong className="evidence-heading">SOMEONE CHANGED IT</strong>
            <span className="evidence-detail" style={{ fontStyle: 'italic', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <span>"Not corrected. Gone."</span>
              <span>"Someone used my account."</span>
              <span style={{ fontSize: '9px', opacity: 0.7, letterSpacing: '1px' }}>∿∿∿ AUDIO EXTRACTION SLIP ∿∿∿</span>
            </span>
          </>
        ) : evidence.id === 'EVD_VOICE_MEMO_SAR_VM_004' ? (
          <>
            <small className="evidence-meta">
              AUDIO EXTRACTION · SAR-VM-004 · {evidence.timestamp}
            </small>
            <strong className="evidence-heading">MOVED THE COPY</strong>
            <span className="evidence-detail" style={{ fontStyle: 'italic', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <span>"I moved the copy."</span>
              <span>"...I'm not keeping it here."</span>
              <span style={{ fontSize: '9px', opacity: 0.7, letterSpacing: '1px' }}>∿∿∿ AUDIO EXTRACTION SLIP ∿∿∿</span>
            </span>
          </>
        ) : evidence.id === 'EVD_VOICE_MEMO_SAR_VM_005' ? (
          <>
            <small className="evidence-meta">
              AUDIO EXTRACTION · SAR-VM-005 · {evidence.timestamp}
            </small>
            <strong className="evidence-heading">I WAS FOLLOWED</strong>
            <span className="evidence-detail" style={{ fontStyle: 'italic', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <span>"I noticed the same car twice."</span>
              <span>"...outside the café... and near the station."</span>
              <span style={{ fontSize: '9px', opacity: 0.7, letterSpacing: '1px' }}>∿∿∿ AUDIO EXTRACTION SLIP ∿∿∿</span>
            </span>
          </>
        ) : evidence.id === 'EVD_CALL_317' ? (
          <>
            <small className="evidence-meta" style={{ color: '#b91c1c', fontWeight: 700 }}>
              TELECOM FORENSICS · CALL-0317-001 · 03:17 AM
            </small>
            <strong className="evidence-heading" style={{ fontWeight: 700, letterSpacing: '-0.2px' }}>
              UNKNOWN CALLER · RECOVERED AUDIO
            </strong>
            <span className="evidence-detail" style={{ fontStyle: 'italic', display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '10px' }}>
              <span>"Locker twenty-eight. You opened it."</span>
              <span>"Who else knew you were coming?"</span>
              <span style={{ color: '#451a03', fontWeight: 600 }}>SARAH: "...Alex?"</span>
              <span style={{ fontSize: '8.5px', opacity: 0.8, letterSpacing: '0.8px', fontStyle: 'normal' }}>
                ∿∿∿ CARRIER AUDIO INTERCEPT [0:41] ∿∿∿
              </span>
            </span>
          </>
        ) : evidence.id === 'EVD_CALL_MAYA_230' ? (
          <>
            <small className="evidence-meta">
              VOICEMAIL EXTRACTION · MAYA-VM-001 · {evidence.timestamp}
            </small>
            <strong className="evidence-heading">MAYA · UNANSWERED VOICEMAIL</strong>
            <span className="evidence-detail" style={{ fontStyle: 'italic', display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '10px' }}>
              <span>"You said you'd call me back..."</span>
              <span>"...now you're not answering."</span>
              <span>"Just text me. Anything."</span>
              <span style={{ fontSize: '8.5px', opacity: 0.75, letterSpacing: '0.8px', fontStyle: 'normal' }}>
                ∿∿∿ VOICEMAIL AUDIO LOG [0:17] ∿∿∿
              </span>
            </span>
          </>
        ) : evidence.id === 'EVID-REC-STATION-001' ? (
          <>
            <small className="evidence-meta" style={{ color: '#0369a1', fontWeight: 700 }}>
              FORENSIC AUDIO EXTRACTION · REC_0317_01 · 17.4s
            </small>
            <strong className="evidence-heading" style={{ fontWeight: 700, letterSpacing: '-0.2px' }}>
              RECOVERED STATION RECORDING
            </strong>
            <span className="evidence-detail" style={{ fontStyle: 'italic', display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '9.5px' }}>
              <span>SARAH: "Twenty-eight..."</span>
              <span>[METALLIC SOUND]</span>
              <span>[ADDITIONAL FOOTSTEPS]</span>
              <span style={{ color: '#0369a1', fontWeight: 600 }}>SARAH: "Hello?"</span>
              <span style={{ fontSize: '8px', opacity: 0.8, letterSpacing: '0.8px', fontStyle: 'normal' }}>
                ∿∿∿ BUFFER RECONSTRUCTION [0:17] ∿∿∿
              </span>
            </span>
          </>
        ) : evidence.id === 'EVID-RYAN-VM-001' ? (
          <>
            <small className="evidence-meta" style={{ color: '#d97706', fontWeight: 700 }}>
              VOICEMAIL EXTRACTION · RYAN-VM-001 · {evidence.timestamp}
            </small>
            <strong className="evidence-heading" style={{ fontWeight: 700, letterSpacing: '-0.2px' }}>
              RYAN · VOICEMAIL WARNING
            </strong>
            <span className="evidence-detail" style={{ fontStyle: 'italic', display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '10px' }}>
              <span style={{ fontWeight: 600, fontStyle: 'normal', color: '#78350f', fontSize: '9.5px' }}>RYAN:</span>
              <span>"Don't send me anything on Teams or email..."</span>
              <span>"...don't open the audit folder again."</span>
              <span>"Seriously."</span>
              <span style={{ fontSize: '8.5px', opacity: 0.75, letterSpacing: '0.8px', fontStyle: 'normal' }}>
                ∿∿∿ VOICEMAIL AUDIO LOG [0:17] ∿∿∿
              </span>
            </span>
          </>
        ) : evidence.id === 'EVID-DANIEL-INT-001' ? (
          <>
            <small className="evidence-meta" style={{ color: '#047857', fontWeight: 700 }}>
              SECURITY AUDIO EXTRACTION · DANIEL-INT-001 · {evidence.timestamp}
            </small>
            <strong className="evidence-heading" style={{ fontWeight: 700, letterSpacing: '-0.2px' }}>
              ARDENT CORP · INTERCOM ARCHIVE
            </strong>
            <span className="evidence-detail" style={{ fontStyle: 'italic', display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '9.5px' }}>
              <span style={{ fontWeight: 600, fontStyle: 'normal', color: '#065f46', fontSize: '9px' }}>DANIEL (FLOOR 14):</span>
              <span>"Don't use your access card again."</span>
              <span>"The system's logging everything tonight."</span>
              <span>"Take the service stairs."</span>
              <span style={{ fontSize: '8px', opacity: 0.8, letterSpacing: '0.8px', fontStyle: 'normal' }}>
                ∿∿∿ SECURITY INTERCOM ARCHIVE [0:15] ∿∿∿
              </span>
            </span>
          </>
        ) : evidence.id === 'EVID-CCTV-ARDENT-001' ? (
          <div
            style={{
              position: 'absolute',
              inset: '-10px -8px -6px -8px',
              background: '#e2e8f0',
              backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
              backgroundSize: '8px 8px',
              border: '1px solid #94a3b8',
              borderRadius: '3px',
              padding: '6px 7px',
              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.25)',
              display: 'flex',
              flexDirection: 'column',
              fontFamily: 'monospace',
              color: '#0f172a',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #94a3b8', paddingBottom: '2px', marginBottom: '4px' }}>
              <span style={{ fontSize: '8px', fontWeight: 800, color: '#1e293b', letterSpacing: '0.5px' }}>
                ARDENT SECURITY · CAMERA ARCHIVE
              </span>
              <span style={{ fontSize: '7.5px', color: '#64748b' }}>{evidence.timestamp}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3px', flex: 1, minHeight: 0 }}>
              <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '2px', border: '1px solid #64748b' }}>
                <img src="/assets/video/cctv/frames/cctv_frame_01.jpg" alt="Frame 01" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <span style={{ position: 'absolute', bottom: '1px', left: '2px', fontSize: '6px', color: '#fff', background: 'rgba(0,0,0,0.65)', padding: '0 2px' }}>01.5s</span>
              </div>
              <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '2px', border: '1px solid #64748b' }}>
                <img src="/assets/video/cctv/frames/cctv_frame_02.jpg" alt="Frame 02" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <span style={{ position: 'absolute', bottom: '1px', left: '2px', fontSize: '6px', color: '#fff', background: 'rgba(0,0,0,0.65)', padding: '0 2px' }}>04.0s</span>
              </div>
              <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '2px', border: '1px solid #64748b' }}>
                <img src="/assets/video/cctv/frames/cctv_frame_03.jpg" alt="Frame 03" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <span style={{ position: 'absolute', bottom: '1px', left: '2px', fontSize: '6px', color: '#fff', background: 'rgba(0,0,0,0.65)', padding: '0 2px' }}>06.5s</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3px', paddingTop: '2px', borderTop: '1px dashed #cbd5e1' }}>
              <span style={{ fontSize: '7.5px', fontWeight: 700, color: '#0369a1' }}>
                CAM-04 · SERVICE CORRIDOR
              </span>
              <span style={{ fontSize: '7px', color: '#475569' }}>
                CCTV-ARDENT-001
              </span>
            </div>
          </div>
        ) : evidence.id === 'EVID-LOCKER28-001' ? (
          <div
            style={{
              position: 'absolute',
              inset: '-10px -8px -6px -8px',
              background: '#1c1510',
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 9px, rgba(255,255,255,0.03) 9px, rgba(255,255,255,0.03) 10px)',
              border: '1px solid #5c4a2a',
              borderRadius: '3px',
              padding: '6px 7px',
              boxShadow: 'inset 0 0 12px rgba(0,0,0,0.4), 0 4px 8px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              fontFamily: 'monospace',
              overflow: 'hidden',
            }}
          >
            <img
              src="/assets/case001/locker28/locker_overview.jpg"
              alt="Locker 28"
              style={{ width: '100%', borderRadius: '2px', objectFit: 'cover', maxHeight: 68, opacity: 0.92 }}
            />
            <div style={{ marginTop: 4, fontSize: '7.5px', color: '#d4a96a', fontWeight: 800, letterSpacing: '0.5px' }}>
              CENTRAL STATION · LOCKER 28
            </div>
            <div style={{ fontSize: '7px', color: '#8a7055', marginTop: 1 }}>Physical Evidence · 4 objects recovered</div>
          </div>
        ) : evidence.id === 'EVID-LOCKER28-USB' ? (() => {
          let v17: {
            mounted?: boolean;
            inspectedFiles?: string[];
            comparisonDone?: boolean;
            fragmentRecovered?: boolean;
            encryptedSeen?: boolean;
          } = {};
          try {
            const raw = localStorage.getItem('317_v17_state');
            if (raw) v17 = JSON.parse(raw);
          } catch {}
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', width: '100%' }}>
              <small className="evidence-meta" style={{ color: '#0284c7', fontWeight: 800, letterSpacing: '0.4px' }}>
                V-17 FORENSIC EXTRACTION · {evidence.timestamp}
              </small>
              <div style={{ position: 'relative', borderRadius: 2, overflow: 'hidden', maxHeight: 58, background: '#080c14' }}>
                <img
                  src="/assets/case001/locker28/locker_obj_usb.jpg"
                  alt="V-17 USB Drive"
                  style={{ width: '100%', display: 'block', objectFit: 'cover', opacity: 0.95 }}
                />
              </div>
              <strong className="evidence-heading" style={{ fontWeight: 700, fontSize: '11px', marginTop: 2 }}>
                V-17 FORENSIC CLUSTER
              </strong>

              {/* Printed directory tree */}
              <div style={{
                fontFamily: 'monospace', fontSize: '7.5px', color: '#64748b', lineHeight: 1.3,
                background: 'rgba(0,0,0,0.35)', padding: '3px 5px', borderRadius: 2,
              }}>
                <div>V17_DRIVE/</div>
                <div>├─ EXPORT/ [CSV, PDF*, JSON]</div>
                <div>└─ ORIGINAL/ [Q1, Q2*, _DELETED/]</div>
              </div>

              {/* Progressive: Comparison mismatch slip */}
              {v17.comparisonDone && (
                <div style={{
                  background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
                  padding: '2px 4px', borderRadius: 2, fontSize: '8px', color: '#fca5a5', fontFamily: 'monospace',
                }}>
                  MISMATCH: LGR-102 −£8,800
                </div>
              )}

              {/* Progressive: Recovered fragment */}
              {v17.fragmentRecovered && (
                <div style={{
                  background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.3)',
                  padding: '2px 4px', borderRadius: 2, fontSize: '7.5px', color: '#e9d5ff', fontStyle: 'italic',
                }}>
                  "...values in export do not correspond..."
                </div>
              )}

              {/* Progressive: Encrypted indicator */}
              {v17.encryptedSeen && (
                <div style={{ fontSize: '7.5px', color: '#f87171', display: 'flex', alignItems: 'center', gap: 3 }}>
                  🔒 consolidated_report.pdf (AES-256)
                </div>
              )}
            </div>
          );
        })() : evidence.id === 'EVID-V17-DATA-MISMATCH' ? (
          <>
            <small className="evidence-meta" style={{ color: '#ef4444', fontWeight: 800 }}>
              FORENSIC COMPARISON · {evidence.timestamp}
            </small>
            <strong className="evidence-heading" style={{ fontWeight: 700, color: '#fca5a5' }}>
              DATA MISMATCH
            </strong>
            <span className="evidence-detail" style={{ fontFamily: 'monospace', fontSize: '8.5px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ color: '#86efac' }}>ORIGINAL: £91,200 (LGR-102)</span>
              <span style={{ color: '#cbd5e1' }}>EXPORT: £82,400 (LGR-102)</span>
              <span style={{ color: '#f87171', fontWeight: 700 }}>DIFFERENCE: −£8,800</span>
              <span style={{ fontSize: '7.5px', color: '#94a3b8', fontStyle: 'italic', marginTop: 1 }}>
                Total variance exceeds −£20,950
              </span>
            </span>
          </>
        ) : evidence.id === 'EVID-V17-RECOVERED-FRAGMENT' ? (
          <>
            <small className="evidence-meta" style={{ color: '#a78bfa', fontWeight: 800 }}>
              RECOVERED FRAGMENT · {evidence.timestamp}
            </small>
            <strong className="evidence-heading" style={{ fontWeight: 700, color: '#e9d5ff' }}>
              RECONCILE NOTE
            </strong>
            <span className="evidence-detail" style={{ fontStyle: 'italic', fontSize: '9px', color: '#d8b4fe', lineHeight: 1.4 }}>
              "...values in generated export do not correspond to source entries..."
              <span style={{ display: 'block', fontSize: '7.5px', color: '#64748b', fontStyle: 'normal', marginTop: 2 }}>
                23% file integrity · Sector overwritten
              </span>
            </span>
          </>
        ) : evidence.id === 'EVID-V17-ENCRYPTED-REPORT' ? (
          <>
            <small className="evidence-meta" style={{ color: '#f87171', fontWeight: 800 }}>
              EXPORT / PROTECTED · {evidence.timestamp}
            </small>
            <strong className="evidence-heading" style={{ fontWeight: 700 }}>
              ENCRYPTED REPORT
            </strong>
            <span className="evidence-detail" style={{ fontSize: '8.5px', color: '#94a3b8', fontFamily: 'monospace' }}>
              <span>consolidated_report.pdf</span>
              <span style={{ color: '#fca5a5' }}>🔒 AES-256 · Key Not On Drive</span>
              <span>Size: 184 KB</span>
            </span>
          </>
        ) : evidence.id === 'EVID-LOCKER28-AUDIT' ? (
          <>
            <small className="evidence-meta" style={{ color: '#1e40af', fontWeight: 700 }}>
              PHYSICAL EVIDENCE · ARDENT AUDIT · {evidence.timestamp}
            </small>
            <strong className="evidence-heading" style={{ fontWeight: 700 }}>
              REDACTED AUDIT DOCUMENT
            </strong>
            <span className="evidence-detail" style={{ fontStyle: 'italic', display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '9.5px' }}>
              <span>ARDENT CORP / INTERNAL AUDIT DIVISION</span>
              <span>REF: AUD-2024-[REDACTED]</span>
              <span>Q1-2024 · LGR-102 · £82,400 · Variance: [REDACTED]</span>
              <span style={{ fontSize: '8px', opacity: 0.75, letterSpacing: '0.5px', fontStyle: 'normal' }}>
                ████ SECTION 4 — RECONCILIATION NOTES ████
              </span>
            </span>
          </>
        ) : evidence.id === 'EVID-LOCKER28-NOTE' ? (
          <>
            <small className="evidence-meta" style={{ color: '#5b4a1a', fontWeight: 700 }}>
              PHYSICAL EVIDENCE · HANDWRITTEN NOTE · {evidence.timestamp}
            </small>
            <strong className="evidence-heading" style={{ fontWeight: 700 }}>
              LOCKER 28 NOTE
            </strong>
            <span className="evidence-detail" style={{ fontStyle: 'italic', display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '9.5px' }}>
              <span style={{ fontStyle: 'normal', fontSize: '10px', lineHeight: 1.5, color: '#d4c09a' }}>
                "If anything happens, check the original entries. Not the export."
              </span>
              <span style={{ fontSize: '8px', opacity: 0.7, letterSpacing: '0.8px', fontStyle: 'normal' }}>
                ∿∿∿ AUTHOR UNIDENTIFIED ∿∿∿
              </span>
            </span>
          </>
        ) : evidence.id === 'EVID-LOCKER28-CARD' ? (
          <>
            <small className="evidence-meta" style={{ color: '#1e3a5f', fontWeight: 700 }}>
              PHYSICAL EVIDENCE · ACCESS CARD FRAGMENT · {evidence.timestamp}
            </small>
            <strong className="evidence-heading" style={{ fontWeight: 700 }}>
              BROKEN ACCESS CARD
            </strong>
            <span className="evidence-detail" style={{ fontStyle: 'italic', display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '9.5px' }}>
              <span>ARDENT CORP · Security / Access</span>
              <span>Partial ID: …4 4 7…</span>
              <span>Photo: lower half only · Face unrecognisable</span>
              <span style={{ fontSize: '8px', opacity: 0.75, letterSpacing: '0.8px', fontStyle: 'normal', color: '#6b8aa8' }}>
                OWNER: UNKNOWN — CARD 447 [PARTIAL]
              </span>
            </span>
          </>
        ) : (
          <>
            <small className="evidence-meta">
              {evidence.sourceApp} · {evidence.timestamp}
            </small>
            <strong className="evidence-heading">{evidence.title}</strong>
            {!photo && <span className="evidence-detail">{evidence.sourceDetail}</span>}
          </>
        )}
      </span>

      {/* Physical pushpin head */}
      <i className="pin-head" aria-hidden="true" />
    </button>
  );
};
