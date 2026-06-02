# Frontend Regression Root Cause Audit

**Date:** 2026-06-02  
**Method:** Repo grep, `npm ls`, file reads, Playwright probes (`scripts/archive-regression-probe.mjs`), existing `reports/archive_regression_postmortem.md`, `tests/e2e/archive-regression.spec.ts`.  
**Constraint:** Audit only — no dependency upgrades, no UI polish.

---

## 1. Executive Summary

### Root cause ranking (evidence-backed)

| Rank | Cause | Confidence | Primary symptoms |
|------|--------|------------|------------------|
| 1 | **Motion master switch too coarse** (`REGRESSION_STATIC_LAYOUT=false`) | High | Archive 裸文本/条带（历史）；同时打开多路 GSAP + 未 gate 的 Framer |
| 2 | **Agent / process — not GSAP skills content** | High | 大范围 Phase 2 同批改 surface + motion；AGENTS 未强制「单层声明」 |
| 3 | **Layout contract drift** (class renames / missing wrappers) | Medium | `archive-thumb-safe__*` 在文档中出现但代码用 `card-thumb-frame` |
| 4 | **GSAP `autoAlpha:0` without steady fallback** | High | Archive group entrance, guide `[data-reveal]` scroll reveal |
| 5 | **CSS global pollution** | Low (current tree) | 无全局 `img` / 无作用域外 `.tarot-card-image` 规则 |
| 6 | **Dependency version conflict** | Low | 单一路径 `framer-motion`；无 `motion` 包；GSAP 3.15 + @gsap/react 2.1.2 匹配 |
| 7 | **Visual regression coverage gaps** | Medium | 曾有 visual spec，缺 DOM ratio / guide 串字 guard（本次补规划） |

### Direct answers

| Question | Answer |
|----------|--------|
| GSAP skills 导致回归？ | **否（内容层面）**。Skills 是 API 指南；回归来自 **误用模式**（总开关、ungated Framer、同批改动），非 skill 教坏 layout。 |
| 依赖版本导致？ | **当前无证据**。`npm ls` 无重复 React/Framer；Remotion 仅 dev 脚本引用。 |
| CSS / layout / motion 分层？ | **是，主因**。Motion 与 layout 未分层；`REGRESSION_STATIC_LAYOUT` 跨 archive/guide/mode。 |
| Shared components 设计不当？ | **部分**。`GlassCard` 仅 surface（OK）；`TarotThumbCard` 正确但未用 `archive-thumb-safe` 命名契约。 |

---

## 2. Skill / Agent Rules Audit

### 2.1 Installed skills (project)

From `skills-lock.json` + `.agents/skills/`:

| Skill | Source |
|-------|--------|
| gsap-core | greensock/gsap-skills |
| gsap-frameworks | greensock/gsap-skills |
| gsap-performance | greensock/gsap-skills |
| gsap-plugins | greensock/gsap-skills |
| gsap-react | greensock/gsap-skills |
| gsap-scrolltrigger | greensock/gsap-skills |
| gsap-timeline | greensock/gsap-skills |
| gsap-utils | greensock/gsap-skills |

**GSAP skills：已正确安装**（8/8，hash 锁定于 `skills-lock.json`）。

Cursor / 全局尚有多套 GSAP plugin skills（与项目 `.agents` 重复），属**指导资料**，不会自动改代码。

### 2.2 AGENTS.md / docs gaps

| Doc | Motion vs layout | Agent scope discipline |
|-----|------------------|------------------------|
| `AGENTS.md` | 有 Framer/GSAP 分工表 | **无**「本轮改哪层 / 不改哪层 / 影响页面 / 截图 / 回滚」模板 |
| `MOTION_SYSTEM.md` | 禁止 GSAP 改 width/height/top/left；禁止双库同元素 transform | **未**明确禁止 GSAP 影响 image layout / `autoAlpha` 导致裸文本 |
| `UI_LANGUAGE.md` | 气质、反模式清晰 | 偏审美，**不足以**阻止 Agent 改 grid/开关 |
| `FRONTEND_EXPERIENCE_BENCHMARK.md` | 体验标准完整 | 非 CI 强制 |

### 2.3 High-risk rules / behaviors

1. **「改复杂动效前读 gsap-*」** — 易被理解为「应用 GSAP 优化」，而非「仅当 flag 开启」。  
2. **无 Phase 分层协议** — Agent 常 surface + motion + page 同 PR。  
3. **`REGRESSION_STATIC_LAYOUT` 单开关** — 一次 `false` 影响 `ArchiveDeckEntrance`、`guideScrollReveal`、`ModeSelector`、`ScrambleReveal`（见 grep）。

### 2.4 Recommended rule changes (do not auto-apply)

Add to `AGENTS.md` per-session checklist:

```markdown
## 本轮变更声明（必填）
- Layer: surface | layout | motion | data
- Pages: /archive | /guide | / | …
- Do NOT touch: …
- Guards: npm run test:frontend-regression
- Rollback if: strip ratio < 1.2 | guide text 010203… | typecheck fail
```

Clarify in `MOTION_SYSTEM.md`:

- GSAP must not set `autoAlpha:0` on layout-bearing containers without `prefers-reduced-motion` + static fallback.  
- Archive/guide motion only via per-page flags (see §6).

---

## 3. Dependency Audit

### 3.1 `npm ls` matrix (2026-06-02)

| Package | Version | In prod deps | Notes |
|---------|---------|-------------|-------|
| gsap | 3.15.0 | yes | deduped |
| @gsap/react | 2.1.2 | yes | peers gsap 3.15 |
| framer-motion | 12.40.0 | yes | only motion library |
| motion | — | **no** | not installed |
| @radix-ui/react-popover | 1.1.15 | yes | Portal + Popper |
| @radix-ui/react-dialog | 1.1.15 | yes | Portal |
| @radix-ui/react-tabs | 1.1.13 | yes | — |
| next | 16.2.6 | yes | — |
| react / react-dom | 19.2.4 | yes | single copy |
| dexie | 4.4.3 | yes | notes only |
| remotion | — | **no** (dev script only) | `npx remotion render` |

### 3.2 Risk assessment

| Risk | Level | Evidence |
|------|-------|----------|
| Framer + `motion` 双库 | **None** | no `motion` package |
| GSAP / @gsap/react mismatch | **Low** | versions align |
| Radix Portal layout | **Low** | Popover/Dialog on motif modal only; not archive grid |
| Next Image on archive thumb | **Yes, by design** | `TarotThumbCard` uses `fill` + `aspect-ratio` parent |
| Duplicate packages | **None observed** | single react tree |

**Action:** Do not upgrade deps in this audit. Lock policy: no new animation libs; Remotion stays out of app routes.

---

## 4. CSS Scope Audit

### 4.1 Grep summary (high-signal)

| Pattern | Hits | Scoped? |
|---------|------|---------|
| `.tarot-card-image` | `MotifCanvas.tsx`, `archive.css .card-thumb-frame__image .tarot-card-image`, Storybook | **Scoped** (thumb rule unused by `TarotThumbCard`) |
| `card-frame img` | none in styles | — |
| `tarot-card-frame img` | none | — |
| `img {` global | none in `src/styles` | — |
| `object-fit` | `archive.css` (thumb + modal), not global img | OK |
| `strip/shutter/reveal` in styles | **none** | — |
| `.glass-card` | `surfaces.css` — background, border, blur only | **No layout grid** |
| `.archive-glass-card` | `archive.css` — surface + hover | OK |

### 4.2 High-risk selectors (watch list)

| Selector | File:line | Why dangerous | Current status |
|----------|-----------|---------------|----------------|
| `.card-thumb-frame__image .tarot-card-image` | archive.css:~397 | Could affect img if class added to thumb | **Inactive** — thumbs omit class |
| `.card-thumb-frame__image img` | archive.css:~396 | Forces 100% + cover | **OK** — scoped to frame |
| `.glass-card` | surfaces.css:378 | If given width/height % | **Safe** — surface only |
| `.guide-section` | guide.css:100 | If archive grid rules leaked | **Separate file** — OK |

### 4.3 Guide 「0102030405060708+」 mechanism (evidence)

Rail buttons render `{section.index}` → `"01"…"08"` + `"+"` (`AppGuideContent.tsx:133`, `archiveGuideChapters.ts` numbers).

Concatenated string **equals rail indices** → failure mode is **rail layout/readout collapse**, not wrong copy:

- `.guide-shell` grid → mobile `display:block` (`guide.css:254-256`)  
- `.guide-rail` horizontal scroll (`flex-direction: row`, `guide.css:258-270`)  
- If flex/width broken or buttons invisible (`autoAlpha:0` on wrong target), accessibility snapshot shows **one continuous text node**

`bindGuideSectionReveals` when `REGRESSION_STATIC_LAYOUT=false` sets `gsap.from(..., { autoAlpha:0 })` on `[data-reveal]` (`guideScrollReveal.gsap.ts:63-74`) — can leave section body invisible; rail indices still visible → matches「章节号裸排」.

---

## 5. Component Responsibility Audit

| Component | Surface only? | Layout owner? | Image rules? | Motion? |
|-----------|---------------|---------------|--------------|---------|
| `GlassCard` | yes (`glass-card` class) | no fixed w/h | no img rules | no |
| `TarotCardFrame` | frame | stage-sized | motif contexts | via parent |
| `TarotThumbCard` | thumb + labels | grid external | Next `fill`, `object-cover`, **no** `tarot-card-image` | `physical-card` if `thumbHover` flag |
| `ArchiveGroupCard` | content in glass card | no grid | no images | no |
| `ArchiveDeckEntrance` | composes cards | **owns** `archive-groups` structure | no | GSAP if `groupCardsEntrance` |
| `AppGuideContent` | composes guide | **owns** `guide-shell` / rail | no | `bindGuideSectionReveals` via `REGRESSION_STATIC_LAYOUT` |
| `MotifHotspot` / `SymbolPopover` | popover | Radix portal | — | GSAP hotspots in reading/modal |

**Over-abstraction:** None critical. **Gap:** docs say `ArchiveThumbSafe` — code uses `TarotThumbCard` + `card-thumb-frame__image` (rename contract or alias class recommended).

**Principle violated historically:** Page layout lived in page + CSS, but **motion hooks lived in same PR** without flags.

---

## 6. Motion Layer Audit

### 6.1 `REGRESSION_STATIC_LAYOUT=false` opens what? (grep evidence)

| Consumer | File | Effect when false |
|----------|------|-------------------|
| Archive group GSAP | `ArchiveDeckEntrance.tsx` | legacy bridge → `groupCardsEntrance` + `cursorGlow` via `archiveMotionFlags.ts` |
| Guide scroll reveal | `guideScrollReveal.gsap.ts:33` | **Runs** ScrollTrigger + `autoAlpha:0` on `[data-reveal]` |
| Mode selector | `ModeSelector.tsx:70,80` | GSAP / motion paths enabled |
| ScrambleReveal | `ScrambleReveal.tsx:34` | scramble animation |

**One switch → multi-page motion** — confirmed.

### 6.2 Per-page flags (current)

`ARCHIVE_MOTION_FLAGS` exists (`archiveMotionFlags.ts`), default all `false`, test via `?archiveMotion=`.

**Guide flags (implemented in guard commit):**

`src/features/motion/guideMotionFlags.ts` — `sectionReveal` / `railActive` default `false`; `bindGuideSectionReveals` uses `sectionReveal` only (not `REGRESSION_STATIC_LAYOUT`).

**Still recommended:**

```ts
READING_MOTION_FLAGS = { cardReveal: false, statusTransition: false };
```

### 6.3 GSAP inventory (useGSAP / timelines)

| File | Targets | Scoped | Cleanup | Risk |
|------|---------|--------|---------|------|
| `ArchiveDeckEntrance.tsx` | `.major-arcana-card`, `.minor-grid__card` | `scopeRef` | context | Med |
| `guideScrollReveal.gsap.ts` | `[data-reveal]` per `.guide-section` | `root` param | `trigger.kill()` | **High** for guide 裸文本 |
| `MotifCanvas.tsx` | motif anchors | `stageRef` | context | Low (modal) |
| `TabBar.tsx` | tab indicator | ref | context | Low |
| `CardReveal.tsx` | reveal stage | ref | context | reading only |
| `ModeSelector.tsx` | mode cards | container | context | home only |

**No** `document.querySelectorAll(".tarot-card-image")` or global `img` GSAP targets found.

**No** GSAP `clipPath` / `mask` / `height` / `width` on archive thumbs in grep.

### 6.4 Framer vs GSAP same element

| Location | Conflict risk |
|----------|----------------|
| `archive/page.tsx` | **Mitigated** — Framer only if `thumbEntrance` / `heroEntrance` flags |
| `TarotCardStage` | Framer wrapper; GSAP reveal separate stage — OK by design |
| `AnnotatedCard` | `layoutId` + motion — reading path |

### 6.5 Postmortem experiment (binary)

| Step | Result |
|------|--------|
| Baseline screenshots | `test-results/regression/archive-baseline-*.png` (prior run) |
| `REGRESSION_STATIC_LAYOUT=false` only | Probe after gating: **0 strip, 0 missingImg**; historical break was **ungated Framer + switch** |
| Revert `true` | Current production gate state |

---

## 7. Page Layout Contract Audit

### 7.1 `/archive`

| Contract class | Present in repo | Notes |
|----------------|-----------------|-------|
| `archive-page` | yes `page.tsx` | |
| `archive-page-hero` / `archive-hero` | yes | |
| `archive-groups` | yes `ArchiveDeckEntrance` | |
| `major-arcana-card` / `major-card` | yes | |
| `minor-grid` | yes | |
| `current-browse` / `archive-preview` | yes | |
| `cards-grid` | yes | |
| `archive-thumb-safe__frame/img` | **missing** | use `card-thumb-frame__image` + `archive-thumb` |

### 7.2 `/guide`

| Contract class | Present |
|----------------|---------|
| `guide-page` | yes |
| `guide-hero` | yes |
| `guide-shell` | yes |
| `guide-rail` | yes (buttons, not `guide-rail__item`) |
| `guide-content` | yes |
| `guide-section` | yes |

**Drift:** spec said `guide-rail__item` — implementation uses `guide-rail button`.

### 7.3 Home `/`

| Contract class | Present |
|----------------|---------|
| `home-page` | yes `page.tsx:51` |
| `hero-shell` | **missing** — uses `home-hero-canvas` |
| `mode-card` | yes `ModeSelector` |
| `hero-title` / `HeroTitleSplit` | yes |

---

## 8. Regression Guard Plan

### 8.1 Implemented (this audit)

| Guard | File |
|-------|------|
| Guide no `0102030405060708+` | `tests/e2e/frontend-regression-guards.spec.ts` |
| Archive aspect ratio 1.45–1.95 | same |
| Archive `.cards-grid` + ≥6 thumbs | same |
| Guide shell + 8 chapter rail buttons + ≥8 sections | same |
| Home title x-offset + 3 mode cards | same |
| Screenshots archive/guide/home/mobile | same |
| Archive probe script | `scripts/archive-regression-probe.mjs` |
| Archive flag screenshots | `tests/e2e/archive-regression.spec.ts` |

### 8.2 Run

Chromium is required; install once if missing:

```bash
npx playwright install chromium
npm run build
npm run start -- -p 3025
npm run test:frontend-regression
```

Optional archive-only probes:

```bash
npm run test:archive-regression
node scripts/archive-regression-probe.mjs http://localhost:3025/archive
```

`npm run test:frontend-regression` uses root `playwright.config.ts` (`baseURL` → `http://localhost:3025`). Start the server on that port before running, or rely on `webServer` in CI after `npm run build`.

### 8.3 Auto-rollback policy

- `stripCount > 0` or `missingImg > 0` in probe → block merge  
- Playwright `0102030405060708+` count > 0 → block merge  
- Ratio < 1.2 → horizontal strip → block merge  

---

## 9. Recommended Fix Order

1. **Process** — AGENTS.md layer declaration + mandatory `test:frontend-regression` (**done** in guard commit).  
2. **Motion** — `GUIDE_MOTION_FLAGS` + `guideScrollReveal` wired (**done**); keep `REGRESSION_STATIC_LAYOUT=true` default.  
3. **Contracts** — Align docs: `archive-thumb-safe` aliases OR update audit selectors to `card-thumb-frame`.  
4. **Guide** — Ensure rail keeps `display:flex` when shell is `display:block` on mobile (explicit `display:flex` on `.guide-rail` in all breakpoints).  
5. **Surface-only phases** — Never flip global switch in surface PRs.  
6. **Phase 3 motion** — One `ARCHIVE_MOTION_FLAGS` / guide flag at a time (see `archive_regression_postmortem.md`).  

### Pause until guards green

- Large UI refactors without screenshot + DOM guards  
- `REGRESSION_STATIC_LAYOUT=false` in any merge commit  
- Renaming layout wrappers without updating Playwright  

---

## 10. Final checklist (user questions)

| # | Question | Answer |
|---|----------|--------|
| 1 | 主要是 skill 问题吗？ | **否** — skill 是文档；**流程 + 总开关误用** 是主因。 |
| 2 | 依赖版本？ | **否**（当前树）。 |
| 3 | CSS 作用域？ | **当前低**；历史需注意 thumb/img 规则勿扩大。 |
| 4 | Shared component 过宽？ | **轻度** — 命名契约漂移，GlassCard OK。 |
| 5 | Motion 总开关过粗？ | **是** — archive 用 `ARCHIVE_MOTION_FLAGS`；guide 已拆 `GUIDE_MOTION_FLAGS`；reading 仍靠 global。 |
| 6 | Layout contract 不稳定？ | **是** — 文档类名与实现不一致，Agent 易改错选择器。 |
| 7 | 下一步先修什么？ | **CI 跑 `test:frontend-regression`**；`READING_MOTION_FLAGS`；layout 类名契约对齐。 |
| 8 | 暂停什么？ | 跨层同 PR、global motion off、无 guard 的 wrapper 重命名。 |
| 9 | 哪些 guard 已加？ | `frontend-regression-guards.spec.ts` + `npm run test:frontend-regression`；`archive-regression.spec.ts`；probe script。 |
| 10 | Agent 协议？ | **AGENTS.md「本轮变更声明」** — touched layer / pages / do-not-touch / guards / rollback。 |

---

## Appendix: Command log

```bash
npm run typecheck   # pass (audit session)
npm run lint        # pass (warnings only)
npm run test:unit   # 107/107 pass
npm run build       # pass
npm ls gsap @gsap/react framer-motion …  # see §3
```

Related: `reports/phase2_regression_report.md`, `reports/archive_regression_postmortem.md`.
