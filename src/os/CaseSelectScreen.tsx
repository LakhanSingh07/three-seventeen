import { useState, useRef, useEffect } from 'react';
import { Folder, ArrowRight, Volume2, VolumeX } from 'lucide-react';
import type { CaseData, CaseSaveState } from '../cases/types';
import { soundEngine } from '../system/SoundEngine';
import { hapticEngine } from '../system/HapticEngine';
import { audioManager } from '../system/AudioManager';
import { usePrefersReducedMotion } from '../scene/usePrefersReducedMotion';

interface Props {
  caseData: CaseData;
  saveState: CaseSaveState | null;
  onStartCase: () => void;
  onResetCase?: () => void;
}

export function CaseSelectScreen({ caseData, saveState, onStartCase, onResetCase }: Props) {
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isAudioMuted, setIsAudioMuted] = useState(() => audioManager.isMusicMuted());

  const hasStarted =
    !!saveState &&
    (saveState.discoveredEvidenceIds.length > 0 || saveState.unlockedDeductionIds.length > 0);

  // Subscribe to audio settings changes
  useEffect(() => {
    return audioManager.subscribe(() => {
      setIsAudioMuted(audioManager.isMusicMuted());
    });
  }, []);

  // Canonical title theme lifecycle + muted background video
  useEffect(() => {
    // Start Midnight Evidence with gentle 2.0s fade-in (single-instance protected)
    audioManager.playTitleTheme({ fadeInDuration: 2.0 });

    if (videoRef.current) {
      // The video MUST remain strictly muted as specified
      videoRef.current.muted = true;
      if (!prefersReducedMotion) {
        videoRef.current.play().catch(() => {
          // Handled gracefully
        });
      }
    }
  }, [prefersReducedMotion]);

  const launch = () => {
    soundEngine.playDeskLampToggle();
    hapticEngine.medium();

    // Studio crossfade: Midnight Evidence fades down while Silent Investigation fades up over 2.4s
    audioManager.crossfadeToInvestigation({ durationSec: 2.4 });
    onStartCase();
  };

  const handleToggleAudio = () => {
    soundEngine.playTap();
    audioManager.toggleMusicMute();
  };

  const videoSrc = '/assets/Create_a_premium_cinematic_amb_gwr_video_mvp.mp4';
  const posterSrc = '/assets/case001/case-art/case001_cover.webp';
  const sarahPhotoSrc = '/assets/case001/characters/sarah_profile.webp';

  return (
    <main className="case-select-screen">
      {/* LAYER 0: Existing full-screen portrait background video */}
      {!prefersReducedMotion && !videoError ? (
        <video
          ref={videoRef}
          className="title-bg-video"
          src={videoSrc}
          poster={posterSrc}
          autoPlay
          loop
          muted
          playsInline
          onError={() => setVideoError(true)}
          aria-hidden="true"
        />
      ) : (
        <div
          className="title-bg-poster"
          style={{ backgroundImage: `url(${posterSrc})` }}
          aria-hidden="true"
        />
      )}

      {/* LAYER 1: Subtle cinematic dark gradient & vignette */}
      <div className="title-cinematic-overlay" />
      <div className="title-vignette" />

      {/* FOREGROUND CONTENT CONTAINER */}
      <div className="title-content-container">
        {/* LAYER 2: Top Eyebrow */}
        <div className="title-eyebrow">
          AN INTERACTIVE DETECTIVE INVESTIGATION
        </div>

        {/* LAYER 3: Main Weathered Title 3:17 */}
        <div className="title-hero-wrap">
          <h1 className="title-hero-317" aria-label="3:17">
            <span className="title-digits">3:17</span>
          </h1>

          {/* LAYER 4: Tagline */}
          <p className="title-hero-tagline">
            EVERY PHONE HAS A STORY
          </p>
        </div>

        {/* LAYER 5: Physical Case 001 Dossier with Attached Sarah Polaroid */}
        <div className="title-dossier-wrapper">
          <article className="title-dossier-card">
            {/* Header row */}
            <div className="dossier-header-row">
              <span className="dossier-case-label">CASE 001</span>
              <span className="dossier-red-line" />
              <span className="dossier-date-badge">08 SEP</span>
              <span className="dossier-open-tag">OPEN INVESTIGATION</span>
            </div>

            {/* Bullet / rivet accent */}
            <div className="dossier-bullet" aria-hidden="true" />

            {/* Text column */}
            <div className="dossier-text-col">
              <h2 className="dossier-case-title">The Missing Girl</h2>
              <div className="dossier-subject-meta">
                Subject: {caseData.victimName} &nbsp;|&nbsp; Age: {caseData.victimAge} &nbsp;|&nbsp; Date: Sep 8
              </div>
              <p className="dossier-case-desc">
                A young data analyst vanishes in the dead of night. Her recovered smartphone is your only lead.
              </p>
            </div>

            {/* Attached Physical Polaroid on the right */}
            <div className="dossier-polaroid-photo" aria-hidden="true">
              <div className="polaroid-frame">
                <img
                  src={sarahPhotoSrc}
                  alt={caseData.victimName}
                  className="polaroid-img"
                />
                <span className="polaroid-caption">SARAH MEHTA</span>
              </div>
            </div>
          </article>
        </div>

        {/* LAYER 6: Real interactive ENTER INVESTIGATION ROOM control (Yellow kraft tape strip) */}
        <div className="title-cta-wrapper">
          <button
            type="button"
            className="title-cta-strip"
            onClick={launch}
            aria-label="Enter investigation room"
          >
            <Folder className="cta-folder-icon" size={20} strokeWidth={2.2} />
            <span className="cta-label">
              {hasStarted ? 'RESUME INVESTIGATION' : 'ENTER INVESTIGATION ROOM'}
            </span>
            <ArrowRight className="cta-arrow-icon" size={20} strokeWidth={2.4} />
          </button>
        </div>

        {/* LAYER 7: Restrained bottom tagline */}
        <div className="title-bottom-tagline">
          THE TRUTH IS STILL OUT THERE
        </div>

        {/* Discreet audio control */}
        <button
          type="button"
          className="title-audio-toggle"
          onClick={handleToggleAudio}
          aria-label={isAudioMuted ? 'Unmute music' : 'Mute music'}
          title={isAudioMuted ? 'Unmute music' : 'Mute music'}
        >
          {isAudioMuted ? (
            <VolumeX size={13} className="audio-icon-muted" />
          ) : (
            <Volume2 size={13} className="audio-icon-active" />
          )}
          <span className="audio-toggle-label">{isAudioMuted ? 'MUTED' : 'AUDIO'}</span>
        </button>

        {/* Optional Reset Progress link if started */}
        {hasStarted && onResetCase && (
          <button
            type="button"
            className="title-reset-link"
            onClick={() => {
              soundEngine.playTap();
              onResetCase();
            }}
          >
            Reset case progress
          </button>
        )}
      </div>
    </main>
  );
}
