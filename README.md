# 阈牌 Threshold Tarot

> ## ⚠️ 这是一个象征性反思工具，不是命运预测工具
>
> 「阈牌」用塔罗牌作为视觉语言，帮助用户把模糊的内在状态外化、命名、重新观察。
> 它**不预测未来**，**不替你做决定**，**不提供"运势"**，**不替代心理咨询 / 医疗 / 法律 / 财务专业建议**。
>
> 项目的所有解读都必须遵守根目录 [**`tarot_rules.md`**](./tarot_rules.md) — 那里定义了体系（RWS）、牌池（仅 22 张大阿尔卡那）、牌义口径、语言规范、禁用话术、输出结构与免责声明。任何违反这些规则的输出都会被 `src/lib/rulesGuard.ts` 拦截并要求重新生成。

> **🛠 状态说明：** 这不是完整产品，只是初始阶段的样本 / 原型（v0.1）。
>
> 当前版本用于演示「提问 → 抽牌 → 分步解读」的交互流程。解读文案来自本地模板拼接，尚未接入真实 AI；部分 UI（笔记、设置、语音等）仅为占位，还不能使用。

---

## 这是什么

一个基于 **Next.js** 的塔罗象征性反思 Web 应用。用户输入问题并选择领域后，随机抽取一张大阿尔卡那牌，通过动画展示牌面，再按「整体 → 元素 → 综合 → 建议」分步阅读解读。

**定位：** 用塔罗牌作为视觉语言，帮助整理当下感受 — **不是命运预测**。

### 严格规则与输出守卫

| 文档 / 代码 | 作用 |
|------------|------|
| [`tarot_rules.md`](./tarot_rules.md) | 规则源头：体系、牌义口径、语言规范、禁用话术、结构、免责声明 |
| `src/lib/tarotRulesPrompt.ts` | 把关键规则注入到 LLM 提示词最前面（强制注入，不可关闭） |
| `src/lib/rulesGuard.ts` | 运行时校验：禁用词扫描、字段字数、CJK 占比、可执行性、disclaimer 检查 |
| `src/lib/rulesGuard.shared.ts` | 禁用词清单与字段上限常量（被 prompt 与 guard 共同读取） |

AI 引擎在违规时最多重试 **3 次**，每次把上次违规明细追加进 prompt 让模型针对性修正；3 次仍失败则抛 `ReadingRulesViolationError`，由调用方决定 fallback（默认回退到模板引擎）。

### 女性友好原则（Safety-not-Pinkness）

详见 [`tarot_rules.md` §11](./tarot_rules.md)。核心是：

- **安全感、边界感、温柔、尊重、克制**；不恐吓、不替用户决定、不消费焦虑、允许模糊、允许停止。
- **感情类问题硬底线**：绝不替对方下判断（"他爱你 / 他会回来 / Ta 心里还有你"等表达已加入 `BANNED_SUBSTRINGS`）。
- **反沉迷**：「重新抽牌」不是结束页主按钮，主操作是「继续看这个问题 / 写下我的感受 / 我想换个问法 / 到这里就好」。
- **两套主题**：夜间玻璃（默认）与月白纸面，可在顶栏切换；浅色不少女、不甜，像 journal 的纸感。
- **气质一句话**：像一个会看牌的安静朋友，不是一个神秘权威。它说不出你的命运，但能帮你说清你的感受。

---

## 给接手者：这是什么、能参考什么

本仓库是**参考样本**，供评估「是否继续做这个产品」时使用。你可以：

1. **直接运行体验** — `npm install && npm run dev`，走一遍完整流程
2. **看代码结构** — 重点文件见下方「项目结构」；注释均为中文
3. **按需取舍** — 可以只用 UI 和交互，替换解读逻辑；也可以在此基础上接 AI
4. **阅读讲解** — 详细架构与扩展说明见 **[docs/讲解.md](./docs/讲解.md)**

### 已实现（可参考复用）

| 模块 | 文件 | 说明 |
|------|------|------|
| 提问表单 | `src/components/QuestionForm.tsx` | 问题 + 领域选择 |
| 抽牌动画 | `CardDeck.tsx` / `CardReveal.tsx` | 洗牌、翻牌 |
| 牌面标注 | `AnnotatedCard.tsx` | 元素高亮 + 引线标签 |
| 分步解读 | `ReadingPanel.tsx` + `StepRail.tsx` | 进度条 + 分幕文案 |
| 数据接口 | `src/app/api/reading/route.ts` | GET 契约说明 + POST 生成解读 |
| 解读引擎接口 | `src/lib/reading/types.ts` | `ReadingGenerator` / `CardDrawer` |
| 模板引擎 | `src/lib/reading/templateGenerator.ts` | 默认实现 |
| AI 引擎骨架 | `src/lib/reading/aiGenerator.stub.ts` | 待填 `callLLM()` |
| 牌义数据 | `src/data/tarot_cards.json` | 22 张大阿卡纳 |

### 尚未实现（占位或未接入）

| 项目 | 说明 |
|------|------|
| AI 解读 | 见 `aiGenerator.stub.ts`；prompt 在 `prompts/`；切换 `READING_PROVIDER=ai` |
| 补充背景 `context` | API 与 prompt 已支持；首页暂无输入框，可自加 |
| 笔记 / 设置 / 语音 | UI 占位，点击无效或禁用 |
| 用户系统 / 历史记录 | 无 |

### 若决定继续做，建议优先级

1. 实现 `aiGenerator.stub.ts` 中的 `callLLM()`（见 `docs/讲解.md` 第 6 节）
2. 精调 `tarot_cards.json` 里各牌的 `motifs.bbox`（元素标注位置）
3. 首页已中文化；可按品牌再调整文案

---

## 环境要求

- **Node.js** 18 或更高版本（推荐 20+）
- **npm**（随 Node 安装）
- 可选：Python 3（仅在你需要重新下载牌面图片时使用）

---

## 快速开始

### 1. 安装依赖

```bash
cd tarot-reflector
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000)。

### 3. 使用流程

1. 在首页输入你此刻关心的问题
2. 选择一个领域标签（感情 / 工作 / 项目 / 学习 / 自我 / 财务）
3. 点击「抽牌」
4. 观看洗牌 → 翻牌动画
5. 在解读页左右切换步骤，查看牌面元素标注与文字解读
6. 可点击「全牌面」查看完整牌图，或「分享此刻」复制解读文本到剪贴板

### 4. 生产构建（可选）

```bash
npm run build
npm start
```

---

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 本地开发，热更新 |
| `npm run build` | 构建生产版本 |
| `npm start` | 运行生产构建（需先 `build`） |
| `npm run lint` | 代码检查 |
| `npm run typecheck` | TypeScript 类型检查 |
| `npm run test:unit` | 运行单元/集成测试 (Vitest) |
| `npm run test:e2e` | 运行 E2E 测试 (Playwright) |
| `npm run check` | 完整质量检查 (typecheck + lint + test + secrets:scan) |
| `npm run benchmark` | 运行全链路基准测度，输出报告到 `reports/benchmark_report.md` |
| `npm run audit:cards` | 审计 78 张牌完整性 |
| `npm run audit:motifs` | 审计 motif 数据质量 |
| `npm run secrets:scan` | 扫描泄露的密钥 |
| `npm run cards:download` | 从 Wikimedia 下载 22 张大阿卡纳牌面 |
| `npm run cards:wire` | 将牌面路径写入 `tarot_cards.json` |

> 牌面图片已包含在 `public/cards/major/` 中，一般无需重新下载。只有图片缺失时才运行上面两条命令。

### 运行 Benchmark

```bash
npm run benchmark
```

输出报告位于 `reports/benchmark_report.md`，包含 12 大类、100 分评分体系的自动化检测结果。

**评级标准：**

| 分数 | 等级 | 含义 |
|------|------|------|
| 90–100 | 优秀样本 | 可作为参考项目公开 |
| 80–89 | 演示项目 | 可演示，需标注未完成部分 |
| 70–79 | 原型可用 | 不适合作为参考样本 |
| 60–69 | 工程风险 | 功能有雏形，风险明显 |
| <60 | 实验 demo | 仍是实验性 |

详见 [`BENCHMARK.md`](./BENCHMARK.md)。

---

## 项目结构

```
tarot-reflector/
├── src/
│   ├── app/                    # Next.js 页面与 API
│   │   ├── page.tsx            # 首页：输入问题
│   │   ├── reading/page.tsx    # 解读页：动画 + 分步阅读
│   │   └── api/reading/route.ts # POST 接口：生成解读
│   ├── components/             # UI 组件（牌组、翻牌、标注、解读面板等）
│   ├── lib/
│   │   ├── schema.ts           # 类型定义（前后端契约）
│   │   ├── constants.ts        # 领域、配置、环境变量名
│   │   ├── drawCard.ts         # 随机抽牌
│   │   ├── generateReading.ts  # 兼容入口（re-export）
│   │   └── reading/            # ★ 解读引擎（template / ai）
│   └── data/
│       └── tarot_cards.json    # 22 张大阿卡纳数据
├── docs/
│   └── 讲解.md                 # 架构与扩展接口详细说明
├── prompts/                    # AI 提示词模板
├── .env.example                # 环境变量示例
```

---

## 核心流程（给开发者）

```
用户提交问题
    ↓
首页 page.tsx → 跳转 /reading?question=...&domain=...
    ↓
reading/page.tsx → POST /api/reading
    ↓
drawCard.ts 随机抽牌 + 正逆位
    ↓
lib/reading/ 解读引擎（template 默认，可切换 ai）
    ↓
前端播放洗牌 → 翻牌 → 分步展示 AnnotatedCard + ReadingPanel
```

---

## 当前限制（原型阶段）

- 解读文案为**本地模板**，质量与个性化有限
- 仅支持 **22 张大阿卡纳**，无小阿卡纳
- `prompts/dynamic_reading_prompt.txt` 已预留，但**未接入 LLM API**
- 侧边栏「笔记」「设置」、顶部「语音」按钮为 UI 占位
- 无用户账号、历史记录、付费等后端能力
- 「分享此刻」仅复制文本到剪贴板，不生成图片或链接

---

## 发给别人：能用微信传吗？

**可以，但要注意打包方式。**

| 内容 | 大小（约） | 能否微信直接传 |
|------|-----------|----------------|
| 整个文件夹（含 `node_modules` + `.next`） | ~800 MB | ❌ 太大，微信单文件上限约 100 MB（手机端有时更严） |
| **源码包**（排除 `node_modules`、`.next`） | ~20 MB | ✅ 可以 |

### 推荐做法

**方式一：压缩后微信发文件（最简单）**

在项目根目录执行：

```bash
# macOS / Linux
tar -czf tarot-reflector-src.tgz \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=.git \
  .
```

把生成的 `tarot-reflector-src.tgz`（约 20 MB）通过微信「文件」发给对方。

对方收到后：

```bash
tar -xzf tarot-reflector-src.tgz -C tarot-reflector
cd tarot-reflector
npm install
npm run dev
```

**方式二：网盘 / GitHub**

- 上传到百度网盘、阿里云盘等，分享链接（适合长期协作）
- 推到 GitHub 私有/公开仓库，对方 `git clone`

**方式三：部署后分享链接（最适合非技术人员体验）**

部署到 [Vercel](https://vercel.com) 等免费平台，直接发网址，对方打开浏览器就能用，无需安装 Node。

---

## 技术栈

- [Next.js 16](https://nextjs.org)（App Router）
- [React 19](https://react.dev)
- [Tailwind CSS 4](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion/)（动画）

---

## 许可与牌面版权

牌面图片来自 Wikimedia Commons 上的 Rider-Waite-Smith 公版扫描。详见 `scripts/download_major_arcana.py` 中的说明。
