# SyncTrA Phase 28 — Reference-led messenger and profile alignment

## What changed
- Reworked the Open Minds room into a full-screen phone-first messenger with a SyncTrA header, compact left room rail, artwork-backed room banner, aligned avatar/message rows, and a bottom-aligned composer.
- Preserved existing room artwork and accent mapping, with a dedicated multicolor LGBTQ+ accent treatment.
- Standardized bubble widths, author/time alignment, line wrapping, message scrolling, composer sizing, and touch targets for narrow Android screens.
- Refined the profile card cover, overlapping avatar, compact statistics, bio panel, and action controls.
- Added a back-to-room control that uses the existing close-room flow.

## What did not change
- Supabase queries, authentication, RLS, membership gating, message sending/history/realtime, moderation/reporting, slow mode, and ambience controls.
- No database migration is required.

## Validation
- `node --check app.js` passed.
- HTML duplicate-ID check passed.
- This is source-level styling validation. A live authenticated Android browser test is still needed at 320px, 360px, 390px, and 430px, including keyboard-open composer behavior and all room themes.
- Existing message avatars remain initials because the current message profile query only retrieves `user_id` and `display_name`; no avatar URL is fetched by this screen.
- The reference shows creator ranks and badges that are not currently supplied by this chat's data model. Those have not been fabricated.

## Deploy
Replace `index.html`, `styles.css`, `app.js`, and the assets folder with this package in the existing repository. No SQL migration is required.
