# Experiment Plan

## Hypothesis

<!-- What do we expect to improve? e.g. "Archive thumb grid holds 7 columns at 1280px without horizontal strips" -->

## Layer touched

- [ ] Layout
- [ ] Surface
- [ ] Image
- [ ] Motion
- [ ] Content

## Layers NOT touched

<!-- Explicit list, e.g. Motion, Dexie, Remotion, reading flow -->

## Files to edit

<!-- List paths -->

## Pages affected

- Reference: `/lab/...`
- Production: `/archive`, `/`, etc.

## Screenshots to compare

- [ ] `test-results/karpathy-visual/lab-archive-reference.png`
- [ ] `test-results/karpathy-visual/archive-production.png`
- [ ] (add others)

## Rollback criteria

Stop and revert if any of:

1. Bare document flow / missing grid
2. Card images become horizontal strips
3. Home hero loses centering
4. `npm run build` or `typecheck` fails
5. Karpathy visual screenshots regress

## Commands to run

```bash
npm run typecheck
npm run lint
npm run test:unit
npm run build
npm run karpathy:audit
npm run test:karpathy-visual
```
