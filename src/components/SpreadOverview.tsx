"use client";

import { motion } from "framer-motion";
import type { DrawnCard, SpreadDefinition } from "@/lib/schema";
import CardImage from "./CardImage";
import { CornerOrnament, DividerLine } from "./ArchiveEmblems";

type Props = {
  spread: SpreadDefinition;
  cards: DrawnCard[];
  onBegin: () => void;
};

function IconSpark() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M12 3 L13 10 L20 11 L13 12 L12 19 L11 12 L4 11 L11 10 Z" />
    </svg>
  );
}

export default function SpreadOverview({ spread, cards, onBegin }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-[600px] mx-auto flex flex-col gap-6"
    >
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <DividerLine width={28} />
          <span className="text-[11px] tracking-[0.16em]" style={{ color: "var(--ink-warm)" }}>
            {spread.name_zh}
          </span>
          <DividerLine width={28} />
        </div>
        <p className="text-[13px] leading-[1.7]" style={{ color: "var(--text-tertiary)" }}>
          {spread.description_zh}
        </p>
      </div>

      {/* Cards grid — 2-col on desktop, single on mobile */}
      <div className="archive-border relative p-5 md:p-6" style={{ background: "var(--bg-glass)" }}>
        <CornerOrnament size={16} position="tl" className="absolute top-2 left-2" style={{ opacity: 0.4 }} />
        <CornerOrnament size={16} position="tr" className="absolute top-2 right-2" style={{ opacity: 0.4 }} />
        <CornerOrnament size={16} position="bl" className="absolute bottom-2 left-2" style={{ opacity: 0.4 }} />
        <CornerOrnament size={16} position="br" className="absolute bottom-2 right-2" style={{ opacity: 0.4 }} />

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {cards.map((dc, i) => (
            <motion.div
              key={dc.position_index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut", delay: i * 0.1 }}
              className="flex flex-col items-center gap-2"
            >
              <div
                className="w-full rounded-xl overflow-hidden"
                style={{
                  aspectRatio: "600 / 1050",
                  border: "1px solid var(--ink-filigree)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                }}
              >
                <CardImage
                  image={dc.card.image}
                  cardName={dc.card.name_en}
                  zhName={dc.card.name_zh}
                  orientation={dc.orientation}
                />
              </div>
              <span className="text-[11px] tracking-[0.04em] text-center" style={{ color: "var(--ink-warm)" }}>
                {dc.position.name_zh}
              </span>
              <span className="text-[9px] tracking-[0.06em]" style={{ color: "var(--text-faint)" }}>
                {dc.orientation === "upright" ? "正位" : "逆位"}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <button onClick={onBegin} className="btn-primary">
          <IconSpark />
          <span>开始解读</span>
        </button>
      </div>
    </motion.div>
  );
}
