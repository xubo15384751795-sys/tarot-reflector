"use client";

import type { ReactNode } from "react";
import { cn } from "./cn";

type Props = {
  title: string;
  subtitle?: string;
  meta?: string;
  thumbnail?: ReactNode;
  pinned?: boolean;
  className?: string;
  onClick?: () => void;
  actions?: ReactNode;
};

/** 解读快照卡片 — notes 页统一容器 */
export function NoteCard({
  title,
  subtitle,
  meta,
  thumbnail,
  pinned = false,
  className,
  onClick,
  actions,
}: Props) {
  return (
    <article
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={cn(
        "note-card relative flex gap-4 p-5 rounded-2xl",
        onClick && "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
        pinned && "note-card--pinned",
        className,
      )}
    >
      {thumbnail && <div className="shrink-0">{thumbnail}</div>}
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        {meta && (
          <span className="text-[10px] tracking-[0.14em]" style={{ color: "var(--text-faint)" }}>
            {meta}
          </span>
        )}
        <h3 className="text-[15px] font-normal tracking-[-0.01em]" style={{ color: "var(--text-primary)" }}>
          {title}
        </h3>
        {subtitle && (
          <p className="text-[12px] leading-[1.65] line-clamp-2" style={{ color: "var(--text-tertiary)" }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="shrink-0 flex items-start gap-2">{actions}</div>}
    </article>
  );
}
