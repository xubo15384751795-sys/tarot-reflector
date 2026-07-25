# Motion Direction — `/motion-lab` Cinematic Scroll Prototype

> **性质**：camera-driven editorial scroll 实验，不是产品首页，不是组件动画展台。  
> **色彩**：沿用全站 `tokens.css` 语义色，本实验不定义新 palette。

---

## 1. 一句话方向

**摄影机从档案室暗处缓慢推近一张桌面上的书与牌——世界在动，观众在靠近，而不是元素轮流登场。**

---

## 2. 气质关键词

| 要有 | 不要 |
|------|------|
| 安静、克制、神秘 | 热闹、游戏感、抽卡爆闪 |
| 档案馆、阅读室、老纸张 | SaaS landing、Dashboard |
| 微弱金色烛光（opacity 级） | 霓虹 glow、大面积 blur |
| 连续镜头感（dolly / drift） | 卡片 fade-up、stagger slide-in |
| 真实摄影底图（书、牌） | 纯 CSS 模拟枝蔓/光池 |
| 单一时序主轴（camera rig） | 多元素各自 Timeline |

---

## 3. 镜头语言（Camera Grammar）

### 3.1 唯一运动主体：`camera-rig`

- 所有场景层作为 rig 子节点，**只由一条 ScrollTrigger scrub Timeline 驱动 rig 的 `transform` + 少量 `opacity`**。
- 禁止对 rig 内多个兄弟节点分别写 enter 动画。
- 允许：rig 整体 `scale` / `translate` / `rotate`（rotate 极小，≤ 1.5°）。
- 允许：烛光层仅 `opacity` 呼吸（振幅 ≤ 0.06），且与 scroll 相位绑定，不独立 loop。

### 3.2 缓动

- Scroll 绑定段：**linear（ease: `"none"`）**，保证 scrub 跟手。
- 非 scroll 的微交互（若有）：`power2.inOut`，禁止 `bounce`、`elastic`、`back`。

### 3.3 景别演进

```
远景（房间） → 中景（书桌） → 近景（书页） → 特写（牌面） → 停格（余韵）
```

观众应感觉「走近桌子」，而不是「换了一张幻灯片」。

---

## 4. 视觉资产原则

1. **书**：使用真实摄影（`public/images/stage-open-book.jpg`），禁止 SVG 假书。
2. **牌**：使用项目真实牌背/牌面资源，保留纸牌阴影，禁止 hover scale。
3. **纸**：噪点/颗粒用静态 overlay，不做闪烁粒子雨。
4. **字**：衬线 display（Noto Serif SC / 文楷），作为场景内物体（随 rig 移动），禁止独立 fade-up 标题动画。

---

## 5. 禁止清单（Hard No）

- ❌ 普通 fade-up card animation
- ❌ 每个卡片独立 slide in / stagger children
- ❌ SaaS bounce / spring 按钮
- ❌ 按钮 hover 放大（scale > 1）
- ❌ 大幅 scale（单段 rig scale 增量建议 ≤ 1.8× 总倍率）
- ❌ 所有元素同时动
- ❌ Framer Motion 与 GSAP 同时控制同一 DOM 的 transform
- ❌ 修改首页或主流程业务代码

---

## 6. 技术分工

| 工具 | 用途 |
|------|------|
| **GSAP + ScrollTrigger** | 唯一 scroll cinematic 主轴 |
| **CSS** | 层叠、遮罩、静态颗粒 |
| **Framer Motion** | 本实验不使用 |
| **Matter.js** | 不用于本页（保留 `/motion-lab/physics`） |

---

## 7. 无障碍

- `prefers-reduced-motion: reduce` → 取消 pin/scrub，展示 **Shot 04 静帧构图** + 可读说明文字。
- 保留键盘可聚焦的「退出实验 / GSAP 旧 demos」链接。

---

## 8. 成功标准（验收）

1. 全程仅感受到 **一个镜头在推进**，而非组件入场秀。
2. 滚动停止时画面稳定，无残余弹性。
3. 烛光与暗角始终克制，不抢书与牌。
4. 移动端可滚动完成全程（可降低 scrub 系数，不砍镜头顺序）。
5. Lighthouse 交互区无 layout thrash（仅 transform/opacity）。
