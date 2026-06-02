import { gsap } from "gsap";
import { gsapEase, duration, stagger as staggerTokens } from "./motionTokens";
import { animateDrawSVG, eraseDrawSVG } from "./drawSvg.gsap";
import "./gsapRegister";

/**
 * Motif Hotspot Animation
 *
 * 牌面上的 motif hotspot stagger 出现 + hover 交互。
 *
 * Stagger 进入：
 * - 所有 hotspot 依次出现
 * - 从牌面中心向外扩散
 *
 * Hover 交互：
 * - hotspot 变亮
 * - 对应 highlight 区域淡入
 * - 解释 popover 浮现
 *
 * Active 状态：
 * - 其他 hotspot opacity 降到 0.45
 * - 选中的 hotspot 保持全亮
 */

export interface HotspotConfig {
  /** hotspot 元素 */
  el: HTMLElement;
  /** highlight 区域元素（可选） */
  highlightEl?: HTMLElement;
  /** popover 元素（可选） */
  popoverEl?: HTMLElement;
  /** 手写线条 SVG path 元素（可选） */
  lineEl?: SVGPathElement;
}

/**
 * Stagger 进入所有 hotspot
 */
export function staggerHotspots(
  hotspots: HTMLElement[],
  options?: { delay?: number; from?: "center" | "start" | "end" | "edges" | "random" }
): gsap.core.Timeline {
  const tl = gsap.timeline();

  tl.fromTo(
    hotspots,
    { autoAlpha: 0, scale: 0.72 },
    {
      autoAlpha: 1,
      scale: 1,
      duration: duration.fast,
      ease: "back.out(1.4)",
      stagger: {
        each: staggerTokens.normal,
        from: options?.from ?? "center",
      },
    }
  );

  if (options?.delay) {
    tl.delay(options.delay);
  }

  return tl;
}

/**
 * Hover hotspot 时的响应动画
 */
export function animateHotspotHover(
  hotspot: HotspotConfig,
  isActive: boolean
): gsap.core.Timeline {
  const tl = gsap.timeline();

  if (isActive) {
    // 激活状态：变亮
    tl.to(hotspot.el, {
      scale: 1.18,
      autoAlpha: 1,
      duration: duration.hover,
      ease: gsapEase.soft,
    });

    if (hotspot.highlightEl) {
      tl.fromTo(
        hotspot.highlightEl,
        { autoAlpha: 0, scale: 0.96, filter: "blur(3px)" },
        {
          autoAlpha: 1,
          scale: 1,
          filter: "blur(0px)",
          duration: duration.fast,
        },
        "<",
      );
    }

    if (hotspot.popoverEl) {
      tl.fromTo(
        hotspot.popoverEl,
        { autoAlpha: 0, scale: 0.96, y: 6, filter: "blur(4px)" },
        {
          autoAlpha: 1,
          scale: 1,
          y: 0,
          filter: "blur(0px)",
          duration: duration.fast,
        },
        `<${duration.instant}`,
      );
    }

    if (hotspot.lineEl) {
      tl.add(
        animateDrawSVG(hotspot.lineEl, { duration: duration.slow }),
        `<${duration.fast}`,
      );
    }
  } else {
    // 取消激活
    tl.to(hotspot.el, {
      scale: 1,
      autoAlpha: 0.45,
      duration: duration.fast,
      ease: gsapEase.soft,
    });

    if (hotspot.highlightEl) {
      tl.to(
        hotspot.highlightEl,
        { autoAlpha: 0, duration: duration.fast },
        "<"
      );
    }

    if (hotspot.popoverEl) {
      tl.to(
        hotspot.popoverEl,
        {
          autoAlpha: 0,
          scale: 0.98,
          y: 4,
          filter: "blur(2px)",
          duration: duration.fast,
        },
        "<",
      );
    }

    if (hotspot.lineEl) {
      tl.add(eraseDrawSVG(hotspot.lineEl), "<");
    }
  }

  return tl;
}

/**
 * 激活单个 hotspot，同时降低其他 hotspot 的 opacity
 */
export function activateHotspot(
  allHotspots: HotspotConfig[],
  activeIndex: number
): void {
  allHotspots.forEach((h, i) => {
    if (i === activeIndex) {
      animateHotspotHover(h, true);
    } else {
      gsap.to(h.el, {
        autoAlpha: 0.45,
        scale: 0.95,
        duration: duration.fast,
        ease: gsapEase.soft,
      });
    }
  });
}

/**
 * 重置所有 hotspot 到默认状态
 */
export function resetHotspots(hotspots: HotspotConfig[]): void {
  hotspots.forEach((h) => {
    animateHotspotHover(h, false);
    gsap.to(h.el, {
      autoAlpha: 1,
      scale: 1,
      duration: duration.fast,
      ease: gsapEase.soft,
    });
  });
}
