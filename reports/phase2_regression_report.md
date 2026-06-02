# Phase 2 Regression Isolation Report

**Date:** 2026-06-02  
**Status:** Isolated — surface layer safe; motion layer was the regression source.

## Symptoms

After the full Phase 2 batch (surface CSS + `archive/page.tsx` + `layoutStatic.ts`), `/archive` regressed (layout broken / unstable). Rolling back all Phase 2 changes restored the page.

## Isolation procedure

### Step 1 — Motion switch only

| File | Change |
|------|--------|
| `src/features/motion/layoutStatic.ts` | `REGRESSION_STATIC_LAYOUT` kept **`true`** (not set to `false`) |
| `src/styles/archive.css` | Phase 2 surface polish **restored** |
| `src/app/archive/page.tsx` | `parchment-noise` + `--hero-bg` via `.archive-page` **restored** |

### Step 2 — Build gates

- `npm run typecheck` — pass
- `npm run build` — pass

### Step 3 — `/archive` manual check (surface-only, motion off)

| Check | Result |
|-------|--------|
| Category cards (major + four minors) | OK — glass buttons, labeled |
| Card thumbnails load | OK — 22 major cards visible |
| No horizontal image strips | OK — portrait aspect ratio in grid |
| No bare-text layout | OK — names paired with images |
| Grid density | OK — 7 columns desktop, first row above fold |
| `REGRESSION_STATIC_LAYOUT` | `true` — entrance GSAP skipped |

### Step 4 — Conclusion

> **Phase 2 surface polish is safe; regression caused by re-enabling entrance GSAP via `layoutStatic.ts`.**

Setting `REGRESSION_STATIC_LAYOUT = false` re-enabled `ArchiveDeckEntrance` GSAP (`autoAlpha` / `y` on `.major-arcana-card` and `.minor-grid__card`). That violates Phase 2 scope (Surface Layer only; Motion Layer must stay off).

**Do not commit** `layoutStatic.ts` for Phase 2.

**Safe to commit:**

- `src/styles/archive.css`
- `src/app/archive/page.tsx`

### Steps 5A / 5B — Not required

Binary split (page-only vs CSS-only) was **not** needed after Step 3 passed.

## Phase 2 allowed vs forbidden

| Allowed (this commit) | Forbidden (caused regression) |
|----------------------|-------------------------------|
| Token glass on group cards | `REGRESSION_STATIC_LAYOUT = false` |
| `--hero-bg` + `parchment-noise` | GSAP entrance on deck groups |
| Preview strip glass | ScrollTrigger |
| Thumb hover/focus surface (CSS only) | `TarotCardFrame` / global `.tarot-card-image` |
| Footer spacing | `cards-grid` structure changes |

## Visual screenshots

Re-run locally after `npm run build && npm run start -- -p 3025`:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3025 npm run test:visual -- --grep "archive-home"
```

Outputs: `test-results/visual/archive-home-light.png`, `archive-home-dark.png`.

## Phase 3 — Motion (separate)

Re-enable motion **one layer at a time**, never flip `REGRESSION_STATIC_LAYOUT` and all entrance tweens together:

1. **A.** Hero fade  
2. **B.** Group cards stagger  
3. **C.** Thumb hover (if moving off pure CSS)

Each step requires the same isolation checklist before merge.
