# SyncTrA Phase 30 — Room messenger and group reporting

## Front-end
- `styles.css` appends a final alignment layer after legacy phase rules.
- The immersive room uses the viewport inset and a fixed grid: header spans both columns; sidebar and chat occupy the second row.
- The room frame, sidebar divider, banner, message list, composer, and feedback line share explicit box sizing and width constraints.
- `assets/open-minds/backgrounds/satanism-room.webp` is a new 1672×941 cinematic wallpaper. Existing per-room banner artwork remains in place.
- `app.js` adds a Report group action and binds the dedicated wallpaper to the Satanism room.

## Group report policy
- Each authenticated active room member may report a given room once.
- Ten distinct reports for a room trigger a 60-day suspension.
- Suspended rooms are hidden from discovery, cannot be joined, and cannot receive or display messages.
- An accepted appeal clears the suspension immediately.
- Reports are not proof of a violation; the threshold is a temporary safety hold and can be appealed.

## Deployment
1. Apply `phase30-group-report-suspension.sql` in the Supabase SQL Editor.
2. Deploy the updated `index.html`, `styles.css`, `app.js`, and `assets/` folder.
3. Test at 360px, 390px, 430px, and 691px viewport widths.
