# 阈牌 Threshold Tarot

> **象征性反思工具，不是命运预测工具。**
>
> 用塔罗牌作为视觉语言，帮助用户把模糊的内在状态外化、命名、重新观察。
> 不预测未来，不替你做决定，不提供"运势"。

---

## 这是什么

一个基于 **Next.js 16 + React 19 + Tailwind CSS 4** 的中文塔罗象征性反思 Web 应用。

用户输入问题后，系统先澄清问题、推荐牌阵，再抽取牌面。牌面是可交互的——点击牌面上的符号热点，解释从牌面附近浮现。解读结束后可以写笔记、固定快照、回看历史。

**核心定位：** 不是抽牌 + 牌义文本的工具，而是一个"活牌面"——用户靠近牌面探索，而不是操作后台。

---

## 主要功能

### 三种进入方式

| 模式 | 说明 |
|------|------|
| **今日一牌** | 没有具体问题时，抽一张牌看看今天有什么值得被轻轻看见 |
| **问题解读** | 带着一个具体问题进入，系统先澄清再推荐牌阵（推荐入口） |
| **深度牌阵** | 适合反复出现、暂时说不清的问题，用多张牌慢慢看见层次 |

### 完整解读流程

```
输入问题 → 系统复述（可跳过/修改）→ 推荐牌阵 → 抽牌翻牌
→ 牌面先出现（本地 1.2s）→ AI 解读后台生成 → 按位置分步阅读
→ 关系分析 → 总结 → 写笔记 / 固定快照 / 退出
```

### 78 张完整牌组

基于 Rider–Waite–Smith 传统，包含：
- **22 张大阿尔卡纳** — 手工校准的 motif 符号坐标
- **56 张小阿尔卡纳** — 权杖/圣杯/宝剑/星币四花色，正逆位各有解释

### 档案馆 `/archive`

- 78 张牌的图像档案，按大阿尔卡那 / 四花色分组
- 牌面可交互：点击符号热点，浮现解释（MotifCanvas）
- 正位 / 逆位 / 牌面符号 / 牌阵含义四个 tab

### 科普导览 `/guide`

- 8 章结构化导览，从"什么是塔罗"到"三种进入方式"
- 左侧章节导航 rail，右侧内容区
- 支持牌阵一览与详细说明

### 牌面笔记 `/notes`

- 解读结束后可写一句话感受
- 快照固定：牌面、问题、解读、笔记一起保存
- 按月分组，支持固定 / 删除 / 回看
- 同牌提醒：24h 内同问题再次抽牌时温柔提示
- 所有数据存在浏览器本地（localStorage），不上传

### 演示模式 `/demo` `/explain`

- ReadingScript 同时服务网页解读和视频演示
- 9:16 预览结构，自动播放 + 字幕 + 牌面高亮
- Remotion 集成，可导出短视频

---

## 安全与规则

### 严格规则体系

| 文档 / 代码 | 作用 |
|------------|------|
| [`tarot_rules.md`](./tarot_rules.md) | 规则源头：体系、牌义口径、语言规范、禁用话术、结构、免责声明 |
| `src/lib/tarotRulesPrompt.ts` | 把关键规则注入 LLM 提示词最前面 |
| `src/lib/rulesGuard.ts` | 运行时校验：禁用词扫描、字段字数、CJK 占比、断言式预测检测 |
| `src/lib/rulesGuard.shared.ts` | 30+ 禁用词清单（命运/恐吓/感情承诺/强制性话术） |

AI 引擎在违规时最多重试 3 次，3 次仍失败则回退到模板引擎。

### 女性友好原则

- **绝不替对方下判断**：「他一定爱你」「他会回来」「你们注定」等表达已加入禁用词
- **不制造焦虑**：不神准、不倒计时、不恐吓、不说命中注定
- **用户有修改权**：「这个观察不太像我，直接抽牌」「我想换个问法」「到这里就好」
- **允许模糊和慢**：「不用马上知道答案」「可以慢慢写」「可以先停下」
- **反刍护栏**：24h 内同问题 ≥2 次时温柔暂停

### 危机干预

输入中检测到危机词时，温和展示心理热线（希望 24 热线等），保留「我没事，继续」的自主权。

---

## AI 解读引擎（可选接入）

> **不接入 AI 也能完整使用。** 系统内置本地模板引擎，基于 78 张牌的传统牌义 + 规则层自动生成解读。
> 接入 AI 后，解读会更自然、更贴合用户的具体问题，但不是必须的。

### 两种模式

| 模式 | 说明 | 是否需要 API Key |
|------|------|:---:|
| **本地模板** | 基于规则层 + 传统牌义模板拼接，开箱即用 | ❌ |
| **AI 解读** | 调用大语言模型，结合用户问题动态生成更自然的解读 | ✅ |

### 支持的 AI 提供商

| 提供商 | 环境变量 | 说明 |
|--------|----------|------|
| **DeepSeek** | `DEEPSEEK_API_KEY` | 默认推荐，中文效果好，成本低 |
| **OpenAI 兼容** | `OPENAI_API_KEY` | 支持 OpenAI、Azure OpenAI、及任何 OpenAI-compatible API |
| **自定义端点** | `OPENAI_BASE_URL` | 可指向任意 OpenAI-compatible 服务（如 Ollama、vLLM 等） |

### 配置方式

```bash
# 1. 复制环境变量模板
cp .env.example .env.local

# 2. 编辑 .env.local，填入你的 API Key（任选一种）
DEEPSEEK_API_KEY=sk-your-deepseek-key
# 或
OPENAI_API_KEY=sk-your-openai-key
# 可选：自定义端点
OPENAI_BASE_URL=https://your-api-endpoint.com/v1

# 3. 重启开发服务器
npm run dev
```

### AI 解读的工作方式

```
用户问题 → 规则层注入（禁用词 + 牌义 + 牌阵 + motif）
    → LLM 生成解读
    → rulesGuard 运行时校验（禁用词扫描、字段长度、断言检测）
    → 违规则重试（最多 3 次）
    → 仍违规则回退到本地模板
```

**关键特性：**
- 规则层强制注入 LLM prompt，确保解读遵守 `tarot_rules.md` 规范
- 运行时校验拦截违规输出（禁止替对方下判断、禁止命运预测、禁止恐吓）
- 3 次重试 + 自动回退到模板引擎，保证用户始终能看到解读
- 支持流式输出（SSE），牌面先出现，AI 解读后台生成

### 不接入 AI 的体验

不配置 API Key 时：
- 今日一牌 → 本地模板生成单牌解读
- 问题解读 → 本地模板 + 问题澄清 + 牌阵推荐
- 深度牌阵 → 本地模板 + 多牌关系分析
- 所有功能完整可用，只是解读文案更模板化

### 接入 AI 后的提升

- 解读更贴合用户的具体问题，而非通用牌义
- 语言更自然，像朋友在帮你整理感受
- 多牌阵的关系分析更深入
- 但仍遵守所有规则（禁用词、免责声明、女性友好原则）

---

## 动效系统

- **GSAP 3.15** — 牌面翻牌 timeline、hotspot stagger、手写线条、SVG 绘制
- **Framer Motion** — 页面切换、AnimatePresence、layoutId
- **统一 motion tokens** — duration / stagger / ease 全项目一致
- **Reduced motion 支持** — `prefers-reduced-motion` 下关闭所有复杂动效
- **分层 flag 控制** — Archive / Guide / Reading 各有独立 motion flags，默认关闭

动效分工详见 [`docs/MOTION_SYSTEM.md`](./docs/MOTION_SYSTEM.md)。

---

## 视觉系统

- **双主题**：暗色（夜色档案馆）/ 浅色（月白档案室），同一套语义 token
- **字体三层**：标题 LXGW WenKai（衬线）/ 正文 PingFang SC / 编号 Inter
- **玻璃质感**：GlassCard、backdrop-filter、暖金光晕
- **组件库**：GlassCard、ModeCard、TarotCardFrame、MotifHotspot、SymbolPopover、StatusPill 等

视觉语言详见 [`docs/UI_LANGUAGE.md`](./docs/UI_LANGUAGE.md)。

---

## 技术栈

| 层 | 技术 |
|---|------|
| 框架 | Next.js 16 (App Router) + React 19 |
| 样式 | Tailwind CSS 4 + CSS 变量设计 tokens |
| 动效 | GSAP 3.15 + @gsap/react + Framer Motion 12 |
| UI 基础 | Radix UI (Popover / Dialog / Tabs) |
| 状态 | React hooks + localStorage |
| AI | DeepSeek / OpenAI-compatible，可配置 |
| 视频 | Remotion (dev) |
| 测试 | Vitest + Playwright |
| 代码质量 | ESLint + TypeScript strict + Secretlint |

---

## 快速开始

> **📖 详细部署指南（含 Agent 部署）：** [docs/部署与使用说明书.md](./docs/部署与使用说明书.md)
>
> 本指南面向没有代码经验的用户，提供手动部署和腾讯 CodeBuddy Agent 部署两种方式。

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000)。

> **开箱即用：** 不需要任何 API Key，本地模板引擎即可生成完整解读。
>
> **想接入 AI？** 只需在 `.env.local` 中填入一个 API Key，解读效果会更自然。详见下方「AI 解读引擎」。

### 环境变量（可选）

```bash
cp .env.example .env.local
```

可选配置：

| 变量 | 说明 | 必填 |
|------|------|:---:|
| `DEEPSEEK_API_KEY` | DeepSeek API Key（推荐，中文效果好） | 否 |
| `OPENAI_API_KEY` | OpenAI / OpenAI-compatible API Key | 否 |
| `OPENAI_BASE_URL` | 自定义 API 端点 | 否 |
| `NEXT_PUBLIC_SITE_URL` | 部署域名（用于 OG 图片） | 否 |

不配置任何 API Key 时，系统使用本地模板引擎生成解读。

---

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 本地开发 |
| `npm run build` | 生产构建 |
| `npm run typecheck` | TypeScript 类型检查 |
| `npm run lint` | ESLint 检查 |
| `npm run test:unit` | 单元测试 (Vitest) |
| `npm run test:e2e` | E2E 测试 (Playwright) |
| `npm run test:frontend-regression` | 前端回归 guards |
| `npm run check` | 完整质量检查 |
| `npm run benchmark` | 全链路基准测试 |
| `npm run benchmark:frontend` | 前端体验基准测试 |
| `npm run audit:cards` | 78 张牌完整性审计 |
| `npm run audit:motifs` | Motif 数据质量审计 |

---

## 项目结构

```
tarot-reflector/
├── src/
│   ├── app/                          # Next.js 页面
│   │   ├── page.tsx                  # 首页：三模式入口
│   │   ├── reading/page.tsx          # 解读页：抽牌 + 分步阅读
│   │   ├── archive/page.tsx          # 档案馆：78 张牌索引
│   │   ├── guide/page.tsx            # 科普导览
│   │   ├── notes/page.tsx            # 牌面笔记
│   │   ├── demo/page.tsx             # 演示模式
│   │   ├── explain/page.tsx          # 录屏科普工作台
│   │   └── api/                      # API 路由
│   ├── components/                   # UI 组件
│   │   ├── ui/                       # 基础组件 (GlassCard, ModeCard, etc.)
│   │   ├── archive/                  # 档案馆组件
│   │   └── ...                       # 页面级组件
│   ├── features/
│   │   ├── motion/                   # 动效系统 (GSAP hooks, tokens, flags)
│   │   ├── reading/                  # 解读引擎 (hooks, types, lib)
│   │   └── notes/                    # 笔记系统 (hooks, types, repository)
│   ├── lib/                          # 核心逻辑
│   │   ├── rulesGuard.ts             # 运行时规则守卫
│   │   ├── schema.ts                 # 类型定义
│   │   ├── reading/                  # 解读引擎 (template / AI)
│   │   └── ai/                       # AI provider 抽象层
│   ├── styles/                       # CSS (tokens, typography, pages)
│   └── data/                         # 牌义数据 (78 张 JSON)
├── docs/                             # 设计文档
├── scripts/                          # 工具脚本 (benchmark, audit)
├── tests/                            # 测试 (unit, e2e, visual)
├── remotion/                         # 视频演示 (Remotion)
├── prompts/                          # AI 提示词模板
├── tarot_rules.md                    # 规则源头文档
└── reports/                          # 自动生成的报告
```

---

## 基准测试

```bash
npm run benchmark            # 全链路 (100 分)
npm run benchmark:frontend   # 前端体验 (100 分)
```

报告输出到 `reports/`，涵盖工程治理、类型安全、功能完整性、规则正确性、AI 质量、motif 数据、视频就绪度等维度。

---

## 当前状态

- ✅ 完整解读流程（问题澄清 → 抽牌 → 分步解读 → 笔记）
- ✅ 78 张牌完整数据（大阿尔卡那 + 小阿尔卡那）
- ✅ 档案馆（可交互牌面、符号热点）
- ✅ 科普导览
- ✅ 笔记系统（快照、回看、同牌提醒）
- ✅ 双主题（暗色 / 浅色）
- ✅ 动效系统（GSAP + Framer Motion，分层 flag 控制）
- ✅ 女性友好规则守卫（30+ 禁用词、反刍护栏、危机干预）
- ✅ 演示模式（9:16 预览、Remotion 集成）
- ✅ AI 解读（DeepSeek / OpenAI-compatible，可配置）
- ✅ 基准测试体系
- 🔧 Storybook 组件文档（部分）
- 🔧 视频导出（Remotion，开发中）

---

## 许可

牌面图片来自 Wikimedia Commons 上的 Rider–Waite–Smith 公版扫描。
