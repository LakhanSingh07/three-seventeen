/**
 * 3:17 Centralized Audio Manager
 *
 * Architecture:
 * AudioManager
 *  ├── Music (Dual-deck streaming HTMLAudioElement system for smooth crossfades, phone attenuation, ducking, seamless loop)
 *  ├── Ambience (Background environmental bed: rain, room tone, etc.)
 *  ├── SFX (Low-latency WebAudio procedural synth + sample player, bus-scaled)
 *  └── Voice (Highest priority dialogue/voicemails, automatic music/ambience ducking)
 *
 * Canonical Assets:
 * - Track 01: /assets/audio/music/midnight-evidence.mp3 ("Midnight Evidence" — Main Title / Case Entry)
 * - Track 02: /assets/audio/music/investigation-room.mp3 ("Silent Investigation" — Investigation Room Bed)
 */

export type AudioBus = 'master' | 'music' | 'ambience' | 'sfx' | 'voice';

export interface AudioSettings {
  masterVolume: number;
  musicVolume: number;
  ambienceVolume: number;
  sfxVolume: number;
  voiceVolume: number;
  masterMuted: boolean;
  musicMuted: boolean;
  ambienceMuted: boolean;
  sfxMuted: boolean;
  voiceMuted: boolean;
}

const STORAGE_KEY = '317_audio_settings';

const DEFAULT_SETTINGS: AudioSettings = {
  masterVolume: 1.0,
  musicVolume: 0.52, // 45-60% default as specified
  ambienceVolume: 0.70,
  sfxVolume: 0.85,
  voiceVolume: 1.0,
  masterMuted: false,
  musicMuted: false,
  ambienceMuted: false,
  sfxMuted: false,
  voiceMuted: false,
};

export const TITLE_MUSIC_PATH = '/assets/audio/music/midnight-evidence.mp3';
export const INVESTIGATION_MUSIC_PATH = '/assets/audio/music/investigation-room.mp3';

// Investigation room music is tuned significantly quieter than title music (~55% of title level)
export const INVESTIGATION_ROOM_VOLUME_FACTOR = 0.55;

// Sarah's phone attenuation (25-35% of room level when inside NOVA OS)
export const PHONE_ATTENUATION_FACTOR = 0.30;

type SettingsListener = (settings: AudioSettings) => void;

interface MusicDeck {
  audio: HTMLAudioElement;
  src: string | null;
  fadeRaf: number | null;
  baseVolumeRatio: number; // 1.0 for Title, INVESTIGATION_ROOM_VOLUME_FACTOR for Investigation
}

export class AudioManager {
  private static instance: AudioManager | null = null;
  private settings: AudioSettings;
  private listeners: Set<SettingsListener> = new Set();

  // Dual-deck Music Channel for studio-grade crossfades
  private deckA: MusicDeck;
  private deckB: MusicDeck;
  private activeDeckKey: 'A' | 'B' = 'A';

  private musicDuckingMultiplier: number = 1.0;
  private phoneFocusMultiplier: number = 1.0;
  private isMusicPlayingIntent: boolean = false;
  private wasMusicPlayingBeforeInterruption: boolean = false;
  private activeTrackKind: 'title' | 'investigation' | 'other' = 'title';

  // Ambience Channel
  private ambienceAudio: HTMLAudioElement | null = null;
  private currentAmbienceSrc: string | null = null;
  private ambienceFadeRaf: number | null = null;
  private ambienceDuckingMultiplier: number = 1.0;
  private isAmbiencePlayingIntent: boolean = false;

  // Voice Channel
  private voiceAudio: HTMLAudioElement | null = null;

  // Autoplay gesture unlock queue
  private pendingMusicPlay: (() => void) | null = null;
  private isUnlockListenerAttached: boolean = false;

  // Web Audio Context for SFX
  private sfxCtx: AudioContext | null = null;

  private constructor() {
    this.settings = this.loadSettings();

    // Initialize dual decks
    this.deckA = this.createMusicDeck();
    this.deckB = this.createMusicDeck();

    this.setupLifecycleListeners();
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  private createMusicDeck(): MusicDeck {
    const audio = typeof window !== 'undefined' ? new Audio() : ({} as HTMLAudioElement);
    if (typeof window !== 'undefined') {
      audio.preload = 'auto';
      audio.loop = true;
      audio.volume = 0;

      // Handle continuous looping seamlessly
      audio.addEventListener('timeupdate', () => {
        const dur = audio.duration;
        const cur = audio.currentTime;
        if (dur > 0 && cur >= dur - 0.25) {
          // Native loop wraps smoothly; volume stays stable
        }
      });
    }

    return {
      audio,
      src: null,
      fadeRaf: null,
      baseVolumeRatio: 1.0,
    };
  }

  /* -------------------------------------------------------------------------- */
  /* Persistence & Settings                                                     */
  /* -------------------------------------------------------------------------- */

  private loadSettings(): AudioSettings {
    if (typeof window === 'undefined') return { ...DEFAULT_SETTINGS };
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
        };
      }
    } catch {
      // Fall back to defaults
    }
    return { ...DEFAULT_SETTINGS };
  }

  private saveSettings(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch {
      // Storage unavailable
    }
    this.notifyListeners();
  }

  public getSettings(): AudioSettings {
    return { ...this.settings };
  }

  public getActiveTrackKind(): 'title' | 'investigation' | 'other' {
    return this.activeTrackKind;
  }

  public subscribe(listener: SettingsListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const copy = { ...this.settings };
    this.listeners.forEach((l) => {
      try {
        l(copy);
      } catch (err) {
        console.error('AudioSettings listener error:', err);
      }
    });
  }

  public setMasterVolume(val: number): void {
    this.settings.masterVolume = Math.max(0, Math.min(1, val));
    this.updateActiveVolumes();
    this.saveSettings();
  }

  public setMusicVolume(val: number): void {
    this.settings.musicVolume = Math.max(0, Math.min(1, val));
    this.updateActiveVolumes();
    this.saveSettings();
  }

  public setAmbienceVolume(val: number): void {
    this.settings.ambienceVolume = Math.max(0, Math.min(1, val));
    this.updateActiveVolumes();
    this.saveSettings();
  }

  public setSfxVolume(val: number): void {
    this.settings.sfxVolume = Math.max(0, Math.min(1, val));
    this.saveSettings();
  }

  public setVoiceVolume(val: number): void {
    this.settings.voiceVolume = Math.max(0, Math.min(1, val));
    if (this.voiceAudio) {
      this.voiceAudio.volume = this.getEffectiveVolume('voice');
    }
    this.saveSettings();
  }

  public toggleMasterMute(): boolean {
    this.settings.masterMuted = !this.settings.masterMuted;
    this.updateActiveVolumes();
    this.saveSettings();
    return this.settings.masterMuted;
  }

  public toggleMusicMute(): boolean {
    this.settings.musicMuted = !this.settings.musicMuted;
    this.updateActiveVolumes();
    this.saveSettings();
    return this.settings.musicMuted;
  }

  public isMusicMuted(): boolean {
    return this.settings.masterMuted || this.settings.musicMuted;
  }

  public isMasterMuted(): boolean {
    return this.settings.masterMuted;
  }

  public getEffectiveVolume(bus: AudioBus): number {
    if (this.settings.masterMuted) return 0;
    switch (bus) {
      case 'master':
        return this.settings.masterVolume;
      case 'music':
        if (this.settings.musicMuted) return 0;
        return this.settings.masterVolume * this.settings.musicVolume * this.musicDuckingMultiplier * this.phoneFocusMultiplier;
      case 'ambience':
        if (this.settings.ambienceMuted) return 0;
        return this.settings.masterVolume * this.settings.ambienceVolume * this.ambienceDuckingMultiplier;
      case 'sfx':
        if (this.settings.sfxMuted) return 0;
        return this.settings.masterVolume * this.settings.sfxVolume;
      case 'voice':
        if (this.settings.voiceMuted) return 0;
        return this.settings.masterVolume * this.settings.voiceVolume;
      default:
        return 1.0;
    }
  }

  private getDeckTargetVolume(deck: MusicDeck): number {
    return this.getEffectiveVolume('music') * deck.baseVolumeRatio;
  }

  private updateActiveVolumes(): void {
    const activeDeck = this.getActiveDeck();
    if (activeDeck.audio && !activeDeck.fadeRaf && !activeDeck.audio.paused) {
      activeDeck.audio.volume = this.getDeckTargetVolume(activeDeck);
    }
    if (this.ambienceAudio && !this.ambienceFadeRaf && !this.ambienceAudio.paused) {
      this.ambienceAudio.volume = this.getEffectiveVolume('ambience');
    }
    if (this.voiceAudio) {
      this.voiceAudio.volume = this.getEffectiveVolume('voice');
    }
  }

  /* -------------------------------------------------------------------------- */
  /* Mobile Lifecycle & Autoplay Handling                                       */
  /* -------------------------------------------------------------------------- */

  private setupLifecycleListeners(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    // Handle mobile background / tab switch
    document.addEventListener('visibilitychange', () => {
      const activeDeck = this.getActiveDeck();
      if (document.hidden) {
        if (this.isMusicPlayingIntent && activeDeck.audio && !activeDeck.audio.paused) {
          this.wasMusicPlayingBeforeInterruption = true;
          activeDeck.audio.pause();
        }
        if (this.isAmbiencePlayingIntent && this.ambienceAudio && !this.ambienceAudio.paused) {
          this.ambienceAudio.pause();
        }
      } else {
        if (this.wasMusicPlayingBeforeInterruption && this.isMusicPlayingIntent && activeDeck.audio) {
          this.wasMusicPlayingBeforeInterruption = false;
          activeDeck.audio.play().catch(() => {});
        }
        if (this.isAmbiencePlayingIntent && this.ambienceAudio) {
          this.ambienceAudio.play().catch(() => {});
        }
      }
    });

    // Window blur / focus fallback for mobile WebViews
    window.addEventListener('blur', () => {
      const activeDeck = this.getActiveDeck();
      if (this.isMusicPlayingIntent && activeDeck.audio && !activeDeck.audio.paused) {
        this.wasMusicPlayingBeforeInterruption = true;
        activeDeck.audio.pause();
      }
    });

    window.addEventListener('focus', () => {
      const activeDeck = this.getActiveDeck();
      if (this.wasMusicPlayingBeforeInterruption && this.isMusicPlayingIntent && activeDeck.audio) {
        this.wasMusicPlayingBeforeInterruption = false;
        activeDeck.audio.play().catch(() => {});
      }
    });
  }

  private attachAutoplayUnlockListener(): void {
    if (this.isUnlockListenerAttached || typeof window === 'undefined') return;
    this.isUnlockListenerAttached = true;

    const unlockHandler = () => {
      window.removeEventListener('pointerdown', unlockHandler, true);
      window.removeEventListener('touchstart', unlockHandler, true);
      window.removeEventListener('keydown', unlockHandler, true);
      window.removeEventListener('click', unlockHandler, true);
      this.isUnlockListenerAttached = false;

      if (this.sfxCtx && this.sfxCtx.state === 'suspended') {
        this.sfxCtx.resume().catch(() => {});
      }

      if (this.pendingMusicPlay && this.isMusicPlayingIntent) {
        const fn = this.pendingMusicPlay;
        this.pendingMusicPlay = null;
        fn();
      }
    };

    window.addEventListener('pointerdown', unlockHandler, { capture: true, once: true });
    window.addEventListener('touchstart', unlockHandler, { capture: true, once: true });
    window.addEventListener('keydown', unlockHandler, { capture: true, once: true });
    window.addEventListener('click', unlockHandler, { capture: true, once: true });
  }

  /* -------------------------------------------------------------------------- */
  /* Dual-Deck Music System (Title Theme & Investigation Room Music)            */
  /* -------------------------------------------------------------------------- */

  private getActiveDeck(): MusicDeck {
    return this.activeDeckKey === 'A' ? this.deckA : this.deckB;
  }

  private getInactiveDeck(): MusicDeck {
    return this.activeDeckKey === 'A' ? this.deckB : this.deckA;
  }

  /**
   * Play the canonical 3:17 Main Title Theme ("Midnight Evidence") with smooth fade-in.
   * Does NOT restart if already playing.
   */
  public playTitleTheme(options?: { fadeInDuration?: number }): void {
    this.activeTrackKind = 'title';
    this.phoneFocusMultiplier = 1.0;
    const activeDeck = this.getActiveDeck();

    // If already playing Title theme, don't restart
    if (activeDeck.src === TITLE_MUSIC_PATH && !activeDeck.audio.paused && activeDeck.audio.currentTime > 0) {
      activeDeck.baseVolumeRatio = 1.0;
      this.fadeAudioVolume(activeDeck, this.getDeckTargetVolume(activeDeck), options?.fadeInDuration ?? 2.0);
      return;
    }

    this.playTrackOnDeck(activeDeck, TITLE_MUSIC_PATH, 1.0, options?.fadeInDuration ?? 2.0);
  }

  /**
   * Play the canonical Investigation Room Music Bed ("Silent Investigation") with smooth fade-in.
   * Does NOT restart if already playing (e.g. across close-ups, room/board/casefile).
   */
  public playInvestigationTheme(options?: { fadeInDuration?: number }): void {
    this.activeTrackKind = 'investigation';
    const activeDeck = this.getActiveDeck();

    // If already playing Investigation theme, don't restart!
    if (activeDeck.src === INVESTIGATION_MUSIC_PATH && !activeDeck.audio.paused && activeDeck.audio.currentTime > 0) {
      activeDeck.baseVolumeRatio = INVESTIGATION_ROOM_VOLUME_FACTOR;
      this.fadeAudioVolume(activeDeck, this.getDeckTargetVolume(activeDeck), options?.fadeInDuration ?? 2.0);
      return;
    }

    this.playTrackOnDeck(activeDeck, INVESTIGATION_MUSIC_PATH, INVESTIGATION_ROOM_VOLUME_FACTOR, options?.fadeInDuration ?? 2.0);
  }

  /**
   * Seamless crossfade from Title Screen ("Midnight Evidence") to Investigation Room ("Silent Investigation").
   * Outgoing track fades down while incoming track fades up over durationSec (2–3 seconds).
   * No loud competition, no sudden silence.
   */
  public crossfadeToInvestigation(options?: { durationSec?: number }): void {
    const duration = options?.durationSec ?? 2.4; // 2-3s target
    this.crossfadeToTrack(INVESTIGATION_MUSIC_PATH, INVESTIGATION_ROOM_VOLUME_FACTOR, duration);
    this.activeTrackKind = 'investigation';
  }

  /**
   * Seamless crossfade when returning from Investigation Room to Title Screen.
   */
  public crossfadeToTitle(options?: { durationSec?: number }): void {
    const duration = options?.durationSec ?? 2.2;
    this.phoneFocusMultiplier = 1.0;
    this.crossfadeToTrack(TITLE_MUSIC_PATH, 1.0, duration);
    this.activeTrackKind = 'title';
  }

  /**
   * General crossfade implementation using the dual-deck architecture.
   */
  public crossfadeToTrack(newSrc: string, baseVolumeRatio: number, durationSec: number): void {
    this.isMusicPlayingIntent = true;
    const currentDeck = this.getActiveDeck();
    const nextDeck = this.getInactiveDeck();

    // If already playing this source on the active deck, just transition volume
    if (currentDeck.src === newSrc && !currentDeck.audio.paused) {
      currentDeck.baseVolumeRatio = baseVolumeRatio;
      this.fadeAudioVolume(currentDeck, this.getDeckTargetVolume(currentDeck), durationSec);
      return;
    }

    // Switch active deck key
    this.activeDeckKey = this.activeDeckKey === 'A' ? 'B' : 'A';
    nextDeck.baseVolumeRatio = baseVolumeRatio;

    // Prepare next deck
    if (nextDeck.src !== newSrc || !nextDeck.audio.src) {
      nextDeck.audio.src = newSrc;
      nextDeck.src = newSrc;
      nextDeck.audio.currentTime = 0;
    }
    nextDeck.audio.loop = true;
    nextDeck.audio.volume = 0;

    const executeCrossfade = () => {
      if (!this.isMusicPlayingIntent) return;

      // Start next deck from 0 and fade up
      const playPromise = nextDeck.audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            const targetVol = this.getDeckTargetVolume(nextDeck);
            this.fadeAudioVolume(nextDeck, targetVol, durationSec);
          })
          .catch((err) => {
            if (err.name === 'NotAllowedError' || err.name === 'AutoplayPrevented') {
              this.pendingMusicPlay = executeCrossfade;
              this.attachAutoplayUnlockListener();
            }
          });
      }

      // Simultaneously fade down current deck to 0 and pause
      if (currentDeck.audio && !currentDeck.audio.paused) {
        this.fadeAudioVolume(currentDeck, 0, durationSec, () => {
          currentDeck.audio.pause();
          currentDeck.audio.volume = 0;
        });
      }
    };

    executeCrossfade();
  }

  private playTrackOnDeck(deck: MusicDeck, src: string, baseVolumeRatio: number, fadeInDuration: number): void {
    this.isMusicPlayingIntent = true;
    deck.baseVolumeRatio = baseVolumeRatio;

    if (deck.src !== src || !deck.audio.src) {
      deck.audio.src = src;
      deck.src = src;
      deck.audio.currentTime = 0;
    }
    deck.audio.loop = true;
    deck.audio.volume = 0;

    const executePlay = () => {
      if (!this.isMusicPlayingIntent) return;
      const playPromise = deck.audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            const targetVol = this.getDeckTargetVolume(deck);
            this.fadeAudioVolume(deck, targetVol, fadeInDuration);
          })
          .catch((err) => {
            if (err.name === 'NotAllowedError' || err.name === 'AutoplayPrevented') {
              this.pendingMusicPlay = executePlay;
              this.attachAutoplayUnlockListener();
            }
          });
      }
    };

    executePlay();
  }

  /**
   * Gracefully stop all music with fade-out.
   */
  public stopMusic(options?: { fadeOutDuration?: number }): Promise<void> {
    this.isMusicPlayingIntent = false;
    this.pendingMusicPlay = null;
    const fadeOutDuration = options?.fadeOutDuration ?? 1.8;

    const activeDeck = this.getActiveDeck();
    if (!activeDeck.audio || activeDeck.audio.paused) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      this.fadeAudioVolume(activeDeck, 0, fadeOutDuration, () => {
        activeDeck.audio.pause();
        activeDeck.audio.volume = 0;
        resolve();
      });
    });
  }

  /* -------------------------------------------------------------------------- */
  /* Sarah's Phone Focus Attenuation (25–35% of normal room level)              */
  /* -------------------------------------------------------------------------- */

  /**
   * When entering Sarah's Phone (NOVA OS), attenuate room music to 30% of normal level.
   * When exiting, smoothly restore to 100% normal level. Never restarts the track.
   */
  public setPhoneFocus(inPhone: boolean, durationSec: number = 0.9): void {
    this.phoneFocusMultiplier = inPhone ? PHONE_ATTENUATION_FACTOR : 1.0;
    const activeDeck = this.getActiveDeck();
    if (activeDeck.audio && !activeDeck.audio.paused) {
      const targetVol = this.getDeckTargetVolume(activeDeck);
      this.fadeAudioVolume(activeDeck, targetVol, durationSec);
    }
  }

  /* -------------------------------------------------------------------------- */
  /* Deduction / Revelation Cues                                                */
  /* -------------------------------------------------------------------------- */

  /**
   * When a major deduction/revelation occurs:
   * Temporarily duck music slightly, allow the sting/chime to stand out, then smoothly restore.
   */
  public cueDeductionRevelation(): void {
    const activeDeck = this.getActiveDeck();
    if (!activeDeck.audio || activeDeck.audio.paused) return;

    // Duck by ~60% (multiplier 0.40) over 0.25s
    this.duckMusic(0.40, 0.25);

    // After the revelation chime completes (~1.4s), smoothly unduck
    setTimeout(() => {
      this.unduckMusic(1.1);
    }, 1400);
  }

  /* -------------------------------------------------------------------------- */
  /* Voice Ducking (Reduces music by 65–75% for dialogue/voicemails)            */
  /* -------------------------------------------------------------------------- */

  public duckMusic(ratio: number = 0.28, durationSec: number = 0.4): void {
    this.musicDuckingMultiplier = Math.max(0.08, Math.min(1.0, ratio));
    const activeDeck = this.getActiveDeck();
    if (activeDeck.audio && !activeDeck.audio.paused) {
      this.fadeAudioVolume(activeDeck, this.getDeckTargetVolume(activeDeck), durationSec);
    }
  }

  public unduckMusic(durationSec: number = 0.8): void {
    this.musicDuckingMultiplier = 1.0;
    const activeDeck = this.getActiveDeck();
    if (activeDeck.audio && !activeDeck.audio.paused) {
      this.fadeAudioVolume(activeDeck, this.getDeckTargetVolume(activeDeck), durationSec);
    }
  }

  public getVoiceElement(): HTMLAudioElement {
    if (!this.voiceAudio) {
      this.voiceAudio = typeof window !== 'undefined' ? new Audio() : ({} as HTMLAudioElement);
    }
    return this.voiceAudio;
  }

  /**
   * Start or resume playing a voice recording with automatic music ducking (~72% duck).
   */
  public playVoiceTrack(src: string): Promise<void> {
    const audio = this.getVoiceElement();
    if (!audio.src || !audio.src.endsWith(src.replace(/^\//, ''))) {
      audio.src = src;
      audio.currentTime = 0;
    }
    audio.volume = this.getEffectiveVolume('voice');

    // Duck music by ~72% (multiplier 0.28) over 0.4s
    this.duckMusic(0.28, 0.4);

    audio.onended = () => {
      this.unduckMusic(0.8);
    };

    return audio.play().catch((err) => {
      console.warn('Voice play prevented:', err.message);
      this.unduckMusic(0.2);
    });
  }

  /**
   * Pause the active voice track and smoothly restore music.
   */
  public pauseVoiceTrack(): void {
    if (this.voiceAudio && !this.voiceAudio.paused) {
      this.voiceAudio.pause();
      this.unduckMusic(0.6);
    }
  }

  /**
   * Stop the active voice track, reset currentTime, and smoothly restore music.
   */
  public stopVoiceTrack(): void {
    if (this.voiceAudio) {
      this.voiceAudio.pause();
      this.voiceAudio.currentTime = 0;
      this.unduckMusic(0.5);
    }
  }

  /**
   * Seek within active voice track.
   */
  public seekVoiceTrack(timeSec: number): void {
    if (this.voiceAudio) {
      const dur = this.voiceAudio.duration || 100;
      this.voiceAudio.currentTime = Math.max(0, Math.min(dur, timeSec));
    }
  }

  public playVoice(src: string, onEnded?: () => void): void {
    const audio = this.getVoiceElement();
    audio.src = src;
    audio.volume = this.getEffectiveVolume('voice');

    // Duck music by ~72% for clear vocal intelligibility
    this.duckMusic(0.28, 0.4);

    audio.onended = () => {
      this.unduckMusic(0.8);
      if (onEnded) onEnded();
    };

    audio.play().catch((err) => {
      console.warn('Voice play prevented:', err.message);
      this.unduckMusic(0.2);
    });
  }

  /* -------------------------------------------------------------------------- */
  /* Volume Transition Helper (requestAnimationFrame with Cosine Easing)        */
  /* -------------------------------------------------------------------------- */

  private fadeAudioVolume(
    deck: MusicDeck,
    targetVolume: number,
    durationSec: number,
    onComplete?: () => void
  ): void {
    if (deck.fadeRaf) {
      cancelAnimationFrame(deck.fadeRaf);
      deck.fadeRaf = null;
    }

    const element = deck.audio;
    const startVolume = element.volume;
    const effectiveTarget = Math.max(0, Math.min(1, targetVolume));

    if (durationSec <= 0.05) {
      element.volume = effectiveTarget;
      if (onComplete) onComplete();
      return;
    }

    const startTime = performance.now();
    const durationMs = durationSec * 1000;

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);

      // Smooth cosine interpolation
      const eased = 0.5 * (1 - Math.cos(progress * Math.PI));
      const current = startVolume + (effectiveTarget - startVolume) * eased;
      element.volume = Math.max(0, Math.min(1, current));

      if (progress < 1) {
        deck.fadeRaf = requestAnimationFrame(step);
      } else {
        element.volume = effectiveTarget;
        deck.fadeRaf = null;
        if (onComplete) onComplete();
      }
    };

    deck.fadeRaf = requestAnimationFrame(step);
  }

  /* -------------------------------------------------------------------------- */
  /* Ambience Channel (Rain, Room tone - for future ambience assets)             */
  /* -------------------------------------------------------------------------- */

  public playAmbience(src: string, options?: { fadeInDuration?: number }): void {
    this.isAmbiencePlayingIntent = true;
    if (!this.ambienceAudio) {
      this.ambienceAudio = new Audio();
      this.ambienceAudio.loop = true;
    }
    const audio = this.ambienceAudio;
    const fadeIn = options?.fadeInDuration ?? 2.0;

    if (this.currentAmbienceSrc !== src) {
      audio.src = src;
      this.currentAmbienceSrc = src;
      audio.currentTime = 0;
    }

    audio.volume = 0;
    audio.play().then(() => {
      this.fadeAmbienceVolume(audio, this.getEffectiveVolume('ambience'), fadeIn);
    }).catch(() => {});
  }

  public stopAmbience(options?: { fadeOutDuration?: number }): void {
    this.isAmbiencePlayingIntent = false;
    if (!this.ambienceAudio || this.ambienceAudio.paused) return;
    const fadeOut = options?.fadeOutDuration ?? 1.5;
    this.fadeAmbienceVolume(this.ambienceAudio, 0, fadeOut, () => {
      this.ambienceAudio?.pause();
    });
  }

  private fadeAmbienceVolume(element: HTMLAudioElement, targetVolume: number, durationSec: number, onComplete?: () => void): void {
    if (this.ambienceFadeRaf) {
      cancelAnimationFrame(this.ambienceFadeRaf);
      this.ambienceFadeRaf = null;
    }
    const startVolume = element.volume;
    const effectiveTarget = Math.max(0, Math.min(1, targetVolume));
    if (durationSec <= 0.05) {
      element.volume = effectiveTarget;
      if (onComplete) onComplete();
      return;
    }
    const startTime = performance.now();
    const durationMs = durationSec * 1000;
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      const eased = 0.5 * (1 - Math.cos(progress * Math.PI));
      element.volume = Math.max(0, Math.min(1, startVolume + (effectiveTarget - startVolume) * eased));
      if (progress < 1) {
        this.ambienceFadeRaf = requestAnimationFrame(step);
      } else {
        element.volume = effectiveTarget;
        this.ambienceFadeRaf = null;
        if (onComplete) onComplete();
      }
    };
    this.ambienceFadeRaf = requestAnimationFrame(step);
  }

  /* -------------------------------------------------------------------------- */
  /* SFX Channel & WebAudio Engine                                              */
  /* -------------------------------------------------------------------------- */

  public getEffectiveSfxVolume(): number {
    return this.getEffectiveVolume('sfx');
  }

  public getSfxAudioContext(): AudioContext | null {
    if (!this.sfxCtx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.sfxCtx = new AudioCtx();
      }
    }
    if (this.sfxCtx && this.sfxCtx.state === 'suspended') {
      this.sfxCtx.resume().catch(() => {});
    }
    return this.sfxCtx;
  }
}

export const audioManager = AudioManager.getInstance();
