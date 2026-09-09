import React, { useState } from 'react';
import {
  ChevronLeft,
  FileText,
  FileAudio,
  Lock,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import type { CaseData, FileItem } from '../cases/types';
import { soundEngine } from '../system/SoundEngine';
import { hapticEngine } from '../system/HapticEngine';

interface FilesAppProps {
  caseData: CaseData;
  discoveredEvidenceIds: string[];
  onDiscoverEvidence: (evidenceId: string) => void;
  onBackToHome: () => void;
}

export const FilesApp: React.FC<FilesAppProps> = ({
  caseData,
  discoveredEvidenceIds,
  onDiscoverEvidence,
  onBackToHome,
}) => {
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(caseData.files[0]);

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
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          background: 'rgba(15, 20, 30, 0.95)',
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
              if (selectedFile) {
                setSelectedFile(null);
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
          <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Files Vault</h2>
        </div>

        <span style={{ fontSize: '11px', color: '#94a3b8' }}>{caseData.files.length} Files</span>
      </div>

      {/* Main Content: File List OR Active File Preview */}
      {!selectedFile ? (
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {caseData.files.map((file) => {
            const isDiscovered = file.clueEvidenceId && discoveredEvidenceIds.includes(file.clueEvidenceId);

            return (
              <div
                key={file.id}
                onClick={() => {
                  setSelectedFile(file);
                  soundEngine.playTap();
                  hapticEngine.light();
                }}
                style={{
                  background: 'rgba(18, 24, 38, 0.75)',
                  borderRadius: '14px',
                  padding: '12px 14px',
                  border: file.clueEvidenceId
                    ? isDiscovered
                      ? '1px solid #00e676'
                      : '1px dashed #ff5722'
                    : '1px solid rgba(255, 255, 255, 0.07)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    background: file.isEncrypted ? 'rgba(255, 23, 68, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                    borderRadius: '10px',
                    padding: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {file.isEncrypted ? (
                    <Lock size={18} color="#ff1744" />
                  ) : file.type === 'audio' ? (
                    <FileAudio size={18} color="#ff0844" />
                  ) : (
                    <FileText size={18} color="#38bdf8" />
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {file.name}
                  </h4>
                  <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                    {file.size} • {file.modified}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Active File Viewer
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', color: '#ff7043', fontWeight: 700 }}>
                {selectedFile.type.toUpperCase()} • {selectedFile.size}
              </span>
              {selectedFile.isEncrypted && (
                <span style={{ background: '#ff1744', color: '#fff', fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
                  ENCRYPTED SHA-256
                </span>
              )}
            </div>

            <h1 style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff', marginBottom: '14px', wordBreak: 'break-all' }}>
              {selectedFile.name}
            </h1>

            {/* Document Content Box */}
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.5)',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                lineHeight: '1.6',
                color: '#e2e8f0',
                whiteSpace: 'pre-line',
              }}
            >
              {selectedFile.contentPreview}
            </div>
          </div>

          {/* Clue Collector */}
          {selectedFile.clueEvidenceId && (
            <button
              onClick={() => handleCollectClue(selectedFile.clueEvidenceId!)}
              style={{
                marginTop: '20px',
                width: '100%',
                background: discoveredEvidenceIds.includes(selectedFile.clueEvidenceId)
                  ? 'rgba(0, 230, 118, 0.2)'
                  : 'linear-gradient(135deg, #ff5722, #d84315)',
                border: discoveredEvidenceIds.includes(selectedFile.clueEvidenceId) ? '1px solid #00e676' : 'none',
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
              {discoveredEvidenceIds.includes(selectedFile.clueEvidenceId) ? (
                <>
                  <ShieldCheck size={16} color="#00e676" />
                  <span>DOCUMENT EVIDENCE SECURED</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>EXTRACT FILE METADATA AS EVIDENCE</span>
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
