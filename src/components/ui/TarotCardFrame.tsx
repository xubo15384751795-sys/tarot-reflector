"use client";

import type { ReactNode } from "react";
import { cn } from "./cn";

type Props = {
  children: ReactNode;
  className?: string;
  variant?: "archive" | "reading";
  solo?: boolean;
};

/** 牌面舞台：glow + ground shadow + frame，不含 GSAP/Motion 动画 */
export function TarotCardFrame({
  children,
  className,
  variant = "archive",
  solo = false,
}: Props) {
  return (
    <div
      className={cn(
        "card-stage tarot-card-stage",
        variant === "archive" && "motif-archive-card-stage",
        variant === "reading" && "card-stage--reading",
        solo && "motif-archive-card-stage--solo",
        className,
      )}
    >
      <div className="card-glow" aria-hidden />
      <div className="card-ground-shadow" aria-hidden />
      <div className="card-frame relative w-full h-full min-h-0">{children}</div>
    </div>
  );
}
