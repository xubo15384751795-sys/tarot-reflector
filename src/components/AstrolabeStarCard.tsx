"use client";

import Image from "next/image";
import { CornerOrnament } from "./ArchiveEmblems";
import TarotCardStage from "./TarotCardStage";

/**
 * Decorative anchor for the entry page: the real Star card image, with a
 * golden astrolabe-style concentric-circle decoration behind it and a soft
 * radial glow. Card uses TarotCardStage for three-layer shadow system.
 */
export default function AstrolabeStarCard() {
  return (
    <div className="relative w-full flex items-center justify-center">
      {/* 四角档案装饰 — 极淡 */}
      <CornerOrnament size={36} position="tl" className="absolute top-0 left-2 z-10" style={{ opacity: 0.18 }} />
      <CornerOrnament size={36} position="tr" className="absolute top-0 right-2 z-10" style={{ opacity: 0.18 }} />
      <CornerOrnament size={36} position="bl" className="absolute bottom-0 left-2 z-10" style={{ opacity: 0.18 }} />
      <CornerOrnament size={36} position="br" className="absolute bottom-0 right-2 z-10" style={{ opacity: 0.18 }} />

      {/* Astrolabe: concentric circles + tick marks + sparkles */}
      <svg
        aria-hidden
        viewBox="0 0 600 600"
        className="absolute pointer-events-none"
        style={{
          width: "min(680px, 84%)",
          height: "auto",
          opacity: 0.4,
          mixBlendMode: "screen",
        }}
      >
        <defs>
          <radialGradient id="astroFade" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="rgba(206,185,138,0.6)" />
            <stop offset="60%" stopColor="rgba(206,185,138,0.12)" />
            <stop offset="100%" stopColor="rgba(206,185,138,0)" />
          </radialGradient>
        </defs>
        <circle cx="300" cy="300" r="280" fill="none" stroke="url(#astroFade)" strokeWidth="0.5" />
        <circle cx="300" cy="300" r="240" fill="none" stroke="rgba(206,185,138,0.25)" strokeWidth="0.45" />
        <circle cx="300" cy="300" r="200" fill="none" stroke="rgba(206,185,138,0.18)" strokeWidth="0.4" />
        <circle cx="300" cy="300" r="160" fill="none" stroke="rgba(206,185,138,0.12)" strokeWidth="0.35" />
        {/* Tick marks */}
        {Array.from({ length: 24 }).map((_, i) => {
          const a = (i * Math.PI) / 12;
          const inner = 270;
          const outer = i % 6 === 0 ? 290 : 282;
          const x1 = Math.round(300 + Math.cos(a) * inner);
          const y1 = Math.round(300 + Math.sin(a) * inner);
          const x2 = Math.round(300 + Math.cos(a) * outer);
          const y2 = Math.round(300 + Math.sin(a) * outer);
          return (
            <line
              key={i}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={i % 6 === 0 ? "rgba(206,185,138,0.6)" : "rgba(206,185,138,0.25)"}
              strokeWidth={i % 6 === 0 ? 0.7 : 0.35}
              strokeLinecap="round"
            />
          );
        })}
        {/* Constellation sparkles */}
        {Array.from({ length: 14 }).map((_, i) => {
          const a = (i / 14) * Math.PI * 2 + 0.18;
          const r = 250 + (i % 3) * 14;
          const cx = Math.round(300 + Math.cos(a) * r);
          const cy = Math.round(300 + Math.sin(a) * r);
          const size = Math.round((1.4 + (i % 3) * 0.6) * 10) / 10;
          return (
            <g key={`s${i}`}>
              <circle cx={cx} cy={cy} r={size} fill="rgba(255,247,225,0.8)" />
              <line x1={Math.round(cx - size * 2.4)} y1={cy} x2={Math.round(cx + size * 2.4)} y2={cy} stroke="rgba(255,247,225,0.35)" strokeWidth="0.4" strokeLinecap="round" />
              <line x1={cx} y1={Math.round(cy - size * 2.4)} x2={cx} y2={Math.round(cy + size * 2.4)} stroke="rgba(255,247,225,0.35)" strokeWidth="0.4" strokeLinecap="round" />
            </g>
          );
        })}
      </svg>

      {/* The real Star card — TarotCardStage 三层阴影 */}
      <TarotCardStage rotate={-2.2} showGroundShadow>
        <Image
          src="/cards/major/major_17_star.jpg"
          alt="The Star"
          fill
          sizes="(min-width: 1024px) 260px, 50vw"
          priority
          className="object-cover"
        />
      </TarotCardStage>
    </div>
  );
}
