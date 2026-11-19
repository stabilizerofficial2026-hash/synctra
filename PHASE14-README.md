# SyncTrA Phase 14 — Open Minds Full-Screen Chat

This update responds to the Android screen recording and removes the extra dashboard welcome banner from the signed-in member workspace.

## Changes
- Removed the signed-in dashboard "MEMBER SPACE / Welcome, [name] / Your private SyncTrA dashboard" block and the large promotional member hero banner. The separate first-visit SyncTrA welcome/login experience remains unchanged.
- When a member taps Join room or Enter room, the selected Open Minds conversation opens as a full-viewport, edge-to-edge Messenger-style interface.
- The room view uses the full phone screen; the global header, navigation drawer and bottom navigation are hidden until the member closes or leaves the room.
- The message history is the only vertically scrolling area. The message composer stays fixed at the bottom, with Leave room and Close controls in the room header.
- Moved the room ambience toggle and volume control into the room view so they remain available while chatting.
- Closing returns to the room directory; leaving performs the existing server-side leave action and returns to the directory.
- Existing 12 rooms, database functions, membership enforcement, realtime message updates, reports and 15-second server-side slow mode are preserved.

## Deployment
1. Extract this ZIP.
2. Replace `index.html`, `styles.css`, and `app.js` in your existing GitHub repository.
3. Upload the entire `assets` folder from this ZIP, preserving `assets/open-minds/` and its 12 `.webp` files.
4. Commit the changes and wait for Cloudflare Pages to deploy.
5. Test on Android using an active paid member account: enter a room, send a message, close it, and enter again.

## Database
No SQL migration is required for Phase 14. The 12 Open Minds rooms already exist in the Supabase project. Do not rerun Phase 11 or Phase 13 migrations for this frontend update.

## Verification performed
- `node --check app.js` passed.
- HTML ID uniqueness check passed.
- Confirmed the logout control and member display binding remain present.
- Confirmed the package contains the 12 room artwork assets.

The package is prepared but not deployed to the live Cloudflare Pages site from this session. Real-device visual testing is still required after deployment.
