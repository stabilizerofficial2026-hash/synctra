# SyncTrA Phase 9A — Paid Membership Foundation

This package preserves the Phase 8C Fix 2 application and adds a private-membership gate in the frontend. The Supabase security migrations have already been applied to project `pbhuxeuwyhmdemvtsshy` during this work.

## What changed
- Existing login, profile, feed, groups, notifications, messaging, internal sharing, followers/following, and moderation UI are retained.
- After login, the app checks the member's own subscription record. An active subscription must have status `active` and a future `current_period_end`.
- Accounts without a verified active paid period see the membership screen instead of member features.
- The database helper `synctra_private.is_active_member()` now requires an active profile, age verification, active subscription, unexpired billing period, and active plan.
- RLS now checks paid membership for social activity, profiles, private messages, follows, notifications, projects, generated assets, credit records, groups, and marketplace listing creation.
- Private generated-media storage reads also require active paid membership.

## Important payment status
This phase does NOT connect a payment gateway and does NOT charge anyone. Plan prices remain zero placeholders. The plan buttons are intentionally disabled until a verified checkout + signed webhook flow is configured. Do not manually insert `active` subscriptions from the browser.

## Deploy frontend
1. Download and extract this ZIP.
2. Upload/replace `index.html`, `styles.css`, `app.js`, and `README.md` in the existing GitHub repository.
3. Commit the changes. Cloudflare Pages should deploy from the connected GitHub repository automatically.
4. Test with an account that has a valid active subscription and another account with no active subscription. The latter must see only the membership gate.

## Verification performed
- JavaScript syntax checked with `node --check`.
- ZIP integrity checked.
- HTML duplicate IDs and JavaScript element references checked.
- Supabase migration calls returned success.
- No live browser end-to-end test was performed.


## Phase 9B — Emerald visual refresh

This update brings the existing SyncTrA screens closer to the approved emerald/ambient-glass concept. It is a CSS-only presentation layer and intentionally preserves the existing HTML IDs, JavaScript, Supabase calls, forms, membership gate, and social features.

Important: this is a visual refresh of the existing app, not a claim that all product features are complete. Payment checkout/webhook activation remains unconnected. Do not publish real plan prices or accept payments until a verified server-side payment integration is completed.

Deploy by replacing the existing `index.html`, `styles.css`, `app.js`, and `README.md` in the same GitHub repository with these package files. The JavaScript is carried forward unchanged from Phase 9A.
