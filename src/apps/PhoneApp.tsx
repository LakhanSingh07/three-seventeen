import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Play,
  Pause,
  Voicemail,
  FileCheck,
  PlusCircle,
  Check,
  FileText,
  Radio,
  User,
} from 'lucide-react';
import type { CaseData, CallLogItem } from '../cases/types';
import { soundEngine } from '../system/SoundEngine';
import { hapticEngine } from '../system/HapticEngine';
import { audioManager } from '../system/AudioManager';

interface PhoneAppProps {
  caseData: CaseData;
  discoveredEvidenceIds: string[];
  onDiscoverEvidence: (evidenceId: string) => void;
  onBackToHome: () => void;
}

export const CALL_0317_AUDIO_SRC = '/assets/audio/calls/CALL-0317-001_recovered-call.mp3';
export const CALL_0317_EVD_ID = 'EVD_CALL_317';
const CALL_0317_LISTENED_KEY = '317_call_0317_listened';

export const MAYA_VM_001_AUDIO_SRC = '/assets/audio/voicemail/MAYA-VM-001_call-me.mp3';
export const MAYA_VM_001_EVD_ID = 'EVD_CALL_MAYA_230';
const MAYA_VM_001_LISTENED_KEY = '317_maya_vm_001_listened';

export const RYAN_VM_001_AUDIO_SRC = '/assets/audio/voicemail/RYAN-VM-001_leave-it.mp3';
export const RYAN_VM_001_EVD_ID = 'EVID-RYAN-VM-001';
const RYAN_VM_001_LISTENED_KEY = '317_ryan_vm_001_listened';

function getIsCall0317Listened(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(CALL_0317_LISTENED_KEY) === 'true';
  } catch {
    return false;
  }
}

function persistCall0317Listened(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CALL_0317_LISTENED_KEY, 'true');
  } catch {
    // ignore
  }
}

function getIsMayaVmListened(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(MAYA_VM_001_LISTENED_KEY) === 'true';
  } catch {
    return false;
  }
}

function persistMayaVmListened(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MAYA_VM_001_LISTENED_KEY, 'true');
  } catch {
    // ignore
  }
}

function getIsRyanVmListened(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(RYAN_VM_001_LISTENED_KEY) === 'true';
  } catch {
    return false;
  }
}

function persistRyanVmListened(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(RYAN_VM_001_LISTENED_KEY, 'true');
  } catch {
    // ignore
  }
}

// Canonical transcript for the 03:17 AM recovered call intercept
const CALL_0317_CANONICAL_TRANSCRIPT = [
  { speaker: 'SARAH', text: 'Hello?', time: '03:17:01' },
  { speaker: 'UNKNOWN', text: 'Sarah?', time: '03:17:03' },
  { speaker: 'SARAH', text: 'Yeah... who is this?', time: '03:17:05' },
  { speaker: 'UNKNOWN', text: 'You have it?\nYou know why I\'m calling.', time: '03:17:07' },
  { speaker: 'SARAH', text: 'No. I really don\'t.', time: '03:17:11' },
  { speaker: 'UNKNOWN', text: 'Locker twenty-eight. You opened it.', time: '03:17:14' },
  { speaker: 'SARAH', text: 'How do you know that?', time: '03:17:18' },
  { speaker: 'UNKNOWN', text: 'Sarah... listen to me. Leave what\'s inside and walk away.', time: '03:17:21' },
  { speaker: 'SARAH', text: 'You\'ve been following me.', time: '03:17:27' },
  { speaker: 'UNKNOWN', text: 'Go home.', time: '03:17:30' },
  { speaker: 'SARAH', text: 'Who are you?', time: '03:17:32' },
  { speaker: 'UNKNOWN', text: 'You\'re asking the wrong question.', time: '03:17:34' },
  { speaker: 'SARAH', text: 'Then what\'s the right one?', time: '03:17:37' },
  { speaker: 'UNKNOWN', text: 'Who else knew you were coming?', time: '03:17:39' },
  { speaker: 'SYSTEM', text: '[silence]', time: '03:17:43' },
  { speaker: 'SARAH', text: '...Alex?', time: '03:17:46' },
  { speaker: 'UNKNOWN', text: 'Don\'t trust what you see.', time: '03:17:49' },
  { speaker: 'SYSTEM', text: '[CALL DISCONNECTS]', time: '03:17:52' },
];

// Canonical transcript for MAYA-VM-001 (Call Me)
const MAYA_VM_CANONICAL_TRANSCRIPT = [
  "Sarah, hey... call me when you get this, okay?",
  "You said you'd call me back and now you're not answering.",
  "I know you're probably busy, but... you're making me nervous.",
  "Just text me. Anything.",
  "I don't care what time it is.",
  "Call me.",
];

// Canonical transcript for RYAN-VM-001 (Leave It)
const RYAN_VM_CANONICAL_TRANSCRIPT = [
  "Sarah, hey.",
  "I saw your message about the numbers.",
  "Don't send me anything on Teams or email, okay?",
  "Just... leave it for now.",
  "I'll explain tomorrow when we're in the office.",
  "And Sarah...",
  "don't open the audit folder again.",
  "Seriously.",
  "Just leave it.",
];

// Representative waveform bars derived from conversation cadence (40.8s)
const CALL_WAVEFORM_BARS = [
  28, 62, 85, 45, 18, 14, 26, 74, 92, 52, 22, 16, 38, 68, 86, 94, 58, 28, 16, 12, 58, 84, 88, 54,
  38, 78, 92, 68, 28, 18, 24, 62, 82, 38, 18, 14, 32, 68, 88, 58, 24, 12,
];

// Representative waveform bars for Maya's 17s voicemail
const MAYA_VM_WAVEFORM_BARS = [
  26, 42, 68, 84, 56, 28, 18, 38, 72, 88, 64, 32, 22, 48, 82, 68, 36, 20, 16, 34, 65, 80, 52, 28,
  18, 36, 74, 86, 58, 30, 20, 32, 60, 45, 24, 14,
];

// Representative waveform bars for Ryan's 16.67s voicemail
const RYAN_VM_WAVEFORM_BARS = [
  30, 48, 70, 82, 54, 26, 16, 35, 75, 90, 60, 28, 20, 52, 85, 62, 32, 18, 14, 40, 72, 84, 48, 24,
  16, 38, 76, 88, 52, 26, 18, 30, 58, 42, 22, 12,
];

export const PhoneApp: React.FC<PhoneAppProps> = ({
  caseData,
  discoveredEvidenceIds,
  onDiscoverEvidence,
  onBackToHome,
}) => {
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'recents' | 'voicemail'>('recents');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(40.8);
  const [activeAudioSrc, setActiveAudioSrc] = useState<string | null>(null);
  const [hasListened0317, setHasListened0317] = useState<boolean>(getIsCall0317Listened);
  const [hasListenedMaya, setHasListenedMaya] = useState<boolean>(getIsMayaVmListened);
  const [hasListenedRyan, setHasListenedRyan] = useState<boolean>(getIsRyanVmListened);
  const [showTranscript, setShowTranscript] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const voiceElRef = useRef<HTMLAudioElement | null>(null);

  // Sync with central AudioManager Voice element
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
      if (activeAudioSrc === RYAN_VM_001_AUDIO_SRC) {
        setHasListenedRyan(true);
        persistRyanVmListened();
      } else if (activeAudioSrc === MAYA_VM_001_AUDIO_SRC) {
        setHasListenedMaya(true);
        persistMayaVmListened();
      } else {
        setHasListened0317(true);
        persistCall0317Listened();
      }
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    voiceEl.addEventListener('timeupdate', onTimeUpdate);
    voiceEl.addEventListener('ended', onEnded);
    voiceEl.addEventListener('play', onPlay);
    voiceEl.addEventListener('pause', onPause);

    return () => {
      // When leaving Phone app, stop playback and restore background music immediately
      audioManager.stopVoiceTrack();
      voiceEl.removeEventListener('timeupdate', onTimeUpdate);
      voiceEl.removeEventListener('ended', onEnded);
      voiceEl.removeEventListener('play', onPlay);
      voiceEl.removeEventListener('pause', onPause);
    };
  }, [activeAudioSrc]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const selectedCall = caseData.calls.find((c) => c.id === selectedCallId);
  const is0317Logged = discoveredEvidenceIds.includes(CALL_0317_EVD_ID);

  const handleTogglePlayback = (
    trackSrc: string,
    defaultDurationSec: number,
    trackKind: '0317' | 'maya' | 'ryan'
  ) => {
    soundEngine.playTap();
    hapticEngine.medium();

    if (isPlaying && activeAudioSrc === trackSrc) {
      audioManager.pauseVoiceTrack();
    } else {
      if (activeAudioSrc !== trackSrc) {
        setDuration(defaultDurationSec);
        setCurrentTime(0);
      }
      setActiveAudioSrc(trackSrc);
      if (trackKind === 'ryan') {
        setHasListenedRyan(true);
        persistRyanVmListened();
      } else if (trackKind === 'maya') {
        setHasListenedMaya(true);
        persistMayaVmListened();
      } else {
        setHasListened0317(true);
        persistCall0317Listened();
      }
      audioManager.playVoiceTrack(trackSrc);
    }
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    audioManager.seekVoiceTrack(val);
  };

  const handleLogToCase = (evidenceId: string) => {
    soundEngine.playEvidenceLogged();
    hapticEngine.clueDiscovered();
    onDiscoverEvidence(evidenceId);
    showToast('✓ Stamped to Evidence Board');
  };

  const handleSelectCall = (call: CallLogItem) => {
    soundEngine.playTap();
    audioManager.stopVoiceTrack();
    setIsPlaying(false);
    setCurrentTime(0);
    setActiveAudioSrc(null);
    setShowTranscript(false);
    if (call.voicemailAudioSrc === RYAN_VM_001_AUDIO_SRC || call.contactId === 'ryan') {
      setDuration(16.67);
    } else if (call.id === 'call-1' || call.voicemailAudioSrc === MAYA_VM_001_AUDIO_SRC) {
      setDuration(17.14);
    } else if (call.timestamp === '03:17 AM') {
      setDuration(40.8);
    }
    setSelectedCallId(call.id);
  };

  const handleBackToList = () => {
    soundEngine.playTap();
    audioManager.stopVoiceTrack();
    setIsPlaying(false);
    setCurrentTime(0);
    setActiveAudioSrc(null);
    setSelectedCallId(null);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#090d14',
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
            top: '56px',
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

      {/* Top App Bar */}
      <div
        style={{
          height: '52px',
          padding: '0 12px',
          background: 'rgba(15, 23, 42, 0.95)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          zIndex: 10,
        }}
      >
        <button
          onClick={() => {
            if (selectedCallId) {
              handleBackToList();
            } else {
              soundEngine.playTap();
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
            gap: '3px',
            padding: '6px',
          }}
          aria-label={selectedCallId ? 'Back to Recents' : 'Back to Home'}
        >
          <ChevronLeft size={22} />
          {selectedCallId && <span style={{ fontSize: '13px', fontWeight: 600 }}>Recents</span>}
        </button>

        <span style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.2px' }}>
          {selectedCallId ? 'Call Details' : 'Recents'}
        </span>

        <div style={{ width: selectedCallId ? '50px' : '30px' }} />
      </div>

      {/* MAIN VIEW: Call Detail View OR Recents List */}
      {selectedCallId && selectedCall ? (
        /* ==================================================================== */
        /* CALL DETAIL SCREEN                                                   */
        /* ==================================================================== */
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            padding: '16px 14px',
            gap: '14px',
          }}
        >
          {/* Contact Header Card */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '18px 16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '8px',
            }}
          >
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8',
              }}
            >
              <User size={26} />
            </div>

            <div style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
              {selectedCall.contactId === 'unknown' ? 'Unknown' : selectedCall.contactId}
            </div>

            <div style={{ fontSize: '12px', color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace" }}>
              {selectedCall.phoneNumber}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                color: '#64748b',
                marginTop: '4px',
              }}
            >
              <PhoneIncoming size={12} color="#38bdf8" />
              <span>Incoming Call • Today at {selectedCall.timestamp} • {selectedCall.duration}</span>
            </div>
          </div>

          {/* RECOVERED FORENSIC AUDIO PANEL (for 03:17 call) */}
          {selectedCall.timestamp === '03:17 AM' ? (
            <div
              style={{
                background: 'linear-gradient(180deg, #162032 0%, #0f172a 100%)',
                borderRadius: '14px',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                boxShadow: '0 12px 28px rgba(0, 0, 0, 0.45)',
              }}
            >
              {/* Telecom Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Radio size={14} color="#38bdf8" />
                  <span
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 700,
                      color: '#94a3b8',
                      letterSpacing: '0.8px',
                      textTransform: 'uppercase',
                    }}
                  >
                    Carrier Telecom Extraction
                  </span>
                </div>

                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '4px',
                    background: 'rgba(56, 189, 248, 0.15)',
                    color: '#38bdf8',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                  }}
                >
                  AUDIO RECOVERED
                </span>
              </div>

              {/* Title & Play Button Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
                    03:17 AM Call Intercept
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                    Cell Connection • Central Station Mezzanine
                  </div>
                </div>

                {/* Circular Play/Pause Button */}
                <button
                  type="button"
                  onClick={() => handleTogglePlayback(CALL_0317_AUDIO_SRC, 40.8, '0317')}
                  aria-label={isPlaying && activeAudioSrc === CALL_0317_AUDIO_SRC ? 'Pause' : 'Play'}
                  style={{
                    background: isPlaying && activeAudioSrc === CALL_0317_AUDIO_SRC
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
                    boxShadow: isPlaying && activeAudioSrc === CALL_0317_AUDIO_SRC
                      ? '0 0 16px rgba(239, 68, 68, 0.4)'
                      : '0 0 16px rgba(2, 132, 199, 0.4)',
                    transition: 'transform 0.15s ease',
                  }}
                >
                  {isPlaying && activeAudioSrc === CALL_0317_AUDIO_SRC ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: '2px' }} />}
                </button>
              </div>

              {/* Waveform Visualization Bars */}
              <div
                style={{
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '2px',
                  padding: '0 4px',
                  background: 'rgba(0, 0, 0, 0.25)',
                  borderRadius: '8px',
                }}
              >
                {CALL_WAVEFORM_BARS.map((heightPct, idx) => {
                  const barProgress = idx / CALL_WAVEFORM_BARS.length;
                  const currentProgress = duration > 0 ? currentTime / duration : 0;
                  const isPast = barProgress <= currentProgress;
                  return (
                    <div
                      key={idx}
                      style={{
                        flex: 1,
                        height: `${heightPct}%`,
                        background: isPast
                          ? isPlaying && activeAudioSrc === CALL_0317_AUDIO_SRC
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
                  max={duration || 40.8}
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

              {/* Action Buttons: Transcript & Log to Case */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
                {hasListened0317 || is0317Logged ? (
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playTap();
                      setShowTranscript(!showTranscript);
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.07)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      color: '#93c5fd',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <FileText size={13} />
                    <span>{showTranscript ? 'Hide Transcript' : 'Transcript'}</span>
                  </button>
                ) : (
                  <span style={{ fontSize: '10.5px', color: '#64748b', fontStyle: 'italic' }}>
                    Listen to recording to inspect...
                  </span>
                )}

                {/* Log to Case Button */}
                {is0317Logged ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: '#86efac',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}
                  >
                    <FileCheck size={14} />
                    <span>Logged to Board</span>
                  </div>
                ) : hasListened0317 ? (
                  <button
                    type="button"
                    onClick={() => handleLogToCase(CALL_0317_EVD_ID)}
                    style={{
                      background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                      border: '1px solid #38bdf8',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
                    }}
                  >
                    <PlusCircle size={13} />
                    <span>Log to Case Board</span>
                  </button>
                ) : null}
              </div>

              {/* Forensic Transcript Section */}
              {showTranscript && (
                <div
                  style={{
                    background: 'rgba(2, 6, 23, 0.75)',
                    border: '1px solid rgba(56, 189, 248, 0.2)',
                    borderRadius: '8px',
                    padding: '14px',
                    fontSize: '11.5px',
                    color: '#cbd5e1',
                    lineHeight: 1.6,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    maxHeight: '260px',
                    overflowY: 'auto',
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  }}
                >
                  <div style={{ fontSize: '10px', color: '#64748b', letterSpacing: '0.5px', textTransform: 'uppercase', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '6px' }}>
                    Carrier Intercept Log · 03:17:01 – 03:17:52
                  </div>

                  {CALL_0317_CANONICAL_TRANSCRIPT.map((line, idx) => {
                    if (line.speaker === 'SYSTEM') {
                      return (
                        <div key={idx} style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '10.5px' }}>
                          {line.text}
                        </div>
                      );
                    }
                    const isSarah = line.speaker === 'SARAH';
                    return (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            color: isSarah ? '#38bdf8' : '#f59e0b',
                            letterSpacing: '0.4px',
                          }}
                        >
                          {line.speaker}:
                        </span>
                        <span style={{ color: '#e2e8f0', whiteSpace: 'pre-line' }}>{line.text}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : selectedCall.hasAudioVoicemail && selectedCall.voicemailAudioSrc ? (
            /* ==================================================================== */
            /* MAYA & RYAN CANONICAL AUDIO VOICEMAIL PANEL                          */
            /* ==================================================================== */
            (() => {
              const isRyanVm = selectedCall.contactId === 'ryan' || selectedCall.voicemailAudioSrc === RYAN_VM_001_AUDIO_SRC;
              const vmTitle = isRyanVm ? 'Leave It' : 'Call Me';
              const vmDurationSec = isRyanVm ? 16.67 : 17.14;
              const vmDurationFormatted = isRyanVm ? '0:17' : (selectedCall.voicemailDuration || '0:17');
              const vmWaveformBars = isRyanVm ? RYAN_VM_WAVEFORM_BARS : MAYA_VM_WAVEFORM_BARS;
              const vmTranscriptLines = isRyanVm ? RYAN_VM_CANONICAL_TRANSCRIPT : MAYA_VM_CANONICAL_TRANSCRIPT;
              const vmEvidenceId = isRyanVm ? RYAN_VM_001_EVD_ID : MAYA_VM_001_EVD_ID;
              const hasListenedVm = isRyanVm ? hasListenedRyan : hasListenedMaya;
              const isVmLogged = discoveredEvidenceIds.includes(vmEvidenceId);
              const trackKind = isRyanVm ? 'ryan' : 'maya';

              return (
                <div
                  style={{
                    background: 'linear-gradient(180deg, #162032 0%, #0f172a 100%)',
                    borderRadius: '14px',
                    border: '1px solid rgba(56, 189, 248, 0.2)',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    boxShadow: '0 12px 28px rgba(0, 0, 0, 0.45)',
                  }}
                >
                  {/* Voicemail Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Voicemail size={14} color="#38bdf8" />
                      <span
                        style={{
                          fontSize: '10.5px',
                          fontWeight: 700,
                          color: '#94a3b8',
                          letterSpacing: '0.8px',
                          textTransform: 'uppercase',
                        }}
                      >
                        Voicemail Message
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
                      {vmDurationFormatted}
                    </span>
                  </div>

                  {/* Title & Play Button Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
                        {vmTitle}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                        Received {selectedCall.timestamp} • 17 sec
                      </div>
                    </div>

                    {/* Circular Play/Pause Button */}
                    <button
                      type="button"
                      onClick={() => handleTogglePlayback(selectedCall.voicemailAudioSrc!, vmDurationSec, trackKind)}
                      aria-label={isPlaying && activeAudioSrc === selectedCall.voicemailAudioSrc ? 'Pause' : 'Play'}
                      style={{
                        background: isPlaying && activeAudioSrc === selectedCall.voicemailAudioSrc
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
                        boxShadow: isPlaying && activeAudioSrc === selectedCall.voicemailAudioSrc
                          ? '0 0 16px rgba(239, 68, 68, 0.4)'
                          : '0 0 16px rgba(2, 132, 199, 0.4)',
                        transition: 'transform 0.15s ease',
                      }}
                    >
                      {isPlaying && activeAudioSrc === selectedCall.voicemailAudioSrc ? (
                        <Pause size={20} />
                      ) : (
                        <Play size={20} style={{ marginLeft: '2px' }} />
                      )}
                    </button>
                  </div>

                  {/* Waveform Visualization Bars */}
                  <div
                    style={{
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '2px',
                      padding: '0 4px',
                      background: 'rgba(0, 0, 0, 0.25)',
                      borderRadius: '8px',
                    }}
                  >
                    {vmWaveformBars.map((heightPct, idx) => {
                      const barProgress = idx / vmWaveformBars.length;
                      const currentProgress = duration > 0 ? currentTime / duration : 0;
                      const isPast = barProgress <= currentProgress;
                      return (
                        <div
                          key={idx}
                          style={{
                            flex: 1,
                            height: `${heightPct}%`,
                            background: isPast
                              ? isPlaying && activeAudioSrc === selectedCall.voicemailAudioSrc
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
                      max={duration || vmDurationSec}
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

                  {/* Action Buttons: Transcript & Log to Case */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playTap();
                        setShowTranscript(!showTranscript);
                      }}
                      style={{
                        background: 'rgba(255, 255, 255, 0.07)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        color: '#93c5fd',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                    >
                      <FileText size={13} />
                      <span>{showTranscript ? 'Hide Transcript' : 'Transcript'}</span>
                    </button>

                    {/* Log to Case Button */}
                    {isVmLogged ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: '#86efac',
                          fontSize: '11px',
                          fontWeight: 600,
                        }}
                      >
                        <FileCheck size={14} />
                        <span>Logged to Board</span>
                      </div>
                    ) : hasListenedVm ? (
                      <button
                        type="button"
                        onClick={() => handleLogToCase(vmEvidenceId)}
                        style={{
                          background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                          border: '1px solid #38bdf8',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          color: '#ffffff',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
                        }}
                      >
                        <PlusCircle size={13} />
                        <span>Log to Case Board</span>
                      </button>
                    ) : (
                      <span style={{ fontSize: '10.5px', color: '#64748b', fontStyle: 'italic' }}>
                        Listen to voicemail to log...
                      </span>
                    )}
                  </div>

                  {/* Voicemail Transcript Section */}
                  {showTranscript && (
                    <div
                      style={{
                        background: 'rgba(2, 6, 23, 0.75)',
                        border: '1px solid rgba(56, 189, 248, 0.2)',
                        borderRadius: '8px',
                        padding: '14px',
                        fontSize: '11.5px',
                        color: '#cbd5e1',
                        lineHeight: 1.6,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                      }}
                    >
                      <div style={{ fontSize: '10px', color: '#64748b', letterSpacing: '0.5px', textTransform: 'uppercase', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '6px' }}>
                        Voicemail Audio Transcript · {isRyanVm ? 'RYAN-VM-001 (~17s)' : 'MAYA-VM-001 (17s)'}
                      </div>
                      {vmTranscriptLines.map((line, idx) => (
                        <p key={idx} style={{ margin: 0, fontStyle: 'italic', color: '#e2e8f0' }}>
                          "{line}"
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()
          ) : (
            /* Other call info card */
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '10px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              {selectedCall.hasAudioVoicemail && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontSize: '12px', fontWeight: 600 }}>
                    <Voicemail size={14} />
                    <span>Voicemail Recorded ({selectedCall.voicemailDuration})</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#cbd5e1', fontStyle: 'italic', lineHeight: 1.5, background: 'rgba(0, 0, 0, 0.25)', padding: '10px', borderRadius: '6px' }}>
                    {selectedCall.voicemailTranscript}
                  </div>
                </div>
              )}

              {selectedCall.clueEvidenceId && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                  {discoveredEvidenceIds.includes(selectedCall.clueEvidenceId) ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#86efac', fontSize: '11px', fontWeight: 600 }}>
                      <FileCheck size={14} />
                      <span>Logged to Board</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleLogToCase(selectedCall.clueEvidenceId!)}
                      style={{
                        background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                        border: '1px solid #38bdf8',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                    >
                      <PlusCircle size={13} />
                      <span>Log to Case Board</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* ==================================================================== */
        /* RECENTS / VOICEMAIL LIST VIEW                                        */
        /* ==================================================================== */
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {/* Sub-navigation Tabs: Recents & Voicemail */}
          <div
            style={{
              display: 'flex',
              padding: '10px 12px 6px 12px',
              gap: '8px',
              background: 'rgba(15, 23, 42, 0.75)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <button
              onClick={() => {
                soundEngine.playTap();
                setActiveTab('recents');
              }}
              style={{
                flex: 1,
                padding: '7px 10px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: activeTab === 'recents' ? 'rgba(56, 189, 248, 0.4)' : 'rgba(255, 255, 255, 0.06)',
                background: activeTab === 'recents' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(15, 23, 42, 0.4)',
                color: activeTab === 'recents' ? '#38bdf8' : '#94a3b8',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              <PhoneIncoming size={13} />
              <span>All Calls ({caseData.calls.length})</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playTap();
                setActiveTab('voicemail');
              }}
              style={{
                flex: 1,
                padding: '7px 10px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: activeTab === 'voicemail' ? 'rgba(56, 189, 248, 0.4)' : 'rgba(255, 255, 255, 0.06)',
                background: activeTab === 'voicemail' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(15, 23, 42, 0.4)',
                color: activeTab === 'voicemail' ? '#38bdf8' : '#94a3b8',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              <Voicemail size={13} />
              <span>Voicemails ({caseData.calls.filter((c) => c.hasAudioVoicemail || c.voicemailTranscript).length})</span>
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>
              {activeTab === 'voicemail' ? 'Voicemail Inbox' : `Recent Calls (${caseData.calls.length})`}
            </div>

            {(activeTab === 'voicemail'
              ? caseData.calls.filter((c) => c.hasAudioVoicemail || c.voicemailTranscript)
              : caseData.calls
            ).map((call) => {
            const char = caseData.characters.find((c) => c.id === call.contactId);
            const is0317 = call.timestamp === '03:17 AM';
            const isLogged = call.clueEvidenceId ? discoveredEvidenceIds.includes(call.clueEvidenceId) : false;

            return (
              <div
                key={call.id}
                onClick={() => handleSelectCall(call)}
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: is0317
                    ? '1px solid rgba(56, 189, 248, 0.25)'
                    : '1px solid rgba(255, 255, 255, 0.05)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'background 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {call.type === 'missed' ? (
                    <PhoneMissed size={16} color="#ef4444" />
                  ) : call.type === 'incoming' ? (
                    <PhoneIncoming size={16} color="#38bdf8" />
                  ) : (
                    <PhoneOutgoing size={16} color="#22c55e" />
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>
                      {char ? char.name : 'Unknown'}
                    </div>

                    <div style={{ fontSize: '10.5px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {call.hasAudioVoicemail ? (
                        <>
                          <span>Voicemail</span>
                          <span>• {call.voicemailDuration || '17 sec'}</span>
                        </>
                      ) : (
                        <>
                          <span>
                            {call.type === 'incoming'
                              ? 'Incoming Call'
                              : call.type === 'outgoing'
                              ? 'Outgoing Call'
                              : 'Missed Call'}
                          </span>
                          {call.duration && call.duration !== '0:00' && (
                            <span>• {call.duration}</span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isLogged ? (
                    <span
                      style={{
                        fontSize: '9px',
                        background: 'rgba(34, 197, 94, 0.15)',
                        color: '#86efac',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: 600,
                      }}
                    >
                      LOGGED
                    </span>
                  ) : is0317 ? (
                    <span
                      style={{
                        fontSize: '9px',
                        background: 'rgba(56, 189, 248, 0.15)',
                        color: '#38bdf8',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: 600,
                      }}
                    >
                      AUDIO
                    </span>
                  ) : call.hasAudioVoicemail ? (
                    <span
                      style={{
                        fontSize: '9px',
                        background: 'rgba(245, 158, 11, 0.15)',
                        color: '#f59e0b',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: 600,
                      }}
                    >
                      VOICEMAIL
                    </span>
                  ) : null}

                  <span style={{ fontSize: '11px', color: '#64748b', fontFamily: "'JetBrains Mono', monospace" }}>
                    {call.timestamp}
                  </span>

                  <ChevronRight size={15} color="#475569" />
                </div>
              </div>
            );
          })}
          </div>
        </div>
      )}
    </div>
  );
};
