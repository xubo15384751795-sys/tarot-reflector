"use client";

import { useEffect, type RefObject } from "react";
import { gsap } from "gsap";

type QuickPair = { xTo: gsap.QuickToFunc; yTo: gsap.QuickToFunc };

/**
 * 鼠标追光：gsap.quickTo 写入子元素 --mx / --my，不触发 React re-render。
 */
export function useFoilSpotlight(
  containerRef: RefObject<HTMLElement | null>,
  childSelector: string,
): void {
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    if (typeof window === "undefined") return;

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia?.("(pointer: coarse)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const quickMap = new WeakMap<HTMLElement, QuickPair>();

    const onMove = (e: PointerEvent) => {
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>(
        childSelector,
      );
      if (!target || !root.contains(target)) return;
      let pair = quickMap.get(target);
      if (!pair) {
        pair = {
          xTo: gsap.quickTo(target, "--mx", {
            duration: 0.35,
            ease: "power2.out",
          }),
          yTo: gsap.quickTo(target, "--my", {
            duration: 0.35,
            ease: "power2.out",
          }),
        };
        quickMap.set(target, pair);
      }
      const rect = target.getBoundingClientRect();
      pair.xTo(e.clientX - rect.left);
      pair.yTo(e.clientY - rect.top);
    };

    root.addEventListener("pointermove", onMove, { passive: true });
    return () => root.removeEventListener("pointermove", onMove);
  }, [containerRef, childSelector]);
}
