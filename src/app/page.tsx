"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import AppShell from "@/components/AppShell";
import HeroTitleSplit from "@/components/HeroTitleSplit";
import ModeSelector from "@/components/ModeSelector";
import HeroEntry from "@/components/HeroEntry";
import ThemeToggle from "@/components/ThemeToggle";
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
    <AppShell showActions={false} immersive>
      <EditorialViewport credit="Tarot Reflector">
      <div className="home-page home-hero-canvas home-hero-canvas--book relative w-full min-h-full overflow-x-hidden">
        <BookStageBackground />

        {stage === "mode" && (
          <>
            <div className="absolute top-6 left-6 md:top-8 md:left-10 z-10 md:hidden">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl glass-lens">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="var(--accent)" strokeWidth="1.2" style={{ opacity: 0.9 }}>
                  <path d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z" />
                </svg>
              </div>
            </div>
            <div className="absolute top-5 right-5 md:top-7 md:right-9 z-10 md:hidden">
              <ThemeToggle variant="icon" />
            </div>
          </>
        )}

        <main className="hero-shell relative z-[1] min-h-[calc(100dvh-var(--app-header-height))] flex flex-col">
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
                  className="reading-entry-page reading-entry-page--editorial hero-entry flex flex-1 flex-col items-center justify-center w-full mx-auto px-5 md:px-10 py-10 md:py-14"
                >
                  <div className="text-center mb-10 md:mb-14 w-full max-w-2xl mx-auto">
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
