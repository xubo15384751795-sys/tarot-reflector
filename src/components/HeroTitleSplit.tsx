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

  // 刻意不写 opacity:0 —— 之前主标题靠 GSAP 把它从 0 抬起来，
  // 一旦 GSAP 没加载 / 报错 / rAF 被挂起，首屏最重要的一行字就永远不显示。
  // useGSAP 走 layout effect，split 和 tl.from 都在首次绘制前完成，
  // 所以按可见渲染也不会闪一帧未拆分的文本。
  return (
    <h1 ref={ref} className={className}>
      {children}
    </h1>
  );
}
