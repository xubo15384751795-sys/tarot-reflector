"use client";

import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "./cn";

type GlassCardProps<T extends ElementType = "div"> = {
  as?: T;
  children: ReactNode;
  className?: string;
  glow?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

const paddingClass = {
  none: "",
  sm: "p-4",
  md: "p-5 md:p-6",
  lg: "p-6 md:p-8",
} as const;

export function GlassCard<T extends ElementType = "div">({
  as,
  children,
  className,
  glow = false,
  padding = "md",
  ...rest
}: GlassCardProps<T>) {
  const Tag = as ?? "div";
  return (
    <Tag
      className={cn(
        "glass-lens glass-lens--panel",
        glow && "interactive-glow",
        paddingClass[padding],
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
