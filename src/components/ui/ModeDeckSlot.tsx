"use client";

import { cn } from "./cn";

type Variant = "primary" | "secondary" | "tertiary";

type Props = {
  mode: string;
  title: string;
  tagline: string;
  description?: string;
  variant?: Variant;
  chosen?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
  className?: string;
};

/** 牌桌模式入口 — 围绕中心牌背的轻量边注，无编号、无玻璃 sheen */
export function ModeDeckSlot({
  mode,
  title,
  tagline,
  description,
  variant = "secondary",
  chosen = false,
  disabled = false,
  onSelect,
  className,
}: Props) {
  const isTertiary = variant === "tertiary";
  const isPrimary = variant === "primary";

  return (
    <button
      type="button"
      data-mode={mode}
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        "mode-deck-slot",
        isTertiary && "mode-deck-slot--tertiary",
        isPrimary && "mode-deck-slot--primary",
        chosen && "is-chosen",
        className,
      )}
      aria-label={`${title} — ${tagline}`}
      aria-pressed={chosen}
    >
      <span className="mode-deck-slot__title">{title}</span>
      <span className="mode-deck-slot__tagline">{tagline}</span>
      {description && (
        <span className="mode-deck-slot__description">{description}</span>
      )}
    </button>
  );
}
