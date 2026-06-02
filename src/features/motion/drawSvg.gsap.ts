import { gsap } from "gsap";
import { gsapEase, duration } from "./motionTokens";
import "./gsapRegister";

export type DrawSvgOptions = {
  duration?: number;
  delay?: number;
  ease?: string;
  /** 绘制起点，默认从 0% 开始 */
  from?: string | number;
  /** 绘制终点，默认整条路径 */
  to?: string;
};

/**
 * 用 DrawSVGPlugin 描边绘制 SVG path（需有 stroke + stroke-width）。
 */
export function animateDrawSVG(
  path: SVGPathElement,
  options?: DrawSvgOptions,
): gsap.core.Tween {
  const from = options?.from ?? "0% 0%";
  const to = options?.to ?? "0% 100%";

  gsap.set(path, { opacity: 1 });

  return gsap.fromTo(
    path,
    { drawSVG: from },
    {
      drawSVG: to,
      duration: options?.duration ?? duration.slow,
      delay: options?.delay ?? 0,
      ease: options?.ease ?? gsapEase.smooth,
    },
  );
}

/** 擦除描边（用于 hover 离开） */
export function eraseDrawSVG(
  path: SVGPathElement,
  options?: Pick<DrawSvgOptions, "duration" | "ease">,
): gsap.core.Tween {
  return gsap.to(path, {
    drawSVG: "0% 0%",
    duration: options?.duration ?? duration.fast,
    ease: options?.ease ?? gsapEase.soft,
  });
}
