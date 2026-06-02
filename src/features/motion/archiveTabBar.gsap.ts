import { gsap } from "gsap";
import { gsapEase, duration } from "./motionTokens";
import "./gsapRegister";

export type TabIndicatorMetrics = {
  left: number;
  width: number;
};

export function measureTabIndicator(
  container: HTMLElement,
  button: HTMLElement,
): TabIndicatorMetrics {
  const btnRect = button.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  return {
    left: btnRect.left - containerRect.left,
    width: btnRect.width,
  };
}

/**
 * 档案 Tab 滑块 — 横向流动 + 轻微纵向弹性，配合玻璃质感指示器。
 */
export function animateArchiveTabIndicator(
  indicator: HTMLElement,
  metrics: TabIndicatorMetrics,
  options?: { reducedMotion?: boolean; immediate?: boolean },
): gsap.core.Timeline {
  const tl = gsap.timeline();

  if (options?.immediate || options?.reducedMotion) {
    tl.set(indicator, {
      left: metrics.left,
      width: metrics.width,
      scaleX: 1,
      scaleY: 1,
      autoAlpha: 1,
    });
    return tl;
  }

  tl.to(
    indicator,
    {
      left: metrics.left,
      width: metrics.width,
      duration: duration.normal + 0.15,
      ease: "power3.inOut",
    },
    0,
  )
    .to(
      indicator,
      {
        scaleY: 0.94,
        duration: duration.fast,
        ease: gsapEase.soft,
      },
      0,
    )
    .to(
      indicator,
      {
        scaleY: 1,
        duration: duration.normal,
        ease: "back.out(1.6)",
      },
      duration.fast,
    );

  return tl;
}
