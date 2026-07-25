# UI 约定（视觉语法）

> 目的：把审美固化成 token，**不要让每个文件再各自拥有审美主权**。
> 新代码一律从下面的 token / primitive 取值。`npm run ui:guard` 会拦截回潮。

来源唯一性：颜色与字体族在 `src/styles/tokens.css` 按主题定义；
间距 / 圆角 / 字号 / 动效 / 阴影 / 层级 是与主题无关的「尺度层」，也在 tokens.css。

## 颜色

- **金色只走 token**，不要写裸 `rgba(185,149,82,…)` 等。
  - 实色：`--accent`（主）· `--accent-strong`（深）· `--accent-soft`（亮）· `--accent-muted`（旧纸柔金）
  - 透明阶梯（只有这 5 档）：`--accent-a0 .05` · `a1 .10` · `a2 .18` · `a3 .28` · `a4 .45`
  - 金底上的文字：`--accent-ink`
- 文字 / 边框 / 背景 / 状态 用语义色：`--text-*`、`--border*`、`--surface*`、`--danger`。
- 状态色克制：红只用于 `--danger`；不要拿状态色做装饰。
- 硬编码颜色不会随明暗主题切换——这是 bug，不是风格。

## 字号

- 用语义类：`.text-meta / -caption / -label / -body[-sm/-lg] / -title[-sm/-lg] / -display`
  （或直接取 `--text-*` + `--leading-*`）。
- **禁止**裸 `font-size:Npx`、Tailwind `text-[Npx]`、以及任何 `.5px` 半像素字号。

## 间距 / 圆角

- 间距取 `--space-1…10`（4px 基）。
- 圆角取 `--radius-xs/sm/md/lg/xl/2xl/pill`。**胶囊一律 `--radius-pill`**（不要再写 100px / 999px）。

## 动效

- 时长 `--dur-instant/hover/micro/panel/page`；缓动 `--ease-soft`(品牌主)`/-standard/-gentle`。
- **禁止 `transition: all`**；列出真正变化的属性。
- 不要引入 Material `cubic-bezier(0.4,0,0.2,1)`。
- hover≈`--dur-hover`，面板≈`--dur-panel`，页面切换≈`--dur-page`；都用 `--ease-soft`。

## 阴影 / 表面层级

- 用 elevation 四档：`--shadow-rest`(卡 rest) `/ -hover`(卡 hover) `/ -overlay`(popover) `/ -modal`(弹层)。
- **卡片圆角取 `--radius-*`**，不要写裸 `border-radius:Npx`（≥2 位数会被 guard 拦）。
- **inset 内嵌块不要有自己的阴影**；底色用 `--surface`/`--accent-a*`，不要裸 `rgba(255,255,255,.0x)`。
- **不要 panel 套 card**：一个分区要么是「带边带影的卡」，要么是「透明布局壳 + 内部卡」，二选一。
- 签名厚玻璃卡（mode-card / hero-cta / 牌面舞台）刻意保留厚度，**不要拍平**。

## 组件 primitive

- **Button**：`.btn-primary`(金实心) · `.btn-secondary`(描边) · `.btn-ghost` · `.btn-danger`。
  主操作一律金色，不要再出现白色主按钮。状态含 hover/active/focus-visible/disabled/loading。
- **Badge**：`.badge` + `.badge-sm/-md` + `.badge-accent/-muted/-neutral/-danger`。
  `.pill-accent`/`.status-pill` 是同尺度的兼容别名。
- **Card / Surface**：复用 `GlassCard` 与 `.archive-glass-card` 等已 token 化表面；
  可保留各变体气质，但圆角 / 阴影 / 间距取 token。

## 内部页面

- `/demo`、`/lab/*`、`/motion-lab/*` 是开发工具页，生产环境由 `src/middleware.ts` 一律 404。
  不要把它们的视觉混入产品；要保留就得套 AppShell 并皮肤化原生控件。

## 守卫
- `npm run ui:guard`：裸金色 / `transition:all` / 半像素 / 旧 pill 圆角 / Material 缓动 任一回潮即失败。
- `npm run ui:audit`：打印当前漂移指标基线（收敛后应持续走低）。
- `npm run check` 已包含 `ui:guard`。

## 对比度守则（WCAG AA）

- 正文 ≥ 4.5:1；大字（≥18px / bold ≥14px）≥ 3:1。
- `--text-faint`（暗色主题 #6d655b）已提亮至 4.6:1，不要再降。
- placeholder 文字同样需要 4.5:1，禁止用默认 `#999`。
- 金色上文字：`--accent-ink`（#17110a），不要用白色。

## Anti-Slop（来自 impeccable，选装）

详见 [`docs/UI_LANGUAGE.md`](docs/UI_LANGUAGE.md) 的「Anti-Slop 禁令」和「Copy 纪律」章节。
