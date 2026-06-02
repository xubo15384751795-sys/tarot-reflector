# UI Tooling — 前端审美与交互工具链

> 本文说明**为什么**选择这些工具，以及如何运行审查流程。Agent 改前端前请先读 [`AGENTS.md`](../AGENTS.md)。

---

## 1. 为什么使用 GSAP

阈牌需要**命令式、可编排**的复杂动效：

- 抽牌 timeline（牌背 → 翻牌 → 落定）
- Hotspot stagger 从牌面中心扩散
- SVG 手写线条 `drawSVG`
- Cursor glow 用 `gsap.quickTo` 追踪指针，避免 React setState 抖动
- 多元素同步（档案 Tab 指示器、模式选择 flip）

这些场景 Framer Motion 的声明式 model 不够精细。GSAP 已在 `src/features/motion/` 落地，详见 [`MOTION_SYSTEM.md`](MOTION_SYSTEM.md)。

**Agent skills：** 项目已安装 [gsap-skills](https://github.com/greensock/gsap-skills)（`.agents/skills/gsap-*`）。改 GSAP 动效前先读对应 skill。

---

## 2. 为什么保留 Framer Motion

Motion 适合**React 状态驱动**的过渡：

- `AnimatePresence` 页面 / stage 切换
- `layoutId` 共享布局
- 轻量 spring（模式列表 stagger 进入）
- Modal mount/unmount

与 GSAP **分工明确**，不重复造轮子。

---

## 3. 为什么 Radix 只作为 headless 基础

Radix 提供 **可访问性完备** 的无样式原语：

| 包 | 用途 |
|----|------|
| `@radix-ui/react-dialog` | 牌面详情、确认层 |
| `@radix-ui/react-popover` | `SymbolPopover` 符号解释 |
| `@radix-ui/react-tabs` | 档案 / 科普 Tab |
| `@radix-ui/react-switch` | 设置开关 |
| `@radix-ui/react-accordion` | 折叠说明 |

视觉层由 `globals.css` token + `src/components/ui/` 组件负责，**不**引入 shadcn 默认皮肤。

---

## 4. 为什么不直接用 shadcn Dashboard 风格

shadcn 默认组合（Sidebar + Stat Card + 灰阶表格）会立刻把产品拉向 **后台 / SaaS** 气质，与「活牌面档案室」冲突。

我们复用其 **Radix 底层思路**，但自建：

- `GlassCard` · `TarotCardFrame` · `MotifHotspot` · `SymbolPopover`
- `StatusPill` · `ArchiveGroupCard` · `NoteCard` · `ModeCard`

---

## 5. 为什么 Matter.js 只放 motion-lab

Matter.js 适合 **物理实验**（`/motion-lab/physics`），不适合生产 UI：

- 与 GSAP/Motion 形成第三套动画系统
- 移动端性能与可预测性差
- 产品气质要求「纸牌物理感」，由 GSAP easing + shadow 表达即可

---

## 6. 如何运行 Storybook

```bash
npm run storybook        # 开发：http://localhost:6006
npm run build-storybook  # 静态构建
```

每个 UI 组件 story 必须包含：

- light theme
- dark theme
- hover（`storybook-force-hover`）
- active
- mobile width（390px）

**流程：** 组件先在 Storybook 审美通过，再进入页面。

Stories 位于 `src/components/ui/stories/`。

---

## 7. 如何运行 visual tests

```bash
npm run test:visual              # 与基线截图 diff
npm run test:visual:update       # 更新基线（UI 有意变更后）
```

基线目录：`tests/e2e/visual.spec.ts-snapshots/`。测试前固定 `prefers-reduced-motion: reduce` 与 `data-theme`，避免动画漂移。

| 基线文件 | 场景 |
|----------|------|
| `homepage-light.png` / `homepage-dark.png` | 首页 |
| `archive-page.png` | 档案馆 |
| `notes-page.png` | 笔记页 |
| `mobile-homepage.png` / `mobile-archive.png` | 390px 移动 |

**分工：** 组件审美 → Storybook；整页布局 / 主题对称 → Playwright。

后续可接 Chromatic 做 CI diff。

---

## 8. 如何审查前端美感

1. **读基准文档：** [`FRONTEND_EXPERIENCE_BENCHMARK.md`](FRONTEND_EXPERIENCE_BENCHMARK.md)（100 分制）
2. **读视觉语言：** [`UI_LANGUAGE.md`](UI_LANGUAGE.md)
3. **Storybook 目视：** 明暗 + hover + mobile
4. **跑 benchmark 脚本：** `npm run benchmark:frontend`
5. **自问四原则：** 神秘不廉价 · 温柔不操控 · 可交互不命令 · 活牌面非说明书

### 动效审查

- 同一元素是否混用 GSAP + Motion transform？（禁止）
- reduced-motion 是否跳过长 timeline？
- 抽牌是否等待 API？（禁止）

### 可访问性

```bash
npm run test:a11y   # axe smoke（含在 visual.spec 的 Accessibility 段）
```

检查：对比度、aria-label、键盘 tab、focus ring、reduced motion、图片 alt。

---

## 9. Remotion 视频化（可选 devDep）

`ReadingScript` 同时服务网页解读与竖屏短视频。骨架在 `remotion/`，**不默认安装**（约 50MB）：

```bash
npm install --save-dev remotion @remotion/cli @remotion/player
npm run video:preview
npx remotion render remotion/Root.tsx TarotShortDemo out/demo.mp4
```

---

## 10. Dexie 笔记快照

笔记存储在 `src/features/notes/`：

| 文件 | 职责 |
|------|------|
| `types.ts` | 数据模型 + `NotesRepository` 接口 |
| `localRepository.ts` | localStorage（测试 / SSR fallback） |
| `db.ts` + `dexieRepository.ts` | IndexedDB + 首次从 localStorage 迁移 |
| `repository.ts` | `ensureNotesRepository()` / `getNotesRepository()` |

`AppShell` 启动时 hydrate Dexie；单元测试仍用 `createLocalNotesRepository()`。

---

## 依赖总览

| 类别 | 包 |
|------|-----|
| 动效 | `gsap`, `@gsap/react`, `framer-motion` |
| UI 原语 | `@radix-ui/react-*` |
| 笔记持久化 | `dexie` |
| 组件实验室 | `storybook`, `@storybook/nextjs` |
| 视觉 / A11y 测试 | `@playwright/test`, `@axe-core/playwright` |
| 视频（可选） | `remotion`, `@remotion/cli`, `@remotion/player` |
| **不引入** | `react-spring`, shadcn dashboard 模板, Matter.js（主流程） |
