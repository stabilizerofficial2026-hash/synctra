# Phase 3 consolidation pass — test report

Environment: SIMULATED. Local static files with a Supabase stub. No live Supabase. Nothing deployed. Production untouched.

## Method
- Each candidate batch of !important declarations was removed, and the page was measured in all 13 rooms (switching through the real room selector). The measured properties: tag, id, position, size and 30 visual properties for every element in the room panel and navigation.
- A batch was accepted only if every measurement matched the Phase 3 baseline exactly. Failing batches were split until single declarations were tested. A failing single declaration is load-bearing and is kept.
- Harness check: the first runs showed noise (the chat list's scroll position changed between identical runs). The harness was fixed: it now waits for the room to settle and resets the list scroll before measuring. Determinism then passed (two identical runs at 360 px and at 1280 px).

## Results
- Tests run: 173. Declarations removed: 16. Load-bearing declarations identified: 78. Batches not yet tested: 16.
- Final check, current versus Phase 3, all 13 rooms: identical at 320, 360, 375, 390, 430 and 1280 px.
- Simulated functional smoke test after the change: dashboard, all nine workspace tabs, room load with separators, emoji, sending through the stub, keyboard-open composer above the navigation, and no page errors all passed.

## Not verified
- Live Supabase: none of the functional paths were tested live.
- Visual inspection: no screenshots were re-taken, because the computed styles and layout boxes are identical to the Phase 3 values that were already inspected.
- Ambient sound, real devices and the native keyboard: not tested.
