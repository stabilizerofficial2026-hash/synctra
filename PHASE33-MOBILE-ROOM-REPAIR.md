# Phase 33 — Community Room Mobile Repair

CSS-only refinement for the actual reusable `#community-room-panel` structure.

- Reasserts the intended two-column room grid and top header row.
- Prevents sidebar labels from breaking into narrow vertical fragments.
- Hides the nonessential room description on narrow screens while retaining room identity and navigation.
- Constrains the banner, chat list, message bubbles and composer to the main column.
- Adds narrow-screen sizing for 380px and below.

No JavaScript, Supabase configuration, database schema, authentication or message workflows were changed.

Visual verification on the live device and browser is still required; CSS cannot guarantee identical rendering across all devices.
