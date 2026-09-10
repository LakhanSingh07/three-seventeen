import { useEffect, useLayoutEffect, useRef, useState, useMemo } from 'react';
import type { CaseData, CaseSaveState, Deduction } from '../cases/types';
import { CaseEngine } from '../cases/case-engine';
import { soundEngine } from '../system/SoundEngine';
import { hapticEngine } from '../system/HapticEngine';
import { environmentAssets, caseContentAssets } from './assetRegistry';
import { ProductionArt } from './ProductionArt';
import { BoardPin } from './BoardPin';
import { BoardConnectionLayer } from './BoardConnectionLayer';

interface Props {
  caseData: CaseData;
  saveState: CaseSaveState;
  onUnlockDeduction: (d: Deduction) => void;
  onBackToRoom: () => void;
  onOpenReport: () => void;
  onOpenCctv?: () => void;
  onOpenLocker28?: () => void;
  onOpenV17?: () => void;
  isActive: boolean;
}

interface EvidenceGroupDef {
  id: string;
  leftClueId: string;
  rightClueId: string;
  extraClueIds?: string[];
  deductionId?: string;
  deductionBrief?: string[];
  deductionLead?: string;
}

const EVIDENCE_GROUPS: EvidenceGroupDef[] = [
  // 1. Sarah's Notes & Data Discrepancies (Ryan & Corporate Audit Cluster)
  {
    id: 'grp_sarah_memos_1',
    leftClueId: 'EVD_VOICE_MEMO_SAR_VM_001',
    rightClueId: 'EVD_VOICE_MEMO_SAR_VM_002',
    extraClueIds: ['EVD_MSG_RYAN_WARNING', 'EVD_MSG_RYAN_THREAT'],
  },
  {
    id: 'grp_ryan_warning',
    leftClueId: 'EVID-RYAN-VM-001',
    rightClueId: 'EVD_VOICE_MEMO_SAR_VM_002',
    extraClueIds: ['EVD_MSG_RYAN_THREAT', 'EVD_VOICE_MEMO_SAR_VM_003'],
    deductionId: 'DED_RYAN_KNEW_DISCREPANCIES',
    deductionBrief: [
      'Sarah notes data discrepancies',
      'Ryan: "Leave it... don\'t open audit folder"',
    ],
    deductionLead: 'Ryan knew about data discrepancies.',
  },
  {
    id: 'grp_sarah_memos_2',
    leftClueId: 'EVD_VOICE_MEMO_SAR_VM_003',
    rightClueId: 'EVD_VOICE_MEMO_SAR_VM_004',
    extraClueIds: ['EVD_NOTE_PROJECT_VANGUARD', 'EVD_NOTE_VANGUARD'],
  },
  // Daniel Intercom & Corporate Monitoring Cluster
  {
    id: 'grp_daniel_intercom',
    leftClueId: 'EVID-DANIEL-INT-001',
    rightClueId: 'EVID-RYAN-VM-001',
    extraClueIds: ['EVD_MSG_DANIEL_RENDEZVOUS', 'EVD_VOICE_MEMO_SAR_VM_003'],
    deductionId: 'DED_DIGITAL_ACTIVITY_WATCHED',
    deductionBrief: [
      'Daniel: "The system\'s logging everything tonight"',
      'Ryan: "Don\'t send anything on Teams or email"',
    ],
    deductionLead: 'Both warned company systems were unsafe.',
  },
  {
    id: 'grp_daniel_avoiding_log',
    leftClueId: 'EVID-DANIEL-INT-001',
    rightClueId: 'EVD_VOICE_MEMO_SAR_VM_003',
    extraClueIds: ['EVD_MSG_DANIEL_RENDEZVOUS'],
    deductionId: 'DED_AVOIDING_THE_LOG',
    deductionBrief: [
      'Daniel: "Take service stairs... don\'t use card"',
      'Sarah unauthorized access log concern',
    ],
    deductionLead: 'Sarah avoided generating digital access pings.',
  },
  {
    id: 'grp_daniel_cctv_route',
    leftClueId: 'EVID-DANIEL-INT-001',
    rightClueId: 'EVID-CCTV-ARDENT-001',
    extraClueIds: ['EVD_MSG_DANIEL_RENDEZVOUS', 'EVID-RYAN-VM-001'],
    deductionId: 'DED_SARAH_FOLLOWED_DANIELS_ROUTE',
    deductionBrief: [
      'Daniel: "Take the service stairs"',
      'CCTV: Sarah enters service corridor',
    ],
    deductionLead: "Sarah followed Daniel's suggested service route.",
  },
  // 2. Alex Alibi Contradiction
  {
    id: 'grp_alex_alibi',
    leftClueId: 'EVD_MSG_ALEX_HOME',
    rightClueId: 'EVD_MAP_ALEX_STATION',
    extraClueIds: ['EVD_CALL_ALEX_VOICEMAIL'],
    deductionId: 'DED_ALEX_ALIBI',
    deductionBrief: ['02:38 — Claims home in bed', '02:47 — Device at Central Station'],
    deductionLead: 'Why was Alex following Sarah?',
  },
  // 3. Station Locker 28 & Concourse
  {
    id: 'grp_locker_operation',
    leftClueId: 'EVD_NOTE_LOCKER28',
    rightClueId: 'EVD_PHOTO_EXIF_STATION',
    extraClueIds: ['EVD_PHOTO_REFLECTION', 'EVID-REC-STATION-001'],
    deductionId: 'DED_LOCKER_OPERATION',
    deductionBrief: ['02:58 — Inside Central Station', 'Locker 28 passcode: 8-3-1-7'],
    deductionLead: 'Archive deposited before pursuit.',
  },
  // 4. Station Accidental Recording & Continued Surveillance (SAR-VM-005 + REC-STATION-001)
  {
    id: 'grp_station_recording',
    leftClueId: 'EVID-REC-STATION-001',
    rightClueId: 'EVD_VOICE_MEMO_SAR_VM_005',
    deductionId: 'DED_POSSIBLE_CONTINUED_SURVEILLANCE',
    deductionBrief: [
      '02:45 — Sarah reports being followed',
      '02:59 — Additional footsteps near Locker 28',
    ],
    deductionLead: 'Sarah may have been actively surveilled at the station.',
  },
  // 5. 03:17 Call & Extortion
  {
    id: 'grp_blackmail',
    leftClueId: 'EVD_CALL_317',
    rightClueId: 'EVD_MSG_UNKNOWN_EXTORTION',
    deductionId: 'DED_THE_BLACKMAIL_THREAT',
    deductionBrief: ['02:15 — Extortion demand received', '03:17 — 42-sec connection from Unknown'],
    deductionLead: 'Target tracked in real time.',
  },
  // 6. The Interrupted Call / Maya Voicemail
  {
    id: 'grp_maya_voicemail',
    leftClueId: 'EVD_VOICE_MEMO_SAR_VM_005',
    rightClueId: 'EVD_CALL_MAYA_230',
    extraClueIds: ['EVD_MSG_MAYA_WARNING'],
    deductionId: 'DED_EXPECTED_CALL_NEVER_CAME',
    deductionBrief: ['02:45 — Sarah plans to call Maya', 'Voicemail — Maya waiting for call'],
    deductionLead: 'Expected call never arrived.',
  },
  // 7. Riverside Pursuit & Telemetry
  {
    id: 'grp_riverside_pursuit',
    leftClueId: 'EVD_VOICE_MEMO_317',
    rightClueId: 'EVD_MAP_RIVERSIDE_PING',
    extraClueIds: ['EVD_MSG_DANIEL_RENDEZVOUS'],
    deductionId: 'DED_THE_RIVERSIDE_PURSUIT',
    deductionBrief: ['03:20 — Black sedan tailing Sarah', '03:24 — Final GPS ping at Riverside'],
    deductionLead: 'Vehicle intercepted before pickup.',
  },
  // 8. Locker 28 — Physical Evidence Cluster
  {
    id: 'grp_locker28_reached',
    leftClueId: 'EVID-REC-STATION-001',
    rightClueId: 'EVID-LOCKER28-001',
    extraClueIds: ['EVD_PHOTO_EXIF_STATION'],
    deductionId: 'DED_LOCKER28_SARAH_REACHED_IT',
    deductionBrief: ['02:59 — "Twenty-eight…" on recording', 'Physical evidence recovered from Locker 28'],
    deductionLead: 'Sarah physically reached and opened Locker 28.',
  },
  {
    id: 'grp_caller_knew',
    leftClueId: 'EVD_CALL_317',
    rightClueId: 'EVID-LOCKER28-001',
    extraClueIds: ['EVID-REC-STATION-001'],
    deductionId: 'DED_CALLER_KNEW_LOCKER',
    deductionBrief: ['"Locker twenty-eight. You opened it."', 'Caller had real-time knowledge of her location'],
    deductionLead: 'How did the caller know?',
  },
  {
    id: 'grp_locker28_audit_ryan',
    leftClueId: 'EVID-RYAN-VM-001',
    rightClueId: 'EVID-LOCKER28-AUDIT',
    extraClueIds: ['EVD_VOICE_MEMO_SAR_VM_002'],
    deductionId: 'DED_RYAN_KNEW_AUDIT',
    deductionBrief: ['Ryan: "Don\'t open the audit folder"', 'Redacted audit confirms real variances'],
    deductionLead: 'Ryan knew what Sarah had found.',
  },
  {
    id: 'grp_locker28_discrepancies',
    leftClueId: 'EVID-LOCKER28-AUDIT',
    rightClueId: 'EVD_VOICE_MEMO_SAR_VM_002',
    extraClueIds: ['EVID-LOCKER28-NOTE'],
    deductionId: 'DED_DISCREPANCIES_WERE_REAL',
    deductionBrief: ['Sarah: "They don\'t match"', 'Audit records unexplained variances'],
    deductionLead: 'The numbers Sarah found were real.',
  },
  {
    id: 'grp_original_entries',
    leftClueId: 'EVID-LOCKER28-NOTE',
    rightClueId: 'EVID-LOCKER28-AUDIT',
    extraClueIds: [],
    deductionId: 'DED_ORIGINAL_ENTRIES_LEAD',
    deductionBrief: ['"Check the original entries. Not the export."', 'Audit shows variances vs verified amounts'],
    deductionLead: 'The export may differ from the source data.',
  },
  {
    id: 'grp_card_447',
    leftClueId: 'EVID-LOCKER28-CARD',
    rightClueId: 'EVID-DANIEL-INT-001',
    extraClueIds: ['EVID-CCTV-ARDENT-001'],
    deductionId: 'DED_CARD_447_ARDENT',
    deductionBrief: ['Broken card: ARDENT CORP / …447…', 'Daniel referenced Ardent Floor 14 access systems'],
    deductionLead: 'Identify Card 447.',
  },
  {
    id: 'grp_locker28_central',
    leftClueId: 'EVID-REC-STATION-001',
    rightClueId: 'EVID-LOCKER28-AUDIT',
    extraClueIds: ['EVD_CALL_317', 'EVID-LOCKER28-USB'],
    deductionId: 'DED_LOCKER28_WAS_CENTRAL',
    deductionBrief: ['Sarah reached Locker 28', 'Caller confirmed knowledge of it at 03:17'],
    deductionLead: 'Locker 28 was the pivot point of the night.',
  },
  // 9. V-17 Forensic Filesystem Connections
  {
    id: 'grp_export_not_source_of_truth',
    leftClueId: 'EVID-LOCKER28-NOTE',
    rightClueId: 'EVID-V17-DATA-MISMATCH',
    extraClueIds: ['EVID-LOCKER28-AUDIT', 'EVID-LOCKER28-USB'],
    deductionId: 'DED_EXPORT_NOT_SOURCE_OF_TRUTH',
    deductionBrief: ['Locker 28 Note: "Check original entries. Not export."', 'V-17 Comparison: Original and export figures disagree'],
    deductionLead: 'The export was altered — original figures disagree.',
  },
  {
    id: 'grp_ryan_data_sensitive',
    leftClueId: 'EVID-RYAN-VM-001',
    rightClueId: 'EVID-V17-DATA-MISMATCH',
    extraClueIds: ['EVID-LOCKER28-AUDIT'],
    deductionId: 'DED_RYAN_DATA_SENSITIVE',
    deductionBrief: ['Ryan warned Sarah off the audit folder', 'V-17 reveals data mismatch between original & export'],
    deductionLead: 'Ryan knew the numbers were sensitive.',
  },
  {
    id: 'grp_internal_flag_discrepancy',
    leftClueId: 'EVID-V17-RECOVERED-FRAGMENT',
    rightClueId: 'EVID-LOCKER28-AUDIT',
    extraClueIds: ['EVID-V17-DATA-MISMATCH'],
    deductionId: 'DED_INTERNAL_FLAG_DISCREPANCY',
    deductionBrief: ['Recovered fragment: values in export do not correspond', 'Physical audit records unverified discrepancies'],
    deductionLead: 'Discrepancy was identified and flagged before deletion.',
  },
];

export function EvidenceBoardScene({
  caseData,
  saveState,
  onUnlockDeduction,
  onBackToRoom,
  onOpenCctv,
  onOpenLocker28,
  onOpenV17,
  isActive,
}: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ text: string; success: boolean } | null>(null);
  const [inspectedDeduction, setInspectedDeduction] = useState<Deduction | null>(null);
  const [zoom, setZoom] = useState(1);
  const boardRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 360, height: 680 });

  const discoveredEvidence = useMemo(
    () => caseData.evidenceList.filter((e) => saveState.discoveredEvidenceIds.includes(e.id)),
    [caseData.evidenceList, saveState.discoveredEvidenceIds]
  );

  const unlockedDeductions = useMemo(
    () => caseData.deductions.filter((d) => saveState.unlockedDeductionIds.includes(d.id)),
    [caseData.deductions, saveState.unlockedDeductionIds]
  );

  // Dynamically compute compact, organic board coordinates based on active evidence
  const { evidenceLayout, deductionLayout, maxContentY } = useMemo(() => {
    const evLayout: Record<string, { xPct: number; yPx: number; rot: number }> = {};
    const dedLayout: Record<
      string,
      { xPct: number; yPx: number; rot: number; brief: string[]; lead: string }
    > = {};

    let currentY = 175;

    // Filter to only groups that have at least one discovered clue
    const activeGroups = EVIDENCE_GROUPS.filter((grp) => {
      const allIds = [grp.leftClueId, grp.rightClueId, ...(grp.extraClueIds || [])];
      return allIds.some((id) => saveState.discoveredEvidenceIds.includes(id));
    });

    if (activeGroups.length === 0) {
      return { evidenceLayout: evLayout, deductionLayout: dedLayout, maxContentY: 660 };
    }

    for (const grp of activeGroups) {
      const rowY = currentY;
      let hasClueInRow = false;

      // Left clue slot
      if (saveState.discoveredEvidenceIds.includes(grp.leftClueId)) {
        evLayout[grp.leftClueId] = { xPct: 6, yPx: rowY, rot: -1.8 };
        hasClueInRow = true;
      }

      // Right clue slot
      if (saveState.discoveredEvidenceIds.includes(grp.rightClueId)) {
        evLayout[grp.rightClueId] = { xPct: 53, yPx: rowY, rot: 1.9 };
        hasClueInRow = true;
      }

      // Additional secondary/supplementary clues in this group
      const extraFound = (grp.extraClueIds || []).filter((id) =>
        saveState.discoveredEvidenceIds.includes(id)
      );
      for (const extraId of extraFound) {
        if (!evLayout[grp.leftClueId]) {
          evLayout[extraId] = { xPct: 6, yPx: rowY, rot: -1.4 };
          hasClueInRow = true;
        } else if (!evLayout[grp.rightClueId]) {
          evLayout[extraId] = { xPct: 53, yPx: rowY, rot: 1.6 };
          hasClueInRow = true;
        } else {
          currentY += 135;
          evLayout[extraId] = { xPct: 30, yPx: currentY, rot: 1.2 };
          hasClueInRow = true;
        }
      }

      // Deduction card placement if unlocked
      const isDedUnlocked =
        grp.deductionId && saveState.unlockedDeductionIds.includes(grp.deductionId);
      if (isDedUnlocked && grp.deductionId) {
        currentY += 120;
        dedLayout[grp.deductionId] = {
          xPct: 20,
          yPx: currentY,
          rot: 0.6,
          brief: grp.deductionBrief || [],
          lead: grp.deductionLead || '',
        };
        currentY += 100;
      } else if (hasClueInRow) {
        currentY += 135;
      }
    }

    // Safety fallback for any uncategorized discovered clue
    for (const eId of saveState.discoveredEvidenceIds) {
      if (!evLayout[eId]) {
        evLayout[eId] = { xPct: 28, yPx: currentY, rot: 0.8 };
        currentY += 135;
      }
    }

    // Natural compact height: comfortably fits without excessive scrolling
    const finalHeight = Math.max(660, currentY + 30);

    return {
      evidenceLayout: evLayout,
      deductionLayout: dedLayout,
      maxContentY: finalHeight,
    };
  }, [saveState.discoveredEvidenceIds, saveState.unlockedDeductionIds]);

  // Pushpin anchors for connection threads
  const anchors = useMemo(() => {
    return Object.fromEntries(
      discoveredEvidence.map((e) => {
        const layout = evidenceLayout[e.id] || { xPct: 20, yPx: 250 };
        return [
          e.id,
          {
            x: ((layout.xPct + 18) / 100) * size.width,
            y: layout.yPx + 14,
          },
        ];
      })
    );
  }, [discoveredEvidence, evidenceLayout, size.width]);

  useLayoutEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const update = () => setSize({ width: el.clientWidth, height: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isActive, zoom, maxContentY]);

  useEffect(() => {
    if (!feedback) return;
    const id = setTimeout(() => setFeedback(null), feedback.success ? 7000 : 2500);
    return () => clearTimeout(id);
  }, [feedback]);

  const tap = (id: string) => {
    setFeedback(null);
    setInspectedDeduction(null);
    soundEngine.playPinCorkboard();
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s.slice(-1), id]));
  };

  const connect = () => {
    if (selected.length !== 2) return;
    const result = CaseEngine.tryConnectEvidence(
      caseData,
      selected[0],
      selected[1],
      saveState.unlockedDeductionIds
    );

    if (result.success && result.deduction) {
      onUnlockDeduction(result.deduction);
      hapticEngine.deduction();
      soundEngine.playDeductionSuccess();
      setFeedback({
        success: true,
        text: `DEDUCTION CONFIRMED: ${result.deduction.title} — ${result.deduction.insight}`,
      });
    } else {
      hapticEngine.medium();
      soundEngine.playTap();
      setFeedback({
        success: false,
        text: 'These pieces of evidence do not reveal a direct contradiction yet.',
      });
    }
    setSelected([]);
  };

  const inspectedEvidence = caseData.evidenceList.find((e) => e.id === selected.at(-1));

  // Midpoint for the CONNECT button when 2 clues are selected
  const midpoint = useMemo(() => {
    if (selected.length !== 2) return null;
    const a = anchors[selected[0]];
    const b = anchors[selected[1]];
    if (!a || !b) return null;
    return {
      x: (a.x + b.x) / 2,
      y: (a.y + b.y) / 2 + 35,
    };
  }, [selected, anchors]);

  return (
    <div
      className="board-closeup"
      style={{ backgroundImage: `url(${environmentAssets.room.background.real})` }}
    >
      {/* Back button */}
      <button className="scene-back" onClick={onBackToRoom} aria-label="Back to desk">
        ‹ Desk
      </button>

      {/* Board Zoom Controls */}
      <div className="board-zoom">
        <button aria-label="Zoom out board" onClick={() => setZoom((z) => Math.max(1, z - 0.25))}>
          −
        </button>
        <button aria-label="Zoom in board" onClick={() => setZoom((z) => Math.min(2, z + 0.25))}>
          +
        </button>
      </div>

      {/* Scrollable corkboard container */}
      <div className="board-scroll">
        <div
          ref={boardRef}
          className="board-world"
          style={{ width: `${zoom * 100}%`, height: maxContentY * zoom }}
        >
          {/* Corkboard Base Plate */}
          <div className="board-base">
            <ProductionArt asset={environmentAssets.board.base} />
          </div>

          {/* EARLY DRESSING: CASE 001 confidential heading tape (Top Left) */}
          <div className="board-case-header">
            <span className="case-strip">CASE 001 · MEHTA, SARAH</span>
            <span className="case-class-stamp">PRIORITY: HIGH</span>
          </div>

          {/* CENTRAL ANCHOR: Sarah Mehta Polaroid with Red Tack */}
          <div className="board-sarah physical-polaroid">
            <img src={caseContentAssets.sarahProfile} alt="Sarah Mehta" />
            <span>Sarah Mehta · Missing</span>
            <i className="photo-tack" aria-hidden="true" />
          </div>

          {/* EARLY DRESSING: "03:17 ?" sticky note (Top Right) */}
          <div className="board-time-note">
            <ProductionArt asset={environmentAssets.board_pin_frames.stickyNote} />
            <span>03:17 ?</span>
            <i className="pin-head" aria-hidden="true" />
          </div>

          {/* EARLY DRESSING: Timeline reference strip */}
          <div className="board-timeline-dressing">
            <span className="timeline-title">TIMELINE MARKERS</span>
            <div className="timeline-ticks">
              <span>23:00</span>
              <span>01:30</span>
              <span>02:45</span>
              <span className="marker-critical">03:17</span>
              <span>03:30</span>
            </div>
          </div>

          {/* NON-SPOILER: Blank evidence outline sleeves (shown when no clues are discovered yet) */}
          {discoveredEvidence.length === 0 && (
            <>
              <div className="empty-pin-sleeve sleeve-1">
                <span>[ LEAD #1 ]</span>
              </div>
              <div className="empty-pin-sleeve sleeve-2">
                <span>[ LOG #2 ]</span>
              </div>
            </>
          )}

          {/* Dynamic Physical Red Connection Threads Layer */}
          <BoardConnectionLayer
            unlockedDeductions={unlockedDeductions}
            anchors={anchors}
            width={size.width}
            height={size.height}
          />

          {/* Evidence Pins placed with controlled organic imperfection */}
          {discoveredEvidence.map((e) => {
            const layout = evidenceLayout[e.id] || { xPct: 20, yPx: 250, rot: 0 };
            return (
              <BoardPin
                key={e.id}
                evidence={e}
                caseData={caseData}
                xPct={layout.xPct}
                yPx={layout.yPx * zoom}
                rotationDeg={layout.rot}
                isSelected={selected.includes(e.id)}
                onTap={tap}
                registerAnchor={() => {}}
              />
            );
          })}

          {/* CONNECT Button floating between 2 selected evidence pins */}
          {midpoint && (
            <button
              className="connect-evidence"
              onClick={connect}
              style={{ left: midpoint.x, top: midpoint.y }}
            >
              CONNECT PINS ↗
            </button>
          )}

          {/* INSPECT CCTV BUTTON when CCTV contact sheet is selected */}
          {selected.length === 1 && selected[0] === 'EVID-CCTV-ARDENT-001' && onOpenCctv && (
            <button
              className="connect-evidence"
              onClick={onOpenCctv}
              style={{
                left: '50%',
                top: `${((evidenceLayout['EVID-CCTV-ARDENT-001']?.yPx ?? 250) * zoom) + 130}px`,
                transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                borderColor: '#38bdf8',
                letterSpacing: '0.5px',
              }}
            >
              ▶ INSPECT CCTV FOOTAGE
            </button>
          )}

          {/* INSPECT LOCKER 28 BUTTON when any Locker 28 evidence is selected */}
          {selected.length === 1 &&
            ['EVID-LOCKER28-001','EVID-LOCKER28-USB','EVID-LOCKER28-AUDIT','EVID-LOCKER28-NOTE','EVID-LOCKER28-CARD'].includes(selected[0]) &&
            onOpenLocker28 && (
            <button
              className="connect-evidence"
              onClick={onOpenLocker28}
              style={{
                left: '50%',
                top: `${((evidenceLayout[selected[0]]?.yPx ?? 280) * zoom) + 130}px`,
                transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg, #92400e, #78350f)',
                borderColor: '#f59e0b',
                letterSpacing: '0.5px',
                color: '#fef3c7',
              }}
            >
              🔍 INSPECT LOCKER 28
            </button>
          )}

          {/* BROWSE V-17 FILESYSTEM BUTTON when any V-17 evidence is selected */}
          {selected.length === 1 &&
            ['EVID-LOCKER28-USB', 'EVID-V17-DATA-MISMATCH', 'EVID-V17-RECOVERED-FRAGMENT', 'EVID-V17-ENCRYPTED-REPORT'].includes(selected[0]) &&
            onOpenV17 && (
            <button
              className="connect-evidence"
              onClick={onOpenV17}
              style={{
                left: '50%',
                top: `${((evidenceLayout[selected[0]]?.yPx ?? 280) * zoom) + (['EVID-LOCKER28-001','EVID-LOCKER28-USB','EVID-LOCKER28-AUDIT','EVID-LOCKER28-NOTE','EVID-LOCKER28-CARD'].includes(selected[0]) ? 175 : 130)}px`,
                transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                borderColor: '#38bdf8',
                letterSpacing: '0.5px',
                color: '#e0f2fe',
              }}
            >
              📂 BROWSE V-17 FILESYSTEM
            </button>
          )}

          {/* PHYSICAL DEDUCTION NOTES: Pinned / taped cards on the board */}
          {unlockedDeductions.map((d) => {
            const layout = deductionLayout[d.id] || {
              xPct: 15,
              yPx: 400,
              rot: -1,
              brief: [],
              lead: '',
            };
            return (
              <div
                key={d.id}
                className="physical-deduction-card"
                onClick={() => {
                  soundEngine.playPaperRustle();
                  setInspectedDeduction(d);
                }}
                style={{
                  left: `${layout.xPct}%`,
                  top: `${layout.yPx * zoom}px`,
                  transform: `rotate(${layout.rot}deg)`,
                  zIndex: 8,
                }}
              >
                <div className="card-tape" aria-hidden="true" />
                <div className="deduction-content">
                  <span className="deduction-tag">DEDUCTION VERIFIED</span>
                  <h4 className="deduction-title">{d.title}</h4>
                  <ul className="deduction-points">
                    {layout.brief.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                  {layout.lead && <p className="deduction-lead">"{layout.lead}"</p>}
                </div>
                <i className="deduction-pin" aria-hidden="true" />
              </div>
            );
          })}
        </div>
      </div>

      {/* INSPECTION DRAWER: Physical paper sheet for details & connection actions */}
      {(inspectedEvidence || inspectedDeduction || feedback) && (
        <aside
          className="evidence-inspection"
          role="status"
          style={{ backgroundImage: `url(${environmentAssets.clutter.paperSingle.real})` }}
        >
          {feedback ? (
            <div className={`feedback-block ${feedback.success ? 'success' : 'hint'}`}>
              <p>{feedback.text}</p>
            </div>
          ) : inspectedDeduction ? (
            <div className="deduction-inspect-sheet">
              <small>CASE 001 · CONFIRMED DEDUCTION</small>
              <h3>{inspectedDeduction.title}</h3>
              <p className="contradiction-type">{inspectedDeduction.contradictionType}</p>
              <p className="insight-body">{inspectedDeduction.insight}</p>
              {inspectedDeduction.unlockedQuestion && (
                <p className="question-body">Lead: {inspectedDeduction.unlockedQuestion}</p>
              )}
              <button
                className="paper-action"
                style={{ float: 'right' }}
                onClick={() => setInspectedDeduction(null)}
              >
                Put down
              </button>
            </div>
          ) : inspectedEvidence ? (
            <div className="evidence-inspect-sheet">
              <small>
                {inspectedEvidence.sourceApp} · {inspectedEvidence.timestamp}
              </small>
              <h3>{inspectedEvidence.title}</h3>
              <p>{inspectedEvidence.description}</p>
              <div className="inspection-actions">
                {selected.length === 2 && (
                  <button className="paper-action connect-action" onClick={connect}>
                    Connect selected evidence
                  </button>
                )}
                <button
                  className="paper-action"
                  style={{ marginLeft: 'auto' }}
                  onClick={() => setSelected([])}
                >
                  Put down
                </button>
              </div>
            </div>
          ) : null}
        </aside>
      )}
    </div>
  );
}
