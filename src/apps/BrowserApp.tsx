import React, { useState } from 'react';
import { ChevronLeft, Globe, Search, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import type { CaseData, BrowserHistoryItem } from '../cases/types';
import { soundEngine } from '../system/SoundEngine';
import { hapticEngine } from '../system/HapticEngine';

interface BrowserAppProps {
  caseData: CaseData;
  discoveredEvidenceIds: string[];
  onDiscoverEvidence: (evidenceId: string) => void;
  onBackToHome: () => void;
}

export const BrowserApp: React.FC<BrowserAppProps> = ({
  caseData,
  discoveredEvidenceIds,
  onDiscoverEvidence,
  onBackToHome,
}) => {
  const [selectedItem, setSelectedItem] = useState<BrowserHistoryItem | null>(null);

  const handleCollectClue = (evidenceId: string) => {
    if (!discoveredEvidenceIds.includes(evidenceId)) {
      soundEngine.playEvidenceSting();
      hapticEngine.clueDiscovered();
      onDiscoverEvidence(evidenceId);
    } else {
      soundEngine.playTap();
      hapticEngine.light();
    }
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
        overflow: 'hidden',
      }}
    >
      {/* Header & URL Bar */}
      <div
        style={{
          padding: '12px 16px',
          background: 'rgba(15, 20, 30, 0.95)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => {
                if (selectedItem) {
                  setSelectedItem(null);
                  soundEngine.playTap();
                } else {
                  onBackToHome();
                }
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
            <h2 style={{ fontSize: '18px', fontWeight: 800 }}>NOVA Browser</h2>
          </div>

          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Search History</span>
        </div>

        {/* Faux URL Address Bar */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.07)',
            borderRadius: '10px',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Globe size={14} color="#00f2fe" />
          <span style={{ fontSize: '11px', color: '#cbd5e1', whiteSpace: 'nowrap', overflow: 'hidden' }}>
            {selectedItem ? selectedItem.url : 'https://history.nova-browser.internal'}
          </span>
        </div>
      </div>

      {/* Main Content: History List OR Cached Page Preview */}
      {!selectedItem ? (
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {caseData.browserHistory.map((item) => {
            const isDiscovered = item.clueEvidenceId && discoveredEvidenceIds.includes(item.clueEvidenceId);

            return (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedItem(item);
                  soundEngine.playTap();
                  hapticEngine.light();
                }}
                style={{
                  background: 'rgba(18, 24, 38, 0.75)',
                  borderRadius: '14px',
                  padding: '12px 14px',
                  border: item.clueEvidenceId
                    ? isDiscovered
                      ? '1px solid #00e676'
                      : '1px dashed #ff5722'
                    : '1px solid rgba(255, 255, 255, 0.07)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Search size={13} color="#00f2fe" />
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>{item.title}</h4>
                  </div>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>{item.time}</span>
                </div>

                <p style={{ fontSize: '11px', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.snippet}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        // Cached Web Page Preview View
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Clock size={12} color="#ff7043" />
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Cached at {selectedItem.time}</span>
            </div>

            <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
              {selectedItem.title}
            </h1>

            <p style={{ fontSize: '11px', color: '#38bdf8', marginBottom: '16px' }}>{selectedItem.url}</p>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                fontSize: '13px',
                lineHeight: '1.6',
                color: '#e2e8f0',
              }}
            >
              {selectedItem.snippet}
            </div>
          </div>

          {/* Clue Collector */}
          {selectedItem.clueEvidenceId && (
            <button
              onClick={() => handleCollectClue(selectedItem.clueEvidenceId!)}
              style={{
                marginTop: '20px',
                width: '100%',
                background: discoveredEvidenceIds.includes(selectedItem.clueEvidenceId)
                  ? 'rgba(0, 230, 118, 0.2)'
                  : 'linear-gradient(135deg, #ff5722, #d84315)',
                border: discoveredEvidenceIds.includes(selectedItem.clueEvidenceId) ? '1px solid #00e676' : 'none',
                borderRadius: '12px',
                padding: '12px',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              {discoveredEvidenceIds.includes(selectedItem.clueEvidenceId) ? (
                <>
                  <ShieldCheck size={16} color="#00e676" />
                  <span>BROWSER LOG EVIDENCE SAVED</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>EXTRACT SEARCH LOG AS EVIDENCE</span>
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
