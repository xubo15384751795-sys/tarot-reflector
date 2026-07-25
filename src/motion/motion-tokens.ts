/**
 * Motion Tokens — 全站动效唯一数值源（GSAP + CSS）
 *
 * 规则：
 * - 组件 / 页面 / timeline 只引用本文件，禁止随手写 duration / ease / 位移 / 透明度。
 * - 禁止 bounce、elastic 及过冲弹簧类 easing。
 * - Scroll-scrub 段使用 easing.camera（"none"）。
 */

// ─── 1. Duration（秒，GSAP `duration`）────────────────────────

export const duration = {
  /** 即时反馈：focus ring、极短 opacity */
  instant: 0.15,
  /** 微交互：边框色、烛光 hover */
  micro: 0.22,
  /** 快速：chrome 链接、句间 opacity 交叉 */
  fast: 0.28,
  /** 常规：非 scroll 面板过渡 */
  normal: 0.42,
  /** 慢：手写线、次要揭示 */
  slow: 0.72,
  /** 镜头：整段 cinematic 段落（非单 tween 时长，供参考上限） */
  cinematic: 1.2,
} as const;

// ─── 2. Easing ───────────────────────────────────────────────

/** GSAP 缓动字符串 */
export const easeGsap = {
  /** 默认 UI 过渡 */
  standard: "power2.out",
  /** 柔和收尾 */
  soft: "power3.out",
  /** 入场（非 scroll）：克制，无回弹 */
  entrance: "power3.out",
  /** 退场 */
  exit: "power2.in",
  /** ScrollTrigger scrub / 镜头位移：线性跟手 */
  camera: "none",
  /** Hover：极轻，避免「按钮感」 */
  hover: "power2.inOut",
} as const;

/** CSS `transition-timing-function` / Framer cubic-bezier */
export const easeCss = {
  standard: "cubic-bezier(0.22, 1, 0.36, 1)",
  soft: "cubic-bezier(0.16, 1, 0.3, 1)",
  entrance: "cubic-bezier(0.16, 1, 0.3, 1)",
  exit: "cubic-bezier(0.4, 0, 0.6, 1)",
  camera: "linear",
  hover: "cubic-bezier(0.45, 0, 0.55, 1)",
} as const;

/** Framer Motion 用 bezier 元组 */
export const easeBezier = {
  standard: [0.22, 1, 0.36, 1] as const,
  soft: [0.16, 1, 0.3, 1] as const,
  entrance: [0.16, 1, 0.3, 1] as const,
  exit: [0.4, 0, 0.6, 1] as const,
  hover: [0.45, 0, 0.55, 1] as const,
} as const;

export const easing = {
  gsap: easeGsap,
  css: easeCss,
  bezier: easeBezier,
} as const;

// ─── 3. Distance（px；camera 类为 vh 字符串供 GSAP 直接使用）────

export const distance = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 24,
  /** 镜头位移硬顶（见 docs/scroll-shot-list.md；已 ×0.7 纠偏） */
  camera: {
    /** 主视觉 translateY 上限 */
    mainYMax: "-4.2vh",
    /** 主视觉累计 translateY 硬顶 */
    mainYTotalMax: "-7vh",
    /** 标题 translateY 硬顶 */
    titleYMax: "-7vh",
    /** 卡片浮现 translateY（深处浮出，非 fade-up） */
    cardEmergenceMax: 8,
    /** 书页 parallax 反向位移上限（px） */
    bookParallaxMax: 14,
    /** rig translateX 上限（px） */
    rigXMax: 24,
  },
} as const;

// ─── 4. Opacity ──────────────────────────────────────────────

export const opacity = {
  hidden: 0,
  faint: 0.35,
  muted: 0.55,
  visible: 1,
} as const;

/** 镜头文案 / 烛光等场景专用范围（仍须引用 opacity.* 为端点） */
export const opacityRange = {
  candle: { min: 0.06, max: 0.16 },
  title: { start: 1, mid: 0.45, end: 0.85 },
  subtitle: { max: 0.55 },
  cards: { emerge: { from: opacity.hidden, to: opacity.visible } },
  grain: { min: 0.015, max: 0.028 },
  dust: { min: 0.1, max: 0.35 },
} as const;

// ─── 5. Blur（px，`filter: blur()`）──────────────────────────

export const blur = {
  none: 0,
  soft: 4,
  medium: 8,
  deep: 12,
} as const;

// ─── 6. Scale ────────────────────────────────────────────────

export const scale = {
  /** 静止 */
  still: 1,
  /** Hover 硬顶（禁止超过） */
  hover: 1.02,
  /** 镜头起点（Scene 01–02） */
  cameraStart: 1.028,
  /** 镜头终点（Scene 04 settle，已 ×0.7 纠偏） */
  cameraEnd: 1.194,
} as const;

/** 镜头 scale 中间关键帧（已 ×0.7 纠偏） */
export const scaleCamera = {
  pushEnd: 1.111,
  emergenceEnd: 1.166,
} as const;

// ─── 7. z-index（与 docs/layer-map.md 对齐）────────────────────

export const zIndex = {
  base: 0,
  atmosphere: 10,
  image: 20,
  light: 50,
  text: 60,
  cards: 80,
  frame: 90,
} as const;

// ─── Scroll / Cinematic 元数据（非 easing，供 timeline 配置）──

export const scroll = {
  /** 建议页面总高（vh） */
  trackVhMin: 220,
  trackVhDefault: 260,
  trackVhMax: 300,
  /** ScrollTrigger scrub 系数（跟手，略带惯性） */
  scrub: 0.8,
  /** 加载后静止（ms），Scene 01 */
  loadHoldMs: 400,
} as const;

export const shotProgress = {
  stillOpeningEnd: 0.1,
  cameraPushEnd: 0.38,
  archiveEmergenceEnd: 0.68,
  settleEnd: 1,
} as const;

// ─── 聚合导出 ────────────────────────────────────────────────

export const motionTokens = {
  duration,
  easing,
  easeGsap,
  easeCss,
  easeBezier,
  distance,
  opacity,
  opacityRange,
  blur,
  scale,
  scaleCamera,
  zIndex,
  scroll,
  shotProgress,
} as const;

export type MotionTokens = typeof motionTokens;
export type EaseGsapKey = keyof typeof easeGsap;
export type DurationKey = keyof typeof duration;
