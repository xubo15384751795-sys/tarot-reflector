"use client";

import type { ReactNode } from "react";
import { cn } from "./cn";

type Props = {
  title: string;
  subtitle?: string;
  meta?: string;
  count?: number | string;
  children?: ReactNode;
  active?: boolean;
  className?: string;
  onClick?: () => void;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
};

/** 档案分组入口卡片 — 用于 archive 首页分组 */
export function ArchiveGroupCard({
  title,
  subtitle,
  meta,
  count,
  children,
  active = false,
  className,
  onClick,
  onPointerEnter,
  onPointerLeave,
}: Props) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      className={cn(
        "archive-glass-card interactive-glow physical-card rounded-[28px] w-full",
        active && "is-active",
        onClick && "text-left",
        className,
      )}
    >
      <div className="relative z-[2] flex flex-col gap-1.5">
        {meta && !count && (
          <span className="archive-card__meta-label text-[10px] tracking-[0.18em] uppercase">
            {meta}
          </span>
        )}
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="archive-card__label">{title}</span>
          {count != null && (
            <span className="major-arcana-card__count">{count}</span>
          )}
        </div>
        {subtitle && <span className="archive-card__desc">{subtitle}</span>}
        {meta && count != null && (
          <span className="archive-card__element text-[12px]">{meta}</span>
        )}
        {children}
      </div>
    </Tag>
  );
}
