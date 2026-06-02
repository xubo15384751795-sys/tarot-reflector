# Physical Motion 验收报告

生成日期：2026-06-02

## 1. GSAP 用在了哪些地方？

| 场景 | 模块 |
|------|------|
| 抽牌 reveal 时间轴 | `tarotRevealTimeline.ts` |
| 档案 hotspot stagger / hover / 高亮 / popover | `motifHotspot.gsap.ts`, `motifHighlight.gsap.ts` |
| 牌面柔光高亮 | `motifHighlight.gsap.ts` |
| Motif 手写连接线 | `handwrittenLine.gsap.ts`, `motifConnector.gsap.ts`, `drawSvg.gsap.ts` |
| Cursor glow `--mx` / `--my` | `useCursorGlow.ts`, `useFoilSpotlight.ts`（quickTo） |
| 模式 / 牌阵 Flip | `modeFlip.gsap.ts`, `spreadFlip.gsap.ts` |
| 档案 TabBar 指示器 | `archiveTabBar.gsap.ts` |
| SplitText / ScrambleText | `splitText.gsap.ts`, `scrambleText.gsap.ts` |
| Motion Lab 演示 | `/motion-lab` |

## 2. Framer Motion 仍用在哪些地方？

| 场景 | 说明 |
|------|------|
| 阅读 / 档案 stage 切换 | `pageTransition`（opacity + y + blur） |
| `TarotCardStage` 初次 mount | spring 入场，不与 reveal timeline 叠在同一属性 |
| 笔记展开、SavePanel、部分 overlay | layout / AnimatePresence |
| `CardDeck` 背景层 | 装饰 blur（非 hotspot） |

## 3. 同一元素是否被 GSAP + Framer 同时控制 transform / opacity？

- **抽牌 `CardReveal`**：翻牌 transform 仅 GSAP；外层无 Framer。
- **档案 hotspot**：transform/opacity 由 GSAP；已移除 highlight 的 `motion.div`。
- **`TarotCardStage`**：仅 mount 时 Framer 动画一次；之后静态。若与 GSAP 同页并存，勿对同一节点重复驱动。
- **模式卡**：Flip（GSAP）+ CSS `physical-card` hover；Framer 不控 transform。

## 4. 抽牌 reveal 是否不等待 AI？

是。`CardReveal` 在 `preloadImage` 完成后启动 timeline，`onComplete` 由阅读状态机处理；不绑定 `/api/reading`。

## 5. 牌面是否 preload / decode？

是。`CardReveal` 调用 `preloadImage(image)` 后再 `useGSAP` 播放。

## 6. 首页 hover 是否有轻微物理反馈？

是。`mode-card` + `physical-card` + `interactive-glow`（y -2px、scale 1.008、tap 0.985）。

## 7. 档案库 hotspot 是否像靠近牌面？

是。金点叠在牌面 `card-frame` 内，stagger 从中心扩散；高亮为柔光 radial，非目录项。

## 8. 手写线条是否替代箭头？

是。`motif-connector` SVG path + DrawSVG / stroke-dashoffset，圆角线帽。

## 9. cursor glow 是否使用 gsap.quickTo？

是。`useCursorGlow` / `useFoilSpotlight` 使用 `gsap.quickTo` 更新 CSS 变量。

## 10. prefers-reduced-motion 是否生效？

是。`useReducedMotion` + CSS `@media (prefers-reduced-motion: reduce)` 关闭 glow、physical-card、hotspot 呼吸等。

## 11. 移动端是否禁用 cursor glow？

是。`(pointer: coarse)` 与 `(pointer: fine)` 检测；CSS 隐藏 `interactive-glow::before`。

## 12. 是否有过度粒子 / 爆闪 / 游戏抽卡感？

已克制：无稀有度光效、无全屏粒子；暖金低透明光晕；翻牌 ~1s。

## 13–15. 构建验证

运行：

```bash
npm run typecheck && npm run test && npm run build
```

（由 CI/本地最后一次执行结果为准。）

## Motion Lab

- `/motion-lab` — reveal、hotspot、线条、cursor glow
- `/motion-lab/physics` — Matter.js 占位（不进入主流程）
