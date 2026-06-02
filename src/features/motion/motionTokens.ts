/**
 * Motion System Tokens — single source for GSAP + Framer Motion.
 */

export const motionTokens = {
  easeSoft: [0.22, 1, 0.36, 1] as const,
  easeGentle: [0.16, 1, 0.3, 1] as const,

  gsapEaseSoft: "power2.out",
  gsapEaseInOut: "power2.inOut",
  gsapEaseStrong: "power3.out",

  cardSpring: {
    type: "spring" as const,
    stiffness: 90,
    damping: 18,
    mass: 0.9,
  },

  smallSpring: {
    type: "spring" as const,
    stiffness: 160,
    damping: 20,
    mass: 0.7,
  },

  durations: {
    hover: 0.18,
    micro: 0.24,
    panel: 0.42,
    page: 0.48,
    cardReveal: 1.55,
    cardFlip: 1.05,
    lineDraw: 0.55,
  },
} as const;

// ─── Framer Motion (aliases) ─────────────────────────────────

export const easeSoft = motionTokens.easeSoft;
export const easeGentle = motionTokens.easeGentle;

export const springCard = motionTokens.cardSpring;
export const springSmall = motionTokens.smallSpring;

export const springSnappy = {
  type: "spring" as const,
  stiffness: 200,
  damping: 24,
  mass: 0.6,
};

// ─── GSAP (aliases) ───────────────────────────────────────────

export const gsapEase = {
  soft: motionTokens.gsapEaseSoft,
  gentle: motionTokens.gsapEaseInOut,
  smooth: motionTokens.gsapEaseStrong,
  snappy: motionTokens.gsapEaseStrong,
  dramatic: "expo.out",
} as const;

export const duration = {
  instant: 0.15,
  fast: motionTokens.durations.micro,
  normal: motionTokens.durations.panel,
  slow: motionTokens.durations.lineDraw,
  reveal: motionTokens.durations.cardFlip,
  cardReveal: motionTokens.durations.cardReveal,
  hover: motionTokens.durations.hover,
  micro: motionTokens.durations.micro,
  panel: motionTokens.durations.panel,
  page: motionTokens.durations.page,
  lineDraw: motionTokens.durations.lineDraw,
} as const;

export const stagger = {
  fast: 0.04,
  normal: 0.08,
  slow: 0.15,
  card: 0.12,
} as const;

export const motionColors = {
  goldGlow: "rgba(185, 149, 82, 0.24)",
  goldHighlight: "rgba(185, 149, 82, 0.38)",
  lineLight: "rgba(150, 105, 38, 0.52)",
  lineDark: "rgba(198, 161, 92, 0.58)",
  cardShadow: "rgba(0, 0, 0, 0.35)",
  cardShadowReveal: "rgba(0, 0, 0, 0.55)",
} as const;

/** Framer page / stage transition */
export const pageTransition = {
  initial: { opacity: 0, y: 10, filter: "blur(8px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -8, filter: "blur(6px)" },
  transition: {
    duration: motionTokens.durations.page,
    ease: motionTokens.easeSoft,
  },
} as const;
