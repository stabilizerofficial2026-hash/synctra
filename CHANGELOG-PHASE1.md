# SyncTrA — Phase 1 changelog (local working copy)

Baseline: local working copy (see backup-manifest/ORIGIN.tsv). Original files were not modified.

## Added
- assets/open-minds/clean/*.webp (12): derived banners with the baked-in "Welcome to" caption removed (bottom 20% cropped). Originals are kept in assets/open-minds/.
- assets/open-minds/satanism-emblem.webp: icon-only circle from the supplied transparent emblem (lettering excluded).
- assets/open-minds/satanism-banner.webp: wide Satanism banner from the supplied artwork. Its own lettering is kept, and the app title is hidden for this room.
- assets/open-minds/satanism-wallpaper.webp: vertical wallpaper from the supplied artwork, with the centre logo band blended out.
- assets/rooms/judaism-emblem.webp and judaism-sidebar.webp: PROVISIONAL crops from judaism.webp. Approval and higher-resolution art are needed.
- PHASE36-SATANISM-REFERENCE-REBUILD.md: copied from the candidate upload, so it is preserved.
- CHANGELOG-PHASE1.md (this file).

## Modified
- app.js: removed the duplicate theme entry `open` (identical to `open-discussion`); the default slug is now `open-discussion` (2 references); room artwork uses assets/open-minds/clean/; the Satanism entry gained bannerArtwork, wallpaper and emblem; new `judaism` theme entry; applyCommunityTheme sets --room-wallpaper and uses theme.emblem when present; added the missing comma after the hacker entry (found by module parse).
- index.html: Judaism option added to the theme selector (value = database slug `judaism`).
- styles.css: Judaism accent rule (provisional colours); Satanism title and category hidden visually but kept for screen readers; theme selector shows a palette icon instead of a truncated room name. This added 13 !important declarations.

## Removed
- The duplicate `open` theme entry in app.js, after confirming it was unused once the two references were updated.

## Not changed
- All original artwork files, including lgbtq.webp (kept until a 2:1 banner exists).
- Supabase, database seed files, RLS policies, RPCs and production data.
