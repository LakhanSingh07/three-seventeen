import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  FileText,
  FileAudio,
  Lock,
  ShieldCheck,
  Sparkles,
  Play,
  Pause,
  Radio,
  Check,
  FolderArchive,
  Video,
} from 'lucide-react';
import type { CaseData, FileItem } from '../cases/types';
import { soundEngine } from '../system/SoundEngine';
import { hapticEngine } from '../system/HapticEngine';
import { audioManager } from '../system/AudioManager';
import { CctvViewerModal } from '../components/CctvViewerModal';
import { Locker28Modal } from '../components/Locker28Modal';
import { V17UsbModal } from '../components/V17UsbModal';

interface FilesAppProps {
  caseData: CaseData;
  discoveredEvidenceIds: string[];
  onDiscoverEvidence: (evidenceId: string) => void;
  onBackToHome: () => void;
}

const REC_STATION_LISTENED_KEY = '317_rec_station_listened';
const DANIEL_INT_LISTENED_KEY = '317_daniel_int_listened';

function getIsRecStationListened(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(REC_STATION_LISTENED_KEY) === 'true';
  } catch {
    return false;
  }
}

function persistRecStationListened(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(REC_STATION_LISTENED_KEY, 'true');
  } catch {
    // ignore
  }
}

function getIsDanielIntListened(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(DANIEL_INT_LISTENED_KEY) === 'true';
  } catch {
    return false;
  }
}

function persistDanielIntListened(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DANIEL_INT_LISTENED_KEY, 'true');
  } catch {
    // ignore
  }
}

// Waveform visualization bars representing Daniel's 14.8s intercom recording
const DANIEL_INT_WAVEFORM_BARS = [
  24, 38, 55, 68, 82, 60, 35, 20, // 00:00 - 00:03 relay open, "Sarah? What are you still doing on this floor?"
  75, 88, 70, 32, 18,             // 00:03 - 00:05 "You shouldn't be here this late."
  22, 65, 85, 92, 78, 45, 25,     // 00:05 - 00:08 "Listen... don't use your access card again."
  68, 86, 94, 76, 52, 28,         // 00:08 - 00:11 "The system's logging everything tonight. Take the service stairs."
  74, 88, 62, 38, 22,             // 00:11 - 00:13 "And Sarah... if anyone asks, we didn't speak."
  40, 20, 10,                     // 00:14 - 00:15 relay close, line tone cutoff
];

// Canonical transcript for DANIEL-INT-001
const DANIEL_INT_CANONICAL_TRANSCRIPT = [
  { speaker: 'DANIEL', text: 'Sarah?' },
  { speaker: 'DANIEL', text: 'What are you still doing on this floor?' },
  { speaker: 'DANIEL', text: 'You shouldn\'t be here this late.' },
  { speaker: 'DANIEL', text: 'Listen... don\'t use your access card again.' },
  { speaker: 'DANIEL', text: 'The system\'s logging everything tonight.' },
  { speaker: 'DANIEL', text: 'Take the service stairs.' },
  { speaker: 'DANIEL', text: 'And Sarah...' },
  { speaker: 'DANIEL', text: 'if anyone asks, we didn\'t speak.' },
];

// Waveform visualization bars representing the 17.4s environmental recording
const REC_STATION_WAVEFORM_BARS = [
  16, 22, 28, 48, 72, 60, 32, 20, // 00:00 - 00:04 station room tone & footsteps
  78, 88, 54, 30,                 // 00:04 - 00:06 Sarah: "Twenty-eight..."
  92, 98, 85, 42, 24,             // 00:07 - 00:09 metallic latch & locker handling
  65, 82, 90, 70,                 // 00:10 - 00:11 additional footsteps approaching
  85, 92, 76, 38,                 // 00:12 - 00:13 Sarah: "Hello?"
  35, 42, 48, 30,                 // 00:14 - 00:16 distant PA announcement
  18, 12,                         // 00:17 abrupt recording termination
];

// Canonical transcript (strictly intelligible words, no invented dialogue)
const REC_STATION_CANONICAL_TRANSCRIPT = [
  { speaker: 'SARAH', text: '"Twenty-eight..."', time: '00:04' },
  { speaker: 'SYSTEM', text: '[metallic sound]', time: '00:07' },
  { speaker: 'SYSTEM', text: '[footsteps]', time: '00:10' },
  { speaker: 'SARAH', text: '"Hello?"', time: '00:12' },
  { speaker: 'SYSTEM', text: '[distant announcement — unintelligible]', time: '00:14' },
  { speaker: 'SYSTEM', text: '[recording ends]', time: '00:17' },
];

// Forensic audio analysis timeline markers
const REC_STATION_ANALYSIS_MARKERS = [
  { time: '00:04', label: 'Sarah voice', desc: '"Twenty-eight..."' },
  { time: '00:07', label: 'Metallic impact', desc: 'Locker latch / hardware handling' },
  { time: '00:10', label: 'Additional footsteps', desc: 'Audible after Sarah stops moving' },
  { time: '00:12', label: 'Sarah voice', desc: '"Hello?"' },
  { time: '00:14', label: 'Distant PA', desc: 'Unintelligible station announcement' },
  { time: '00:17', label: 'Abrupt cutoff', desc: 'Microphone buffer termination' },
];

export const FilesApp: React.FC<FilesAppProps> = ({
  caseData,
  discoveredEvidenceIds,
  onDiscoverEvidence,
  onBackToHome,
}) => {
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(17.4);
  const [hasListened, setHasListened] = useState<boolean>(getIsRecStationListened);
  const [hasListenedDaniel, setHasListenedDaniel] = useState<boolean>(getIsDanielIntListened);
  const [showDanielTranscript, setShowDanielTranscript] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'analysis' | 'transcript' | 'details'>('analysis');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const voiceElRef = useRef<HTMLAudioElement | null>(null);
  const selectedFileRef = useRef<FileItem | null>(null);

  useEffect(() => {
    selectedFileRef.current = selectedFile;
  }, [selectedFile]);

  // Sync with central AudioManager Voice channel
  useEffect(() => {
    const voiceEl = audioManager.getVoiceElement();
    voiceElRef.current = voiceEl;

    const onTimeUpdate = () => {
      setCurrentTime(voiceEl.currentTime);
      if (voiceEl.duration && !Number.isNaN(voiceEl.duration)) {
        setDuration(voiceEl.duration);
      }
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      const current = selectedFileRef.current;
      if (current?.isSecurityArchive || current?.id === 'file-4') {
        setHasListenedDaniel(true);
        persistDanielIntListened();
      } else {
        setHasListened(true);
        persistRecStationListened();
      }
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    voiceEl.addEventListener('timeupdate', onTimeUpdate);
    voiceEl.addEventListener('ended', onEnded);
    voiceEl.addEventListener('play', onPlay);
    voiceEl.addEventListener('pause', onPause);

    return () => {
      audioManager.stopVoiceTrack();
      voiceEl.removeEventListener('timeupdate', onTimeUpdate);
      voiceEl.removeEventListener('ended', onEnded);
      voiceEl.removeEventListener('play', onPlay);
      voiceEl.removeEventListener('pause', onPause);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Station context prerequisite check
  const hasStationContext =
    discoveredEvidenceIds.includes('EVD_PHOTO_EXIF_STATION') ||
    discoveredEvidenceIds.includes('EVD_MAP_ALEX_STATION') ||
    discoveredEvidenceIds.includes('EVD_NOTE_LOCKER28') ||
    discoveredEvidenceIds.includes('EVD_CALL_317') ||
    discoveredEvidenceIds.includes('EVID-REC-STATION-001');

  // Ardent corporate work/audit context prerequisite check
  const hasArdentSecurityContext =
    discoveredEvidenceIds.includes('EVD_VOICE_MEMO_SAR_VM_002') ||
    discoveredEvidenceIds.includes('EVID-RYAN-VM-001') ||
    discoveredEvidenceIds.includes('EVD_MSG_RYAN_THREAT') ||
    discoveredEvidenceIds.includes('EVD_VOICE_MEMO_SAR_VM_003') ||
    discoveredEvidenceIds.includes('EVID-DANIEL-INT-001');

  const handleToggleAudio = () => {
    if (!selectedFile?.audioSrc) return;
    soundEngine.playTap();
    hapticEngine.medium();

    if (isPlaying) {
      audioManager.pauseVoiceTrack();
    } else {
      if (selectedFile?.isSecurityArchive || selectedFile?.id === 'file-4') {
        setHasListenedDaniel(true);
        persistDanielIntListened();
      } else {
        setHasListened(true);
        persistRecStationListened();
      }
      audioManager.playVoiceTrack(selectedFile.audioSrc);
    }
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    audioManager.seekVoiceTrack(val);
  };

  const handleCollectClue = (evidenceId: string) => {
    soundEngine.playEvidenceLogged();
    hapticEngine.clueDiscovered();
    onDiscoverEvidence(evidenceId);
    showToast('✓ Stamped to Evidence Board');
  };

  const handleSelectFile = (file: FileItem) => {
    soundEngine.playTap();
    audioManager.stopVoiceTrack();
    setIsPlaying(false);
    setCurrentTime(0);
    if (file.audioDurationSec) {
      setDuration(file.audioDurationSec);
    }
    setSelectedFile(file);
  };

  const handleBackToList = () => {
    soundEngine.playTap();
    audioManager.stopVoiceTrack();
    setIsPlaying(false);
    setCurrentTime(0);
    setSelectedFile(null);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const normalFiles = caseData.files.filter((f) => !f.isRecovered && !f.isSecurityArchive);
  const securityFiles = caseData.files.filter((f) => f.isSecurityArchive);
  const recoveredFiles = caseData.files.filter((f) => f.isRecovered && !f.isSecurityArchive);

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
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'absolute',
            top: '54px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #0284c7, #0369a1)',
            color: '#ffffff',
            padding: '7px 15px',
            borderRadius: '9999px',
            fontSize: '11px',
            fontWeight: 700,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
          }}
        >
          <Check size={14} />
          <span>{toastMessage}</span>
        </div>
      )}

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
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => {
              if (selectedFile) {
                handleBackToList();
              } else {
                audioManager.stopVoiceTrack();
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
            aria-label={selectedFile ? 'Back to files' : 'Back to Home'}
          >
            <ChevronLeft size={22} />
            {selectedFile && <span style={{ fontSize: '13px', fontWeight: 600 }}>Files</span>}
          </button>
          <h2 style={{ fontSize: '17px', fontWeight: 800, letterSpacing: '-0.2px' }}>
            {selectedFile ? (selectedFile.isRecovered ? 'Recovered Audio' : 'File Viewer') : 'Files'}
          </h2>
        </div>

        <span style={{ fontSize: '11px', color: '#94a3b8' }}>
          {selectedFile ? selectedFile.size : `${caseData.files.length} Items`}
        </span>
      </div>

      {/* MAIN VIEW: File List OR Active File Viewer */}
      {!selectedFile ? (
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Section 1: Documents Vault */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              Internal Storage · Documents ({normalFiles.length})
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {normalFiles.map((file) => {
                const isDiscovered = file.clueEvidenceId && discoveredEvidenceIds.includes(file.clueEvidenceId);

                return (
                  <div
                    key={file.id}
                    onClick={() => handleSelectFile(file)}
                    style={{
                      background: 'rgba(18, 24, 38, 0.75)',
                      borderRadius: '12px',
                      padding: '12px 14px',
                      border: file.clueEvidenceId && isDiscovered
                        ? '1px solid rgba(34, 197, 94, 0.3)'
                        : '1px solid rgba(255, 255, 255, 0.06)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <div
                      style={{
                        background: file.isEncrypted ? 'rgba(239, 68, 68, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                        borderRadius: '10px',
                        padding: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: file.isEncrypted ? '#ef4444' : '#38bdf8',
                      }}
                    >
                      {file.isEncrypted ? <Lock size={18} /> : <FileText size={18} />}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {file.name}
                      </h4>
                      <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                        {file.size} • {file.modified}
                      </p>
                    </div>

                    {isDiscovered && (
                      <span style={{ fontSize: '9px', background: 'rgba(34, 197, 94, 0.15)', color: '#86efac', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                        LOGGED
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Ardent Corporate Security Archive */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Ardent Security Archive · Intercom Buffer
              </span>
              <span style={{ fontSize: '10px', color: '#94a3b8' }}>Corporate Sector</span>
            </div>

            {hasArdentSecurityContext ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {securityFiles.map((file) => {
                  const isLogged = file.clueEvidenceId && discoveredEvidenceIds.includes(file.clueEvidenceId);
                  const isVideo = file.isCctvArchive || file.type === 'video';

                  return (
                    <div
                      key={file.id}
                      onClick={() => handleSelectFile(file)}
                      style={{
                        background: isVideo
                          ? 'linear-gradient(135deg, rgba(8, 47, 73, 0.8) 0%, rgba(3, 30, 48, 0.9) 100%)'
                          : 'linear-gradient(135deg, rgba(6, 78, 59, 0.7) 0%, rgba(2, 44, 34, 0.85) 100%)',
                        borderRadius: '12px',
                        padding: '12px 14px',
                        border: isVideo ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid rgba(52, 211, 153, 0.3)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.35)',
                      }}
                    >
                      <div
                        style={{
                          background: isVideo ? 'rgba(56, 189, 248, 0.15)' : 'rgba(52, 211, 153, 0.15)',
                          borderRadius: '10px',
                          padding: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isVideo ? '#38bdf8' : '#34d399',
                        }}
                      >
                        {isVideo ? <Video size={18} /> : <Radio size={18} />}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {file.name}
                          </h4>
                          <span
                            style={{
                              fontSize: '8.5px',
                              fontWeight: 700,
                              color: isVideo ? '#38bdf8' : '#34d399',
                              background: isVideo ? 'rgba(56, 189, 248, 0.15)' : 'rgba(52, 211, 153, 0.15)',
                              padding: '1px 5px',
                              borderRadius: '3px',
                              border: isVideo ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid rgba(52, 211, 153, 0.3)',
                            }}
                          >
                            {isVideo ? 'CCTV' : 'SECURITY'}
                          </span>
                        </div>
                        <p style={{ fontSize: '11px', color: isVideo ? '#bae6fd' : '#a7f3d0', marginTop: '3px' }}>
                          {isVideo
                            ? `Floor 14 Service Corridor • ${file.size} • 10.0 sec`
                            : `Floor 14 Intercom • ${file.size} • ~15 sec`}
                        </p>
                      </div>

                      {isLogged ? (
                        <span style={{ fontSize: '9px', background: 'rgba(34, 197, 94, 0.15)', color: '#86efac', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                          LOGGED
                        </span>
                      ) : (
                        <span style={{ fontSize: '10px', color: isVideo ? '#38bdf8' : '#34d399', fontWeight: 600 }}>
                          Inspect →
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Locked Corporate Buffer State */
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.5)',
                  border: '1px dashed rgba(148, 163, 184, 0.2)',
                  borderRadius: '12px',
                  padding: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div style={{ color: '#64748b' }}>
                  <Lock size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>
                    Partition 0x14-SEC [Ardent Security Logging Buffer]
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '2px' }}>
                    Corporate work or audit reference required to authorize buffer extraction
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Recovered / Audio Cache */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Temporary Cache & Recovered Partitions
              </span>
              <span style={{ fontSize: '10px', color: '#94a3b8' }}>Forensic Sector</span>
            </div>

            {hasStationContext ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recoveredFiles.map((file) => {
                  const isLogged = file.clueEvidenceId && discoveredEvidenceIds.includes(file.clueEvidenceId);

                  return (
                    <div
                      key={file.id}
                      onClick={() => handleSelectFile(file)}
                      style={{
                        background: 'linear-gradient(135deg, rgba(22, 32, 50, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
                        borderRadius: '12px',
                        padding: '12px 14px',
                        border: '1px solid rgba(56, 189, 248, 0.25)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)',
                      }}
                    >
                      <div
                        style={{
                          background: 'rgba(56, 189, 248, 0.15)',
                          borderRadius: '10px',
                          padding: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#38bdf8',
                        }}
                      >
                        <FileAudio size={18} />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {file.name}
                          </h4>
                          <span style={{ fontSize: '8.5px', fontWeight: 700, color: '#38bdf8', background: 'rgba(56, 189, 248, 0.15)', padding: '1px 5px', borderRadius: '3px', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
                            RECOVERED
                          </span>
                        </div>
                        <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px' }}>
                          Audio Cache • {file.size} • 17 sec
                        </p>
                      </div>

                      {isLogged ? (
                        <span style={{ fontSize: '9px', background: 'rgba(34, 197, 94, 0.15)', color: '#86efac', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                          LOGGED
                        </span>
                      ) : (
                        <span style={{ fontSize: '10px', color: '#38bdf8', fontWeight: 600 }}>
                          Inspect →
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Locked / Un-indexed Partition state */
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.5)',
                  border: '1px dashed rgba(148, 163, 184, 0.2)',
                  borderRadius: '12px',
                  padding: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div style={{ color: '#64748b' }}>
                  <FolderArchive size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>
                    Sector 0x0317 [Un-indexed Audio Buffer]
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '2px' }}>
                    Location or locker telemetry anchor required to reconstruct partition
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Section 3: Physical Evidence Archive — Locker 28 */}
          {discoveredEvidenceIds.includes('EVID-LOCKER28-001') && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Physical Evidence · Locker 28
                </span>
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>Central Station</span>
              </div>
              <div
                onClick={() => {
                  soundEngine.playTap();
                  hapticEngine.light();
                  // Find and select the locker28 file
                  const lockerFile = caseData.files.find(f => f.isLocker28Archive);
                  if (lockerFile) handleSelectFile(lockerFile);
                }}
                style={{
                  background: 'linear-gradient(135deg, rgba(60, 30, 5, 0.85) 0%, rgba(40, 20, 5, 0.9) 100%)',
                  borderRadius: '12px', padding: '12px 14px',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
                }}
              >
                <div style={{
                  background: 'rgba(245, 158, 11, 0.15)', borderRadius: '10px', padding: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b',
                }}>
                  <FolderArchive size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      Locker 28 — Physical Evidence
                    </h4>
                    <span style={{ fontSize: '8.5px', fontWeight: 700, color: '#f59e0b', background: 'rgba(245,158,11,0.12)', padding: '1px 5px', borderRadius: '3px', border: '1px solid rgba(245,158,11,0.3)' }}>
                      PHYSICAL
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#d4a96a', marginTop: '3px' }}>
                    Central Station Locker Bay · 4 objects recovered
                  </p>
                </div>
                <span style={{ fontSize: '10px', color: '#f59e0b', fontWeight: 600 }}>Inspect →</span>
              </div>
            </div>
          )}
          {/* Section 4: V-17 Forensic Drive Extraction */}
          {(discoveredEvidenceIds.includes('EVID-LOCKER28-USB') || discoveredEvidenceIds.includes('EVID-V17-DATA-MISMATCH')) && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Forensic Extraction · V-17 Drive
                </span>
                <span style={{ fontSize: '10px', color: '#64748b' }}>Mounted Volume</span>
              </div>
              <div
                onClick={() => {
                  soundEngine.playTap();
                  hapticEngine.light();
                  const v17File = caseData.files.find(f => f.isV17Archive);
                  if (v17File) handleSelectFile(v17File);
                }}
                style={{
                  background: 'linear-gradient(135deg, rgba(8, 28, 48, 0.9) 0%, rgba(5, 18, 32, 0.95) 100%)',
                  borderRadius: '12px', padding: '12px 14px',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
                }}
              >
                <div style={{
                  background: 'rgba(56, 189, 248, 0.15)', borderRadius: '10px', padding: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8',
                }}>
                  <FolderArchive size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      V-17 Forensic Filesystem
                    </h4>
                    <span style={{ fontSize: '8.5px', fontWeight: 700, color: '#38bdf8', background: 'rgba(56,189,248,0.12)', padding: '1px 5px', borderRadius: '3px', border: '1px solid rgba(56,189,248,0.3)' }}>
                      MOUNTED
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#7dd3fc', marginTop: '3px' }}>
                    EXPORT & ORIGINAL partitions · Forensic recovery sector
                  </p>
                </div>
                <span style={{ fontSize: '10px', color: '#38bdf8', fontWeight: 600 }}>Browse →</span>
              </div>
            </div>
          )}
        </div>
      ) : (selectedFile?.isV17Archive) ? (
        <V17UsbModal
          onClose={handleBackToList}
          onDiscoverEvidence={onDiscoverEvidence}
          discoveredEvidenceIds={discoveredEvidenceIds}
        />
      ) : (selectedFile?.isLocker28Archive) ? (
        <Locker28Modal
          onClose={handleBackToList}
          onDiscoverEvidence={onDiscoverEvidence}
          discoveredEvidenceIds={discoveredEvidenceIds}
        />
      ) : (selectedFile?.isCctvArchive || selectedFile?.type === 'video') ? (
        <CctvViewerModal
          onClose={handleBackToList}
          onDiscoverEvidence={onDiscoverEvidence}
          isLogged={selectedFile.clueEvidenceId ? discoveredEvidenceIds.includes(selectedFile.clueEvidenceId) : false}
        />
      ) : selectedFile.isSecurityArchive ? (
        /* ==================================================================== */
        /* ARDENT CORPORATE SECURITY ARCHIVE INTERCOM VIEWER                    */
        /* ==================================================================== */
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          {/* Main Corporate Security Player Card */}
          <div
            style={{
              background: 'linear-gradient(180deg, #064e3b 0%, #022c22 100%)',
              borderRadius: '14px',
              border: '1px solid rgba(52, 211, 153, 0.3)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              boxShadow: '0 12px 28px rgba(0, 0, 0, 0.45)',
            }}
          >
            {/* Header / Security Archive Tag */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Radio size={14} color="#34d399" />
                <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#a7f3d0', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                  Ardent Corp · Security Intercom Archive
                </span>
              </div>

              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: '4px',
                  background: 'rgba(52, 211, 153, 0.15)',
                  color: '#34d399',
                  border: '1px solid rgba(52, 211, 153, 0.3)',
                }}
              >
                14.8 SEC
              </span>
            </div>

            {/* Title & Circular Play Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.2px' }}>
                  {selectedFile.name}
                </div>
                <div style={{ fontSize: '11px', color: '#6ee7b7', marginTop: '2px' }}>
                  Channel INT-CH04 • Recorded Sep 8, 11:12 PM
                </div>
              </div>

              <button
                type="button"
                onClick={handleToggleAudio}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                style={{
                  background: isPlaying
                    ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                    : 'linear-gradient(135deg, #059669, #047857)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '46px',
                  height: '46px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  cursor: 'pointer',
                  boxShadow: isPlaying
                    ? '0 0 16px rgba(239, 68, 68, 0.4)'
                    : '0 0 16px rgba(5, 150, 105, 0.4)',
                  transition: 'transform 0.15s ease',
                }}
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: '2px' }} />}
              </button>
            </div>

            {/* Waveform Visualization Bars */}
            <div
              style={{
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '2px',
                padding: '0 4px',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '8px',
              }}
            >
              {DANIEL_INT_WAVEFORM_BARS.map((heightPct, idx) => {
                const barProgress = idx / DANIEL_INT_WAVEFORM_BARS.length;
                const currentProgress = duration > 0 ? currentTime / duration : 0;
                const isPast = barProgress <= currentProgress;
                return (
                  <div
                    key={idx}
                    style={{
                      flex: 1,
                      height: `${heightPct}%`,
                      background: isPast
                        ? isPlaying
                          ? '#34d399'
                          : '#059669'
                        : 'rgba(110, 231, 183, 0.2)',
                      borderRadius: '2px',
                      transition: 'background 0.1s ease',
                    }}
                  />
                );
              })}
            </div>

            {/* Scrubber Slider */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <input
                type="range"
                min="0"
                max={duration || 14.81}
                step="0.05"
                value={currentTime}
                onChange={handleScrub}
                style={{
                  width: '100%',
                  height: '4px',
                  accentColor: '#34d399',
                  cursor: 'pointer',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#6ee7b7' }}>
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration || 14.81)}</span>
              </div>
            </div>

            {/* Action Row: Transcript & Log to Case Board */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playTap();
                  setShowDanielTranscript(!showDanielTranscript);
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  color: '#a7f3d0',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <FileText size={13} />
                <span>{showDanielTranscript ? 'Hide Transcript' : 'View Transcript'}</span>
              </button>

              {discoveredEvidenceIds.includes('EVID-DANIEL-INT-001') ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#86efac', fontSize: '11px', fontWeight: 600 }}>
                  <ShieldCheck size={14} />
                  <span>Logged to Board</span>
                </div>
              ) : hasListenedDaniel ? (
                <button
                  type="button"
                  onClick={() => handleCollectClue('EVID-DANIEL-INT-001')}
                  style={{
                    background: 'linear-gradient(135deg, #059669, #047857)',
                    border: '1px solid #34d399',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.35)',
                  }}
                >
                  <Sparkles size={13} />
                  <span>Log to Case Board</span>
                </button>
              ) : (
                <span style={{ fontSize: '10.5px', color: '#6ee7b7', fontStyle: 'italic' }}>
                  Listen to recording to log...
                </span>
              )}
            </div>

            {/* Transcript Panel */}
            {showDanielTranscript && (
              <div
                style={{
                  background: 'rgba(2, 44, 34, 0.85)',
                  border: '1px solid rgba(52, 211, 153, 0.25)',
                  borderRadius: '8px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ fontSize: '10px', color: '#6ee7b7', letterSpacing: '0.6px', textTransform: 'uppercase', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '4px' }}>
                  Intercom Transmission Transcript · DANIEL-INT-001 (~15s)
                </div>
                {DANIEL_INT_CANONICAL_TRANSCRIPT.map((line, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#34d399' }}>
                      {line.speaker}:
                    </span>
                    <span style={{ fontSize: '11.5px', color: '#f0fdf4' }}>{line.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Forensic System Details Card */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.7)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              fontSize: '11.5px',
            }}
          >
            <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
              Archive Metadata & Telemetry
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '10px' }}>CHANNEL</span>
                <p style={{ margin: '2px 0 0 0', color: '#cbd5e1', fontWeight: 600 }}>INT-CH04 (Restricted)</p>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '10px' }}>LOCATION</span>
                <p style={{ margin: '2px 0 0 0', color: '#cbd5e1', fontWeight: 600 }}>Tower B • Floor 14</p>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '10px' }}>TIMESTAMP</span>
                <p style={{ margin: '2px 0 0 0', color: '#cbd5e1', fontWeight: 600 }}>Sep 8 · 11:12 PM</p>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '10px' }}>SOURCE DEVICE</span>
                <p style={{ margin: '2px 0 0 0', color: '#cbd5e1', fontWeight: 600 }}>Physical Wall Station 14-B</p>
              </div>
            </div>
            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '8px' }}>
              <span style={{ color: '#64748b', fontSize: '10px' }}>RECOVERY STATUS</span>
              <p style={{ margin: '2px 0 0 0', color: '#a7f3d0', fontSize: '11px', lineHeight: 1.5 }}>
                Recovered from Ardent Corp building security buffer. Corroborates presence on Floor 14 before departure.
              </p>
            </div>
          </div>
        </div>
      ) : selectedFile.isRecovered ? (
        /* ==================================================================== */
        /* RECOVERED FORENSIC AUDIO VIEWER (REC-STATION-001)                   */
        /* ==================================================================== */
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          {/* Audio Player Card */}
          <div
            style={{
              background: 'linear-gradient(180deg, #162032 0%, #0f172a 100%)',
              borderRadius: '14px',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              boxShadow: '0 12px 28px rgba(0, 0, 0, 0.45)',
            }}
          >
            {/* Header / Forensic Tag */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Radio size={14} color="#38bdf8" />
                <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                  Forensic Buffer Recovery
                </span>
              </div>

              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: '4px',
                  background: 'rgba(56, 189, 248, 0.12)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                }}
              >
                17.4 SEC
              </span>
            </div>

            {/* Title & Circular Play Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.2px' }}>
                  {selectedFile.name}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                  Recovered Partition • Recorded {selectedFile.modified}
                </div>
              </div>

              <button
                type="button"
                onClick={handleToggleAudio}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                style={{
                  background: isPlaying
                    ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                    : 'linear-gradient(135deg, #0284c7, #0369a1)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '46px',
                  height: '46px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  cursor: 'pointer',
                  boxShadow: isPlaying
                    ? '0 0 16px rgba(239, 68, 68, 0.4)'
                    : '0 0 16px rgba(2, 132, 199, 0.4)',
                  transition: 'transform 0.15s ease',
                }}
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: '2px' }} />}
              </button>
            </div>

            {/* Waveform Visualization Bars */}
            <div
              style={{
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '2px',
                padding: '0 4px',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '8px',
              }}
            >
              {REC_STATION_WAVEFORM_BARS.map((heightPct, idx) => {
                const barProgress = idx / REC_STATION_WAVEFORM_BARS.length;
                const currentProgress = duration > 0 ? currentTime / duration : 0;
                const isPast = barProgress <= currentProgress;
                return (
                  <div
                    key={idx}
                    style={{
                      flex: 1,
                      height: `${heightPct}%`,
                      background: isPast
                        ? isPlaying
                          ? '#38bdf8'
                          : '#0284c7'
                        : 'rgba(148, 163, 184, 0.25)',
                      borderRadius: '2px',
                      transition: 'background 0.1s ease',
                    }}
                  />
                );
              })}
            </div>

            {/* Scrubber Slider */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <input
                type="range"
                min="0"
                max={duration || 17.4}
                step="0.1"
                value={currentTime}
                onChange={handleScrub}
                style={{
                  width: '100%',
                  height: '4px',
                  accentColor: '#38bdf8',
                  cursor: 'pointer',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#64748b' }}>
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Navigation Tabs for Forensic Inspection */}
            <div
              style={{
                display: 'flex',
                gap: '6px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                paddingTop: '10px',
              }}
            >
              {(['analysis', 'transcript', 'details'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    soundEngine.playTap();
                    setActiveTab(tab);
                  }}
                  style={{
                    flex: 1,
                    padding: '6px 4px',
                    borderRadius: '6px',
                    border: 'none',
                    background: activeTab === tab ? 'rgba(56, 189, 248, 0.18)' : 'rgba(255, 255, 255, 0.05)',
                    color: activeTab === tab ? '#38bdf8' : '#94a3b8',
                    fontSize: '11px',
                    fontWeight: activeTab === tab ? 700 : 500,
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                  }}
                >
                  {tab === 'analysis' ? 'Sound Markers' : tab}
                </button>
              ))}
            </div>

            {/* Tab 1: Audio Analysis Markers */}
            {activeTab === 'analysis' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(2, 6, 23, 0.7)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.15)' }}>
                <div style={{ fontSize: '10px', color: '#64748b', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Audible Event Markers · Temporal Sequence
                </div>
                {REC_STATION_ANALYSIS_MARKERS.map((marker, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '8px',
                      fontSize: '11px',
                      lineHeight: 1.4,
                    }}
                  >
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#38bdf8', fontSize: '10.5px' }}>
                      {marker.time}
                    </span>
                    <span style={{ color: '#94a3b8', fontWeight: 600 }}>{marker.label}:</span>
                    <span style={{ color: '#e2e8f0', fontStyle: marker.desc.startsWith('"') ? 'italic' : 'normal' }}>
                      {marker.desc}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 2: Canonical Transcript */}
            {activeTab === 'transcript' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(2, 6, 23, 0.7)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.15)' }}>
                <div style={{ fontSize: '10px', color: '#64748b', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '2px' }}>
                  Intelligible Speech Transcript
                </div>
                {REC_STATION_CANONICAL_TRANSCRIPT.map((line, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', fontSize: '11px' }}>
                    <span style={{ color: line.speaker === 'SARAH' ? '#38bdf8' : '#94a3b8', fontWeight: 700, minWidth: '55px' }}>
                      {line.speaker}:
                    </span>
                    <span style={{ color: line.speaker === 'SARAH' ? '#ffffff' : '#94a3b8', fontStyle: line.speaker === 'SARAH' ? 'normal' : 'italic' }}>
                      {line.text}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 3: File Details */}
            {activeTab === 'details' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(2, 6, 23, 0.7)', padding: '12px', borderRadius: '8px', fontSize: '11px', color: '#cbd5e1' }}>
                <div><strong style={{ color: '#94a3b8' }}>Source:</strong> Volatile Memory Cache Partition</div>
                <div><strong style={{ color: '#94a3b8' }}>Format:</strong> AAC-LC • 192 kbps • 44.1 kHz</div>
                <div><strong style={{ color: '#94a3b8' }}>Duration:</strong> 17.40 seconds</div>
                <div><strong style={{ color: '#94a3b8' }}>Sector:</strong> Central Station Mezzanine Subnet</div>
              </div>
            )}

            {/* Forensic Inspection Observation (unlocked after listening) */}
            {hasListened && (
              <div
                style={{
                  background: 'rgba(56, 189, 248, 0.08)',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  fontSize: '11px',
                  color: '#93c5fd',
                  lineHeight: 1.5,
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: '2px', color: '#38bdf8' }}>
                  Observation:
                </div>
                Additional footsteps are audible after Sarah stops moving.
              </div>
            )}

            {/* Log to Case Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
              {selectedFile.clueEvidenceId && discoveredEvidenceIds.includes(selectedFile.clueEvidenceId) ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#86efac', fontSize: '11.5px', fontWeight: 600 }}>
                  <ShieldCheck size={16} />
                  <span>Logged to Case Board</span>
                </div>
              ) : hasListened ? (
                <button
                  type="button"
                  onClick={() => handleCollectClue(selectedFile.clueEvidenceId!)}
                  style={{
                    background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                    border: '1px solid #38bdf8',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    color: '#ffffff',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
                  }}
                >
                  <Sparkles size={14} />
                  <span>Log to Case Board</span>
                </button>
              ) : (
                <span style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>
                  Listen to recording to log as evidence...
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ==================================================================== */
        /* STANDARD DOCUMENT VIEWER (e.g. XLSX, PDF)                            */
        /* ==================================================================== */
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
                fontFamily: 'monospace',
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
