"use client";

import { useRef, useState } from "react";
import { motion, type Transition, type Variants } from "framer-motion";
import { CornerOrnament, DividerLine } from "./ArchiveEmblems";
import { useFoilSpotlight } from "@/lib/useFoilSpotlight";

type Mode = "daily" | "question" | "deep";

type Props = {
  onSelect: (mode: Mode) => void;
};

const EASE_SOFT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const SPRING_SMALL: Transition = {
  type: "spring",
  stiffness: 160,
  damping: 20,
  mass: 0.7,
};

const MODES: Array<{
  value: Mode;
  title: string;
  tagline: string;
  description: string;
  recommended?: boolean;
}> = [
  {
    value: "daily",
    title: "今日一牌",
    tagline: "没有具体问题时使用。",
    description: "抽一张牌，看看今天最值得留意的状态。",
  },
  {
    value: "question",
    title: "问题解读",
    tagline: "带着一个具体问题进入。",
    description: "系统会先帮你澄清，再推荐合适的牌阵。",
    recommended: true,
  },
  {
    value: "deep",
    title: "深度牌阵",
    tagline: "适合复杂、反复、牵涉较多的问题。",
    description: "使用多张牌，分析牌与牌之间的关系。",
  },
];

export default function ModeSelector({ onSelect }: Props) {
  const [chosen, setChosen] = useState<Mode | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  useFoilSpotlight(listRef, ".mode-card");

  const handleClick = (mode: Mode) => {
    if (chosen) return;
    setChosen(mode);
    // 让"被选中卡片放大、其他卡片淡出"先播完再切页
    window.setTimeout(() => onSelect(mode), 420);
  };

  const listVariants: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: SPRING_SMALL },
  };

  return (
    <div className="w-full max-w-[480px] mx-auto flex flex-col gap-4">
      <div className="flex items-center justify-center gap-3 mb-4">
        <DividerLine width={32} />
        <span
          className="text-[11px] tracking-[0.18em]"
          style={{ color: "var(--ink-warm)" }}
        >
          选择一种靠近问题的方式
        </span>
        <DividerLine width={32} />
      </div>

      <motion.div
        ref={listRef}
        className="flex flex-col gap-4"
        variants={listVariants}
        initial="hidden"
        animate="show"
      >
        {MODES.map((mode, i) => {
          const isChosen = chosen === mode.value;
          const isOther = chosen !== null && chosen !== mode.value;

          return (
            <motion.button
              key={mode.value}
              type="button"
              variants={itemVariants}
              animate={{
                opacity: isOther ? 0 : 1,
                scale: isChosen ? 1.025 : 1,
                y: 0,
              }}
              transition={{ duration: 0.4, ease: EASE_SOFT }}
              onClick={() => handleClick(mode.value)}
              disabled={chosen !== null}
              className={`relative w-full text-left mode-card rounded-2xl px-5 py-5 ${
                isChosen ? "is-chosen" : ""
              } ${mode.recommended ? "is-recommended" : ""}`}
              aria-label={`${mode.title} — ${mode.tagline}`}
            >
              {mode.recommended && !isChosen && (
                <span className="mode-card__badge">推荐</span>
              )}

              {isChosen && (
                <>
                  <CornerOrnament
                    size={16}
                    position="tl"
                    className="absolute top-1 left-1"
                    style={{ opacity: 0.6 }}
                  />
                  <CornerOrnament
                    size={16}
                    position="tr"
                    className="absolute top-1 right-1"
                    style={{ opacity: 0.6 }}
                  />
                  <CornerOrnament
                    size={16}
                    position="bl"
                    className="absolute bottom-1 left-1"
                    style={{ opacity: 0.6 }}
                  />
                  <CornerOrnament
                    size={16}
                    position="br"
                    className="absolute bottom-1 right-1"
                    style={{ opacity: 0.6 }}
                  />
                </>
              )}

              <div className="flex items-center gap-4">
                <span className="mode-card__num shrink-0">{i + 1}</span>
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <span className="mode-card__title">{mode.title}</span>
                  <span className="mode-card__tagline">{mode.tagline}</span>
                  <span className="mode-card__description">{mode.description}</span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      <div className="flex justify-center mt-2">
        <DividerLine width={40} />
      </div>
    </div>
  );
}
