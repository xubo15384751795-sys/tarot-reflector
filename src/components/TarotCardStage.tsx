"use client";

/**
 * TarotCardStage — 三层物理：暖光 / 地面椭圆阴影 / 纸感 frame
 * 入场用 Framer（mount）；抽牌 reveal 用 GSAP（CardReveal）。
 */

import { motion, type MotionProps } from "framer-motion";
import type { ReactNode } from "react";
import { motionTokens } from "@/features/motion";

type Props = {
  children: ReactNode;
  rotate?: number;
  showGroundShadow?: boolean;
  className?: string;
  animate?: MotionProps["animate"];
  initial?: MotionProps["initial"];
  transition?: MotionProps["transition"];
};

export default function TarotCardStage({
  children,
  rotate = -2.2,
  showGroundShadow = true,
  className,
  animate,
  initial,
  transition,
}: Props) {
  return (
    <motion.div
      className={`tarot-card-stage relative flex items-center justify-center ${className ?? ""}`}
      style={{ width: "100%", maxWidth: 280, aspectRatio: "2 / 3.45" }}
      initial={
        initial ?? { opacity: 0, y: 24, rotate: rotate - 3, scale: 0.96 }
      }
      animate={animate ?? { opacity: 1, y: 0, rotate, scale: 1 }}
      transition={
        transition ?? {
          opacity: { duration: motionTokens.durations.panel, ease: "easeOut" },
          y: motionTokens.cardSpring,
          rotate: motionTokens.cardSpring,
          scale: motionTokens.cardSpring,
        }
      }
    >
      <div className="card-glow" aria-hidden />

      {showGroundShadow && (
        <div className="card-ground-shadow" aria-hidden />
      )}

      <div
        className="card-frame relative z-[1] w-full h-full"
        style={{
          filter:
            "drop-shadow(0 1px 1px rgba(60, 42, 22, 0.18)) drop-shadow(0 8px 14px rgba(72, 54, 34, 0.14))",
        }}
      >
        <div
          className="relative w-full h-full overflow-hidden"
          style={{
            borderRadius: 13,
            border: "1px solid rgba(78, 60, 40, 0.22)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45)",
          }}
        >
          {children}
        </div>
      </div>
    </motion.div>
  );
}
