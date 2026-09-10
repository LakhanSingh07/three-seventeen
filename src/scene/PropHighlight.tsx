/**
 * PropHighlight
 *
 * Lightweight CSS-driven ambient illumination layer for interactive
 * investigation desk props. Renders as a zero-interaction overlay
 * that sits INSIDE the prop's button element, so it naturally inherits
 * the prop's rotation / aspect-ratio without any JS measurement.
 *
 * States (driven by caller):
 *   idle         — near-invisible, 0–3% extra emphasis
 *   discoverable — very subtle breathing radial warmth, 8–15%
 *   hover        — slightly stronger, 15–22%
 *   focus        — narration-directed emphasis, 18–28%
 *   inspected    — breathing removed, near-natural (≤5%)
 *   locked       — no glow at all
 *
 * Design intent:
 *   "The investigation LIGHT is subtly catching the object."
 *   Never neon. Never quest-marker. Light, not UI.
 *
 * Shape:
 *   Uses an elliptical radial-gradient centred on the prop to approximate
 *   the object's physical footprint. The gradient is transparent at its
 *   centre so it acts as an edge-light / separation from the bg, rather
 *   than a solid blob over the object.
 */

import React from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

export type PropHighlightState =
  | 'locked'
  | 'idle'
  | 'inspected'
  | 'discoverable'
  | 'hover'
  | 'focus';

interface PropHighlightProps {
  state: PropHighlightState;
  /** Hue of the light catch. Warm amber (~40°) for documents, cool neutral (~200°) for phone. */
  hue?: number;
  /** 0–1 intensity override for narration beats. Defaults to state-driven value. */
  intensityOverride?: number;
  /** Phase offset so neighbouring props don't breathe in perfect unison. 0–1. */
  breathePhase?: number;
  /** Shape: 'round' for phone/small items, 'wide' for folder/notebook, 'board' for evidence board. */
  shape?: 'round' | 'wide' | 'board';
}

const STATE_OPACITY: Record<PropHighlightState, number> = {
  locked:      0.00,
  idle:        0.02,
  inspected:   0.04,
  discoverable:0.14,
  hover:       0.22,
  focus:       0.28,
};

/**
 * Breathing animation duration + amplitude for the "discoverable" state.
 * Reduced-motion: no animation, just static opacity.
 */
const BREATHE_DURATION_S = 3.4;
const BREATHE_AMPLITUDE = 0.06; // max additional opacity during inhale

export const PropHighlight: React.FC<PropHighlightProps> = ({
  state,
  hue = 40,
  intensityOverride,
  breathePhase = 0,
  shape = 'wide',
}) => {
  const reducedMotion = usePrefersReducedMotion();
  if (state === 'locked') return null;

  const baseOpacity = intensityOverride ?? STATE_OPACITY[state];
  const isBreathing = state === 'discoverable' && !reducedMotion;

  // Gradient shape dimensions (% of element box)
  const gradientShape =
    shape === 'round' ? '55% 60%'
    : shape === 'board' ? '80% 55%'
    : '70% 65%';

  // The gradient: transparent centre → warm edge light
  // This gives the illusion of a local spotlight catching the object edge
  // rather than a glow blob painted over the centre.
  const gradient = `radial-gradient(ellipse ${gradientShape} at 50% 60%,
    transparent 20%,
    hsla(${hue}, 60%, 72%, 0.55) 62%,
    hsla(${hue}, 55%, 55%, 0.35) 82%,
    transparent 100%)`;

  return (
    <span
      aria-hidden="true"
      data-highlight-state={state}
      style={{
        position: 'absolute',
        inset: '-8% -6%',
        pointerEvents: 'none',
        borderRadius: shape === 'round' ? '50%' : '4px',
        background: gradient,
        opacity: baseOpacity,
        mixBlendMode: 'screen',
        ...(isBreathing
          ? {
              animation: `propBreathe ${BREATHE_DURATION_S}s ease-in-out infinite`,
              animationDelay: `${-breathePhase * BREATHE_DURATION_S}s`,
              // CSS custom properties for the keyframe
              ['--breathe-base' as string]: String(baseOpacity),
              ['--breathe-amp' as string]: String(BREATHE_AMPLITUDE),
            }
          : {
              transition: 'opacity 280ms ease',
            }),
      }}
    />
  );
};
