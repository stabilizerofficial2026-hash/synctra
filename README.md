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


## Phase 9C — Reference-led workspace UI

This update reshapes the existing authenticated dashboard toward the supplied SyncTrA reference: persistent desktop navigation, emerald hero area, creator profile card, studio feature tiles, feed, network, messages, notifications and groups sections. On narrow screens the navigation becomes a horizontally scrollable strip. Existing form IDs, Supabase calls and app.js are preserved.

The visual reference contains illustrative media, sample counts, and paid prices. This implementation does not fabricate those values or imply that AI media generation/payment checkout is active. The current feed composer remains text-first; image/video/music generation and verified billing require separate implementation.

## Phase 9D — Hobbies and personality profile fields

This update adds optional member-editable `hobbies` and `personality_type` fields to the profile card and profile editor. The personality selector includes Sanguine, Choleric, Melancholic, Phlegmatic, and Mixed. These are presented as self-described temperament labels, not as clinical or diagnostic categories.

**Database step required:** before deploying the updated frontend, run `phase9D-profile-hobbies-personality.sql` once in the Supabase SQL Editor. The migration adds the two nullable columns and validates the allowed personality values and hobbies length. Existing profile data is not overwritten.

Then deploy the updated `index.html`, `styles.css`, and `app.js` to the same GitHub repository. No existing post, messaging, membership, or social workflow is intentionally changed.


## Welcome + Membership Showcase Refresh

This update redesigns the public welcome screen with the approved SyncTrA introduction, feature highlights, and responsive Creator / Creator Plus / Creator Pro plan cards. It also enriches the existing membership-gate cards with the plan's credits, group capacity, soundtrack duration, storage allowance, and marketplace eligibility.

The welcome-page plan rates displayed are ₱199 / ₱399 / ₱799 per month, matching the previously configured plan pricing. Plan cards do not initiate checkout. The membership gate still loads active plan records from Supabase and checkout remains disabled until a verified payment integration and webhook are deployed.

No database migration is included or required for this visual update. Existing authentication, profile, messaging, Open Minds, moderation, and membership-gate logic is retained. AI media generation and marketplace functionality should not be advertised as operational until their respective integrations are completed.

### Validation
- `node --check app.js` passed.
- HTML duplicate-ID check passed.
- ZIP integrity check performed after packaging.
- No live browser or production deployment test was performed.


## Phase 20 — Public AI Art Gallery
- Added a 10-artwork swipeable gallery to the welcome page, positioned above membership plans.
- Includes touch scrolling, previous/next controls, slide indicators, captions, and a join CTA.
- Gallery artwork is stored locally in `assets/ai-gallery/` as optimized WebP images.
- This is a visual showcase only; it does not activate AI generation or payment services.

## Phase 23 — Review fixes and Facebook-style feed

### Fixes
- **Blocked members are now hidden.** The UI promised this, but the feed never filtered blocked authors. The feed and comment threads now exclude posts and comments from members the viewer has blocked.
- **Moderator queue no longer crashes** when the RPC returns no data; the admin panel stays hidden for non-admins.
- **Groups panel no longer crashes** when the embedded plan record is missing; it falls back to the plan ID.
- **Duplicate likes** (unique-constraint error 23505) are treated as already liked instead of showing an error.
- **Whitespace-only comments** are rejected before sending.
- **Comment threads stay open** after posting a comment, instead of collapsing on re-render.
- Removed two empty stray files (`folder.` and `assets/ai-gallery/folder`).

### Facebook-style feed
- Composer shows an avatar and a "What's on your creative mind?" pill; the full form opens when tapped.
- Post header with avatar, name, handle and time, plus a `⋯` menu (Report / Block for others' posts, Delete for your own).
- Stats row (like count and comment count), then an equal-width action bar: Like, Comment, Share.
- Comments render as bubbles with a pill-shaped input.
- Keeps the existing emerald theme, rounded-square avatar pattern and all element IDs.

### Desktop layout (1280px and wider)
- Three columns: profile card (left) · member feed (centre) · creative space and membership (right).
- Below 1280px and on phones the stacked layout from earlier phases is unchanged.
- The profile card now spans the full width on phones and tablets (it previously sat at about two-thirds width).

### Database checks still required (not in this repository)
- `posts`: allow DELETE where `author_id = auth.uid()`, otherwise "Delete post" will show an error.
- `reactions`: keep the unique constraint on `(post_id, user_id)`.
- `posts` and `comments`: consider enforcing the block list in RLS as well, so blocked content is hidden even from direct API calls. The client-side filter is a UI safeguard only.

### Verification
- `node --check app.js` passes.
- Browser tests with a mock Supabase client (Chromium/Playwright): 23 interaction checks pass across like, unlike, comment, report, post, delete, block and menu behaviour. Desktop and phone layouts checked at 390px and 1280px with no horizontal overflow.
- Not tested against the live Supabase project or real payment flows.

## Phase 24 — Reference design pass
- Welcome page: top navigation (Home, Explore, Groups, Studio, Marketplace, Private Membership) on desktop; pill-style EXPRESS / EVOLVE buttons.
- Gallery: retitled "SyncTrA Creative Gallery", emerald styling, large lead card with the next card peeking, "Create with SyncTrA" button. Uses the project's own gallery images.
- Plans: featured card glows; prices and features unchanged (₱199 / ₱399 / ₱799). Checkout remains disabled.
- Feature cards: art band with round icon badge.
- Profile card: cover band, overlapping avatar, Followers / Following tiles (live counts), quick-action row (Create, Settings, Log out mapped to existing controls).
- Group chat: banner above the conversation; bubble styling for messages.

Not included: the reference's left group sidebar, member role badges (Creator / Creator Plus), online dots, and the reference's specific artwork (moon/forest backdrops, character photos, feature illustrations). These need assets or data that this project does not have yet.

## Phase 25 — Open Minds room in messenger layout
- Room opens as a two-column messenger: sidebar (room icon, description, Chats, member count, slow-mode note, Leave room) and main column (header with Close, banner, message list, round composer).
- Messages show an avatar with a bubble; your messages sit on the right with the emerald bubble style.
- Phone: the sidebar stacks into a compact card above the conversation.
- Controls and behaviour are unchanged: send, report message, leave, close, slow mode feedback.
- Not included: the reference's Members / Group Info / Notifications / Theme sidebar items (no backing features yet), role badges, and online dots.

## Phase 26 — Per-room themes for Open Minds
- Each Open Minds room now has its own accent colour (set in CSS from `data-room-slug`): Taoism, Buddhism, Islam, Christianity, Hinduism, Satanism, Atheism, Science, Activists, Hacker, Open Discussion.
- The room's existing artwork (`assets/open-minds/*.webp`) is used for the sidebar and banner.
- Not yet included: a LGBTQ+ room (needs a `community_rooms` record and artwork), the screenshots' logo images, and the sidebar items Members / Group Info / Notifications / Theme.

## Phase 27 — Group chat messenger
- Group room uses the messenger layout: sidebar (group name, description, Chats, Members count, Notifications, Close group) and main column (banner, avatar bubbles, round composer).
- The banner and sidebar show the real group name and description. Previously the banner always said "SyncTrA Creators".
- Notifications opens the notifications panel.
- Phone sidebar uses a plain flex column; the group section spans the full width on desktop when a room is open.
- `phase27-lgbtq-community-room.sql` adds the LGBTQ+ Open Minds room. Run it once in Supabase after checking the table columns. Room artwork (`assets/open-minds/lgbtq.webp`) is not included.
- Not included: group logos and banner artwork from the screenshots, online dots, role badges (NO.12 etc.), and a Theme switch.
