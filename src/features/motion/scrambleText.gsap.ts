import { gsap } from "gsap";
import "./gsapRegister";

const DEFAULT_CHARS = "·阈值牌镜古档案审美观";

export type ScrambleTextOptions = {
  reducedMotion?: boolean;
  duration?: number;
  chars?: string;
  revealDelay?: number;
  speed?: number;
};

/**
 * ScrambleText 过渡到目标文案（领域提示、输入引导等）。
 */
export function scrambleToText(
  element: HTMLElement,
  text: string,
  options?: ScrambleTextOptions,
): gsap.core.Tween {
  if (options?.reducedMotion) {
    element.textContent = text;
    return gsap.set(element, {});
  }

  return gsap.to(element, {
    duration: options?.duration ?? 0.85,
    scrambleText: {
      text,
      chars: options?.chars ?? DEFAULT_CHARS,
      revealDelay: options?.revealDelay ?? 0.22,
      speed: options?.speed ?? 0.4,
    },
  });
}
