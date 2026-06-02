"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { MotifNote } from "@/components/MotifNote";
import { MotifHotspot } from "@/components/ui/MotifHotspot";
import { SymbolPopover } from "@/components/ui/SymbolPopover";
import { TarotCardFrame } from "@/components/ui/TarotCardFrame";
import { useMotifConnector } from "@/hooks/useMotifConnector";
import {
  useReducedMotion,
  animateMotifConnector,
  hideMotifConnector,
  staggerHotspots,
  showMotifHighlight,
  hideMotifHighlight,
} from "@/features/motion";
import { partitionArchiveMotifs, type ArchiveMotif } from "@/lib/motifNormalize";
import type { Motif } from "@/lib/schema";

type Props = {
  cardImage: string;
  cardName: string;
  motifs: Motif[];
  maxMotifs?: number;
  debug?: boolean;
};

function MotifAnchor({
  motif,
  active,
  dimmed,
  debug,
  popover,
  onHover,
  onHoverEnd,
  onToggle,
}: {
  motif: ArchiveMotif;
  active: boolean;
  dimmed: boolean;
  debug: boolean;
  popover: boolean;
  onHover: () => void;
  onHoverEnd: () => void;
  onToggle: () => void;
}) {
  const hotspot = (
    <MotifHotspot
      id={motif.id}
      label={motif.label_zh}
      x={motif.anchor.x}
      y={motif.anchor.y}
      active={active}
      dimmed={dimmed}
      debug={debug}
      onHover={onHover}
      onHoverEnd={onHoverEnd}
      onToggle={onToggle}
    />
  );

  if (!popover) return hotspot;

  return (
    <SymbolPopover
      open={active}
      onOpenChange={(open) => {
        if (!open) onHoverEnd();
      }}
      side="top"
      align="center"
      trigger={hotspot}
    >
      <p className="motif-popover__title">{motif.label_zh}</p>
      <p className="motif-popover__body">{motif.meaning_zh}</p>
    </SymbolPopover>
  );
}

function CardStage({
  cardImage,
  cardName,
  items,
  visibleId,
  debug,
  popoverHotspots = false,
  onHover,
  onHoverEnd,
  onToggle,
}: {
  cardImage: string;
  cardName: string;
  items: ArchiveMotif[];
  visibleId: string | null;
  debug: boolean;
  popoverHotspots?: boolean;
  onHover: (id: string) => void;
  onHoverEnd: () => void;
  onToggle: (id: string) => void;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const highlightRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const spotRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      const anchors = stageRef.current?.querySelectorAll<HTMLElement>(
        ".motif-anchor",
      );
      if (anchors?.length && !reducedMotion) {
        staggerHotspots(Array.from(anchors), { from: "center", delay: 0.12 });
      }
    },
    { scope: stageRef, dependencies: [items.length, reducedMotion] },
  );

  useEffect(() => {
    items.forEach((m) => {
      const hl = highlightRefs.current[m.id];
      const spot = spotRefs.current[m.id];
      if (m.precision === "precise" && hl) {
        if (visibleId === m.id) showMotifHighlight(hl);
        else hideMotifHighlight(hl);
      }
      if (m.precision === "approximate" && spot) {
        if (visibleId === m.id) showMotifHighlight(spot);
        else hideMotifHighlight(spot);
      }
    });
  }, [visibleId, items]);

  return (
    <div ref={stageRef}>
      {debug && (
        <div className="motif-debug-crosshair" aria-hidden>
          <span className="motif-debug-crosshair__v" />
          <span className="motif-debug-crosshair__h" />
        </div>
      )}
      <TarotCardFrame variant="archive">
        <Image
          src={cardImage}
          alt={cardName}
          fill
          sizes="(max-width: 768px) 78vw, 360px"
          className="motif-canvas__image tarot-card-image"
          priority
        />
        {items.map((m) => {
          if (m.precision === "precise") {
            return (
              <div
                key={`hl-${m.id}`}
                ref={(el) => {
                  highlightRefs.current[m.id] = el;
                }}
                className={`motif-highlight motif-highlight--${m.highlight.shape}`}
                style={{
                  left: `${m.highlight.x * 100}%`,
                  top: `${m.highlight.y * 100}%`,
                  width: `${m.highlight.w * 100}%`,
                  height: `${m.highlight.h * 100}%`,
                }}
                aria-hidden
              />
            );
          }
          return (
            <div
              key={`spot-${m.id}`}
              ref={(el) => {
                spotRefs.current[m.id] = el;
              }}
              className="motif-spot"
              style={{
                left: `${m.anchor.x * 100}%`,
                top: `${m.anchor.y * 100}%`,
              }}
              aria-hidden
            />
          );
        })}
        {items.map((m) => {
          const isLit = m.id === visibleId;
          const isDim = visibleId !== null && m.id !== visibleId;
          return (
            <MotifAnchor
              key={m.id}
              motif={m}
              active={isLit}
              dimmed={isDim}
              debug={debug}
              popover={popoverHotspots}
              onHover={() => onHover(m.id)}
              onHoverEnd={onHoverEnd}
              onToggle={() => onToggle(m.id)}
            />
          );
        })}
      </TarotCardFrame>
    </div>
  );
}

function NoteColumn({
  items,
  side,
  visibleId,
  debug,
  onHover,
  onHoverEnd,
  onToggle,
}: {
  items: ArchiveMotif[];
  side: "left" | "right";
  visibleId: string | null;
  debug: boolean;
  onHover: (id: string) => void;
  onHoverEnd: () => void;
  onToggle: (id: string) => void;
}) {
  if (items.length === 0) {
    return <div className={`note-column note-column--${side} note-column--empty`} />;
  }
  return (
    <div className={`note-column note-column--${side}`}>
      {items.map((m) => {
        const isActive = m.id === visibleId;
        const isDim = visibleId !== null && m.id !== visibleId;
        return (
          <MotifNote
            key={m.id}
            id={m.id}
            label_zh={m.label_zh}
            meaning_zh={m.meaning_zh}
            side={side}
            active={isActive}
            dimmed={isDim && visibleId !== null}
            debug={debug}
            onMouseEnter={() => onHover(m.id)}
            onMouseLeave={onHoverEnd}
            onFocus={() => onHover(m.id)}
            onBlur={onHoverEnd}
            onClick={() => onToggle(m.id)}
          />
        );
      })}
    </div>
  );
}

function MotifConnectorLayer({
  pathD,
  reducedMotion,
}: {
  pathD: string | null;
  reducedMotion: boolean;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useGSAP(
    () => {
      const path = pathRef.current;
      if (!path) return;

      if (!pathD) {
        hideMotifConnector(path);
        return;
      }

      path.setAttribute("d", pathD);
      animateMotifConnector(path, { reducedMotion });
    },
    { scope: svgRef, dependencies: [pathD, reducedMotion], revertOnUpdate: true },
  );

  return (
    <svg ref={svgRef} className="motif-canvas__connector-layer" aria-hidden>
      <path
        ref={pathRef}
        d={pathD ?? ""}
        fill="none"
        className="motif-connector"
        style={{ opacity: pathD ? undefined : 0 }}
      />
    </svg>
  );
}

export default function MotifCanvas({
  cardImage,
  cardName,
  motifs,
  maxMotifs = 6,
  debug = false,
}: Props) {
  const layoutRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const { left, right, all } = useMemo(() => {
    const p = partitionArchiveMotifs(motifs);
    return {
      left: p.left.slice(0, maxMotifs),
      right: p.right.slice(0, maxMotifs),
      all: p.all.slice(0, maxMotifs),
    };
  }, [motifs, maxMotifs]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const visibleId = hoverId ?? activeId;

  const visibleMotif = visibleId
    ? all.find((m) => m.id === visibleId) ?? null
    : null;
  const connectorSide = visibleMotif?.note.side ?? null;

  const connectorPath = useMotifConnector(
    layoutRef,
    visibleId,
    connectorSide,
    !reducedMotion,
  );

  const [prevCard, setPrevCard] = useState(cardImage);
  if (prevCard !== cardImage) {
    setPrevCard(cardImage);
    setActiveId(null);
    setHoverId(null);
  }

  const handleHover = (id: string) => setHoverId(id);
  const handleHoverEnd = () => setHoverId(null);
  const handleToggle = (id: string) =>
    setActiveId((prev) => (prev === id ? null : id));

  if (all.length === 0) {
    return (
      <div className="motif-canvas motif-canvas--empty">
        <TarotCardFrame variant="archive" solo>
          <Image
            src={cardImage}
            alt={cardName}
            fill
            sizes="320px"
            className="motif-canvas__image tarot-card-image"
            priority
          />
        </TarotCardFrame>
      </div>
    );
  }

  const stageProps = {
    cardImage,
    cardName,
    items: all,
    visibleId,
    debug,
    onHover: handleHover,
    onHoverEnd: handleHoverEnd,
    onToggle: handleToggle,
  };

  const columnProps = {
    visibleId,
    debug,
    onHover: handleHover,
    onHoverEnd: handleHoverEnd,
    onToggle: handleToggle,
  };

  return (
    <>
      <div
        ref={layoutRef}
        className="motif-canvas archive-layout motif-canvas--phase2"
      >
        <MotifConnectorLayer pathD={connectorPath} reducedMotion={reducedMotion} />
        <NoteColumn items={left} side="left" {...columnProps} />
        <CardStage {...stageProps} popoverHotspots={false} />
        <NoteColumn items={right} side="right" {...columnProps} />
      </div>

      <div className="motif-canvas-mobile">
        <CardStage {...stageProps} popoverHotspots />
        <div className="motif-canvas-mobile__notes">
          {all.map((m) => (
            <MotifNote
              key={m.id}
              id={m.id}
              label_zh={m.label_zh}
              meaning_zh={m.meaning_zh}
              side={m.note.side}
              active={m.id === visibleId}
              dimmed={visibleId !== null && m.id !== visibleId}
              debug={debug}
              onClick={() => handleToggle(m.id)}
            />
          ))}
        </div>
        {!visibleId && (
          <p className="motif-popover-hint">轻触牌面金点或下方说明，查看符号含义。</p>
        )}
      </div>
    </>
  );
}
