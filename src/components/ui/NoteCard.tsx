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
  /** 这次解读下挂了几条笔记；>1 才显示 */
  noteCount?: number;
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
  noteCount,
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
      {pinned && <span className="note-card__pin" aria-label="已固定" title="已固定" />}
      {thumbnail && <div className="shrink-0">{thumbnail}</div>}
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <span className="note-card__meta">
          {meta}
          {/* 笔记条数属于这张卡的元信息。它以前渲染在卡片外面，
              夹在两张卡之间，读者分不清算上面那张还是下面那张。 */}
          {noteCount != null && noteCount > 1 && (
            <span className="note-card__note-count">共 {noteCount} 条笔记</span>
          )}
        </span>
        <h3 className="note-card__title">{title}</h3>
        {subtitle && <p className="note-card__excerpt">{subtitle}</p>}
      </div>
      {actions && <div className="shrink-0 flex items-start gap-2">{actions}</div>}
    </article>
  );
}
