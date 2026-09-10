# 3:17 — Case 001: Investigation Environment Design Specification
### Lead Environment Design / Art Direction / Implementation Architecture

**Audit basis:** `three-seventeen/` (React 19 + Vite + TS, `src/room`, `src/detective`, `src/cases`, `src/os`, `src/apps`, `src/system`) and the official `case001` asset package (43-row manifest: characters, gallery, clues, environments, wallpapers, case-art).

---

## 0. Diagnosis — Why the Current Screen Fails the Test

Looking at the current `InvestigationRoom.tsx`: it renders `case001_background.webp` as a full-bleed `background-image` behind a **flex column of five stacked panel `<div>`s** (Case File / Evidence #01 / Field Notebook / City Map / Audio Deck), each with a colored border, an icon, a bold label and an arrow-affordance ("Inspect Phone →"). The evidence wall above it is a separate horizontal-scroll strip of `<img>` thumbnails in white polaroid frames over a dark rounded panel.

Run the test from section 25: hide every label and arrow. What's left is five vertically-stacked rounded rectangles in different accent colors on a dark backdrop — a **settings screen**, not a desk. Nothing overlaps, nothing casts a shadow onto anything else, nothing has a physical size relative to anything else (the phone card and the map card are the same width), and there is no perspective — the "desk" is a list.

This spec replaces the panel-list with an actual composed scene. It does **not** touch `case-engine.ts`, `types.ts`, the deduction/save/hint systems, or the phone OS/apps — those are sound and are preserved as-is (see §L).

---

## A. Investigation Environment Design Spec

**Scene metaphor:** a single continuous desk, shot at a 3/4 downward angle, in a lamp-lit room at night, with the evidence board mounted on the wall behind it. One camera, one physical space, three depth planes (board / desk-back / desk-front), navigated by pushing the camera toward objects rather than opening new screens.

**Depth planes (back to front):**

| Plane | Contents | Parallax factor | Z-order |
|---|---|---|---|
| Room background | wall, shelves, window, ambient dark | 0.05x on tilt | 0 |
| Evidence board | cork/felt board, pinned items | 0.15x | 10 |
| Desk-back | lamp, mug, stacked files, wall-desk seam shadow | 0.3x | 20 |
| Desk-front (hero) | phone, case folder, notebook, map, recorder, evidence bag, loose papers, pens | 0.6x + object-level micro-parallax on device tilt (optional, reduced-motion aware) | 30–39, ordered by object |
| Foreground vignette | lamp glow cone, desk-edge shadow, dust/grain | fixed | 40 |

**Non-negotiable art rule:** every interactive item is a *rendered object* (case001-styled photoreal/painterly asset), never a bordered `<div>` with a label. Labels only appear as **transient contextual tooltips** on first hover/focus, then fade permanently after the object has been visited once (tracked in save state).

---

## B. Portrait Composition / Spatial Layout

Reference canvas: **1080×1920** (9:16), normalized to 0–100 in both axes for all hotspot/asset placement (see §K.4).

```
y=0   ───────────────────────────────  room ceiling/shelf edge (background)
y=8   ┌─────────────────────────────┐
      │        EVIDENCE BOARD        │  ← wall-mounted, ~34% of height
      │   (photos / cards / string)  │
y=42  └─────────────────────────────┘
y=44  ─── desk back edge (seam line, soft AO shadow) ───
      🔆 lamp (left, 18–30x / 46–62y)      files (right, back)
y=50  ───────────────── desk surface begins ─────────────
      [map, part-unfolded, left-back]   [notebook, right-back]
      [case folder, left-front, ¾ open]  [recorder+headphones, right]
      [PHONE — center-front, hero size, screen glow]
      [evidence bag, pens, loose photo prints — scattered fill]
y=96  ─── desk front lip / player-side edge ───
y=100 ───────────────────────────────  bottom safe area (gesture bar)
```

Rules:
- Phone is the largest, most central, most lit object — it's the primary next action for a new player. Everything else recedes around it.
- No two objects share a bounding box edge — every silhouette overlaps its neighbor by 8–20px at final resolution to kill the "grid" read.
- Rotate every desk object 2°–9° off-axis (never perfectly axis-aligned); vary per-object, seeded by object id so it's stable across renders.
- Top 8% and bottom 4% reserved as a persistent minimal-chrome safe zone (see §C exit affordance, §14 HUD).

---

## C. Camera & Navigation Spec

Single `CameraController` owns a target state: `{ view: 'room' | 'board' | 'phone' | 'casefile' | 'notebook' | 'map' | 'recorder', focusPoint: {x,y}, zoom }`. All transitions are camera moves on the *same* DOM scene, not route/modal swaps.

| Transition | Motion | Duration | Easing |
|---|---|---|---|
| Room → Phone | scale+translate scene so phone hotspot fills viewport; cross-fade phone screen power-on | 420ms | cubic-bezier(0.22,1,0.36,1) |
| Phone → Room | reverse of above; phone screen fades to black first (120ms) then camera pulls back | 380ms | same, reversed |
| Room → Board | camera pushes up/in toward board plane; desk plane blurs+darkens (depth-of-field fake via CSS blur+brightness) | 380ms | same |
| Board → Room | reverse | 340ms | same |
| Room → Case File / Notebook / Map / Recorder | camera pushes to object, object animates open in place (folder flips open, notebook page-turns, map unfolds, recorder lid/tray opens) — **no modal chrome**, the object *becomes* the reading surface | 320–450ms depending on object | same |
| Any close-up → Room | reverse push-out | 300ms | same |
| Android Back | pops the `CameraController` view stack (room is the floor state; back never exits the app while stack has entries) | instant nav intent, animated same as above | — |

Implementation note: this is achievable with a single `transform: scale() translate()` on a scene wrapper plus `filter` on non-focused planes — no route changes, no unmount/remount of the room. Close-up "views" (case file open, notebook open, map open, recorder open) render as **absolutely positioned overlays anchored to the object's own coordinates**, scaling up from that anchor, so they visually originate from the object rather than sliding in from an edge.

Reduced-motion: replace push/scale transitions with a 150ms cross-fade; no parallax layers move.

---

## D. Evidence Board UX Spec

Board is a `<div>` sized to the board's normalized region, containing:
- A base cork/felt texture image (`board_base.webp`) — not a solid CSS background.
- Absolutely positioned **pin items**: photo (torn/printed look via `mask` + slight drop shadow + 2–3 rotation), index card, sticky note, printout — each rendered from a small set of "frame" asset variants (polaroid, taped index card, curled printout, torn note) picked deterministically per evidence category, at a rotation/offset seeded by evidence id so layout is stable across sessions but never grid-aligned.
- **Thread layer**: an `<svg>` overlay, one `<path>` per confirmed deduction connection, drawn with a hand-tension quadratic curve between two pin anchor points (not a straight ruler line), animated via `stroke-dashoffset` draw-in (~450ms) on creation, using a static torn-string texture stroke (`stroke: url(#threadPattern)` or a repeating fine-line SVG pattern) rather than a flat color line.
- Board pans/zooms with a two-finger or single-drag gesture when in board close-up (bounded within board content bbox), since a full case's worth of pins won't fit one 1080-wide viewport at readable size — this replaces the current horizontal-scroll-strip solution but keeps its core idea (scrollable overflow) in a way that reads as "leaning over a big board" rather than "swiping a carousel."

**Interaction (keeps the app's existing two-tap logic, restyles the presentation only):**
1. Tap pin A → it lifts slightly (translateY -4px, shadow grows) and a thin highlight ring appears at its edge (not a colored card border).
2. Tap pin B → same lift.
3. A small floating **CONNECT** affordance appears near the midpoint of the two lifted pins (not a fixed bottom button) — tap it, or simply tap-hold either pin, to confirm.
4. Valid: thread draws, a torn-paper "deduction note" flies in and pins itself near the cluster, soft haptic (`hapticEngine.deduction()` already exists), `soundEngine.playDeductionSuccess()`/`playContradictionSting()` already exist and are reused as-is.
5. Invalid: both pins do a short shake (6px, 2 cycles) and settle back down; no persistent red banner — a one-line ephemeral tooltip near the pins ("No connection there yet") fading after 1.6s.

This is a **direct restyle** of the existing `CaseBoardView`/`EvidenceBoard` state machine (`selectedEvidenceA/B`, `CaseEngine.tryConnectEvidence`) — no new interaction logic is required, only new presentation.

---

## E. Digital → Physical Evidence Flow

1. Inside NOVA (phone), player opens an app (Messages/Photos/Calls/etc.) and taps a flagged item → existing `clueEvidenceId` unlock fires, evidence is added to `discoveredEvidenceIds` (unchanged, `SaveSystem`/`CaseEngine` untouched).
2. A **non-blocking toast** slides up from the phone's own bottom edge: a small torn-paper chip with the evidence title and a pin icon — "Logged to case." (replaces any full-screen "Evidence Logged!" banner if one exists) — reads as *the detective jotting it down*, not a system notification.
3. On next Room→Board camera push, any evidence discovered-but-not-yet-visualized on the board animates in: it drops onto the board with a small physical "thwip + pin click" (existing `playPinCorkboard()`), landing at its seeded position. This is the only "reveal" moment — no separate "new evidence" modal.
4. Evidence discovered outside the phone (i.e. attached to a clue photo asset, per manifest `clueEvidenceId` on `CLUE-###` rows) surfaces through the **case folder / notebook / map / recorder** close-ups the same way — inspecting the physical object can itself unlock evidence, using the same `discoveredEvidenceIds` mechanism the phone uses today (currently under-used outside NOVA; recommend wiring it in, see §L).

---

## F. Desk / Board Progression States

Driven entirely by existing save-state counts — no new state fields required, only new **visual thresholds**:

| State | Trigger | Board | Desk |
|---|---|---|---|
| 0 — Open | `discoveredEvidenceIds.length === 0` | Sarah's photo, "MISSING," suspect polaroids only, one handwritten "03:17 ?" card | Folder closed, map folded, notebook closed, clean surface |
| 1 — Early | 1–4 evidence discovered | first printouts/threads start appearing near relevant suspects | folder ¼ open with 1–2 loose pages, notebook has a bent corner |
| 2 — Mid | 5–10 evidence, ≥1 deduction unlocked | contradiction notes, first threads, "3:17" cluster starts forming | map half-unfolded, coffee mug appears, notebook has visible handwriting through translucent cover |
| 3 — Late | ≥11 evidence or ≥60% deductions | dense board, timeline strip forms along the bottom edge of the board | full clutter, notebook clearly full, "Final Report" becomes reachable from the folder itself (a physical form/stamp on the last folder page), not a floating button |

This is a lookup table keyed off counts already present in `CaseSaveState` (`discoveredEvidenceIds.length`, `unlockedDeductionIds.length`) — implement as a pure function `getProgressionStage(saveState): 0|1|2|3` consumed by the scene layer to pick which asset variants/overlays to render.

---

## G. Visual Design System

- **Palette:** near-black room base (`#070503`–`#0c0a08`), warm tungsten lamp core (`#f5c453`→`#c47a1f` falloff), cool blue-grey ambient fill (`#1b2436` at low opacity), desk wood warm dark brown, board cork/felt neutral tan-grey. Avoid saturated accent colors outside the lamp/phone glow.
- **Typography:** one display/handwritten face reserved *only* for in-world text (sticky notes, folder labels, notebook handwriting) rendered as styled text or baked into assets — never used for UI chrome. One clean sans for the sparse UI chrome that does exist (exit affordance, contextual tooltip).
- **No card language:** no rounded-rectangle panels with borders/shadows standing in for objects anywhere in the room/board/desk views. Modals are retired in favor of camera-anchored close-ups (case file, notebook, map, recorder already have dedicated files — restyle in place, don't delete).
- **Iconography:** none floating over desk objects. Where an interactive affordance is truly ambiguous (e.g., recorder play button), render it as a physical button on the physical object's asset, not a UI icon overlay.

---

## H. Motion System

Central `CameraController` (see §C) + per-object **micro-motion**: idle desk objects get a barely-perceptible breathing drift (2–3px, 6–9s loop, staggered phase) so the scene doesn't feel static — disabled under reduced-motion. Object open/close motions (folder flip, notebook page turn, map unfold, recorder tray) are asset-anchored transform sequences (~300–450ms), not generic slide/fade modals.

---

## I. Sound Direction

Reuses existing `SoundEngine` (`playTap`, `playDeskLampToggle`, `playPinCorkboard`, `playDeductionSuccess`, `playContradictionSting`, `playWrongAccusation` all already implemented). Add: a persistent low room-tone bed (rain/distant city, looping, very low volume, toggled by lamp state) and per-object one-shots — folder paper rustle, notebook page turn, map paper unfold, recorder mechanical click — mapped 1:1 to the new close-up transitions in §C. No added score/music; silence remains the default emotional register.

---

## J. New Asset Requirement List

Existing manifest already covers characters, gallery, clues, environments, wallpapers, case-art — **all reused as-is** for phone content and board photographs. The gap is purely **desk/room/board furniture**, which does not exist yet:

| asset_id | filename | purpose | dims | aspect | alpha | perspective | light dir | interactive | layer |
|---|---|---|---|---|---|---|---|---|---|
| ENV-ROOM-01 | room_background.webp | night room backdrop, shelves, window | 1440×2560 | 9:16 | opaque | 3/4 downward, matches desk cam | cool ambient, no hot spot | no (background) | 0 |
| BOARD-BASE-01 | board_base.webp | cork/felt board surface, wall-mounted | 1200×1000 | ~6:5 | opaque | frontal, slight tilt matching room persp. | ambient + faint lamp spill bottom-left | yes (tap→board view) | 10 |
| BOARD-PIN-FRAME-01..04 | pin_frame_polaroid/index/note/print.webp | reusable pin "mounts" that any evidence photo/text drops into | var. | var. | alpha edges | flat | n/a | n/a (decor) | 11 |
| DESK-SURFACE-01 | desk_surface.webp | desk wood top + back edge, receding persp. | 1440×900 | ~16:10 | opaque | top-down/¾ hybrid matching board | warm lamp pool left, cool falloff right | no | 20 |
| DESK-LAMP-01/02 | desk_lamp_off.webp / desk_lamp_on.webp | tap-toggle lamp prop, two states | 300×400 | 3:4 | alpha | side, matches desk | is the light source | yes (toggle) | 22 |
| PROP-CASEFOLDER-CLOSED/OPEN | case_folder_closed.webp / case_folder_open.webp | case dossier, closed + ¾-open states, 2 progression variants each (early/late clutter) | 500×650 | ~4:5 | alpha | ¾ desk persp. | lamp-lit | yes | 30 |
| PROP-PHONE-01 | nova_phone.webp (+ dynamic screen mask) | Sarah's phone body, screen area masked for live NOVA render | 400×820 | ~9:18.5 | alpha | ¾ desk persp. | screen self-illum + lamp rim | yes (hero) | 35 |
| PROP-NOTEBOOK-CLOSED/OPEN | notebook_closed.webp / notebook_open.webp | field notebook, progression variants (blank/partial/full pages) | 450×600 | 3:4 | alpha | ¾ desk persp. | lamp-lit | yes | 31 |
| PROP-MAP-FOLDED/PARTIAL/UNFOLDED | city_map_*.webp | physical city map, 3 fold states tied to progression stage | 700×550 | ~4:3 open | alpha | overhead for open state | ambient + lamp edge | yes | 29 |
| PROP-RECORDER-01 | audio_recorder.webp | handheld recorder prop | 260×160 | ~13:8 | alpha | ¾ | lamp-lit | yes | 32 |
| PROP-HEADPHONES-01 | headphones.webp | draped beside recorder | 300×220 | var. | alpha | ¾ | ambient | no (decor, or opens recorder too) | 33 |
| PROP-EVIDENCEBAG-01 | evidence_bag.webp | transparent sleeve holding a printed clue photo (photo swapped per case data) | 260×340 | ~3:4 | alpha, translucent plastic | ¾ | lamp specular hit | possibly yes (inspect) | 34 |
| PROP-MUG-01 | coffee_mug.webp | mid/late progression desk clutter | 140×160 | ~1:1 | alpha | ¾ | lamp-lit | no | 36 |
| PROP-PAPERS-01..03 | loose_paper_stack.webp / loose_paper_single.webp / pen.webp | filler clutter, progression-gated count | var. | var. | alpha | ¾ | lamp-lit | no | 37 |
| BOARD-THREAD-TEX-01 | thread_texture.svg (pattern) | string/cord stroke pattern for SVG connector paths | pattern tile | — | alpha | n/a | n/a | n/a | 12 |
| FX-LAMPCONE-01 | (procedural, CSS/SVG radial-gradient — no raster needed) | warm light cone | — | — | — | — | — | — | 25 |

Total new raster props: **~20 files** (several with 2–4 state variants), all producible in the same WebP pipeline/style as the existing manifest, using the character bible's lighting/material language (§12 of the brief) rather than new art direction from scratch.

---

## K. React Implementation Architecture

### K.1 Component tree (replaces the panel-list body of `InvestigationRoom.tsx`; modal files are repurposed, not deleted)

```
<InvestigationScene>                       // owns CameraController state, replaces current root layout
  <SceneLayer plane="room" />
  <SceneLayer plane="board">
    <EvidenceBoardScene />                 // restyle of CaseBoardView/EvidenceBoard content
      <BoardPin ... />[]
      <BoardConnectionLayer />             // SVG thread overlay
  <SceneLayer plane="desk-back">
    <InteractiveProp id="lamp" .../>
    ...clutter (non-interactive)
  <SceneLayer plane="desk-front">
    <InteractiveProp id="phone">  <PhoneCloseup>{NOVA OS mounts here, unchanged}</PhoneCloseup> </InteractiveProp>
    <InteractiveProp id="casefile"><CaseFileScene/></InteractiveProp>   // restyle of CaseFileModal
    <InteractiveProp id="notebook"><NotebookScene/></InteractiveProp>   // restyle of NotebookModal
    <InteractiveProp id="map"><MapScene/></InteractiveProp>             // restyle of CityMapModal
    <InteractiveProp id="recorder"><RecorderScene/></InteractiveProp>   // restyle of AudioPlayerModal
  <SceneChrome>                            // top exit affordance only, §14
```

### K.2 State ownership
- `CameraController` (new, small hook `useCameraController()`): owns `viewStack: SceneView[]`, exposes `pushView(view)`/`popView()`, wired to the Android hardware-back handler that presumably already exists at the App level (verify in `App.tsx`) instead of introducing a second back-handling path.
- `CaseSaveState` / `CaseData` / discovered evidence / deductions: **unchanged**, still owned wherever `App.tsx` currently owns them and passed down — the scene is a pure presentation layer over the same props `InvestigationRoom` already receives.
- `getProgressionStage(saveState)` (new, pure function in `cases/` or a new `scene/` folder): derives 0–3 from existing counts, consumed by prop components to select asset variants.

### K.3 Scene transitions
`CameraController` transitions are pure CSS transform changes on plane wrappers driven by the current `view` — no React Router, no mount/unmount of the room between views (phone, board, and close-ups are *overlays positioned at their object's coordinates*, toggled by opacity/scale/pointer-events, so state inside them — e.g. NOVA's own internal navigation — persists across a room round-trip without reinitializing).

### K.4 Coordinate system (see §K "board coordinate system" ask + §20 overall)
Single normalized **1080×1920 reference canvas**. Every prop/hotspot/pin gets `{xPct, yPct, widthPct}` authored against that canvas. The scene root is a fixed-aspect container (`aspect-ratio: 9/16`) that itself is `object-fit: cover`-scaled/cropped to the real viewport, so all children using percentage-based positioning stay correctly aligned across Android aspect ratios (long 20:9 phones simply see slightly more top/bottom room background; ultra-narrow phones crop room edges, never desk-front content — enforce a "safe content zone" of 82% width in the reference canvas for anything gameplay-critical).

### K.5 Board coordinate system
Board pins store their own normalized `{xPct, yPct, rotationDeg}` *relative to the board's own bounding box*, not the outer scene canvas — keeps them stable if the board's on-screen size changes between room-view (small) and board-close-up (large/pannable). Seed rotation/offset deterministically from `evidenceId` hash so layout is reproducible without hand-authoring 40+ positions; allow manual overrides per id for hero/critical evidence where composition matters (e.g., keep the "3:17" cluster visually central at late-game per the brief).

### K.6 Asset loading
Preload the always-visible room/board/desk base layers + current progression-stage prop variants on scene mount; lazy-load close-up detail assets (open folder pages, open notebook pages) on first camera push toward that object, with a 1-frame preload-ahead triggered on touch-down (before touch-up commits the navigation) to hide load latency.

### K.7 Save-state / case-engine integration
No changes to `case-engine.ts`'s matching logic. Only integration point: wire `discoveredEvidenceIds`/`unlockedDeductionIds` into `getProgressionStage()` and into `BoardPin` mount/unmount so new evidence "lands" on the board visually the first time it's rendered after discovery (track a `viewedOnBoardIds` addition in save state, small and additive, doesn't touch existing fields).

---

## L. Current Code Migration Plan

**Preserve entirely, untouched:**
- `cases/case-engine.ts`, `cases/types.ts`, `cases/case-001/case-data.ts` — data/logic layer is solid and well-typed.
- `system/SoundEngine.ts`, `system/HapticEngine.ts`, `system/SaveSystem.ts`.
- All of `os/*` and `apps/*` (NOVA OS + the 9 phone apps) — genuinely already avoids most of the "card dashboard" trap since it's meant to look like a phone OS. Only change: how it's *entered/exited* (camera push instead of full unmount).

**Refactor (restyle, keep logic):**
- `room/CaseFileModal.tsx`, `room/NotebookModal.tsx`, `room/CityMapModal.tsx`, `room/AudioPlayerModal.tsx`, `room/FinalReportModal.tsx` — keep their internal content logic, convert from centered modal chrome to camera-anchored close-up overlays per §C/§K.
- `room/CaseBoardView.tsx` and `detective/EvidenceBoard.tsx` — **these are two parallel implementations of the same tap-to-connect board** (one hand-rolled matching against `deductions`, one properly calling `CaseEngine.tryConnectEvidence`). Consolidate to one `EvidenceBoardScene` that uses the `CaseEngine` version (it already handles contradictions distinctly) and restyle per §D. Delete the duplicate rather than restyling both.

**Remove:**
- The current `InvestigationRoom.tsx` panel-list body (lines rendering the 5 stacked rectangles + evidence-wall strip) — replaced by `InvestigationScene` per §K. Keep the file's prop interface and top-level wiring to `App.tsx` (`onEnterPhone`, `onOpenBoard`, `onUnlockDeduction`, `onSubmitAccusation`) intact so the parent doesn't need to change.
- The persistent HUD row ("0 Clues Logged • 0/4 Deductions," "Lamp ON" pill) — folded into ambient/contextual presentation per §14.
- The `assets/` folder duplication currently in the repo (`public/assets/case001/case001/case001/...` triple-nesting visible in the extracted project, plus a leftover `3-17-case001-character-canon.zip` sitting inside `src/`) — flatten to a single `public/assets/case001/` tree matching the manifest, remove the stray zip from `src/`.

**Reuse directly:** every asset in the existing manifest (characters, gallery, clues, environments, wallpapers, case-art) — none of it needs to be redone, it all already avoids the "card" problem since it's photographic/scene content, not UI.

---

## M. Performance Plan (mid-range Android budget)

- Cap simultaneously-mounted full-res raster layers at **~10** (room bg, board base, desk surface, lamp, 5 desk props, phone) — everything else (clutter, pin frames, thread pattern) is either a shared small texture or SVG.
- WebP at 2x target device density max (no 3x/4x variants); board pin thumbnails capped at 400px longest edge, full evidence photo loaded only in phone/close-up inspect view.
- GPU-only transforms for camera moves (`transform`, `opacity`) — never animate `top/left/width/height`.
- Depth blur on unfocused planes via a single cheap `filter: blur()` toggle, not per-object blur.
- Board thread SVG paths capped at reasonable count (case has a bounded deduction count from `case-data.ts`); no per-frame path recalculation — draw once on connect, static after.
- DOM count: pins + props render as plain positioned elements, not one component per pixel of texture; target board view under ~150 DOM nodes even at late-game density.
- Preload-ahead on touch-down (§K.6) rather than blocking spinners.

---

## N. Step-by-Step Implementation Plan

1. **Asset production**: produce the ~20 new prop files in §J at the manifest's existing quality bar (reuse the character bible's material/lighting language: warm tungsten + cool ambient, no baked UI, no readable placeholder text).
2. **Coordinate + progression scaffolding**: add the reference-canvas constants, `getProgressionStage()`, and normalized position data for room/board/desk (§K.4–K.5) — no rendering yet, just data + types.
3. **`CameraController`**: build the view-stack hook and wire it to the existing Android back handling in `App.tsx`.
4. **`SceneLayer` + `InteractiveProp` primitives**: generic, reusable, parallax + hotspot components consumed by everything else.
5. **Room/desk assembly**: compose room background, board (static, unstyled pins for now), desk-back, desk-front using the new primitives — get the *silhouette and composition* right before any interaction logic.
6. **Wire phone**: mount existing NOVA OS inside the new `phone` `InteractiveProp` close-up; confirm state survives round-trips to room.
7. **Consolidate + restyle board**: merge `CaseBoardView`/`EvidenceBoard` into one `EvidenceBoardScene` using `CaseEngine`, apply pin/thread visuals from §D, wire progression stages from §F.
8. **Restyle remaining close-ups**: case file, notebook, map, recorder — convert modal chrome to anchored overlays, keep internal content logic as-is.
9. **Digital→physical hookup**: toast-on-discover + board pin auto-drop per §E.
10. **HUD strip-down**: remove persistent counters/pills, add the minimal exit affordance + transient tooltips only (§14).
11. **Sound/motion pass**: wire new one-shots and ambient bed, add idle micro-motion, verify reduced-motion path disables it cleanly.
12. **Cleanup**: delete the duplicated `assets/` nesting and stray zip in `src/`, delete the now-unused old panel-list JSX.
13. **Device pass**: test on a couple of real portrait aspect ratios (tall 20:9 and squarer ~16:9) to confirm the safe-content-zone cropping in §K.4 holds, and profile on a mid-range device against the §M budget.

---

## Final Self-Check Against §25

With every label hidden, the scene reads as: a lamp-lit desk against a pinned evidence board, in that order — that's the composition test passed by construction (§B). Interaction is tap-the-object-itself with camera pushes, not tap-the-card-then-read-a-menu — that's the "manipulating a place" test passed by the `CameraController` + `InteractiveProp` model replacing the modal/panel model throughout.
