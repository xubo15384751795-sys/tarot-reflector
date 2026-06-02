"use client";

import { CornerOrnament } from "@/components/ArchiveEmblems";
import { cn } from "./cn";

type Props = {
  index: number;
  title: string;
  tagline: string;
  description: string;
  mode?: string;
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
  recommended = false,
  chosen = false,
  disabled = false,
  onSelect,
  className,
}: Props) {
  return (
    <button
      type="button"
      data-mode={mode}
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        "relative w-full text-left mode-card interactive-glow physical-card rounded-2xl px-5 py-5",
        chosen && "is-chosen",
        recommended && "is-recommended",
        className,
      )}
      aria-label={`${title} — ${tagline}`}
      aria-pressed={chosen}
    >
      {recommended && !chosen && <span className="mode-card__badge">推荐</span>}

      {chosen && (
        <>
          <CornerOrnament size={16} position="tl" className="absolute top-1 left-1" style={{ opacity: 0.6 }} />
          <CornerOrnament size={16} position="tr" className="absolute top-1 right-1" style={{ opacity: 0.6 }} />
          <CornerOrnament size={16} position="bl" className="absolute bottom-1 left-1" style={{ opacity: 0.6 }} />
          <CornerOrnament size={16} position="br" className="absolute bottom-1 right-1" style={{ opacity: 0.6 }} />
        </>
      )}

      <div className="flex items-center gap-4">
        <span className="mode-card__num shrink-0">{index}</span>
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <span className="mode-card__title">{title}</span>
          <span className="mode-card__tagline">{tagline}</span>
          <span className="mode-card__description">{description}</span>
        </div>
      </div>
    </button>
  );
}
