/**
 * Motion Lab — Cinematic Scroll Tokens
 * 仅用于 /motion-lab camera-driven 实验，不污染主站 motionTokens。
 */

export const cinematicMotion = {
  /** ScrollTrigger pin 区高度（相对视口倍数） */
  scrollTrackVh: 4,

  /** scrub 滞后系数 — 略大于 1 有摄影机惯性 */
  scrub: 1.1,

  /** 主镜头缓动 — scroll 段必须线性 */
  scrollEase: "none" as const,

  /** 非 scroll 微交互（chrome 链接等） */
  chromeEase: "power2.inOut" as const,
  chromeDuration: 0.28,

  /** 相机变换上限（防过度） */
  camera: {
    scaleMin: 1,
    scaleMax: 1.88,
    rotateMaxDeg: 1.2,
    translateMaxPx: 80,
  },

  /** 烛光层 opacity 范围 */
  candle: {
    min: 0.12,
    max: 0.32,
  },

  /** 可选极轻书页视差（相对 rig） */
  parallax: {
    bookMaxPx: 20,
  },

  /** 镜头关键帧 — 对应 scroll-shot-list.md */
  shots: {
    establishing: {
      progress: 0,
      scale: 1,
      x: 0,
      y: 40,
      rotate: 0,
      candle: 0.12,
      caption: "档案室",
      captionOpacity: 0.35,
    },
    approach: {
      progress: 0.18,
      scale: 1,
      x: 0,
      y: 40,
      rotate: 0,
      candle: 0.12,
      caption: "档案室",
      captionOpacity: 0.35,
    },
    approachEnd: {
      progress: 0.38,
      scale: 1.28,
      x: -12,
      y: 10,
      rotate: 0,
      candle: 0.22,
      caption: "靠近桌面",
      captionOpacity: 0.55,
    },
    desk: {
      progress: 0.58,
      scale: 1.55,
      x: 20,
      y: -20,
      rotate: -0.6,
      candle: 0.28,
      caption: "一页尚未翻开的记录",
      captionOpacity: 0.7,
      slipOpacity: 0.85,
    },
    card: {
      progress: 0.78,
      scale: 1.82,
      x: 35,
      y: -55,
      rotate: -1.2,
      candle: 0.32,
      caption: "牌在纸上，问题在暗处",
      captionOpacity: 0.88,
      slipOpacity: 0.85,
    },
    archive: {
      progress: 0.92,
      scale: 1.88,
      x: 28,
      y: -50,
      rotate: -1.2,
      candle: 0.26,
      caption: "阈牌 · 档案馆",
      captionOpacity: 0.75,
      slipOpacity: 0.7,
    },
    rest: {
      progress: 1,
      scale: 1.88,
      x: 28,
      y: -50,
      rotate: -1.2,
      candle: 0.26,
      caption: "阈牌 · 档案馆",
      captionOpacity: 0.75,
      slipOpacity: 0.7,
    },
  },

  /** reduced-motion 静帧 */
  reducedMotionFrame: {
    scale: 1.72,
    x: 32,
    y: -48,
    rotate: -1,
    candle: 0.3,
    caption: "牌在纸上，问题在暗处",
    captionOpacity: 0.88,
    slipOpacity: 0.85,
  },
} as const;

export type CinematicShotKey = keyof typeof cinematicMotion.shots;
