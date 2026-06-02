import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { gsapEase } from "./motionTokens";
import "./gsapRegister";

export type SpreadFlipState = ReturnType<typeof Flip.getState>;

export function captureSpreadFlipState(container: HTMLElement): SpreadFlipState {
  return Flip.getState(container.querySelectorAll(".spread-card"));
}

/**
 * 牌阵网格选中：FLIP 高亮过渡 + 非选中项略降透明度。
 */
export function playSpreadSelectionFlip(
  state: SpreadFlipState,
  container: HTMLElement,
  selectedId: string,
): gsap.core.Timeline {
  const tl = gsap.timeline();

  tl.add(
    Flip.from(state, {
      duration: 0.42,
      ease: gsapEase.soft,
      scale: true,
      nested: true,
    }),
    0,
  );

  const others = container.querySelectorAll(
    `.spread-card:not([data-spread="${selectedId}"])`,
  );
  tl.to(
    others,
    {
      autoAlpha: 0.72,
      duration: 0.28,
      ease: gsapEase.soft,
    },
    0.04,
  );

  const active = container.querySelector(
    `[data-spread="${selectedId}"]`,
  );
  if (active) {
    tl.to(active, { autoAlpha: 1, duration: 0.2 }, 0);
  }

  return tl;
}
