/**
 * Centralized Investigation Environment asset registry.
 *
 * Every path used by the physical room/desk/board scene is declared here,
 * exactly once. Components must import from this file — never hardcode an
 * `/assets/...` string inline. That is what lets final production art
 * (see §J of the Investigation Environment Design Specification) get
 * dropped in later by editing ONLY this file.
 *
 * Production artwork is loaded through ProductionArt. RGB cutouts use
 * the centralized silhouette masks below; alpha assets render directly.
 */

export type AssetAspect = { width: number; height: number };

export interface EnvironmentAsset {
  id: string;
  /** Final production file path (relative to /public). All 24 files are included. */
  real: string;
  /** Intrinsic aspect ratio the real asset is authored at. */
  aspect: AssetAspect;
  /** Human label, used only in dev/debug overlays — never shown to players. */
  label: string;
}

export const environmentAssets = {
  room: {
    background: {
      id: 'ENV-ROOM-01',
      real: '/assets/env/room_background.webp',
      aspect: { width: 941, height: 1672 },
      label: 'Night investigation room backdrop',
    },
  },
  board: {
    base: {
      id: 'BOARD-BASE-01',
      real: '/assets/env/board_base.webp',
      aspect: { width: 1374, height: 1145 },
      label: 'Cork/felt evidence board surface',
    },
  },
  desk: {
    surface: {
      id: 'DESK-SURFACE-01',
      real: '/assets/env/desk_surface.webp',
      aspect: { width: 1586, height: 992 },
      label: 'Desk wood surface + back edge',
    },
  },
  lamp: {
    off: {
      id: 'DESK-LAMP-01',
      real: '/assets/env/desk_lamp_off.webp',
      aspect: { width: 1086, height: 1448 },
      label: 'Desk lamp (off)',
    },
    on: {
      id: 'DESK-LAMP-02',
      real: '/assets/env/desk_lamp_on.webp',
      aspect: { width: 1086, height: 1448 },
      label: 'Desk lamp (on)',
    },
  },
  phone: {
    body: {
      id: 'PROP-PHONE-01',
      real: '/assets/env/nova_phone.webp',
      aspect: { width: 887, height: 1774 },
      label: "Sarah's recovered phone",
    },
  },
  folder: {
    closed: {
      id: 'PROP-CASEFOLDER-CLOSED',
      real: '/assets/env/case_folder_closed.webp',
      aspect: { width: 1122, height: 1402 },
      label: 'Case folder — closed',
    },
    open: {
      id: 'PROP-CASEFOLDER-OPEN',
      real: '/assets/env/case_folder_open.webp',
      aspect: { width: 1402, height: 1122 },
      label: 'Case folder — open',
    },
  },
  notebook: {
    closed: {
      id: 'PROP-NOTEBOOK-CLOSED',
      real: '/assets/env/notebook_closed.webp',
      aspect: { width: 1086, height: 1448 },
      label: 'Field notebook — closed',
    },
    open: {
      id: 'PROP-NOTEBOOK-OPEN',
      real: '/assets/env/notebook_open.webp',
      aspect: { width: 1448, height: 1086 },
      label: 'Field notebook — open',
    },
  },
  map: {
    folded: {
      id: 'PROP-MAP-FOLDED',
      real: '/assets/env/city_map_folded.webp',
      aspect: { width: 1402, height: 1122 },
      label: 'City map — folded',
    },
    partial: {
      id: 'PROP-MAP-PARTIAL',
      real: '/assets/env/city_map_partial.webp',
      aspect: { width: 1448, height: 1086 },
      label: 'City map — half unfolded',
    },
    unfolded: {
      id: 'PROP-MAP-UNFOLDED',
      real: '/assets/env/city_map_unfolded.webp',
      aspect: { width: 1448, height: 1086 },
      label: 'City map — fully unfolded',
    },
  },
  recorder: {
    body: {
      id: 'PROP-RECORDER-01',
      real: '/assets/env/audio_recorder.webp',
      aspect: { width: 1599, height: 984 },
      label: 'Handheld recorder',
    },
    headphones: {
      id: 'PROP-HEADPHONES-01',
      real: '/assets/env/headphones.webp',
      aspect: { width: 1448, height: 1086 },
      label: 'Headphones',
    },
  },
  clutter: {
    evidenceBag: {
      id: 'PROP-EVIDENCEBAG-01',
      real: '/assets/env/evidence_bag.webp',
      aspect: { width: 1086, height: 1448 },
      label: 'Evidence sleeve',
    },
    mug: {
      id: 'PROP-MUG-01',
      real: '/assets/env/coffee_mug.webp',
      aspect: { width: 1254, height: 1254 },
      label: 'Coffee mug',
    },
    paperStack: {
      id: 'PROP-PAPERS-01',
      real: '/assets/env/loose_paper_stack.webp',
      aspect: { width: 1402, height: 1122 },
      label: 'Loose paper stack',
    },
    paperSingle: {
      id: 'PROP-PAPERS-02',
      real: '/assets/env/loose_paper_single.webp',
      aspect: { width: 1086, height: 1448 },
      label: 'Loose paper sheet',
    },
    pen: {
      id: 'PROP-PAPERS-03',
      real: '/assets/env/pen.webp',
      aspect: { width: 2172, height: 724 },
      label: 'Pen',
    },
  },
  board_pin_frames: {
    polaroid: {
      id: 'BOARD-PIN-FRAME-01',
      real: '/assets/env/pin_frame_polaroid.webp',
      aspect: { width: 1122, height: 1402 },
      label: 'Polaroid pin frame',
    },
    indexCard: {
      id: 'BOARD-PIN-FRAME-02',
      real: '/assets/env/pin_frame_index.webp',
      aspect: { width: 1536, height: 1024 },
      label: 'Index card pin frame',
    },
    stickyNote: {
      id: 'BOARD-PIN-FRAME-03',
      real: '/assets/env/pin_frame_note.webp',
      aspect: { width: 1225, height: 1284 },
      label: 'Sticky note pin frame',
    },
    printout: {
      id: 'BOARD-PIN-FRAME-04',
      real: '/assets/env/pin_frame_print.webp',
      aspect: { width: 1448, height: 1086 },
      label: 'Curled printout pin frame',
    },
  },
} as const;

/**
 * Every asset_id currently WITHOUT delivered production art.
 * Remove an id from this set the moment its real file is dropped into
 * /public/assets/env/ at the path declared above — nothing else needs to
 * change. This is the single source of truth for "what art is still owed."
 */
export const PLACEHOLDER_ASSET_IDS = new Set<string>();

export function isPlaceholder(asset: EnvironmentAsset): boolean {
  return PLACEHOLDER_ASSET_IDS.has(asset.id);
}

/**
 * Existing canonical case-content assets (characters, gallery, clues,
 * environments, wallpapers, case-art) — already fully produced. Referenced
 * here only for the two or three places the room/board reach into them
 * directly (e.g. Sarah's photo pinned on the board at case start).
 * Everything else is addressed the same way it already is inside
 * case-data.ts / the NOVA apps, and is NOT duplicated by this registry.
 */
export const caseContentAssets = {
  sarahProfile: '/assets/case001/characters/sarah_profile.webp',
} as const;

/** Vector silhouette masks for RGB artwork. The raster remains unmodified;
 * these trim the generator's background at render time. RGBA art needs none. */
export const assetClips: Record<string, string> = {
  'BOARD-BASE-01': 'inset(7.3% 1.9% 7.2% 1.9%)',
  'PROP-PHONE-01': 'polygon(22% 5.4%,78% 5.4%,85% 6%,90% 8%,92% 12%,98% 88%,97% 91%,94% 93%,88% 94%,12% 94%,6% 93%,3% 91%,2.5% 88%,8.8% 12%,9.5% 9%,13% 7%,17% 6%)',
  'PROP-CASEFOLDER-CLOSED': 'polygon(13% 6%,75% 5.7%,78% 9%,88% 9%,96% 92%,94% 94%,6% 94%,4% 92%,12% 9%)',
  'PROP-CASEFOLDER-OPEN': 'polygon(2.4% 82.5%,5.6% 11%,9% 10%,10% 8%,49% 15.7%,89% 10.8%,91% 13.8%,94% 14%,98% 85%,97% 88%,50% 90%,4% 85%)',
  'PROP-NOTEBOOK-CLOSED': 'polygon(15% 8.5%,83% 8.5%,86% 11%,90% 78%,89% 81%,85% 82%,24% 82%,25% 93%,20% 92%,19% 82%,14% 82%,11% 80%,13% 12%)',
  'PROP-MAP-FOLDED': 'polygon(20% 10.6%,96.6% 27%,91% 90%,4% 73%,3% 70%)',
  'PROP-MAP-PARTIAL': 'polygon(22.5% 7.6%,68% 22.5%,92% 11%,86% 92%,58% 92%,4.3% 74%,3.2% 71%)',
  'PROP-MAP-UNFOLDED': 'polygon(10% 10%,94.7% 13%,97.6% 88.5%,2.5% 83%)',
  'PROP-EVIDENCEBAG-01': 'polygon(9.2% 7.9%,89.5% 7.5%,94.5% 92.8%,5.5% 92.8%)',
  'BOARD-PIN-FRAME-02': 'polygon(12% 21.5%,41.5% 21.5%,42.5% 14%,57% 14%,58% 21.5%,87.8% 21.5%,88.5% 86%,82% 87.5%,17% 87.5%,11.5% 86%)',
  'BOARD-PIN-FRAME-04': 'polygon(9.3% 10%,90.8% 9.5%,92.8% 85%,92% 88%,88% 89.7%,15% 89.7%,9% 87%,7.3% 84%)',
};
/** Object-space path coordinates are normalized to 1000 × 1000. */
export const assetPaths: Record<string, string> = {
  'DESK-LAMP-01': 'M42 208 Q125 134 300 121 L332 40 Q340 5 405 11 Q461 12 471 82 L949 309 Q968 321 943 369 L806 694 Q795 711 797 731 Q892 742 886 836 Q883 928 750 966 Q636 991 515 943 Q457 915 468 852 Q473 781 555 757 L566 688 L867 380 L478 156 Q509 211 512 332 Q510 377 443 361 Q161 318 44 228 Z M605 671 L880 394 L766 671 L726 684 L735 718 L618 738 L608 707 Z',
  'DESK-LAMP-02': 'M42 208 Q125 134 300 121 L332 40 Q340 5 405 11 Q461 12 471 82 L949 309 Q968 321 943 369 L806 694 Q795 711 797 731 Q892 742 886 836 Q883 928 750 966 Q636 991 515 943 Q457 915 468 852 Q473 781 555 757 L566 688 L867 380 L478 156 Q509 211 512 332 Q510 377 443 361 Q161 318 44 228 Z M605 671 L880 394 L766 671 L726 684 L735 718 L618 738 L608 707 Z',
  'PROP-HEADPHONES-01': 'M161 359 Q150 170 270 90 Q426 -5 615 57 Q789 101 831 333 L842 421 Q839 581 789 639 L738 745 Q639 795 535 750 Q477 719 462 611 Q414 671 326 646 Q240 630 200 539 Q159 543 161 460 Z M424 198 Q503 183 580 230 Q644 267 677 329 Q563 315 486 425 Q485 280 424 198 Z',
};
