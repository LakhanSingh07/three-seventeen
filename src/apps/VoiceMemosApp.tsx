import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Play, Pause, FileCheck, PlusCircle, Check, FileText } from 'lucide-react';
import type { CaseData } from '../cases/types';
import { soundEngine } from '../system/SoundEngine';
import { hapticEngine } from '../system/HapticEngine';
import { audioManager } from '../system/AudioManager';

interface VoiceMemosAppProps {
  caseData: CaseData;
  discoveredEvidenceIds: string[];
  onDiscoverEvidence: (evidenceId: string) => void;
  onBackToHome: () => void;
}

export const SARAH_NOTE_TO_SELF_SRC = '/assets/audio/voice/sarah/SAR-VM-001_note-to-self.mp3';
export const SARAH_NOTE_TO_SELF_EVD_ID = 'EVD_VOICE_MEMO_SAR_VM_001';

export const SARAH_NUMBERS_DONT_MATCH_SRC = '/assets/audio/voice/sarah/SAR-VM-002_numbers-dont-match.mp3';
export const SARAH_NUMBERS_DONT_MATCH_EVD_ID = 'EVD_VOICE_MEMO_SAR_VM_002';

export const SARAH_SOMEONE_CHANGED_IT_SRC = '/assets/audio/voice/sarah/SAR-VM-003_someone-changed-it.mp3';
export const SARAH_SOMEONE_CHANGED_IT_EVD_ID = 'EVD_VOICE_MEMO_SAR_VM_003';

export const SARAH_MOVED_THE_COPY_SRC = '/assets/audio/voice/sarah/SAR-VM-004_moved-the-copy.mp3';
export const SARAH_MOVED_THE_COPY_EVD_ID = 'EVD_VOICE_MEMO_SAR_VM_004';

export const SARAH_I_WAS_FOLLOWED_SRC = '/assets/audio/voice/sarah/SAR-VM-005_i-was-followed.mp3';
export const SARAH_I_WAS_FOLLOWED_EVD_ID = 'EVD_VOICE_MEMO_SAR_VM_005';

const LISTENED_MEMOS_KEY = '317_voice_memos_listened';
const UNLOCKED_MEMOS_KEY = '317_voice_memos_unlocked';

function getInitialListenedMemos(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LISTENED_MEMOS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function persistMemoListened(memoId: string) {
  if (typeof window === 'undefined') return;
  try {
    const current = getInitialListenedMemos();
    current[memoId] = true;
    localStorage.setItem(LISTENED_MEMOS_KEY, JSON.stringify(current));
  } catch {
    // ignore
  }
}

function getInitialUnlockedMemos(): Record<string, boolean> {
  const defaults: Record<string, boolean> = {
    'SAR-VM-001': true,
    'SAR-VM-002': true,
    'SAR-VM-317': true,
  };
  if (typeof window === 'undefined') return defaults;
  try {
    const raw = localStorage.getItem(UNLOCKED_MEMOS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return { ...defaults, ...parsed };
  } catch {
    return defaults;
  }
}

function persistUnlockedMemo(memoId: string) {
  if (typeof window === 'undefined') return;
  try {
    const current = getInitialUnlockedMemos();
    current[memoId] = true;
    localStorage.setItem(UNLOCKED_MEMOS_KEY, JSON.stringify(current));
  } catch {
    // ignore
  }
}

interface MemoItem {
  id: string;
  evidenceId: string;
  title: string;
  recordedAt: string;
  durationSec: number;
  durationLabel: string;
  audioSrc?: string;
  transcript: string;
  hasRealAudio: boolean;
}

const ALL_MEMOS: MemoItem[] = [
  {
    id: 'SAR-VM-001',
    evidenceId: SARAH_NOTE_TO_SELF_EVD_ID,
    title: 'Note to Self',
    recordedAt: 'Sep 7, 11:15 PM',
    durationSec: 14.5,
    durationLabel: '0:14',
    audioSrc: SARAH_NOTE_TO_SELF_SRC,
    transcript: `Okay... note to self.

Talk to Ryan tomorrow about those numbers. Something still doesn't add up.

And don't message him about it. Just talk at work.

Also... Maya's going to kill me if I forget Saturday again.

That's it. I'm going to sleep.`,
    hasRealAudio: true,
  },
  {
    id: 'SAR-VM-002',
    evidenceId: SARAH_NUMBERS_DONT_MATCH_EVD_ID,
    title: "Numbers Don't Match",
    recordedAt: 'Sep 8, 06:15 PM',
    durationSec: 15.8,
    durationLabel: '0:16',
    audioSrc: SARAH_NUMBERS_DONT_MATCH_SRC,
    transcript: `Okay... this is weird.

I checked the numbers again. Twice.

They don't match what Ryan showed me yesterday.

Maybe I'm missing something, but... there are entries here that shouldn't exist.

I'm not sending screenshots. Not yet.

I'll make a copy and keep it somewhere else.

Just in case.`,
    hasRealAudio: true,
  },
  {
    id: 'SAR-VM-003',
    evidenceId: SARAH_SOMEONE_CHANGED_IT_EVD_ID,
    title: 'Someone Changed It',
    recordedAt: 'Sep 8, 08:30 PM',
    durationSec: 20.1,
    durationLabel: '0:20',
    audioSrc: SARAH_SOMEONE_CHANGED_IT_SRC,
    transcript: `Wait... no.

I know what I saw.

The entries I flagged yesterday... they're gone.

Not corrected. Gone.

And the access log says I opened the file again at 1:12 this morning.

I didn't.

Someone used my account.

...Okay. I'm making a copy now.

And I'm not keeping it here.`,
    hasRealAudio: true,
  },
  {
    id: 'SAR-VM-004',
    evidenceId: SARAH_MOVED_THE_COPY_EVD_ID,
    title: 'Moved the Copy',
    recordedAt: 'Sep 8, 10:45 PM',
    durationSec: 19.8,
    durationLabel: '0:20',
    audioSrc: SARAH_MOVED_THE_COPY_SRC,
    transcript: `Okay... I moved the copy.

It's not at home, and it's not at work.

I don't want it anywhere connected to me.

Maya doesn't know. Ryan doesn't know. Nobody does.

I wrote down what I need so I don't forget it.

If I'm overreacting... fine.

But until I know who used my account, it stays where it is.`,
    hasRealAudio: true,
  },
  {
    id: 'SAR-VM-005',
    evidenceId: SARAH_I_WAS_FOLLOWED_EVD_ID,
    title: 'I Was Followed',
    recordedAt: 'Sep 9, 02:45 AM',
    durationSec: 24.1,
    durationLabel: '0:24',
    audioSrc: SARAH_I_WAS_FOLLOWED_SRC,
    transcript: `I think someone followed me tonight.

I noticed the same car twice.

Once outside the café... and again near the station.

Maybe it's nothing.

...No.

I'm done telling myself that.

Someone accessed my account. Someone erased those entries.

And now this.

I'm going to get the copy.

Then I'm calling Maya.`,
    hasRealAudio: true,
  },
  {
    id: 'SAR-VM-317',
    evidenceId: 'EVD_VOICE_MEMO_317',
    title: 'Emergency Audio Memo',
    recordedAt: 'Sep 9, 03:20 AM',
    durationSec: 34.0,
    durationLabel: '0:34',
    transcript: `(Heavy breathing, vehicle engine acceleration in background) Someone was waiting by the locker exit... a black sedan has been tailing me since 42nd Street. If you find this phone, the master drive is in Locker 28. Code 8-3-1-7. Don't let Ardent take it...`,
    hasRealAudio: false,
  },
];

function computeUnlockedMemos(
  persisted: Record<string, boolean>,
  played: Record<string, boolean>,
  discovered: string[]
): Record<string, boolean> {
  const result = { ...persisted };
  result['SAR-VM-001'] = true;
  result['SAR-VM-002'] = true;
  result['SAR-VM-317'] = true;

  if (
    !result['SAR-VM-003'] &&
    (played['SAR-VM-002'] ||
      discovered.includes('EVD_VOICE_MEMO_SAR_VM_002') ||
      discovered.includes('EVD_NOTE_PROJECT_VANGUARD') ||
      discovered.includes('EVD_MSG_RYAN_WARNING') ||
      discovered.includes('EVD_MSG_RYAN_THREAT'))
  ) {
    result['SAR-VM-003'] = true;
    persistUnlockedMemo('SAR-VM-003');
  }

  if (
    !result['SAR-VM-004'] &&
    (played['SAR-VM-003'] || discovered.includes('EVD_VOICE_MEMO_SAR_VM_003'))
  ) {
    result['SAR-VM-004'] = true;
    persistUnlockedMemo('SAR-VM-004');
  }

  const hasLocationClue =
    discovered.includes('EVD_PHOTO_REFLECTION') ||
    discovered.includes('EVD_PHOTO_EXIF_STATION') ||
    discovered.includes('EVD_MAP_ALEX_STATION') ||
    discovered.includes('EVD_NOTE_LOCKER28') ||
    discovered.includes('EVD_MSG_MAYA_WARNING') ||
    discovered.includes('EVD_VOICE_MEMO_SAR_VM_005');

  if (
    !result['SAR-VM-005'] &&
    (played['SAR-VM-004'] || discovered.includes('EVD_VOICE_MEMO_SAR_VM_004')) &&
    hasLocationClue
  ) {
    result['SAR-VM-005'] = true;
    persistUnlockedMemo('SAR-VM-005');
  }

  return result;
}

export const VoiceMemosApp: React.FC<VoiceMemosAppProps> = ({
  caseData: _caseData,
  discoveredEvidenceIds,
  onDiscoverEvidence,
  onBackToHome,
}) => {
  const [selectedMemoId, setSelectedMemoId] = useState<string>('SAR-VM-001');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(14.5);
  const [hasPlayedMemo, setHasPlayedMemo] = useState<Record<string, boolean>>(getInitialListenedMemos);
  const [showTranscript, setShowTranscript] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const unlockedMemos = React.useMemo(
    () => computeUnlockedMemos(getInitialUnlockedMemos(), hasPlayedMemo, discoveredEvidenceIds),
    [hasPlayedMemo, discoveredEvidenceIds]
  );

  const visibleMemos = ALL_MEMOS.filter((memo) => unlockedMemos[memo.id]);
  const selectedMemo = visibleMemos.find((m) => m.id === selectedMemoId) || visibleMemos[0] || ALL_MEMOS[0];
  const isSelectedLogged = discoveredEvidenceIds.includes(selectedMemo.evidenceId);

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
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    voiceEl.addEventListener('timeupdate', onTimeUpdate);
    voiceEl.addEventListener('ended', onEnded);
    voiceEl.addEventListener('play', onPlay);
    voiceEl.addEventListener('pause', onPause);

    return () => {
      // When leaving Voice Memos app, stop playback and restore background music immediately
      audioManager.stopVoiceTrack();
      voiceEl.removeEventListener('timeupdate', onTimeUpdate);
      voiceEl.removeEventListener('ended', onEnded);
      voiceEl.removeEventListener('play', onPlay);
      voiceEl.removeEventListener('pause', onPause);
    };
  }, []);

  const handleTogglePlayback = () => {
    soundEngine.playTap();
    hapticEngine.medium();

    if (!selectedMemo.hasRealAudio || !selectedMemo.audioSrc) {
      // Non-audio fallback memo
      setIsPlaying(!isPlaying);
      setHasPlayedMemo((prev) => ({ ...prev, [selectedMemo.id]: true }));
      persistMemoListened(selectedMemo.id);
      return;
    }

    if (isPlaying) {
      audioManager.pauseVoiceTrack();
    } else {
      setHasPlayedMemo((prev) => ({ ...prev, [selectedMemo.id]: true }));
      persistMemoListened(selectedMemo.id);
      audioManager.playVoiceTrack(selectedMemo.audioSrc);
    }
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    audioManager.seekVoiceTrack(val);
  };

  const handleLogToCase = () => {
    soundEngine.playEvidenceLogged();
    hapticEngine.clueDiscovered();
    onDiscoverEvidence(selectedMemo.evidenceId);
    showToast('✓ Stamped to Evidence Board');
  };

  const handleSelectMemo = (memoId: string) => {
    if (memoId === selectedMemoId) return;
    soundEngine.playTap();
    audioManager.stopVoiceTrack();
    setIsPlaying(false);
    setCurrentTime(0);
    setShowTranscript(false);
    setSelectedMemoId(memoId);
    const target = ALL_MEMOS.find((m) => m.id === memoId);
    if (target) {
      setDuration(target.durationSec);
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const canShowTranscript = hasPlayedMemo[selectedMemo.id] || isSelectedLogged;

  return (
    <div
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#090d14',
        color: '#f1f5f9',
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

      {/* App Top Bar */}
      <div
        style={{
          height: '52px',
          padding: '0 12px',
          background: 'rgba(15, 23, 42, 0.92)',
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
            soundEngine.playTap();
            audioManager.stopVoiceTrack();
            onBackToHome();
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#38bdf8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            padding: '6px',
          }}
          aria-label="Back to home"
        >
          <ChevronLeft size={22} />
        </button>

        <span style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.2px' }}>
          Voice Memos
        </span>

        <div style={{ width: '34px' }} />
      </div>

      {/* Main Content Area */}
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
        {/* Selected Active Memo Player Card */}
        <div
          style={{
            background: 'linear-gradient(180deg, #162032 0%, #0f172a 100%)',
            borderRadius: '14px',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            padding: '16px',
            boxShadow: '0 12px 28px rgba(0, 0, 0, 0.45)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          {/* Header Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.2px' }}>
                {selectedMemo.title}
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px' }}>
                {selectedMemo.recordedAt} • {selectedMemo.durationLabel}
              </div>
            </div>

            {/* Play / Pause Circular Button */}
            <button
              type="button"
              onClick={handleTogglePlayback}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              style={{
                background: isPlaying ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #0284c7, #0369a1)',
                border: 'none',
                borderRadius: '50%',
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                cursor: 'pointer',
                boxShadow: isPlaying ? '0 0 16px rgba(239, 68, 68, 0.4)' : '0 0 16px rgba(2, 132, 199, 0.4)',
                transition: 'transform 0.15s ease, filter 0.15s ease',
              }}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: '2px' }} />}
            </button>
          </div>

          {/* Waveform Visualization Bars */}
          <div
            style={{
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '3px',
              padding: '0 4px',
              background: 'rgba(0, 0, 0, 0.25)',
              borderRadius: '8px',
            }}
          >
            {[
              24, 45, 75, 90, 60, 40, 65, 85, 100, 70, 50, 65, 80, 95, 85, 60, 45, 70, 90, 75, 40, 60, 85, 95, 70,
              45, 30, 60, 75, 50, 35, 20,
            ].map((heightPct, idx) => {
              const barProgress = idx / 32;
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

          {/* Audio Scrubber Slider */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <input
              type="range"
              min="0"
              max={duration || 15.4}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b' }}>
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Action Row: Transcript Toggle & Log to Case */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
            {canShowTranscript ? (
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
                  padding: '5px 10px',
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
                Play recording to inspect...
              </span>
            )}

            {/* Log to Case Button */}
            {isSelectedLogged ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#86efac', fontSize: '11px', fontWeight: 600 }}>
                <FileCheck size={14} />
                <span>Logged to Board</span>
              </div>
            ) : canShowTranscript ? (
              <button
                type="button"
                onClick={handleLogToCase}
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

          {/* Transcript Dropdown */}
          {showTranscript && (
            <div
              style={{
                background: 'rgba(2, 6, 23, 0.65)',
                border: '1px solid rgba(56, 189, 248, 0.15)',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '12px',
                color: '#cbd5e1',
                lineHeight: 1.6,
                whiteSpace: 'pre-line',
                fontStyle: 'italic',
                animation: 'fadeIn 0.2s ease',
              }}
            >
              "{selectedMemo.transcript}"
            </div>
          )}
        </div>

        {/* Section Header: All Recordings */}
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '6px' }}>
          All Recordings ({visibleMemos.length})
        </div>

        {/* Memo Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {visibleMemos.map((memo) => {
            const isSelected = memo.id === selectedMemoId;
            const isLogged = discoveredEvidenceIds.includes(memo.evidenceId);
            return (
              <div
                key={memo.id}
                onClick={() => handleSelectMemo(memo.id)}
                style={{
                  background: isSelected ? 'rgba(30, 41, 59, 0.85)' : 'rgba(15, 23, 42, 0.6)',
                  border: isSelected ? '1px solid #0284c7' : '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '10px',
                  padding: '11px 14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'background 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ fontSize: '13px', fontWeight: isSelected ? 700 : 500, color: '#f8fafc' }}>
                    {memo.title}
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>
                    {memo.recordedAt}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isLogged && (
                    <span style={{ fontSize: '9px', background: 'rgba(34, 197, 94, 0.15)', color: '#86efac', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                      LOGGED
                    </span>
                  )}
                  <span style={{ fontSize: '11px', color: '#64748b', fontFamily: "'JetBrains Mono', monospace" }}>
                    {memo.durationLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
