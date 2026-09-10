# 3:17 — Case 001 integrated environment

Integrated React/Vite source, 24 environment images, canonical Case 001 assets and production build.

**Review checkpoint, not a QA-approved handoff.** Browser access was blocked in the build environment. The seven requested app screenshots and interactive Android QA remain outstanding. Do not hand this to Antigravity until that review passes.

## Run

Use Node.js 22.12+ (verified build on Node.js 24.19.0).

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. Select Case 001 and enter the investigation. Tap Sarah’s physical phone in the center of the desk. Close-ups have a Desk return control. Connect two discovered evidence pins on the wall board; use the notebook and case folder to review progress.

```sh
npm test
npm run lint
npm run build
npm run preview
```

`dist/` includes the compiled application and assets. Serve it over HTTP; opening index.html via file:// is unsupported. This is a web project, not an Android APK. Android hardware-back behavior needs on-device browser/WebView verification.

## Architecture and art

The original scene layers, camera-controller API, prop hotspots, normalized coordinates, close-up system and CaseEngine remain. ProductionArt renders centrally registered artwork with alpha or vector silhouette masks. The master room plate supplies the wall, receding desk, window and ambient light; interactive props remain separate layers. Room layout uses a uniformly scaled 9:16 canvas with letterboxing on taller screens.

The supplied Sarah, Alex, Maya, Ryan and Daniel assets and all other original Case 001 assets are preserved. The original case engine, types, save system and case data are unchanged.

`review/` contains asset/provenance manifests, preservation audit, changed files, QA and build reports, test output, remaining TODOs and the exact manual review procedure. `review/screenshots/README.md` records why screenshots are absent.
