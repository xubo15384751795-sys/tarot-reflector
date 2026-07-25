"use client";

import type { ReactNode } from "react";
import { cn } from "./cn";

type Props = {
  kicker?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  /** 文学页眉节奏 — notes / archive */
  literary?: boolean;
  className?: string;
  children?: ReactNode;
};

/** 章节 / 页面标题 — guide、archive、notes 统一层级 */
export function SectionHeader({
  kicker,
  title,
  subtitle,
  align = "center",
  literary = false,
  className,
  children,
}: Props) {
  return (
    <header
      className={cn(
        "section-header flex flex-col gap-2",
        literary && "section-header--literary",
        align === "center" && "text-center items-center",
        className,
      )}
    >
      {kicker && (
        <span className="section-header__kicker">
          {kicker}
        </span>
      )}
      <h2 className="section-header__title hero-title">
        {title}
      </h2>
      {subtitle && (
        <p className="section-header__subtitle">
          {subtitle}
        </p>
      )}
      {children && <div className="section-header__meta">{children}</div>}
    </header>
  );
}
