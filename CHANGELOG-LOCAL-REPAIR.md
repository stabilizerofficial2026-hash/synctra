# SyncTrA Local Repair — 2026-11-22

## Scope
A conservative repair of the uploaded GitHub source ZIP. The original ZIP was not modified. This is a separate working copy and has not been deployed.

## Changes
- Restored a `judaism` entry in `GROUP_THEMES`, using the existing `assets/open-minds/judaism.webp` artwork and a Judaism-specific icon, label, subtitle, and tone.
- Removed broken references to three Satanism files that are not present in this source archive. The Satanism theme now reuses the existing `assets/open-minds/satanism.webp` artwork for its banner and wallpaper. No separate emblem asset was fabricated; the existing room icon remains the emblem fallback.
- Removed the one-byte root-level `folder.` stray file after confirming it was not referenced by application code or documentation.
- Left authentication, Supabase configuration, SQL migrations, database logic, and deployment settings unchanged.

## Important limitation
The Phase 36 README describes separate wallpaper, banner, and emblem files, but those files were not present in the uploaded ZIP. This repair prevents broken asset requests by reusing the artwork that is actually present. It does not recreate the missing original artwork or claim exact reference fidelity.
