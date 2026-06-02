import { gsap } from "gsap";
import { duration, gsapEase } from "./motionTokens";

/**
 * 牌面区域柔光高亮 — opacity + scale + blur（不用 display 切换）
 */
export function showMotifHighlight(el: HTMLElement): gsap.core.Tween {
  gsap.set(el, { visibility: "inherit" });
  return gsap.fromTo(
    el,
    { autoAlpha: 0, scale: 0.96, filter: "blur(3px)" },
    {
      autoAlpha: 1,
      scale: 1,
      filter: "blur(0px)",
      duration: duration.fast,
      ease: gsapEase.soft,
    },
  );
}

export function hideMotifHighlight(el: HTMLElement): gsap.core.Tween {
  return gsap.to(el, {
    autoAlpha: 0,
    scale: 0.96,
    filter: "blur(2px)",
    duration: duration.instant,
    ease: gsapEase.soft,
    onComplete: () => {
      gsap.set(el, { visibility: "hidden" });
    },
  });
}
