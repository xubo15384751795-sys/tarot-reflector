"use client";

/**
 * VideoSceneRenderer — 解读短片的单幕渲染
 *
 * 视觉策略：和主站完全延续——
 *   - 背景：parchment 噪点 + 暖金 radial halo 而不是平铺纯黑
 *   - 牌图：渲染真实 RWS 牌面（之前是空白占位）
 *   - 四角：CornerOrnament 档案纹饰
 *   - motif callout：弧线引出 + 金色标签（不是粘在牌上的实色 pill）
 *   - 文字：标题 + 正文都用 var(--font-serif-like) 衬线
 *   - 品牌：左上角"阈 牌"金色 archive label，不是右下角灰水印
 */

import Image from "next/image";
import { motion } from "framer-motion";
import type { VideoScene, ReadingScript } from "@/types/readingScript";
import { CornerOrnament } from "./ArchiveEmblems";

type SceneCard = {
  card_id: string;
  zh_name: string;
  image: string;
  orientation: "upright" | "reversed";
};

type Props = {
  scene: VideoScene;
  script: ReadingScript;
  /** 用于按 card_id 查到真实牌图 */
  cards?: SceneCard[];
};

function findCardImage(
  cards: SceneCard[] | undefined,
  cardId: string | undefined,
): SceneCard | null {
  if (!cards || !cardId) return null;
  return cards.find((c) => c.card_id === cardId) ?? null;
}

export default function VideoSceneRenderer({ scene, script, cards }: Props) {
  const sceneCardId = scene.active_card_id ?? script.cover.cover_card_id;
  const card = findCardImage(cards, sceneCardId);

  return (
    <div className="absolute inset-0 flex flex-col items-stretch overflow-hidden">
      {/* 背景：archive 暖光 + 噪点 */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            scene.type === "opening"
              ? "radial-gradient(ellipse 70% 50% at 50% 30%, rgba(214,178,109,0.16) 0%, rgba(214,178,109,0.04) 38%, transparent 70%), linear-gradient(180deg, #0a0810 0%, #0d0c11 50%, #08070a 100%)"
              : scene.type === "closing"
              ? "radial-gradient(ellipse 70% 50% at 50% 70%, rgba(214,178,109,0.14) 0%, rgba(214,178,109,0.04) 38%, transparent 70%), linear-gradient(180deg, #08070a 0%, #0d0c11 50%, #0a0810 100%)"
              : "radial-gradient(ellipse 60% 45% at 50% 45%, rgba(214,178,109,0.10) 0%, transparent 65%), linear-gradient(180deg, #08070a 0%, #0d0c11 100%)",
        }}
      />
      {/* parchment 纹理（极淡，给纯黑面"物质感"）*/}
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
      <CornerOrnament size={24} position="tl" className="absolute top-3 left-3 z-[1]" style={{ opacity: 0.5 }} />
      <CornerOrnament size={24} position="tr" className="absolute top-3 right-3 z-[1]" style={{ opacity: 0.5 }} />
      <CornerOrnament size={24} position="bl" className="absolute bottom-3 left-3 z-[1]" style={{ opacity: 0.5 }} />
      <CornerOrnament size={24} position="br" className="absolute bottom-3 right-3 z-[1]" style={{ opacity: 0.5 }} />

      {/* 品牌：左上 archive label，金色 */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 z-[2]">
        <span
          className="text-[10px] tracking-[0.30em]"
          style={{ color: "var(--accent)", opacity: 0.75, fontFamily: "var(--font-serif-like)" }}
        >
          阈 牌
        </span>
      </div>

      {/* 主区域 */}
      <div className="relative z-[2] flex-1 flex flex-col items-center justify-center text-center px-6 pt-12 pb-8 gap-4">
        {/* 标题 */}
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-[20px] md:text-[22px] font-light leading-[1.3] max-w-[18ch]"
          style={{ color: "var(--text-primary)", fontFamily: "var(--font-serif-like)" }}
        >
          {scene.headline_zh}
        </motion.h2>

        {/* 牌图（真实 RWS 图）+ 弧线 motif callout */}
        {card && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative my-2"
          >
            {/* 牌底椭圆阴影 */}
            <div
              aria-hidden
              className="absolute pointer-events-none"
              style={{
                bottom: -10,
                left: "10%",
                right: "10%",
                height: 16,
                borderRadius: 999,
                background:
                  "radial-gradient(ellipse at center, rgba(0,0,0,0.45) 0%, transparent 75%)",
                filter: "blur(8px)",
              }}
            />
            <div
              className="relative overflow-hidden rounded-[10px]"
              style={{
                width: 132,
                aspectRatio: "600/1050",
                border: "1px solid rgba(214,178,109,0.32)",
                boxShadow:
                  "0 1px 0 rgba(255,247,225,0.10) inset, 0 -1px 0 rgba(0,0,0,0.4) inset, 0 14px 32px rgba(0,0,0,0.55)",
                transform: card.orientation === "reversed" ? "rotate(180deg)" : undefined,
              }}
            >
              <Image
                src={card.image}
                alt={card.zh_name}
                fill
                sizes="132px"
                className="object-cover"
                priority
              />
            </div>

            {/* motif callout：弧线 + 金色细线 + 标签
                只在有 annotation_label 时显示，画在牌右侧 */}
            {scene.annotation_label_zh && (
              <motion.svg
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                aria-hidden
                viewBox="0 0 120 60"
                className="absolute pointer-events-none"
                style={{
                  right: -94,
                  top: "38%",
                  width: 100,
                  height: 60,
                }}
              >
                <path
                  d="M 4 30 Q 40 30 56 50"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="0.8"
                  opacity="0.7"
                />
                <circle cx="4" cy="30" r="2" fill="var(--accent)" />
              </motion.svg>
            )}
          </motion.div>
        )}

        {/* annotation 标签：archive label 风格，玻璃描边 */}
        {scene.annotation_label_zh && (
          <motion.div
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.85 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full"
            style={{
              background: "rgba(214,178,109,0.10)",
              border: "1px solid rgba(214,178,109,0.45)",
              color: "var(--accent)",
              fontFamily: "var(--font-serif-like)",
              backdropFilter: "blur(8px)",
            }}
          >
            <span
              aria-hidden
              className="block w-1 h-1 rounded-full"
              style={{ background: "var(--accent)" }}
            />
            <span className="text-[11px] tracking-[0.16em]">
              {scene.annotation_label_zh}
            </span>
          </motion.div>
        )}

        {/* 正文 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="text-[13px] md:text-[14px] leading-[1.75] max-w-[22ch]"
          style={{ color: "var(--text-secondary)", fontFamily: "var(--font-serif-like)" }}
        >
          {scene.body_zh}
        </motion.p>
      </div>
    </div>
  );
}
