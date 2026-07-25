# Motion QA

> **审查对象**：`/motion-lab`  
> **文件**：`page.tsx` · `motion-lab.css` · `bindCinematicTimeline.gsap.ts` · `motion-tokens.ts`  
> **审查日期**：2026-07-07  
> **纠偏修订**：2026-07-07（template landing 去模板化第二轮）

## 修订状态

| # | 纠偏项 | 状态 | 落点 |
|---|--------|------|------|
| 1 | 删除 generic fade-up | ✅ | 标题加载 fade 已删；标题仅 opacity；卡片 y 8px 为整组深处浮出 |
| 2 | hover scale ≤ 1.02 | ✅ | 全页无 hover scale |
| 3 | 无 bounce / spring / elastic | ✅ | scroll `ease: none`；CSS transition 改 `linear` |
| 4 | 无无意义 stagger | ✅ | `.motion-lab__cards` 单容器同时入场 |
| 5 | 卡片 opacity + blur + y | ✅ | 整组 `0→1` · `blur(8px→0)` · `y 8→0` · duration ×1.2 |
| 6 | 运动集中在 rig + mainVisual | ✅ | 移除 title/grain/light 位移；rig scale/y/rotate + mainVisual scale/x |
| 7 | 文字比图像动得更少 | ✅ | title/subtitle 仅 opacity，无 translateY |
| 8 | glow 降 50% | ✅ | candle opacity 区间减半；hover inset 5%→2.5% |
| 9 | 位移降 30% | ✅ | `motion-tokens` scale/y/parallax 全量 ×0.7 |
| 10 | 400ms 静止开场 | ✅ | 无 load tween；progress 0–10% rig 不动；hint 从 p1 才消 |
| 11 | 背景弱 grain + vignette | ✅ | `base-dark::after` grain；vignette opacity 0.84 |
| 12 | 无动画时第一屏成立 | ✅ | CSS 标题 opacity:1；暗场+书+框+尘静态可见 |

---

## 1. 是否 camera-driven？

### Camera movement（是）

| 元素 | 行为 |
|------|------|
| `.motion-lab__camera-rig` | scale 1.028→1.111→1.166→1.194；y 0→-4.2vh→-6.3vh→-7vh；rotate |
| `.motion-lab__main-visual` | scale 1→1.028→1.038→1.042；x parallax 0→-6px→-14px |

### 仍像 component animation（已压到最低）

| 元素 | 行为 | 判定 |
|------|------|------|
| `.motion-lab__cards` | 整组 opacity + blur + y 8→0 | **可接受** — 解释为桌缘纸条从景深浮出，非单卡排队 |
| `.motion-lab__title` / subtitle | 仅 opacity | **可接受** — 字不追镜头 |
| `.motion-lab__light` | 仅 opacity | **可接受** — 光线叙事 |

### 已删除的组件表演

- 标题 `translateY -8vh` 与 load fade-up
- 标题 / grain 反向 parallax 大位移
- 单卡 stagger、单卡独立 blur/y
- light x/y 位移
- `baseDark opacity > 1` settle hack
- 尘埃 infinite drift

---

## 2. 是否模板化？

| 检查项 | 结论 |
|--------|------|
| generic fade-up | **无**（标题首屏 CSS 即可见） |
| card stagger | **无** |
| SaaS hover | **弱** — 仅 border + 极弱 inset，无扫光 |
| 同速移动 | **改善** — 文字不动，镜头+主视觉动 |
| 不必要 scale | **无 hover scale**；镜头 scale ≤1.194 |
| 过度 glow | **降低** — candle max 0.16 |
| 为动而动 | **减少** — 删除 load/drift/grain 动画 |

---

## 3. 空间层次是否成立？

| 层 | 随 rig | 独立动画 | 速度 |
|----|--------|----------|------|
| L0 base + grain | 否 | 无 | 0 |
| L1 vignette | 否 | opacity 微调 | 0 |
| L2 main visual | 是 | scale + x（主运动） | **1.0** |
| L3 grain (rig内) | 是 | 无 | 贴附 |
| L4 dust | 是 | 无 | 静态 |
| L5 light | 是 | opacity only | 慢 |
| L6–7 文字 | 是 | opacity only | **最慢** |
| L8 cards | 是 | 整组浮现 | 中 |
| L9 frame | 否 | 无 | 0 |

---

## 4. 静态画面是否成立？

| 检查项 | 结论 |
|--------|------|
| 第一屏像海报 | **是** — 无 JS 亦有标题、书、暗角、画框 |
| 字体层级 | **是** |
| 留白张力 | **是** — 暗场上方大留白 |
| 主视觉是锚点 | **是** |
| 卡片像 UI 组件 | **改善** — 左下纵排纸条，首屏不可见 |

---

## 5. 时间感是否廉价？

| 检查项 | 结论 |
|--------|------|
| 太快 | **否** — 位移 -30%，scale 增量缩小 |
| 太弹 | **否** |
| 太平均 | **改善** — 主视觉与文字分层 |
| 同时出现 | **否** — 卡片整组一次 |
| 400ms 静止 | **是** — 无入场 tween + scroll 前 10% 镜头不动 |

---

## 6. 仍可删除或弱化（下一轮）

1. `.motion-lab__chrome-link` — 破坏海报完整度（P2）
2. 卡片 `y 8px` — 若仍觉 fade-up，可改为纯 opacity
3. rig 内 dust 层 — 与 base grain 重复，可只留一层
4. 副标题 scroll 段 — 可再晚 5% progress 出现
5. `filter: blur` on cards — layer-map 原则上反对 blur 假景深

---

## 7. 修改建议

### P0 — 无待办（本轮已完成）

### P1 — 无待办（本轮已完成）

### P2 — 可选

| # | 建议 | 文件 |
|---|------|------|
| 1 | 隐藏 chrome 链接 | `page.tsx` |
| 2 | 卡片浮现去掉 blur，仅 opacity | `bindCinematicTimeline.gsap.ts` |
| 3 | 合并 dust / grain 为一层 | `page.tsx` + CSS |
| 4 | 标题 load 无需任何 tween | 已达成 |
| 5 | 移动端卡片区再下移 4vh | `motion-lab.css` |

---

## 附录：保留的架构

- 单一 `ScrollTrigger` + `scrub` + `pin`
- `gsap.context` + `ctx.revert()`
- 数值来自 `motion-tokens.ts`
- rig 外固定：base / vignette / frame / hint
- reduced-motion 静帧对齐 settle 构图

**判断**：仍须实机滚动验收；若仍觉 template 感，下一刀应砍卡片 blur/y，而非加新动效。
