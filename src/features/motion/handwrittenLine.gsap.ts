import { gsap } from "gsap";
import { gsapEase, duration } from "./motionTokens";
import { animateDrawSVG, eraseDrawSVG } from "./drawSvg.gsap";
import "./gsapRegister";

/**
 * Handwritten SVG Line Animation
 *
 * 从 hotspot 生长出一条轻微弯曲的 SVG 线。
 * 视觉像手写标注 / 树枝生长，不像流程图 connector。
 *
 * 实现原理：
 * - SVG <path> with stroke-dasharray = pathLength
 * - stroke-dashoffset 从 1 → 0 绘制
 * - 轻微弧线使用 cubic bezier path
 */

/**
 * 创建一条手写感曲线 path
 *
 * @param x1 起点 x
 * @param y1 起点 y
 * @param x2 终点 x
 * @param y2 终点 y
 * @param curvature 弯曲程度 (0-1, 默认 0.3)
 */
export function createHandwrittenPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  curvature = 0.3
): string {
  const dx = x2 - x1;
  const dy = y2 - y1;

  // 控制点偏移，制造手写感
  const cx1 = x1 + dx * 0.3 + dy * curvature;
  const cy1 = y1 + dy * 0.3 - dx * curvature;
  const cx2 = x1 + dx * 0.7 - dy * curvature * 0.5;
  const cy2 = y1 + dy * 0.7 + dx * curvature * 0.5;

  return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
}

/**
 * 动画绘制 SVG path
 * stroke-dashoffset 从 1 → 0
 */
export function animateHandwrittenLine(
  pathEl: SVGPathElement,
  options?: { duration?: number; delay?: number; ease?: string },
): gsap.core.Tween {
  return animateDrawSVG(pathEl, {
    duration: options?.duration ?? duration.slow,
    delay: options?.delay ?? 0,
    ease: options?.ease ?? gsapEase.smooth,
  });
}

/** 擦除手写线 */
export function eraseHandwrittenLine(
  pathEl: SVGPathElement,
  options?: { duration?: number; ease?: string },
): gsap.core.Tween {
  return eraseDrawSVG(pathEl, {
    duration: options?.duration ?? duration.fast,
    ease: options?.ease ?? gsapEase.soft,
  });
}

/**
 * 批量绘制多条手写线
 */
export function animateHandwrittenLines(
  paths: SVGPathElement[],
  options?: { stagger?: number; duration?: number }
): gsap.core.Timeline {
  const tl = gsap.timeline();

  paths.forEach((path, i) => {
    tl.add(
      animateHandwrittenLine(path, {
        duration: options?.duration ?? duration.slow,
      }),
      i * (options?.stagger ?? staggerValue(paths.length))
    );
  });

  return tl;
}

function staggerValue(count: number): number {
  // 根据路径数量动态调整 stagger
  if (count <= 3) return 0.15;
  if (count <= 6) return 0.1;
  return 0.06;
}
