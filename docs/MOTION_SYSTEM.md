# Motion System — 阈牌动效体系

## 动效原则

1. **连续动作** — 所有界面变化都必须是连续动作，而不是状态截图切换。用户操作后看到的是运动过程，不是结果跳跃。

2. **轻应回应** — 用户靠近元素时，元素应轻轻回应。hover 是微风拂过，不是闪光灯。pointermove 跟随是影子跟随，不是磁铁吸附。

3. **从牌面生长** — 牌面元素的解释应该像从牌面上"长出来"，不是像目录点击后展示说明。线条从 hotspot 生长，popover 从牌面附近浮现。

4. **纸牌物理感** — 动效要柔和、克制、有纸牌物理感。牌有重量、有阴影、有纸面摩擦。不是塑料卡片，不是玻璃弹珠。

5. **不做游戏感** — 不做游戏抽卡感，不做爆闪，不做廉价粒子，不做转盘，不做掉落特效。

---

## GSAP 与 Framer Motion 分工

### Framer Motion 负责（声明式）

- 页面级状态切换（AnimatePresence mode="wait"）
- stage 切换（ReadingStageRouter）
- 简单 modal / card mount-unmount
- layoutId 共享布局
- 普通 fade / y / scale 过渡
- 档案库网格 stagger 进入

### GSAP 负责（命令式，精细控制）

- 抽牌 timeline（`tarotCardReveal.gsap.ts`）
- 牌背 → 翻牌 → 牌面落下
- hotspot stagger 出现（`motifHotspot.gsap.ts`）
- 牌面符号 hover / active 交互
- SVG 手写线条绘制（`handwrittenLine.gsap.ts`）
- cursor glow quickTo（`useCursorGlow.ts`）
- 流沙 / 烫金微光层（`luminousLayer.ts`）
- 演示模式中的固定时间轴

### 禁止事项

- **禁止** 在同一个 DOM 元素上同时用 Framer Motion 和 GSAP 控制 transform / opacity
- **禁止** 用 GSAP 动画 width / height / top / left
- **禁止** 用 setTimeout 串复杂动画
- **禁止** 让抽牌动画等待 AI API 返回
- **禁止** 滥用 backdrop-filter / blur 导致掉帧

---

## Motion Tokens

### Framer Motion

```ts
easeSoft = [0.22, 1, 0.36, 1]
easeGentle = [0.16, 1, 0.3, 1]
springCard = { type: "spring", stiffness: 90, damping: 18, mass: 0.9 }
springSmall = { type: "spring", stiffness: 160, damping: 20, mass: 0.7 }
```

### GSAP

```
power2.out        — 默认柔和
power2.inOut      — 渐入渐出
power3.out        — 平滑
expo.out          — 极少数高级过渡，不要滥用
```

### Duration

```
instant:  0.15s
fast:     0.25s
normal:   0.4s
slow:     0.7s
reveal:   1.05s
cardReveal: 1.5s
```

---

## 性能原则

1. **transform + opacity** — 动画优先使用 transform 和 opacity，避免 layout trigger。
2. **图片预加载** — reveal 前必须 preload + decode，避免翻牌时白屏。
3. **quickTo** — cursor glow 用 CSS variables + gsap.quickTo，不要用 React setState 追踪鼠标。
4. **prefers-reduced-motion** — 关闭复杂动效、流沙、追光、长 timeline。
5. **移动端禁用** — 鼠标追光在 touch device 上禁用。
6. **will-change** — 仅对即将动画的元素添加，动画完成后移除。

---

## 文件结构

```
src/features/motion/
├── motionTokens.ts          # 统一动效参数
├── useReducedMotion.ts      # prefers-reduced-motion hook
├── preloadImage.ts          # 图片预加载工具
├── useCursorGlow.ts         # 鼠标追光 hook
├── tarotCardReveal.gsap.ts  # 抽牌 timeline
├── motifHotspot.gsap.ts     # 牌面 hotspot 动画
├── handwrittenLine.gsap.ts  # SVG 手写线条
├── luminousLayer.ts         # 流沙微光层
└── index.ts                 # 公共 API
```

---

## 档案 Motif 标注（Phase 1 / 2）

| 阶段 | 行为 |
|------|------|
| Phase 1 | 三栏 grid：左/右边注 + 中央牌面；`MotifNote` 仅 active 展开 `meaning_zh`；无默认连接线 |
| Phase 2 | 仅 hover/active 时画 **一条** SVG；端点由 `measureMotifConnectorPoints` 从 `data-motif-anchor` / `data-motif-note` DOM 实测 |
| 移动端 | 不画线；牌面 + 下方边注列表 |
| reduced-motion | 跳过连接线绘制 |

实现：`MotifCanvas.tsx`、`useMotifConnector.ts`、`motifConnectorPath.ts`。调试：`/archive?debugMotifs=1`。
