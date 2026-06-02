"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useClientMounted, isArchiveMotionFlagEnabled } from "@/features/motion";
import { DividerLine, ArchiveLabel } from "@/components/ArchiveEmblems";
import { SectionHeader } from "@/components/ui/SectionHeader";
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
  const thumbEntrance = isArchiveMotionFlagEnabled("thumbEntrance");
  const heroEntrance = isArchiveMotionFlagEnabled("heroEntrance");

  return (
    <AppShell showActions={false}>
      <div className="relative min-h-[calc(100vh-60px)] w-full archive-page parchment-noise">
        <div className="archive-page-ambient" aria-hidden="true" />
        <main className="relative z-[1] max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 archive-page-main">
          <motion.header
            className="archive-page-hero archive-hero"
            initial={heroEntrance && mounted ? { opacity: 0, y: 10 } : false}
            animate={heroEntrance && mounted ? { opacity: 1, y: 0 } : false}
            transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <DividerLine width={32} />
              <ArchiveLabel code="COD.ARCH" />
              <DividerLine width={32} />
            </div>
            <SectionHeader
              title="档案馆"
              subtitle="Rider–Waite–Smith 完整牌组 · 78 张图像档案"
              className="archive-page-hero__head"
            />
          </motion.header>

          <nav aria-label="牌组入口">
            <ArchiveDeckEntrance
              tabs={ARCHIVE_TABS}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              onPreviewHover={setHoverTab}
              onPreviewLeave={() => setHoverTab(null)}
            />
          </nav>

          <section className="archive-preview current-browse" aria-labelledby="archive-preview-heading">
            <h2 id="archive-preview-heading" className="archive-preview__heading">
              当前浏览
            </h2>
            <p className="archive-preview__caption" aria-live="polite">
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
                className="flex justify-center py-16"
              >
                <ReadingStatusIndicator status="archive_browsing" />
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={thumbEntrance && mounted ? { opacity: 0, y: 12 } : false}
                animate={thumbEntrance && mounted ? { opacity: 1, y: 0 } : false}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="cards-grid"
              >
                {activeCards.map((card, i) => (
                  <motion.div
                    key={card.id}
                    initial={thumbEntrance && mounted ? { opacity: 0, y: 8 } : false}
                    animate={thumbEntrance && mounted ? { opacity: 1, y: 0 } : false}
                    transition={{
                      duration: 0.28,
                      delay: Math.min(i * 0.015, 0.25),
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <ArchiveCard card={card} onClick={() => handleCardClick(card)} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <footer className="archive-page-footer text-center">
            <DividerLine width={40} className="mx-auto mb-3" />
            <p className="text-[11px] tracking-[0.06em]" style={{ color: "var(--text-faint)" }}>
              78 张图像档案 · 基于 Rider–Waite–Smith 传统
            </p>
          </footer>
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
