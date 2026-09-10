import React from 'react';

interface SceneLayerProps {
  /** 0 = deepest background, higher = closer to camera. Also used to scale
   * parallax response. */
  depth: number;
  zIndex: number;
  /** Whether this plane should visually recede (blur/darken) because a
   * close-up in front of it is currently focused. */
  isDefocused?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const SceneLayer: React.FC<SceneLayerProps> = ({ depth, zIndex, isDefocused, children, style }) => {
  return (
    <div
      data-scene-depth={depth}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex,
        transition: 'filter 380ms ease, opacity 380ms ease',
        filter: isDefocused ? 'blur(2px) brightness(0.48)' : 'none',
        pointerEvents: 'none',
        ...style,
      }}
    >
      {children}
    </div>
  );
};
