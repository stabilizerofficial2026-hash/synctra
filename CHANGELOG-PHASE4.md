# Phase 4 — CSS rewrite, milestone 1 (room panel grid) — changelog

Baseline: Phase 3 stylesheet (backup/phase3). Phase 2 checkpoint unchanged.

## !important declarations
- Phase 1: 1506 | Phase 2: 1543 | Phase 3: 1557 | Phase 4 (this milestone): 1521 (change: -36)

## Change
- The room panel grid was set by 23 rules. The rules that set it at phone widths and desktop were kept as two rules: one for the desktop regime (minmax(116px,22%)) and one for phone widths (86px). All other panel grid declarations were removed because they were overridden in every regime by a higher-specificity winner. 20 !important declarations were removed.
- Verified: computed panel grid and all layout boxes identical to Phase 3 at 320, 360, 375, 390, 430 and 1280 px across 13 rooms.

## Modified files
- styles.css only.

## Not done
- The rest of the room CSS (about 1,521 !important declarations). Most of them are load-bearing and need the same per-family, cascade-aware treatment. A tool that determines the winning declaration per element and per width is the next step.
