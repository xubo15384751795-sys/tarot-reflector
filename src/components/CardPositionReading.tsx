"use client";

import { motion } from "framer-motion";
import AnnotatedCard from "./AnnotatedCard";
import type { Motif, Orientation, SpreadPosition } from "@/lib/schema";

type Props = {
  cardImage: string;
  cardName: string;
  zhName: string;
  orientation: Orientation;
  position: SpreadPosition;
  motifs: Motif[];
  reading: string;
  onNext: () => void;
  isLast: boolean;
  /** 当前位置序号（从 1 开始） */
  positionNumber?: number;
  /** 总牌数 */
  totalCards?: number;
};

function IconChevronRight() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="10,6 16,12 10,18" />
    </svg>
  );
}

export default function CardPositionReading({
  cardImage,
  cardName,
  zhName,
  orientation,
  position,
  motifs,
  reading,
  onNext,
  isLast,
  positionNumber,
  totalCards,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -15, scale: 0.98, filter: "blur(4px)" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-[560px] mx-auto"
    >
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,_1fr)_minmax(0,_1.1fr)] gap-8 md:gap-10">
        {/* Card */}
        <div className="flex flex-col items-center">
          {/* Position counter */}
          {positionNumber != null && totalCards != null && totalCards > 1 && (
            <div className="mb-2 flex items-center gap-2">
              {Array.from({ length: totalCards }, (_, i) => (
                <span
                  key={i}
                  className="transition-all duration-400"
                  style={{
                    width: i + 1 === positionNumber ? 18 : 6,
                    height: 3,
                    borderRadius: 2,
                    background: i + 1 === positionNumber ? "var(--accent)" : "var(--border-glass)",
                  }}
                />
              ))}
              <span className="ml-1 text-[10px] tabular-nums" style={{ color: "var(--text-faint)" }}>
                {positionNumber}/{totalCards}
              </span>
            </div>
          )}
          <div className="mb-3 text-center">
            <div className="flex items-center justify-center gap-2">
              <h3 className="text-[length:var(--text-title-md)] font-light tracking-[-0.01em]" style={{ color: "var(--text-primary)" }}>
                {zhName}
              </h3>
              <span className="text-[10px] tracking-[0.08em] px-2 py-0.5 rounded-full annotation-ink" style={{ color: "var(--ink-warm)", border: "1px solid var(--ink-filigree)" }}>
                {orientation === "upright" ? "正位" : "逆位"}
              </span>
            </div>
          </div>
          <AnnotatedCard
            image={cardImage}
            cardName={cardName}
            zhName={zhName}
            orientation={orientation}
            motifs={motifs}
          />
        </div>

        {/* Position context + reading */}
        <div className="flex flex-col gap-4">
          {/* Position context */}
          <div className="subcard">
            <span className="text-[10px] tracking-[0.14em]" style={{ color: "var(--ink-warm)" }}>
              {position.name_zh} · 位置
            </span>
            <p className="text-[13px] leading-[1.7] mt-1" style={{ color: "var(--text-secondary)" }}>
              {position.meaning_zh}
            </p>
          </div>

          {/* Warning if present */}
          {position.warning && (
            <div
              className="rounded-xl px-4 py-3"
              style={{
                border: "1px solid rgba(196, 65, 51, 0.15)",
                background: "rgba(196, 65, 51, 0.04)",
              }}
            >
              <p className="text-[12px] leading-[1.7]" style={{ color: "var(--text-secondary)" }}>
                {position.warning}
              </p>
            </div>
          )}

          {/* Reading text */}
          <div className="flex-1">
            <p className="text-[14px] leading-[1.8] tracking-[-0.003em] whitespace-pre-line" style={{ color: "var(--text-secondary)" }}>
              {reading}
            </p>
          </div>

          {/* Next button */}
          <div className="flex justify-end pt-2">
            <button onClick={onNext} className="btn-primary" style={{ padding: "12px 26px", fontSize: "14px" }}>
              <span>{isLast ? "查看关系分析" : "继续翻阅"}</span>
              <IconChevronRight />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
