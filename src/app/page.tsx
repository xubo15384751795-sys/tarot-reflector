"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AppShell from "@/components/AppShell";
import HeroTitleSplit from "@/components/HeroTitleSplit";
import ModeSelector from "@/components/ModeSelector";
import HeroEntry from "@/components/HeroEntry";
import ThemeToggle from "@/components/ThemeToggle";
import LuminousLayer from "@/components/LuminousLayer";
import { AlchemicalRing, CornerOrnament, ArchiveLabel, DividerLine } from "@/components/ArchiveEmblems";
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
    <div className="home-page home-hero-canvas relative w-full min-h-full overflow-x-hidden">
      <LuminousLayer intensity="medium" />
      <div aria-hidden className="absolute inset-0 pointer-events-none opacity-[0.015]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`, backgroundRepeat: "repeat", backgroundSize: "180px 180px", mixBlendMode: "overlay" }} />

      <div aria-hidden className="absolute pointer-events-none candle-glow" style={{ top: "-8%", left: "-5%", width: "50%", height: "50%", background: "radial-gradient(ellipse 50% 45% at 25% 25%, var(--candlelight) 0%, transparent 70%)" }} />

      {/* Brand — 仅在模式选择阶段显示 */}
      {stage === "mode" && (
        <>
          <div className="absolute top-6 left-6 md:top-8 md:left-10 z-10 md:hidden">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl" style={{ border: "1px solid var(--border-glass)", background: "var(--bg-glass)", backdropFilter: "blur(8px)" }}>
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

      {/* 炼金术圆环 — 移动端缩小，超出部分不显示 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ opacity: 0.16 }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: "min(520px, 90vw)", height: "min(520px, 90vw)" }}>
          <AlchemicalRing size={520} rings={5} />
        </div>
      </div>

      {/* 极淡的牌面剪影锚点 — 提示这里是"翻开一张牌"的入口 */}
      <div
        aria-hidden
        className="absolute pointer-events-none hidden md:block"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "240px",
          aspectRatio: "600 / 1050",
          borderRadius: "10px",
          border: "1px solid var(--border-glass)",
          opacity: 0.18,
          mixBlendMode: "screen",
        }}
      />
      {/* 角饰 — 移动端缩小 */}
      <CornerOrnament size={28} position="tl" className="absolute top-3 left-3 hidden sm:block" style={{ opacity: 0.2 }} />
      <CornerOrnament size={28} position="tr" className="absolute top-3 right-3 hidden sm:block" style={{ opacity: 0.2 }} />
      <CornerOrnament size={28} position="bl" className="absolute bottom-3 left-3 hidden sm:block" style={{ opacity: 0.2 }} />
      <CornerOrnament size={28} position="br" className="absolute bottom-3 right-3 hidden sm:block" style={{ opacity: 0.2 }} />

      <main className="hero-shell relative z-[1] min-h-[calc(100dvh-var(--app-header-height))] flex flex-col">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="flex flex-1 flex-col items-center justify-center px-5">
              <ReadingStatusIndicator
                status={selectedMode === "daily" ? "shuffling" : "question_reframing"}
              />
            </motion.div>
          ) : stage === "mode" ? (
            <motion.div key="mode-select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="reading-entry-page hero-entry flex flex-1 flex-col items-center justify-center w-full max-w-[520px] mx-auto px-5 md:px-12 py-12 md:py-16">
              <div className="text-center mb-10">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <DividerLine width={28} />
                  <ArchiveLabel code="COD.001" />
                  <DividerLine width={28} />
                </div>
                <div className="flex items-center justify-center gap-3 mb-4" style={{ color: "var(--accent)", opacity: 0.75 }}>
                  <span className="block w-8 h-px" style={{ background: "var(--accent)", opacity: 0.4 }} />
                  <span className="text-[14px] tracking-[0.42em]">阈&nbsp;牌</span>
                  <span className="block w-8 h-px" style={{ background: "var(--accent)", opacity: 0.4 }} />
                </div>
                <HeroTitleSplit className="hero-title text-[28px] md:text-[36px] font-light tracking-[-0.012em] leading-[1.3]">
                  翻开一页档案，
                  <br />
                  看见你问题的结构。
                </HeroTitleSplit>
                <p
                  className="mt-4 text-[13px] md:text-[14px] tracking-[0.02em] leading-[1.7]"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  不用马上知道答案。先选择一种方式，靠近此刻最占据你的那件事。
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
              transition={{ duration: 0.6 }}
              className="flex flex-1 flex-col w-full min-h-0"
            >
              <HeroEntry embedded onBack={handleBack} onSubmit={handleQuestionSubmit} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
    </AppShell>
  );
}
