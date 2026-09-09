# 3:17 — Case 001 Visual Assets

Complete production asset package for **The Missing Girl**, containing all 42 approved visual assets plus reference and integration documentation.

## Antigravity integration

Copy `case001` into the app's asset root and preserve filenames. Runtime paths should resolve as:

```text
/assets/case001/characters/sarah_profile.webp
/assets/case001/characters/alex_profile.webp
/assets/case001/characters/maya_profile.webp
/assets/case001/characters/ryan_profile.webp
/assets/case001/characters/daniel_profile.webp
/assets/case001/characters/unknown_avatar.webp
```

All master portraits are 1024 × 1024 WebP files. Use them directly for contact avatars and dossiers. For later generated scenes, supply the relevant master portrait(s) as identity references; do not regenerate characters from text alone.

## Source of truth

- `case001/reference/character_bible.md` defines locked appearance, styling and distinguishing features.
- `case001/manifest/asset_manifest.csv` maps asset IDs to integration paths and usage.
- Image files contain no UI, labels, timestamps, logos or important readable text.

## Character consistency rule

Sarah is the primary identity anchor. In multi-character images, reference each character's individual master asset. Scene prompts may change expression, pose, clothing within the documented style, and lighting, but must preserve facial identity and distinguishing features.

## Status

- Phase 1 — Character canon: complete
- Phase 2 — Character master assets: complete
- Phase 3 — Normal phone gallery: complete (10 assets)
- Phase 4 — Investigation/clue photography: complete (12 assets)
- Phase 5 — Environments: complete (6 assets)
- Phase 6 — NOVA OS wallpapers: complete (3 assets)
- Phase 7 — Case art: complete (5 assets)

## Runtime rules

- Preserve the exact directory and lowercase snake-case filenames.
- Render messages, maps, timelines, EXIF, evidence cards, tickets, receipts and other UI programmatically; none are included as raster screenshots.
- Important text should be rendered by the app, not extracted from these images.
- Use `manifest/asset_manifest.csv` as the authoritative ID/path map.
- See `reference/qa_report.md` for final validation notes.

