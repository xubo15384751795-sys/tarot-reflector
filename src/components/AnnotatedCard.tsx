"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Motif, Orientation } from "@/lib/schema";
import CardImage from "./CardImage";
import { CornerOrnament } from "./ArchiveEmblems";

type Props = {
  /** Path under /public to the real RWS card image. Required. */
  image: string;
  cardName: string;
  zhName: string;
  orientation: Orientation;
  motifs: Motif[];
  number?: number;
  activeMotifId?: string | null;
  /** When true, hide all annotations so the user can see the whole card face. */
  bare?: boolean;
  /** Captions shown next to each motif label, keyed by motif id. */
  captionMap?: Record<string, string>;
};

// Where each motif's label sits relative to the card. We split motifs into
// left and right columns, ordered top-to-bottom by bbox.y.
function partitionMotifs(motifs: Motif[]) {
  // Sort by vertical position.
  const sorted = [...motifs].sort((a, b) => a.bbox.y - b.bbox.y);

  let left: Motif[] = [];
  let right: Motif[] = [];
  sorted.forEach((m) => {
    const cx = m.bbox.x + m.bbox.w / 2;
    if (cx < 0.5) left.push(m);
    else right.push(m);
  });

  // If everything ended up on one side (common when bboxes are centered),
  // discard that split and alternate top-to-bottom instead.
  if (left.length === 0 || right.length === 0) {
    left = [];
    right = [];
    sorted.forEach((m, i) => {
      (i % 2 === 0 ? left : right).push(m);
    });
  }

  left.sort((a, b) => a.bbox.y - b.bbox.y);
  right.sort((a, b) => a.bbox.y - b.bbox.y);
  return { left, right };
}

function MotifLabel({
  motif,
  active,
  caption,
  side,
}: {
  motif: Motif;
  active: boolean;
  caption?: string;
  side: "left" | "right";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: side === "left" ? -8 : 8 }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`flex flex-col ${
        side === "left" ? "items-end text-right" : "items-start text-left"
      } gap-0.5`}
    >
      <span
          className={`text-[12px] tracking-[0.02em] font-normal transition-colors duration-500 ${!active ? "annotation-ink" : ""}`}
          style={{ color: active ? "var(--accent)" : undefined }}
        >
          {motif.label}
        </span>
        {caption && (
          <span
            className="text-[10px] tracking-[0.02em] leading-[1.4] transition-colors duration-500"
            style={{ color: active ? "var(--accent)" : "var(--ink-cool)", opacity: active ? 0.7 : 1 }}
          >
            {caption}
          </span>
        )}
    </motion.div>
  );
}

export default function AnnotatedCard({
  image,
  cardName,
  zhName,
  orientation,
  motifs,
  number: _number,
  activeMotifId,
  bare = false,
  captionMap,
}: Props) {
  const { left, right } = partitionMotifs(motifs);

  // The card occupies a fixed central column; labels sit in left/right
  // columns that match the card's vertical extent.
  return (
    <div className="relative w-full annotated-card-grid">
      {/* Left labels column — 仅在 ≥md 展示；移动端隐藏，把空间让给牌面本身 */}
      <div className="annotated-card-labels flex flex-col justify-between py-2">
        {!bare &&
          left.map((m) => (
            <div
              key={m.id}
              className="flex justify-end"
              style={{ flex: "1 1 0" }}
            >
              <MotifLabel
                motif={m}
                active={m.id === activeMotifId}
                caption={captionMap?.[m.id]}
                side="left"
              />
            </div>
          ))}
      </div>

      {/* Card column */}
      <div className="relative flex items-center justify-center">
        {/* Outer warm gold glow */}
        <div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            inset: "-12% -18%",
            background:
              "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(206, 185, 138, 0.16) 0%, rgba(206, 185, 138, 0.04) 45%, rgba(0,0,0,0) 75%)",
            filter: "blur(8px)",
          }}
        />

        {/* Brass archive frame */}
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

        <div
          className="relative card-stage"
          style={{
            aspectRatio: "600 / 1050",
            width: "100%",
          }}
        >
          {/* The real card image */}
          <div className="absolute inset-0 rounded-[18px] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.05)_inset]">
            <CardImage
              image={image}
              cardName={cardName}
              zhName={zhName}
              orientation={orientation}
            />
          </div>

          {/* Motif dots — small ring at the centre of every bbox.
              Positioned in % so they track the card under any aspect ratio. */}
          {!bare &&
            motifs.map((m) => {
              const isReversed = orientation === "reversed";
              const cx = m.bbox.x + m.bbox.w / 2;
              const cy = m.bbox.y + m.bbox.h / 2;
              const x = isReversed ? 1 - cx : cx;
              const y = isReversed ? 1 - cy : cy;
              const active = m.id === activeMotifId;
              return (
                <div
                  key={m.id}
                  className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${x * 100}%`,
                    top: `${y * 100}%`,
                    width: active ? 18 : 12,
                    height: active ? 18 : 12,
                    borderRadius: 999,
                    border: `1px solid ${
                      active ? "rgba(206,185,138,1)" : "rgba(206,185,138,0.45)"
                    }`,
                    boxShadow: active
                      ? "0 0 14px rgba(206,185,138,0.55)"
                      : undefined,
                    transition: "all 0.5s cubic-bezier(0.4,0,0.2,1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      width: active ? 6 : 3,
                      height: active ? 6 : 3,
                      borderRadius: 999,
                      background: active
                        ? "rgba(206,185,138,1)"
                        : "rgba(206,185,138,0.55)",
                      transition: "all 0.5s cubic-bezier(0.4,0,0.2,1)",
                    }}
                  />
                </div>
              );
            })}

          {/* Active motif glow band — soft glow over the active region */}
          <AnimatePresence>
            {!bare && activeMotifId && (() => {
              const m = motifs.find((x) => x.id === activeMotifId);
              if (!m) return null;
              const isReversed = orientation === "reversed";
              const bx = isReversed ? 1 - m.bbox.x - m.bbox.w : m.bbox.x;
              const by = isReversed ? 1 - m.bbox.y - m.bbox.h : m.bbox.y;
              return (
                <motion.div
                  key={m.id}
                  layoutId="motif-glow"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    left: `${bx * 100}%`,
                    top: `${by * 100}%`,
                    width: `${m.bbox.w * 100}%`,
                    height: `${m.bbox.h * 100}%`,
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
                      "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(206,185,138,0.18) 0%, rgba(206,185,138,0) 70%)",
                  }}
                />
              );
            })()}
          </AnimatePresence>
        </div>
      </div>

      {/* Right labels column — 同样在移动端隐藏 */}
      <div className="annotated-card-labels flex flex-col justify-between py-2">
        {!bare &&
          right.map((m) => (
            <div
              key={m.id}
              className="flex justify-start"
              style={{ flex: "1 1 0" }}
            >
              <MotifLabel
                motif={m}
                active={m.id === activeMotifId}
                caption={captionMap?.[m.id]}
                side="right"
              />
            </div>
          ))}
      </div>
    </div>
  );
}
