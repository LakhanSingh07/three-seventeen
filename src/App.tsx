import { useState, useEffect } from 'react';
import { CASE_001_DATA } from './cases/case-001/case-data';
import { CaseEngine } from './cases/case-engine';
import type { CaseData, CaseSaveState, Deduction, AccusationTheory, EndingData } from './cases/types';
import { SaveSystem } from './system/SaveSystem';
import { soundEngine } from './system/SoundEngine';
import { audioManager } from './system/AudioManager';

import { CaseSelectScreen } from './os/CaseSelectScreen';
import { InvestigationScene } from './scene/InvestigationScene';
import { FinalReportModal } from './room/FinalReportModal';

import { CaseResultModal } from './detective/CaseResultModal';


export function App() {
  const [caseData] = useState<CaseData>(CASE_001_DATA);
  const [saveState, setSaveState] = useState<CaseSaveState>(() => {
    const existing = SaveSystem.loadState('case-001');
    return existing || SaveSystem.createInitialState(CASE_001_DATA);
  });

  // 'investigation' now covers the whole physical room + desk + board +
  // phone + close-ups — all navigated internally by InvestigationScene's
  // CameraController instead of being separate top-level screens. See
  // 'investigation' now covers the whole physical room + desk + board +
  // phone + close-ups — all navigated internally by InvestigationScene's
  // CameraController instead of being separate top-level screens.
  const [currentScreen, setCurrentScreen] = useState<'title' | 'investigation'>('title');
  const [isFinalReportOpen, setIsFinalReportOpen] = useState(false);
  const [activeEnding, setActiveEnding] = useState<EndingData | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  // Viewport detection: detect mobile screen / mobile user agent / QA viewport
  const [isMobileScreen, setIsMobileScreen] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.innerWidth <= 600 ||
      /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
    );
  });

  useEffect(() => {
    const checkViewport = () => {
      setIsMobileScreen(
        window.innerWidth <= 600 ||
          /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
      );
    };
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  const qaParam =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('qa')
      : null;
  const qaViewport = qaParam?.match(/^(360|390|412|430)x(800|844|915|932)$/);

  // Desktop framed mode only when on wide non-mobile screens without QA viewport
  const isFramedMode = !isMobileScreen && !qaViewport;

  const containerStyle: React.CSSProperties = qaViewport
    ? {
        width: `${qaViewport[1]}px`,
        height: `${qaViewport[2]}px`,
        maxWidth: '100vw',
        maxHeight: '100dvh',
        borderRadius: 0,
        boxShadow: 'none',
        border: 'none',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        background: '#0c0e15',
        overflow: 'hidden',
      }
    : isMobileScreen
    ? {
        width: '100vw',
        height: '100dvh',
        maxWidth: '100vw',
        maxHeight: '100dvh',
        borderRadius: 0,
        boxShadow: 'none',
        border: 'none',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        background: '#0c0e15',
        overflow: 'hidden',
      }
    : {
        width: '100%',
        maxWidth: '430px',
        height: '100dvh',
        maxHeight: '932px',
        borderRadius: '24px',
        boxShadow:
          '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        background: '#0c0e15',
        overflow: 'hidden',
      };

  useEffect(() => {
    const validation = CaseEngine.validateCase(caseData);
    if (!validation.isValid) {
      console.warn('Case validation warnings:', validation.errors);
    } else {
      console.log('✓ 3:17 Case 001 canonical integrity verified.');
    }
  }, [caseData]);

  useEffect(() => {
    SaveSystem.saveState(saveState);
  }, [saveState]);

  const handleDiscoverEvidence = (evidenceId: string) => {
    if (!saveState.discoveredEvidenceIds.includes(evidenceId)) {
      const updatedEvidence = [...saveState.discoveredEvidenceIds, evidenceId];
      const unlockedTimeline = [...saveState.unlockedTimelineEventIds];
      caseData.timeline.forEach((event) => {
        if (event.unlockedByEvidenceId === evidenceId && !unlockedTimeline.includes(event.id)) {
          unlockedTimeline.push(event.id);
        }
      });

      setSaveState((prev) => ({
        ...prev,
        discoveredEvidenceIds: updatedEvidence,
        unlockedTimelineEventIds: unlockedTimeline,
      }));
    }
  };

  const handleUnlockDeduction = (deduction: Deduction) => {
    if (!saveState.unlockedDeductionIds.includes(deduction.id)) {
      setSaveState((prev) => ({
        ...prev,
        unlockedDeductionIds: [...prev.unlockedDeductionIds, deduction.id],
      }));
    }
  };

  const handleSubmitAccusation = (theory: AccusationTheory) => {
    const outcome = CaseEngine.evaluateAccusation(caseData, theory, saveState);
    setActiveEnding(outcome);

    if (outcome.type === 'solved') {
      setSaveState((prev) => ({
        ...prev,
        caseFinished: true,
        activeEndingId: outcome.id,
      }));
    }
  };

  const handleReplayCase = () => {
    const freshState = SaveSystem.resetCase('case-001', caseData);
    setSaveState(freshState);
    setActiveEnding(null);
    setIsFinalReportOpen(false);
    audioManager.crossfadeToTitle({ durationSec: 2.0 });
    setCurrentScreen('title');
  };

  const handleToggleMute = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#040508',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className={isFramedMode ? 'phone-chassis' : ''} style={containerStyle}>

        {currentScreen === 'title' && (
          <CaseSelectScreen
            caseData={caseData}
            saveState={saveState}
            onStartCase={() => setCurrentScreen('investigation')}
            onResetCase={handleReplayCase}
          />
        )}

        {currentScreen === 'investigation' && (
          <InvestigationScene
            caseData={caseData}
            saveState={saveState}
            onDiscoverEvidence={handleDiscoverEvidence}
            onUnlockDeduction={handleUnlockDeduction}
            onOpenReport={() => setIsFinalReportOpen(true)}
            onExitToCaseSelect={() => {
              audioManager.crossfadeToTitle({ durationSec: 2.2 });
              setCurrentScreen('title');
            }}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
          />
        )}

        {isFinalReportOpen && (
          <FinalReportModal
            caseData={caseData}
            saveState={saveState}
            onSubmitAccusation={(theory) => {
              setIsFinalReportOpen(false);
              handleSubmitAccusation(theory);
            }}
            onClose={() => setIsFinalReportOpen(false)}
          />
        )}

        {activeEnding && (
          <CaseResultModal
            caseData={caseData}
            ending={activeEnding}
            saveState={saveState}
            onReplayCase={handleReplayCase}
            onContinueInvestigation={() => setActiveEnding(null)}
            onOpenCaseSelect={() => {
              audioManager.crossfadeToTitle({ durationSec: 2.2 });
              setActiveEnding(null);
              setCurrentScreen('title');
            }}
          />
        )}
      </div>
    </div>
  );
}

export default App;
