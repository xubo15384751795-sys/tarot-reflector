import { gsap } from "gsap";
import { gsapEase } from "./motionTokens";
import { animateSplitReveal } from "./splitText.gsap";
import "./gsapRegister";

export interface TarotRevealTargets {
  cardBack: HTMLElement;
  cardFront: HTMLElement;
  cardName: HTMLElement;
  groundShadow?: HTMLElement | null;
  warmGlow?: HTMLElement | null;
  cardNameZhEl?: HTMLElement | null;
}

export interface TarotRevealOptions {
  onComplete?: () => void;
  reducedMotion?: boolean;
}

/**
 * TarotRevealTimeline — 抽牌物理感（~1.55s，不等待 AI）
 *
 * 0.00 牌背进入 → 0.20 轻浮动 → 0.45 抽出 → 0.75–1.05 翻牌 →
 * 1.25 落下 → 1.40 接触阴影 → 1.55 牌名淡入
 */
export function createTarotRevealTimeline(
  targets: TarotRevealTargets,
  options: TarotRevealOptions,
): gsap.core.Timeline {
  const {
    cardBack,
    cardFront,
    cardName,
    groundShadow,
    warmGlow,
    cardNameZhEl,
  } = targets;
  const { onComplete, reducedMotion } = options;

  const tl = gsap.timeline({
    onComplete,
    defaults: { ease: gsapEase.soft },
  });

  if (reducedMotion) {
    tl.set(cardBack, { autoAlpha: 0 })
      .set(cardFront, { autoAlpha: 1, rotationY: 0, y: 0, scale: 1, rotation: 0 })
      .set(cardName, { autoAlpha: 1 });
    if (cardNameZhEl) gsap.set(cardNameZhEl, { autoAlpha: 1 });
    if (groundShadow) gsap.set(groundShadow, { autoAlpha: 1 });
    if (warmGlow) gsap.set(warmGlow, { autoAlpha: 1 });
    return tl;
  }

  gsap.set(cardFront, {
    autoAlpha: 0,
    rotationY: 180,
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
  });
  gsap.set(cardBack, { rotationY: 0, x: 0, y: 0, scale: 1, rotation: 0 });
  if (groundShadow) gsap.set(groundShadow, { autoAlpha: 0.55, scale: 0.92 });
  if (warmGlow) gsap.set(warmGlow, { autoAlpha: 0.7 });

  // 0.00 — 牌背进入
  tl.fromTo(
    cardBack,
    { autoAlpha: 0, y: 18, scale: 0.96 },
    { autoAlpha: 1, y: 0, scale: 1, duration: 0.35 },
    0,
  );

  // 0.20 — 轻微浮动
  tl.to(cardBack, { rotation: -2, duration: 0.12, ease: "sine.inOut" }, 0.2)
    .to(cardBack, { rotation: 1, duration: 0.12, ease: "sine.inOut" }, 0.32)
    .to(cardBack, { rotation: -1, duration: 0.1, ease: "sine.inOut" }, 0.44);

  // 0.45 — 抽出
  tl.to(
    cardBack,
    { x: 12, y: -16, scale: 1.025, duration: 0.28, ease: gsapEase.gentle },
    0.45,
  );
  tl.to(
    cardFront,
    {
      autoAlpha: 1,
      x: 12,
      y: -16,
      scale: 1.025,
      duration: 0.28,
      ease: gsapEase.gentle,
    },
    0.45,
  );

  // 0.75–1.05 — 翻牌（rotateY 180 → 90 → 0）
  tl.to(
    cardFront,
    { rotationY: 90, duration: 0.2, ease: gsapEase.gentle },
    0.75,
  );
  tl.set(cardBack, { autoAlpha: 0 }, 0.95);
  tl.to(
    cardFront,
    { rotationY: 0, duration: 0.2, ease: gsapEase.gentle },
    0.95,
  );

  // 1.25 — 牌面落下
  tl.to(
    cardFront,
    {
      y: 0,
      x: 0,
      scale: 1,
      rotation: -1.5,
      duration: 0.22,
      ease: gsapEase.soft,
    },
    1.25,
  );

  // 1.40 — 接触阴影稳定
  if (groundShadow) {
    tl.to(
      groundShadow,
      {
        autoAlpha: 1,
        scale: 1,
        y: 0,
        duration: 0.15,
        ease: gsapEase.soft,
      },
      1.4,
    );
  }
  if (warmGlow) {
    tl.to(
      warmGlow,
      { autoAlpha: 1, duration: 0.2, ease: gsapEase.soft },
      1.38,
    );
  }

  // 1.55 — 牌名
  if (cardNameZhEl) {
    const { timeline: splitTl, revert } = animateSplitReveal(cardNameZhEl, {
      type: "chars",
      reducedMotion: false,
      y: 8,
      staggerEach: 0.03,
    });
    tl.add(splitTl, 1.55);
    (tl as gsap.core.Timeline & { splitRevert?: () => void }).splitRevert =
      revert;
    tl.fromTo(
      cardName,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.22 },
      1.55,
    );
    const metaLines = cardName.querySelectorAll(
      "[data-card-meta]",
    ) as NodeListOf<HTMLElement>;
    if (metaLines.length) {
      tl.from(
        metaLines,
        { autoAlpha: 0, y: 6, duration: 0.2, stagger: 0.05 },
        1.62,
      );
    }
  } else {
    tl.fromTo(
      cardName,
      { autoAlpha: 0, y: 8 },
      { autoAlpha: 1, y: 0, duration: 0.28 },
      1.55,
    );
  }

  return tl;
}

/** @deprecated Use createTarotRevealTimeline */
export function createCardRevealTimeline(
  cardFront: HTMLElement,
  cardBack: HTMLElement,
  cardName: HTMLElement,
  options: TarotRevealOptions & {
    cardNameZhEl?: HTMLElement | null;
    groundShadow?: HTMLElement | null;
    warmGlow?: HTMLElement | null;
  },
): gsap.core.Timeline {
  return createTarotRevealTimeline(
    {
      cardFront,
      cardBack,
      cardName,
      cardNameZhEl: options.cardNameZhEl,
      groundShadow: options.groundShadow,
      warmGlow: options.warmGlow,
    },
    options,
  );
}

export type CardRevealOptions = TarotRevealOptions & {
  cardNameZhEl?: HTMLElement | null;
  groundShadow?: HTMLElement | null;
  warmGlow?: HTMLElement | null;
};
