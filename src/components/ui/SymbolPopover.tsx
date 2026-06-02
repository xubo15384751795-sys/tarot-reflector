"use client";

import * as Popover from "@radix-ui/react-popover";
import type { ReactNode } from "react";
import { cn } from "./cn";

type Props = {
  trigger: ReactNode;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  className?: string;
};

/** 从符号附近浮现的解释层 — Radix headless + 档案室视觉 */
export function SymbolPopover({
  trigger,
  children,
  open,
  onOpenChange,
  side = "top",
  align = "center",
  className,
}: Props) {
  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side={side}
          align={align}
          sideOffset={8}
          className={cn(
            "symbol-popover glass-card p-4 max-w-[260px] z-50",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            className,
          )}
          style={{
            boxShadow:
              "var(--shadow-card), 0 0 0 1px var(--border) inset",
          }}
        >
          {children}
          <Popover.Arrow
            className="fill-[var(--surface)]"
            style={{ filter: "drop-shadow(0 1px 0 var(--border))" }}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
