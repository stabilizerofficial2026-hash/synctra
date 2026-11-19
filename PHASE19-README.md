# SyncTrA Phase 19 — Member Appeals & Moderator Appeal Review

## Completed in the live Supabase database
- Added a unique rule so each report can have at most one appeal.
- Added moderator-only RPC `synctra_appeal_queue()` to retrieve open/reviewing appeals with limited report and appellant context.
- Added moderator-only RPC `synctra_review_appeal()` for reviewing, accepting, or rejecting an appeal.
- Final appeal decisions record moderator note, resolver, timestamp, and audit-log entry.
- If an appeal is accepted for an Open Minds message previously hidden by a moderator action, that message is restored to `published`.
- Anonymous execution is revoked; authenticated execution is protected by an internal moderator-role check.

## Frontend changes in this package
- Members can see their own submitted reports and current appeal status.
- Members can submit one appeal when their report status is `actioned` or `dismissed`.
- Moderator Center now has a separate Appeal Review queue.
- Moderators can mark an appeal reviewing, accept it, or reject it. Final decisions require a written explanation.
- Existing report queue and other SyncTrA features are retained.

## Deploy frontend
1. Download and extract this ZIP on your Android device.
2. In the existing GitHub repository, replace `index.html`, `styles.css`, and `app.js` with the versions from this package.
3. Commit the changes and wait for Cloudflare Pages to finish deploying.
4. Sign in as a normal active member and verify **Safety & Privacy → My reports & appeals**.
5. Use a test report whose status is `actioned` or `dismissed` to test appeal submission.
6. Sign in with an authorized moderator account to verify the Appeal Review queue.

## Database note
The Phase 19 migration was already applied to the connected Supabase project and verified. The SQL file is included as a reference/backup. **Do not run it again manually** unless intentionally rebuilding another environment.

## Verification performed
- JavaScript syntax check passed with `node --check app.js`.
- HTML IDs checked for duplicates; none found.
- Supabase confirmed both appeal RPCs are executable by `authenticated` and not executable by `anon`.
- Supabase confirmed RLS is enabled on `moderation_appeals` and the one-appeal-per-report unique index exists.

## Still needs real account testing
A live member/moderator end-to-end test is still required. No test appeals were fabricated or inserted into member accounts. A security advisor scan also reports existing intentional moderator-only SECURITY DEFINER RPCs and disabled leaked-password protection; review the Supabase Auth password-security setting before public launch.
