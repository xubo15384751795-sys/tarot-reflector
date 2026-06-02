"use client";

import { useEffect, useRef, type RefObject } from "react";
import { gsap } from "gsap";
import { useReducedMotion, useIsTouchDevice } from "./useReducedMotion";

type QuickPair = {
  xTo: gsap.QuickToFunc;
  yTo: gsap.QuickToFunc;
};

/**
 * Cursor glow — gsap.quickTo 更新 CSS 变量，无 React re-render。
 * scope 内匹配 selector 的元素响应 pointermove。
 */
export function useCursorGlowOnScope(
  scopeRef: RefObject<HTMLElement | null>,
  selector = ".interactive-glow",
  options?: { enabled?: boolean },
): void {
  const reducedMotion = useReducedMotion();
  const isTouch = useIsTouchDevice();
  const enabled = options?.enabled ?? true;

  useEffect(() => {
    const root = scopeRef.current;
    if (!root || typeof window === "undefined") return;
    if (!enabled || reducedMotion || isTouch) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const quickMap = new WeakMap<HTMLElement, QuickPair>();

    const getQuick = (el: HTMLElement): QuickPair => {
      let pair = quickMap.get(el);
      if (!pair) {
        pair = {
          xTo: gsap.quickTo(el, "--mx", {
            duration: 0.35,
            ease: "power2.out",
          }),
          yTo: gsap.quickTo(el, "--my", {
            duration: 0.35,
            ease: "power2.out",
          }),
        };
        quickMap.set(el, pair);
      }
      return pair;
    };

    const onMove = (e: PointerEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>(
        selector,
      );
      if (!el || !root.contains(el)) return;
      const rect = el.getBoundingClientRect();
      const { xTo, yTo } = getQuick(el);
      xTo(e.clientX - rect.left);
      yTo(e.clientY - rect.top);
    };

    root.addEventListener("pointermove", onMove, { passive: true });
    return () => root.removeEventListener("pointermove", onMove);
  }, [scopeRef, selector, reducedMotion, isTouch, enabled]);
}

/**
 * 文档级跟踪：在任意 `.interactive-glow` 上更新 --mx / --my（motion-lab 等）。
 */
export function useCursorGlow(xVar = "--mx", yVar = "--my") {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const isTouch = useIsTouchDevice();

  useEffect(() => {
    if (reducedMotion || isTouch) return;
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const quickMap = new WeakMap<HTMLElement, QuickPair>();

    const onMove = (e: PointerEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>(
        ".interactive-glow",
      );
      if (!el) return;
      let pair = quickMap.get(el);
      if (!pair) {
        pair = {
          xTo: gsap.quickTo(el, xVar, { duration: 0.35, ease: "power2.out" }),
          yTo: gsap.quickTo(el, yVar, { duration: 0.35, ease: "power2.out" }),
        };
        quickMap.set(el, pair);
      }
      const rect = el.getBoundingClientRect();
      pair.xTo(e.clientX - rect.left);
      pair.yTo(e.clientY - rect.top);
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    return () => document.removeEventListener("pointermove", onMove);
  }, [reducedMotion, isTouch, xVar, yVar]);

  return containerRef;
}
