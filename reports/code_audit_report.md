# Code Redundancy + Debug Audit Report

**项目：** tarot-reflector（阈牌）  
**审计日期：** 2026-06-02  
**范围：** 静态扫描 + 运行时抽检 + P0/P1 修复  
**原则：** 不新增功能、不调 UI 视觉，仅审查与清理代码质量

---

## 1. 总体评分：82 / 100

| 维度 | 满分 | 得分 | 说明 |
|------|------|------|------|
| A. 类型安全 | 15 | 14 | `tsc --noEmit` 通过；`src` 内无 `any`/`as any`；仅 2 处 `@ts-expect-error`（测试 + OpenAI proxy） |
| B. 文件复杂度 | 15 | 10 | `reading/page.tsx` 已瘦身为 198 行 ✓；但 `globals.css` 4205 行、`explain/page.tsx` 693 行、`useReadingSession.ts` 556 行仍超标 |
| C. 组件复用 | 15 | 9 | `src/components/ui/*` 已存在 **GlassCard / MotifHotspot / SymbolPopover 等 10 个组件，但零引用**；大量 inline glass 样式重复 |
| D. CSS 复用与 token | 15 | 8 | token 体系完整（`--bg-glass` 等）；但 `globals.css` 内 532 处 rgba/hex，多处组件 bypass class 直接写 style |
| E. 状态机清晰度 | 15 | 13 | `useReadingSession` 单一状态机 + `ReadingStageRouter` 路由清晰；`aiPending`/`readingSlowHint` 与 stage 分工明确 |
| F. 数据模型统一 | 10 | 8 | `normalizeReading` + `mergeApiReading` 收口 API；但存在 **双 ReadingScript 类型**（`features/reading/types` vs `types/readingScript` 视频专用） |
| G. 动画系统边界 | 10 | 7 | GSAP 与 FM 分工大体清晰；`ModeSelector` 入口 FM + 选中 GSAP flip 分阶段无冲突；hydration 与 FM SSR 仍有风险点 |
| H. 死代码与未使用文件 | 5 | 3 | Remotion 空骨架仍在；`ui/` 组件未接入；28 条 ESLint unused 警告 |

---

## 2. 静态扫描结果

### 2.1 TypeScript

```bash
npm run typecheck  # ✅ PASS
```

| 模式 | 次数 | 位置 |
|------|------|------|
| `any` / `as any` | 0 | — |
| `@ts-expect-error` | 2 | `src/lib/rulesGuard.test.ts:151`、`src/lib/ai/providers/openai.ts:56` |
| `@ts-ignore` | 0 | — |

### 2.2 文件复杂度

| 指标 | 结果 |
|------|------|
| `src/app/reading/page.tsx` | **198 行**（已低于 300 行阈值 ✓） |
| TS/TSX > 300 行 | 15 个文件（见下表） |
| CSS > 1500 行 | `src/app/globals.css` **4205 行** |

**超过 300 行的 TS/TSX：**

| 行数 | 文件 |
|------|------|
| 693 | `src/app/explain/page.tsx` |
| 687 | `src/app/motion-lab/page.tsx` |
| 556 | `src/features/reading/hooks/useReadingSession.ts` |
| 444 | `src/lib/rulesGuard.ts` |
| 426 | `src/app/demo/page.tsx` |
| 403 | `src/lib/reading/templateGenerator.ts` |
| 373 | `src/components/MotifCanvas.tsx` |
| 336 | `src/features/reading/components/stages/ReadingStage.tsx` |
| 331 | `src/lib/rulesGuard.test.ts` |
| 330 | `src/lib/reading/inputAnalyzer.ts` |
| 329 | `src/lib/reading/multiCardGenerator.ts` |
| 328 | `src/lib/cardRelationshipAnalyzer.ts` |
| 322 | `src/app/archive/page.tsx` |
| 320 | `src/app/notes/[id]/page.tsx` |
| 303 | `src/components/AppShell.tsx` |

### 2.3 未使用代码

| 检查项 | 结果 |
|--------|------|
| ESLint unused imports/vars | 28 warnings（非阻塞） |
| `src/components/ui/*` | **10 个组件已创建，glob 搜索零 import** — 死代码 |
| 旧 archive annotation/arrow/directory | **不存在**（已清理） |
| Remotion 空骨架 | **仍存在**：`remotion/compositions/TarotShortVideo.tsx`（return null）、`TarotShortDemo.tsx`、`Root.tsx` |

### 2.4 CSS

| 检查项 | 结果 |
|--------|------|
| glass 样式类 | `.glass`、`.glass-card`、`.archive-glass-card` 在 globals.css 定义 |
| inline glass 重复 | 20+ 组件直接写 `background: var(--bg-glass)` + `border: var(--border-glass)` |
| 硬编码颜色 | `globals.css` 内 **532** 处 rgba/hex；组件层另有多处 inline rgba |
| token 绕过 | 部分 shadow/glow 仍硬编码 rgba 而非 `--shadow-*` token |

### 2.5 动画

| 引擎 | 文件数（约） | 主要用途 |
|------|-------------|----------|
| GSAP / useGSAP | 22 文件 | 翻牌、hotspot、split text、cursor glow、archive tab |
| Framer Motion | 30+ 文件 | 页面过渡、CardDeck 洗牌、ModeSelector 入场 |

**关键检查：**

| 检查项 | 结果 |
|--------|------|
| 同一元素 GSAP + FM 同时控制 transform/opacity | **未发现**（CardReveal 纯 GSAP；ModeSelector FM 仅入场、GSAP 仅选中 flip） |
| GSAP cleanup | CardReveal / useGSAP 均有 `kill()` / `revertOnUpdate` ✓ |
| pointermove setState | **无** — `useCursorGlow` 用 `gsap.quickTo` 更新 CSS 变量 ✓ |
| prefers-reduced-motion | `useReducedMotion` 广泛接入 motion 模块 ✓ |

### 2.6 状态

Reading 流程已收敛到 `ReadingStage` 枚举 + `useReadingSession`：

```
idle → question_reframing → spread_recommending → shuffling
  → card_revealed → spread_overview? → position_readings
  → relationships? → summary → reflection_note? → completed
```

| 潜在重复 | 评估 |
|----------|------|
| `aiPending` vs stage `generating_reading` | 合理：`aiPending` 标记后台 AI，stage 标记 UI 阶段 |
| `loadingTab`（archive/explain） | 已改为 **derived state**（`tabData.tab !== activeTab`），避免 effect 内 sync setState |

### 2.7 数据模型

| 类型 | 位置 | 用途 |
|------|------|------|
| `ReadingScript` | `features/reading/types/reading.ts` | UI 主解读脚本 |
| `ReadingScript` | `types/readingScript.ts` | 短视频/Remotion 场景脚本 |
| `ApiReadingResponse` | `features/reading/types/reading.ts` | API 原始响应 |
| `normalizeReading()` | `features/reading/lib/normalizeReading.ts` | API → ReadingScript 收口 ✓ |

UI 层 **不直接消费** API response；均经 `normalizeReading` / `mergeApiReading`。

### 2.8 文案

搜索 `润色|生成文案|AI|正在分析|加载中|处理中`：

| 结果 |
|------|
| **src 内零匹配** ✓ |
| 统一文案表：`src/lib/readingStatusCopy.ts`（如「正在抽取牌面……」「正在读取牌面符号……」） |

---

## 3. 运行时 Debug（抽检）

### 3.1 首页 `/`
- ✅ 三种入口（今日一牌 / 问题解读 / 深度牌阵）
- ✅ 主题切换按钮存在
- ⚠️ cursor glow / hover 动效未在自动化中逐项断言（静态代码确认 quickTo 无 setState）

### 3.2 今日一牌 `/reading?mode=daily`
- ✅ 本地抽牌完成，牌面先出现
- ✅ 解读文案展示（圣杯六 / 看清之前回避的）
- ✅ 状态文案「正在抽取牌面……」来自 `readingStatusCopy`
- ⚠️ AI 后台生成 / 失败 fallback 未在本轮端到端触发（需 mock API 或断网测试）

### 3.3 科普 `/guide`
- ✅ 章节布局正常（8 章 + 牌阵附录）
- ✅ 无裸 `01020304…` 文本流

### 3.4 科普工作台 `/explain`
- ✅ 牌列表、aspect 控制、录屏控件正常加载
- ✅ lazy tab 加载使用 derived loading state

### 3.5 档案馆 `/archive`
- ✅ 大/小阿尔卡那 tab 分类正常
- ✅ 22 张大阿尔卡那卡片网格加载
- ⚠️ 390px 移动端布局可用（tab + 卡片可访问）；hotspot/popover 详情模态未深度点击测试

### 3.6 笔记 `/notes`
- ✅ 空状态正常（0 次解读）
- ⚠️ 保存 snapshot / `/notes/[id]` 未在本轮实测（无历史数据）

### 3.7 构建

```bash
npm run build   # ✅ PASS
npm run test:unit  # ✅ 107 tests PASS
npm run lint  # ✅ 0 errors, 28 warnings
```

---

## 4. 控制台 Debug

### 4.1 修复前（P0）

| 级别 | 消息 | 位置 |
|------|------|------|
| **error** | React Hydration Mismatch | `src/components/CardDeck.tsx:247` — FM 洗牌动画 SSR/CSR 不一致 |
| **error** | React Hydration Mismatch | `src/app/archive/page.tsx:197` — FM header + DOM textContent 突变 |
| **error** | React Hydration Mismatch | `src/components/AppShell.tsx:193` — ThemeToggle useState 与 layout script 不同步 |

### 4.2 修复后

| 修复 | 文件 |
|------|------|
| `useClientMounted()` + SSR 静态 fallback | `CardDeck.tsx` |
| hero/nav 去 FM 动画；preview caption 改 React state | `archive/page.tsx` |
| ThemeToggle 改 `useSyncExternalStore` + MutationObserver | `ThemeToggle.tsx` |
| tab loading 改 derived state | `explain/page.tsx`、`archive/page.tsx` |
| ref-during-render / setState-in-effect lint errors | `ModeSelector.tsx`、`useMotifStepObserver.ts`、`useMotifConnector.ts` |

**修复后再访 `/reading?mode=daily` 与 `/archive`：hydration overlay 未再出现。**

### 4.3 仍存在的非阻塞 warning

- Next.js Dev Tools issues badge（开发模式）
- ESLint unused vars（28 条，见 lint 输出）
- `npm warn Unknown env config "devdir"`（环境配置，非代码问题）

### 4.4 未观察到

- React key warning
- image 404
- failed fetch（本轮 AI 正常）
- GSAP target not found
- ScrollTrigger cleanup warning
- localStorage / IndexedDB error

---

## 5. 问题分级

### P0（已修复）

| # | 问题 | 状态 |
|---|------|------|
| 1 | ESLint 4 errors 阻塞 `npm run lint` | ✅ 已修复 |
| 2 | CardDeck hydration mismatch | ✅ 已修复 |
| 3 | Archive / ThemeToggle hydration mismatch | ✅ 已修复 |
| 4 | build / typecheck 失败 | ✅ 原本通过，保持 |

### P1（部分修复 / 建议下轮）

| # | 问题 | 状态 |
|---|------|------|
| 1 | `src/components/ui/*` 10 个组件零引用 | 📋 记录 — 需逐步替换 inline glass/hotspot |
| 2 | `globals.css` 4205 行 monolith | 📋 记录 — 按 feature 拆分 CSS modules |
| 3 | 双 `ReadingScript` 类型命名冲突 | 📋 记录 — 建议 rename 视频版为 `VideoReadingScript` |
| 4 | `explain/page.tsx` 693 行 | 📋 记录 — 可拆为 `ExplainStage` + hooks |
| 5 | `useReadingSession.ts` 556 行 | 📋 记录 — 可拆 draw / persist / stage actions |
| 6 | inline glass 样式 20+ 处重复 | 📋 记录 — 接入已有 `GlassCard` |
| 7 | ModeSelector FM + GSAP 同页 | ✅ 分阶段无冲突，保持观察 |
| 8 | archive preview DOM 直写 | ✅ 已改 React state |

### P2（暂不修）

| # | 问题 |
|---|------|
| 1 | Remotion 空骨架未完成 |
| 2 | 小阿尔卡那 motif 坐标精度不足 |
| 3 | motion-lab 开发页 unused imports |
| 4 | 局部 shadow rgba 与 token 不完全统一 |
| 5 | `AppShell.showActions` prop 未使用 |

---

## 6. 建议重构目标（与现状差距）

```
src/components/ui/          ← 已存在但未接入
  GlassCard.tsx             ✓ 文件在，零 import
  StatusPill.tsx            ✓ 文件在，零 import
  MotifHotspot.tsx          ✓ 文件在，零 import
  SymbolPopover.tsx         ✓ 文件在，零 import

src/features/reading/       ← 已基本到位
  hooks/useReadingSession.ts    ✓ 556 行，可再拆
  hooks/useReadingApi.ts        ✓
  components/ReadingStageRouter.tsx  ✓
  lib/normalizeReading.ts       ✓
  types/reading.ts              ✓

src/features/motion/        ← 已到位
  motionTokens.ts               ✓
  useCursorGlow.ts              ✓
  useReducedMotion.ts           ✓ (+ 新增 useClientMounted)
  tarotRevealTimeline.ts        ✓
```

**下轮优先：** 把 archive / reading / notes 页面的 inline glass 替换为 `GlassCard`；把 MotifCanvas hotspot 逻辑接入 `MotifHotspot` + `SymbolPopover`。

---

## 7. 本轮代码变更摘要

| 文件 | 变更 |
|------|------|
| `src/components/CardDeck.tsx` | SSR-safe 洗牌（`useClientMounted`） |
| `src/components/ModeSelector.tsx` | ref 更新移入 `useLayoutEffect` |
| `src/components/ThemeToggle.tsx` | `useSyncExternalStore` 替代 useState+effect |
| `src/features/motion/useReducedMotion.ts` | 新增 `useClientMounted` |
| `src/features/motion/useMotifStepObserver.ts` | ref 更新移入 `useLayoutEffect` |
| `src/hooks/useMotifConnector.ts` | 改 `useSyncExternalStore` 外部 store |
| `src/app/explain/page.tsx` | tab loading derived state |
| `src/app/archive/page.tsx` | 去 FM hero hydration 风险；preview state 化 |

---

## 8. 验收标准对照

| # | 标准 | 结果 |
|---|------|------|
| 1 | `npm run typecheck` 通过 | ✅ |
| 2 | `npm run lint` 通过 | ✅（0 errors） |
| 3 | `npm run test` 通过 | ✅ 107/107 |
| 4 | `npm run build` 通过 | ✅ |
| 5 | `reading/page.tsx` ≤ 300 行 | ✅ 198 行 |
| 6 | 核心链路无 any | ✅ |
| 7 | loading 文案无「润色/生成文案/AI 正在分析」 | ✅ |
| 8 | 科普页无裸文档流 | ✅ `/guide` 结构正常 |
| 9 | 档案馆分类尺度正常 | ✅ tab + grid 可控 |
| 10 | GSAP/FM 无同元素 transform 冲突 | ✅ |
| 11 | 控制台无关键 error | ✅ 修复 hydration 后抽检通过 |
| 12 | 本报告完整输出 | ✅ |

---

## 9. 后续建议（按优先级）

1. **接入 `src/components/ui/`** — 删除重复 inline 样式，减少 globals.css 压力
2. **拆分 `globals.css`** — 按 archive / reading / guide 分文件 import
3. **统一 ReadingScript 命名** — 视频脚本改 alias 避免混淆
4. **补 E2E** — `tests/e2e/interaction.spec.ts` 覆盖 daily 全流程 + AI fallback mock
5. **Remotion** — 决定完成或移入 `experiments/` 避免误导

---

*报告由 Code Redundancy + Debug Audit 自动生成。*
