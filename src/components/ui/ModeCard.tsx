"use client";

import { CornerOrnament } from "@/components/ArchiveEmblems";
import { cn } from "./cn";

type Tier = "primary" | "secondary" | "tertiary";

type Props = {
  index: number;
  title: string;
  tagline: string;
  description: string;
  mode?: string;
  /** 视觉层级：primary=主推厚卡；secondary=常规厚卡；tertiary=脚注线条 */
  tier?: Tier;
  recommended?: boolean;
  chosen?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
  className?: string;
};

/** 首页模式选择卡片 — ModeSelector 的视觉单元 */
export function ModeCard({
  index,
  title,
  tagline,
  description,
  mode,
  tier = "secondary",
  recommended = false,
  chosen = false,
  disabled = false,
  onSelect,
  className,
}: Props) {
  const isTertiary = tier === "tertiary";
  const isPrimary = tier === "primary";

  return (
    <button
      type="button"
      data-mode={mode}
      data-tier={tier}
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        "relative w-full text-left mode-card",
        !isTertiary && "interactive-glow physical-card rounded-2xl",
        isPrimary && "mode-card--primary px-6 py-6",
        tier === "secondary" && "px-5 py-5",
        isTertiary && "mode-card--tertiary",
        chosen && "is-chosen",
        recommended && "is-recommended",
        className,
      )}
      aria-label={`${title} — ${tagline}`}
      aria-pressed={chosen}
    >
      {recommended && !chosen && <span className="mode-card__badge">推荐</span>}

      {chosen && !isTertiary && (
        <>
          <CornerOrnament size={16} position="tl" className="absolute top-1 left-1" style={{ opacity: 0.6 }} />
          <CornerOrnament size={16} position="tr" className="absolute top-1 right-1" style={{ opacity: 0.6 }} />
          <CornerOrnament size={16} position="bl" className="absolute bottom-1 left-1" style={{ opacity: 0.6 }} />
          <CornerOrnament size={16} position="br" className="absolute bottom-1 right-1" style={{ opacity: 0.6 }} />
        </>
      )}

      <div className={cn("flex items-center", isTertiary ? "gap-3" : "gap-4")}>
        <span className="mode-card__num shrink-0">{index}</span>
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <span className="mode-card__title">{title}</span>
          <span className="mode-card__tagline">{tagline}</span>
          {!isTertiary && (
            <span className="mode-card__description">{description}</span>
          )}
        </div>
      </div>
    </button>
  );
}
