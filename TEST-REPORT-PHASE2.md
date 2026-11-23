# Phase 2 test report

Environment: local static files with an isolated Supabase STUB (fixtures). Every result below is SIMULATED. No live Supabase was tested.

## Responsive layout checks (13 rooms per width, via the real room-switching path)

| Width | Rooms | Rooms with any layout flag, page error or failed asset |
|---|---|---|
| 320px | 13 | 0 |
| 360px | 13 | 0 |
| 375px | 13 | 0 |
| 430px | 13 | 0 |
| 1280px | 13 | 0 |
| 390px | 13 | 0 |

Checks per room: horizontal overflow, caption/title/emblem overlap, composer under navigation, list overlapping banner, send button outside composer, title outside banner, clipped sidebar text, controls under 44px, and that the selector value equals the room slug.

## Functional checks (simulated)

- Signed-in dashboard visible: True; profile name from fixture: Test Creator
- Workspace tabs (target section visible): stream=True, explore=True, garden=True, create=True, chat=True, notifications=True, you=True, about=True, faq=True
- Room load (Satanism): {'slug': 'satanism', 'messages': 5, 'separators': ['Yesterday', 'Today']}
- Emoji insertion: '✨'; send (stubbed RPC): input cleared = True, feedback: Message sent. Slow mode allows one message every 15 seconds.
- Composer at 390x480 (keyboard-open simulation): {'viewport': 480, 'composer_bottom': 370, 'input_visible': True, 'composer_above_nav': True}
- Signed-out boot: welcome screen visible = True, dashboard visible = False, page errors = []
- Desktop 1280 signed-in, sound toggle: hidden by community-room-more-menu

## Not verified
- Live Supabase: sign-in, sessions, profiles, private messages, notifications, news feed, studios, membership, RLS, realtime, RPCs: NOT tested live.
- Ambient sound: the "Toggle ambient sound" control is inside the room's three-dot menu (community-room-more-menu), which is hidden until opened. Its position is confirmed; the click and audio playback are NOT verified.
- Attachment and microphone controls: NOT implemented (no backend or client feature exists); not faked.
- Read receipts and rank badges: NOT implemented (no supporting data in the app); not faked.
- Real Android devices and the native keyboard: NOT tested (keyboard checked by viewport resize only).
- Tablet widths, and 375/430 at desktop-style states: only the widths listed above were run.
