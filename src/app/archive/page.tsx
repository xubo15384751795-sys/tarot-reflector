"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useClientMounted } from "@/features/motion";
import {
  AlchemicalRing,
  CornerOrnament,
  DividerLine,
  ArchiveLabel,
} from "@/components/ArchiveEmblems";
import { ArchiveCard } from "@/components/archive/ArchiveCard";
import AppShell from "@/components/AppShell";
import ReadingStatusIndicator from "@/components/ReadingStatusIndicator";
import { CardDetailModal } from "@/components/archive/CardDetailModal";
import {
  ArchiveDeckEntrance,
  getArchiveTabCaption,
} from "@/components/archive/ArchiveDeckEntrance";
import { ARCHIVE_TABS, loadArchiveTab } from "@/components/archive/dataset";
import type { ArchiveCardData, ArchiveTabId } from "@/components/archive/types";

function ArchivePageContent() {
  const searchParams = useSearchParams();
  const debugMotifs = searchParams.get("debugMotifs") === "1";
  const [selectedCard, setSelectedCard] = useState<ArchiveCardData | null>(null);
  const [activeTab, setActiveTab] = useState<ArchiveTabId>("major");
  const [tabData, setTabData] = useState<{
    tab: ArchiveTabId;
    cards: ArchiveCardData[];
  } | null>(null);
  const [hoverTab, setHoverTab] = useState<ArchiveTabId | null>(null);

  const handleTabChange = useCallback((id: ArchiveTabId) => {
    setHoverTab(null);
    setActiveTab(id);
  }, []);

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

  useEffect(() => {
    let cancelled = false;
    loadArchiveTab(activeTab)
      .then((result) => {
        if (!cancelled) {
          setTabData({ tab: activeTab, cards: result.cards });
        }
      })
      .catch(() => {
        if (!cancelled) setTabData({ tab: activeTab, cards: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  const loadingTab = !tabData || tabData.tab !== activeTab;
  const activeCards = tabData?.tab === activeTab ? tabData.cards : null;
  const mounted = useClientMounted();
  const captionTab = hoverTab ?? activeTab;

  return (
    <AppShell showActions={false}>
    <div className="relative min-h-[calc(100vh-60px)] w-full overflow-hidden">
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

      <main className="relative z-[1] max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <header className="archive-page-hero text-center">
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
        </header>

        <nav aria-label="牌组入口">
          <ArchiveDeckEntrance
            tabs={ARCHIVE_TABS}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onPreviewHover={setHoverTab}
            onPreviewLeave={() => setHoverTab(null)}
          />
        </nav>

        <section className="archive-preview" aria-labelledby="archive-preview-heading">
          <h2 id="archive-preview-heading" className="archive-preview__heading">
            当前浏览
          </h2>
          <p
            className="archive-preview__caption"
            aria-live="polite"
          >
            {getArchiveTabCaption(captionTab)}
          </p>
        </section>

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
              <ReadingStatusIndicator status="archive_browsing" />
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={mounted ? { opacity: 0, y: 16 } : false}
              animate={mounted ? { opacity: 1, y: 0 } : false}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="cards-grid"
            >
              {activeCards.map((card, i) => (
                <motion.div
                  key={card.id}
                  initial={mounted ? { opacity: 0, y: 10 } : false}
                  animate={mounted ? { opacity: 1, y: 0 } : false}
                  transition={{
                    duration: 0.32,
                    delay: Math.min(i * 0.02, 0.4),
                    ease: [0.22, 1, 0.36, 1],
                  }}
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
    </AppShell>
  );
}

export default function ArchivePage() {
  return (
    <Suspense fallback={null}>
      <ArchivePageContent />
    </Suspense>
  );
}
