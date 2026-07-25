"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import AppShell from "@/components/AppShell";
import HeroTitleSplit from "@/components/HeroTitleSplit";
import ModeSelector from "@/components/ModeSelector";
import HeroEntry from "@/components/HeroEntry";
import BookStageBackground from "@/components/BookStageBackground";
import EditorialViewport from "@/components/EditorialViewport";
import ReadingStatusIndicator from "@/components/ReadingStatusIndicator";
import type { UserInput, ReadingMode } from "@/lib/schema";

export default function Home() {
  const router = useRouter();
  const [stage, setStage] = useState<"mode" | "input" | "loading">("mode");
  const [selectedMode, setSelectedMode] = useState<ReadingMode | null>(null);
  const [loading, setLoading] = useState(false);

  const handleModeSelect = (mode: ReadingMode) => {
    setSelectedMode(mode);
    if (mode === "daily") {
      setLoading(true);
      const params = new URLSearchParams({ mode: "daily" });
      setTimeout(() => router.push(`/reading?${params.toString()}`), 300);
    } else {
      setStage("input");
    }
  };

  const handleQuestionSubmit = (input: UserInput) => {
    setLoading(true);
    const params = new URLSearchParams({
      question: input.question,
      domain: input.domain,
      mode: selectedMode ?? "question",
    });
    if (input.context) params.set("context", input.context);
    router.push(`/reading?${params.toString()}`);
  };

  const handleBack = () => {
    setStage("mode");
    setSelectedMode(null);
  };

  return (
    <AppShell immersive>
      <EditorialViewport credit="Tarot Reflector">
      <div className="home-page home-hero-canvas home-hero-canvas--book relative w-full flex-1 min-h-0 flex flex-col overflow-x-hidden">
        <BookStageBackground />

        {/* 这里原本有一组「仅窄屏」的浮动品牌图标 + 主题切换：
            当时顶栏在窄屏既不显示导航、品牌也很弱，只好在页面上补两个。
            现在顶栏在所有断点都有品牌、导航和主题切换，它们只会重复。 */}

        <main className="hero-shell relative z-[1] flex-1 min-h-0 flex flex-col">
          <LayoutGroup id="home-entry-flow">
            <AnimatePresence mode="popLayout">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45 }}
                  className="flex flex-1 flex-col items-center justify-center px-5"
                >
                  <ReadingStatusIndicator
                    status={selectedMode === "daily" ? "shuffling" : "question_reframing"}
                  />
                </motion.div>
              ) : stage === "mode" ? (
                <motion.div
                  key="mode-select"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45 }}
                  className="home-mode-screen flex flex-1 flex-col items-center justify-center w-full"
                >
                  <div className="text-center mb-5 md:mb-7 w-full max-w-2xl mx-auto">
                    <HeroTitleSplit className="hero-title hero-title--editorial font-light">
                      翻开一页档案，
                      <br />
                      <span className="hero-title__emphasis">看见你问题的结构。</span>
                    </HeroTitleSplit>
                    <p className="editorial-lead">
                      不用马上知道答案。先选一条路，靠近此刻最占据你的那件事。
                    </p>
                  </div>
                  <ModeSelector onSelect={handleModeSelect} />
                </motion.div>
              ) : (
                <motion.div
                  key="question-input"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45 }}
                  className="flex flex-1 flex-col w-full min-h-0"
                >
                  <HeroEntry embedded onBack={handleBack} onSubmit={handleQuestionSubmit} />
                </motion.div>
              )}
            </AnimatePresence>
          </LayoutGroup>
        </main>
      </div>
      </EditorialViewport>
    </AppShell>
  );
}
