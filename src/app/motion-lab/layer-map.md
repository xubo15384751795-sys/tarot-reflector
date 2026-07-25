# Layer Map — Cinematic Stage (`/motion-lab`)

> DOM 从内到外。所有层位于 **`.camera-rig`** 内，随摄影机统一运动。  
> z-index 相对于 rig 本地堆叠。

---

## 结构树

```
.cinematic-root
├── .cinematic-scroll-track          # 滚动高度占位（不动画）
└── .cinematic-viewport              # position: fixed while pinned
    └── .camera-rig                  # ★ 唯一 GSAP transform 目标
        ├── [L0] .layer-void
        ├── [L1] .layer-book-photo
        ├── [L2] .layer-paper-grain
        ├── [L3] .layer-vignette
        ├── [L4] .layer-candle-pool
        ├── [L5] .layer-card
        ├── [L6] .layer-archive-slip
        ├── [L7] .layer-caption
        └── [L8] .layer-film-edge      # 可选：极淡暗角边框
    └── .cinematic-chrome              # rig 外 — 不随镜头 scale
        ├── .chrome-scroll-hint
        └── .chrome-exit-link
```

---

## 分层说明

| ID | 类名 | 内容 | 材质 | 动画属性 | 备注 |
|----|------|------|------|----------|------|
| **L0** | `layer-void` | 深棕黑房间底色 | `var(--bg-base)` 渐变 | 无独立动画 | 上下渐隐，托住摄影 |
| **L1** | `layer-book-photo` | 真实书页摄影 `next/image` | JPEG | 随 rig | `object-position: 50% 70%` |
| **L2** | `layer-paper-grain` | 纸纤维噪点 | SVG noise / body 同款 | 随 rig | opacity 0.03–0.05 |
| **L3** | `layer-vignette` | 档案室暗角 | radial-gradient | 随 rig | 压四角，不糊中心 |
| **L4** | `layer-candle-pool` | 微弱金烛光 | radial-gradient `var(--candlelight)` | rig + **opacity** | 禁止 blur > 12px |
| **L5** | `layer-card` | 真实塔罗牌背 | `CARD_BACK_PATH` + shadow | 随 rig | 位于书页右上方，物理阴影 |
| **L6** | `layer-archive-slip` | 纸签条「ARCH.00」 | 半透明纸 + 细线框 | 随 rig | 非 StatusPill 组件 |
| **L7** | `layer-caption` | 镜头文案（一句） | Noto Serif SC | 随 rig | 字随景走，不单独 fade-up |
| **L8** | `layer-film-edge` | 胶片边暗角 | inset box-shadow | 固定 opacity | 增强 editorial 画框感 |

---

## Chrome 层（不在 rig 内）

| 元素 | 行为 |
|------|------|
| `chrome-scroll-hint` | 固定视口底部，opacity 随 scroll 0→8% 淡出，**不 scale** |
| `chrome-exit-link` | 左上角链接至 `/motion-lab/gsap`，无 hover 放大 |

---

## Transform 归属（防冲突）

| 节点 | GSAP | CSS transition | Framer |
|------|------|----------------|--------|
| `.camera-rig` | ✅ translate / scale / rotate | ❌ | ❌ |
| `.layer-candle-pool` | ✅ opacity only | ❌ | ❌ |
| `.chrome-*` | ✅ opacity only | color 150ms | ❌ |
| 子层 L0–L8 | ❌ | ❌ | ❌ |

---

## 深度与视差（可选，极轻）

若需加强空间感，仅允许：

- L1 书页：相对 rig **反向 translate 2–4%**（在 timeline 后半段），模拟近大远小。
- 幅度上限：±24px @ 1440w。

禁止多层不同速度大幅视差（会碎裂镜头感）。

---

## 资产清单

| 资产 | 路径 |
|------|------|
| 书页摄影 | `/images/stage-open-book.jpg` |
| 牌背 | `CARD_BACK_PATH`（与首页一致） |
| 字体 | 继承 `layout.tsx` 已加载 Noto Serif SC |
