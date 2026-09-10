import React, { useState } from 'react';
import type { ScenePosition } from './coordinates';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

interface InteractivePropProps {
  id: string;
  position: ScenePosition;
  onActivate: (anchor: { xPct: number; yPct: number }) => void;
  /** Shown once, briefly, the first time the player encounters this object
   * (tracked by the caller via save-state / local visited-set) — never a
   * permanent label (§14 HUD rule). */
  firstVisitHint?: string;
  hasFirstVisitHint?: boolean;
  onHintShown?: () => void;
  /** Extra idle micro-drift phase offset in seconds, so props don't breathe
   * in unison. */
  driftPhase?: number;
  children: React.ReactNode;
  ariaLabel: string;
  minTouchPx?: number;
}

/**
 * The physical-object hotspot primitive. The player taps the OBJECT
 * ITSELF — there is no card, no icon, no "Inspect ->" affordance baked
 * into this component. The invisible touch target is expanded beyond the
 * visual silhouette to guarantee a comfortable minimum touch area on
 * small screens (§22 Accessibility) without the object itself looking any
 * bigger.
 */
export const InteractiveProp: React.FC<InteractivePropProps> = ({
  id,
  position,
  onActivate,
  firstVisitHint,
  hasFirstVisitHint,
  onHintShown,
  driftPhase = 0,
  children,
  ariaLabel,
  minTouchPx = 44,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const [showHint, setShowHint] = useState(false);

  const handleActivate = () => {
    onActivate({ xPct: position.xPct + position.widthPct / 2, yPct: position.yPct + 5 });
    if (hasFirstVisitHint) onHintShown?.();
  };

  return (
    <button
      type="button"
      data-prop-id={id}
      aria-label={ariaLabel}
      onPointerDown={() => setIsPressed(true)}
      onPointerUp={() => setIsPressed(false)}
      onPointerLeave={() => { setIsPressed(false); setShowHint(false); }}
      onPointerEnter={() => setShowHint(true)}
      onFocus={() => setShowHint(true)}
      onBlur={() => setShowHint(false)}
      onPointerCancel={() => setIsPressed(false)}
      onClick={handleActivate}
      style={{
        position: 'absolute',
        left: `${position.xPct}%`,
        top: `${position.yPct}%`,
        width: `${position.widthPct}%`,
        aspectRatio: 'auto',
        minWidth: minTouchPx,
        minHeight: minTouchPx,
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        transformOrigin: 'center bottom',
        transform: `rotate(${position.rotationDeg ?? 0}deg) scale(${isPressed ? 0.97 : 1})`,
        transition: reducedMotion
          ? 'transform 120ms ease'
          : `transform 180ms cubic-bezier(0.22,1,0.36,1), filter 180ms ease`,
        animation: 'none',
        animationDelay: `${driftPhase}s`,
        filter: isPressed ? 'brightness(1.08)' : 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {children}
      {showHint && firstVisitHint && hasFirstVisitHint && (
        <span
          role="status"
          style={{
            position: 'absolute',
            bottom: '104%',
            left: '50%',
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap',
            background: 'rgba(10, 8, 6, 0.88)',
            color: '#f1e9d8',
            fontFamily: "'Georgia', serif",
            fontSize: 12,
            padding: '5px 10px',
            borderRadius: 3,
            pointerEvents: 'none',
            animation: reducedMotion ? 'none' : 'hintFadeOut 2.6s ease forwards',
          }}
        >
          {firstVisitHint}
        </span>
      )}
    </button>
  );
};
