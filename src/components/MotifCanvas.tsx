"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, type Transition, type Variants } from "framer-motion";
import { partitionArchiveMotifs, type ArchiveMotif } from "@/lib/motifNormalize";
import type { Motif } from "@/lib/schema";

type Props = {
  cardImage: string;
  cardName: string;
  motifs: Motif[];
  maxMotifs?: number;
  debug?: boolean;
};

// Motion tokens
const EASE_SOFT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const SPRING_SMALL: Transition = {
  type: "spring",
  stiffness: 160,
  damping: 20,
  mass: 0.7,
};

// 桌面端固定像素布局：保证 anchor / popover / connector 三者坐标稳定
const CANVAS_W = 740;
const CARD_W = 320;
const CARD_H = Math.round((CARD_W * 1050) / 600); // 560
const POPOVER_W = 192;
const POPOVER_INSET = 8;
const CARD_LEFT = (CANVAS_W - CARD_W) / 2; // 210
const CARD_TOP = 0;

type PopoverPos = { x: number; y: number; side: "left" | "right" };

function derivePopover(m: ArchiveMotif): PopoverPos {
  const side: "left" | "right" =
    m.popoverSide === "left" || m.popoverSide === "right"
      ? m.popoverSide
      : m.anchor.x < 0.5
        ? "left"
        : "right";
  const x = side === "left" ? POPOVER_INSET : CANVAS_W - POPOVER_INSET - POPOVER_W;
  const anchorY = m.anchor.y * CARD_H;
  const y = Math.max(8, Math.min(CARD_H - 150, anchorY - 32));
  return { x, y, side };
}

function getAnchorPx(m: ArchiveMotif) {
  return { x: CARD_LEFT + m.anchor.x * CARD_W, y: CARD_TOP + m.anchor.y * CARD_H };
}

/** 手写感弧线：从 anchor 长到 popover 顶部 24px 处的连接点 */
function buildConnectorPath(m: ArchiveMotif): string {
  const a = getAnchorPx(m);
  const p = derivePopover(m);
  const popX = p.side === "left" ? p.x + POPOVER_W - 6 : p.x + 6;
  const popY = p.y + 24;
  const midX = (a.x + popX) / 2;
  return `M ${a.x} ${a.y} C ${midX} ${a.y} ${midX} ${popY} ${popX} ${popY}`;
}

export default function MotifCanvas({
  cardImage,
  cardName,
  motifs,
  maxMotifs = 6,
  debug = false,
}: Props) {
  const items: ArchiveMotif[] = useMemo(
    () => partitionArchiveMotifs(motifs).all.slice(0, maxMotifs),
    [motifs, maxMotifs],
  );

  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const visibleId = hoverId ?? activeId;
  const visible = items.find((m) => m.id === visibleId) ?? null;

  // 切换牌时重置（派生 state 模式）
  const [prevCard, setPrevCard] = useState(cardImage);
  if (prevCard !== cardImage) {
    setPrevCard(cardImage);
    setActiveId(null);
    setHoverId(null);
  }

  if (items.length === 0) {
    return (
      <div className="motif-canvas motif-canvas--empty">
        <div className="motif-canvas__card-frame motif-canvas__card-frame--solo">
          <Image
            src={cardImage}
            alt={cardName}
            fill
            sizes="320px"
            className="motif-canvas__image"
            priority
          />
        </div>
      </div>
    );
  }

  const containerVariants: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } },
  };
  const dotVariants: Variants = {
    hidden: { opacity: 0, scale: 0.7 },
    show: { opacity: 1, scale: 1, transition: SPRING_SMALL },
  };

  return (
    <>
      {/* ── 桌面 / 平板 ── */}
      <div className="motif-canvas">
        <div
          className="motif-canvas__inner"
          style={{ width: `${CANVAS_W}px`, height: `${CARD_H}px` }}
        >
          {/* 牌面（含 image 与高亮 overlay） */}
          <div
            className="motif-canvas__card-frame"
            style={{ left: `${CARD_LEFT}px`, top: `${CARD_TOP}px`, width: `${CARD_W}px`, height: `${CARD_H}px` }}
          >
            <Image
              src={cardImage}
              alt={cardName}
              fill
              sizes="320px"
              className="motif-canvas__image"
              priority
            />
          </div>

          {/* 高亮层（与牌面同 bounding box，但不裁剪） */}
          <div
            className="motif-canvas__overlay"
            style={{ left: `${CARD_LEFT}px`, top: `${CARD_TOP}px`, width: `${CARD_W}px`, height: `${CARD_H}px` }}
          >
            <AnimatePresence>
              {visible && visible.precision === "precise" && (
                <motion.div
                  key={`hl-${visible.id}`}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.32, ease: EASE_SOFT }}
                  className={`motif-highlight motif-highlight--${visible.highlight.shape}`}
                  style={{
                    left: `${visible.highlight.x * 100}%`,
                    top: `${visible.highlight.y * 100}%`,
                    width: `${visible.highlight.w * 100}%`,
                    height: `${visible.highlight.h * 100}%`,
                  }}
                />
              )}
              {visible && visible.precision === "approximate" && (
                // 近似坐标：放弃精确 bbox 框，改用以 anchor 为中心的柔光 spot
                // —— 不假装"严格圈住这个符号"，但仍指明"大约在这里"
                <motion.div
                  key={`spot-${visible.id}`}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.4, ease: EASE_SOFT }}
                  className="motif-spot"
                  style={{
                    left: `${visible.anchor.x * 100}%`,
                    top: `${visible.anchor.y * 100}%`,
                  }}
                />
              )}
            </AnimatePresence>
          </div>

          {/* SVG 手写感连接线 */}
          <svg
            className="motif-canvas__svg"
            width={CANVAS_W}
            height={CARD_H}
            viewBox={`0 0 ${CANVAS_W} ${CARD_H}`}
            preserveAspectRatio="xMidYMid meet"
            aria-hidden
          >
            <AnimatePresence>
              {visible && (
                <motion.path
                  key={`conn-${visible.id}`}
                  d={buildConnectorPath(visible)}
                  fill="none"
                  className="motif-connector"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.18 } }}
                  transition={{ duration: 0.55, ease: EASE_SOFT }}
                />
              )}
            </AnimatePresence>
          </svg>

          {/* Hotspot 层（独立于牌面 frame 之外，所以连接线下方仍能看到 dot） */}
          <motion.div
            className="motif-canvas__hotspots"
            style={{ left: `${CARD_LEFT}px`, top: `${CARD_TOP}px`, width: `${CARD_W}px`, height: `${CARD_H}px` }}
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {items.map((m) => {
              const isLit = m.id === visibleId;
              const isDim = activeId !== null && m.id !== activeId && m.id !== visibleId;
              return (
                <motion.button
                  key={m.id}
                  type="button"
                  variants={dotVariants}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.92 }}
                  transition={SPRING_SMALL}
                  className={`motif-hotspot ${isLit ? "is-lit" : ""} ${isDim ? "is-dim" : ""}`}
                  style={{ left: `${m.anchor.x * 100}%`, top: `${m.anchor.y * 100}%` }}
                  onMouseEnter={() => setHoverId(m.id)}
                  onMouseLeave={() => setHoverId(null)}
                  onFocus={() => setHoverId(m.id)}
                  onBlur={() => setHoverId(null)}
                  onClick={() =>
                    setActiveId((prev) => (prev === m.id ? null : m.id))
                  }
                  aria-label={m.label_zh}
                >
                  <span className="motif-hotspot__halo" aria-hidden />
                  <span className="motif-hotspot__dot" />
                </motion.button>
              );
            })}
          </motion.div>

          {/* 浮动注释卡 */}
          <AnimatePresence>
            {visible && (
              <PopoverFloating key={`pop-${visible.id}`} m={visible} />
            )}
          </AnimatePresence>

          {debug &&
            items.map((m) => (
              <div
                key={`dbg-${m.id}`}
                className="motif-canvas__dbg-label"
                style={{
                  left: `${CARD_LEFT + m.anchor.x * CARD_W}px`,
                  top: `${CARD_TOP + m.anchor.y * CARD_H}px`,
                }}
              >
                {m.id} · {m.anchor.x.toFixed(2)},{m.anchor.y.toFixed(2)}
              </div>
            ))}
        </div>
      </div>

      {/* ── 移动端：牌面上 / popover 在下 ── */}
      <div className="motif-canvas-mobile">
        <div className="motif-canvas-mobile__card">
          <Image
            src={cardImage}
            alt={cardName}
            fill
            sizes="80vw"
            className="motif-canvas__image"
            priority
          />
          <AnimatePresence>
            {visible && visible.precision === "precise" && (
              <motion.div
                key={`hlm-${visible.id}`}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3, ease: EASE_SOFT }}
                className={`motif-highlight motif-highlight--${visible.highlight.shape}`}
                style={{
                  left: `${visible.highlight.x * 100}%`,
                  top: `${visible.highlight.y * 100}%`,
                  width: `${visible.highlight.w * 100}%`,
                  height: `${visible.highlight.h * 100}%`,
                }}
              />
            )}
            {visible && visible.precision === "approximate" && (
              <motion.div
                key={`spotm-${visible.id}`}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.36, ease: EASE_SOFT }}
                className="motif-spot"
                style={{
                  left: `${visible.anchor.x * 100}%`,
                  top: `${visible.anchor.y * 100}%`,
                }}
              />
            )}
          </AnimatePresence>

          <motion.div
            className="motif-canvas-mobile__hotspots"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {items.map((m) => {
              const isLit = m.id === visibleId;
              const isDim = activeId !== null && m.id !== activeId && m.id !== visibleId;
              return (
                <motion.button
                  key={m.id}
                  type="button"
                  variants={dotVariants}
                  whileTap={{ scale: 0.92 }}
                  transition={SPRING_SMALL}
                  className={`motif-hotspot ${isLit ? "is-lit" : ""} ${isDim ? "is-dim" : ""}`}
                  style={{ left: `${m.anchor.x * 100}%`, top: `${m.anchor.y * 100}%` }}
                  onClick={() =>
                    setActiveId((prev) => (prev === m.id ? null : m.id))
                  }
                  aria-label={m.label_zh}
                >
                  <span className="motif-hotspot__halo" aria-hidden />
                  <span className="motif-hotspot__dot" />
                </motion.button>
              );
            })}
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {visible ? (
            <motion.div
              key={`popm-${visible.id}`}
              className="motif-popover motif-popover--mobile"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3, ease: EASE_SOFT }}
            >
              <PopoverBody m={visible} />
            </motion.div>
          ) : (
            <motion.p
              key="popm-empty"
              className="motif-popover-hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              轻触牌面上的金色符号点。
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

function PopoverFloating({ m }: { m: ArchiveMotif }) {
  const p = derivePopover(m);
  return (
    <motion.div
      className={`motif-popover motif-popover--${p.side}`}
      style={{ left: `${p.x}px`, top: `${p.y}px`, width: `${POPOVER_W}px` }}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -3 }}
      transition={{ duration: 0.32, ease: EASE_SOFT }}
    >
      <PopoverBody m={m} />
    </motion.div>
  );
}

function PopoverBody({ m }: { m: ArchiveMotif }) {
  const showSource = !!m.traditional_note_zh && m.traditional_note_zh !== m.meaning_zh;
  return (
    <>
      <h3 className="motif-popover__title">{m.label_zh}</h3>
      <p className="motif-popover__body">{m.meaning_zh}</p>
      {showSource && (
        <>
          <div className="motif-popover__divider" />
          <p className="motif-popover__source">{m.traditional_note_zh}</p>
        </>
      )}
    </>
  );
}
