"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { animateSplitReveal, useReducedMotion } from "@/features/motion";

type Props = {
  children: ReactNode;
  className?: string;
  /** SplitText type，中文标题用 chars 更自然 */
  splitType?: string;
};

/**
 * 首页主标题 — SplitText 逐字轻浮现（mount 一次）。
 */
export default function HeroTitleSplit({
  children,
  className = "",
  splitType = "chars",
}: Props) {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const { timeline, revert } = animateSplitReveal(el, {
        type: splitType,
        reducedMotion,
        y: 12,
        staggerEach: 0.04,
      });

      return () => {
        timeline.kill();
        revert();
      };
    },
    { scope: ref, dependencies: [reducedMotion, splitType] },
  );

  return (
    <h1 ref={ref} className={className} style={{ opacity: reducedMotion ? 1 : 0 }}>
      {children}
    </h1>
  );
}
