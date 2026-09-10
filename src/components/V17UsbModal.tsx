import React, { useState, useCallback, useEffect } from 'react';
import { X, ArrowLeft, ChevronRight, FileText, Lock, Check, FileCheck } from 'lucide-react';
import { soundEngine } from '../system/SoundEngine';
import { hapticEngine } from '../system/HapticEngine';

// ─── Evidence IDs ─────────────────────────────────────────────────────────────
export const V17_EVIDENCE_IDS = {
  mismatch:  'EVID-V17-DATA-MISMATCH',
  fragment:  'EVID-V17-RECOVERED-FRAGMENT',
  encrypted: 'EVID-V17-ENCRYPTED-REPORT',
} as const;

// ─── Canonical filesystem data ────────────────────────────────────────────────
// All numerical values are locked. Use these constants everywhere.
const CANON = {
  // EXPORT values (the outward-facing, potentially manipulated figures)
  exportLgr102:  82_400,
  exportLgr208:  91_200,
  exportLgr315:  67_300,
  exportLgr419:  38_900,
  exportTotal:  279_800,
  // ORIGINAL values (source records from the drive)
  origLgr102:   91_200,  // mismatch: export is £8,800 lower
  origLgr208:   91_200,  // match
  origLgr315:   79_450,  // mismatch: export is £12,150 lower — Q2 source partial
  origLgr419:   38_900,  // match
  origTotal:   300_750,
  totalDiff:    20_950,
  // Timestamps
  driveCreated: '2024-09-15T14:32:17Z',
  driveModified: '2026-09-08T22:53:41Z',
  exportModified: '2026-09-08T22:51:09Z',
  origQ1Modified: '2024-09-15T14:28:44Z',
  origQ2Modified: '2024-09-15T14:31:03Z',
  tmpCreated: '2024-09-12T09:14:03Z',
  tmpModified: '2024-09-14T16:41:28Z',
  pdfModified: '2026-09-08T22:52:17Z',
} as const;

const fmt = (n: number) => `£${n.toLocaleString('en-GB')}`;

// ─── Persistence ──────────────────────────────────────────────────────────────
const STORAGE_KEY = '317_v17_state';

interface V17PersistState {
  mounted: boolean;
  inspectedFiles: string[];
  comparisonDone: boolean;
  fragmentRecovered: boolean;
  metadataInspected: boolean;
  tmpInspected: boolean;
  encryptedSeen: boolean;
}

function loadV17State(): V17PersistState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {
    mounted: false, inspectedFiles: [], comparisonDone: false,
    fragmentRecovered: false, metadataInspected: false,
    tmpInspected: false, encryptedSeen: false,
  };
}

function saveV17State(s: V17PersistState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { /* ignore */ }
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface V17UsbModalProps {
  onClose: () => void;
  onDiscoverEvidence: (evidenceId: string) => void;
  discoveredEvidenceIds: string[];
}

// ─── Component ────────────────────────────────────────────────────────────────
export const V17UsbModal: React.FC<V17UsbModalProps> = ({
  onClose,
  onDiscoverEvidence,
  discoveredEvidenceIds,
}) => {
  const [ps, setPsRaw] = useState<V17PersistState>(loadV17State);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [showCompare, setShowCompare] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const setPersist = useCallback((next: V17PersistState) => {
    setPsRaw(next);
    saveV17State(next);
  }, []);

  useEffect(() => {
    if (!ps.mounted) setPersist({ ...ps, mounted: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const markInspected = (fileId: string) => {
    if (ps.inspectedFiles.includes(fileId)) return;
    setPersist({ ...ps, inspectedFiles: [...ps.inspectedFiles, fileId] });
  };

  const isLogged = (eid: string) => discoveredEvidenceIds.includes(eid);

  const logEvidence = (eid: string, label: string) => {
    if (isLogged(eid)) return;
    soundEngine.playEvidenceLogged();
    hapticEngine.clueDiscovered();
    onDiscoverEvidence(eid);
    showToast(`✓ ${label} logged to Evidence Board`);
  };

  // ── Derived state ─────────────────────────────────────────────────────────
  const canCompare =
    ps.inspectedFiles.includes('summary_q1_q2_2024.csv') &&
    ps.inspectedFiles.includes('entries_q1_raw.csv');

  // ── Navigation ────────────────────────────────────────────────────────────
  const openFolder = (name: string) => {
    soundEngine.playTap();
    setCurrentPath([...currentPath, name]);
    setSelectedFile(null);
    setShowCompare(false);
  };

  const openFile = (fileId: string, specialHandlers?: () => void) => {
    soundEngine.playTap();
    setSelectedFile(fileId);
    setShowCompare(false);
    markInspected(fileId);
    specialHandlers?.();
  };

  const goBack = () => {
    soundEngine.playTap();
    if (selectedFile) {
      setSelectedFile(null);
      setShowCompare(false);
    } else if (currentPath.length > 0) {
      setCurrentPath(currentPath.slice(0, -1));
    } else {
      onClose();
    }
  };

  const pathLabel = ['V17_DRIVE', ...currentPath].join(' / ');

  // ── Folder contents ───────────────────────────────────────────────────────
  const renderFolderContents = () => {
    const depth = currentPath.join('/');

    if (depth === '') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <FolderRow name="EXPORT" onClick={() => openFolder('EXPORT')} note="3 files" />
          <FolderRow name="ORIGINAL" onClick={() => openFolder('ORIGINAL')} note="3 items" />
        </div>
      );
    }
    if (depth === 'EXPORT') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <FileRow id="summary_q1_q2_2024.csv" label="summary_q1_q2_2024.csv" size="3.2 KB"
            badge="CSV" badgeColor="#22c55e" modified={CANON.exportModified}
            inspected={ps.inspectedFiles.includes('summary_q1_q2_2024.csv')}
            onClick={() => openFile('summary_q1_q2_2024.csv')} />
          <FileRow id="consolidated_report.pdf" label="consolidated_report.pdf" size="184 KB"
            badge="ENCRYPTED" badgeColor="#ef4444" modified={CANON.pdfModified}
            inspected={ps.inspectedFiles.includes('consolidated_report.pdf')}
            onClick={() => openFile('consolidated_report.pdf', () =>
              setPersist({ ...ps, encryptedSeen: true, inspectedFiles: [...ps.inspectedFiles.includes('consolidated_report.pdf') ? ps.inspectedFiles : [...ps.inspectedFiles, 'consolidated_report.pdf']] })
            )} />
          <FileRow id="metadata.json" label="metadata.json" size="0.8 KB"
            badge="JSON" badgeColor="#38bdf8" modified={CANON.driveModified}
            inspected={ps.inspectedFiles.includes('metadata.json')}
            onClick={() => openFile('metadata.json', () =>
              setPersist({ ...ps, metadataInspected: true, inspectedFiles: [...(ps.inspectedFiles.includes('metadata.json') ? ps.inspectedFiles : [...ps.inspectedFiles, 'metadata.json'])] })
            )} />
        </div>
      );
    }
    if (depth === 'ORIGINAL') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <FileRow id="entries_q1_raw.csv" label="entries_q1_raw.csv" size="2.9 KB"
            badge="CSV" badgeColor="#22c55e" modified={CANON.origQ1Modified}
            inspected={ps.inspectedFiles.includes('entries_q1_raw.csv')}
            onClick={() => openFile('entries_q1_raw.csv')} />
          <FileRow id="entries_q2_raw.csv" label="entries_q2_raw.csv" size="1.4 KB"
            badge="PARTIAL" badgeColor="#f59e0b" modified={CANON.origQ2Modified}
            inspected={ps.inspectedFiles.includes('entries_q2_raw.csv')}
            onClick={() => openFile('entries_q2_raw.csv')} />
          <FolderRow name="_DELETED" onClick={() => openFolder('_DELETED')} note="2 items · forensic recovery" warn />
        </div>
      );
    }
    if (depth === 'ORIGINAL/_DELETED') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 10, color: '#92400e', background: 'rgba(146,64,14,0.1)', border: '1px solid rgba(146,64,14,0.25)', borderRadius: 5, padding: '5px 9px', marginBottom: 4 }}>
            Forensic recovery sector — deletion timestamps visible, content integrity degraded
          </div>
          <FileRow id="audit_flag_072.tmp" label="audit_flag_072.tmp" size="2.3 KB"
            badge="METADATA ONLY" badgeColor="#94a3b8" modified={CANON.tmpModified}
            inspected={ps.inspectedFiles.includes('audit_flag_072.tmp')}
            onClick={() => openFile('audit_flag_072.tmp', () =>
              setPersist({ ...ps, tmpInspected: true, inspectedFiles: [...(ps.inspectedFiles.includes('audit_flag_072.tmp') ? ps.inspectedFiles : [...ps.inspectedFiles, 'audit_flag_072.tmp'])] })
            )} />
          <FileRow id="reconcile_note.txt" label="reconcile_note.txt" size="0.4 KB"
            badge="FRAGMENT" badgeColor="#a78bfa" modified={CANON.tmpModified}
            inspected={ps.inspectedFiles.includes('reconcile_note.txt')}
            onClick={() => openFile('reconcile_note.txt')} />
        </div>
      );
    }
    return <div style={{ color: '#64748b', fontSize: 12 }}>Empty directory.</div>;
  };

  // ── File content renderers ────────────────────────────────────────────────
  const renderFileContent = () => {
    if (!selectedFile) return null;

    if (selectedFile === 'summary_q1_q2_2024.csv') {
      return (
        <div>
          <FileHeader name="summary_q1_q2_2024.csv" path="EXPORT" size="3.2 KB" modified={CANON.exportModified} badge="CSV" badgeColor="#22c55e" />
          <div style={{ overflowX: 'auto', marginTop: 10 }}>
            <table style={tableStyle}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                  {['Reference','Period','Reported Value','Category'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <DataRow cells={['LGR-102','Q1-2024', fmt(CANON.exportLgr102),'Environmental Compliance']} />
                <DataRow cells={['LGR-208','Q1-2024', fmt(CANON.exportLgr208),'Regulatory Assessment']} />
                <DataRow cells={['LGR-315','Q2-2024', fmt(CANON.exportLgr315),'Operational Review']} />
                <DataRow cells={['LGR-419','Q2-2024', fmt(CANON.exportLgr419),'Compliance Audit']} />
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <td colSpan={2} style={{...tdStyle, fontWeight: 700, color: '#94a3b8'}}>TOTAL</td>
                  <td style={{...tdStyle, fontWeight: 700, color: '#e2e8f0'}}>{fmt(CANON.exportTotal)}</td>
                  <td style={tdStyle} />
                </tr>
              </tbody>
            </table>
          </div>
          <div style={{ fontSize: 10, color: '#64748b', marginTop: 8 }}>
            Source: ARDENT_CORP_INTERNAL · Export version 1.4 · Generated 2024-09-15
          </div>
          {canCompare && !showCompare && (
            <CompareButton onClick={() => {
              soundEngine.playTap();
              setShowCompare(true);
              setPersist({ ...ps, comparisonDone: true });
            }} />
          )}
          {showCompare && <CompareView ps={ps} setPersist={setPersist} logEvidence={logEvidence} isLogged={isLogged} />}
        </div>
      );
    }

    if (selectedFile === 'entries_q1_raw.csv') {
      return (
        <div>
          <FileHeader name="entries_q1_raw.csv" path="ORIGINAL" size="2.9 KB" modified={CANON.origQ1Modified} badge="CSV" badgeColor="#22c55e" />
          <div style={{ overflowX: 'auto', marginTop: 10 }}>
            <table style={tableStyle}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                  {['Reference','Period','Source Value','Category','Verified'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <DataRow cells={['LGR-102','Q1-2024', fmt(CANON.origLgr102),'Environmental Compliance','Y']} highlight={0} />
                <DataRow cells={['LGR-208','Q1-2024', fmt(CANON.origLgr208),'Regulatory Assessment','Y']} />
              </tbody>
            </table>
          </div>
          <div style={{ fontSize: 10, color: '#64748b', marginTop: 8 }}>
            Source records — Q1 2024 only. Q2 entries in separate file (partially corrupted).
          </div>
          {canCompare && !showCompare && (
            <CompareButton onClick={() => {
              soundEngine.playTap();
              setShowCompare(true);
              setPersist({ ...ps, comparisonDone: true });
            }} />
          )}
          {showCompare && <CompareView ps={ps} setPersist={setPersist} logEvidence={logEvidence} isLogged={isLogged} />}
        </div>
      );
    }

    if (selectedFile === 'entries_q2_raw.csv') {
      return (
        <div>
          <FileHeader name="entries_q2_raw.csv" path="ORIGINAL" size="1.4 KB" modified={CANON.origQ2Modified} badge="PARTIAL" badgeColor="#f59e0b" />
          <div style={{ overflowX: 'auto', marginTop: 10 }}>
            <table style={tableStyle}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                  {['Reference','Period','Source Value','Category','Verified'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <DataRow cells={['LGR-315','Q2-2024', fmt(CANON.origLgr315),'Operational Review','P']} highlight={0} />
                <DataRow cells={['LGR-419','Q2-2024', fmt(CANON.origLgr419),'Compliance Audit','Y']} />
              </tbody>
            </table>
          </div>
          <div style={{
            marginTop: 10, padding: '8px 10px',
            background: 'rgba(146,64,14,0.1)', border: '1px solid rgba(146,64,14,0.2)', borderRadius: 5,
            fontSize: 10, color: '#92400e',
          }}>
            <strong>FILE INTEGRITY: DEGRADED</strong><br/>
            Remaining records corrupted — storage sector partially overwritten. Only 2 of an estimated 4–6 records are recoverable. P = verification pending at time of last save.
          </div>
        </div>
      );
    }

    if (selectedFile === 'consolidated_report.pdf') {
      return (
        <div>
          <FileHeader name="consolidated_report.pdf" path="EXPORT" size="184 KB" modified={CANON.pdfModified} badge="ENCRYPTED" badgeColor="#ef4444" />
          <div style={{
            marginTop: 12, padding: '18px',
            background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8,
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Lock size={20} style={{ color: '#ef4444', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#fca5a5', letterSpacing: '0.5px' }}>ACCESS DENIED</div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>File is encrypted. No decryption key available.</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              {[
                ['File name', 'consolidated_report.pdf'],
                ['Size', '184 KB (encrypted)'],
                ['Modified', CANON.pdfModified],
                ['Encryption', 'AES-256 · key not present on drive'],
                ['Checksum', 'B7D4…C209'],
                ['Contents', '[not readable without decryption key]'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: 12, fontSize: 10.5 }}>
                  <span style={{ color: '#64748b', minWidth: 90, flexShrink: 0 }}>{k}</span>
                  <span style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: 10 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          {!isLogged(V17_EVIDENCE_IDS.encrypted) && (
            <button onClick={() => logEvidence(V17_EVIDENCE_IDS.encrypted, 'Encrypted Report')} style={logBtnStyle}>
              <FileCheck size={13} /> LOG ENCRYPTED REPORT TO CASE
            </button>
          )}
          {isLogged(V17_EVIDENCE_IDS.encrypted) && <LoggedBadge label="Encrypted Report" />}
        </div>
      );
    }

    if (selectedFile === 'metadata.json') {
      const metaFields: [string, string][] = [
        ['drive_id', '"V-17"'],
        ['created', `"${CANON.driveCreated}"`],
        ['modified', `"${CANON.driveModified}"`],
        ['export_version', '"1.4"'],
        ['source', '"ARDENT_CORP_INTERNAL"'],
        ['checksum', '"A3F2…E91C"'],
        ['system_user', '"[REDACTED]"'],
        ['total_records', '4'],
        ['note', '"Compiled from internal ledger extracts"'],
      ];
      return (
        <div>
          <FileHeader name="metadata.json" path="EXPORT" size="0.8 KB" modified={CANON.driveModified} badge="JSON" badgeColor="#38bdf8" />
          <div style={{
            marginTop: 10, background: 'rgba(8,12,20,0.9)', border: '1px solid rgba(56,189,248,0.15)',
            borderRadius: 6, padding: '12px 14px', fontFamily: 'monospace', fontSize: 10.5,
          }}>
            <span style={{ color: '#64748b' }}>{`{`}</span>
            {metaFields.map(([k, v]) => (
              <div key={k} style={{ paddingLeft: 16, lineHeight: 1.7 }}>
                <span style={{ color: '#7dd3fc' }}>"{k}"</span>
                <span style={{ color: '#94a3b8' }}>: </span>
                <span style={{ color: v.startsWith('"[') ? '#ef4444' : v.startsWith('"') ? '#86efac' : '#fbbf24' }}>{v}</span>
                <span style={{ color: '#64748b' }}>,</span>
              </div>
            ))}
            <span style={{ color: '#64748b' }}>{`}`}</span>
          </div>
          <div style={{ marginTop: 8, fontSize: 10, color: '#64748b', lineHeight: 1.5 }}>
            <strong style={{ color: '#94a3b8' }}>Note:</strong> The <code>system_user</code> field is redacted. The <code>modified</code> timestamp ({CANON.driveModified}) places a write event at approximately 22:53 on Sep 8, 2026 — prior to the Central Station events.
          </div>
        </div>
      );
    }

    if (selectedFile === 'audit_flag_072.tmp') {
      return (
        <div>
          <FileHeader name="audit_flag_072.tmp" path="ORIGINAL/_DELETED" size="2.3 KB" modified={CANON.tmpModified} badge="METADATA ONLY" badgeColor="#94a3b8" />
          <div style={{
            marginTop: 10, padding: '12px 14px',
            background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 6,
          }}>
            <div style={{ fontSize: 9, color: '#64748b', letterSpacing: '1px', marginBottom: 8, fontFamily: 'monospace' }}>
              RECOVERY RESULT: METADATA ONLY — CONTENT UNRECOVERABLE
            </div>
            {[
              ['File name', 'audit_flag_072.tmp'],
              ['Created', CANON.tmpCreated],
              ['Modified', CANON.tmpModified],
              ['Size', '2.3 KB'],
              ['Content', '[storage sector overwritten — unrecoverable]'],
              ['Deletion timestamp', CANON.tmpModified],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', gap: 12, fontSize: 10.5, paddingBottom: 4 }}>
                <span style={{ color: '#64748b', minWidth: 120, flexShrink: 0 }}>{k}</span>
                <span style={{ color: v.includes('unrecoverable') ? '#ef444488' : '#94a3b8', fontFamily: 'monospace', fontSize: 10 }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8, fontSize: 10, color: '#64748b' }}>
            File existed between Sep 12 and Sep 14, 2024. Content cannot be reconstructed from available data.
          </div>
        </div>
      );
    }

    if (selectedFile === 'reconcile_note.txt') {
      const recovered = ps.fragmentRecovered;
      return (
        <div>
          <FileHeader name="reconcile_note.txt" path="ORIGINAL/_DELETED" size="0.4 KB" modified={CANON.tmpModified} badge="FRAGMENT" badgeColor="#a78bfa" />
          {!recovered ? (
            <div style={{ marginTop: 12 }}>
              <div style={{
                padding: '12px 14px', background: 'rgba(15,23,42,0.8)',
                border: '1px solid rgba(167,139,250,0.2)', borderRadius: 6,
                fontSize: 10.5, color: '#94a3b8', lineHeight: 1.6,
              }}>
                <div style={{ fontSize: 9, color: '#64748b', letterSpacing: '1px', marginBottom: 6, fontFamily: 'monospace' }}>
                  RECOVERY ANALYSIS: PARTIAL RECONSTRUCTION POSSIBLE
                </div>
                Deletion timestamp: {CANON.tmpModified}<br/>
                Estimated file integrity: 23%<br/>
                Status: fragment reconstruction available
              </div>
              <button
                onClick={() => {
                  soundEngine.playEvidenceLogged();
                  hapticEngine.medium();
                  setPersist({ ...ps, fragmentRecovered: true, inspectedFiles: ps.inspectedFiles.includes('reconcile_note.txt') ? ps.inspectedFiles : [...ps.inspectedFiles, 'reconcile_note.txt'] });
                  showToast('Fragment recovered');
                }}
                style={{
                  ...logBtnStyle,
                  background: 'linear-gradient(135deg, rgba(88,28,135,0.6), rgba(59,7,100,0.8))',
                  borderColor: 'rgba(167,139,250,0.4)',
                  color: '#e9d5ff',
                  marginTop: 10,
                }}
              >
                ⟳ ATTEMPT FRAGMENT RECOVERY
              </button>
            </div>
          ) : (
            <div style={{ marginTop: 12 }}>
              <div style={{
                padding: '12px 14px', background: 'rgba(15,23,42,0.85)',
                border: '1px solid rgba(167,139,250,0.25)', borderRadius: 6,
                fontFamily: 'monospace', fontSize: 10.5, lineHeight: 1.8,
              }}>
                <div style={{ fontSize: 9, color: '#a78bfa', letterSpacing: '1px', marginBottom: 8 }}>
                  RECOVERED — 23% FILE INTEGRITY
                </div>
                <div style={{ color: '#475569', fontSize: 10 }}>[ ██████████ corrupted — unrecoverable ]</div>
                <div style={{ color: '#e2e8f0', padding: '6px 0' }}>
                  "...values in generated export do not correspond to source entries..."
                </div>
                <div style={{ color: '#475569', fontSize: 10 }}>[ remaining 77% unrecoverable — storage sector overwritten ]</div>
              </div>
              <div style={{ marginTop: 8, fontSize: 10, color: '#64748b', lineHeight: 1.5 }}>
                Author unknown. Context and full content cannot be reconstructed. The recoverable fragment corroborates that a discrepancy between export and source data was noted by someone prior to deletion.
              </div>
              {!isLogged(V17_EVIDENCE_IDS.fragment) && (
                <button onClick={() => logEvidence(V17_EVIDENCE_IDS.fragment, 'Reconciliation Fragment')} style={{ ...logBtnStyle, marginTop: 10 }}>
                  <FileCheck size={13} /> LOG FRAGMENT TO CASE
                </button>
              )}
              {isLogged(V17_EVIDENCE_IDS.fragment) && <LoggedBadge label="Recovered Fragment" />}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  // ── Layout ────────────────────────────────────────────────────────────────
  const hasSelection = selectedFile !== null;
  const isRoot = currentPath.length === 0 && !hasSelection;
  const canGoBack = !isRoot;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 1,
      background: 'rgba(3, 4, 8, 0.98)',
      display: 'flex', flexDirection: 'column',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      color: '#e2e8f0', overflow: 'hidden',
    }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'absolute', top: 60, left: '50%', transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, #1d4e2e, #166534)',
          color: '#bbf7d0', padding: '7px 16px', borderRadius: 20,
          fontSize: 11, fontWeight: 700, zIndex: 10000,
          border: '1px solid rgba(187,247,208,0.3)', whiteSpace: 'nowrap',
          boxShadow: '0 4px 18px rgba(22,101,52,0.4)',
        }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <header style={{
        height: 52, flexShrink: 0,
        background: 'rgba(6, 8, 14, 0.97)',
        borderBottom: '1px solid rgba(148,163,184,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 14px', zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {canGoBack ? (
            <button onClick={goBack} style={backBtnStyle}>
              <ArrowLeft size={13} /> {hasSelection ? 'Files' : 'Up'}
            </button>
          ) : (
            <button onClick={onClose} style={backBtnStyle}>‹ Return</button>
          )}
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.4px' }}>
              V-17 FORENSIC FILESYSTEM
            </div>
            <div style={{ fontSize: 9.5, color: '#475569', fontFamily: 'monospace' }}>
              {hasSelection ? `${pathLabel} / ${selectedFile}` : pathLabel}
            </div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex' }}>
          <X size={17} />
        </button>
      </header>

      {/* Drive status strip */}
      <div style={{
        flexShrink: 0, padding: '5px 14px',
        background: 'rgba(8,12,20,0.9)', borderBottom: '1px solid rgba(148,163,184,0.08)',
        display: 'flex', alignItems: 'center', gap: 14, fontSize: 9.5, color: '#475569', fontFamily: 'monospace',
      }}>
        <span style={{ color: '#22c55e', fontWeight: 700 }}>● MOUNTED</span>
        <span>V17_DRIVE</span>
        <span>·</span>
        <span>Modified: {CANON.driveModified}</span>
        <span>·</span>
        <span style={{ color: '#94a3b8' }}>Filesystem readable · select files encrypted</span>
      </div>

      {/* Breadcrumb */}
      {!hasSelection && currentPath.length > 0 && (
        <div style={{
          flexShrink: 0, padding: '5px 14px',
          fontSize: 10, color: '#64748b', fontFamily: 'monospace',
          borderBottom: '1px solid rgba(148,163,184,0.06)',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <span style={{ cursor: 'pointer', color: '#38bdf8' }} onClick={() => { setCurrentPath([]); setSelectedFile(null); }}>V17_DRIVE</span>
          {currentPath.map((seg, i) => (
            <React.Fragment key={seg}>
              <ChevronRight size={10} />
              <span
                style={{ cursor: i < currentPath.length - 1 ? 'pointer' : 'default', color: i < currentPath.length - 1 ? '#38bdf8' : '#94a3b8' }}
                onClick={() => { if (i < currentPath.length - 1) setCurrentPath(currentPath.slice(0, i + 1)); }}
              >
                {seg}
              </span>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>
        {hasSelection ? renderFileContent() : renderFolderContents()}
      </div>
    </div>
  );
};

// ─── Compare view (separate component for clarity) ────────────────────────────
const CompareView: React.FC<{
  ps: V17PersistState;
  setPersist: (s: V17PersistState) => void;
  logEvidence: (eid: string, label: string) => void;
  isLogged: (eid: string) => boolean;
}> = ({ logEvidence, isLogged }) => {
  const rows: { ref: string; period: string; original: number; export_: number }[] = [
    { ref: 'LGR-102', period: 'Q1-2024', original: CANON.origLgr102, export_: CANON.exportLgr102 },
    { ref: 'LGR-208', period: 'Q1-2024', original: CANON.origLgr208, export_: CANON.exportLgr208 },
    { ref: 'LGR-315', period: 'Q2-2024', original: CANON.origLgr315, export_: CANON.exportLgr315 },
    { ref: 'LGR-419', period: 'Q2-2024', original: CANON.origLgr419, export_: CANON.exportLgr419 },
  ];

  return (
    <div style={{ marginTop: 14, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 12 }}>
      <div style={{ fontSize: 9, color: '#64748b', letterSpacing: '1px', fontFamily: 'monospace', marginBottom: 8 }}>
        DATASET COMPARISON — EXPORT vs ORIGINAL
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ ...tableStyle, width: '100%' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
              {['Reference','Period','Original','Export','Difference'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(r => {
              const diff = r.export_ - r.original;
              const mismatch = diff !== 0;
              const isQ2 = r.period === 'Q2-2024';
              return (
                <tr key={r.ref} style={{ background: mismatch ? 'rgba(239,68,68,0.06)' : 'transparent' }}>
                  <td style={{ ...tdStyle, fontFamily: 'monospace', fontWeight: mismatch ? 700 : 400 }}>{r.ref}</td>
                  <td style={{ ...tdStyle, color: '#64748b' }}>{r.period}</td>
                  <td style={{ ...tdStyle, color: '#86efac' }}>
                    {fmt(r.original)}{isQ2 && <span style={{ color: '#f59e0b', fontSize: 8, marginLeft: 3 }}>*</span>}
                  </td>
                  <td style={tdStyle}>{fmt(r.export_)}</td>
                  <td style={{
                    ...tdStyle, fontWeight: 700, fontFamily: 'monospace',
                    color: mismatch ? '#fca5a5' : '#22c55e',
                  }}>
                    {mismatch ? fmt(diff) : '—'}
                    {mismatch && <span style={{ fontSize: 9, fontWeight: 400, marginLeft: 4, background: 'rgba(239,68,68,0.15)', padding: '1px 4px', borderRadius: 3, color: '#fca5a5' }}>MISMATCH</span>}
                  </td>
                </tr>
              );
            })}
            <tr style={{ borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }}>
              <td colSpan={2} style={{ ...tdStyle, fontWeight: 700, color: '#94a3b8' }}>TOTALS</td>
              <td style={{ ...tdStyle, color: '#86efac', fontWeight: 700 }}>{fmt(CANON.origTotal)}</td>
              <td style={{ ...tdStyle, fontWeight: 700 }}>{fmt(CANON.exportTotal)}</td>
              <td style={{ ...tdStyle, fontWeight: 700, color: '#fca5a5', fontFamily: 'monospace' }}>
                {fmt(CANON.exportTotal - CANON.origTotal)}
                <span style={{ fontSize: 9, marginLeft: 4, background: 'rgba(239,68,68,0.15)', padding: '1px 4px', borderRadius: 3 }}>MISMATCH</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 6, fontSize: 9.5, color: '#64748b', lineHeight: 1.5 }}>
        * Q2 source data is partially corrupted. LGR-315 and LGR-419 values are from degraded records — treat with caution.
      </div>
      <div style={{
        marginTop: 10, padding: '8px 10px',
        background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(148,163,184,0.12)', borderRadius: 5,
        fontSize: 10.5, color: '#94a3b8', lineHeight: 1.5,
      }}>
        <strong style={{ color: '#e2e8f0' }}>DATA MISMATCH</strong><br/>
        The figures in the EXPORT dataset do not match corresponding values in the ORIGINAL source records. No determination of cause, intent, or responsible party can be made from this comparison alone.
      </div>
      {!isLogged(V17_EVIDENCE_IDS.mismatch) && (
        <button onClick={() => logEvidence(V17_EVIDENCE_IDS.mismatch, 'Data Mismatch')} style={{ ...logBtnStyle, marginTop: 10 }}>
          <FileCheck size={13} /> LOG DATA MISMATCH TO CASE
        </button>
      )}
      {isLogged(V17_EVIDENCE_IDS.mismatch) && <LoggedBadge label="Data Mismatch" />}
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const FolderRow: React.FC<{ name: string; onClick: () => void; note?: string; warn?: boolean }> = ({ name, onClick, note, warn }) => (
  <button onClick={onClick} style={{
    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
    background: 'rgba(255,255,255,0.03)', border: `1px solid ${warn ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.07)'}`,
    borderRadius: 7, padding: '9px 12px', cursor: 'pointer', textAlign: 'left',
  }}>
    <span style={{ fontSize: 14, lineHeight: 1 }}>📁</span>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: warn ? '#f59e0b' : '#e2e8f0', fontFamily: 'monospace' }}>{name}/</div>
      {note && <div style={{ fontSize: 10, color: '#64748b', marginTop: 1 }}>{note}</div>}
    </div>
    <ChevronRight size={14} style={{ color: '#475569', flexShrink: 0 }} />
  </button>
);

const FileRow: React.FC<{
  id: string; label: string; size: string; badge: string; badgeColor: string;
  modified: string; inspected: boolean; onClick: () => void;
}> = ({ label, size, badge, badgeColor, modified, inspected, onClick }) => (
  <button onClick={onClick} style={{
    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
    background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 7, padding: '9px 12px', cursor: 'pointer', textAlign: 'left',
  }}>
    <FileText size={16} style={{ color: '#64748b', flexShrink: 0 }} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 11.5, fontWeight: 500, color: '#e2e8f0', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</div>
      <div style={{ fontSize: 9.5, color: '#475569', marginTop: 1 }}>{size} · {modified.slice(0, 10)}</div>
    </div>
    <span style={{
      fontSize: 8, fontWeight: 700, padding: '2px 5px', borderRadius: 3, flexShrink: 0,
      background: `${badgeColor}22`, border: `1px solid ${badgeColor}55`, color: badgeColor,
    }}>{badge}</span>
    {inspected && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />}
  </button>
);

const FileHeader: React.FC<{ name: string; path: string; size: string; modified: string; badge: string; badgeColor: string }> = ({
  name, path, size, modified, badge, badgeColor,
}) => (
  <div style={{ paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
      <div>
        <div style={{ fontSize: 9, color: '#64748b', letterSpacing: '1px', fontFamily: 'monospace', marginBottom: 2 }}>
          V17_DRIVE / {path}
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', fontFamily: 'monospace' }}>{name}</div>
      </div>
      <span style={{
        fontSize: 8.5, fontWeight: 700, padding: '3px 7px', borderRadius: 4, flexShrink: 0, marginTop: 2,
        background: `${badgeColor}22`, border: `1px solid ${badgeColor}55`, color: badgeColor,
      }}>{badge}</span>
    </div>
    <div style={{ fontSize: 9.5, color: '#475569', marginTop: 5, fontFamily: 'monospace' }}>
      {size} · Modified: {modified}
    </div>
  </div>
);

const DataRow: React.FC<{ cells: string[]; highlight?: number }> = ({ cells, highlight }) => (
  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
    {cells.map((c, i) => (
      <td key={i} style={{
        ...tdStyle,
        color: i === highlight ? '#fcd34d' : i === 2 ? '#e2e8f0' : '#94a3b8',
        fontFamily: i === 0 || i === 2 ? 'monospace' : 'inherit',
        fontWeight: i === 0 || i === highlight ? 600 : 400,
      }}>{c}</td>
    ))}
  </tr>
);

const CompareButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button onClick={onClick} style={{
    marginTop: 12, display: 'flex', alignItems: 'center', gap: 6,
    background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.25)',
    color: '#38bdf8', borderRadius: 6, padding: '7px 14px',
    fontSize: 11, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.3px',
  }}>
    ⇆ COMPARE WITH ORIGINAL ENTRIES
  </button>
);

const LoggedBadge: React.FC<{ label: string }> = ({ label }) => (
  <div style={{
    marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 5,
    background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
    color: '#86efac', padding: '5px 12px', borderRadius: 6, fontSize: 10, fontWeight: 700,
  }}>
    <Check size={12} /> {label} — LOGGED TO CASE
  </div>
);

// ─── Shared styles ────────────────────────────────────────────────────────────
const backBtnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
  color: '#94a3b8', borderRadius: 6, padding: '5px 10px',
  fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
};

const logBtnStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 6,
  background: 'linear-gradient(135deg, #1d4ed8, #1e40af)',
  border: '1px solid #3b82f6', color: '#fff',
  padding: '7px 14px', borderRadius: 6,
  fontSize: 11, fontWeight: 700, cursor: 'pointer',
  boxShadow: '0 2px 10px rgba(59,130,246,0.3)',
};

const tableStyle: React.CSSProperties = {
  width: '100%', borderCollapse: 'collapse', fontSize: 10.5,
};

const thStyle: React.CSSProperties = {
  textAlign: 'left', padding: '5px 8px', fontSize: 9.5,
  color: '#64748b', fontWeight: 700, letterSpacing: '0.5px',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
};

const tdStyle: React.CSSProperties = {
  padding: '6px 8px', color: '#94a3b8',
  borderBottom: '1px solid rgba(255,255,255,0.04)',
};
