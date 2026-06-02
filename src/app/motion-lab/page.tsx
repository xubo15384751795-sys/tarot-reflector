"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import "@/features/motion/gsapRegister";
import {
  createCardRevealTimeline,
  staggerHotspots,
  activateHotspot,
  resetHotspots,
  createHandwrittenPath,
  animateHandwrittenLine,
  preloadImage,
  useReducedMotion,
  useCursorGlow,
  gsapEase,
  duration,
} from "@/features/motion";
import type { HotspotConfig } from "@/features/motion";
import cardsData from "@/data/tarot_cards.json";

// 使用愚者牌作为 demo 牌
const demoCard = cardsData[0];
const demoImageSrc = (demoCard as Record<string, unknown>["image"] as string) || "/cards/major/major_00_fool.jpg";

// 模拟 5 个 motif hotspot
const demoMotifs = [
  {
    id: "cliff_edge",
    label: "悬崖边缘",
    meaning: "未知的旅程，踏出舒适区的勇气",
    anchor: { x: 35, y: 55 },
    highlight: { x: 25, y: 45, w: 30, h: 20, shape: "rect" as const },
  },
  {
    id: "white_dog",
    label: "小白狗",
    meaning: "本能的提醒，内心的声音",
    anchor: { x: 55, y: 70 },
    highlight: { x: 48, y: 62, w: 18, h: 18, shape: "circle" as const },
  },
  {
    id: "white_rose",
    label: "白玫瑰",
    meaning: "纯真与自由，不被欲望束缚",
    anchor: { x: 42, y: 35 },
    highlight: { x: 36, y: 28, w: 16, h: 16, shape: "circle" as const },
  },
  {
    id: "rising_sun",
    label: "升起的太阳",
    meaning: "新的可能性正在展开",
    anchor: { x: 75, y: 15 },
    highlight: { x: 65, y: 8, w: 22, h: 18, shape: "circle" as const },
  },
  {
    id: "white_sun",
    label: "白色太阳",
    meaning: "清晰的觉知，照亮当下",
    anchor: { x: 20, y: 12 },
    highlight: { x: 10, y: 5, w: 24, h: 18, shape: "circle" as const },
  },
];

export default function MotionLabPage() {
  const reducedMotion = useReducedMotion();
  const containerRef = useCursorGlow("--glow-x", "--glow-y");

  // ── Demo 1: Card Reveal ──
  const cardRevealRef = useRef<HTMLDivElement>(null);
  const cardFrontRef = useRef<HTMLDivElement>(null);
  const cardBackRef = useRef<HTMLDivElement>(null);
  const cardNameRef = useRef<HTMLDivElement>(null);
  const [revealPlaying, setRevealPlaying] = useState(false);

  const playReveal = useCallback(() => {
    if (revealPlaying) return;
    setRevealPlaying(true);

    const cardFront = cardFrontRef.current;
    const cardBack = cardBackRef.current;
    const cardName = cardNameRef.current;
    if (!cardFront || !cardBack || !cardName) return;

    // Reset
    gsap.set(cardFront, { autoAlpha: 0, rotationY: 180, x: 0, y: 0 });
    gsap.set(cardBack, { autoAlpha: 0, x: 0, y: 0 });
    gsap.set(cardName, { autoAlpha: 0, y: 8 });

    const tl = createCardRevealTimeline(cardFront, cardBack, cardName, {
      reducedMotion,
      onComplete: () => setRevealPlaying(false),
    });

    return () => tl.kill();
  }, [reducedMotion, revealPlaying]);

  // ── Demo 2: Motif Hotspot ──
  const hotspotContainerRef = useRef<HTMLDivElement>(null);
  const hotspotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const highlightRefs = useRef<(HTMLDivElement | null)[]>([]);
  const popoverRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lineRefs = useRef<(SVGPathElement | null)[]>([]);
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);

  useGSAP(
    () => {
      if (!hotspotContainerRef.current) return;
      const hotspots = hotspotRefs.current.filter(Boolean) as HTMLDivElement[];
      if (hotspots.length === 0) return;

      // Stagger 进入
      staggerHotspots(hotspots, { from: "center" });
    },
    { scope: hotspotContainerRef }
  );

  const handleHotspotClick = useCallback(
    (index: number) => {
      const newActive = activeHotspot === index ? null : index;
      setActiveHotspot(newActive);

      const allConfigs: HotspotConfig[] = hotspotRefs.current.map((el, i) => ({
        el: el!,
        highlightEl: highlightRefs.current[i] || undefined,
        popoverEl: popoverRefs.current[i] || undefined,
        lineEl: lineRefs.current[i] || undefined,
      }));

      if (newActive === null) {
        resetHotspots(allConfigs);
      } else {
        activateHotspot(allConfigs, newActive);
      }
    },
    [activeHotspot]
  );

  // ── Demo 3: Handwritten Line ──
  const lineContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [lineDrawing, setLineDrawing] = useState(false);

  const drawLines = useCallback(() => {
    if (!svgRef.current || lineDrawing) return;
    setLineDrawing(true);

    const paths = svgRef.current.querySelectorAll("path");
    const tl = gsap.timeline({
      onComplete: () => setLineDrawing(false),
    });

    paths.forEach((path, i) => {
      tl.add(
        animateHandwrittenLine(path as unknown as SVGPathElement, {
          duration: duration.slow,
        }),
        i * 0.2
      );
    });

    return () => tl.kill();
  }, [lineDrawing]);

  return (
    <div
      ref={containerRef as React.RefObject<HTMLDivElement>}
      className="min-h-screen"
      style={{
        background: "var(--bg-base)",
        color: "var(--text-primary)",
        ["--glow-x" as string]: "-1000px",
        ["--glow-y" as string]: "-1000px",
      }}
    >
      {/* Cursor glow layer */}
      <div
        className="pointer-events-none fixed inset-0 z-50"
        style={{
          background:
            "radial-gradient(circle 200px at var(--glow-x) var(--glow-y), rgba(185,149,82,0.12), transparent)",
        }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-4xl px-6 py-16">
        {/* Header */}
        <header className="mb-16 text-center">
          <h1
            className="mb-4 text-3xl"
            style={{ fontFamily: "var(--font-serif-like)" }}
          >
            Motion Lab
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            GSAP 动效原型验证 · 先在 lab 通过，再迁移到正式页面
          </p>
          <div
            className="mx-auto mt-6 h-px w-32"
            style={{ background: "var(--border)" }}
          />
        </header>

        {/* ═══ Demo 1: Card Reveal ═══ */}
        <section className="mb-20">
          <h2
            className="mb-2 text-xl"
            style={{ fontFamily: "var(--font-serif-like)" }}
          >
            牌面揭示
          </h2>
          <p
            className="mb-8 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            牌背出现 → 浮动 → 抽出 → 翻牌 → 落定 → 牌名淡入
          </p>

          <div className="flex flex-col items-center gap-8 md:flex-row md:items-start md:justify-center">
            {/* Card stage */}
            <div
              ref={cardRevealRef}
              className="relative"
              style={{
                perspective: "1400px",
                width: "280px",
                height: "420px",
              }}
            >
              {/* Card back */}
              <div
                ref={cardBackRef}
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: "linear-gradient(135deg, #1a1510 0%, #0d0a08 100%)",
                  border: "1px solid rgba(185,149,82,0.2)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
                  backfaceVisibility: "hidden",
                  opacity: 0,
                }}
              >
                {/* Card back pattern */}
                <div
                  className="absolute inset-4 rounded-xl"
                  style={{
                    border: "1px solid rgba(185,149,82,0.15)",
                    background:
                      "repeating-conic-gradient(rgba(185,149,82,0.06) 0% 25%, transparent 0% 50%) 0 0 / 20px 20px",
                  }}
                />
              </div>

              {/* Card front */}
              <div
                ref={cardFrontRef}
                className="absolute inset-0 overflow-hidden rounded-2xl"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  opacity: 0,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={demoImageSrc}
                  alt={demoCard.zh_name}
                  className="h-full w-full object-cover"
                  style={{ borderRadius: "16px" }}
                />
              </div>

              {/* Card name */}
              <div
                ref={cardNameRef}
                className="absolute -bottom-12 left-0 right-0 text-center"
                style={{ opacity: 0 }}
              >
                <span
                  className="text-lg"
                  style={{
                    fontFamily: "var(--font-serif-like)",
                    color: "var(--text-primary)",
                  }}
                >
                  {demoCard.zh_name}
                </span>
                <span
                  className="ml-2 text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {demoCard.name}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-3">
              <button
                onClick={playReveal}
                disabled={revealPlaying}
                className="rounded-full px-6 py-3 text-sm font-medium transition-all"
                style={{
                  background: "var(--accent-dim)",
                  border: "1px solid var(--border-active)",
                  color: "var(--accent)",
                  opacity: revealPlaying ? 0.5 : 1,
                }}
              >
                {revealPlaying ? "播放中..." : "播放抽牌动画"}
              </button>
              <p
                className="text-xs"
                style={{ color: "var(--text-muted)", maxWidth: "240px" }}
              >
                总时长 ~1.5s · 牌背 → 浮动 → 抽出 → 翻牌 · power2.out + bounce.out
              </p>
            </div>
          </div>
        </section>

        <div
          className="mx-auto mb-20 h-px w-full max-w-md"
          style={{ background: "var(--border)" }}
        />

        {/* ═══ Demo 2: Motif Hotspot ═══ */}
        <section className="mb-20">
          <h2
            className="mb-2 text-xl"
            style={{ fontFamily: "var(--font-serif-like)" }}
          >
            牌面符号 Hotspot
          </h2>
          <p
            className="mb-8 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            hotspot stagger 出现 · hover 高亮 · click 浮现解释 · 手写线连接
          </p>

          <div className="flex flex-col items-center gap-8 md:flex-row md:items-start md:justify-center">
            {/* Card with hotspots */}
            <div
              ref={hotspotContainerRef}
              className="relative"
              style={{
                width: "300px",
                height: "450px",
              }}
            >
              {/* Card image */}
              <div
                className="absolute inset-0 overflow-hidden rounded-2xl"
                style={{
                  boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={demoImageSrc}
                  alt={demoCard.zh_name}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Highlight layers */}
              {demoMotifs.map((motif, i) => (
                <div
                  key={`highlight-${motif.id}`}
                  ref={(el) => {
                    highlightRefs.current[i] = el;
                  }}
                  className="absolute rounded-lg"
                  style={{
                    left: `${motif.highlight.x}%`,
                    top: `${motif.highlight.y}%`,
                    width: `${motif.highlight.w}%`,
                    height: `${motif.highlight.h}%`,
                    background: "rgba(185,149,82,0.15)",
                    border: "1px solid rgba(185,149,82,0.3)",
                    borderRadius:
                      motif.highlight.shape === "circle" ? "50%" : "8px",
                    opacity: 0,
                    pointerEvents: "none",
                  }}
                />
              ))}

              {/* SVG lines layer */}
              <svg
                className="absolute inset-0 h-full w-full"
                style={{ pointerEvents: "none" }}
              >
                {demoMotifs.map((motif, i) => {
                  const lineStartX = motif.anchor.x;
                  const lineStartY = motif.anchor.y;
                  // Lines go outward from the card
                  const lineEndX =
                    motif.anchor.x < 50 ? motif.anchor.x - 20 : motif.anchor.x + 20;
                  const lineEndY = motif.anchor.y - 15;
                  const pathD = createHandwrittenPath(
                    lineStartX,
                    lineStartY,
                    lineEndX,
                    lineEndY,
                    0.25
                  );
                  return (
                    <path
                      key={`line-${motif.id}`}
                      ref={(el) => {
                        lineRefs.current[i] = el;
                      }}
                      d={pathD}
                      fill="none"
                      stroke="rgba(185,149,82,0.5)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      style={{
                        strokeDasharray: 1,
                        strokeDashoffset: 1,
                      }}
                    />
                  );
                })}
              </svg>

              {/* Hotspot dots */}
              {demoMotifs.map((motif, i) => (
                <div
                  key={motif.id}
                  ref={(el) => {
                    hotspotRefs.current[i] = el;
                  }}
                  className="absolute flex h-7 w-7 cursor-pointer items-center justify-center rounded-full"
                  style={{
                    left: `${motif.anchor.x}%`,
                    top: `${motif.anchor.y}%`,
                    transform: "translate(-50%, -50%)",
                    background: "rgba(185,149,82,0.3)",
                    border: "1.5px solid rgba(185,149,82,0.6)",
                    boxShadow: "0 0 12px rgba(185,149,82,0.25)",
                    opacity: 0,
                  }}
                  onClick={() => handleHotspotClick(i)}
                >
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ background: "var(--gold)" }}
                  />
                </div>
              ))}

              {/* Popovers */}
              {demoMotifs.map((motif, i) => (
                <div
                  key={`popover-${motif.id}`}
                  ref={(el) => {
                    popoverRefs.current[i] = el;
                  }}
                  className="absolute z-20 max-w-[200px] rounded-xl px-4 py-3"
                  style={{
                    left: `${motif.anchor.x}%`,
                    top: `${motif.anchor.y - 18}%`,
                    transform: "translateX(-50%)",
                    background: "rgba(255,251,242,0.92)",
                    border: "1px solid rgba(185,149,82,0.2)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    backdropFilter: "blur(12px)",
                    opacity: 0,
                    pointerEvents: "none",
                  }}
                >
                  <div
                    className="mb-1 text-xs font-medium"
                    style={{
                      color: "var(--gold-deep)",
                      fontFamily: "var(--font-serif-like)",
                    }}
                  >
                    {motif.label}
                  </div>
                  <div
                    className="text-xs leading-relaxed"
                    style={{
                      color: "var(--text-secondary)",
                      lineHeight: 1.7,
                    }}
                  >
                    {motif.meaning}
                  </div>
                </div>
              ))}
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-3">
              <p
                className="text-xs"
                style={{ color: "var(--text-muted)", maxWidth: "240px" }}
              >
                点击 hotspot 查看交互效果
                <br />
                5 个 hotspot 从中心 stagger 出现
                <br />
                选中时其他 hotspot 降至 0.45 opacity
              </p>
              <button
                onClick={() => {
                  setActiveHotspot(null);
                  resetHotspots(
                    hotspotRefs.current.map((el, i) => ({
                      el: el!,
                      highlightEl: highlightRefs.current[i] || undefined,
                      popoverEl: popoverRefs.current[i] || undefined,
                      lineEl: lineRefs.current[i] || undefined,
                    }))
                  );
                }}
                className="rounded-full px-5 py-2 text-xs transition-all"
                style={{
                  background: "transparent",
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                }}
              >
                重置
              </button>
            </div>
          </div>
        </section>

        <div
          className="mx-auto mb-20 h-px w-full max-w-md"
          style={{ background: "var(--border)" }}
        />

        {/* ═══ Demo 3: Handwritten Line ═══ */}
        <section className="mb-20">
          <h2
            className="mb-2 text-xl"
            style={{ fontFamily: "var(--font-serif-like)" }}
          >
            手写连接线
          </h2>
          <p
            className="mb-8 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            SVG pathLength + strokeDashoffset · 树枝生长感 · 不用箭头 icon
          </p>

          <div className="flex flex-col items-center gap-8 md:flex-row md:items-start md:justify-center">
            {/* Line container */}
            <div
              ref={lineContainerRef}
              className="relative flex h-[300px] w-[300px] items-center justify-center"
              style={{
                background: "var(--surface)",
                borderRadius: "20px",
                border: "1px solid var(--border)",
              }}
            >
              {/* Central node */}
              <div
                className="absolute flex h-12 w-12 items-center justify-center rounded-full"
                style={{
                  background: "var(--accent-dim)",
                  border: "1.5px solid var(--accent)",
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ background: "var(--gold)" }}
                />
              </div>

              {/* SVG paths */}
              <svg
                ref={svgRef}
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 300 300"
              >
                {/* 5 lines radiating from center */}
                <path
                  d={createHandwrittenPath(150, 150, 80, 60, 0.3)}
                  fill="none"
                  stroke="rgba(185,149,82,0.45)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d={createHandwrittenPath(150, 150, 230, 50, 0.25)}
                  fill="none"
                  stroke="rgba(185,149,82,0.45)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d={createHandwrittenPath(150, 150, 60, 200, 0.2)}
                  fill="none"
                  stroke="rgba(185,149,82,0.45)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d={createHandwrittenPath(150, 150, 240, 210, 0.35)}
                  fill="none"
                  stroke="rgba(185,149,82,0.45)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d={createHandwrittenPath(150, 150, 150, 30, 0.15)}
                  fill="none"
                  stroke="rgba(185,149,82,0.45)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>

              {/* End nodes */}
              {[
                { x: "27%", y: "20%" },
                { x: "77%", y: "17%" },
                { x: "20%", y: "67%" },
                { x: "80%", y: "70%" },
                { x: "50%", y: "10%" },
              ].map((pos, i) => (
                <div
                  key={i}
                  className="absolute h-6 w-6 rounded-full"
                  style={{
                    background: "rgba(185,149,82,0.2)",
                    border: "1px solid rgba(185,149,82,0.4)",
                    left: pos.x,
                    top: pos.y,
                    transform: "translate(-50%, -50%)",
                  }}
                />
              ))}
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-3">
              <button
                onClick={drawLines}
                disabled={lineDrawing}
                className="rounded-full px-6 py-3 text-sm font-medium transition-all"
                style={{
                  background: "var(--accent-dim)",
                  border: "1px solid var(--border-active)",
                  color: "var(--accent)",
                  opacity: lineDrawing ? 0.5 : 1,
                }}
              >
                {lineDrawing ? "绘制中..." : "绘制连接线"}
              </button>
              <p
                className="text-xs"
                style={{ color: "var(--text-muted)", maxWidth: "240px" }}
              >
                5 条曲线从中心向外生长
                <br />
                stroke-linecap: round · power3.out
                <br />
                视觉像手写标注 / 树枝生长
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 text-center">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Motion Lab · GSAP + React · 验证通过后迁移到正式页面
          </p>
        </footer>
      </div>
    </div>
  );
}
