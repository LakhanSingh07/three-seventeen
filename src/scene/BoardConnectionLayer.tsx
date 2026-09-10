import React from 'react';
import type { Deduction } from '../cases/types';

interface Anchor {
  x: number; // px, relative to board container
  y: number;
}

interface BoardConnectionLayerProps {
  unlockedDeductions: Deduction[];
  anchors: Record<string, Anchor>;
  width: number;
  height: number;
}

/**
 * Authentic red investigation thread layer.
 * Threads connect physically between evidence pushpins with natural catenary sag,
 * visual tension, drop shadow depth, and loop attachments.
 */
export const BoardConnectionLayer: React.FC<BoardConnectionLayerProps> = ({
  unlockedDeductions,
  anchors,
  width,
  height,
}) => {
  if (width === 0 || height === 0) return null;

  return (
    <svg
      width={width}
      height={height}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 5,
        overflow: 'visible',
      }}
    >
      <defs>
        {/* Realistic drop shadow for thread elevation above corkboard */}
        <filter id="threadShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="3" stdDeviation="2.5" floodColor="#140604" floodOpacity="0.75" />
        </filter>
        {/* Subtle fiber texture for thread */}
        <pattern id="threadFiber" width="6" height="4" patternUnits="userSpaceOnUse">
          <rect width="6" height="4" fill="#b91c1c" />
          <line x1="0" y1="1" x2="6" y2="3" stroke="#e11d48" strokeWidth="0.8" opacity="0.8" />
          <line x1="0" y1="3" x2="6" y2="1" stroke="#881337" strokeWidth="0.7" opacity="0.9" />
        </pattern>
      </defs>

      {unlockedDeductions.map((d) => {
        const [aId, bId] = d.requiredEvidenceIds;
        const a = anchors[aId];
        const b = anchors[bId];
        if (!a || !b) return null;

        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const len = Math.max(1, Math.hypot(dx, dy));

        // Natural catenary gravity sag
        const sag = Math.min(32, len * 0.09 + 8);
        const nx = -dy / len;
        const ny = dx / len;
        const cx = mx + nx * (sag * 0.25);
        const cy = my + Math.abs(ny) * (sag * 0.25) + sag;

        const pathData = `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`;

        return (
          <g key={d.id} filter="url(#threadShadow)">
            {/* Thread under-shadow for core depth */}
            <path
              d={pathData}
              fill="none"
              stroke="#590c07"
              strokeWidth={3.8}
              strokeLinecap="round"
              opacity={0.8}
            />

            {/* Core textured red investigation thread */}
            <path
              d={pathData}
              fill="none"
              stroke="url(#threadFiber)"
              strokeWidth={2.4}
              strokeLinecap="round"
              style={{
                strokeDasharray: len + sag * 2,
                strokeDashoffset: 0,
                animation: 'threadDrawIn 520ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />

            {/* Subtle top tension highlight */}
            <path
              d={pathData}
              fill="none"
              stroke="#f43f5e"
              strokeWidth={0.8}
              strokeLinecap="round"
              opacity={0.65}
            />

            {/* Pin attachment eyelet / wound knot at Anchor A */}
            <circle cx={a.x} cy={a.y} r={4.2} fill="#991b1b" stroke="#450a0a" strokeWidth={1.2} />
            <circle cx={a.x} cy={a.y} r={1.8} fill="#fca5a5" opacity={0.8} />

            {/* Pin attachment eyelet / wound knot at Anchor B */}
            <circle cx={b.x} cy={b.y} r={4.2} fill="#991b1b" stroke="#450a0a" strokeWidth={1.2} />
            <circle cx={b.x} cy={b.y} r={1.8} fill="#fca5a5" opacity={0.8} />
          </g>
        );
      })}
    </svg>
  );
};
