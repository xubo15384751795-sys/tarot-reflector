"use client";

import { motion } from "framer-motion";
import type { Motif, Orientation } from "@/lib/schema";
import CardImage from "./CardImage";
import CardBackImage from "./CardBackImage";
import { CornerOrnament, ArchiveLabel } from "./ArchiveEmblems";

type Props = {
  image: string;
  cardName: string;
  zhName: string;
  orientation: Orientation;
  motifs: Motif[];
  number?: number;
  onComplete: () => void;
};

/** 纸牌物理感 spring */
const cardSpring = {
  type: "spring" as const,
  stiffness: 95,
  damping: 18,
  mass: 0.85,
};

export default function CardReveal({
  image,
  cardName,
  zhName,
  orientation,
  motifs: _motifs,
  number: _number,
  onComplete,
}: Props) {
  const oLabel = orientation === "upright" ? "正位" : "逆位";

  return (
    <div className="flex flex-col items-center justify-center min-h-[480px] gap-8">
      {/* 档案编号 */}
      <ArchiveLabel code={`COD.${zhName.replace(/[^一-龥]/g, "").slice(0, 2).toUpperCase()}`} />

      {/* 三层阴影系统 + 纸质 frame */}
      <div className="relative" style={{ width: "min(280px, 64vw)" }}>
        {/* 暖金光晕 */}
        <div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            inset: "-18%",
            borderRadius: 32,
            background:
              "radial-gradient(circle at 50% 48%, rgba(214,178,109,0.18) 0%, rgba(214,178,109,0.08) 34%, rgba(214,178,109,0.02) 58%, transparent 72%)",
            filter: "blur(18px)",
            transform: "translateY(10px)",
          }}
        />
        {/* 落地椭圆阴影 */}
        <div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            bottom: -18,
            left: "14%",
            width: "72%",
            height: 32,
            borderRadius: 999,
            background: "rgba(72, 54, 34, 0.16)",
            filter: "blur(18px)",
            transform: "scaleX(1.05)",
          }}
        />

        {/* 四角饰 */}
        <CornerOrnament size={28} position="tl" className="absolute -top-3 -left-3 z-10" />
        <CornerOrnament size={28} position="tr" className="absolute -top-3 -right-3 z-10" />
        <CornerOrnament size={28} position="bl" className="absolute -bottom-3 -left-3 z-10" />
        <CornerOrnament size={28} position="br" className="absolute -bottom-3 -right-3 z-10" />

        {/* 纸质 frame */}
        <div
          className="relative z-[1]"
          style={{
            padding: 8,
            borderRadius: 18,
            background: "rgba(255, 252, 244, 0.62)",
            border: "1px solid rgba(92, 66, 38, 0.16)",
            boxShadow:
              "0 10px 18px rgba(72, 54, 34, 0.14), 0 32px 80px rgba(82, 62, 40, 0.12)",
          }}
        >
          {/* 翻牌动画 — 改善 ease 曲线，不要硬翻 */}
          <motion.div
            initial={{ rotateY: 0, scale: 0.96 }}
            animate={{ rotateY: 180, scale: 1 }}
            transition={{
              rotateY: { duration: 1.05, ease: [0.22, 1, 0.36, 1] },
              scale: cardSpring,
            }}
            onAnimationComplete={onComplete}
            className="relative"
            style={{
              transformStyle: "preserve-3d",
              perspective: 1400,
              width: "100%",
              aspectRatio: "600 / 1050",
            }}
          >
            {/* 牌背 — 三层阴影 + 纸感 */}
            <div
              className="absolute inset-0 rounded-[11px] overflow-hidden"
              style={{
                backfaceVisibility: "hidden",
                border: "1px solid rgba(78, 60, 40, 0.18)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.5), 0 10px 18px rgba(72, 54, 34, 0.16), 0 28px 70px rgba(82, 62, 40, 0.13)",
              }}
            >
              <CardBackImage eager />
            </div>

            {/* 牌面 — 三层阴影 + 纸感 */}
            <div
              className="absolute inset-0 rounded-[11px] overflow-hidden"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                border: "1px solid rgba(78, 60, 40, 0.18)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.5), 0 10px 18px rgba(72, 54, 34, 0.16), 0 28px 70px rgba(82, 62, 40, 0.13)",
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
          </motion.div>
        </div>
      </div>

      {/* 牌名 — 柔和浮现 */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.7 }}
        className="text-center"
      >
        <div className="text-[18px] font-light tracking-[0.06em] mb-1" style={{ color: "var(--text-primary)" }}>
          {zhName}
        </div>
        <div className="text-[11px] tracking-[0.08em] mb-0.5" style={{ color: "var(--text-tertiary)" }}>
          {cardName}
        </div>
        <div
          className="text-[10px] tracking-[0.12em] annotation-ink"
          style={{ color: orientation === "upright" ? "var(--accent)" : "var(--text-tertiary)" }}
        >
          {oLabel}
        </div>
      </motion.div>
    </div>
  );
}
