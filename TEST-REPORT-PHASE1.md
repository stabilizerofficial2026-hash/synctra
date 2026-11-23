# Phase 1 test report (local, simulated where stated)

Environment: local static files; Supabase replaced by an isolated stub with fixture data (SIMULATED). No live Supabase, no production data touched.

## Passed (simulated, using the real app code path)
- app.js parses as an ES module (`node --input-type=module --check`). NOTE: an earlier `node --check app.js` returned OK for a file that failed this stricter parse, so that check is not reliable here.
- All 13 theme-selector options switch to the matching room through the real selector handler at 390 px. The selector value matches the room slug in every case. Results: selector_results.json.
- Open Discussion: the selector now starts on its own value (it was blank before).
- Hacker: the selector value is hacker-community and the room loads the green theme and emblem through the alias.
- Judaism: the room opens with its own accent, emblem, banner and sidebar art.
- Satanism: the app title is hidden (1 px box); Phase 36 emblem and wide banner load.
- No page errors and no HTTP 4xx responses for assets in these runs.
- Rendered banners for Open Discussion, Satanism and Judaism show no stray "Welcome to" text.

## Failed or still open
- Sidebar category caption overlaps the emblem (seen in Open Discussion and Hacker, marginally in Judaism). NOT fixed.
- Satanism Phase 36 design is only partly integrated: gold frame, composer attachment and microphone controls, and read receipts are NOT done. Read receipts and attachments are not in the current data model, so they must not be faked.
- CSS consolidation NOT done; !important count rose from 1493 to 1506 in this phase.
- LGBTQ+ banner still uses the square badge lgbtq.webp (kept by instruction until 2:1 art exists).
- LGBTQ+ soundscape `forest` has no matching theme key, so tone lookup falls back. NOT fixed.

## Not tested
- Widths 320, 360, 375, 430 and 1280 px: not run in this phase (only 390 px).
- Per-room visual comparison of all 13 rooms: only three rooms and five sidebars were viewed.
- Live Supabase: not tested. Whether the Judaism row exists in production: NOT verified (no access; seed only).
- Authentication, private messages, groups, notifications, news feed, studios: not re-tested in this phase.
- Real devices and keyboard-open behaviour: not tested.
