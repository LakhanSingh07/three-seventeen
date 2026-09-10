import React from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

interface CloseupOverlayProps {
  isActive: boolean;
  /** Reference-canvas % point the close-up should visually grow from /
   * shrink back into (the object the player tapped). */
  anchor: { xPct: number; yPct: number } | null;
  zIndex: number;
  children: React.ReactNode;
}

/**
 * Wraps an existing full-screen content component (CaseFileModal,
 * NotebookModal, CityMapModal, AudioPlayerModal, FinalReportModal, the
 * phone) so it visually originates from the physical object that was
 * tapped, instead of appearing as a generic centered modal (§C, Phase 8).
 *
 * Deliberately does NOT touch the wrapped component's internal markup —
 * it only controls the outer transform-origin/scale/opacity, so all
 * existing content/state logic in those files is preserved untouched.
 *
 * Always mounted (never conditionally rendered) so that interactive state
 * inside the wrapped component — most importantly NOVA's own screen/app
 * navigation — survives being hidden and re-shown (Phase 4).
 */
export const CloseupOverlay: React.FC<CloseupOverlayProps> = ({ isActive, anchor, zIndex, children }) => {
  const reducedMotion = usePrefersReducedMotion();
  const origin = anchor ? `${anchor.xPct}% ${anchor.yPct}%` : '50% 50%';

  return (
    <div
      aria-hidden={!isActive}
      inert={!isActive}
      data-closeup-active={isActive}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex,
        pointerEvents: isActive ? 'auto' : 'none',
        opacity: isActive ? 1 : 0,
        transformOrigin: origin,
        transform: reducedMotion ? 'none' : isActive ? 'scale(1)' : 'scale(0.48)',
        transition: reducedMotion
          ? 'opacity 150ms ease'
          : 'transform 420ms cubic-bezier(0.22,1,0.36,1), opacity 320ms ease',
      }}
    >
      {children}
    </div>
  );
};
