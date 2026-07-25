"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { motion, type Transition, type Variants } from "framer-motion";
import { ModeDeckSlot } from "@/components/ui/ModeDeckSlot";
import { HomeEntryCard } from "@/components/HomeEntryCard";
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
  variant: "primary" | "secondary" | "tertiary";
}> = [
  {
    value: "question",
    title: "问题解读",
    tagline: "带着一个具体问题进入。",
    description: "先澄清问题，再推荐合适的牌阵。",
    variant: "primary",
  },
  {
    value: "daily",
    title: "今日一牌",
    tagline: "没有具体问题时使用。",
    description: "抽一张牌，看看今天有什么值得被轻轻看见。",
    variant: "secondary",
  },
  {
    value: "deep",
    title: "深度牌阵",
    tagline: "反复出现、暂时说不清的问题。",
    description: "多张牌铺开，看它们之间的关系。",
    variant: "tertiary",
  },
];

export default function ModeSelector({ onSelect }: Props) {
  const [chosen, setChosen] = useState<Mode | null>(null);
  const deckRef = useRef<HTMLDivElement>(null);
  const flipStateRef = useRef<ModeFlipState | null>(null);
  const onSelectRef = useRef(onSelect);

  useLayoutEffect(() => {
    onSelectRef.current = onSelect;
  });

  const handleClick = (mode: Mode) => {
    if (chosen || !deckRef.current) return;
    if (REGRESSION_STATIC_LAYOUT) {
      setChosen(mode);
      onSelectRef.current(mode);
      return;
    }
    flipStateRef.current = captureModeFlipState(deckRef.current);
    setChosen(mode);
  };

  useLayoutEffect(() => {
    if (REGRESSION_STATIC_LAYOUT) return;
    if (!chosen || !deckRef.current || !flipStateRef.current) return;

    const state = flipStateRef.current;
    flipStateRef.current = null;
    playModeSelectionFlip(state, deckRef.current, chosen);

    const timer = window.setTimeout(() => {
      onSelectRef.current(chosen);
    }, 480);

    return () => window.clearTimeout(timer);
  }, [chosen]);

  const listVariants: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.12 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: SPRING_SMALL },
  };

  return (
    <div className="mode-selector mode-deck">
      <p className="mode-deck__lead text-center mb-5">
        选择一种靠近问题的方式
      </p>

      <div ref={deckRef} className="mode-deck__layout">
        <div className="mode-deck__stage">
          <HomeEntryCard size="deck" />
        </div>

        <motion.div
          className="mode-deck__slots"
          variants={listVariants}
          initial="hidden"
          animate="show"
        >
          {MODES.map((mode) => (
            <motion.div key={mode.value} variants={itemVariants}>
              <ModeDeckSlot
                mode={mode.value}
                title={mode.title}
                tagline={mode.tagline}
                description={mode.description}
                variant={mode.variant}
                chosen={chosen === mode.value}
                disabled={chosen !== null}
                onSelect={() => handleClick(mode.value)}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      <p className="mode-deck__hint text-center mt-5">
        不知道从哪开始？问题解读最常用。
      </p>
    </div>
  );
}
