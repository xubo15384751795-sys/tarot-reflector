"use client";

import type { ReactNode } from "react";
import { cn } from "./cn";

type Props = {
  kicker?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  className?: string;
  children?: ReactNode;
};

/** 章节 / 页面标题 — guide、archive、notes 统一层级 */
export function SectionHeader({
  kicker,
  title,
  subtitle,
  align = "center",
  className,
  children,
}: Props) {
  return (
    <header
      className={cn(
        "section-header flex flex-col gap-2",
        align === "center" && "text-center items-center",
        className,
      )}
    >
      {kicker && (
        <span className="section-header__kicker text-[11px] tracking-[0.18em] uppercase">
          {kicker}
        </span>
      )}
      <h2 className="section-header__title hero-title text-[clamp(22px,3vw,32px)] font-light tracking-[-0.012em] leading-[1.3]">
        {title}
      </h2>
      {subtitle && (
        <p className="section-header__subtitle text-[13px] tracking-[0.04em] leading-[1.7] max-w-md">
          {subtitle}
        </p>
      )}
      {children}
    </header>
  );
}
