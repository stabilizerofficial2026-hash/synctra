# SyncTrA Phase 11 — OPEN MINDS + Profile Editing UX Fix

This package contains the current Phase 11 frontend and the latest profile-editing usability improvement.

## Profile editing improvement
- The profile card opens in normal viewing mode; editing fields are hidden by default.
- **Edit profile** opens the form.
- **Save profile** saves the changes, refreshes the visible profile details, and automatically closes the editor.
- **Cancel** discards unsaved changes and closes the editor.
- If saving fails, the editor remains open so the user can correct the problem.

## OPEN MINDS included
- Nine seeded discussion rooms: Open Discussion, Islam, Christianity, Buddhism, Taoism, Science, Atheism, Satanism, and Hacker Community.
- Open Discussion is automatically joined when an eligible member first opens the room directory. Other rooms are opt-in; members can leave any room.
- Persistent messages with Supabase Realtime updates.
- Server-enforced 15-second slow mode per member, per room.
- Server-side blocklist for a small set of common English profanity terms, plus message reporting.
- Private RLS policies; active verified paid members only.
- Room-specific, locally generated ambient tones with sound toggle and volume. No audio files or third-party audio service required. Browser audio starts only after the member taps the sound control.
- Existing private Groups & Teams functionality is retained.

## Deploy the frontend
1. Extract this ZIP.
2. Replace `index.html`, `styles.css`, and `app.js` in the existing GitHub repository with the included files.
3. Keep the existing Supabase URL and publishable key in `app.js`; do not add a service-role key.
4. Commit the changes. Cloudflare Pages should deploy from the connected repository.
5. Sign in with an active, age-verified paid member account and test the profile editor and **Groups → OPEN MINDS**.

## Database status
The Phase 11 database migrations have already been applied and verified on the connected Supabase project. `phase11-open-minds-community.sql` is included as an audit/reference snapshot only. **Do not run it again on the live project** unless intentionally rebuilding the feature.

## Current limitations
- The 15-second cooldown is enforced in PostgreSQL. The current profanity blocklist is small and English-focused; it is not a complete multilingual moderation system.
- Reports can be submitted, but moderator coverage and a full message-review workflow need end-to-end testing.
- Ambient sound is generated locally by the browser using soft oscillator tones. It is a placeholder, not finished recorded soundtracks.
- Full two-account live-chat and Android device testing must be performed after frontend deployment.
- Membership checkout/payment processing is not connected. Plan prices remain placeholders; no payments should be accepted yet.
- AI image/video/music generation is not connected. The Creative Studio is currently a planned feature interface.

## Recommended remaining roadmap
1. Deploy and test the profile save/close/reopen/cancel flow on Android.
2. Test OPEN MINDS with two separate active member accounts: joining, leaving, message history, realtime delivery, 15-second cooldown, reporting, blocking and audio toggle.
3. Complete multilingual moderation and moderator review/appeal workflow.
4. Integrate payment checkout and verified webhooks before setting real membership prices or accepting payments.
5. Connect the Creative Studio to a generation provider with secure server-side API keys, credit accounting and job status tracking.
6. Run a full mobile accessibility, privacy, security and performance audit before public launch.

## Mobile navigation and discovery update
- Added a compact mobile quick-access menu while retaining the full desktop workspace navigation.
- Added a fixed five-destination mobile bar: Stream, Garden, Create, Chat, and You.
- Added About SyncTrA and FAQ & Help sections without changing the Open Minds rooms or their participation rules.
- Feed author names, handles, and avatars open a public member profile view. It shows only profile fields already intended for member discovery plus published member posts; private email and account metadata are not exposed.
- Added Follow/Following and Message actions from the public profile view.
- Simplified the post-sharing button label to “Share”; its existing in-platform private recipient flow and database privacy rules remain unchanged.
- Existing swipe navigation remains available on the workspace navigation links. Mobile bottom navigation provides direct access without requiring long scrolling.

## Scope and deployment notes
This is a frontend update. It does not change the Supabase schema or require rerunning Phase 11 SQL. The package is not deployed automatically; publish the updated frontend files to the existing GitHub/Cloudflare Pages project. Test public-profile visibility, follow/message actions, and mobile navigation with two active member accounts before public launch.


## Phase 12 — navigation and mobile workspace refinement

This frontend update keeps the existing SyncTrA features and Open Minds rooms (including all belief, philosophy, science and technology discussion spaces) intact. It changes navigation only:

- Mobile navigation uses a fixed five-item bottom bar: Stream, Garden, Create, Chat and You.
- The three-line Menu opens a compact top-side drawer for the other areas, including Explore & Network, Notifications, Creations, Membership, About and Help.
- Selecting a workspace focuses that view and collapses the other long page sections, so members do not have to scroll through the whole app to find a feature.
- Horizontal swipe switches between the five main destinations; vertical scrolling remains available inside the selected workspace and chat lists.
- Desktop retains the left-side navigation.
- The post action label remains simply **Share**. Its existing member-to-member share behavior is preserved.

No database migration is required for Phase 12. Do not rerun the Phase 11 SQL migration; it has already been applied to the live project.

### Important scope note
This is a navigation and usability update, not a new media backend. Image/video uploads, a separate Creations gallery, and public-versus-private post publishing still need their own storage, visibility policies and UI implementation before they can be advertised as available. Existing Open Minds room names, descriptions, membership behavior and 15-second slow mode are not changed by this update.

## Phase 13 — additional rooms and individual artwork
- Added Hinduism, Judaism and Activists as active Open Minds rooms.
- All 12 rooms now have individual artwork headers derived from the approved 12-room reference image.
- Existing room functions and database policies remain unchanged; the Phase 13 room seed was applied separately.
