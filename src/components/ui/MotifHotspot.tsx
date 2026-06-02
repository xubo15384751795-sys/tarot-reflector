"use client";

import { cn } from "./cn";

type Props = {
  id: string;
  label: string;
  x: number;
  y: number;
  active?: boolean;
  dimmed?: boolean;
  readonly?: boolean;
  debug?: boolean;
  onHover?: () => void;
  onHoverEnd?: () => void;
  onToggle?: () => void;
};

/** 牌面符号热点 — GSAP stagger 由父级 scope 负责，本组件不做 transform 动画 */
export function MotifHotspot({
  id,
  label,
  x,
  y,
  active = false,
  dimmed = false,
  readonly = false,
  debug = false,
  onHover,
  onHoverEnd,
  onToggle,
}: Props) {
  return (
    <button
      type="button"
      data-motif-anchor={id}
      className={cn(
        "motif-anchor",
        readonly && "motif-anchor--readonly",
        active && "is-lit",
        dimmed && "is-dim",
      )}
      style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
      onMouseEnter={onHover}
      onMouseLeave={onHoverEnd}
      onFocus={onHover}
      onBlur={onHoverEnd}
      onClick={onToggle}
      aria-label={label}
      aria-pressed={active}
      disabled={readonly}
    >
      {debug && (
        <span className="motif-anchor__debug" aria-hidden>
          {id}
          <br />
          {x.toFixed(2)},{y.toFixed(2)}
        </span>
      )}
    </button>
  );
}
