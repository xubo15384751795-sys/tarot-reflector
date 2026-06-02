# Archive Regression Postmortem (Phase 2.5)

**Date:** 2026-06-02  
**Scope:** `/archive` layout regression when Phase 2 re-enabled motion via `REGRESSION_STATIC_LAYOUT = false`.

---

## 1. Root cause judgment

| Hypothesis | Verdict | Notes |
|------------|---------|-------|
| Motion master switch (`REGRESSION_STATIC_LAYOUT = false`) | **Primary** | Re-enabled `ArchiveDeckEntrance` GSAP `autoAlpha: 0` entrance on group cards. |
| CSS global pollution | **Not primary** | No unscoped `.tarot-card-image` / `img` rules affecting archive thumbs. |
| Image wrapper / Next `fill` | **Low** | `TarotThumbCard` keeps `position: relative` + `aspect-ratio` on frame; probe shows 0 strip / 0 missing img when gated. |
| Shared component layout bleed | **Secondary (historical)** | Framer grid entrance was **not** gated by `REGRESSION_STATIC_LAYOUT` before fix — likely “裸文本” source. |
| Surface + motion combination | **Yes (historical)** | Phase 2 CSS/page safe alone; failure when motion switch flipped with **ungated** Framer thumbs. |

**Summary:** Regression was a **motion-layer** problem, not Phase 2 surface polish. Historically it presented as **combination**: global motion off-switch + always-on Framer thumb `opacity: 0` initial state + GSAP group entrance.

---

## 2. Evidence

### 2.1 Binary experiment (`REGRESSION_STATIC_LAYOUT = false`, no other file edits)

After postmortem gating (Framer behind `thumbEntrance` flag), automated probe on production build with legacy bridge (`groupCardsEntrance` + `cursorGlow` only):

```
thumbCount: 22, stripCount: 0, missingImg: 0
groupStyles: opacity 1, visibility visible
```

**Interpretation:** With **only** legacy GSAP group/cursor enabled, steady-state layout stays healthy. Historical severe breakage likely needed **ungated Framer thumb entrance** (always `initial={{ opacity: 0 }}` when `mounted`) running alongside GSAP — reproducing “labels without images”.

### 2.2 Per-flag isolation (`?archiveMotion=<flag>`)

Playwright screenshots: `test-results/regression/archive-flag-*.png`

| Flag | Probe (strip / missingImg) | Risk |
|------|---------------------------|------|
| `heroEntrance` | 0 / 0 | Low — header fade only |
| `groupCardsEntrance` | 0 / 0 | Medium — GSAP `autoAlpha` from 0 on group cards; watch first paint |
| `thumbEntrance` | 0 / 0 | **High (historical)** — Framer opacity on grid; was ungated before fix |
| `thumbHover` | 0 / 0 | Low — `physical-card` lift only when flag on |
| `cursorGlow` | 0 / 0 | Low — CSS vars via `quickTo`, scoped |
| `scrollReveal` | N/A on `/archive` | No archive consumer |

**Most likely historical “裸文本” flag:** `thumbEntrance` (invisible images, visible labels).  
**Secondary:** `groupCardsEntrance` (GSAP `autoAlpha: 0` stuck / interrupted).

### 2.3 CSS grep (pollution audit)

```
tarot-card-image
  src/components/MotifCanvas.tsx (motif-canvas scoped)
  src/styles/archive.css → .card-thumb-frame__image .tarot-card-image (scoped)
  TarotThumbCard does NOT use tarot-card-image class ✓

card-frame img — no matches in src/styles

archive-thumb — scoped under .archive-page / .card-thumb-frame__image ✓

strip|shutter|reveal in src/styles — no matches
```

**High-risk pattern (mitigated):** `.card-thumb-frame__image .tarot-card-image` sets `width/height 100%`, `object-fit: cover` — acceptable because scoped to thumb frame; thumbs do not use `tarot-card-image` class.

### 2.4 GSAP target audit (archive-adjacent)

| Location | Selector | Scoped? | Risk |
|----------|----------|---------|------|
| `ArchiveDeckEntrance.tsx` | `.major-arcana-card`, `.minor-grid__card` | `scopeRef` | OK |
| `TabBar.tsx` | tab indicator | component ref | OK — not grid |
| `CardDetailModal` / `MotifCanvas` | motif stage | modal only | OK |
| None | `.tarot-card-image`, `img`, `.archive-thumb` globally | — | **None found** |

GSAP does **not** set `clipPath`, `mask`, `width`, `height`, or `scaleY` on archive thumbnails.

### 2.5 Image layer (`TarotThumbCard`)

| Rule | Status |
|------|--------|
| No `tarot-card-image` class | ✓ |
| No motion reveal strip classes | ✓ |
| Next `Image` `fill` + parent `position: relative` + `aspect-ratio` | ✓ |
| `object-cover` on Image | ✓ |

`ArchiveThumbSafe` — not a separate component; **`TarotThumbCard` is the safe thumb layer** (keep).

### 2.6 Baseline screenshots

`test-results/regression/`:

- `archive-baseline-light.png`
- `archive-baseline-dark.png`
- `archive-baseline-mobile.png`

Legacy motion-on captures (`REGRESSION_STATIC_LAYOUT=false` build, 2026-06-02):

- `archive-motion-on-light.png` — probe: 0 strip, 0 missingImg (steady state OK **after** Framer gating fix)
- `archive-motion-on-dark.png`

**Note:** With **pre-fix** code, `false` also left Framer thumb `opacity:0` initial active → “裸文本”. Current tree gates Framer behind `thumbEntrance`; legacy bridge only enables `groupCardsEntrance` + `cursorGlow`.

---

## 3. Fixes applied (this PR)

1. **`src/features/motion/archiveMotionFlags.ts`** — per-flag gates; default all `false`; dev isolation via `?archiveMotion=<flag>`.
2. **`ArchiveDeckEntrance`** — `groupCardsEntrance`, `cursorGlow` flags only (no `REGRESSION_STATIC_LAYOUT` check).
3. **`archive/page.tsx`** — Framer grid/hero gated by `thumbEntrance` / `heroEntrance`.
4. **`TarotThumbCard`** — `physical-card` only when `thumbHover` flag on.
5. **`REGRESSION_STATIC_LAYOUT`** — remains **`true`**; archive must not use global switch. Legacy bridge in `isArchiveMotionFlagEnabled` maps `false` → `groupCardsEntrance` + `cursorGlow` **for postmortem binary tests only**.
6. **`tests/e2e/archive-regression.spec.ts`** — baseline + per-flag screenshots.
7. **`scripts/archive-regression-probe.mjs`** — strip / missing-image detector.

**Not committed for Phase 2.5:** `layoutStatic.ts` value stays `true` (comment-only clarification allowed).

---

## 4. Prevention rules

1. **Phase 2 = surface only** — no `REGRESSION_STATIC_LAYOUT` flip; no archive GSAP.
2. **Phase 3 = one `ARCHIVE_MOTION_FLAGS` flag at a time** — never bulk-enable.
3. **Archive thumbs must not use `tarot-card-image`** or global card/img selectors.
4. **GSAP targets must use `scopeRef` / component queries** — never `document.querySelectorAll('.tarot-card-image')`.
5. **CI / local:** `npm run test:archive-regression` (see below) before merging archive motion.
6. **Auto-rollback trigger:** horizontal strip (`frame aspect > 1.35`) or `missingImg > 0` in probe → block merge.

---

## 5. Commands

```bash
npm run typecheck && npm run lint && npm run test:unit && npm run build

# Baselines + per-flag shots (server on :3025)
PLAYWRIGHT_BASE_URL=http://localhost:3025 \
  npx playwright test tests/e2e/archive-regression.spec.ts \
  --config=playwright.visual.config.ts

# Layout probe
node scripts/archive-regression-probe.mjs http://localhost:3025/archive
node scripts/archive-regression-probe.mjs "http://localhost:3025/archive?archiveMotion=groupCardsEntrance"
```

---

## 6. Phase 3 motion rollout order

1. A — `heroEntrance`  
2. B — `groupCardsEntrance`  
3. C — `thumbEntrance` (highest risk — verify probe + screenshots)  
4. `thumbHover`  
5. `cursorGlow`  
6. `scrollReveal` — guide only, not archive

Do **not** set `REGRESSION_STATIC_LAYOUT = false` for archive work.
