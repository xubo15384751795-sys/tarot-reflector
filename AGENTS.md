# Agent 前端工作守则

> 修改任何前端 UI、动效、交互逻辑之前，**必须先阅读**以下文档：

1. [`docs/MOTION_SYSTEM.md`](docs/MOTION_SYSTEM.md) — 动效分工、禁止事项、性能原则
2. [`docs/UI_LANGUAGE.md`](docs/UI_LANGUAGE.md) — 视觉语言、组件语义、禁止风格
3. [`docs/FRONTEND_EXPERIENCE_BENCHMARK.md`](docs/FRONTEND_EXPERIENCE_BENCHMARK.md) — 体验基准与验收标准

涉及工具链选型时，另读 [`docs/UI_TOOLING.md`](docs/UI_TOOLING.md)。

---

## 产品气质（不可偏离）

所有页面必须符合：

| 原则 | 含义 |
|------|------|
| **神秘，但不廉价** | 月光档案室、炼金手稿感；禁止霓虹、游戏抽卡、转盘爆闪 |
| **温柔，但不操控** | 邀请式文案；禁止命令式 CTA、恐吓式引导、命运审判语气 |
| **可交互，但不命令化** | 用户靠近牌面探索；禁止后台表格、说明书目录、Dashboard 卡片墙 |
| **活牌面，不是说明书** | 牌面是中心，解释从符号生长；禁止三栏文档布局作为默认 |

**不允许 Agent 自由发挥 UI 风格。** 新组件先在 Storybook 审美通过，再进入页面。

---

## 动效边界

| 工具 | 用途 |
|------|------|
| **Framer Motion** | 页面/stage 切换、AnimatePresence、layoutId、轻量 spring |
| **GSAP** | 抽牌 timeline、hotspot stagger、SVG 手写线、cursor glow quickTo、多元素同步 |
| **Matter.js** | **仅** `/motion-lab/physics` 实验，不进入主流程 |
| **React Spring** | **禁止引入** |

**硬规则：** 同一 DOM 元素不得同时被 GSAP 与 Motion 控制 `transform` / `opacity`。

改复杂动效前阅读 `.agents/skills/gsap-*` 或 Cursor 已安装的 GSAP skills。

---

## 组件来源

优先使用 `src/components/ui/` 基础组件：

- `GlassCard` · `TarotCardFrame` · `MotifHotspot` · `SymbolPopover`
- `StatusPill` · `ArchiveGroupCard` · `NoteCard` · `ModeCard`

Radix 仅作 headless 基础（Dialog / Popover / Tabs / Switch / Accordion）。**不要**直接套 shadcn Dashboard / Card 风格。

---

## 本轮变更声明（每次改前端前必填）

在动手改代码前，在 PR / checkpoint 中写明：

| 字段 | 说明 | 示例 |
|------|------|------|
| **touched layer** | 只改一层：`surface` \| `layout` \| `motion` \| `data` | `surface` |
| **touched pages** | 影响路由 | `/archive` |
| **do-not-touch** | 本轮禁止动的层/页/文件 | `guideScrollReveal`, `/reading`, 全局 `img` 规则 |
| **guards to run** | 合并前必跑 | `npm run typecheck` + `npm run test:frontend-regression` |
| **rollback criteria** | 任一命中即回滚 | archive thumb 高宽比 &lt; 1.2；`/guide` 出现 `0102030405060708+`；`typecheck` 失败 |

**Motion 分层（禁止用总开关代替）：**

- Archive：`ARCHIVE_MOTION_FLAGS`（`src/features/motion/archiveMotionFlags.ts`），单 flag 用 `?archiveMotion=<key>`
- Guide：`GUIDE_MOTION_FLAGS`（`guideMotionFlags.ts`），`bindGuideSectionReveals` 仅受 `sectionReveal` 控制
- 全局：`REGRESSION_STATIC_LAYOUT` 默认 **`true`**；禁止在 surface/layout PR 中改为 `false`

---

## 验收清单

- [ ] 读过上述三份核心文档
- [ ] 已填写「本轮变更声明」五字段
- [ ] 新 UI 在 Storybook 有 light / dark / hover / active / mobile story
- [ ] `npm run typecheck` 通过
- [ ] 未在同一元素混用 GSAP + Motion transform
- [ ] 未引入第三套动画库
- [ ] 若动 `/archive` `/guide` `/`：本地或 CI 跑 `npm run test:frontend-regression`（需 Chromium，见下）

**Playwright 回归（本地）：**

```bash
npx playwright install chromium
npm run build
npm run start -- -p 3025
npm run test:frontend-regression
```
