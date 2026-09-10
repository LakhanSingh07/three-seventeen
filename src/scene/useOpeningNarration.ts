/**
 * useOpeningNarration
 *
 * Manages the Case 001 first-entry investigation-table narration.
 * - Plays only once (persisted via localStorage).
 * - Drives timed "beat phases" for environmental focus without fragile
 *   word-exact subtitle-style sync.
 * - Coordinates music ducking through AudioManager.
 * - Exposes skip() to immediately finish the sequence.
 *
 * Beat phase map (broad sections, not subtitle timings):
 *   0  : idle / pre-start
 *   1  : establishing — Sarah intro (~0–8s)
 *   2  : disappearance / recovered material (~8–18s)
 *   3  : phone / recordings / messages (~18–30s)
 *   4  : "one call…" isolation (~30–40s)
 *   5  : "3:17" emphasis (~40–50s)
 *   6  : "Everything we have is on this table" — reveal (~50–58s)
 *   7  : "Find out what happened." — enable interaction (~58s+)
 *   8  : complete (post-narration settle)
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { audioManager } from '../system/AudioManager';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

export const NARRATION_ASSET_PATH = '/assets/MUSIC/SARAH_CASE001_OPENING_NARRATION_FINAL.mp3';
const STORAGE_KEY = '317_case001_intro_played';

export type NarrationPhase = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface OpeningNarrationState {
  /** Whether this is the first entry (narration should play). */
  isFirstEntry: boolean;
  /** Current narrative beat phase (0=idle, 1-7=during narration, 8=complete). */
  phase: NarrationPhase;
  /** True while narration audio is actively playing. */
  isPlaying: boolean;
  /** True once interaction should be enabled (phase >= 7). */
  isInteractionEnabled: boolean;
  /** True when the initial discovery sweep animation should run (phase 7→8 transition). */
  shouldRunDiscoverySweep: boolean;
  /** Skip the narration immediately. */
  skip: () => void;
  /** Mark as complete (called internally or by skip). */
  complete: () => void;
}

/**
 * Approximate beat cue times in seconds from narration start.
 * Tuned by ear against the supplied mastered audio asset.
 * These are broad section markers — NOT subtitle triggers.
 * Adjust BEAT_TIMES if narration duration differs from expected.
 */
const BEAT_TIMES: Record<NarrationPhase, number> = {
  0: 0,    // pre-start
  1: 1.2,  // establishing: Sarah introduced
  2: 9.0,  // disappearance / recovered material
  3: 18.5, // phone / messages / recordings
  4: 30.0, // "one call…" — surrounding emphasis reduces
  5: 41.0, // "3:17 A.M." — restrained phone focus
  6: 51.0, // "Everything we have is on this table" — full reveal
  7: 57.0, // "Find out what happened." — enable interaction
  8: 999,  // sentinel
};

function hasPlayed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function persistPlayed(): void {
  try {
    localStorage.setItem(STORAGE_KEY, 'true');
  } catch { /* ignore */ }
}

export function useOpeningNarration(): OpeningNarrationState {
  const reducedMotion = usePrefersReducedMotion();
  const [isFirstEntry] = useState(() => !hasPlayed());
  const [phase, setPhase] = useState<NarrationPhase>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shouldRunDiscoverySweep, setShouldRunDiscoverySweep] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const beatTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const startTimeRef = useRef<number>(0);
  const completedRef = useRef(false);
  const sweepFiredRef = useRef(false);

  const isInteractionEnabled = !isFirstEntry || phase >= 7;

  const clearBeatTimers = useCallback(() => {
    beatTimersRef.current.forEach(clearTimeout);
    beatTimersRef.current = [];
  }, []);

  const complete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    clearBeatTimers();

    // Stop narration audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Restore music (700ms breathing space before restore)
    setTimeout(() => {
      audioManager.unduckMusic(1.4);
    }, 700);

    setIsPlaying(false);
    setPhase(7);
    persistPlayed();

    // Discovery sweep fires once
    if (!sweepFiredRef.current) {
      sweepFiredRef.current = true;
      setShouldRunDiscoverySweep(true);
      setTimeout(() => setShouldRunDiscoverySweep(false), 2200);
    }

    // Settle to complete
    setTimeout(() => setPhase(8), 200);
  }, [clearBeatTimers]);

  const skip = useCallback(() => {
    complete();
  }, [complete]);

  useEffect(() => {
    if (!isFirstEntry) return;

    // For reduced-motion users: skip all animation, just mark played & enable immediately.
    if (reducedMotion) {
      persistPlayed();
      setPhase(8);
      return;
    }

    // Create dedicated narration audio element (separate from AudioManager voice channel
    // so it doesn't interfere with voicemail playback state).
    const audio = new Audio(NARRATION_ASSET_PATH);
    audio.preload = 'auto';
    audio.volume = audioManager.getEffectiveVolume('voice');
    audioRef.current = audio;

    // Duck investigation music heavily for narration
    const beginNarration = () => {
      if (completedRef.current) return;

      // Heavy duck: narration is dominant (ratio 0.15 = ~85% reduction)
      audioManager.duckMusic(0.15, 0.5);

      setIsPlaying(true);
      startTimeRef.current = performance.now();

      // Schedule beat phase transitions
      const scheduleBeats = () => {
        clearBeatTimers();
        const now = audio.currentTime;

        (Object.entries(BEAT_TIMES) as [string, number][]).forEach(([phaseStr, cueSec]) => {
          const p = parseInt(phaseStr) as NarrationPhase;
          if (p < 1) return; // skip phase 0
          const delay = Math.max(0, (cueSec - now) * 1000);

          const t = setTimeout(() => {
            if (!completedRef.current) {
              setPhase(p);
              // Phase 7: enable interaction, start discovery sweep
              if (p === 7 && !sweepFiredRef.current) {
                sweepFiredRef.current = true;
                setShouldRunDiscoverySweep(true);
                setTimeout(() => setShouldRunDiscoverySweep(false), 2200);
              }
            }
          }, delay);

          beatTimersRef.current.push(t);
        });
      };

      scheduleBeats();
      audio.play().catch(() => {
        // Autoplay blocked — complete immediately, interaction still enabled
        complete();
      });
    };

    // Slight entry delay: let room establish for ~1s before narration
    const entryDelay = setTimeout(beginNarration, 1100);

    audio.addEventListener('ended', complete);

    return () => {
      clearTimeout(entryDelay);
      clearBeatTimers();
      audio.removeEventListener('ended', complete);
      audio.pause();
      // Restore music if unmounted before completion
      if (!completedRef.current) {
        audioManager.unduckMusic(0.8);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isFirstEntry,
    phase,
    isPlaying,
    isInteractionEnabled,
    shouldRunDiscoverySweep,
    skip,
    complete,
  };
}
