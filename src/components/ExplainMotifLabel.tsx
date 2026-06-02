"use client";

import { useRef, type CSSProperties } from "react";
import { useGSAP } from "@gsap/react";
import { animateSplitReveal, useReducedMotion } from "@/features/motion";

type Props = {
  text: string;
  className?: string;
  style?: CSSProperties;
};

/** 科普幕字幕标题 — motif 切换时逐字浮现 */
export function ExplainMotifLabel({ text, className, style }: Props) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const { timeline, revert } = animateSplitReveal(el, {
        type: "chars",
        reducedMotion,
        y: 6,
        staggerEach: 0.025,
      });

      return () => {
        timeline.kill();
        revert();
      };
    },
    { scope: ref, dependencies: [text, reducedMotion], revertOnUpdate: true },
  );

  return (
    <p
      ref={ref}
      className={className}
      style={{ ...style, opacity: reducedMotion ? 1 : 0 }}
    >
      {text}
    </p>
  );
}
