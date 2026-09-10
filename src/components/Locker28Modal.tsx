import React, { useState, useCallback, useEffect } from 'react';
import { X, ArrowLeft, FileCheck, Check, Lock, FolderArchive } from 'lucide-react';
import { soundEngine } from '../system/SoundEngine';
import { hapticEngine } from '../system/HapticEngine';
import { audioManager } from '../system/AudioManager';
import { V17UsbModal } from './V17UsbModal';

// ─── Canonical asset paths ────────────────────────────────────────────────────
const LOCKER_ASSETS = {
  overview:  '/assets/case001/locker28/locker_overview.jpg',
  usb:       '/assets/case001/locker28/locker_obj_usb.jpg',
  document:  '/assets/case001/locker28/locker_obj_document.jpg',
  note:      '/assets/case001/locker28/locker_obj_note.jpg',
  card:      '/assets/case001/locker28/locker_obj_card.jpg',
} as const;

// ─── Evidence IDs ─────────────────────────────────────────────────────────────
export const LOCKER28_EVIDENCE_IDS = {
  locker:   'EVID-LOCKER28-001',
  usb:      'EVID-LOCKER28-USB',
  audit:    'EVID-LOCKER28-AUDIT',
  note:     'EVID-LOCKER28-NOTE',
  card:     'EVID-LOCKER28-CARD',
} as const;

// ─── Hotspot definitions (% of overview image width/height) ──────────────────
// These are tuned to the actual approved overview image.
const HOTSPOTS: HotspotDef[] = [
  {
    id: 'usb',
    label: 'Unknown USB Drive',
    evidenceId: LOCKER28_EVIDENCE_IDS.usb,
    // USB sits centre-right, lower third
    left: 50, top: 62, width: 24, height: 16,
  },
  {
    id: 'document',
    label: 'Folded Document',
    evidenceId: LOCKER28_EVIDENCE_IDS.audit,
    // Document is the large paper on the right half
    left: 38, top: 50, width: 44, height: 32,
  },
  {
    id: 'note',
    label: 'Handwritten Note',
    evidenceId: LOCKER28_EVIDENCE_IDS.note,
    // Note is the smaller paper on the left
    left: 12, top: 55, width: 30, height: 24,
  },
  {
    id: 'card',
    label: 'Broken Card',
    evidenceId: LOCKER28_EVIDENCE_IDS.card,
    // Card fragment bottom-left
    left: 8, top: 72, width: 24, height: 16,
  },
];

// Empty impression — shown only after all 4 primary objects inspected
const EMPTY_IMPRESSION_HOTSPOT = {
  // Back-left area of the locker floor — clean rectangular dust outline
  left: 14, top: 32, width: 24, height: 18,
};

interface HotspotDef {
  id: string;
  label: string;
  evidenceId: string;
  left: number;
  top: number;
  width: number;
  height: number;
}

// ─── Object detail data ───────────────────────────────────────────────────────
const OBJECT_DETAILS: Record<string, ObjectDetail> = {
  usb: {
    evidenceId: LOCKER28_EVIDENCE_IDS.usb,
    title: 'V-17 USB Drive',
    tag: 'EVID-LOCKER28-USB',
    assetKey: 'usb',
    meta: 'Physical Evidence · Encrypted Storage',
    initialObservation: 'A small unbranded USB drive carrying a handwritten V-17 label.',
    details: [
      'Matte-black body. No manufacturer markings.',
      'Label: handwritten "V-17" in black ink on aged cream paper tag.',
      'USB-A connector. No cap. Mild oxidation on connector contacts.',
      'Fingerprint smudge visible on upper face.',
    ],
    statusLabel: 'FILESYSTEM MOUNTABLE · SELECT FILES ENCRYPTED',
    statusNote: 'The V-17 drive filesystem is mountable and readable, containing source and export folders. Select files (including the consolidated report) remain AES-256 encrypted.',
    statusColor: '#059669',
    isEncrypted: false,
  },
  document: {
    evidenceId: LOCKER28_EVIDENCE_IDS.audit,
    title: 'Redacted Ardent Audit',
    tag: 'EVID-LOCKER28-AUDIT',
    assetKey: 'document',
    meta: 'Physical Evidence · Corporate Document',
    initialObservation: 'A partial Ardent Corp internal audit printout. Multiple sections are redacted.',
    details: [
      'ARDENT CORP / INTERNAL AUDIT DIVISION',
      'REF: AUD-2024-[REDACTED]',
      'Section 3 records variance between reported and verified amounts.',
      'Visible: Q1-2024 / LGR-102 / £82,400 — Verified column: [REDACTED]',
      'Visible: Q1-2024 / £91,200 / £91,200 / — (no variance recorded)',
      'Visible: Q2-2024 / LGR-209 — all subsequent columns: [REDACTED]',
      'Section 4 fragments: "…discrepancy identified in…" / "…entries do not correspond to…" / "…lack of supporting…"',
      'Signature and date fields: REDACTED',
    ],
    statusLabel: 'REDACTED — INFORMATION WITHHELD',
    statusNote: 'The black bars represent unknown information. Their extent suggests the redaction was deliberate, not routine.',
    statusColor: '#1e3a5f',
    isEncrypted: false,
  },
  note: {
    evidenceId: LOCKER28_EVIDENCE_IDS.note,
    title: 'Locker 28 Note',
    tag: 'EVID-LOCKER28-NOTE',
    assetKey: 'note',
    meta: 'Physical Evidence · Handwritten',
    initialObservation: 'A handwritten note on cream paper. The message is brief and deliberate.',
    details: [
      'Written in blue-black ballpoint pen.',
      'Handwriting is careful but slightly hurried.',
      'A small initial mark appears below the message — not a full signature.',
    ],
    canonicalMessage: '"If anything happens, check the original entries. Not the export."',
    statusLabel: 'AUTHOR: UNIDENTIFIED',
    statusNote: 'The handwriting has not been matched to any known sample. The initial mark beneath the text is too stylised to attribute definitively.',
    statusColor: '#3b3020',
    isEncrypted: false,
  },
  card: {
    evidenceId: LOCKER28_EVIDENCE_IDS.card,
    title: 'Broken Access Card',
    tag: 'EVID-LOCKER28-CARD',
    assetKey: 'card',
    meta: 'Physical Evidence · Security Card Fragment',
    initialObservation: 'A damaged corporate access card fragment with Ardent Corp markings. Only approximately 60% of the card remains.',
    details: [
      'Card body: dark navy / charcoal PVC stock.',
      'Broken edge — jagged, uneven fracture. Card was snapped, not cut.',
      'Partial barcode/magnetic stripe visible. Continuity: interrupted by break.',
      'Partial number sequence: …4 4 7… (adjacent digits destroyed)',
      'Partial employee photo: lower portion only. Face not reconstructable.',
      'ARDENT CORP branding visible at base of card.',
    ],
    statusLabel: 'OWNER: UNKNOWN — CARD 447 [PARTIAL]',
    statusNote: 'The partial identifier "447" may allow card registry cross-reference if Ardent Corp security records are obtained. Owner cannot be established from this fragment alone.',
    statusColor: '#1e293b',
    isEncrypted: false,
  },
};

interface ObjectDetail {
  evidenceId: string;
  title: string;
  tag: string;
  assetKey: keyof typeof LOCKER_ASSETS;
  meta: string;
  initialObservation: string;
  details: string[];
  canonicalMessage?: string;
  statusLabel: string;
  statusNote: string;
  statusColor: string;
  isEncrypted: boolean;
}

// ─── Persistence helpers ──────────────────────────────────────────────────────
const STORAGE_KEY = '317_locker28_state';

interface Locker28State {
  opened: boolean;
  inspected: Record<string, boolean>;
  impressionDiscovered: boolean;
}

function loadLockerState(): Locker28State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { opened: false, inspected: {}, impressionDiscovered: false };
}

function saveLockerState(state: Locker28State) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Locker28ModalProps {
  onClose: () => void;
  onDiscoverEvidence: (evidenceId: string) => void;
  discoveredEvidenceIds: string[];
}

// ─── Main component ───────────────────────────────────────────────────────────
export const Locker28Modal: React.FC<Locker28ModalProps> = ({
  onClose,
  onDiscoverEvidence,
  discoveredEvidenceIds,
}) => {
  const [lockerState, setLockerStateRaw] = useState<Locker28State>(loadLockerState);
  const [view, setView] = useState<'overview' | 'object' | 'impression'>('overview');
  const [activeObjectId, setActiveObjectId] = useState<string | null>(null);
  const [hoveredHotspot, setHoveredHotspot] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [overviewZoom, setOverviewZoom] = useState(1);
  const [objectZoom, setObjectZoom] = useState(1);
  const [objectPan, setObjectPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isBrowsingV17, setIsBrowsingV17] = useState(false);

  const persistState = useCallback((next: Locker28State) => {
    setLockerStateRaw(next);
    saveLockerState(next);
  }, []);

  // Mark locker as opened on mount; trigger discovery of locker container evidence
  useEffect(() => {
    if (!lockerState.opened) {
      const next = { ...lockerState, opened: true };
      persistState(next);
      // Duck investigation music slightly on entry
      audioManager.duckMusic(0.45, 0.8);
    }
    if (!discoveredEvidenceIds.includes(LOCKER28_EVIDENCE_IDS.locker)) {
      onDiscoverEvidence(LOCKER28_EVIDENCE_IDS.locker);
    }
    return () => { audioManager.unduckMusic(1.2); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const allPrimaryInspected = HOTSPOTS.every(h => lockerState.inspected[h.id]);

  // ── Open object close-up ─────────────────────────────────────────────────
  const openObject = (objectId: string) => {
    soundEngine.playTap();
    hapticEngine.light();
    setActiveObjectId(objectId);
    setObjectZoom(1);
    setObjectPan({ x: 0, y: 0 });
    setView('object');
    // Mark inspected
    if (!lockerState.inspected[objectId]) {
      const next = { ...lockerState, inspected: { ...lockerState.inspected, [objectId]: true } };
      persistState(next);
    }
  };

  // ── Open empty impression ────────────────────────────────────────────────
  const openImpression = () => {
    soundEngine.playTap();
    hapticEngine.light();
    const next = { ...lockerState, impressionDiscovered: true };
    persistState(next);
    setView('impression');
  };

  // ── Log to case ──────────────────────────────────────────────────────────
  const logToCase = (evidenceId: string, label: string) => {
    if (discoveredEvidenceIds.includes(evidenceId)) return;
    soundEngine.playEvidenceLogged();
    hapticEngine.clueDiscovered();
    onDiscoverEvidence(evidenceId);
    showToast(`✓ ${label} logged to Evidence Board`);
  };

  // ── Back to overview ─────────────────────────────────────────────────────
  const backToOverview = () => {
    soundEngine.playTap();
    setView('overview');
    setActiveObjectId(null);
    setObjectZoom(1);
    setObjectPan({ x: 0, y: 0 });
  };

  // ── Object pan drag ──────────────────────────────────────────────────────
  const handleMouseDown = (e: React.MouseEvent) => {
    if (objectZoom <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - objectPan.x, y: e.clientY - objectPan.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || objectZoom <= 1) return;
    const maxP = (objectZoom - 1) * 140;
    setObjectPan({
      x: Math.max(-maxP, Math.min(maxP, e.clientX - dragStart.x)),
      y: Math.max(-maxP, Math.min(maxP, e.clientY - dragStart.y)),
    });
  };
  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (objectZoom <= 1 || e.touches.length !== 1) return;
    const t = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: t.clientX - objectPan.x, y: t.clientY - objectPan.y });
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || objectZoom <= 1 || e.touches.length !== 1) return;
    const t = e.touches[0];
    const maxP = (objectZoom - 1) * 120;
    setObjectPan({
      x: Math.max(-maxP, Math.min(maxP, t.clientX - dragStart.x)),
      y: Math.max(-maxP, Math.min(maxP, t.clientY - dragStart.y)),
    });
  };

  const detail = activeObjectId ? OBJECT_DETAILS[activeObjectId] : null;
  const isLogged = (eid: string) => discoveredEvidenceIds.includes(eid);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'rgba(4, 5, 8, 0.97)',
        display: 'flex', flexDirection: 'column',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', monospace",
        color: '#e2e8f0', overflow: 'hidden',
        userSelect: 'none',
      }}
      onMouseUp={handleMouseUp}
    >
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'absolute', top: 62, left: '50%', transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, #1d4e2e, #166534)',
          color: '#bbf7d0', padding: '8px 18px', borderRadius: 20,
          fontSize: 12, fontWeight: 700, zIndex: 1000,
          boxShadow: '0 4px 18px rgba(22,101,52,0.45)',
          border: '1px solid rgba(187,247,208,0.3)', letterSpacing: '0.3px',
          whiteSpace: 'nowrap',
        }}>
          {toast}
        </div>
      )}

      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      <header style={{
        height: 52, borderBottom: '1px solid rgba(148,163,184,0.15)',
        background: 'rgba(8, 10, 16, 0.95)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', flexShrink: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {view !== 'overview' ? (
            <button onClick={backToOverview} style={btnStyle}>
              <ArrowLeft size={13} /> Locker
            </button>
          ) : (
            <button onClick={() => { soundEngine.playTap(); onClose(); }} style={btnStyle}>
              ‹ Return
            </button>
          )}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#f8fafc', letterSpacing: '0.5px' }}>
              {view === 'overview'
                ? 'CENTRAL STATION · LOCKER 28'
                : view === 'impression'
                ? 'LOCKER 28 · SECONDARY OBSERVATION'
                : `LOCKER 28 · ${detail?.title.toUpperCase() ?? ''}`}
            </div>
            <div style={{ fontSize: 10, color: '#64748b' }}>
              {view === 'overview'
                ? 'Physical evidence recovered · Inspection mode'
                : view === 'impression'
                ? 'Dust pattern analysis'
                : detail?.meta ?? ''}
            </div>
          </div>
        </div>

        <button onClick={() => { soundEngine.playTap(); onClose(); }} style={{
          background: 'none', border: 'none', color: '#64748b',
          cursor: 'pointer', padding: 6, borderRadius: 6,
          display: 'flex', alignItems: 'center',
        }}>
          <X size={18} />
        </button>
      </header>

      {/* ── OVERVIEW VIEW ────────────────────────────────────────────────── */}
      {view === 'overview' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Instruction strip */}
          <div style={{
            background: 'rgba(14,16,26,0.9)', borderBottom: '1px solid rgba(148,163,184,0.1)',
            padding: '6px 16px', fontSize: 10.5, color: '#94a3b8',
            letterSpacing: '0.4px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
          }}>
            <span style={{ color: '#f59e0b', fontWeight: 700 }}>LOCKER 28 OPEN</span>
            <span>·</span>
            <span>Tap objects to inspect</span>
          </div>

          {/* Overview image with hotspots */}
          <div style={{
            flex: 1, position: 'relative', overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#06080e',
          }}>
            {/* Zoom controls */}
            <div style={{
              position: 'absolute', top: 10, right: 12, zIndex: 20,
              display: 'flex', gap: 4,
            }}>
              {[1, 1.5, 2].map(lvl => (
                <button key={lvl} onClick={() => setOverviewZoom(lvl)} style={{
                  ...zoomBtnStyle,
                  background: overviewZoom === lvl ? '#0284c7' : 'rgba(255,255,255,0.07)',
                  border: overviewZoom === lvl ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.12)',
                  color: overviewZoom === lvl ? '#fff' : '#94a3b8',
                  fontWeight: overviewZoom === lvl ? 700 : 400,
                }}>
                  {lvl}×
                </button>
              ))}
            </div>

            <div style={{
              position: 'relative',
              width: '100%', height: '100%',
              overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                position: 'relative',
                transform: `scale(${overviewZoom})`,
                transformOrigin: '50% 40%',
                transition: 'transform 0.3s ease-out',
              }}>
                <img
                  src={LOCKER_ASSETS.overview}
                  alt="Locker 28 interior"
                  draggable={false}
                  style={{
                    display: 'block',
                    maxHeight: 'calc(100vh - 160px)',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    userSelect: 'none',
                  }}
                />

                {/* Invisible hotspots */}
                {HOTSPOTS.map(hs => {
                  const inspected = lockerState.inspected[hs.id];
                  const logged = isLogged(hs.evidenceId);
                  return (
                    <button
                      key={hs.id}
                      aria-label={`Inspect ${hs.label}`}
                      onMouseEnter={() => setHoveredHotspot(hs.id)}
                      onMouseLeave={() => setHoveredHotspot(null)}
                      onClick={() => openObject(hs.id)}
                      style={{
                        position: 'absolute',
                        left: `${hs.left}%`, top: `${hs.top}%`,
                        width: `${hs.width}%`, height: `${hs.height}%`,
                        background: hoveredHotspot === hs.id
                          ? 'rgba(248,250,252,0.06)'
                          : 'transparent',
                        border: hoveredHotspot === hs.id
                          ? '1px solid rgba(248,250,252,0.18)'
                          : '1px solid transparent',
                        borderRadius: 4,
                        cursor: 'pointer',
                        transition: 'background 0.18s, border 0.18s, filter 0.18s',
                        filter: hoveredHotspot === hs.id ? 'brightness(1.08)' : 'none',
                      }}
                    >
                      {/* Tiny inspected / logged indicator - top right corner only */}
                      {(inspected || logged) && (
                        <span style={{
                          position: 'absolute', top: 2, right: 2,
                          width: 6, height: 6, borderRadius: '50%',
                          background: logged ? '#22c55e' : '#f59e0b',
                          boxShadow: `0 0 4px ${logged ? '#22c55e' : '#f59e0b'}`,
                        }} />
                      )}
                    </button>
                  );
                })}

                {/* Empty impression hotspot — only after all 4 inspected */}
                {allPrimaryInspected && (
                  <button
                    aria-label="Inspect empty area"
                    onMouseEnter={() => setHoveredHotspot('impression')}
                    onMouseLeave={() => setHoveredHotspot(null)}
                    onClick={openImpression}
                    style={{
                      position: 'absolute',
                      left: `${EMPTY_IMPRESSION_HOTSPOT.left}%`,
                      top: `${EMPTY_IMPRESSION_HOTSPOT.top}%`,
                      width: `${EMPTY_IMPRESSION_HOTSPOT.width}%`,
                      height: `${EMPTY_IMPRESSION_HOTSPOT.height}%`,
                      background: hoveredHotspot === 'impression'
                        ? 'rgba(248,250,252,0.04)'
                        : 'transparent',
                      border: hoveredHotspot === 'impression'
                        ? '1px dashed rgba(248,250,252,0.12)'
                        : '1px dashed transparent',
                      borderRadius: 3, cursor: 'crosshair',
                      transition: 'background 0.2s, border 0.2s',
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Objects status strip */}
          <div style={{
            flexShrink: 0, background: 'rgba(8,10,16,0.96)',
            borderTop: '1px solid rgba(148,163,184,0.1)',
            padding: '8px 14px', display: 'flex', gap: 8, flexWrap: 'wrap',
          }}>
            {HOTSPOTS.map(hs => {
              const inspected = lockerState.inspected[hs.id];
              const logged = isLogged(hs.evidenceId);
              return (
                <button key={hs.id} onClick={() => openObject(hs.id)} style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${logged ? 'rgba(34,197,94,0.4)' : inspected ? 'rgba(245,158,11,0.35)' : 'rgba(148,163,184,0.18)'}`,
                  borderRadius: 6, padding: '5px 10px',
                  fontSize: 10, color: logged ? '#86efac' : inspected ? '#fcd34d' : '#94a3b8',
                  cursor: 'pointer', letterSpacing: '0.3px', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: logged ? '#22c55e' : inspected ? '#f59e0b' : '#374151',
                    flexShrink: 0,
                  }} />
                  {hs.label}
                </button>
              );
            })}
            {allPrimaryInspected && (
              <button onClick={openImpression} style={{
                background: 'rgba(255,255,255,0.03)',
                border: `1px dashed ${lockerState.impressionDiscovered ? 'rgba(148,163,184,0.35)' : 'rgba(148,163,184,0.15)'}`,
                borderRadius: 6, padding: '5px 10px',
                fontSize: 10, color: '#64748b',
                cursor: 'pointer', letterSpacing: '0.3px',
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: lockerState.impressionDiscovered ? '#64748b' : '#1e293b',
                  flexShrink: 0,
                }} />
                Empty impression
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── OBJECT CLOSE-UP VIEW ─────────────────────────────────────────── */}
      {view === 'object' && detail && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Image viewport */}
          <div
            style={{
              flex: 1, position: 'relative', overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#04060a',
              cursor: objectZoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => setIsDragging(false)}
          >
            {/* Zoom controls */}
            <div style={{ position: 'absolute', top: 10, right: 12, zIndex: 20, display: 'flex', gap: 4 }}>
              {[1, 1.5, 2, 3].map(lvl => (
                <button key={lvl} onClick={() => {
                  soundEngine.playTap();
                  setObjectZoom(lvl);
                  if (lvl === 1) setObjectPan({ x: 0, y: 0 });
                }} style={{
                  ...zoomBtnStyle,
                  background: objectZoom === lvl ? '#0284c7' : 'rgba(255,255,255,0.07)',
                  border: objectZoom === lvl ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.12)',
                  color: objectZoom === lvl ? '#fff' : '#94a3b8',
                  fontWeight: objectZoom === lvl ? 700 : 400,
                }}>
                  {lvl}×
                </button>
              ))}
            </div>

            <img
              src={LOCKER_ASSETS[detail.assetKey]}
              alt={detail.title}
              draggable={false}
              style={{
                maxHeight: 'calc(100vh - 260px)',
                maxWidth: '100%',
                objectFit: 'contain',
                transform: `scale(${objectZoom}) translate(${objectPan.x / objectZoom}px, ${objectPan.y / objectZoom}px)`,
                transition: isDragging ? 'none' : 'transform 0.18s ease-out',
                userSelect: 'none',
              }}
            />

            {/* Drag hint */}
            {objectZoom > 1 && (
              <div style={{
                position: 'absolute', bottom: 10, right: 12,
                background: 'rgba(15,23,42,0.85)',
                border: '1px solid rgba(56,189,248,0.3)',
                borderRadius: 4, padding: '3px 8px',
                fontSize: 10, color: '#38bdf8', pointerEvents: 'none',
                letterSpacing: '0.5px', fontFamily: 'monospace',
              }}>
                DRAG TO PAN
              </div>
            )}
          </div>

          {/* Detail panel */}
          <div style={{
            flexShrink: 0, background: 'rgba(8,10,18,0.97)',
            borderTop: '1px solid rgba(148,163,184,0.12)',
            padding: '12px 16px',
            maxHeight: '42%', overflowY: 'auto',
          }}>
            {/* Tag + title */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 9, color: '#64748b', letterSpacing: '1px', fontFamily: 'monospace', marginBottom: 2 }}>
                  {detail.tag}
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.2px' }}>
                  {detail.title}
                </div>
              </div>
              {/* Log to case button */}
              {isLogged(detail.evidenceId) ? (
                <div style={{
                  background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
                  color: '#86efac', padding: '5px 12px', borderRadius: 6,
                  fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
                }}>
                  <Check size={12} /> LOGGED
                </div>
              ) : (
                <button
                  onClick={() => logToCase(detail.evidenceId, detail.title)}
                  style={{
                    background: 'linear-gradient(135deg, #1d4ed8, #1e40af)',
                    border: '1px solid #3b82f6', color: '#fff',
                    padding: '6px 12px', borderRadius: 6,
                    fontSize: 10.5, fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
                    boxShadow: '0 2px 10px rgba(59,130,246,0.35)',
                  }}
                >
                  <FileCheck size={12} /> LOG TO CASE
                </button>
              )}
            </div>

            {/* Initial observation */}
            <p style={{ fontSize: 11.5, color: '#94a3b8', margin: '0 0 8px', lineHeight: 1.5, fontStyle: 'italic' }}>
              {detail.initialObservation}
            </p>

            {/* Canonical message (note) */}
            {detail.canonicalMessage && (
              <div style={{
                background: 'rgba(245,243,235,0.06)', border: '1px solid rgba(214,197,154,0.2)',
                borderRadius: 5, padding: '8px 12px', marginBottom: 8,
              }}>
                <div style={{ fontSize: 10, color: '#a3a38a', letterSpacing: '0.8px', marginBottom: 4, fontFamily: 'monospace' }}>
                  EXACT TRANSCRIPTION
                </div>
                <p style={{ fontSize: 13, color: '#e8e4d4', margin: 0, lineHeight: 1.6, fontStyle: 'italic' }}>
                  {detail.canonicalMessage}
                </p>
              </div>
            )}

            {/* Detail list */}
            <ul style={{ margin: '0 0 8px', padding: '0 0 0 14px', listStyle: 'disc' }}>
              {detail.details.map((d, i) => (
                <li key={i} style={{ fontSize: 10.5, color: '#64748b', marginBottom: 3, lineHeight: 1.45 }}>
                  {d}
                </li>
              ))}
            </ul>

            {/* Status banner */}
            <div style={{
              background: `${detail.statusColor}22`,
              border: `1px solid ${detail.statusColor}55`,
              borderRadius: 5, padding: '7px 10px',
              display: 'flex', alignItems: 'flex-start', gap: 8,
            }}>
              {detail.isEncrypted && <Lock size={13} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 1 }} />}
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#e2e8f0', letterSpacing: '0.5px', marginBottom: 2 }}>
                  {detail.statusLabel}
                </div>
                <div style={{ fontSize: 10, color: '#94a3b8', lineHeight: 1.4 }}>
                  {detail.statusNote}
                </div>
              </div>
            </div>

            {/* Mount & Browse V-17 button */}
            {detail.assetKey === 'usb' && (
              <div style={{ marginTop: 10 }}>
                <button
                  onClick={() => {
                    soundEngine.playTap();
                    hapticEngine.medium();
                    setIsBrowsingV17(true);
                  }}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                    border: '1px solid #38bdf8',
                    color: '#fff',
                    padding: '9px 14px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 7,
                    letterSpacing: '0.4px',
                    boxShadow: '0 3px 12px rgba(2,132,199,0.3)',
                  }}
                >
                  <FolderArchive size={14} /> CONNECT & BROWSE V-17 FILESYSTEM →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── EMPTY IMPRESSION VIEW ────────────────────────────────────────── */}
      {view === 'impression' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 20 }}>
          {/* Overview image cropped to back-left area */}
          <div style={{
            width: '100%', maxWidth: 420,
            position: 'relative', borderRadius: 8,
            border: '1px solid rgba(148,163,184,0.15)',
            overflow: 'hidden', background: '#030406',
          }}>
            <img
              src={LOCKER_ASSETS.overview}
              alt="Locker interior — empty impression area"
              style={{
                width: '100%', display: 'block',
                objectFit: 'cover',
                objectPosition: '20% 25%',
                maxHeight: 260,
                filter: 'brightness(1.1)',
              }}
            />
            {/* Subtle dashed rectangle overlaid on clean area */}
            <div style={{
              position: 'absolute',
              left: '14%', top: '20%', width: '26%', height: '28%',
              border: '1px dashed rgba(248,250,252,0.22)',
              borderRadius: 2, pointerEvents: 'none',
            }} />
          </div>

          {/* Observation card */}
          <div style={{
            width: '100%', maxWidth: 420,
            background: 'rgba(14,16,26,0.9)',
            border: '1px solid rgba(148,163,184,0.15)',
            borderRadius: 8, padding: '16px 18px',
          }}>
            <div style={{ fontSize: 9, color: '#64748b', letterSpacing: '1px', fontFamily: 'monospace', marginBottom: 6 }}>
              SECONDARY OBSERVATION · LOCKER 28 INTERIOR
            </div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', margin: '0 0 10px', letterSpacing: '-0.1px' }}>
              Unusual Clean Rectangle
            </h3>
            <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6, margin: '0 0 10px' }}>
              An unusually clean rectangular area interrupts the dust pattern inside the locker.
            </p>
            <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6, margin: '0 0 14px' }}>
              Something may have been stored here recently. The clean outline suggests an object with a defined rectangular footprint — approximately the size of a small notebook, envelope, or flat case.
            </p>
            <div style={{
              background: 'rgba(30,25,20,0.8)',
              border: '1px solid rgba(148,120,80,0.2)',
              borderRadius: 5, padding: '8px 10px',
              fontSize: 10.5, color: '#9c8a6a', lineHeight: 1.5,
            }}>
              The dust pattern is consistent with an object having previously occupied this space. Whether anything was ever here, when, or what it may have been, cannot be determined from this observation alone.
            </div>
          </div>
        </div>
      )}

      {/* ── V-17 FORENSIC FILESYSTEM OVERLAY ───────────────────────────────── */}
      {isBrowsingV17 && (
        <V17UsbModal
          onClose={() => setIsBrowsingV17(false)}
          onDiscoverEvidence={onDiscoverEvidence}
          discoveredEvidenceIds={discoveredEvidenceIds}
        />
      )}
    </div>
  );
};

// ─── Shared micro-styles ──────────────────────────────────────────────────────
const btnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.12)',
  color: '#cbd5e1', borderRadius: 7,
  padding: '5px 11px', fontSize: 12, cursor: 'pointer',
  display: 'flex', alignItems: 'center', gap: 4,
};

const zoomBtnStyle: React.CSSProperties = {
  borderRadius: 4, padding: '3px 8px',
  fontSize: 10.5, cursor: 'pointer',
};
