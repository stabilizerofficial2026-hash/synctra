# Phase 3 test report

Environment for everything below: SIMULATED. The app ran from local static files with a Supabase STUB that serves fixture data. No live Supabase project was used. Nothing was deployed. Production data, schema, RLS, policies and credentials were not touched.

## Layout checks: 13 rooms per width, through the real room-switching selector
| Width | Rooms flagged (overflow, overlap, under-nav composer, banner/list overlap, undersized targets, clipped text, page errors, failed assets) |
|---|---|
| 320px | 0 of 13 |
| 360px | 0 of 13 |
| 375px | 0 of 13 |
| 390px | 0 of 13 |
| 430px | 0 of 13 |
| 1280px | 0 of 13 |
Selector check: in every room the selector value equals the room slug, and the sidebar title shows the room name.

## Computed-style comparison against the Phase 2 snapshot
- 1280px: 10 differences, all in Satanism (banner, title, subtitle, list and nav-item styling). No other room changed.
- 390px: 380 differences, expected, because the sidebar rail width changed in every room.

## Functional checks (simulated)
- Signed-in dashboard visible; profile name from fixture shows.
- All nine workspace tabs open their target section: stream, explore, garden, create, chat, notifications, you, about, faq.
- Satanism room loads with five messages and Yesterday and Today separators.
- Emoji insertion works; sending through the stubbed RPC clears the input and shows the success message (the message is not stored).
- Keyboard-open simulation at 390x480: input visible and composer above the navigation.
- Signed-out boot: welcome screen visible, dashboard hidden, no page errors (Phase 2 check).

## Visual inspection
- Satanism at 390px and 1280px, and the reference comparison, were inspected visually.
- The other 12 rooms at each width were checked by measurement only. Their screenshots are in screenshots-phase3/, but I have not inspected each one visually.

## Not verified (blocked or not performed)
- Live Supabase: authentication, sessions, profiles from the database, private messages, notifications, news feed, studios, membership and access controls, RLS, realtime, RPCs. None tested live.
- Ambient sound: the toggle is inside the room's three-dot menu. Its position is known, but the click and audio playback were not tested.
- Real Android devices and the native keyboard.
- Attachments, microphone, read receipts and rank badges: not implemented, because the app has no feature or data for them. Not faked.
- Judaism database row: unverified (no production access).

## Unresolved defects
- Satanism banner: the baked-in "Group Chat" lettering sits close to the app subtitle. The banner is still smaller than the reference, and it lacks the reference's ornate gold frame.
- Satanism sidebar: the theme selector and the Report group and Leave room buttons keep their boxes, which breaks the list style.
- CSS: the stylesheet still has 1557 !important declarations. Consolidation is not complete.
- The Today separator is partly clipped at the top of the scrolled message list.
- The Judaism sidebar art is blurred, because it is upscaled from a 900px source.
