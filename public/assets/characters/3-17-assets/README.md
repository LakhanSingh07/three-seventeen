# 3:17 — Case 001 Visual Assets

Production asset package for **The Missing Girl**. This checkpoint contains the approved character canon and six master identity assets. Gallery, clue, environment, wallpaper and case-art folders are reserved for subsequent production phases.

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
- Phase 3 — Normal phone gallery: pending
- Phase 4 — Investigation/clue photography: pending
- Phase 5 — Environments: pending
- Phase 6 — NOVA OS wallpapers: pending
- Phase 7 — Case art: pending

