"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import type { Motif, Orientation } from "@/lib/schema";
import CardImage from "./CardImage";
import CardBackImage from "./CardBackImage";
import { CornerOrnament, ArchiveLabel } from "./ArchiveEmblems";
import {
  useReducedMotion,
  createCardRevealTimeline,
  preloadImage,
} from "@/features/motion";

type Props = {
  image: string;
  cardName: string;
  zhName: string;
  orientation: Orientation;
  motifs: Motif[];
  number?: number;
  onComplete: () => void;
};

/**
 * Card Reveal — GSAP timeline（DrawSVG 无关；翻牌 + CustomBounce 落定）
 */
export default function CardReveal({
  image,
  cardName,
  zhName,
  orientation,
  motifs: _motifs,
  number: _number,
  onComplete,
}: Props) {
  const reducedMotion = useReducedMotion();
  const oLabel = orientation === "upright" ? "正位" : "逆位";

  const containerRef = useRef<HTMLDivElement>(null);
  const cardBackRef = useRef<HTMLDivElement>(null);
  const cardFrontRef = useRef<HTMLDivElement>(null);
  const cardNameRef = useRef<HTMLDivElement>(null);
  const cardNameZhRef = useRef<HTMLDivElement>(null);
  const warmGlowRef = useRef<HTMLDivElement>(null);
  const groundShadowRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<ReturnType<typeof createCardRevealTimeline> | null>(null);
  const [imageReady, setImageReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    preloadImage(image).then(
      () => {
        if (!cancelled) setImageReady(true);
      },
      () => {
        if (!cancelled) setImageReady(true);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [image]);

  const animate = useCallback(() => {
    const cardBack = cardBackRef.current;
    const cardFront = cardFrontRef.current;
    const cardName = cardNameRef.current;
    if (!cardBack || !cardFront || !cardName) return;

    tlRef.current?.kill();

    const tl = createCardRevealTimeline(cardFront, cardBack, cardName, {
      reducedMotion,
      onComplete,
      cardNameZhEl: cardNameZhRef.current,
      warmGlow: warmGlowRef.current,
      groundShadow: groundShadowRef.current,
    });
    tlRef.current = tl;
  }, [reducedMotion, onComplete]);

  useGSAP(
    () => {
      if (!imageReady) return;
      animate();
      return () => {
        const tl = tlRef.current as
          | (gsap.core.Timeline & { splitRevert?: () => void })
          | null;
        tl?.splitRevert?.();
        tl?.kill();
        tlRef.current = null;
      };
    },
    { scope: containerRef, dependencies: [animate, imageReady] },
  );

  return (
    <div ref={containerRef} className="flex flex-col items-center justify-center min-h-[480px] gap-8">
      <ArchiveLabel code={`COD.${zhName.replace(/[^一-龥]/g, "").slice(0, 2).toUpperCase()}`} />

      <div className="relative" style={{ width: "min(280px, 64vw)", perspective: 1400 }}>
        <div
          ref={warmGlowRef}
          aria-hidden
          className="card-glow absolute pointer-events-none"
        />
        <div
          ref={groundShadowRef}
          aria-hidden
          className="card-ground-shadow absolute pointer-events-none"
        />

        <CornerOrnament size={28} position="tl" className="absolute -top-3 -left-3 z-10" />
        <CornerOrnament size={28} position="tr" className="absolute -top-3 -right-3 z-10" />
        <CornerOrnament size={28} position="bl" className="absolute -bottom-3 -left-3 z-10" />
        <CornerOrnament size={28} position="br" className="absolute -bottom-3 -right-3 z-10" />

        <div className="card-frame relative z-[1]">
          <div
            className="relative"
            style={{
              width: "100%",
              aspectRatio: "600 / 1050",
              transformStyle: "preserve-3d",
            }}
          >
            <div
              ref={cardBackRef}
              className="absolute inset-0 rounded-[11px] overflow-hidden"
              style={{
                backfaceVisibility: "hidden",
                border: "1px solid rgba(78, 60, 40, 0.18)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.5), 0 10px 18px rgba(72, 54, 34, 0.16), 0 28px 70px rgba(82, 62, 40, 0.13)",
                opacity: 0,
              }}
            >
              <CardBackImage eager />
            </div>

            <div
              ref={cardFrontRef}
              className="absolute inset-0 rounded-[11px] overflow-hidden"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                border: "1px solid rgba(78, 60, 40, 0.18)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.5), 0 10px 18px rgba(72, 54, 34, 0.16), 0 28px 70px rgba(82, 62, 40, 0.13)",
                opacity: 0,
              }}
            >
              <CardImage
                image={image}
                cardName={cardName}
                zhName={zhName}
                orientation={orientation}
                eager
              />
            </div>
          </div>
        </div>
      </div>

      <div ref={cardNameRef} className="text-center" style={{ opacity: 0 }}>
        <div
          ref={cardNameZhRef}
          className="text-[18px] font-light tracking-[0.06em] mb-1"
          style={{ color: "var(--text-primary)" }}
        >
          {zhName}
        </div>
        <div
          data-card-meta
          className="text-[11px] tracking-[0.08em] mb-0.5"
          style={{ color: "var(--text-tertiary)" }}
        >
          {cardName}
        </div>
        <div
          data-card-meta
          className="text-[10px] tracking-[0.12em] annotation-ink"
          style={{ color: orientation === "upright" ? "var(--accent)" : "var(--text-tertiary)" }}
        >
          {oLabel}
        </div>
      </div>
    </div>
  );
}
