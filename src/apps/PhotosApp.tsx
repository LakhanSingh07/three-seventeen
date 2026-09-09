import React, { useState } from 'react';
import { ChevronLeft, FileCheck, PlusCircle, Check } from 'lucide-react';
import type { CaseData } from '../cases/types';
import { soundEngine } from '../system/SoundEngine';
import { hapticEngine } from '../system/HapticEngine';

interface PhotosAppProps {
  caseData: CaseData;
  discoveredEvidenceIds: string[];
  onDiscoverEvidence: (evidenceId: string) => void;
  onBackToHome: () => void;
}

export const PhotosApp: React.FC<PhotosAppProps> = ({
  caseData,
  discoveredEvidenceIds,
  onDiscoverEvidence,
  onBackToHome,
}) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleExtractClue = (evidenceId: string) => {
    soundEngine.playEvidenceLogged();
    hapticEngine.clueDiscovered();
    onDiscoverEvidence(evidenceId);
    showToast('✓ Photo metadata logged to Investigation Board');
  };

  const activePhoto = selectedPhotoIndex !== null ? caseData.photos[selectedPhotoIndex] : null;

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
        position: 'relative',
      }}
    >
      {toastMessage && (
        <div
          style={{
            position: 'absolute',
            top: '56px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #0284c7, #0369a1)',
            color: '#ffffff',
            padding: '8px 16px',
            borderRadius: '9999px',
            fontSize: '11px',
            fontWeight: 700,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Check size={14} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div
        style={{
          height: '50px',
          padding: '0 14px',
          background: 'rgba(15, 23, 42, 0.95)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <button
          onClick={() => {
            if (selectedPhotoIndex !== null) {
              setSelectedPhotoIndex(null);
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

        <span style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
          {selectedPhotoIndex !== null ? 'Photo Details' : 'Gallery'}
        </span>

        <div style={{ width: '28px' }} />
      </div>

      {/* Photo Grid or Detail */}
      {selectedPhotoIndex === null ? (
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '8px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '6px',
          }}
        >
          {caseData.photos.map((photo, idx) => {
            const isLogged = photo.clueEvidenceId ? discoveredEvidenceIds.includes(photo.clueEvidenceId) : false;
            return (
              <div
                key={photo.id}
                onClick={() => {
                  soundEngine.playTap();
                  hapticEngine.light();
                  setSelectedPhotoIndex(idx);
                }}
                style={{
                  position: 'relative',
                  aspectRatio: '1',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  background: '#1e293b',
                }}
              >
                <img src={photo.thumbnail} alt={photo.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {isLogged && (
                  <div style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(22, 163, 74, 0.85)', borderRadius: '50%', padding: '2px' }}>
                    <FileCheck size={12} color="#ffffff" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : activePhoto ? (
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ width: '100%', maxHeight: '300px', background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={activePhoto.fullImage} alt={activePhoto.title} style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }} />
          </div>

          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff' }}>{activePhoto.title}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{activePhoto.exif.time} • {activePhoto.exif.location}</div>
            </div>

            <p style={{ fontSize: '12.5px', color: '#cbd5e1', margin: 0 }}>{activePhoto.caption}</p>

            {activePhoto.exif && (
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '8px', padding: '10px', fontSize: '11px', color: '#94a3b8' }}>
                <div>Camera: {activePhoto.exif.camera}</div>
                <div>Location: {activePhoto.exif.location}</div>
                {activePhoto.exif.coordinates && <div>GPS: {activePhoto.exif.coordinates}</div>}
              </div>
            )}

            {activePhoto.clueEvidenceId && (
              discoveredEvidenceIds.includes(activePhoto.clueEvidenceId) ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#86efac', fontSize: '12px', fontWeight: 600 }}>
                  <FileCheck size={16} />
                  <span>Logged to Investigation Board</span>
                </div>
              ) : (
                <button
                  onClick={() => handleExtractClue(activePhoto.clueEvidenceId!)}
                  style={{
                    background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                    border: '1px solid #38bdf8',
                    borderRadius: '8px',
                    padding: '10px',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <PlusCircle size={15} />
                  <span>Log to Case Board</span>
                </button>
              )
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
