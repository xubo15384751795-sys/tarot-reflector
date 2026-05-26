# Threshold Tarot Benchmark Suite

> 阈牌全链路基准测度

## 评分体系

总分 **100 分**，12 大类：

| # | 类别 | 分值 | 测度目标 |
|---|------|------|----------|
| A | 基础工程与版本治理 | 10 | Git、安全、CI、可复现 |
| B | 类型安全与代码结构 | 10 | TS 严格度、模块化、可测性 |
| C | 功能完整性 | 12 | 三种模式、抽牌、解读、笔记 |
| D | 塔罗规则正确性 | 12 | 78 张牌、RWS 体系、正逆位 |
| E | AI 生成质量与边界 | 12 | callLLM、JSON 稳定性、rulesGuard |
| F | 用户流程与交互状态机 | 10 | 状态机、loading 文案、退出权 |
| G | 女性友好与伦理安全 | 10 | 感情保护、不制造焦虑、用户主体性 |
| H | UI 设计系统一致性 | 8 | 明暗主题、字体、组件语言 |
| I | 动效与交互手感 | 6 | Motion tokens、无硬切、reduce motion |
| J | 档案库与 motif 质量 | 5 | 数据分级、精确标注、审计报告 |
| K | 视频化与自媒体能力 | 3 | ReadingScript、演示模式、Remotion |
| L | 性能、SEO、分享与可发布性 | 2 | Lighthouse、OG、分享 |

## 评级标准

| 分数 | 等级 | 含义 |
|------|------|------|
| 90–100 | 优秀样本 | 可作为参考项目公开 |
| 80–89 | 演示项目 | 可演示，需标注未完成部分 |
| 70–79 | 原型可用 | 不适合作为参考样本 |
| 60–69 | 工程风险 | 功能有雏形，风险明显 |
| <60 | 实验 demo | 仍是实验性 |

## 运行方式

```bash
# 自动化 benchmark（客观指标）
npm run benchmark

# 单独审计
npm run audit:cards    # 78 张牌完整性
npm run audit:motifs   # motif 数据质量

# 完整检查
npm run check          # typecheck + lint + test:unit + secrets:scan
```

报告输出到 `reports/benchmark_report.md`。

---

## A. 基础工程与版本治理（10 分）

### A1. Git 与版本控制（2 分）

- [ ] 项目已 `git init`
- [ ] 默认分支为 `main`
- [ ] 有清晰 commit history
- [ ] `.env.local` 未被追踪
- [ ] README 说明如何运行

**通过标准：** `git status` 干净，`.env.local` 不在 `git ls-files` 中。

**评分：** 2=完整 | 1=有 git 但不完整 | 0=未纳入版本控制

### A2. Secret 安全（2 分）

- [ ] `.env.example` 存在
- [ ] `.env.local` 不提交
- [ ] secretlint 存在
- [ ] CI 中运行 secrets scan
- [ ] 已泄露 API key 已轮换

**通过标准：** `npm run secrets:scan` 通过。

**评分：** 2=完整 | 1=本地防泄露但 CI 未接 | 0=仍有泄露风险

### A3. 项目启动与环境可复现（2 分）

- [ ] `npm ci` 可运行
- [ ] `npm run dev` 可启动
- [ ] `npm run build` 可通过
- [ ] `.env.example` 能指导配置
- [ ] 缺少 API key 时有明确报错

**评分：** 2=新机器可复现 | 1=需人工猜步骤 | 0=无法稳定启动

### A4. CI/CD（2 分）

- [ ] `.github/workflows/ci.yml` 存在
- [ ] CI 运行 typecheck、lint、test、build、secret scan

**评分：** 2=完整 CI | 1=部分检查 | 0=无 CI

### A5. README 与样本说明（2 分）

README 必须说明：项目定位、技术栈、如何运行、如何配置 AI Provider、如何运行测试、如何运行 benchmark、塔罗规则声明、非命运预测声明、motif 数据质量状态、视频能力状态。

**评分：** 2=完整 | 1=只说明运行 | 0=不足

---

## B. 类型安全与代码结构（10 分）

### B1. TypeScript 严格度（2 分）

- [ ] `tsconfig` `strict: true`
- [ ] reading 主链路无 `any`
- [ ] 无无意义 `@ts-expect-error`

**命令：** `npm run typecheck` + `grep -R "as any\|: any" src/app src/features src/lib`

**评分：** 2=核心链路无 any | 1=少量隔离 any | 0=any 泛滥

### B2. reading/page.tsx 复杂度（2 分）

- `< 150 行`：满分
- `150–300 行`：1 分
- `> 300 行`：0 分

**结构要求：** page.tsx 只负责 layout shell，业务逻辑进入 hooks，阶段渲染进入 Stage components。

### B3. Feature 模块化（2 分）

推荐结构：
```
src/features/reading/
  hooks/          # useReadingSession, useReadingApi
  components/     # ReadingStageRouter
  stages/         # QuestionStage, DrawingStage, ...
  lib/            # normalizeReading, buildLocalFallbackReading
  types/          # reading.ts
```

**评分：** 2=结构清晰 | 1=部分拆分 | 0=God Component

### B4. 数据模型统一（2 分）

- [ ] UI 只消费 `ReadingScript`
- [ ] API response 不直接进 UI
- [ ] fallback 也 normalize 成 `ReadingScript`
- [ ] Remotion 也消费 `ReadingScript`

**评分：** 2=ReadingScript 成为唯一渲染数据源 | 1=部分统一 | 0=各处各自拼数据

### B5. 测试可注入性（2 分）

- [ ] AI provider 可 mock
- [ ] drawCards 可传 seed
- [ ] UI 可用 fixture 渲染
- [ ] 关键函数无浏览器依赖

**评分：** 2=核心逻辑可独立测试 | 1=部分可测 | 0=强耦合 UI/API

---

## C. 功能完整性（12 分）

### C1. 三种入口模式（2 分）

- [ ] 今日一牌：不需要问题
- [ ] 问题解读：需要问题复述与牌阵推荐
- [ ] 深度牌阵：多牌、多位置、多关系分析

### C2. 问题复述与确认（2 分）

- [ ] 用户输入问题后先 reframe
- [ ] 用户可接受/修改/保留原问题
- [ ] AI 不直接替用户决定

### C3. 牌阵推荐（2 分）

- [ ] 根据 domain 推荐牌阵
- [ ] 推荐理由中文显示
- [ ] 用户可以自行选择

### C4. 抽牌与 AI 解读分离（2 分）

- [ ] 抽牌本地快速完成
- [ ] AI 解读后台生成
- [ ] 牌面先出现
- [ ] AI 失败不丢牌面，显示本地 fallback

### C5. 多牌阵完整解读（2 分）

- [ ] 牌阵总览
- [ ] 每张牌结合位置解释
- [ ] 牌与牌关系分析
- [ ] 元素平衡分析

### C6. 笔记与回看（2 分）

- [ ] localStorage 保存笔记
- [ ] 记录 reading_id、问题、牌、结果、时间
- [ ] 可回看

---

## D. 塔罗规则正确性（12 分）

### D1. 78 张牌完整性（2 分）

- [ ] 22 张大阿尔卡那
- [ ] 56 张小阿尔卡那
- [ ] 四花色完整
- [ ] 宫廷牌完整

**命令：** `npm run audit:cards`

### D2. RWS 体系一致性（2 分）

- [ ] 使用 RWS 排序（力量 8，正义 11）
- [ ] 牌义不魔改
- [ ] 图片来源记录

### D3. 正逆位规则（2 分）

- [ ] 正位不等于好
- [ ] 逆位不等于坏
- [ ] 逆位可以是阻滞、内化、延迟、失衡

### D4. 小阿尔卡那规则（2 分）

- [ ] 四花色元素规则
- [ ] 数字 1–10 规则
- [ ] 宫廷牌规则
- [ ] 花色 + 数字组合解释

### D5. 牌阵位置规则（2 分）

- [ ] 每个 spread 有 position meaning
- [ ] 多牌解读结合位置

### D6. 规则不可被 AI 篡改（2 分）

- [ ] Prompt 明确输入规则
- [ ] rulesGuard 检查违背
- [ ] 本地 fallback 不依赖 AI

---

## E. AI 生成质量与边界（12 分）

### E1. AI Provider 可用性（2 分）

- [ ] `callLLM()` 真实现
- [ ] DeepSeek provider 可用
- [ ] OpenAI-compatible 抽象
- [ ] 缺 key 明确报错
- [ ] timeout / abort 支持

### E2. JSON 输出稳定性（2 分）

- [ ] `response_format: json_object`
- [ ] `parseJsonObject` 有错误处理
- [ ] 失败可 retry
- [ ] retry 时带 violation 信息

### E3. rulesGuard 覆盖（2 分）

必须拦截：英文 UI 残留、命中注定、他一定爱你、不存在的 motif、不存在的 card_id、过度金融/医疗/法律建议。

### E4. AI 文案质量（2 分）

- 全中文、温柔克制、不恐吓、不宿命
- 能回扣用户原话
- 能结合牌面元素
- 能给可执行但不强迫的建议

### E5. 流式 / 渐进体验（2 分）

- [ ] 本地 fallback 立即显示
- [ ] AI 逐步生成或 SSE streaming
- [ ] 超 8s 有提示
- [ ] 超 20s 可重试或只看传统牌义

### E6. 用户反馈微调（2 分）

- [ ] 用户可选择"像我 / 不太像 / 不确定"
- [ ] 不要求用户接受 AI 判断
- [ ] refine API 存在

---

## F. 用户流程与交互状态机（10 分）

### F1. 状态机清晰（2 分）

必须定义：idle → mode_selected → question_input → question_reframing → question_confirmed → spread_recommending → spread_selected → shuffling → card_revealed → generating_reading → reading_ready → reflection_note → completed → error。

### F2. loading 文案真实（2 分）

- 实际在等 AI，文案不能显示"正在抽取牌面"
- 正在抽取牌面 / 牌面已出现 / 正在整理解读

### F3. 交互不命令化（2 分）

- hotspot 是中心交互
- 解释从牌面附近浮现
- hover/click 有自然反馈

### F4. 退出权与修改权（2 分）

- "我想改一下" / "保留原问题" / "这段解读不太像我" / "到这里就好"

### F5. 重抽控制（2 分）

- 重新抽牌不是主按钮
- 同一问题短时多次重抽有温柔提醒

---

## G. 女性友好与伦理安全（10 分）

### G1. 感情问题保护（2 分）

禁止：他一定爱你、他一定不爱你、他会回来、你们注定。要求：把焦点带回用户感受、边界、安全感。

### G2. 不制造焦虑（2 分）

- 不使用恐吓语气
- 不使用倒计时式焦虑
- 不鼓励无限重抽

### G3. 用户主体性（2 分）

- "这不是定论" / "你可以不接受这段解释" / "你可以停在这里"

### G4. 情绪承接（2 分）

- 允许问题模糊、不知道怎么问、不急着决定

### G5. 夜间/低刺激模式（2 分）

- [ ] `prefers-reduced-motion` 支持
- [ ] 夜间减少强动效
- [ ] 长文可折叠

---

## H. UI 设计系统一致性（8 分）

### H1. 明暗主题对称（2 分）

- 浅色 = 月白档案馆，暗色 = 夜色档案馆
- 使用同一套 tokens

### H2. 字体系统统一（2 分）

- 标题：LXGW WenKai
- 正文/UI：PingFang SC / Noto Sans SC
- 英文/编号：Inter

### H3. 组件语言统一（2 分）

卡片、按钮、hotspot、popover、档案正文属于同一设计语言。

### H4. 微光与烫金克制（2 分）

- 流沙不影响可读性
- `prefers-reduced-motion` 下关闭

---

## I. 动效与交互手感（6 分）

### I1. Motion tokens（1 分）

必须有：`easeSoft`、`easeGentle`、`springCard`、`springSmall`。

### I2. 无硬切（1 分）

页面切换 fade + blur + y，不 `display: none/block` 硬切。

### I3. 缩放与布局不卡顿（1 分）

只动画 `transform` + `opacity`，不动画 `width/height/top/left`。

### I4. 档案库 hotspot 触感（1 分）

hover 像靠近，click 像选中，解释浮现自然。

### I5. 抽牌动画（1 分）

抽牌 1.2–1.8s，翻牌 0.9–1.15s，AI 不阻塞抽牌。

### I6. Reduce motion（1 分）

`@media (prefers-reduced-motion: reduce)` 禁用复杂动效。

---

## J. 档案库与 motif 质量（5 分）

### J1. Motif 数据分级（1 分）

必须有 `source` 和 `quality` 字段。

### J2. 大阿尔卡那精确标注（1 分）

22 张大阿尔卡那 motif 至少 5 个，anchor/bbox 精确，`quality=verified`。

### J3. 小阿尔卡那透明披露（1 分）

rough 不用于精准热点，UI 不假装全部精确。

### J4. Motif debug 模式（1 分）

`?debugMotifs=1` 显示 anchor、bbox、id、坐标。

### J5. Motif audit report（1 分）

`npm run audit:motifs` 输出 `reports/motif_quality_report.md`。

---

## K. 视频化与自媒体能力（3 分）

### K1. ReadingScript 支持视频（1 分）

每幕有：headline_zh、body_zh、voiceover_zh、subtitle_zh、duration、focus_motif。

### K2. 演示模式（1 分）

9:16 竖屏预览、自动播放、字幕、牌面高亮、进度条。

### K3. Remotion 最小 demo（1 分）

remotion 不为空，读取 fixture，可 preview 或 render demo。

---

## L. 性能、SEO、分享与可发布性（2 分）

### L1. 性能（1 分）

- 首页 Lighthouse Performance > 85
- 无明显 layout shift
- 牌面图懒加载

### L2. SEO / 分享（1 分）

- Open Graph + Twitter Card
- 动态 metadata
- 分享卡片

---

## 审查方式

| 类别 | 方式 |
|------|------|
| A. 工程治理 | 自动化 (`npm run benchmark`) |
| B. 类型安全 | 自动化 + 人工审查 |
| C. 功能完整性 | 人工审查 + E2E 测试 |
| D. 塔罗规则 | 自动化审计 + 人工审查 |
| E. AI 质量 | 自动化测试 + 人工审查文案 |
| F. 交互状态机 | 人工审查 |
| G. 女性友好 | 人工审查（关键项） |
| H. UI 一致性 | 人工审查 |
| I. 动效手感 | 人工审查 |
| J. Motif 质量 | 自动化审计 |
| K. 视频能力 | 自动化 + 人工审查 |
| L. 性能 SEO | 自动化 + Lighthouse |

## Critical Failures（一票否决）

以下任一不通过，总分不超过 59：

- [ ] Secret 泄露
- [ ] Build 失败
- [ ] Typecheck 失败
- [ ] AI engine 骨架
- [ ] rulesGuard 缺失
- [ ] Reading flow 不可用
