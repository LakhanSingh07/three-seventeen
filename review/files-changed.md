# Files changed

Comparison with Claude's uploaded React project. Generated `dist/` and the `review/` evidence package are also included in the final ZIP.

## Modified

- `README.md`
- `package.json`
- `src/App.tsx`
- `src/cases/case-engine.ts` — local artwork URLs only; game logic unchanged
- `src/index.css`
- `src/os/CaseSelectScreen.tsx`
- `src/room/AudioPlayerModal.tsx`
- `src/room/CaseFileModal.tsx`
- `src/room/CityMapModal.tsx`
- `src/room/NotebookModal.tsx`
- `src/scene/BoardConnectionLayer.tsx`
- `src/scene/BoardPin.tsx`
- `src/scene/CloseupOverlay.tsx`
- `src/scene/EvidenceBoardScene.tsx`
- `src/scene/InteractiveProp.tsx`
- `src/scene/InvestigationScene.tsx`
- `src/scene/SceneLayer.tsx`
- `src/scene/assetRegistry.ts`
- `src/scene/coordinates.ts`
- `src/scene/scene.css`
- `src/scene/useCameraController.ts`

## Added

- `scripts/check-case.mjs`
- `src/scene/ProductionArt.tsx`
- `src/scene/usePrefersReducedMotion.ts`
- 24 production WebP files under `public/assets/env/`
- QA screenshots, manifests and reports under `review/`

## Preservation

`src/cases/case-001/case-data.ts`, `src/cases/types.ts`, `src/system/SaveSystem.ts` and all supplied files under `public/assets/case001/` remain byte-identical. See `preservation-audit.json`.
