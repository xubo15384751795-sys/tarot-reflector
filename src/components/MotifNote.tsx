"use client";

type Props = {
  id: string;
  label_zh: string;
  meaning_zh: string;
  side: "left" | "right";
  active: boolean;
  dimmed?: boolean;
  debug?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onClick?: () => void;
};

/**
 * 档案 / 解读共用的边注标签：默认仅标题，active 时展开 meaning（最多两行）。
 */
export function MotifNote({
  id,
  label_zh,
  meaning_zh,
  side,
  active,
  dimmed = false,
  debug = false,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      data-motif-note={id}
      className={`motif-note motif-note--${side} ${active ? "is-active" : ""} ${dimmed ? "is-dim" : ""}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      onClick={onClick}
      aria-pressed={active}
      aria-label={label_zh}
    >
      {debug && <span className="motif-note__debug-id">{id}</span>}
      <span className="motif-note-title">{label_zh}</span>
      {active && meaning_zh ? (
        <span className="motif-note-meaning">{meaning_zh}</span>
      ) : null}
    </button>
  );
}
