# SyncTrA Phase 32 — Premium phone-first layout refinement

## Scope
This update focuses on borders, alignment, text wrapping, card sizing, room discovery cards, group forms, and mobile room messenger layout. It is a CSS-only change; existing JavaScript, Supabase queries, authentication, RLS, messaging, moderation, and data schemas are not intentionally changed.

## Improvements
- Normalized box sizing and prevented horizontal page overflow.
- Made room and private-group discovery grids responsive and evenly sized.
- Improved room introduction headings and descriptive text wrapping.
- Improved ambience controls and private-group forms on narrow screens.
- Reduced clipping in room headers, side navigation, message bubbles, and composer areas.
- Added extra narrow-screen adjustments for widths at or below 380px.
- Preserved desktop layout through responsive breakpoints.
- Added visible keyboard focus and reduced-motion handling.

## Validation
This is a source-level CSS refinement. Live visual verification is still required on Android at 320px, 360px, 390px, and 430px, plus desktop. Please test login, feed, Open Minds room discovery, room chat, private groups, profile, messages, and keyboard-open composer behavior. No claim of pixel-perfect behavior is made without live device testing.

## Deployment
Replace the existing `styles.css` with this package's `synctra-main/styles.css`, then deploy through the existing SyncTrA repository workflow. No SQL migration is required.
