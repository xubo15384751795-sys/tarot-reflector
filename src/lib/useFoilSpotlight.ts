"use client";

import { useEffect, type RefObject } from "react";

/**
 * 鼠标追光：监听容器内 pointermove，将子元素相对坐标写入 CSS 变量 --mx / --my。
 *
 * 不触发 React re-render（直接 setProperty）。
 *
 * 在以下情况自动禁用：
 *   - prefers-reduced-motion: reduce
 *   - 触摸主导设备（pointer: coarse）
 *   - SSR（无 window）
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

    const onMove = (e: PointerEvent) => {
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>(
        childSelector,
      );
      if (!target || !root.contains(target)) return;
      const rect = target.getBoundingClientRect();
      target.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      target.style.setProperty("--my", `${e.clientY - rect.top}px`);
    };

    root.addEventListener("pointermove", onMove, { passive: true });
    return () => root.removeEventListener("pointermove", onMove);
  }, [containerRef, childSelector]);
}
