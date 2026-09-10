import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Maximize2,
  Minimize2,
  Check,
  FileCheck,
} from 'lucide-react';
import { CCTV_ARDENT_001_ASSET } from '../cases/case-001/cctv-assets';
import { soundEngine } from '../system/SoundEngine';
import { hapticEngine } from '../system/HapticEngine';
import { audioManager } from '../system/AudioManager';

interface CctvViewerModalProps {
  onClose: () => void;
  onDiscoverEvidence: (evidenceId: string) => void;
  isLogged: boolean;
}

const CCTV_WATCHED_STORAGE_KEY = '317_cctv_ardent_watched';

function getIsCctvWatched(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(CCTV_WATCHED_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function persistCctvWatched(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CCTV_WATCHED_STORAGE_KEY, 'true');
  } catch {
    // Ignore storage quota
  }
}

export const CctvViewerModal: React.FC<CctvViewerModalProps> = ({
  onClose,
  onDiscoverEvidence,
  isLogged,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(CCTV_ARDENT_001_ASSET.durationSec);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [hasWatchedEnough, setHasWatchedEnough] = useState<boolean>(getIsCctvWatched);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fps = CCTV_ARDENT_001_ASSET.fps;
  const frameTime = 1 / fps;
  const currentFrame = Math.min(
    CCTV_ARDENT_001_ASSET.totalFrames,
    Math.max(1, Math.floor(currentTime * fps) + 1)
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Synchronize audio ducking on play / pause / unmount
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = audioManager.getEffectiveVolume('voice');

    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.currentTime >= 2.0 && !hasWatchedEnough) {
        setHasWatchedEnough(true);
        persistCctvWatched();
      }
    };

    const onDurationChange = () => {
      if (video.duration && !Number.isNaN(video.duration)) {
        setDuration(video.duration);
      }
    };

    const onPlay = () => {
      setIsPlaying(true);
      audioManager.duckMusic(0.20, 0.4);
    };

    const onPause = () => {
      setIsPlaying(false);
      audioManager.unduckMusic(0.6);
    };

    const onEnded = () => {
      setIsPlaying(false);
      audioManager.unduckMusic(0.8);
      setHasWatchedEnough(true);
      persistCctvWatched();
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('durationchange', onDurationChange);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('ended', onEnded);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('durationchange', onDurationChange);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('ended', onEnded);
      audioManager.unduckMusic(0.6);
    };
  }, [hasWatchedEnough]);

  // Handle Play/Pause
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    soundEngine.playTap();
    hapticEngine.light();

    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, []);

  // Frame Stepping
  const stepFrame = useCallback(
    (direction: -1 | 1) => {
      const video = videoRef.current;
      if (!video) return;
      soundEngine.playTap();
      hapticEngine.light();

      if (!video.paused) {
        video.pause();
      }

      const nextTime = Math.min(
        duration,
        Math.max(0, video.currentTime + direction * frameTime)
      );
      video.currentTime = nextTime;
      setCurrentTime(nextTime);
      setHasWatchedEnough(true);
      persistCctvWatched();
    },
    [duration, frameTime]
  );

  // Scrubber Seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const target = parseFloat(e.target.value);
    video.currentTime = target;
    setCurrentTime(target);
    setHasWatchedEnough(true);
    persistCctvWatched();
  };

  // Zoom control
  const handleSetZoom = (level: number) => {
    soundEngine.playTap();
    hapticEngine.light();
    setZoom(level);
    if (level === 1) {
      setPan({ x: 0, y: 0 });
    }
  };

  const handleResetZoom = () => {
    soundEngine.playTap();
    hapticEngine.light();
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Pan dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return;
    const maxPan = (zoom - 1) * 160;
    const newX = Math.max(-maxPan, Math.min(maxPan, e.clientX - dragStart.x));
    const newY = Math.max(-maxPan, Math.min(maxPan, e.clientY - dragStart.y));
    setPan({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch drag for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoom <= 1 || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || zoom <= 1 || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const maxPan = (zoom - 1) * 140;
    const newX = Math.max(-maxPan, Math.min(maxPan, touch.clientX - dragStart.x));
    const newY = Math.max(-maxPan, Math.min(maxPan, touch.clientY - dragStart.y));
    setPan({ x: newX, y: newY });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Log to Case Board
  const handleLogToCase = () => {
    if (isLogged) return;
    soundEngine.playEvidenceLogged();
    hapticEngine.clueDiscovered();
    onDiscoverEvidence(CCTV_ARDENT_001_ASSET.evidenceId);
    showToast('✓ Logged to Evidence Board');
  };

  const formatTimestamp = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 100);
    return `${mins < 10 ? '0' : ''}${mins}:${s < 10 ? '0' : ''}${s}.${ms < 10 ? '0' : ''}${ms}`;
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(5, 7, 10, 0.95)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace",
        color: '#e2e8f0',
        overflow: 'hidden',
      }}
      onMouseUp={handleMouseUp}
    >
      {/* Toast */}
      {toastMessage && (
        <div
          style={{
            position: 'absolute',
            top: '64px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #0284c7, #0369a1)',
            color: '#ffffff',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 600,
            zIndex: 1000,
            boxShadow: '0 4px 18px rgba(2, 132, 199, 0.45)',
            letterSpacing: '0.4px',
            border: '1px solid rgba(255, 255, 255, 0.25)',
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Header bar */}
      <header
        style={{
          height: '52px',
          borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
          background: 'rgba(10, 14, 22, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => {
              soundEngine.playTap();
              onClose();
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#cbd5e1',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            ‹ Return
          </button>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc', letterSpacing: '0.5px' }}>
              ARDENT SECURITY ARCHIVE · CAM-04
            </div>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>
              {CCTV_ARDENT_001_ASSET.location} • Recovered CCTV Segment
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Compact View' : 'Expanded View'}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#cbd5e1',
              borderRadius: '6px',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button
            onClick={() => {
              soundEngine.playTap();
              onClose();
            }}
            title="Close"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: '#94a3b8',
              borderRadius: '6px',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {/* Main Inspection Viewport */}
      <main
        ref={containerRef}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isExpanded ? '0' : '8px 14px',
          position: 'relative',
          overflow: 'hidden',
          background: '#040608',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: isExpanded ? '100%' : 'min(100%, 880px)',
            height: isExpanded ? '100%' : 'auto',
            maxHeight: isExpanded ? '100%' : 'calc(100vh - 260px)',
            aspectRatio: isExpanded ? undefined : '16/9',
            background: '#000000',
            borderRadius: isExpanded ? 0 : '8px',
            border: isExpanded ? 'none' : '1px solid rgba(148, 163, 184, 0.2)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.8)',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={(e) => {
            // Only toggle play if clicking without dragging and not zoomed in
            if (zoom === 1 && (e.target as HTMLElement).tagName === 'VIDEO') {
              togglePlay();
            }
          }}
        >
          {/* Native Video Element */}
          <video
            ref={videoRef}
            src={CCTV_ARDENT_001_ASSET.videoSrc}
            playsInline
            preload="auto"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
              transition: isDragging ? 'none' : 'transform 0.15s ease-out',
              pointerEvents: 'auto',
            }}
          />

          {/* Forensic Pause Watermark indicator */}
          {!isPlaying && (
            <div
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                borderRadius: '4px',
                padding: '3px 8px',
                fontSize: '10px',
                color: '#38bdf8',
                letterSpacing: '1px',
                fontFamily: 'monospace',
                pointerEvents: 'none',
              }}
            >
              PAUSED · INSPECTION ACTIVE
            </div>
          )}

          {/* Zoom Level Indicator */}
          {zoom > 1 && (
            <div
              style={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                borderRadius: '4px',
                padding: '3px 8px',
                fontSize: '10.5px',
                color: '#38bdf8',
                fontWeight: 700,
                pointerEvents: 'none',
              }}
            >
              {zoom}x ZOOM (DRAG TO PAN)
            </div>
          )}
        </div>
      </main>

      {/* Control Console Toolbar */}
      <footer
        style={{
          background: '#090d16',
          borderTop: '1px solid rgba(148, 163, 184, 0.18)',
          padding: '10px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          zIndex: 10,
        }}
      >
        {/* Scrubber & Timecode Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '12px',
              color: '#38bdf8',
              minWidth: '60px',
              fontWeight: 700,
            }}
          >
            {formatTimestamp(currentTime)}
          </span>

          <input
            type="range"
            min={0}
            max={duration}
            step={frameTime}
            value={currentTime}
            onChange={handleSeek}
            style={{
              flex: 1,
              accentColor: '#38bdf8',
              cursor: 'pointer',
              height: '5px',
            }}
          />

          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '11px',
              color: '#64748b',
              minWidth: '105px',
              textAlign: 'right',
            }}
          >
            {formatTimestamp(duration)} • F{currentFrame}/240
          </span>
        </div>

        {/* Action Controls & Zoom Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          {/* Playback & Frame Stepping */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => stepFrame(-1)}
              title="Previous Frame (1/24s)"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#e2e8f0',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              <SkipBack size={14} />
              <span>-1F</span>
            </button>

            <button
              onClick={togglePlay}
              style={{
                background: isPlaying ? '#0284c7' : 'rgba(56, 189, 248, 0.2)',
                border: '1px solid #38bdf8',
                color: '#ffffff',
                borderRadius: '6px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
            </button>

            <button
              onClick={() => stepFrame(1)}
              title="Next Frame (1/24s)"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#e2e8f0',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              <span>+1F</span>
              <SkipForward size={14} />
            </button>
          </div>

          {/* Zoom controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '10px', color: '#64748b', marginRight: '4px', textTransform: 'uppercase' }}>
              Zoom:
            </span>
            {[1, 1.5, 2, 3].map((lvl) => (
              <button
                key={lvl}
                onClick={() => handleSetZoom(lvl)}
                style={{
                  background: zoom === lvl ? '#0284c7' : 'rgba(255, 255, 255, 0.06)',
                  border: zoom === lvl ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                  color: zoom === lvl ? '#ffffff' : '#cbd5e1',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '11px',
                  fontWeight: zoom === lvl ? 700 : 500,
                  cursor: 'pointer',
                }}
              >
                {lvl}x
              </button>
            ))}

            {zoom > 1 && (
              <button
                onClick={handleResetZoom}
                title="Reset Zoom"
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#fca5a5',
                  borderRadius: '4px',
                  padding: '4px 6px',
                  fontSize: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                }}
              >
                <RotateCcw size={11} />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Log to Case button */}
          <div>
            {isLogged ? (
              <div
                style={{
                  background: 'rgba(34, 197, 94, 0.12)',
                  border: '1px solid rgba(34, 197, 94, 0.35)',
                  color: '#86efac',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <Check size={14} />
                <span>LOGGED TO CASE</span>
              </div>
            ) : (
              <button
                onClick={handleLogToCase}
                style={{
                  background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                  border: '1px solid #38bdf8',
                  color: '#ffffff',
                  padding: '7px 16px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 10px rgba(2, 132, 199, 0.4)',
                }}
              >
                <FileCheck size={14} />
                <span>LOG TO CASE</span>
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};
