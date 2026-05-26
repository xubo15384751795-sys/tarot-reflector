"use client";

/**
 * ReadingSummary — 一次解读的"档案最后一页"
 *
 * 视觉策略：综合收束页和"逐张解读"不能像同一种东西。
 * 这里强化三处差异：
 *   1. 顶部一排牌阵全景缩略图 + 位置名，立刻让用户看到"我看过的所有牌"
 *   2. thesis 变成带引号的章节式 quote，不是另一段正文
 *   3. 整体留白更大，更像"档案的封底页"
 */

import Image from "next/image";
import { motion } from "framer-motion";
import { DividerLine, ArchiveLabel } from "./ArchiveEmblems";
import type { Orientation } from "@/lib/schema";

type Analysis = {
  major_arcana_count: number;
  dominant_suit: string | null;
  reversal_count: number;
  relationship_notes: string[];
};

type SummaryCard = {
  card_id: string;
  zh_name: string;
  image: string;
  orientation: Orientation;
  position_name: string;
  position_index: number;
};

type Props = {
  title: string;
  summary: string;
  analysis: Analysis;
  /** 牌阵里的所有牌，按 position_index 升序传入 */
  cards: SummaryCard[];
  onReplay: () => void;
  onWriteNote: () => void;
  onClose: () => void;
};

function suitName(s: string): string {
  const map: Record<string, string> = {
    wands: "权杖",
    cups: "圣杯",
    swords: "宝剑",
    pentacles: "星币",
  };
  return map[s] ?? s;
}

/** 顶部牌阵全景缩略 · 让综合页一眼区别于逐张页 */
function CardThumbnailStrip({ cards }: { cards: SummaryCard[] }) {
  return (
    <div className="flex justify-center gap-3 sm:gap-4 flex-wrap">
      {cards.map((c, i) => (
        <motion.div
          key={`${c.card_id}-${i}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
          className="flex flex-col items-center gap-1.5"
        >
          <div
            className="relative overflow-hidden rounded-[6px]"
            style={{
              width: 52,
              aspectRatio: "600/1050",
              border: "1px solid var(--border-glass)",
              boxShadow:
                "0 2px 6px rgba(0,0,0,0.16), 0 8px 20px rgba(0,0,0,0.12)",
              transform: c.orientation === "reversed" ? "rotate(180deg)" : undefined,
            }}
          >
            <Image
              src={c.image}
              alt={c.zh_name}
              fill
              sizes="52px"
              className="object-cover"
            />
          </div>
          <span
            className="text-[9px] tracking-[0.10em] text-center"
            style={{ color: "var(--text-faint)", maxWidth: 64, lineHeight: 1.3 }}
          >
            {c.position_name}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

export default function ReadingSummary({
  title,
  summary,
  analysis,
  cards,
  onReplay,
  onWriteNote,
  onClose,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-[580px] mx-auto flex flex-col gap-8"
    >
      {/* ── 牌阵全景缩略 — 综合页独有的"全景视角" ── */}
      {cards.length > 0 && <CardThumbnailStrip cards={cards} />}

      {/* ── 章节标识 + 标题 ── */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <DividerLine width={36} />
          <ArchiveLabel code="COD.SUM" />
          <DividerLine width={36} />
        </div>
        <h2
          className="hero-title text-[28px] md:text-[34px] font-light tracking-[-0.015em] leading-[1.25]"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </h2>
        <p
          className="mt-3 text-[10.5px] tracking-[0.22em]"
          style={{ color: "var(--text-faint)" }}
        >
          档 案 · 总 览
        </p>
      </div>

      {/* ── 综合 thesis · 引文样式区分于"另一段正文" ── */}
      <div className="relative px-6 md:px-10 py-2 mx-auto max-w-[480px]">
        <span
          aria-hidden
          className="absolute left-0 top-0 text-[42px] leading-none select-none"
          style={{ color: "var(--accent)", opacity: 0.35, fontFamily: "var(--font-serif-like)" }}
        >
          “
        </span>
        <p
          className="text-[15px] md:text-[16px] leading-[1.85] tracking-[-0.003em] whitespace-pre-line text-center"
          style={{
            color: "var(--text-primary)",
            fontFamily: "var(--font-serif-like)",
            fontStyle: "italic",
          }}
        >
          {summary}
        </p>
        <span
          aria-hidden
          className="absolute right-0 bottom-0 text-[42px] leading-none select-none"
          style={{ color: "var(--accent)", opacity: 0.35, fontFamily: "var(--font-serif-like)" }}
        >
          ”
        </span>
      </div>

      {/* ── 牌阵格局徽章 ── */}
      <div className="flex flex-wrap gap-2 justify-center">
        <span className="pill-accent">
          大牌 {analysis.major_arcana_count} 张
        </span>
        {analysis.dominant_suit && (
          <span className="pill-accent">
            主导 {suitName(analysis.dominant_suit)}
          </span>
        )}
        <span className="pill-accent">
          逆位 {analysis.reversal_count} 张
        </span>
      </div>

      {/* ── 牌间关系 · 折叠成卡片块，与"逐张解读"列表区分 ── */}
      {analysis.relationship_notes.length > 0 && (
        <div
          className="flex flex-col gap-3 px-5 py-4 rounded-2xl"
          style={{
            background: "var(--bg-glass)",
            border: "1px solid var(--border-glass)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="block w-1 h-3"
              style={{ background: "var(--accent)", opacity: 0.6 }}
            />
            <span className="text-[10.5px] tracking-[0.16em]" style={{ color: "var(--accent)", opacity: 0.85 }}>
              牌 间 关 系
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {analysis.relationship_notes.map((note, i) => (
              <p
                key={i}
                className="text-[12.5px] leading-[1.7]"
                style={{ color: "var(--text-secondary)" }}
              >
                {note}
              </p>
            ))}
          </div>
        </div>
      )}

      <DividerLine width={48} className="mx-auto" />

      {/* ── Coda-style 行动 ── */}
      <div className="flex flex-col gap-2.5">
        <button onClick={onWriteNote} className="coda-action">
          <span className="coda-glyph">✎</span>
          <span>写下我的感受</span>
        </button>
        <button onClick={onReplay} className="coda-action">
          <span className="coda-glyph">↻</span>
          <span>重新看一遍</span>
        </button>
        <button onClick={onClose} className="coda-action">
          <span className="coda-glyph">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M2 6h7l2-2h9v16H2z" />
              <path d="M2 6v14" />
            </svg>
          </span>
          <span>合上档案</span>
        </button>
      </div>
    </motion.div>
  );
}
