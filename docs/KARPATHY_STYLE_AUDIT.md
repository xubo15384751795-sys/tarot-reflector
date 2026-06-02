# Karpathy-Style Code Audit & Optimization Workflow

> 把 [Karpathy 开源项目](https://github.com/karpathy) 的方法论迁移到阈牌前端：**reference first、小步实验、可评估、可回滚**。
> Agent 不得一次性跨层大改 UI。

---

## 1. 核心原则

| 原则 | 含义 |
|------|------|
| **Reference first** | 先改 `/lab/*-reference`，验证通过再动生产页 |
| **One layer at a time** | 每轮只动一层（见下文分层） |
| **Static before motion** | 无动画状态下 layout 必须先成立 |
| **Fixture before API** | 用 `fixtures/*.json`，不接 AI / Dexie |
| **Screenshot before merge** | Playwright 截图 gate 通过再合并 |
| **Benchmark before keep** | `npm run karpathy:audit` + visual 对比 |
| **No hidden global magic** | 禁止隐式全局副作用（空 CSS 模块、未 commit 的 styles） |
| **No broad CSS selectors** | 禁止 `.tarot-card-image { }` 等跨页污染 |
| **No over-abstract shared components** | GlassCard / TarotCardFrame 只管 surface，不决定 page grid |

### 项目映射

| Karpathy 项目 | 阈牌对应 |
|---------------|----------|
| micrograd | `/lab/*-reference` 最小可跑静态 UI |
| nanoGPT pipeline | fixture → reference page → production page |
| llm.c | 少依赖、少魔法、`globals.css` 仅 import |
| autoresearch | `experiments/YYYY-MM-DD-*` 小步实验 + keep/revert |

---

## 2. 前端分层

每次任务**必须声明**本轮动哪一层、不动哪几层。

| Layer | 职责 | 典型文件 |
|-------|------|----------|
| **Layout** | shell、grid、spacing、container | `src/styles/archive.css`, `page.tsx` wrappers |
| **Surface** | glass、border、shadow、background | `surfaces.css`, `GlassCard`, `ArchiveGroupCard` |
| **Image** | aspect-ratio、object-fit、frame、preload | `TarotThumbCard`, `TarotCardFrame`, `archive.css` thumb rules |
| **Motion** | GSAP / Framer Motion | `features/motion/*`, `ArchiveDeckEntrance` |
| **Content** | 文案、数据、状态机 | `features/reading/*`, API, Dexie |

### 任务声明模板（复制到 PR / experiment plan）

```markdown
- **Layer touched:** Layout
- **Layers NOT touched:** Motion, Content, Dexie, Remotion
- **Pages affected:** /lab/archive-reference → /archive
- **Regression screenshots:** archive-home-light, lab-archive-reference
- **Rollback if:** cards-grid 消失 / thumb 变横条 / build 失败
```

---

## 3. Reference Pages

| Route | Fixture | 验证目标 |
|-------|---------|----------|
| `/lab/archive-reference` | `fixtures/archive_reference.json` | archive grid + thumb aspect-ratio |
| `/lab/reading-reference` | `fixtures/reading_reference_daily.json` | 居中 card stage + daily 文案壳 |
| `/lab/motif-reference` | `fixtures/motif_reference_magician.json` | 牌面 frame + 静态 hotspot 锚点 |

约束：

1. 只吃 fixture
2. 不接 AI API
3. 不接 Dexie
4. 不接复杂状态机
5. **无 GSAP / 无 Framer Motion**（纯静态 DOM + CSS）

Loader：`src/lib/karpathyFixtures.ts`

---

## 4. Audit 脚本

```bash
npm run karpathy:audit
```

输出：`reports/karpathy_audit_report.md`

检查项：

1. `typecheck` / `lint` / `build`
2. Broad CSS selectors（advisory）
3. `page.tsx` > 300 行（advisory）
4. `globals.css` > 300 行（模块化 import 应 ≤300）
5. `any` / `@ts-expect-error`（advisory）
6. 同文件 GSAP + Motion（advisory）
7. `Image fill` 无 aspect-ratio 上下文（advisory）
8. archive / home 必要 wrapper 缺失（**blocking**）
9. lab pages + fixtures 存在（**blocking**）

---

## 5. Experiment Protocol

目录：`experiments/`

每次实验：

```
experiments/2026-06-02-archive-layout-round1/
  plan.md
  result.md
```

### plan.md 必填

- hypothesis
- files to edit
- layer touched
- layers not touched
- screenshots to compare
- rollback criteria

### result.md 必填

- commands run
- screenshots generated
- score before/after
- keep or revert
- notes

模板：`experiments/_template/`

---

## 6. Screenshot Gate

```bash
npm run test:karpathy-visual
```

输出：`test-results/karpathy-visual/`

| 截图 | 路径 |
|------|------|
| lab archive reference | `lab-archive-reference.png` |
| lab reading reference | `lab-reading-reference.png` |
| lab motif reference | `lab-motif-reference.png` |
| archive production | `archive-production.png` |
| home production | `home-production.png` |

---

## 7. 修复策略（分轮禁止项）

**禁止 Agent 一次性做：** CSS 拆分 + 组件接入 + GSAP + 页面重排 + Dexie + Remotion

| Round | 只做 | 禁止 |
|-------|------|------|
| **1** | archive 静态 layout | motion, Dexie, Remotion, reading |
| **2** | archive image layer（牌图比例） | surface 改动 |
| **3** | archive glass surface | layout 改动 |
| **4** | hover micro-interaction | ScrollTrigger |
| **5** | GSAP hotspot | 以上之外的层 |

---

## 8. 回滚标准

出现以下**任一**情况，停止并 revert 本轮：

1. 页面退化成裸文档流
2. 牌图变成横向条带
3. 首页左上裸排
4. `npm run build` 失败
5. `typecheck` 失败
6. archive / home / guide 截图明显回归
7. CSS broad selector 污染多页
8. 同一 DOM 元素被 GSAP 与 Framer Motion 同时控制 `transform`

---

## 9. 验收清单

```bash
npm run typecheck
npm run lint
npm run test:unit
npm run build
npm run karpathy:audit
npm run test:visual
npm run test:karpathy-visual
```

报告：`reports/karpathy_audit_report.md`

---

## 10. 与 AGENTS.md 的关系

- `AGENTS.md`：产品气质 + 动效边界（what not to do aesthetically）
- **本文档**：工程流程 + 分层实验 + 回滚（how to change safely）

Agent 改 UI 前：**先读 AGENTS.md + 本文档**，声明 layer，从 reference page 开始。
