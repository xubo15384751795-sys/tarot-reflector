"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import TarotCardStage from "@/components/TarotCardStage";
import { CARD_BACK_PATH } from "@/components/CardBackImage";
import { springCard } from "@/features/motion";

export const HOME_ENTRY_CARD_LAYOUT_ID = "home-entry-card";

type Size = "deck" | "hero";

type Props = {
  size?: Size;
  className?: string;
  layoutId?: string | false;
};

/** 首页入口牌背 — ModeSelector 与 HeroEntry 共享 layoutId 连续过渡 */
export function HomeEntryCard({
  size = "deck",
  className = "",
  layoutId = HOME_ENTRY_CARD_LAYOUT_ID,
}: Props) {
  const isHero = size === "hero";
  const rotate = isHero ? -2 : -1.5;
  // 宽度由 .home-entry-card--{hero,deck} 单独负责（见 home.css），
  // 这里只解除 TarotCardStage 内联的 maxWidth:280 上限。
  const stageClass = "!max-w-full";

  const inner = (
    <div
      className={
        isHero ? "home-entry-card__inner" : "home-entry-card__inner home-entry-card__float"
      }
    >
      <div className="home-entry-card__light-pool" aria-hidden />
      <div className="home-entry-card__rim" aria-hidden />
      <TarotCardStage
        className={stageClass}
        rotate={rotate}
        initial={{ opacity: 1, y: 0, rotate, scale: 1 }}
        animate={{ opacity: 1, y: 0, rotate, scale: 1 }}
        transition={{ duration: 0 }}
        showGroundShadow
      >
        <div className="relative w-full h-full rounded-[inherit] overflow-hidden">
          <Image
            src={CARD_BACK_PATH}
            alt="塔罗牌背面"
            fill
            sizes={isHero ? "(min-width: 768px) 280px, 240px" : "(min-width: 768px) 220px, 200px"}
            priority
            className="object-cover"
          />
        </div>
      </TarotCardStage>
    </div>
  );

  const shellClass = `home-entry-card home-entry-card--${size} home-entry-card--on-book physical-card rounded-xl overflow-visible ${className}`;

  if (layoutId === false) {
    return <div className={shellClass}>{inner}</div>;
  }

  return (
    <motion.div
      layoutId={layoutId}
      className={shellClass}
      transition={springCard}
    >
      {inner}
    </motion.div>
  );
}
