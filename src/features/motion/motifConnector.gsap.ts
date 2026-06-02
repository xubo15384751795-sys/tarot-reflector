import { gsap } from "gsap";
import { gsapEase, duration } from "./motionTokens";
import { animateDrawSVG } from "./drawSvg.gsap";
import "./gsapRegister";

/**
 * 档案 motif 连接线：DrawSVG 描边 + 淡入。
 */
export function animateMotifConnector(
  path: SVGPathElement,
  options?: { reducedMotion?: boolean },
): gsap.core.Timeline {
  const tl = gsap.timeline();

  if (options?.reducedMotion) {
    tl.set(path, { opacity: 1, drawSVG: "0% 100%" });
    return tl;
  }

  tl.fromTo(
    path,
    { opacity: 0 },
    { opacity: 1, duration: duration.fast, ease: gsapEase.soft },
  );
  tl.add(
    animateDrawSVG(path, {
      duration: duration.normal + 0.1,
      ease: gsapEase.gentle,
      from: "0% 0%",
    }),
    "<0.04",
  );

  return tl;
}

export function hideMotifConnector(path: SVGPathElement): void {
  gsap.killTweensOf(path);
  gsap.to(path, {
    opacity: 0,
    duration: duration.instant,
    ease: gsapEase.soft,
  });
}
