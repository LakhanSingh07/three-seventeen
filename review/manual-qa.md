# Manual QA execution record

Executed 2026-09-09 in Chrome against the production bundle.

| Test | Result | Evidence |
|---|---|---|
| Fresh initial room, spoiler-free board | PASS | 01 initial room |
| Physical phone focus and NOVA lock screen | PASS | 03 phone view |
| Log Alex message and Central Station ping | PASS | Runtime state + 02 mid-game room |
| Board inspection and valid connection | PASS | 04 board + 05 deduction |
| Deduction reflected in notebook | PASS | 07 notebook |
| Known case facts in dossier | PASS | 06 case file |
| Map progression gating | PASS | Apartment + Central Station only |
| Recorder empty-transfer handling | PASS | Physical recorder close-up inspected |
| Browser Back from phone | PASS | Returned to room, no stale overlay |
| Reload persistence | PASS | 2 clues, 1 deduction, phone unlocked |
| 360×800 | PASS | All critical props inside chassis |
| 390×844 | PASS | Seven primary screenshots |
| 412×915 | PASS | All critical props inside chassis |
| 430×932 | PASS | All critical props inside chassis |
| Application console | PASS | No app-origin error observed |
| Local/offline imagery | PASS | Zero external rendered image URLs |

Automated coverage separately verifies duplicate deductions, unrelated evidence pairs, all four canonical deductions, save/load round trip, initial empty state, solved/wrong endings and all 24 WebP containers.

Physical Android hardware was not available in this environment; this is recorded as a final release-device check rather than represented as completed.
