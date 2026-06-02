"use client";

import { useRef, type CSSProperties, type ElementType } from "react";
import { useGSAP } from "@gsap/react";
import { scrambleToText, useReducedMotion, REGRESSION_STATIC_LAYOUT } from "@/features/motion";

type Props = {
  text: string;
  className?: string;
  style?: CSSProperties;
  as?: ElementType;
  duration?: number;
  id?: string;
};

/**
 * 文案切换时用 ScrambleText 过渡（领域提示、输入引导等）。
 */
export default function ScrambleReveal({
  text,
  className,
  style,
  as: Tag = "p",
  duration,
  id,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (REGRESSION_STATIC_LAYOUT) {
        el.textContent = text;
        return;
      }
      const tween = scrambleToText(el, text, { reducedMotion, duration });
      return () => {
        tween.kill();
      };
    },
    { scope: ref, dependencies: [text, reducedMotion, duration], revertOnUpdate: true },
  );

  return (
    <Tag ref={ref as never} id={id} className={className} style={style}>
      {text}
    </Tag>
  );
}
