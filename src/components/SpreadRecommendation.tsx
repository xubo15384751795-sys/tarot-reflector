"use client";

import { motion } from "framer-motion";
import { CornerOrnament, DividerLine } from "./ArchiveEmblems";

type Props = {
  recommended: {
    spread_id: string;
    name_zh: string;
    description_zh: string;
    reason_zh: string;
    difficulty: string;
  };
  alternatives: Array<{
    spread_id: string;
    name_zh: string;
    description_zh: string;
    difficulty: string;
  }>;
  onSelect: (spread_id: string) => void;
  onBack: () => void;
};

function IconChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="14,6 8,12 14,18" />
    </svg>
  );
}

function difficultyLabel(d: string): string {
  if (d === "beginner") return "入门";
  if (d === "intermediate") return "进阶";
  return "深入";
}

function difficultyColor(d: string): string {
  if (d === "beginner") return "var(--text-tertiary)";
  if (d === "intermediate") return "var(--accent)";
  return "var(--copper)";
}

export default function SpreadRecommendation({
  recommended,
  alternatives,
  onSelect,
  onBack,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-[520px] mx-auto flex flex-col gap-6"
    >
      <div className="flex items-center justify-center gap-3">
        <DividerLine width={28} />
        <span className="text-[11px] tracking-[0.16em]" style={{ color: "var(--ink-warm)" }}>
          推荐的牌阵
        </span>
        <DividerLine width={28} />
      </div>

      {/* Recommended spread — prominent */}
      <motion.button
        layoutId={`spread-${recommended.spread_id}`}
        onClick={() => onSelect(recommended.spread_id)}
        className="relative w-full text-left archive-border"
        style={{
          padding: "24px 26px",
          background: "var(--accent-dim)",
          borderColor: "var(--accent)",
        }}
      >
        <CornerOrnament size={18} position="tl" className="absolute top-2 left-2" style={{ opacity: 0.5 }} />
        <CornerOrnament size={18} position="tr" className="absolute top-2 right-2" style={{ opacity: 0.5 }} />
        <CornerOrnament size={18} position="bl" className="absolute bottom-2 left-2" style={{ opacity: 0.5 }} />
        <CornerOrnament size={18} position="br" className="absolute bottom-2 right-2" style={{ opacity: 0.5 }} />

        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-[10px] px-2.5 py-0.5 rounded-full tracking-[0.06em]"
            style={{
              color: difficultyColor(recommended.difficulty),
              border: `1px solid ${difficultyColor(recommended.difficulty)}33`,
              background: `${difficultyColor(recommended.difficulty)}11`,
            }}
          >
            {difficultyLabel(recommended.difficulty)}
          </span>
        </div>
        <h3 className="text-[20px] font-light tracking-[-0.01em] mb-1.5" style={{ color: "var(--text-primary)" }}>
          {recommended.name_zh}
        </h3>
        <p className="text-[13px] leading-[1.7] mb-3" style={{ color: "var(--text-secondary)" }}>
          {recommended.description_zh}
        </p>
        <div className="insight-card" style={{ padding: "12px 16px" }}>
          <p className="text-[13px] leading-[1.7] tracking-[-0.003em]" style={{ color: "var(--text-primary)" }}>
            {recommended.reason_zh}
          </p>
        </div>
      </motion.button>

      {/* Alternatives — 居中对称布局 */}
      {alternatives.length > 0 && (
        <div className="flex flex-col items-center gap-3">
          <span
            className="text-[10px] tracking-[0.14em]"
            style={{ color: "var(--text-faint)" }}
          >
            其他选择
          </span>
          <div className="flex flex-wrap justify-center gap-3 w-full">
            {alternatives.map((alt) => (
              <button
                key={alt.spread_id}
                onClick={() => onSelect(alt.spread_id)}
                className="hero-chip flex-1 sm:flex-none sm:min-w-[180px] justify-center"
              >
                <span className="text-[13px]">{alt.name_zh}</span>
                <span
                  className="text-[9px] tracking-[0.06em] px-1.5 py-0.5 rounded-full"
                  style={{
                    color: difficultyColor(alt.difficulty),
                    border: `1px solid ${difficultyColor(alt.difficulty)}33`,
                    background: `${difficultyColor(alt.difficulty)}11`,
                  }}
                >
                  {difficultyLabel(alt.difficulty)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-center mt-1">
        <button onClick={onBack} className="action-pill">
          <IconChevronLeft />
          <span>返回</span>
        </button>
      </div>
    </motion.div>
  );
}
