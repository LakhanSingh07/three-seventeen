# QA report — passed for integrated review

Validated 2026-09-09 against the production build in Chrome at exact framed Android portrait dimensions. This is the complete integrated review checkpoint; it has not been handed to Antigravity.

## Acceptance result

PASS. The scene reads as one physical investigation room: a wall-mounted cork board above a receding wooden desk, lit by a warm tungsten task lamp against cool night ambience. Sarah's recovered phone is the hero object. The case folder, notebook, map, recorder, headphones and evidence materials read as physical props with natural rotation, overlap, material variation and shadow.

No permanent prop labels, clue counters, HUD panels, neon borders, glass cards or dashboard navigation are present in the room. Initial state contains only Sarah's canonical photograph and the 03:17 note; no undiscovered clue or spoiler is baked into the board or raster artwork.

## Gameplay loop

| Check | Result | Observation |
|---|---|---|
| Room → physical phone | PASS | Camera focuses the desk phone; the physical device transitions into NOVA OS. |
| Unlock → Messages → evidence | PASS | Alex's 02:38 alibi message logs to the board once. |
| NOVA Home → Maps → evidence | PASS | Central Station tower record logs to the board once. |
| Return to room | PASS | Two new physical papers appear on the board; desk materials advance to the mid-game arrangement. |
| Physical board close-up | PASS | Both evidence papers are readable and inspectable on cork. |
| Connect evidence → deduction | PASS | The valid pair unlocks `DED_ALEX_ALIBI`, draws a red thread and adds the physical deduction note. |
| Return → notebook | PASS | The unlocked question and canonical deduction text appear on the paper notebook. |
| Return → case file | PASS | Sarah's canonical photo and known case facts render on a scrollable physical dossier. |

Duplicate and unrelated deduction behavior is covered by automated checks. The physical map correctly showed only Sarah's Apartment and Central Station after the two discoveries; Bluebird Cafe and Riverside remained gated. The recorder close-up showed the intentional empty-transfer state without inventing audio.

## Navigation and persistence

- Browser Back from the phone close-up returned to the room without a blank view or stale overlay.
- Room close-up Back controls passed for board, map, recorder, case file and notebook.
- After reload, Case 001 resumed with “2 clues logged · 1 deductions”.
- Sarah's phone remained unlocked after reload; NOVA Home opened without replaying the lock screen.
- Logged evidence and the deduction remained present after reload.

## Portrait layout

Tested at 360×800, 390×844, 412×915 and 430×932 CSS pixels. The fixed 9:16 scene is center-cropped without stretching. After the final safe-area adjustment, the case folder, field notebook, audio recorder and phone all measured inside the chassis at every tested size. At 360×800, the tightest remaining inset was 6 px on the case-folder hitbox; no prop was clipped.

## Visual QA and iteration

Seven actual runtime screenshots were inspected. Two issues found during QA were corrected before sign-off:

1. Side desk props were pulled into the centralized safe area for narrow Android frames.
2. Evidence-board scrollbar chrome was hidden while retaining touch panning and zoom.

The final screenshots show coherent lighting, perspective and material treatment. No checkerboards, obvious raster rectangles, inconsistent generated-room plates, floating UI cards or visible dashboard chrome remain in the physical investigation views.

## Runtime integrity

- 23 rendered images in the mid-game room; zero externally hosted image URLs.
- 351 DOM elements in the tested mid-game view.
- No application-origin console errors were observed. Cloud-browser extension diagnostics were excluded because they are not emitted by the app.
- All important readable content is live HTML text rather than baked raster text.

## Screenshots

1. `01-initial-investigation-room.png`
2. `02-mid-game-investigation-room.png`
3. `03-phone-focused-view.png`
4. `04-evidence-board-closeup.png`
5. `05-evidence-connection-deduction.png`
6. `06-case-file-closeup.png`
7. `07-notebook-closeup.png`

Additional layout evidence: `layout-360x800.png`, `layout-412x915.png`, and `layout-430x932.png`.

## Scope note

The exact Android viewport sizes were exercised in a real browser runtime, not on physical Android hardware. Native device-only behavior such as OEM WebView quirks and hardware haptics remains a final device-lab check, not a blocker for this integrated review build.
