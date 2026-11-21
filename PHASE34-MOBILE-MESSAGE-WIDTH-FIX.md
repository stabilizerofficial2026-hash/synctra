# Phase 34 — Android community room width and message repair

- Extends the compact phone layout through 900 CSS px, covering Android browsers that report a viewport wider than 680 px.
- Locks the reusable community room to a header + sidebar + main-chat grid.
- Makes each chat message row and its bubble use the full available chat-column width, preventing one-character vertical wrapping at the right edge.
- Keeps the chat list scrollable and the composer fixed within the main column.
- Retains room-specific accent colours, artwork, existing JavaScript, Supabase calls, authentication, and database schema.

This is a source CSS patch. It does not deploy the site or prove live-device rendering; verify after deployment at the same phone/browser zoom setting.
