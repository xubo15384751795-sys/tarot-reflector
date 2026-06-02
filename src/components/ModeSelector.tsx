"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { motion, type Transition, type Variants } from "framer-motion";
import { DividerLine } from "./ArchiveEmblems";
import { ModeCard } from "@/components/ui/ModeCard";
import { useFoilSpotlight } from "@/lib/useFoilSpotlight";
import { REGRESSION_STATIC_LAYOUT } from "@/features/motion";
import {
  captureModeFlipState,
  playModeSelectionFlip,
  type ModeFlipState,
} from "@/features/motion/modeFlip.gsap";

type Mode = "daily" | "question" | "deep";

type Props = {
  onSelect: (mode: Mode) => void;
};

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
    description: "抽一张牌，看看今天有什么值得被轻轻看见。",
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
    tagline: "适合反复出现、暂时说不清的问题。",
    description: "用多张牌，慢慢看见它的层次。",
  },
];

export default function ModeSelector({ onSelect }: Props) {
  const [chosen, setChosen] = useState<Mode | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const flipStateRef = useRef<ModeFlipState | null>(null);
  const onSelectRef = useRef(onSelect);

  useLayoutEffect(() => {
    onSelectRef.current = onSelect;
  });

  useFoilSpotlight(listRef, ".mode-card");

  const handleClick = (mode: Mode) => {
    if (chosen || !listRef.current) return;
    if (REGRESSION_STATIC_LAYOUT) {
      setChosen(mode);
      onSelectRef.current(mode);
      return;
    }
    flipStateRef.current = captureModeFlipState(listRef.current);
    setChosen(mode);
  };

  useLayoutEffect(() => {
    if (REGRESSION_STATIC_LAYOUT) return;
    if (!chosen || !listRef.current || !flipStateRef.current) return;

    const state = flipStateRef.current;
    flipStateRef.current = null;
    playModeSelectionFlip(state, listRef.current, chosen);

    const timer = window.setTimeout(() => {
      onSelectRef.current(chosen);
    }, 480);

    return () => window.clearTimeout(timer);
  }, [chosen]);

  const listVariants: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: SPRING_SMALL },
  };

  return (
    <div className="mode-selector w-full max-w-[480px] mx-auto flex flex-col gap-4">
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
        className="mode-card-grid flex flex-col gap-4"
        variants={listVariants}
        initial="hidden"
        animate="show"
      >
        {MODES.map((mode, i) => (
          <motion.div key={mode.value} variants={itemVariants} className="w-full">
            <ModeCard
              index={i + 1}
              mode={mode.value}
              title={mode.title}
              tagline={mode.tagline}
              description={mode.description}
              recommended={mode.recommended}
              chosen={chosen === mode.value}
              disabled={chosen !== null}
              onSelect={() => handleClick(mode.value)}
            />
          </motion.div>
        ))}
      </motion.div>

      <div className="flex justify-center mt-2">
        <DividerLine width={40} />
      </div>
    </div>
  );
}
