# UI Language — 阈牌视觉语言

> 本文定义产品「看起来/摸起来」的统一标准。Agent 不得自行发明新风格。

---

## 世界观

每张塔罗牌是一页**古老图像档案**。用户不是在接受命运审判，而是在牌面符号中看见问题的结构。系统不会替用户决定，只会逐一照亮牌面上的元素。

空间设定：**月光档案室**（dark）与 **月白档案室**（light）是同一空间的昼夜，共享语义 token，仅光照数值不同。

---

## 气质四原则

### 1. 神秘，但不廉价

**要做：**
- 暖金/羊皮色温的玻璃 surface
- 纸牌物理阴影（`physical-card`）
- 细线装饰、角饰、档案编号标签
- 低饱和渐变与 inset highlight

**禁止：**
- 霓虹紫/赛博蓝
- 粒子爆炸、转盘、掉落特效
- 高饱和 emoji 装饰
- 游戏抽卡「恭喜获得」式反馈

### 2. 温柔，但不操控

**要做：**
- 「靠近」「看见」「轻轻」类邀请语气
- 可选路径，默认推荐但不强迫
- 安全退出与 reduced-motion 尊重

**禁止：**
- 「你必须」「立即行动」
- 倒计时压迫、虚假 scarcity
- 用恐惧驱动分享或付费

### 3. 可交互，但不命令化

**要做：**
- Hotspot 从牌面生长
- Hover 是微风拂过（`interactive-glow`）
- 边注随 active 展开，非默认全展开

**禁止：**
- 左侧目录 + 中间图 + 右侧说明的三栏文档
- 表格化牌义列表作为首屏
- 后台 CRUD 式表单布局

### 4. 活牌面，不是说明书

牌面始终是视觉锚点。文字解释附属于符号，而非独立文档页。

---

## Design Tokens

使用 `globals.css` 语义变量，**禁止**硬编码偏离色温的颜色：

| Token | 用途 |
|-------|------|
| `--bg-base` / `--surface` | 页面与玻璃层 |
| `--text-primary` … `--text-faint` | 文字层级 |
| `--accent` / `--gold` | 强调与档案编号 |
| `--border` / `--border-active` | 边框与 focus |
| `--shadow-card` | 纸牌阴影 |

字体：`hero-title`、`--font-meta`、`--font-serif-like` 按现有页面使用。

---

## 组件语义

| 组件 | 角色 |
|------|------|
| `GlassCard` | 焦点内容容器，月光玻璃 |
| `TarotCardFrame` | 牌面舞台： glow + shadow + frame |
| `MotifHotspot` | 牌面符号交互点 |
| `SymbolPopover` | 从 hotspot 附近浮现的解释 |
| `StatusPill` | 轻量状态/标签，非按钮 |
| `ArchiveGroupCard` | 档案分组入口 |
| `NoteCard` | 解读快照卡片 |
| `ModeCard` | 首页模式选择卡片 |

---

## 交互状态

每个可交互组件必须定义：

- **default** — 静止档案感
- **hover** — 边框/ glow 轻回应，无大幅位移
- **active / focus-visible** — 金边 ring，保持可键盘访问
- **disabled** — 降低 opacity，无 hover 反馈
- **reduced-motion** — 跳过 stagger / 长 timeline / 追光

---

## 响应式

- 移动端：牌面优先，边注下沉为列表，不画连接线
- 断点与 `card-stage` max-width 保持一致
- Storybook 必须包含 **390px** 宽度 story

---

## 反模式清单

- ❌ shadcn 默认 Dashboard -sidebar + stat cards
- ❌ 纯 Tailwind 灰阶 Admin 面板
- ❌ 每页复制一套 inline `style={{ background: ... }}` 卡片
- ❌ 用 `setTimeout` 串复杂动画
- ❌ 在 loading 态阻塞抽牌 reveal

---

## 排版纪律（来源：impeccable，选装）

> 以下规则从 impeccable 品牌寄存器提取，适配本项目的中文衬线气质。

- **行宽上限**：正文 `max-width: 65ch`，超过则阅读体验下降。
- **层级比 ≥1.25**：字号阶梯之间比值不得低于 1.25，否则读不出层级。
- **font-family 上限 3**：display + body + mono，超过 3 个读作犹豫。
- **禁止全大写正文**：`ALL CAPS` 仅用于短标签和标题。
- **text-wrap: balance**：h1-h3 已在 base.css 全局启用，不要手写覆盖。
- **text-wrap: pretty**：正文已在 base.css 全局启用，防孤字。
- **light-on-dark 行高**：浅色文字在深色背景上加 0.05-0.1 行高（本项目已通过 `--leading-*` 控制）。

## 对比度检查（来源：impeccable，必检）

> 每次 UI 变更前自检。

- 正文文字 ≥ 4.5:1 对比度（WCAG AA）。
- 大字（≥18px 或 bold ≥14px）≥ 3:1。
- placeholder 文字同样需要 4.5:1，不要用默认灰色。
- 灰色文字在彩色背景上读起来发灰 → 用背景色自身的深色调或文字色的透明度。
- **金色上文字**：始终用 `--accent-ink`（#17110a），不要用白色或浅色。

## Anti-Slop 禁令（来源：impeccable，选装适配）

> 以下是 AI 生成前端的常见 tell，本项目同样要避免。

| 禁止 | 为什么 |
|------|--------|
| 侧边条纹 border-left >1px 做彩色强调 | AI 默认手法，用背景色或图标替代 |
| gradient text（background-clip: text） | 装饰性，无语义 |
| 每个 section 都有 tiny uppercase eyebrow | AI 语法，不是品牌声音 |
| 编号段落标记 (01/02/03) 作为默认骨架 | 仅在序列真正有序时使用 |
| hero-metric 模板（大数字+小标签+统计） | SaaS 陈词滥调 |
| 完全相同的卡片网格重复 | 用 bento / 变体尺寸 / 混合布局 |
| 纯黑/纯白背景 | 本项目已通过暖色调避免 |
| 禁 serif 作为默认字体 | **不适用于本项目** — 我们的产品气质需要衬线 |

## Copy 纪律（来源：impeccable，选装）

> 文案同样要逃出 AI 陈词滥调。

- **每个词都要挣到它的位置**。不要重复标题的开头句。
- **禁 em dash**（—）。用逗号、冒号、分号、句号或括号。
- **禁 buzzword**：赋能、无缝、颠覆、革命性、一站式、全方位、极致体验 — 选一个具体的名词和动词。
- **按钮文案 = 动词 + 宾语**。「保存修改」优于「确定」；「删除项目」优于「是」。
- **链接文案要有独立意义**。「查看定价方案」优于「点击这里」；屏幕阅读器会孤立宣布链接。
- **禁止格言式节奏**：如果多段文案共享同一句式（尤其是反转式收尾），重写。

---

## 审查问题

改 UI 前自问：

1. 用户是否感觉在**触摸牌面**，而非点目录？
2. 动效是否有**纸牌重量**，而非 UI 弹窗？
3. 明暗主题是否**同一空间**的不同光照？
4. 文案是在**邀请**，还是在**命令**？
5. **对比度**：所有文字是否 ≥4.5:1？（WCAG AA）
6. **AI tell**：这段 UI 是否看起来像 AI 生成的？如果是，重做。

详见 [`FRONTEND_EXPERIENCE_BENCHMARK.md`](FRONTEND_EXPERIENCE_BENCHMARK.md)。
