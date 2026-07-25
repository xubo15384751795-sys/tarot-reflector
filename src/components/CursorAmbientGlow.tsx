"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * 全局鼠标追光 — 大面积柔和金光跟随鼠标移动。
 * 纯 CSS 变量驱动，不触发 React re-render。
 * 首次鼠标移动后淡入显示。
 */
export default function CursorAmbientGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia?.("(pointer: coarse)").matches) return;

    const xTo = gsap.quickTo(el, "--cx", {
      duration: 1.2,
      ease: "power3.out",
    });
    const yTo = gsap.quickTo(el, "--cy", {
      duration: 1.2,
      ease: "power3.out",
    });

    let hasMoved = false;
    const onMove = (e: PointerEvent) => {
      if (!hasMoved) {
        hasMoved = true;
        el.classList.add("has-moved");
      }
      xTo(e.clientX);
      yTo(e.clientY);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="cursor-ambient-glow"
      style={{ "--cx": "50%", "--cy": "50%" } as React.CSSProperties}
    />
  );
}
