# Layer Map — `/motion-lab` 视觉图层系统

> **用途**：为 scroll-based cinematic prototype 定义完整图层栈与运动分工。  
> **读者**：动效实现、视觉验收、性能审查。  
> **原则**：camera push 由主视觉承担；背景几乎不动；文字极少动；卡片最后出现；dust / grain / light 极弱。

---

## 图层总览

| Layer | 名称 | z-index | 是否随 camera-rig | 连续运动 |
|-------|------|---------|-------------------|----------|
| 0 | base darkness | 0 | 否（固定于视口） | 否 |
| 1 | background vignette | 10 | 否 | 否 |
| 2 | paper / book / tarot image | 20 | **是（主锚点）** | 否（仅 scroll） |
| 3 | grain texture | 30 | 是（极微） | 否 |
| 4 | dust particles | 40 | 是（极微） | 可选极慢 |
| 5 | light falloff | 50 | 是（opacity 为主） | 否 |
| 6 | hero title | 60 | 是（最少） | 否 |
| 7 | subtitle | 70 | 是（最少） | 否 |
| 8 | archive choice cards | 80 | 是（晚入场） | 否 |
| 9 | thin border / frame | 90 | 否 | 否 |
| 10 | scroll hint | 100 | 否 | 否 |

**速度层级（相对 camera push = 1.0）**

```
L2 主视觉 ≈ 1.00
L3 grain   ≈ 0.04（几乎贴附 rig）
L4 dust    ≈ 0.06 + 独立 drift ≤ 8px
L5 light   ≈ 0.12（opacity 变化 > 位移）
L6 title   ≈ 0.08
L7 subtitle≈ 0.06
L8 cards   ≈ 0.35（晚段才达 0.35，前段为 0）
L0/L1/L9/L10 = 0（不随 rig 位移）
```

---

## Layer 0 — `base darkness`

| 项 | 说明 |
|----|------|
| **layer name** | `layer-base-darkness` |
| **visual role** | 房间最深处的基础暗色，托住整个场景，像关了大灯的档案室墙面与地面。不是渐变装饰，是「空间还在」的底。 |
| **z-index** | `0` |
| **initial state** | 全视口铺满 `var(--bg-base)` 向更深棕黑的纵向渐变；无明显纹理；opacity `1`。 |
| **scroll behavior** | **不动**。不随 scroll 改变位置或 scale。允许整体环境亮度在 Shot 04–05 由 L5 间接「显得」略亮，但 L0 自身不变。 |
| **mouse behavior** | 无。不响应 pointer。 |
| **opacity range** | `1`（恒定） |
| **blur range** | `0` |
| **transform range** | 无 |
| **should it move continuously?** | **否** |
| **performance risk** | 低（静态 CSS 渐变） |
| **reduced-motion fallback** | 保持相同静态底，不删减。 |

**不应动的原因**：基底一动，观众会失去「站在房间里」的稳定感。

---

## Layer 1 — `background vignette`

| 项 | 说明 |
|----|------|
| **layer name** | `layer-vignette` |
| **visual role** | 四角压暗，引导视线落向桌面中心；模拟镜头暗角，不是 UI 遮罩。 |
| **z-index** | `10` |
| **initial state** | radial-gradient 中心透明、边缘溶入 `var(--bg-base)`；opacity `0.75–0.9`（dark theme 偏高）。 |
| **scroll behavior** | **不动**。随镜头推近，暗角在知觉上可略「收紧」，但实现上通过 L5 烛光变亮完成，而非 L1 位移。 |
| **mouse behavior** | 无。 |
| **opacity range** | `0.7 – 0.92`（仅允许在 Shot 03→05 由 L5 联动时知觉变化，L1 自身 opacity 变化 ≤ `0.05`） |
| **blur range** | `0` |
| **transform range** | 无 |
| **should it move continuously?** | **否** |
| **performance risk** | 低 |
| **reduced-motion fallback** | 静态暗角，opacity 取 `0.85`。 |

**不应动的原因**：暗角是视口属性，应像相机镜头而非场景物体。

---

## Layer 2 — `paper / book / tarot image`

| 项 | 说明 |
|----|------|
| **layer name** | `layer-hero-scene`（书摄影 + 牌背合成） |
| **visual role** | **空间主锚点**。真实书页摄影承载桌面，真实塔罗牌背落在纸上。观众「走近」的对象就是这一层。 |
| **z-index** | `20` |
| **initial state** | Shot 01：书占画面下 1/3，偏暗，牌背小且弱对比；`scale` 相对 rig 约 `1.0`；`object-position` 偏下（≈ `50% 72%`）。 |
| **scroll behavior** | **承担主要 camera push**。随 `camera-rig`：`scale` `1.0 → 1.88`；`translate` 合计 ≤ `80px`（以 rig 为整体，书相对 rig 可附加 **反向 parallax ≤ 20px** 于 Shot 03–04）。Shot 01–02 牌与书同框推进；Shot 04 牌成为视觉焦点。 |
| **mouse behavior** | 无 hover 位移。可选：pointer 在桌面区域时 L5 烛光 opacity `+0.02`（经 L5 实现，非 L2 抖动）。 |
| **opacity range** | `0.88 – 1`（Shot 01 可略压暗，Shot 04 回到 `1`） |
| **blur range** | `0`（禁止用 blur 假景深；虚实靠摄影与遮罩） |
| **transform range** | rig 级：`scale` max `1.88`；`x` ±`35px`；`y` `-55px ~ +40px`；`rotate` `-1.2° ~ 0°`。书页 parallax：`x` 仅 `-20px ~ 0`。 |
| **should it move continuously?** | **否**（仅 scroll-scrub 分段运动） |
| **performance risk** | 中（大图 + transform；需 `will-change` 仅在 pin 段，结束清除） |
| **reduced-motion fallback** | 静帧 Shot 04 构图：`scale ≈ 1.72`，牌清晰可读，书页纹理可见。 |

**运动最多的一层**，但仍是「镜头推进」而非元素表演。

---

## Layer 3 — `grain texture`

| 项 | 说明 |
|----|------|
| **layer name** | `layer-grain` |
| **visual role** | 纸纤维与胶片颗粒，增加材质可信度；观众不应意识到「有颗粒层」。 |
| **z-index** | `30` |
| **initial state** | 静态 noise tile；`mix-blend-mode: overlay`；opacity `0.03`（dark）/ `0.04`（light）。 |
| **scroll behavior** | 随 rig **极微**同动（速度比 `0.04`）。**禁止**独立 scroll 动画。 |
| **mouse behavior** | 无。 |
| **opacity range** | `0.025 – 0.05` |
| **blur range** | `0` |
| **transform range** | 继承 rig 的 ≤ `4%` 等效位移（约 ≤ `12px`） |
| **should it move continuously?** | **否** |
| **performance risk** | 低–中（全屏 blend；移动端可降至 opacity `0.02`） |
| **reduced-motion fallback** | 保留静态颗粒，opacity `0.03`；不闪烁。 |

**不应独立动**：颗粒是介质，不是角色。

---

## Layer 4 — `dust particles`

| 项 | 说明 |
|----|------|
| **layer name** | `layer-dust` |
| **visual role** | 窄光束中的微尘，证明空气存在；数量少、体积小、速度慢。 |
| **z-index** | `40` |
| **initial state** | 12–24 粒，直径 `1–1.8px`；opacity `0.15–0.35`；分布在画面上 1/3（光源区），**不落在文字与牌面中心**。 |
| **scroll behavior** | 随 rig 微动（速度比 `0.06`）。Shot 04 之后 opacity 总上限降至 `0.25`，避免抢牌面。 |
| **mouse behavior** | 无。 |
| **opacity range** | 单层粒子 `0.1 – 0.4`；全层合成后视觉不超过「隐约可见」 |
| **blur range** | `0`（粒子弹清晰，模糊会像脏点） |
| **transform range** | 继承 rig ≤ `14px`；**可选**独立 drift：每粒循环 `18–28s`，位移 ≤ `8px`，`ease-in-out` |
| **should it move continuously?** | **可选、极慢**；默认实现可完全静态以降低干扰 |
| **performance risk** | 中（多元素 + 动画时）；粒子数上限 `24` |
| **reduced-motion fallback** | **关闭 drift**；保留 8–12 粒静态点，opacity `0.12`。 |

**必须微弱**：若观众专门指出「有灰尘动画」，则过强，应减弱。

---

## Layer 5 — `light falloff`

| 项 | 说明 |
|----|------|
| **layer name** | `layer-light-falloff` |
| **visual role** | 烛光/台灯的衰减与落在纸面的亮区；解释「为什么书边更亮」。 |
| **z-index** | `50` |
| **initial state** | 椭圆 radial-gradient，光源位左上外（≈ `22% 18%`）；opacity `0.12`；颜色 `var(--candlelight)`。 |
| **scroll behavior** | **以 opacity 变化为主**，随 scroll：`0.12 → 0.32 → 0.26`（Shot 01→04→06）。位移随 rig 速度比 `0.12`，≤ `18px`。 |
| **mouse behavior** | 可选：pointer 进入视口上半区，opacity `+0.02`，`300ms` 缓入；**无 scale**。 |
| **opacity range** | `0.10 – 0.32`（硬顶 `0.32`，禁止更高） |
| **blur range** | `0 – 8px`（仅 gradient 边缘柔化，不用 `backdrop-filter`） |
| **transform range** | `translate` ≤ `18px`；禁止 scale 光斑 |
| **should it move continuously?** | **否** |
| **performance risk** | 低 |
| **reduced-motion fallback** | 静帧 opacity `0.28`，位置固定。 |

**不应大幅动**：光是气氛，不是探照灯扫射。

---

## Layer 6 — `hero title`

| 项 | 说明 |
|----|------|
| **layer name** | `layer-hero-title` |
| **visual role** | 镜头文案主句，像档案标签或展签，不像广告 headline。 |
| **z-index** | `60` |
| **initial state** | Shot 01 显示第一句（如「档案室」）；opacity `0.35`；位于画面上方 `14%`；`letter-spacing` 宽。 |
| **scroll behavior** | 随 rig 速度比 **`0.08`**（明显慢于 L2）。句间切换仅用 **opacity 交叉**（`0.04–0.06` progress 宽度），**禁止 y 方向 fade-up**。Shot 01–05 共 4–5 句，互斥显示。 |
| **mouse behavior** | 无。 |
| **opacity range** | 单句 `0 – 0.88`；同时仅一句 > `0.5` |
| **blur range** | `0` |
| **transform range** | 继承 rig 等效 ≤ `10px`；**禁止**独立 `translateY` > `4px` |
| **should it move continuously?** | **否** |
| **performance risk** | 低 |
| **reduced-motion fallback** | 固定显示 Shot 04 文案，opacity `0.88`。 |

**文字移动很少**：观众读字，不追字。

---

## Layer 7 — `subtitle`

| 项 | 说明 |
|----|------|
| **layer name** | `layer-subtitle` |
| **visual role** | 主句下的补充说明，更小、更淡，像卡片目录下的铅笔批注。 |
| **z-index** | `70` |
| **initial state** | Shot 01 **隐藏**（opacity `0`）。Shot 03 起出现，opacity `0 – 0.55`。 |
| **scroll behavior** | 速度比 **`0.06`**（慢于 L6）。仅在 Shot 03、04、05 分段显示，与 L6 句位对齐但不同时抢戏。 |
| **mouse behavior** | 无。 |
| **opacity range** | `0 – 0.55` |
| **blur range** | `0` |
| **transform range** | 继承 rig ≤ `8px` |
| **should it move continuously?** | **否** |
| **performance risk** | 低 |
| **reduced-motion fallback** | 显示一句静态副文，opacity `0.5`，或完全省略以减噪。 |

**晚于主标题出现**，且始终更弱。

---

## Layer 8 — `archive choice cards`

| 项 | 说明 |
|----|------|
| **layer name** | `layer-archive-cards` |
| **visual role** | 三种阅读路径的边注卡片（问题解读 / 今日一牌 / 深度牌阵）；在空间中像贴在桌缘的纸条，不是 SaaS feature card。 |
| **z-index** | `80` |
| **initial state** | **Shot 01–02 完全不可见**（opacity `0`）。Shot 03 中段起渐显，Shot 04 完全可读。 |
| **scroll behavior** | 速度比 **`0.35`**（快于文字但仍慢于 L2 主锚点的 `1.0`——因整体随 rig，卡片相对桌面的「出现」是渐显而非飞入）。**禁止** stagger slide-in；**禁止**逐张 y 偏移入场。允许：整组 opacity `0 → 0.92`（Shot 03，`0.08` progress 宽度）；随 rig 推进时相对桌面轻微「进入景深」。 |
| **mouse behavior** | hover：边框色略暖、`opacity +0.04`；**禁止 scale**；**禁止 translateY**。focus-visible：细金线 outline。 |
| **opacity range** | 整组 `0 – 0.92`；单卡 hover 上限 `0.96` |
| **blur range** | `0`（卡片背景用半透明纸色，不用 glass blur） |
| **transform range** | 继承 rig；**禁止**单卡独立 transform > `6px` |
| **should it move continuously?** | **否** |
| **performance risk** | 低–中（3 张卡片 + hover） |
| **reduced-motion fallback** | Shot 04 静帧下整组可见，opacity `0.9`，无 hover 动画。 |

**最后出现的内容层之一**（与 L7 同在 Shot 03+，晚于 L2/L5 建立空间）。

---

## Layer 9 — `thin border / frame`

| 项 | 说明 |
|----|------|
| **layer name** | `layer-editorial-frame` |
| **visual role** | 视口内细线圆角框，像展柜玻璃或编辑页画框；界定「这是镜头画面」而非浏览器默认边。 |
| **z-index** | `90` |
| **initial state** | `inset` 约 `10–18px`；`1px` 边框 `var(--border-strong)` 55% 混合；圆角 `22–26px`；opacity `0.7`。 |
| **scroll behavior** | **不动**（固定于视口）。 |
| **mouse behavior** | 无。 |
| **opacity range** | `0.6 – 0.75`（恒定） |
| **blur range** | `0` |
| **transform range** | 无 |
| **should it move continuously?** | **否** |
| **performance risk** | 低 |
| **reduced-motion fallback** | 保留，强化「海报边框」感。 |

**不应动**：画框是观众与场景之间的界面，不是场景内物体。

---

## Layer 10 — `scroll hint`

| 项 | 说明 |
|----|------|
| **layer name** | `layer-scroll-hint` |
| **visual role** | 极轻的滚动提示（如「向下滚动 · 镜头推近」），仅在入场前几秒存在。 |
| **z-index** | `100` |
| **initial state** | 视口底部居中；opacity `1`；小字、宽字距。 |
| **scroll behavior** | progress `0 – 0.10`：opacity `1 → 0`，**无位移**。之后不再出现。 |
| **mouse behavior** | 无。 |
| **opacity range** | `0 – 1` |
| **blur range** | `0` |
| **transform range** | 无 |
| **should it move continuously?** | **否** |
| **performance risk** | 低 |
| **reduced-motion fallback** | **隐藏**；改显示「已为你暂停镜头运动」类说明（若需要）。 |

**不应动**：提示不是场景一部分。

---

## 运动分工摘要

### 应该动（有叙事理由）

| 层 | 方式 |
|----|------|
| L2 | camera push 主力 |
| L5 | opacity 表达靠近光源 |
| L6 / L7 | 极慢随 rig + 句间 opacity |
| L8 | 晚段渐显，随 rig 中等速度 |

### 不应该动（或几乎不动）

| 层 | 原因 |
|----|------|
| L0 | 空间基底 |
| L1 | 镜头暗角 |
| L9 | 画框界面 |
| L10 | UI 提示 |
| L3 | 只贴附 rig 微量 |

### 速度不可相同

实现时 `camera-rig` 为父级 `transform` 源；子层通过 **parallax 系数** 或 **独立 opacity 曲线** 区分，禁止所有子层 `transform` 与 rig 1:1 同步（L3/L4/L6/L7 必须更慢或更弱）。

---

## 滚动阶段与图层可见性

| Shot | progress | L2 | L5 | L6 | L7 | L8 | L10 |
|------|----------|----|----|----|----|----|-----|
| 01 establishing | 0.00–0.18 | 远景暗 | 低 | 句 1 | 隐藏 | **隐藏** | 可见→消 |
| 02 approach | 0.18–0.38 | 推近 | 升 | 句 2 | 隐藏 | **隐藏** | 隐藏 |
| 03 desk | 0.38–0.58 | 桌为主 | 中 | 句 3 | 渐显 | **渐显** | 隐藏 |
| 04 card | 0.58–0.78 | 牌为锚 | 峰值 | 句 4 | 可见 | 可读 | 隐藏 |
| 05 archive | 0.78–0.92 | 微漂 | 收光 | 句 5 | 可见 | 稳定 | 隐藏 |
| 06 rest | 0.92–1.00 | 停格 | 恒定 | 句 5 | 可选隐 | 稳定 | 隐藏 |

---

## 性能与实现约束

1. 仅 `camera-rig` 与 L5（opacity）、L6/L7/L8（opacity）、L10（opacity）使用 GSAP；同一 DOM 禁止 GSAP + Framer 共管 transform。
2. `will-change: transform` 仅用于 rig，pin 结束移除。
3. 禁止动画 `width / height / top / left`。
4. 全页同时运动元素（含 dust 粒子）建议 ≤ `32` 个 transform 对象。
5. `backdrop-filter` 本实验禁用。

---

## 验收对照（图层级）

| 通过 | 未通过 |
|------|--------|
| 关掉 scroll 后 L2 构图完整 | L8 在首屏就齐全出现 |
| L0/L1/L9 全程稳定 | L1 随 scroll 漂移 |
| 肉眼几乎不觉 L3/L4 | 颗粒或灰尘成为焦点 |
| L6/L7 可读且不飘 | 标题 fade-up 明显 |
| L8 在 Shot 03 后才介入 | 三卡 stagger 弹入 |
| 各层速度可区分 | 所有层同步滑动 |
