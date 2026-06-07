"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MotifNote } from "@/components/MotifNote";
import type { Motif, Orientation } from "@/lib/schema";
import { partitionArchiveMotifs } from "@/lib/motifNormalize";
import CardImage from "./CardImage";
import { CornerOrnament } from "./ArchiveEmblems";

type Props = {
  image: string;
  cardName: string;
  zhName: string;
  orientation: Orientation;
  motifs: Motif[];
  activeMotifId?: string | null;
  bare?: boolean;
};

export default function AnnotatedCard({
  image,
  cardName,
  zhName,
  orientation,
  motifs,
  activeMotifId,
  bare = false,
}: Props) {
  const { left, right, all } = useMemo(
    () => partitionArchiveMotifs(motifs),
    [motifs],
  );

  const isReversed = orientation === "reversed";

  return (
    <div className="relative w-full annotated-card-grid archive-layout archive-layout--reading">
      <div className="note-column note-column--left annotated-card-labels">
        {!bare &&
          left.map((m) => (
            <MotifNote
              key={m.id}
              id={m.id}
              label_zh={m.label_zh}
              meaning_zh={m.meaning_zh}
              side="left"
              active={m.id === activeMotifId}
              dimmed={
                !!activeMotifId && m.id !== activeMotifId
              }
            />
          ))}
      </div>

      <div className="relative flex items-center justify-center annotated-card-stage-wrap">
        <div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            inset: "-12% -18%",
            background:
              "radial-gradient(ellipse 70% 60% at 50% 50%, var(--accent-a2) 0%, var(--accent-a0) 45%, rgba(0,0,0,0) 75%)",
            filter: "blur(8px)",
          }}
        />
        <div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            inset: "-8px",
            borderRadius: 22,
            border: "1px solid var(--brass-dim)",
            boxShadow: "0 0 0 1px var(--brass-dim) inset, 0 0 20px var(--brass-glow)",
            opacity: 0.35,
          }}
        />
        <CornerOrnament size={22} position="tl" className="absolute -top-0.5 -left-0.5 z-10" style={{ opacity: 0.5 }} />
        <CornerOrnament size={22} position="tr" className="absolute -top-0.5 -right-0.5 z-10" style={{ opacity: 0.5 }} />
        <CornerOrnament size={22} position="bl" className="absolute -bottom-0.5 -left-0.5 z-10" style={{ opacity: 0.5 }} />
        <CornerOrnament size={22} position="br" className="absolute -bottom-0.5 -right-0.5 z-10" style={{ opacity: 0.5 }} />

        <div className="card-stage card-stage--reading">
          <div className="absolute inset-0 rounded-[18px] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.05)_inset]">
            <CardImage
              image={image}
              cardName={cardName}
              zhName={zhName}
              orientation={orientation}
            />
          </div>

          {!bare &&
            all.map((m) => {
              const ax = isReversed ? 1 - m.anchor.x : m.anchor.x;
              const ay = isReversed ? 1 - m.anchor.y : m.anchor.y;
              const active = m.id === activeMotifId;
              return (
                <span
                  key={m.id}
                  className={`motif-anchor motif-anchor--readonly ${active ? "is-lit" : ""} ${
                    activeMotifId && !active ? "is-dim" : ""
                  }`}
                  style={{ left: `${ax * 100}%`, top: `${ay * 100}%` }}
                  aria-hidden
                />
              );
            })}

          <AnimatePresence>
            {!bare && activeMotifId && (() => {
              const m = all.find((x) => x.id === activeMotifId);
              if (!m) return null;
              const bx = isReversed ? 1 - m.highlight.x - m.highlight.w : m.highlight.x;
              const by = isReversed ? 1 - m.highlight.y - m.highlight.h : m.highlight.y;
              return (
                <motion.div
                  key={m.id}
                  layoutId="motif-glow"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    left: `${bx * 100}%`,
                    top: `${by * 100}%`,
                    width: `${m.highlight.w * 100}%`,
                    height: `${m.highlight.h * 100}%`,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 130,
                    damping: 22,
                  }}
                  className="absolute pointer-events-none"
                  style={{
                    borderRadius: "14px",
                    background:
                      "radial-gradient(ellipse 80% 70% at 50% 50%, var(--accent-a2) 0%, var(--accent-a0) 70%)",
                  }}
                />
              );
            })()}
          </AnimatePresence>
        </div>
      </div>

      <div className="note-column note-column--right annotated-card-labels">
        {!bare &&
          right.map((m) => (
            <MotifNote
              key={m.id}
              id={m.id}
              label_zh={m.label_zh}
              meaning_zh={m.meaning_zh}
              side="right"
              active={m.id === activeMotifId}
              dimmed={!!activeMotifId && m.id !== activeMotifId}
            />
          ))}
      </div>
    </div>
  );
}
