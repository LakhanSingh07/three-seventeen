import { useState, useEffect } from 'react';
import { CASE_001_DATA } from './cases/case-001/case-data';
import { CaseEngine } from './cases/case-engine';
import type { CaseData, CaseSaveState, Deduction, AccusationTheory, EndingData } from './cases/types';
import { SaveSystem } from './system/SaveSystem';
import { soundEngine } from './system/SoundEngine';

import { CaseSelectScreen } from './os/CaseSelectScreen';
import { InvestigationRoom } from './room/InvestigationRoom';
import { CaseBoardView } from './room/CaseBoardView';
import { FinalReportModal } from './room/FinalReportModal';

import { NovaStatusBar } from './os/NovaStatusBar';
import { NovaBottomBar } from './os/NovaBottomBar';
import { NovaLockScreen } from './os/NovaLockScreen';
import { NovaHomeScreen, type AppId } from './os/NovaHomeScreen';

import { MessagesApp } from './apps/MessagesApp';
import { PhotosApp } from './apps/PhotosApp';
import { PhoneApp } from './apps/PhoneApp';
import { MapsApp } from './apps/MapsApp';
import { NotesApp } from './apps/NotesApp';
import { BrowserApp } from './apps/BrowserApp';
import { FilesApp } from './apps/FilesApp';
import { ContactsApp } from './apps/ContactsApp';
import { VoiceMemosApp } from './apps/VoiceMemosApp';

import { CaseResultModal } from './detective/CaseResultModal';
import { Smartphone, Monitor } from 'lucide-react';

export function App() {
  const [caseData] = useState<CaseData>(CASE_001_DATA);
  const [saveState, setSaveState] = useState<CaseSaveState>(() => {
    const existing = SaveSystem.loadState('case-001');
    return existing || SaveSystem.createInitialState(CASE_001_DATA);
  });

  const [currentScreen, setCurrentScreen] = useState<'title' | 'desk' | 'board' | 'phone_lock' | 'phone_os'>('title');
  const [activeAppId, setActiveAppId] = useState<AppId | null>(null);
  const [isFinalReportOpen, setIsFinalReportOpen] = useState(false);
  const [activeEnding, setActiveEnding] = useState<EndingData | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isFramedMode, setIsFramedMode] = useState(true);

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
    setActiveAppId(null);
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
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#040508',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '12px',
          right: '16px',
          zIndex: 200,
          display: 'flex',
          gap: '8px',
        }}
      >
        <button
          onClick={() => setIsFramedMode(!isFramedMode)}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '9999px',
            padding: '6px 12px',
            color: '#cbd5e1',
            fontSize: '11px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
          }}
        >
          {isFramedMode ? <Smartphone size={13} color="#ff7043" /> : <Monitor size={13} color="#00f2fe" />}
          <span>{isFramedMode ? 'Mobile Frame' : 'Fullscreen'}</span>
        </button>
      </div>

      <div
        className={isFramedMode ? 'phone-chassis' : ''}
        style={
          !isFramedMode
            ? {
                width: '100%',
                height: '100%',
                maxWidth: '100%',
                maxHeight: '100%',
                borderRadius: 0,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                background: '#0c0e15',
                overflow: 'hidden',
              }
            : undefined
        }
      >
        {currentScreen === 'title' && (
          <CaseSelectScreen
            caseData={caseData}
            saveState={saveState}
            onStartCase={() => setCurrentScreen('desk')}
            onResetCase={handleReplayCase}
          />
        )}

        {currentScreen === 'desk' && (
          <InvestigationRoom
            caseData={caseData}
            saveState={saveState}
            onEnterPhone={() => setCurrentScreen('phone_lock')}
            onOpenBoard={() => setCurrentScreen('board')}
            onUnlockDeduction={handleUnlockDeduction}
            onSubmitAccusation={handleSubmitAccusation}
            onExitToCaseSelect={() => setCurrentScreen('title')}
          />
        )}

        {currentScreen === 'board' && (
          <CaseBoardView
            caseData={caseData}
            saveState={saveState}
            onUnlockDeduction={handleUnlockDeduction}
            onBackToDesk={() => setCurrentScreen('desk')}
            onOpenReport={() => setIsFinalReportOpen(true)}
          />
        )}

        {currentScreen === 'phone_lock' && (
          <NovaLockScreen
            victimName={caseData.victimName}
            onUnlock={() => setCurrentScreen('phone_os')}
          />
        )}

        {currentScreen === 'phone_os' && (
          <div style={{ flex: 1, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <NovaStatusBar
              onBackToDesk={() => {
                setActiveAppId(null);
                setCurrentScreen('desk');
              }}
              isMuted={isMuted}
              onToggleMute={handleToggleMute}
            />

            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex' }}>
              {!activeAppId ? (
                <NovaHomeScreen
                  onOpenApp={(appId) => setActiveAppId(appId)}
                />
              ) : (
                <div style={{ flex: 1, display: 'flex', width: '100%', height: '100%' }}>
                  {activeAppId === 'messages' && (
                    <MessagesApp
                      caseData={caseData}
                      discoveredEvidenceIds={saveState.discoveredEvidenceIds}
                      onDiscoverEvidence={handleDiscoverEvidence}
                      onBackToHome={() => setActiveAppId(null)}
                    />
                  )}
                  {activeAppId === 'photos' && (
                    <PhotosApp
                      caseData={caseData}
                      discoveredEvidenceIds={saveState.discoveredEvidenceIds}
                      onDiscoverEvidence={handleDiscoverEvidence}
                      onBackToHome={() => setActiveAppId(null)}
                    />
                  )}
                  {activeAppId === 'phone' && (
                    <PhoneApp
                      caseData={caseData}
                      discoveredEvidenceIds={saveState.discoveredEvidenceIds}
                      onDiscoverEvidence={handleDiscoverEvidence}
                      onBackToHome={() => setActiveAppId(null)}
                    />
                  )}
                  {activeAppId === 'maps' && (
                    <MapsApp
                      caseData={caseData}
                      discoveredEvidenceIds={saveState.discoveredEvidenceIds}
                      onDiscoverEvidence={handleDiscoverEvidence}
                      onBackToHome={() => setActiveAppId(null)}
                    />
                  )}
                  {activeAppId === 'notes' && (
                    <NotesApp
                      caseData={caseData}
                      discoveredEvidenceIds={saveState.discoveredEvidenceIds}
                      onDiscoverEvidence={handleDiscoverEvidence}
                      onBackToHome={() => setActiveAppId(null)}
                    />
                  )}
                  {activeAppId === 'voice_memos' && (
                    <VoiceMemosApp
                      caseData={caseData}
                      discoveredEvidenceIds={saveState.discoveredEvidenceIds}
                      onDiscoverEvidence={handleDiscoverEvidence}
                      onBackToHome={() => setActiveAppId(null)}
                    />
                  )}
                  {activeAppId === 'browser' && (
                    <BrowserApp
                      caseData={caseData}
                      discoveredEvidenceIds={saveState.discoveredEvidenceIds}
                      onDiscoverEvidence={handleDiscoverEvidence}
                      onBackToHome={() => setActiveAppId(null)}
                    />
                  )}
                  {activeAppId === 'files' && (
                    <FilesApp
                      caseData={caseData}
                      discoveredEvidenceIds={saveState.discoveredEvidenceIds}
                      onDiscoverEvidence={handleDiscoverEvidence}
                      onBackToHome={() => setActiveAppId(null)}
                    />
                  )}
                  {activeAppId === 'contacts' && (
                    <ContactsApp
                      caseData={caseData}
                      onOpenAppWithParticipant={(_id) => setActiveAppId('messages')}
                      onBackToHome={() => setActiveAppId(null)}
                    />
                  )}
                </div>
              )}
            </div>

            <NovaBottomBar
              onHome={() => setActiveAppId(null)}
              onBack={() => {
                if (activeAppId) {
                  setActiveAppId(null);
                } else {
                  setCurrentScreen('desk');
                }
              }}
              canGoBack={true}
            />
          </div>
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
