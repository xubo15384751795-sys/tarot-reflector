"use client";

import { useLayoutEffect, useRef } from "react";
import { motion } from "framer-motion";
import { CornerOrnament, DividerLine } from "./ArchiveEmblems";
import {
  captureSpreadFlipState,
  playSpreadSelectionFlip,
  type SpreadFlipState,
} from "@/features/motion/spreadFlip.gsap";

type SpreadItem = {
  spread_id: string;
  name_zh: string;
  description_zh: string;
  card_count: number;
  difficulty: string;
};

type Props = {
  spreads: SpreadItem[];
  selected: string | null;
  onSelect: (spread_id: string) => void;
  onConfirm: () => void;
  onBack?: () => void;
};

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

function CardCountDots({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="rounded-full"
          style={{
            width: 6,
            height: 6,
            background: "var(--ink-filigree)",
            opacity: 0.6,
          }}
        />
      ))}
    </div>
  );
}

export default function SpreadSelector({
  spreads,
  selected,
  onSelect,
  onConfirm,
  onBack,
}: Props) {
  const gridRef = useRef<HTMLDivElement>(null);
  const flipStateRef = useRef<SpreadFlipState | null>(null);

  const handleSelect = (spreadId: string) => {
    if (!gridRef.current || spreadId === selected) return;
    flipStateRef.current = captureSpreadFlipState(gridRef.current);
    onSelect(spreadId);
  };

  useLayoutEffect(() => {
    if (!selected || !gridRef.current || !flipStateRef.current) return;
    const state = flipStateRef.current;
    flipStateRef.current = null;
    playSpreadSelectionFlip(state, gridRef.current, selected);
  }, [selected]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-[560px] mx-auto flex flex-col gap-6"
    >
      <div className="flex items-center justify-center gap-3">
        <DividerLine width={28} />
        <span className="text-[11px] tracking-[0.16em]" style={{ color: "var(--ink-warm)" }}>
          选择牌阵
        </span>
        <DividerLine width={28} />
      </div>

      <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {spreads.map((spread, i) => {
          const active = selected === spread.spread_id;
          return (
            <motion.div
              key={spread.spread_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut", delay: i * 0.06 }}
            >
              <button
                type="button"
                data-spread={spread.spread_id}
                onClick={() => handleSelect(spread.spread_id)}
                className={`spread-card relative w-full text-left archive-border-thin ${
                  active ? "is-active" : ""
                }`}
                style={{
                  padding: "18px 20px",
                  background: active ? "var(--accent-dim)" : "var(--bg-glass)",
                  borderColor: active ? "var(--accent)" : "var(--ink-filigree)",
                }}
              >
                {active && (
                  <>
                    <CornerOrnament size={14} position="tl" className="absolute top-1 left-1" style={{ opacity: 0.5 }} />
                    <CornerOrnament size={14} position="tr" className="absolute top-1 right-1" style={{ opacity: 0.5 }} />
                    <CornerOrnament size={14} position="bl" className="absolute bottom-1 left-1" style={{ opacity: 0.5 }} />
                    <CornerOrnament size={14} position="br" className="absolute bottom-1 right-1" style={{ opacity: 0.5 }} />
                  </>
                )}

                <div className="flex items-center gap-2 mb-2">
                  <CardCountDots count={spread.card_count} />
                  <span
                    className="text-[9px] tracking-[0.06em] px-1.5 py-0.5 rounded-full ml-auto"
                    style={{
                      color: difficultyColor(spread.difficulty),
                      border: `1px solid ${difficultyColor(spread.difficulty)}33`,
                      background: `${difficultyColor(spread.difficulty)}11`,
                    }}
                  >
                    {difficultyLabel(spread.difficulty)}
                  </span>
                </div>

                <h4 className="text-[15px] font-light tracking-[-0.005em] mb-1" style={{ color: "var(--text-primary)" }}>
                  {spread.name_zh}
                </h4>
                <p className="text-[11px] leading-[1.6]" style={{ color: "var(--text-tertiary)" }}>
                  {spread.description_zh}
                </p>
              </button>
            </motion.div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-3">
        {onBack && (
          <button onClick={onBack} className="action-pill">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="14,6 8,12 14,18" />
            </svg>
            <span>返回推荐</span>
          </button>
        )}
        <button
          onClick={onConfirm}
          disabled={!selected}
          className="btn-primary"
          style={{
            opacity: selected ? 1 : 0.3,
            cursor: selected ? "pointer" : "not-allowed",
          }}
        >
          <span>确认选牌阵</span>
        </button>
      </div>
    </motion.div>
  );
}
