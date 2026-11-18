# SyncTrA — Auth & Member Dashboard (Phase 2)

This package adds the next milestone to the SyncTrA static starter:
- Email/password registration and login through Supabase Auth
- 18+ date-of-birth validation in the browser and database signup trigger
- Automatic profile creation after signup
- Private member dashboard
- Edit display name and bio
- Logout and password reset request

## Supabase project
- Project ref: `pbhuxeuwyhmdemvtsshy`
- URL: `https://pbhuxeuwyhmdemvtsshy.supabase.co`
- Frontend key: publishable key only

The publishable key in `app.js` is designed for browser use. Never put a Supabase service-role key, secret API key, or AI provider key in this folder, GitHub Pages, Cloudflare Pages, or browser JavaScript.

## Deploy on Cloudflare Pages
1. Create a new GitHub repository named `synctra`.
2. Upload `index.html`, `styles.css`, `app.js`, and this `README.md` to the repository root.
3. In Cloudflare, create a Pages project connected to that repository.
4. Use no build command and set the output directory to `/` (the repository root).
5. After deployment, copy the public HTTPS URL.
6. In Supabase Dashboard → Authentication → URL Configuration:
   - Set Site URL to your Cloudflare Pages URL.
   - Add that exact URL to Redirect URLs.
7. In Supabase Dashboard → Authentication → Providers → Email:
   - Keep Email provider enabled.
   - Keep email confirmation enabled for normal member onboarding.
   - The built-in email sender is rate-limited and best-effort; custom SMTP may be needed later for reliable production email.

## Important current limitations
- This is an early member-auth milestone, not a production-ready social network.
- The dashboard is authenticated, but the feed, AI generation, groups, real-time chat, credits, marketplace and billing are not active.
- Subscription prices are not set. No payments are enabled.
- No external profile-photo or media uploads are implemented.
- Age validation is a registration gate, not government-ID identity verification.
- Supabase RLS and all app permissions still need a full multi-user security test before inviting the public.
- The browser uses the Supabase JavaScript client from esm.sh. It requires an internet connection.
- Use a strong password and confirm your email before relying on the account.

## Locked product decisions carried forward
- Closed, private members-only community
- Minimum age 18+
- Chronological feed
- Credit-only creator marketplace; no cash withdrawals
- Media created inside SyncTrA; no uploads from device
- Creator Pro marketplace selling
- Transparent moderation and appeals; no shadow banning
- No pornography, drug sales, fake news, or real-money sales inside the platform
