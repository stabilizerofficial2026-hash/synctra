# SyncTrA Phase 8B — Premium Member Identity & Bio Fix

Built on top of the Phase 8A premium emerald / ambient-glass redesign.

## What this phase fixes
- Shows the member's saved bio on the identity card, not only inside the edit field.
- Loads the saved bio from Supabase when the member signs in.
- Saves the display name and bio, then reads back the updated database row.
- Displays a clear error if Supabase rejects the update or no profile row was updated.
- Refreshing the page should retain the bio if the database update succeeds.

## Backend requirement
The signed-in member needs an RLS UPDATE policy on `public.profiles` restricted to their own row (`user_id = auth.uid()`). This package does not weaken RLS. If you receive an RLS error, send the exact error text so the policy can be checked safely. Never expose a service-role key.

## Preserved
- Phase 8A visual redesign.
- Existing authentication, feed, groups, group management, Moderator Center, and Supabase setup.
- No schema changes or external media uploads.
- AI generation, marketplace payments and profile soundtrack remain planned, not active.

## Deploy
1. Back up the current repository / note its current commit.
2. Extract this ZIP.
3. Replace the four root files in GitHub: `index.html`, `styles.css`, `app.js`, and `README.md`.
4. Commit and wait for Cloudflare Pages deployment.
5. Sign in, edit your bio, press Save profile, refresh the page, and verify the bio is still visible.

Rollback: restore the previous versions of those four files from GitHub history and redeploy.
