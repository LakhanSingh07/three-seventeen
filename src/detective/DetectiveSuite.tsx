import React, { useState } from 'react';
import {
  ChevronLeft,
  Layers,
  Clock,
  Gavel,
  Lightbulb,
} from 'lucide-react';
import type { CaseData, Deduction, AccusationTheory, CaseSaveState } from '../cases/types';
import { EvidenceBoard } from './EvidenceBoard';
import { TimelineView } from './TimelineView';
import { TheoryBuilder } from './TheoryBuilder';
import { HintModal } from './HintModal';
import { soundEngine } from '../system/SoundEngine';

interface DetectiveSuiteProps {
  caseData: CaseData;
  saveState: CaseSaveState;
  onUnlockDeduction: (deduction: Deduction) => void;
  onUseHint: (hintId: string) => void;
  onSubmitAccusation: (theory: AccusationTheory) => void;
  onClose: () => void;
}

export const DetectiveSuite: React.FC<DetectiveSuiteProps> = ({
  caseData,
  saveState,
  onUnlockDeduction,
  onUseHint,
  onSubmitAccusation,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'evidence' | 'timeline' | 'accuse'>('evidence');
  const [showHints, setShowHints] = useState(false);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: '#07090e',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        color: '#ffffff',
      }}
    >
      {/* Top Header */}
      <div
        style={{
          padding: '12px 16px',
          background: 'rgba(15, 20, 30, 0.98)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => {
              soundEngine.playTap();
              onClose();
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#38bdf8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
            }}
          >
            <ChevronLeft size={22} />
          </button>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 900, letterSpacing: '0.3px' }}>
              DETECTIVE CASE HUD
            </h2>
            <span style={{ fontSize: '10px', color: '#ff7043', fontWeight: 700 }}>
              CASE 001: THE MISSING GIRL
            </span>
          </div>
        </div>

        {/* Hints Button */}
        <button
          onClick={() => {
            soundEngine.playTap();
            setShowHints(true);
          }}
          style={{
            background: 'linear-gradient(135deg, #ffd200, #f59e0b)',
            border: 'none',
            borderRadius: '9999px',
            padding: '6px 12px',
            color: '#000000',
            fontSize: '11px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            boxShadow: '0 0 12px rgba(255, 210, 0, 0.4)',
          }}
        >
          <Lightbulb size={13} />
          <span>HINTS</span>
        </button>
      </div>

      {/* Navigation Sub-tabs */}
      <div
        style={{
          display: 'flex',
          background: 'rgba(10, 14, 22, 0.95)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          padding: '6px 12px',
          gap: '8px',
        }}
      >
        <button
          onClick={() => {
            setActiveTab('evidence');
            soundEngine.playTap();
          }}
          style={{
            flex: 1,
            background: activeTab === 'evidence' ? 'rgba(255, 87, 34, 0.2)' : 'transparent',
            border: activeTab === 'evidence' ? '1px solid #ff5722' : '1px solid transparent',
            borderRadius: '10px',
            padding: '8px 6px',
            color: activeTab === 'evidence' ? '#ff7043' : '#94a3b8',
            fontSize: '11px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <Layers size={14} />
          <span>CLUES ({saveState.discoveredEvidenceIds.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('timeline');
            soundEngine.playTap();
          }}
          style={{
            flex: 1,
            background: activeTab === 'timeline' ? 'rgba(0, 242, 254, 0.2)' : 'transparent',
            border: activeTab === 'timeline' ? '1px solid #00f2fe' : '1px solid transparent',
            borderRadius: '10px',
            padding: '8px 6px',
            color: activeTab === 'timeline' ? '#00f2fe' : '#94a3b8',
            fontSize: '11px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <Clock size={14} />
          <span>TIMELINE</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('accuse');
            soundEngine.playTap();
          }}
          style={{
            flex: 1,
            background: activeTab === 'accuse' ? 'rgba(255, 23, 68, 0.25)' : 'transparent',
            border: activeTab === 'accuse' ? '1px solid #ff1744' : '1px solid transparent',
            borderRadius: '10px',
            padding: '8px 6px',
            color: activeTab === 'accuse' ? '#ff1744' : '#94a3b8',
            fontSize: '11px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <Gavel size={14} />
          <span>ACCUSE</span>
        </button>
      </div>

      {/* Active Tab View */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {activeTab === 'evidence' && (
          <EvidenceBoard
            caseData={caseData}
            discoveredEvidenceIds={saveState.discoveredEvidenceIds}
            unlockedDeductionIds={saveState.unlockedDeductionIds}
            onUnlockDeduction={onUnlockDeduction}
          />
        )}

        {activeTab === 'timeline' && (
          <TimelineView
            caseData={caseData}
            discoveredEvidenceIds={saveState.discoveredEvidenceIds}
            unlockedTimelineEventIds={saveState.unlockedTimelineEventIds}
          />
        )}

        {activeTab === 'accuse' && (
          <TheoryBuilder
            caseData={caseData}
            discoveredEvidenceCount={saveState.discoveredEvidenceIds.length}
            unlockedDeductionsCount={saveState.unlockedDeductionIds.length}
            onSubmitAccusation={onSubmitAccusation}
          />
        )}
      </div>

      {/* Hints Modal Overlay */}
      {showHints && (
        <HintModal
          caseData={caseData}
          usedHintIds={saveState.usedHintIds}
          onUseHint={onUseHint}
          onClose={() => setShowHints(false)}
        />
      )}
    </div>
  );
};
