"use client";

/**
 * CoverPreview — 短片封面预览
 * 和 VideoSceneRenderer 共享视觉语言：暖光 + parchment 噪点 + 四角金线纹饰。
 * 现在 cardImage 必填才显示，没传就不渲染（避免又一个空白占位）。
 */

import Image from "next/image";
import type { VideoCover } from "@/types/readingScript";
import { CornerOrnament } from "./ArchiveEmblems";

type Props = {
  cover: VideoCover;
  /** 牌面图片路径 —— 必传，没图就别出这个卡片 */
  cardImage?: string;
  /** 画幅比例 */
  aspect?: "9:16" | "16:9" | "1:1";
};

export default function CoverPreview({ cover, cardImage, aspect = "9:16" }: Props) {
  const aspectClass =
    aspect === "9:16"
      ? "aspect-[9/16] max-w-[260px]"
      : aspect === "16:9"
      ? "aspect-video max-w-[440px]"
      : "aspect-square max-w-[300px]";

  return (
    <div
      className={`relative ${aspectClass} w-full rounded-2xl overflow-hidden flex flex-col items-center justify-between p-6`}
      style={{
        background:
          "radial-gradient(ellipse 70% 50% at 50% 30%, rgba(214,178,109,0.12) 0%, transparent 65%), linear-gradient(180deg, #0a0810 0%, #0d0c11 50%, #08070a 100%)",
        border: "1px solid rgba(214,178,109,0.32)",
        boxShadow:
          "inset 0 1px 0 rgba(255,247,225,0.08), 0 16px 36px rgba(0,0,0,0.45)",
      }}
    >
      {/* parchment 噪点 */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "240px 240px",
          mixBlendMode: "overlay",
        }}
      />

      {/* 四角档案纹饰 */}
      <CornerOrnament size={22} position="tl" className="absolute top-3 left-3" style={{ opacity: 0.5 }} />
      <CornerOrnament size={22} position="tr" className="absolute top-3 right-3" style={{ opacity: 0.5 }} />
      <CornerOrnament size={22} position="bl" className="absolute bottom-3 left-3" style={{ opacity: 0.5 }} />
      <CornerOrnament size={22} position="br" className="absolute bottom-3 right-3" style={{ opacity: 0.5 }} />

      {/* 顶部：品牌 archive label */}
      <div className="relative z-[1] flex items-center gap-2">
        <span aria-hidden className="block w-3 h-px" style={{ background: "var(--accent)", opacity: 0.5 }} />
        <span
          className="text-[10px] tracking-[0.3em]"
          style={{ color: "var(--accent)", opacity: 0.75, fontFamily: "var(--font-serif-like)" }}
        >
          阈 牌
        </span>
        <span aria-hidden className="block w-3 h-px" style={{ background: "var(--accent)", opacity: 0.5 }} />
      </div>

      {/* 中部：真实牌图 */}
      <div className="relative z-[1] flex-1 flex items-center justify-center">
        {cardImage ? (
          <div
            className="relative overflow-hidden rounded-[10px]"
            style={{
              width: 116,
              aspectRatio: "600/1050",
              border: "1px solid rgba(214,178,109,0.35)",
              boxShadow:
                "inset 0 1px 0 rgba(255,247,225,0.10), 0 14px 32px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,0,0,0.4)",
            }}
          >
            <Image
              src={cardImage}
              alt={cover.title_zh}
              fill
              sizes="116px"
              className="object-cover"
            />
          </div>
        ) : (
          <span
            className="text-[10px] tracking-[0.18em]"
            style={{ color: "var(--text-faint)", fontFamily: "var(--font-serif-like)" }}
          >
            · · ·
          </span>
        )}
      </div>

      {/* 底部：标题 + 副标 + 关键词 */}
      <div className="relative z-[1] text-center">
        <h3
          className="text-[18px] font-light tracking-[0.02em] mb-1.5"
          style={{ color: "var(--text-primary)", fontFamily: "var(--font-serif-like)" }}
        >
          {cover.title_zh}
        </h3>
        <p
          className="text-[12px] mb-2.5"
          style={{ color: "var(--text-secondary)", fontFamily: "var(--font-serif-like)" }}
        >
          {cover.subtitle_zh}
        </p>
        <div className="flex flex-wrap gap-1.5 justify-center">
          {cover.keywords_zh.map((kw) => (
            <span
              key={kw}
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(214,178,109,0.12)",
                color: "var(--accent)",
                border: "1px solid rgba(214,178,109,0.35)",
                fontFamily: "var(--font-serif-like)",
              }}
            >
              {kw}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
