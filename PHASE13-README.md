# SyncTrA Phase 13 — Open Minds Visual Rooms

This update adds the three approved rooms and gives all 12 Open Minds rooms individual artwork headers based on the user's approved 12-panel visual reference.

## Included
- 12 rooms: Open Discussion, Islam, Christianity, Buddhism, Taoism, Science, Atheism, Satanism, Hacker Community, Hinduism, Judaism and Activists.
- Three new database rooms (Hinduism, Judaism and Activists) were added to the existing Supabase project using the Phase 13 migration.
- Individual cropped WebP artwork for all 12 room cards. The artwork is decorative; room names, descriptions, Join/Enter buttons and messages remain live HTML/UI elements.
- Room-specific soft procedural ambient tones remain controlled by the existing Sound on/off button and volume slider. Browser audio still requires a user tap.
- Existing join/leave behavior, realtime messages, report action, membership checks and PostgreSQL 15-second slow mode are preserved.

## Deployment
1. Extract this ZIP.
2. Replace `index.html`, `styles.css` and `app.js` in the existing GitHub repository.
3. Upload the complete `assets/open-minds/` folder, preserving its path and all 12 `.webp` files.
4. Commit the changes and allow the connected Cloudflare Pages project to deploy.
5. Open Groups → Open Minds using an active, age-verified paid member account.

## Database
The Phase 13 migration was applied to Supabase project `pbhuxeuwyhmdemvtsshy` and verified to return 12 active rooms. The migration file is included for reference. Do not run the Phase 11 migration again.

## Important scope notes
- The room artwork is a static optimized image header with a subtle UI treatment, not a 15–30 second MP4 loop. This keeps the cards light and fast on Android.
- The current room audio is procedurally generated ambient tones, not recorded soundtrack files. It remains opt-in and can be turned off.
- No existing room membership or message data was reset or deleted.
- This package is prepared for GitHub/Cloudflare deployment; it has not been deployed to the live website from this session.
