import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { gsapEase, duration, stagger } from "./motionTokens";
import "./gsapRegister";

export type SplitRevealOptions = {
  type?: string;
  reducedMotion?: boolean;
  y?: number;
  staggerEach?: number;
};

export type SplitRevealResult = {
  timeline: gsap.core.Timeline;
  revert: () => void;
};

/**
 * SplitText 逐词/逐字浮现。调用方须在 unmount 或 re-split 前 revert。
 */
export function animateSplitReveal(
  element: HTMLElement,
  options?: SplitRevealOptions,
): SplitRevealResult {
  if (options?.reducedMotion) {
    const tl = gsap.timeline();
    tl.set(element, { autoAlpha: 1, y: 0 });
    return { timeline: tl, revert: () => {} };
  }

  const split = SplitText.create(element, {
    type: options?.type ?? "words",
    aria: "auto",
    reduceWhiteSpace: true,
  });

  gsap.set(element, { autoAlpha: 1 });

  const units =
    split.words.length > 0
      ? split.words
      : split.chars.length > 0
        ? split.chars
        : split.lines;

  const tl = gsap.timeline();
  tl.from(units, {
    y: options?.y ?? 8,
    autoAlpha: 0,
    duration: duration.normal,
    stagger: options?.staggerEach ?? stagger.normal,
    ease: gsapEase.soft,
  });

  return {
    timeline: tl,
    revert: () => {
      split.revert();
    },
  };
}
