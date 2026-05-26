"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import MotifCanvas from "@/components/MotifCanvas";
import { DividerLine, ArchiveLabel } from "@/components/ArchiveEmblems";
import type { Motif } from "@/lib/schema";
import type { ArchiveCardData } from "./types";
import { getMotifsForCard } from "./dataset";

type MeaningTabId = "upright" | "reversed" | "motifs" | "spread";

export function CardDetailModal({
  card,
  onClose,
  debugMotifs,
}: {
  card: ArchiveCardData;
  onClose: () => void;
  debugMotifs: boolean;
}) {
  const motifs = getMotifsForCard(card);
  const hasApproximate = motifs.some((m) => m.precision === "approximate");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
      style={{ background: "rgba(8,7,10,0.88)", backdropFilter: "blur(16px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="relative w-full max-w-[820px] max-h-[90vh] overflow-y-auto archive-card-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="archive-card-modal__close absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full transition-colors"
        >
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </button>

        <header className="archive-card-header">
          <div className="archive-card-header__meta">
            <DividerLine width={24} />
            <ArchiveLabel code={`M.${String(card.number ?? 0).padStart(2, "0")}`} />
            <DividerLine width={24} />
          </div>
          <h2 className="card-title-zh">{card.name_zh}</h2>
          <p className="card-title-en">{card.name_en}</p>
        </header>

        <section className="archive-card-stage-section">
          {debugMotifs && motifs.length > 0 && (
            <div className="archive-debug-banner">
              DEBUG · ?debugMotifs=1 · anchor 坐标已开启
            </div>
          )}
          {motifs.length > 0 ? (
            <>
              <MotifCanvas
                cardImage={card.image}
                cardName={card.name_en}
                motifs={motifs}
                debug={debugMotifs}
              />
              {hasApproximate && (
                <p className="motif-precision-hint" aria-live="polite">
                  · 牌面符号坐标为示意位置，并非传统 RWS 严格对位 ·
                </p>
              )}
            </>
          ) : (
            <div className="motif-canvas motif-canvas--empty">
              <div className="motif-canvas__card-frame motif-canvas__card-frame--solo">
                <Image
                  src={card.image}
                  alt={card.name_en}
                  fill
                  sizes="320px"
                  className="motif-canvas__image"
                  priority
                />
              </div>
            </div>
          )}
        </section>

        <ArchiveMeaningTabs card={card} motifs={motifs} />
      </motion.div>
    </motion.div>
  );
}

function ArchiveMeaningTabs({
  card,
  motifs,
}: {
  card: ArchiveCardData;
  motifs: Motif[];
}) {
  const [tab, setTab] = useState<MeaningTabId>("upright");
  const tabs: { id: MeaningTabId; label: string }[] = [
    { id: "upright", label: "正位" },
    { id: "reversed", label: "逆位" },
    { id: "motifs", label: "牌面符号" },
    { id: "spread", label: "牌阵中的含义" },
  ];

  return (
    <section className="meaning-tabs">
      <div className="meaning-tabs__bar" role="tablist">
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              className={`meaning-tabs__pill ${active ? "is-active" : ""}`}
              onClick={() => setTab(t.id)}
              type="button"
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          className="meaning-tabs__panel"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          {tab === "upright" && (
            <MeaningSection
              kind="upright"
              keywords={card.traditional.upright.keywords_zh}
              meaning={card.traditional.upright.meaning_zh}
            />
          )}
          {tab === "reversed" && (
            <MeaningSection
              kind="reversed"
              keywords={card.traditional.reversed.keywords_zh}
              meaning={card.traditional.reversed.meaning_zh}
            />
          )}
          {tab === "motifs" && <MotifListPanel motifs={motifs} />}
          {tab === "spread" && <SpreadHintPanel card={card} />}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

function MeaningSection({
  kind,
  keywords,
  meaning,
}: {
  kind: "upright" | "reversed";
  keywords: string[];
  meaning: string;
}) {
  return (
    <>
      <div className="meaning-keywords">
        {keywords.map((kw) => (
          <span
            key={kw}
            className={`keyword-chip ${kind === "reversed" ? "keyword-chip--muted" : ""}`}
          >
            {kw}
          </span>
        ))}
      </div>
      <p className="meaning-text">{meaning}</p>
    </>
  );
}

function MotifListPanel({ motifs }: { motifs: Motif[] }) {
  if (motifs.length === 0) {
    return (
      <p className="meaning-text meaning-text--muted">
        这张牌暂未登记 motif 数据。
      </p>
    );
  }
  return (
    <ul className="motif-list">
      {motifs.slice(0, 6).map((m, idx) => (
        <li key={m.id} className="motif-list__item">
          <span className="motif-list__no">{String(idx + 1).padStart(2, "0")}</span>
          <div className="motif-list__body">
            <h4 className="motif-list__title">{m.label_zh ?? m.label}</h4>
            <p className="motif-list__text">{m.meaning_zh ?? m.meaning}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function SpreadHintPanel({ card }: { card: ArchiveCardData }) {
  const map = card.domain_mapping;
  if (!map || Object.keys(map).length === 0) {
    return (
      <p className="meaning-text meaning-text--muted">
        这张牌在不同牌阵位置中的具体提示会在「解读」中根据你的问题动态生成。
      </p>
    );
  }
  return (
    <dl className="spread-map">
      {Object.entries(map).map(([key, value]) => (
        <div key={key} className="spread-map__row">
          <dt className="spread-map__key">{key}</dt>
          <dd className="spread-map__value">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
