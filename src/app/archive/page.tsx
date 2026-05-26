"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlchemicalRing,
  CornerOrnament,
  DividerLine,
  ArchiveLabel,
} from "@/components/ArchiveEmblems";
import { ArchiveCard } from "@/components/archive/ArchiveCard";
import { CardDetailModal } from "@/components/archive/CardDetailModal";
import { TabBar } from "@/components/archive/TabBar";
import {
  ARCHIVE_TABS,
  ARCHIVE_TAB_SUBTITLES,
  loadArchiveTab,
} from "@/components/archive/dataset";
import type { ArchiveCardData, ArchiveTabId } from "@/components/archive/types";

function ArchivePageContent() {
  const searchParams = useSearchParams();
  const debugMotifs = searchParams.get("debugMotifs") === "1";
  const [selectedCard, setSelectedCard] = useState<ArchiveCardData | null>(null);
  const [activeTab, setActiveTab] = useState<ArchiveTabId>("major");
  const [activeCards, setActiveCards] = useState<ArchiveCardData[] | null>(null);
  const [loadingTab, setLoadingTab] = useState(false);

  const handleCardClick = useCallback((card: ArchiveCardData) => {
    setSelectedCard(card);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedCard(null);
  }, []);

  // 弹层打开期间锁住背景滚动
  useEffect(() => {
    if (selectedCard) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [selectedCard]);

  // tab 切换：dynamic import 该 tab 的卡片数据
  useEffect(() => {
    let cancelled = false;
    // 一次性 sync 开 loading 状态：不会引发 cascading render（依赖只在 activeTab 变时跑）
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingTab(true);
    loadArchiveTab(activeTab)
      .then((result) => {
        if (!cancelled) {
          setActiveCards(result.cards);
          setLoadingTab(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoadingTab(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  const activeSubtitle = ARCHIVE_TAB_SUBTITLES[activeTab];
  const activeTabConfig = ARCHIVE_TABS.find((t) => t.id === activeTab);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{ background: "var(--hero-bg)" }}
      />

      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          top: "-12%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(90vw, 1100px)",
          height: "60vh",
          background:
            "radial-gradient(ellipse 50% 45% at 50% 35%, rgba(220, 210, 195, 0.06) 0%, rgba(220, 210, 195, 0.018) 40%, transparent 70%)",
          filter: "blur(8px)",
        }}
      />

      <div
        aria-hidden
        className="absolute pointer-events-none flex items-center justify-center"
        style={{
          top: "5%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(620px, 80vw)",
          height: "min(620px, 80vw)",
          opacity: 0.18,
          mixBlendMode: "screen",
        }}
      >
        <AlchemicalRing size={560} rings={5} />
      </div>

      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 8% 14%, rgba(255,247,225,0.55) 0.7px, transparent 1.4px)," +
            "radial-gradient(circle at 22% 7%, rgba(255,255,255,0.40) 0.5px, transparent 1.0px)," +
            "radial-gradient(circle at 38% 22%, rgba(255,247,225,0.32) 0.5px, transparent 1.0px)," +
            "radial-gradient(circle at 62% 11%, rgba(255,247,225,0.50) 0.6px, transparent 1.2px)," +
            "radial-gradient(circle at 78% 28%, rgba(255,255,255,0.36) 0.5px, transparent 1.0px)," +
            "radial-gradient(circle at 92% 16%, rgba(255,247,225,0.45) 0.6px, transparent 1.2px)," +
            "radial-gradient(circle at 6% 42%, rgba(255,255,255,0.30) 0.5px, transparent 1.0px)," +
            "radial-gradient(circle at 48% 36%, rgba(255,247,225,0.34) 0.6px, transparent 1.1px)," +
            "radial-gradient(circle at 88% 48%, rgba(255,247,225,0.42) 0.6px, transparent 1.2px)," +
            "radial-gradient(circle at 14% 58%, rgba(255,255,255,0.34) 0.5px, transparent 1.0px)," +
            "radial-gradient(circle at 32% 72%, rgba(255,247,225,0.38) 0.5px, transparent 1.0px)," +
            "radial-gradient(circle at 56% 84%, rgba(255,247,225,0.42) 0.6px, transparent 1.2px)," +
            "radial-gradient(circle at 84% 78%, rgba(255,255,255,0.32) 0.5px, transparent 1.0px)," +
            "radial-gradient(circle at 18% 88%, rgba(255,247,225,0.40) 0.5px, transparent 1.1px)," +
            "radial-gradient(circle at 72% 96%, rgba(255,247,225,0.30) 0.5px, transparent 1.0px)",
          backgroundSize: "1200px 1200px",
          backgroundRepeat: "repeat",
          mixBlendMode: "screen",
        }}
      />

      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
          backgroundSize: "240px 240px",
          mixBlendMode: "overlay",
        }}
      />

      <CornerOrnament
        size={28}
        position="tl"
        className="absolute top-3 left-3 hidden sm:block"
        style={{ opacity: 0.2 }}
      />
      <CornerOrnament
        size={28}
        position="tr"
        className="absolute top-3 right-3 hidden sm:block"
        style={{ opacity: 0.2 }}
      />
      <CornerOrnament
        size={28}
        position="bl"
        className="absolute bottom-3 left-3 hidden sm:block"
        style={{ opacity: 0.2 }}
      />
      <CornerOrnament
        size={28}
        position="br"
        className="absolute bottom-3 right-3 hidden sm:block"
        style={{ opacity: 0.2 }}
      />

      <main className="relative z-[1] max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-10 md:mb-14"
        >
          <div className="flex items-center justify-center gap-3 mb-5">
            <DividerLine width={32} />
            <ArchiveLabel code="COD.ARCH" />
            <DividerLine width={32} />
          </div>

          <h1
            className="hero-title text-[32px] md:text-[42px] font-light tracking-[-0.012em] leading-[1.3] mb-3"
            style={{ color: "var(--text-primary)" }}
          >
            档案馆
          </h1>

          <p
            className="text-[13px] md:text-[14px] tracking-[0.04em] max-w-md mx-auto"
            style={{ color: "var(--text-tertiary)", lineHeight: 1.7 }}
          >
            Rider–Waite–Smith 完整牌组 · 78 张图像档案
          </p>
        </motion.header>

        <motion.nav
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 md:mb-14"
        >
          <TabBar tabs={ARCHIVE_TABS} activeTab={activeTab} onTabChange={setActiveTab} />
        </motion.nav>

        <motion.div
          key={`header-${activeTab}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex items-center gap-4 mb-8"
        >
          <div className="flex-1 h-px" style={{ background: "var(--border-glass)" }} />
          <div className="text-center">
            <h2
              className="text-[16px] md:text-[18px] tracking-[0.06em] mb-1"
              style={{
                fontFamily: "var(--font-serif-like)",
                color: "var(--text-primary)",
              }}
            >
              {activeTabConfig?.label}
              {activeTabConfig?.subtitle && (
                <span className="ml-2" style={{ color: "var(--text-faint)" }}>
                  · {activeTabConfig.subtitle}
                </span>
              )}
            </h2>
            <p
              className="text-[11px] tracking-[0.08em]"
              style={{ color: "var(--text-faint)" }}
            >
              {activeSubtitle}
            </p>
          </div>
          <div className="flex-1 h-px" style={{ background: "var(--border-glass)" }} />
        </motion.div>

        <AnimatePresence mode="wait">
          {loadingTab || !activeCards ? (
            <motion.div
              key={`loading-${activeTab}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex justify-center py-24"
            >
              <div
                className="w-5 h-5 rounded-full animate-spin"
                style={{
                  border: "1px solid var(--border-glass)",
                  borderTopColor: "var(--accent)",
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 items-stretch"
            >
              {activeCards.map((card, i) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 16, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: 0.4,
                    delay: i * 0.03,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="h-full"
                >
                  <ArchiveCard card={card} onClick={() => handleCardClick(card)} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.footer
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center pt-12 pb-12"
        >
          <DividerLine width={40} className="mx-auto mb-4" />
          <p
            className="text-[11px] tracking-[0.06em]"
            style={{ color: "var(--text-faint)" }}
          >
            78 张图像档案 · 基于 Rider–Waite–Smith 传统
          </p>
          <p
            className="text-[10px] tracking-[0.06em] mt-1"
            style={{ color: "var(--text-faint)", opacity: 0.6 }}
          >
            系统不会替你做决定，只照亮牌面上的符号。
          </p>
        </motion.footer>
      </main>

      <AnimatePresence>
        {selectedCard && (
          <CardDetailModal
            card={selectedCard}
            onClose={handleClose}
            debugMotifs={debugMotifs}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ArchivePage() {
  return (
    <Suspense fallback={null}>
      <ArchivePageContent />
    </Suspense>
  );
}
