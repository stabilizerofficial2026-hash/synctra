# PHASE 35 — Community room layout rebuild

This revision adds a final, scoped layout override for `#community-room-panel`.
It keeps the room header across the top, a compact navigation rail on the left,
and a flexible chat column on the right. The message list is explicitly a
vertical flex container and each rendered `article.community-message` is forced
to use a two-column avatar/message grid with a full-width message bubble.

The override also forces horizontal text writing mode, prevents min-content
sizing from collapsing the message column, and adjusts the rail and composer
for phone widths. It does not alter application JavaScript, Supabase queries,
authentication, database schema, or room data.

Deployment note: this is a source package. After deploying, hard-refresh the
site or clear the browser cache before evaluating the new CSS. Test the room
at narrow phone widths and verify sending/receiving messages, room navigation,
and theme switching.
