# Build and test report

Validated 2026-09-09 using Node.js 24.19.0.

| Check | Result |
|---|---|
| `npm ci` | PASS |
| `npm test -- --run` | PASS — 40 canonical case/data/asset checks |
| `npm run lint` | PASS — exit 0, no project warnings |
| `npm run build` | PASS — TypeScript + Vite 8.2.2, 1,887 modules |
| WebP validation | PASS — all 24 production environment assets |
| Required runtime screenshots | PASS — 7/7 captured from the running React application |
| Gameplay loop | PASS — phone, evidence logging, room return, board, connection, deduction, notebook, case file |
| Browser/back navigation | PASS for tested room and phone transitions |
| Reload persistence | PASS — 2 clues, 1 deduction and phone unlock retained |
| Portrait layouts | PASS — 360×800, 390×844, 412×915, 430×932 |
| Offline image audit | PASS — no external image URLs rendered |
| Physical Android hardware | Not run; exact CSS portrait dimensions were browser-tested |

Final compiled output:

- JavaScript: 352.88 kB / 101.43 kB gzip
- CSS: 15.19 kB / 4.55 kB gzip
- HTML: 0.63 kB / 0.38 kB gzip

The canonical Case 001 data, types, SaveSystem and all 46 supplied Case 001 support files remain byte-identical. `case-engine.ts` differs only because four external case-cover URLs were replaced with existing local canonical artwork; evidence, deduction, scoring and ending logic were not changed.

Raw command results are recorded in `test-output.txt`, `lint-output.txt` and `build-output.txt`. npm emitted an environment-level unknown `http-proxy` configuration warning; it did not affect tests or the build.
