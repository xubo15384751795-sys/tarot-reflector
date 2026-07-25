"use client";

import type { ReactNode } from "react";
import { cn } from "./cn";

type Props = {
  active?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
};

/** 手稿式领域标签 — 羊皮纸压痕感，非玻璃 pill */
export function ManuscriptTag({
  active = false,
  icon,
  children,
  onClick,
  className,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("manuscript-tag", active && "is-active", className)}
      aria-pressed={active}
    >
      {icon && (
        <span
          className="manuscript-tag__icon shrink-0"
          style={{ color: active ? "var(--accent)" : "var(--text-tertiary)" }}
        >
          {icon}
        </span>
      )}
      <span>{children}</span>
    </button>
  );
}
