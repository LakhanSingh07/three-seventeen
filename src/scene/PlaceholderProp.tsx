import React from 'react';

export type PlaceholderShape =
  | 'room'
  | 'board'
  | 'desk'
  | 'lamp'
  | 'phone'
  | 'folder-closed'
  | 'folder-open'
  | 'notebook-closed'
  | 'notebook-open'
  | 'map-folded'
  | 'map-open'
  | 'recorder'
  | 'headphones'
  | 'evidence-bag'
  | 'mug'
  | 'paper'
  | 'pin-card';

interface PlaceholderPropProps {
  shape: PlaceholderShape;
  label: string;
  tint?: string;
}

/**
 * Renders a PHYSICAL SILHOUETTE stand-in for an asset that has not shipped
 * yet (see PLACEHOLDER_ASSET_IDS in assetRegistry.ts).
 *
 * Rule from the implementation brief (Phase 10): placeholders must keep the
 * object's real-world silhouette so composition/perspective/overlap can be
 * judged honestly. They must NOT look like a UI card — no border, no label
 * chip, no icon-and-text row. A faint diagonal hatch marks it as temporary
 * without breaking the physical read.
 */
export const PlaceholderProp: React.FC<PlaceholderPropProps> = ({ shape, label, tint }) => {
  const common: React.CSSProperties = {
    width: '100%',
    height: '100%',
    position: 'relative',
    filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.55))',
  };

  const hatch: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'repeating-linear-gradient(135deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 7px)',
    borderRadius: 'inherit',
    pointerEvents: 'none',
  };

  const base = tint ?? '#3a3226';

  const shapeStyle: React.CSSProperties = (() => {
    switch (shape) {
      case 'room':
        return { background: `radial-gradient(120% 90% at 30% 20%, #171310 0%, #08070a 70%)` };
      case 'board':
        return { background: base, borderRadius: 6 };
      case 'desk':
        return {
          background: `linear-gradient(180deg, ${base} 0%, #241d14 100%)`,
          borderRadius: '2px 2px 0 0',
        };
      case 'lamp':
        return {
          background: `linear-gradient(180deg, #d9d9d9 0%, #6b6b6b 60%, #2a2a2a 100%)`,
          clipPath: 'polygon(30% 0%, 70% 0%, 100% 55%, 60% 62%, 60% 100%, 40% 100%, 40% 62%, 0% 55%)',
        };
      case 'phone':
        return { background: '#101418', borderRadius: 26, border: '2px solid #2a323b' };
      case 'folder-closed':
        return { background: '#8a5a2b', borderRadius: '3px 10px 3px 3px' };
      case 'folder-open':
        return {
          background: 'linear-gradient(100deg, #8a5a2b 0%, #f4ecd8 45%, #f4ecd8 100%)',
          borderRadius: '3px 10px 3px 3px',
        };
      case 'notebook-closed':
        return { background: '#3a2d1f', borderRadius: '2px 6px 6px 2px' };
      case 'notebook-open':
        return {
          background: 'linear-gradient(90deg, #efe6d2 0%, #e4dabf 50%, #efe6d2 100%)',
          borderRadius: 4,
        };
      case 'map-folded':
        return { background: '#c9b98c', borderRadius: 3 };
      case 'map-open':
        return { background: '#ded1a8', borderRadius: 4 };
      case 'recorder':
        return { background: '#26282b', borderRadius: 8 };
      case 'headphones':
        return {
          background: 'transparent',
          border: '10px solid #2b2b2e',
          borderBottom: 'none',
          borderRadius: '50% 50% 0 0',
        };
      case 'evidence-bag':
        return { background: 'rgba(210, 225, 235, 0.18)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 6 };
      case 'mug':
        return { background: '#4a4038', borderRadius: '3px 3px 8px 8px' };
      case 'paper':
        return { background: '#e8e2cf', borderRadius: 2 };
      case 'pin-card':
        return { background: '#efe7d0', borderRadius: 2 };
      default:
        return { background: base };
    }
  })();

  return (
    <div style={{ ...common, ...shapeStyle }} aria-label={label} title={label} data-placeholder-shape={shape}>
      <div style={hatch} />
    </div>
  );
};
