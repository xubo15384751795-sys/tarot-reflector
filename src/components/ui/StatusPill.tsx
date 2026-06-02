"use client";

import type { ReactNode } from "react";
import { cn } from "./cn";

type Variant = "accent" | "muted" | "status";

type Props = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
};

const variantClass: Record<Variant, string> = {
  accent: "pill-accent",
  muted: "status-pill status-pill--muted",
  status: "status-pill status-pill--status",
};

/** 轻量状态/标签 pill，非主要操作按钮 */
export function StatusPill({ children, variant = "accent", className }: Props) {
  return (
    <span className={cn(variantClass[variant], className)} role="status">
      {children}
    </span>
  );
}
