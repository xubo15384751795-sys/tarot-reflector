# Scroll Shot List

> **页面总高**：`260vh`（建议值，落在 220vh–300vh 区间内）  
> **绑定方式**：单一 master timeline，`scrub` 跟手，scroll 段 `ease: none`  
> **气质**：摄影机进入安静档案空间，不是页面组件轮流展示。

---

## Scene 01: Still Opening

**Scroll range:** `0% – 10%`

**Visual:**  
房间几乎全暗，仅桌面区域隐约可见。真实书页摄影占画面下三分之一，塔罗牌背贴在纸上，体积小、对比度低。四周暗角重，像站在门口还没走进去。画框细线可见，scroll hint 在底部。archive cards **尚未存在**于观众知觉中（opacity `0`）。

**Camera:**  
`camera-rig` 静止。页面加载后 **额外静止 400ms**（无 scrub 位移），让画面先「落座」再接受滚动。scroll progress `0–10%` 期间 rig 仍保持：`scale 1.04` · `x 0` · `y 0` · `rotate 0°`。不提前推拉。

**Main image:**  
书与牌同框，整体偏暗（等效压暗约 `8–12%`），`object-position` 偏下。牌背清晰可辨轮廓，但不抢视线。无 parallax。

**Typography:**  
Hero title 显示首句（如「档案室」），`opacity 1`，位置稳定，`translateY 0`。Subtitle 隐藏。字随 rig 但本段 rig 不动，故字亦不动。

**Light:**  
烛光层 `opacity ≈ 0.14`，范围窄，落在左上外缘。不闪烁，不呼吸循环。

**Dust / grain:**  
Grain `opacity 0.03`，静态。Dust 12–18 粒，静态或极慢 drift（单粒 ≤ `4px / 24s`），合成后几乎不可数。

**Cards:**  
Archive choice cards **不可见**（`opacity 0`，无 blur，无位移）。禁止预载位置 ghost。

**User feeling:**  
「我还没开始，但已经在门外了。」重量感、安静、略紧绷的期待——像博物馆闭馆前最后一分钟走进展厅。

---

## Scene 02: Camera Push

**Scroll range:** `10% – 38%`

**Visual:**  
镜头开始缓慢推近书桌。书页纹理逐渐可读，纸边高光变明显。牌背变大但仍非唯一焦点。暗角在知觉上略收紧（主要靠光线变亮，而非暗角层移动）。仍是 **一个连续镜头**，无切镜。

**Camera:**  
**本段唯一主运动。** `camera-rig`：  
- `scale`：`1.04 → 1.14`（硬顶，禁止超过）  
- `translateY`：`0 → -6vh`（硬顶，禁止超过）  
- `translateX`：`0 → -1.5vw`（极微，模拟推轨偏轴）  
- `rotate`：`0° → -0.4°`（几乎不可察觉）  

**Main image:**  
随 rig 推进；书页可附加 **反向 parallax** `translateX` 至多 `-12px`（速度约为 rig 的 `15%`），增强浅景深。牌与书 **无独立 scale**，禁止牌单独弹出。

**Typography:**  
Hero title：  
- `translateY`：`0 → -10vh`（硬顶）  
- `opacity`：`1 → 0.45`  
- 句间切换（若有多句）：仅 opacity 交叉，**禁止 fade-up**  

Subtitle：仍隐藏或 `opacity ≤ 0.15`，不抢主句消退。

**Light:**  
`opacity`：`0.14 → 0.24`，随推近略亮。光斑不 scale，不扫动。

**Dust / grain:**  
Grain 随 rig 微移（≤ `6px` 等效）。Dust 随 rig ≤ `8px`；opacity 总上限 `0.3`。不得比书页更抢眼。

**Cards:**  
**仍不可见。** `opacity 0`。本段任何时刻禁止卡片入场预览。

**User feeling:**  
「我在靠近桌子。」身体前倾的错觉，脚步变慢，呼吸变轻。不是「下一屏要来了」。

---

## Scene 03: Archive Emergence

**Scroll range:** `38% – 68%`

**Visual:**  
桌面成为中景：书页展开区域清晰。牌背位于构图黄金分割附近。三张 archive cards 像从纸面深处 **浮现**，不是从屏幕底部滑入。卡片材质偏纸签，非玻璃 SaaS 卡。

**Camera:**  
推轨继续但 **减速**（同 progress 增量下位移变少）：  
- `scale`：`1.14 → 1.22`（增量小于 Scene 02）  
- `translateY`：`-6vh → -9vh`（累计仍 ≤ `-10vh` 硬顶）  
- `rotate`：`-0.4° → -0.8°`  

**Main image:**  
书页纹理、折痕、牌背烫金/纹路可读。Parallax 收束至 `-16px` 累计（相对 rig）。

**Typography:**  
Hero title 切换为近景句（如「一页尚未翻开的记录」），`opacity` 在 `0.45 – 0.75` 区间随句位调整；`translateY` 累计不超过 `-10vh`。  
Subtitle 渐显：`opacity 0 → 0.5`，**无 y 动画**。

**Light:**  
`opacity`：`0.24 → 0.30`，峰值接近但不超越 Scene 04 前的高点。

**Dust / grain:**  
Grain `0.03 – 0.04` 恒定。Dust opacity 略降（`0.25` 上限），避免干扰卡片阅读。

**Cards:**  
**本段才允许出现。** 整组与单卡规则：  
- `opacity`：`0 → 1`（禁止 stagger slide-in）  
- `filter: blur`：`8px → 0`（禁止 blur > `8px`）  
- `translateY`：`6px → 0`（从略深处浮出，**累计不超过 12px**，禁止从视口底外飞入）  
- 三张 **同时** 遵循同一曲线，可有 ≤ `0.02` progress 的微弱时间差，但不可肉眼分辨为「排队入场」  

Hover 本段不强调（scroll 为主）。

**User feeling:**  
「原来桌上还有选择。」不是菜单弹出，是目光扫到桌缘便签。好奇但不被催促。

---

## Scene 04: Settle

**Scroll range:** `68% – 100%`

**Visual:**  
镜头几乎停住，留一格余韵。牌面成为稳定锚点，archive cards 完全可读。背景 **略暗**（整体环境压暗约 `5–8%`），光线 **更集中**于书页与牌（烛光 opacity 略升但范围更窄）。像摄影师推到最后一张定稿。

**Camera:**  
速度 **明显变慢**：  
- `scale`：`1.22 → 1.26`（整段仅 `+0.04`）  
- `translateY`：`-9vh → -10vh`（逼近硬顶后停止）  
- `translateX` / `rotate` 微调至静止  

progress `92–100%` 为 **hold**：rig 数值不变。

**Main image:**  
清晰、稳定。牌背细节可读，书页不再继续「冲过来」。

**Typography:**  
Hero title 末句（如「阈牌 · 档案馆」），`opacity`：`0.75 → 0.85` 后恒定。  
Subtitle 可降至 `opacity 0.35` 或淡出，把阅读权让给 cards。

**Light:**  
`opacity`：`0.30 → 0.28`（略收总量），但 gradient **半径缩小 5–8%**，知觉上「光更聚在纸面」。背景 L0/L1 知觉更暗，由 L5 与 L1 微调 opacity 完成，**不移动图层**。

**Dust / grain:**  
Dust 降至 `opacity 0.15` 或静态。Grain 维持 `0.03`，不增。

**Cards:**  
`opacity 1`，`blur 0`，`translateY 0`。对比度略提（边框 `border-strong` 清晰度 +5%），**可读性优先**。Hover：仅边框色温 + 光线微变，**scale ≤ 1.02**。

**User feeling:**  
「我可以停在这里。」安静、确定、无推销感。像读完展签后多站了三秒。

---

## 全局时间轴摘要

| Scene | Scroll | 主事件 | Cards |
|-------|--------|--------|-------|
| 01 Still Opening | 0–10% | 加载后 400ms 静止 + 暗场建立 | 隐藏 |
| 02 Camera Push | 10–38% | scale 1.04→1.14 · Y ≤ -6vh · title 退 | 隐藏 |
| 03 Archive Emergence | 38–68% | 减速推轨 · cards 从深处浮现 | 0→1 · blur 8→0 |
| 04 Settle | 68–100% | 慢停 · 背景略暗 · 光更聚 | 可读稳定 |

---

## 硬约束核对

| 约束 | 落点 |
|------|------|
| 0–10% 不急着动 | Scene 01 + 400ms load hold |
| 10–38% camera push | Scene 02 数值 |
| title translateY ≤ -10vh | Scene 02–04 累计硬顶 |
| 38–68% cards 才出现 | Scene 03 |
| cards 禁止 bottom slide-in | Scene 03 仅 opacity / blur / ≤12px Y |
| 68–100% settle 变慢 | Scene 04 增量与 hold |
| 像摄影机进档案空间 | 单 rig · 无组件 stagger |

---

## Reduced Motion 静帧

展示 **Scene 04 末尾** 构图（progress `100%`）：

- Camera：`scale 1.26` · `y -10vh` · `rotate -0.8°`  
- Title：末句 `opacity 0.85`  
- Cards：全可见 `opacity 1` · `blur 0`  
- Light：`opacity 0.28` 聚光  
- 附一句：「已为你暂停镜头运动」

---

## 失败信号（滚动时）

- Scene 01 未满 400ms 就开始明显位移  
- Scene 02 出现 cards 或 title bounce  
- Scene 03 cards 从屏幕底外飞入或 stagger 弹入  
- Scene 04 仍在快速 scale 或全体元素同步滑走  
- 任意段像「切换组件」而非「同一房间里的镜头」
