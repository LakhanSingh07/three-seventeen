import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { CaseData, CaseSaveState, Deduction } from '../cases/types';
import { soundEngine } from '../system/SoundEngine';
import { hapticEngine } from '../system/HapticEngine';
import { audioManager } from '../system/AudioManager';

import { useCameraController } from './useCameraController';
import { SceneLayer } from './SceneLayer';
import { InteractiveProp } from './InteractiveProp';
import { CloseupOverlay } from './CloseupOverlay';
import { ProductionArt } from './ProductionArt';
import { EvidenceBoardScene } from './EvidenceBoardScene';
import { environmentAssets, caseContentAssets, type EnvironmentAsset } from './assetRegistry';
import { DESK_LAYOUT, BOARD_REGION, getProgressionStage } from './coordinates';
import { useOpeningNarration, type NarrationPhase } from './useOpeningNarration';
import { PropHighlight, type PropHighlightState } from './PropHighlight';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';
import './scene.css';

import { CaseFileModal } from '../room/CaseFileModal';
import { NotebookModal } from '../room/NotebookModal';
import { CityMapModal } from '../room/CityMapModal';
import { AudioPlayerModal } from '../room/AudioPlayerModal';
import { CctvViewerModal } from '../components/CctvViewerModal';
import { Locker28Modal } from '../components/Locker28Modal';
import { V17UsbModal } from '../components/V17UsbModal';

import { NovaLockScreen } from '../os/NovaLockScreen';
import { NovaStatusBar } from '../os/NovaStatusBar';
import { NovaBottomBar } from '../os/NovaBottomBar';
import { NovaHomeScreen, type AppId } from '../os/NovaHomeScreen';
import { MessagesApp } from '../apps/MessagesApp';
import { PhotosApp } from '../apps/PhotosApp';
import { PhoneApp } from '../apps/PhoneApp';
import { MapsApp } from '../apps/MapsApp';
import { NotesApp } from '../apps/NotesApp';
import { BrowserApp } from '../apps/BrowserApp';
import { FilesApp } from '../apps/FilesApp';
import { ContactsApp } from '../apps/ContactsApp';
import { VoiceMemosApp } from '../apps/VoiceMemosApp';

interface InvestigationSceneProps {
  caseData: CaseData;
  saveState: CaseSaveState;
  onDiscoverEvidence: (evidenceId: string) => void;
  onUnlockDeduction: (deduction: Deduction) => void;
  onOpenReport: () => void;
  onExitToCaseSelect: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

// ─── Narration beat → prop focus map ─────────────────────────────────────────
// For each narration phase, which prop gets elevated focus?
// Multiple props can be elevated; undefined = none specifically focused.
type PropId = 'phone' | 'folder' | 'notebook' | 'recorder' | 'map' | 'board';

const PHASE_FOCAL_PROPS: Partial<Record<NarrationPhase, PropId[]>> = {
  1: ['folder'],           // Sarah's case material
  2: ['folder', 'recorder'], // disappearance / recovered material
  3: ['phone', 'recorder'],  // phone / messages / recordings
  4: ['phone'],            // "one call…"
  5: ['phone'],            // "3:17 A.M."
  6: [],                   // "Everything we have is on this table" — all reveal
  7: [],                   // "Find out what happened." — interaction enabled
};

// ─── Discovery sweep order ────────────────────────────────────────────────────
// Sequential order in which props illuminate during the onboarding sweep
const DISCOVERY_SWEEP_ORDER: PropId[] = ['phone', 'folder', 'notebook', 'board', 'recorder', 'map'];
const SWEEP_STAGGER_MS = 200; // time between each prop's peak

/**
 * The physical Investigation Environment: room, desk, board and every
 * close-up, all living on one continuous scene navigated by the
 * CameraController instead of separate routed screens.
 *
 * Includes the Case 001 first-entry narration system (§1–33 spec).
 * Narration plays once; state is persisted to localStorage.
 */
export const InvestigationScene: React.FC<InvestigationSceneProps> = ({
  caseData,
  saveState,
  onDiscoverEvidence,
  onUnlockDeduction,
  onOpenReport,
  onExitToCaseSelect,
  isMuted,
  onToggleMute,
}) => {
  const camera = useCameraController();
  const reducedMotion = usePrefersReducedMotion();
  const narration = useOpeningNarration();

  const [isLampOn, setIsLampOn] = useState(true);
  const presentationKey = `317_scene_${saveState.caseStartedAt}`;
  const [visited, setVisited] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem(presentationKey) || '[]')); }
    catch { return new Set(); }
  });
  useEffect(() => {
    try { localStorage.setItem(presentationKey, JSON.stringify([...visited])); }
    catch { /* Storage unavailable. */ }
  }, [visited, presentationKey]);

  // Preload room assets
  useEffect(() => {
    Object.values(environmentAssets).forEach(group =>
      Object.values(group).forEach(asset => { const img = new Image(); img.src = asset.real; })
    );
  }, []);

  const [activeAppId, setActiveAppId] = useState<AppId | null>(null);
  const [isPhoneUnlocked, setIsPhoneUnlocked] = useState(() => {
    try { return localStorage.getItem(`${presentationKey}_phone`) === 'true'; } catch { return false; }
  });
  useEffect(() => {
    try { localStorage.setItem(`${presentationKey}_phone`, String(isPhoneUnlocked)); }
    catch { /* Continue without storage. */ }
  }, [presentationKey, isPhoneUnlocked]);

  // Investigation Room music — does NOT start if narration is going to duck it first.
  // The useOpeningNarration hook ducks via audioManager, so starting the music here
  // is still correct (music starts then gets ducked smoothly).
  useEffect(() => {
    audioManager.playInvestigationTheme({ fadeInDuration: 2.0 });
  }, []);

  // Phone attenuation
  const isPhoneView = camera.current === 'phone';
  useEffect(() => {
    audioManager.setPhoneFocus(isPhoneView, 0.9);
  }, [isPhoneView]);

  const stage = getProgressionStage(
    saveState.discoveredEvidenceIds.length,
    saveState.unlockedDeductionIds.length,
    caseData.deductions.length
  );
  const reportReady = saveState.unlockedDeductionIds.length >= 2;

  const markVisited = (id: string) => setVisited(prev => prev.has(id) ? prev : new Set(prev).add(id));

  const toggleLamp = () => {
    soundEngine.playDeskLampToggle();
    hapticEngine.light();
    setIsLampOn(v => !v);
  };

  // ── Discovery sweep state ────────────────────────────────────────────────
  const [sweepingProps, setSweepingProps] = useState<Set<PropId>>(new Set());

  useEffect(() => {
    if (!narration.shouldRunDiscoverySweep || reducedMotion) return;
    // Fire each prop's "discoveryReveal" in staggered sequence
    DISCOVERY_SWEEP_ORDER.forEach((propId, i) => {
      const onTimer = setTimeout(() => {
        setSweepingProps(prev => new Set([...prev, propId]));
      }, i * SWEEP_STAGGER_MS);
      const offTimer = setTimeout(() => {
        setSweepingProps(prev => {
          const next = new Set(prev);
          next.delete(propId);
          return next;
        });
      }, i * SWEEP_STAGGER_MS + 700);
      return () => { clearTimeout(onTimer); clearTimeout(offTimer); };
    });
  }, [narration.shouldRunDiscoverySweep, reducedMotion]);

  // ── Idle hint: "Inspect the table." shown once 5s after interaction enabled ──
  const [showIdleHint, setShowIdleHint] = useState(false);
  const idleHintShownRef = useRef(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasInteractedRef = useRef(false);

  const markInteracted = useCallback(() => {
    hasInteractedRef.current = true;
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!narration.isInteractionEnabled || idleHintShownRef.current || reducedMotion) return;
    idleTimerRef.current = setTimeout(() => {
      if (!hasInteractedRef.current && !idleHintShownRef.current) {
        idleHintShownRef.current = true;
        setShowIdleHint(true);
        setTimeout(() => setShowIdleHint(false), 4500);
      }
    }, 5500);
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [narration.isInteractionEnabled, reducedMotion]);

  // ── Prop highlight state computation ─────────────────────────────────────
  /**
   * Returns the PropHighlightState for a given prop, driven by:
   *   1. Narration phase focal props (during narration)
   *   2. Discovery sweep
   *   3. Normal post-narration discoverable / inspected states
   */
  const getPropHighlightState = useCallback(
    (propId: PropId, isVisited: boolean): PropHighlightState => {
      // During narration, only show focus on focal props; others stay idle/locked-dim
      if (narration.isFirstEntry && narration.phase < 7) {
        const focalProps = PHASE_FOCAL_PROPS[narration.phase];
        if (focalProps === undefined) return 'idle';
        // Phase 6 = full reveal for all props
        if (narration.phase === 6) return sweepingProps.has(propId) ? 'hover' : 'discoverable';
        if (focalProps.length === 0) return 'idle';
        if (focalProps.includes(propId)) return 'focus';
        return 'idle';
      }

      // Post narration (or returning visitor): normal highlight system
      if (sweepingProps.has(propId)) return 'hover';
      if (isVisited) return 'inspected';
      return 'discoverable';
    },
    [narration.isFirstEntry, narration.phase, sweepingProps]
  );

  // ── Assets ───────────────────────────────────────────────────────────────
  const roomAsset = environmentAssets.room.background;
  const lampAsset = isLampOn ? environmentAssets.lamp.on : environmentAssets.lamp.off;
  const phoneAsset = environmentAssets.phone.body;
  const folderAsset = stage >= 1 ? environmentAssets.folder.open : environmentAssets.folder.closed;
  const notebookAsset = stage >= 2 ? environmentAssets.notebook.open : environmentAssets.notebook.closed;
  const mapAsset =
    stage >= 2 ? environmentAssets.map.unfolded : stage >= 1 ? environmentAssets.map.partial : environmentAssets.map.folded;
  const recorderAsset = environmentAssets.recorder.body;

  const isRoomFocused = camera.current === 'room';

  // Interaction gate: during narration (phases 1-6) block opening close-ups
  // Phase 7+ = interaction fully enabled
  const interactionDisabled = narration.isFirstEntry && !narration.isInteractionEnabled;

  return (
    <div className="investigation-scene" data-view={camera.current} data-stage={stage}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: '#050403',
        userSelect: 'none',
      }}
      onPointerDown={() => markInteracted()}
    >
      <div className="scene-world" style={{
        transformOrigin: camera.anchor ? `${camera.anchor.xPct}% ${camera.anchor.yPct}%` : '50% 50%',
        transform: isRoomFocused ? 'scale(1)' : 'scale(1.16)',
        // Gate pointer events on the entire scene-world during narration lock
        pointerEvents: interactionDisabled ? 'none' : undefined,
      }}>
        <SceneLayer depth={0} zIndex={0} isDefocused={!isRoomFocused}>
          <img src={roomAsset.real} alt="" className="room-plate" />
        </SceneLayer>

        {/* Evidence Board */}
        <SceneLayer depth={1} zIndex={10} isDefocused={!isRoomFocused && camera.current !== 'board'}>
          <button
            className="wall-board"
            aria-label="Evidence board"
            onClick={() => camera.pushView('board', { xPct: 50, yPct: 25 })}
            style={{ left: `${BOARD_REGION.xPct}%`, top: `${BOARD_REGION.yPct}%`, width: `${BOARD_REGION.widthPct}%`, position: 'relative' }}
          >
            <EvidenceBoardPreview caseData={caseData} saveState={saveState} />
            {/* Board highlight overlay */}
            <PropHighlight
              state={getPropHighlightState('board', visited.has('board'))}
              hue={38}
              shape="board"
              breathePhase={0.8}
            />
          </button>
        </SceneLayer>

        <SceneLayer depth={2} zIndex={20} isDefocused={!isRoomFocused}>
          <button className="lamp-prop" aria-label={isLampOn ? 'Turn desk lamp off' : 'Turn desk lamp on'} onClick={toggleLamp}
            style={{ left: `${DESK_LAYOUT.lamp.xPct}%`, top: `${DESK_LAYOUT.lamp.yPct}%`, width: `${DESK_LAYOUT.lamp.widthPct}%`, aspectRatio: '3/4' }}>
            <ProductionArt asset={lampAsset} />
          </button>
        </SceneLayer>

        <SceneLayer depth={3} zIndex={30} isDefocused={!isRoomFocused}>
          <DeskProp id="map" position={DESK_LAYOUT.map} asset={mapAsset} ariaLabel="City map" hint="City map"
            visited={visited.has('map')} onMark={() => markVisited('map')}
            onActivate={a => { markInteracted(); camera.pushView('map', a); }}
            highlightState={getPropHighlightState('map', visited.has('map'))}
            breathePhase={0.6} hue={38} shape="wide"
          />
          <DeskProp id="notebook" position={DESK_LAYOUT.notebook} asset={notebookAsset} ariaLabel="Field notebook" hint="Field notebook"
            visited={visited.has('notebook')} onMark={() => markVisited('notebook')}
            onActivate={a => { markInteracted(); camera.pushView('notebook', a); }}
            highlightState={getPropHighlightState('notebook', visited.has('notebook'))}
            breathePhase={0.15} hue={45} shape="wide"
          />
          <DeskProp id="folder" position={DESK_LAYOUT.folder} asset={folderAsset} ariaLabel="Case folder" hint="Case file"
            visited={visited.has('folder')} onMark={() => markVisited('folder')}
            onActivate={a => { markInteracted(); camera.pushView('casefile', a); }}
            highlightState={getPropHighlightState('folder', visited.has('folder'))}
            breathePhase={0.0} hue={42} shape="wide"
          />
          {stage >= 1 && <DecorativeProp position={DESK_LAYOUT.headphones} asset={environmentAssets.recorder.headphones} />}
          {stage >= 2 && <DecorativeProp position={DESK_LAYOUT.mug} asset={environmentAssets.clutter.mug} />}
          {stage >= 2 && <DecorativeProp position={DESK_LAYOUT.paperSingle} asset={environmentAssets.clutter.paperSingle} />}
          {stage >= 3 && <DecorativeProp position={DESK_LAYOUT.paperStack} asset={environmentAssets.clutter.paperStack} />}
          <DecorativeProp position={DESK_LAYOUT.evidenceBag} asset={environmentAssets.clutter.evidenceBag} />
          <DecorativeProp position={DESK_LAYOUT.pen} asset={environmentAssets.clutter.pen} />
          <DeskProp id="recorder" position={DESK_LAYOUT.recorder} asset={recorderAsset} ariaLabel="Audio recorder" hint="Recorder"
            visited={visited.has('recorder')} onMark={() => markVisited('recorder')}
            onActivate={a => { markInteracted(); camera.pushView('recorder', a); }}
            highlightState={getPropHighlightState('recorder', visited.has('recorder'))}
            breathePhase={0.4} hue={200} shape="wide"
          />
          <DeskProp id="phone" position={DESK_LAYOUT.phone} asset={phoneAsset} ariaLabel="Sarah's phone" hint="Sarah's phone"
            visited={visited.has('phone')} onMark={() => markVisited('phone')}
            onActivate={a => { markInteracted(); camera.pushView('phone', a); }}
            highlightState={getPropHighlightState('phone', visited.has('phone'))}
            breathePhase={0.25} hue={195} shape="round"
          />
        </SceneLayer>

        <div className="room-light" style={{ opacity: isLampOn ? 0 : 0.78 }} />
        <div className="room-vignette" />
      </div>

      {/* ── Minimal chrome: exit affordance (room-only) ── */}
      {isRoomFocused && (
        <button
          onClick={() => { soundEngine.playTap(); onExitToCaseSelect(); }}
          aria-label="Exit to case select"
          style={{
            position: 'absolute',
            top: 'calc(env(safe-area-inset-top, 14px) + 8px)',
            left: 14,
            zIndex: 45,
            background: 'rgba(18, 14, 10, 0.85)',
            border: '1px solid rgba(160, 138, 102, 0.4)',
            borderRadius: 2,
            padding: '7px 12px',
            color: '#ded8c9',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            font: '12px/1 monospace',
            letterSpacing: '1px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
          }}
        >
          <ArrowLeft size={13} /> EXIT CASE
        </button>
      )}

      {/* ── Opening narration: skip button ── */}
      {narration.isFirstEntry && narration.isPlaying && isRoomFocused && (
        <button
          className="narration-skip"
          onClick={() => { narration.skip(); markInteracted(); }}
          aria-label="Skip narration"
        >
          SKIP ›
        </button>
      )}

      {/* ── One-time idle hint after narration ── */}
      {showIdleHint && isRoomFocused && (
        <div className="idle-table-hint" role="status" aria-live="polite">
          Inspect the table.
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* CLOSE-UPS (all mounted, visibility toggled by CloseupOverlay)      */}
      {/* ─────────────────────────────────────────────────────────────────── */}

      <CloseupOverlay isActive={camera.isActive('board')} anchor={camera.anchor} zIndex={100}>
        <EvidenceBoardScene
          caseData={caseData}
          saveState={saveState}
          onUnlockDeduction={onUnlockDeduction}
          onBackToRoom={camera.popView}
          onOpenReport={onOpenReport}
          onOpenCctv={() => camera.pushView('cctv')}
          onOpenLocker28={() => camera.pushView('locker28')}
          onOpenV17={() => camera.pushView('v17')}
          isActive={camera.isActive('board')}
        />
      </CloseupOverlay>

      <CloseupOverlay isActive={camera.isActive('casefile')} anchor={camera.anchor} zIndex={100}>
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <CaseFileModal caseData={caseData} onClose={camera.popView} onOpenPhone={() => camera.pushView('phone')} onOpenReport={reportReady ? onOpenReport : undefined} />
        </div>
      </CloseupOverlay>

      <CloseupOverlay isActive={camera.isActive('notebook')} anchor={camera.anchor} zIndex={100}>
        <NotebookModal caseData={caseData} saveState={saveState} onClose={camera.popView} />
      </CloseupOverlay>

      <CloseupOverlay isActive={camera.isActive('map')} anchor={camera.anchor} zIndex={100}>
        <CityMapModal caseData={caseData} saveState={saveState} onClose={camera.popView} />
      </CloseupOverlay>

      <CloseupOverlay isActive={camera.isActive('recorder')} anchor={camera.anchor} zIndex={100}>
        <AudioPlayerModal onClose={camera.popView} discoveredEvidenceIds={saveState.discoveredEvidenceIds} />
      </CloseupOverlay>

      <CloseupOverlay isActive={camera.isActive('cctv')} anchor={camera.anchor} zIndex={125}>
        <CctvViewerModal
          onClose={camera.popView}
          onDiscoverEvidence={onDiscoverEvidence}
          isLogged={saveState.discoveredEvidenceIds.includes('EVID-CCTV-ARDENT-001')}
        />
      </CloseupOverlay>

      <CloseupOverlay isActive={camera.isActive('locker28')} anchor={camera.anchor} zIndex={125}>
        <Locker28Modal
          onClose={camera.popView}
          onDiscoverEvidence={onDiscoverEvidence}
          discoveredEvidenceIds={saveState.discoveredEvidenceIds}
        />
      </CloseupOverlay>

      <CloseupOverlay isActive={camera.isActive('v17')} anchor={camera.anchor} zIndex={125}>
        <V17UsbModal
          onClose={camera.popView}
          onDiscoverEvidence={onDiscoverEvidence}
          discoveredEvidenceIds={saveState.discoveredEvidenceIds}
        />
      </CloseupOverlay>

      <CloseupOverlay isActive={camera.isActive('phone')} anchor={camera.anchor} zIndex={110}>
        <div className="phone-closeup">
          <button className="phone-room-back" aria-label="Return phone to desk" onClick={camera.popView}>‹ Desk</button>
          <div className="phone-screen">
            {!isPhoneUnlocked ? (
              <NovaLockScreen victimName={caseData.victimName} onUnlock={() => setIsPhoneUnlocked(true)} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', background: '#0c0e15' }}>
                <NovaStatusBar onBackToDesk={camera.popView} isMuted={isMuted} onToggleMute={onToggleMute} />
                <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex' }}>
                  {!activeAppId ? (
                    <NovaHomeScreen onOpenApp={appId => setActiveAppId(appId)} />
                  ) : (
                    <div style={{ flex: 1, display: 'flex', width: '100%', height: '100%' }}>
                      {activeAppId === 'messages' && (
                        <MessagesApp caseData={caseData} discoveredEvidenceIds={saveState.discoveredEvidenceIds} onDiscoverEvidence={onDiscoverEvidence} onBackToHome={() => setActiveAppId(null)} />
                      )}
                      {activeAppId === 'photos' && (
                        <PhotosApp caseData={caseData} discoveredEvidenceIds={saveState.discoveredEvidenceIds} onDiscoverEvidence={onDiscoverEvidence} onBackToHome={() => setActiveAppId(null)} />
                      )}
                      {activeAppId === 'phone' && (
                        <PhoneApp caseData={caseData} discoveredEvidenceIds={saveState.discoveredEvidenceIds} onDiscoverEvidence={onDiscoverEvidence} onBackToHome={() => setActiveAppId(null)} />
                      )}
                      {activeAppId === 'maps' && (
                        <MapsApp caseData={caseData} discoveredEvidenceIds={saveState.discoveredEvidenceIds} onDiscoverEvidence={onDiscoverEvidence} onBackToHome={() => setActiveAppId(null)} />
                      )}
                      {activeAppId === 'notes' && (
                        <NotesApp caseData={caseData} discoveredEvidenceIds={saveState.discoveredEvidenceIds} onDiscoverEvidence={onDiscoverEvidence} onBackToHome={() => setActiveAppId(null)} />
                      )}
                      {activeAppId === 'voice_memos' && (
                        <VoiceMemosApp caseData={caseData} discoveredEvidenceIds={saveState.discoveredEvidenceIds} onDiscoverEvidence={onDiscoverEvidence} onBackToHome={() => setActiveAppId(null)} />
                      )}
                      {activeAppId === 'browser' && (
                        <BrowserApp caseData={caseData} discoveredEvidenceIds={saveState.discoveredEvidenceIds} onDiscoverEvidence={onDiscoverEvidence} onBackToHome={() => setActiveAppId(null)} />
                      )}
                      {activeAppId === 'files' && (
                        <FilesApp caseData={caseData} discoveredEvidenceIds={saveState.discoveredEvidenceIds} onDiscoverEvidence={onDiscoverEvidence} onBackToHome={() => setActiveAppId(null)} />
                      )}
                      {activeAppId === 'contacts' && (
                        <ContactsApp caseData={caseData} discoveredEvidenceIds={saveState.discoveredEvidenceIds} onOpenAppWithParticipant={() => setActiveAppId('messages')} onBackToHome={() => setActiveAppId(null)} />
                      )}
                    </div>
                  )}
                </div>
                <NovaBottomBar
                  onHome={() => setActiveAppId(null)}
                  onBack={() => {
                    if (activeAppId) { setActiveAppId(null); } else { camera.popView(); }
                  }}
                  canGoBack={true}
                />
              </div>
            )}
          </div>
        </div>
      </CloseupOverlay>
    </div>
  );
};

// ─── DeskProp ─────────────────────────────────────────────────────────────────
// Enhanced with PropHighlight and sweep animation support
const DeskProp: React.FC<{
  id: string;
  position: typeof DESK_LAYOUT[string];
  asset: EnvironmentAsset;
  ariaLabel: string;
  hint: string;
  visited: boolean;
  onMark: () => void;
  onActivate: (anchor: { xPct: number; yPct: number }) => void;
  highlightState: PropHighlightState;
  breathePhase?: number;
  hue?: number;
  shape?: 'round' | 'wide' | 'board';
}> = ({ id, position, asset, ariaLabel, hint, visited, onMark, onActivate, highlightState, breathePhase = 0, hue = 40, shape = 'wide' }) => (
  <InteractiveProp
    id={id}
    position={position}
    ariaLabel={ariaLabel}
    firstVisitHint={hint}
    hasFirstVisitHint={!visited}
    onHintShown={onMark}
    onActivate={anchor => { soundEngine.playTap(); hapticEngine.light(); onActivate(anchor); }}
  >
    <div style={{ width: '100%', aspectRatio: `${asset.aspect.width}/${asset.aspect.height}`, position: 'relative' }}>
      <ProductionArt asset={asset} />
      {id === 'phone' && <span className="desk-phone-time">03:17<small>Sarah's phone</small></span>}
      {/* Highlight overlay — inside the prop so it inherits rotation */}
      <PropHighlight
        state={highlightState}
        hue={hue}
        breathePhase={breathePhase}
        shape={shape}
      />
    </div>
  </InteractiveProp>
);

function DecorativeProp({ position, asset }: { position: typeof DESK_LAYOUT[string]; asset: EnvironmentAsset }) {
  return (
    <div style={{
      position: 'absolute',
      left: `${position.xPct}%`,
      top: `${position.yPct}%`,
      width: `${position.widthPct}%`,
      aspectRatio: `${asset.aspect.width}/${asset.aspect.height}`,
      transform: `rotate(${position.rotationDeg || 0}deg)`,
      pointerEvents: 'none',
    }}>
      <ProductionArt asset={asset} />
    </div>
  );
}

const EvidenceBoardPreview: React.FC<{ caseData: CaseData; saveState: CaseSaveState }> = ({ caseData, saveState }) => {
  const evidence = caseData.evidenceList.filter(e => saveState.discoveredEvidenceIds.includes(e.id));
  const visible = evidence.slice(0, 12);
  const pins = Object.fromEntries(visible.map((e, i) => [e.id, { x: 18.5 + (i % 4) * 21, y: 53 + Math.floor(i / 4) * 14 }]));
  const connections = caseData.deductions
    .filter(d => saveState.unlockedDeductionIds.includes(d.id))
    .map(d => d.requiredEvidenceIds.slice(0, 2).map(id => pins[id]))
    .filter(pair => pair.length === 2 && pair.every(Boolean));

  return (
    <div className="board-preview">
      <ProductionArt asset={environmentAssets.board.base} />
      <div className="starter-photo physical-polaroid">
        <img src={caseContentAssets.sarahProfile} alt="Sarah Mehta" />
        <span>Sarah Mehta</span>
        <i className="photo-tack" />
      </div>
      <div className="starter-note">
        <ProductionArt asset={environmentAssets.board_pin_frames.stickyNote} />
        <span>03:17 ?</span>
      </div>
      {visible.map((e, i) => (
        <div className="preview-pin" key={e.id} style={{ left: `${9 + (i % 4) * 21}%`, top: `${48 + Math.floor(i / 4) * 14}%`, transform: `rotate(${(i * 7) % 13 - 6}deg)` }}>
          <span>{e.title}</span><i className="photo-tack" />
        </div>
      ))}
      {connections.length > 0 && (
        <svg className="preview-threads" viewBox="0 0 100 100" preserveAspectRatio="none">
          {connections.map(([a, b], i) => (
            <path key={i} d={`M${a.x} ${a.y} Q${(a.x + b.x) / 2} ${(a.y + b.y) / 2 + 4} ${b.x} ${b.y}`} />
          ))}
        </svg>
      )}
    </div>
  );
};

export type { AppId };
