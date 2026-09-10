/**
 * Reference-canvas coordinate system for the Investigation Scene.
 * See §K.4 / §20 of the Investigation Environment Design Specification.
 *
 * Every prop/hotspot is authored against a fixed 1080x1920 (9:16) canvas
 * using percentages. The scene root locks to that aspect ratio and is
 * uniformly scaled and center-cropped (never stretched) to fit the real viewport, so placement
 * stays correct across Android portrait aspect ratios.
 */

export const REFERENCE_CANVAS = { width: 1080, height: 1920 } as const;

/** Anything gameplay-critical must stay inside this centered box so it can
 * never be cropped off on narrower/taller real devices. */
export const SAFE_CONTENT_ZONE = {
  xPct: 9, // 82% width, centered => 9% margin each side
  widthPct: 82,
  yPct: 2,
  heightPct: 96,
};

export interface ScenePosition {
  xPct: number; // left, % of reference canvas width
  yPct: number; // top, % of reference canvas height
  widthPct: number; // width, % of reference canvas width
  rotationDeg?: number;
}

/** Desk/board prop layout, authored once, consumed by InvestigationScene. */
export const DESK_LAYOUT: Record<string, ScenePosition> = {
  lamp: { xPct: 9, yPct: 39, widthPct: 25, rotationDeg: -3 },
  map: { xPct: 15, yPct: 54, widthPct: 39, rotationDeg: -8 },
  notebook: { xPct: 59, yPct: 52, widthPct: 26, rotationDeg: 7 },
  folder: { xPct: 15, yPct: 66, widthPct: 39, rotationDeg: -7 },
  recorder: { xPct: 61, yPct: 69, widthPct: 25, rotationDeg: 4 },
  headphones: { xPct: 65, yPct: 60, widthPct: 23, rotationDeg: -8 },
  phone: { xPct: 41, yPct: 63, widthPct: 22, rotationDeg: 6 },
  evidenceBag: { xPct: 21, yPct: 77, widthPct: 18, rotationDeg: -9 },
  mug: { xPct: 74, yPct: 47, widthPct: 14, rotationDeg: 0 },
  paperStack: { xPct: 55, yPct: 78, widthPct: 20, rotationDeg: -5 },
  paperSingle: { xPct: 61, yPct: 76, widthPct: 19, rotationDeg: 12 },
  pen: { xPct: 70, yPct: 79, widthPct: 21, rotationDeg: -25 },
};

export const BOARD_REGION: ScenePosition = { xPct: 8, yPct: 9, widthPct: 83 };

/** 0 = case just started, 3 = late game. Derived purely from existing save
 * state — no new fields required (§F). */
export type ProgressionStage = 0 | 1 | 2 | 3;

export function getProgressionStage(discoveredCount: number, unlockedDeductionCount: number, totalDeductions: number): ProgressionStage {
  const deductionRatio = totalDeductions > 0 ? unlockedDeductionCount / totalDeductions : 0;
  if (discoveredCount >= 11 || deductionRatio >= 0.6) return 3;
  if (discoveredCount >= 5 || unlockedDeductionCount >= 1) return 2;
  if (discoveredCount >= 1) return 1;
  return 0;
}

/** Deterministic pseudo-random in [0,1) seeded from a string id, so board
 * pin scatter/rotation is stable across renders without hand-authoring
 * every evidence item's position (§K.5). */
export function seededRandom(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h = (h ^ (h >>> 15)) >>> 0;
  return h / 4294967295;
}
