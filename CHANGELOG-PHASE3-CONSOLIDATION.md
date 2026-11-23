# Phase 3 consolidation pass — changelog

Baseline: Phase 3 stylesheet (backup/phase3/styles.css, identical to synctra-phase3.zip). The Phase 2 checkpoint remains read-only and unchanged.

## !important declarations
- Phase 1: 1506
- Phase 2 (checkpoint): 1543
- Phase 3 (before this pass): 1557
- After this pass: 1541  (change: -16)

## Modified files
- styles.css only. app.js, index.html and assets are unchanged.

## Change
- 16 !important declarations removed across 5 rules. Each removal was accepted only after the computed styles and layout boxes of all 13 rooms matched the Phase 3 values exactly. The rules are listed in the test report.
- No selector, value or rule order was changed. No rule was deleted.

## Remaining work
- The sweep is not complete: tests run 173; declarations removed 16; load-bearing declarations identified 78; batches not yet tested 16. The stored state in consol_state.json lets the sweep resume.
- Most remaining !important declarations are load-bearing: removing any one of them changes a computed style. Reducing them further needs a rewrite of the room rules, not per-declaration removal.
