import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { gsapEase } from "./motionTokens";
import "./gsapRegister";

export type ModeFlipState = ReturnType<typeof Flip.getState>;

export function captureModeFlipState(container: HTMLElement): ModeFlipState {
  return Flip.getState(
    container.querySelectorAll(".mode-deck-slot, .mode-card"),
  );
}

/**
 * 模式卡片选中：FLIP 布局过渡 + 其余卡片淡出。
 */
export function playModeSelectionFlip(
  state: ModeFlipState,
  container: HTMLElement,
  chosenMode: string,
): gsap.core.Timeline {
  const tl = gsap.timeline();

  tl.add(
    Flip.from(state, {
      duration: 0.48,
      ease: gsapEase.soft,
      scale: true,
      nested: true,
    }),
    0,
  );

  const others = container.querySelectorAll(
    `.mode-deck-slot:not([data-mode="${chosenMode}"]), .mode-card:not([data-mode="${chosenMode}"])`,
  );
  tl.to(
    others,
    {
      autoAlpha: 0,
      scale: 0.98,
      duration: 0.34,
      ease: gsapEase.soft,
    },
    0.06,
  );

  return tl;
}
