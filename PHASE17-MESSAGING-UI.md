# SyncTrA Phase 17 — Unified Messenger-style Messaging UI

## What changed
- Unified the visual language for Open Minds rooms, private groups, and private direct messages.
- Incoming messages sit on the left; messages sent by the signed-in member sit on the right.
- Rounded, compact message bubbles use translucent dark surfaces and subtle blur so room artwork remains visible behind them.
- Composer bars are compact, translucent, rounded, and aligned with the Send button. The text field no longer visually dominates the chat.
- Mobile sizing and spacing are tuned for narrow phone screens.

## What did not change
- Supabase tables, RPCs, RLS policies, membership requirements, room membership, 15-second Open Minds cooldown, message sending, history loading, reports, or audio controls.
- No database migration is required for this visual update.

## Deploy
Replace `index.html`, `styles.css`, `app.js`, and the `assets` folder in the existing GitHub repository with the matching items in this package. Commit the changes and wait for Cloudflare Pages to finish deploying. Do not rerun previous SQL migrations.

## Test after deployment
1. Open an Open Minds room and check incoming/outgoing bubbles and composer transparency.
2. Send a message in a private group and check left/right alignment.
3. Open a private conversation and send a reply.
4. Check the composer and message bubbles on Android portrait view.
5. Confirm room audio, reporting, membership gating, and the 15-second cooldown still behave as before.
