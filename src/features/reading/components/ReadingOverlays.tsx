"use client";

/**
 * Reading 页面的浮层集合：
 *   - 注记保存的 toast
 *   - 软关闭转场
 *   - 演示模式（视频脚本）
 *
 * 与主流程解耦，方便 reading/page.tsx 保持轻薄。
 */

import { AnimatePresence, motion } from "framer-motion";
import DemoModePlayer from "@/components/DemoModePlayer";
import CoverPreview from "@/components/CoverPreview";
import {
  AlchemicalRing,
  ArchiveLabel,
  CornerOrnament,
} from "@/components/ArchiveEmblems";
import type { ReadingScript as VideoReadingScript } from "@/types/readingScript";
import type { ReadingScript } from "../types/reading";

type Props = {
  noteSaved: boolean;
  softClose: boolean;
  demoMode: boolean;
  videoScript: VideoReadingScript | null;
  script: ReadingScript | null;
  onCloseDemo: () => void;
};

export default function ReadingOverlays({
  noteSaved,
  softClose,
  demoMode,
  videoScript,
  script,
  onCloseDemo,
}: Props) {
  return (
    <>
      <AnimatePresence>
        {noteSaved && (
          <motion.div
            key="note-saved"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.35 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full text-[12px] tracking-[0.04em]"
            style={{
              color: "var(--accent)",
              background: "var(--surface-strong)",
              border: "1px solid var(--accent-dim)",
              backdropFilter: "blur(18px)",
            }}
          >
            注记已留在本机
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {softClose && (
          <motion.div
            key="soft-close"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-6 text-center"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(8,8,10,0.92) 0%, rgba(0,0,0,1) 100%)",
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              className="max-w-[420px]"
            >
              <p
                className="text-[15px] tracking-[0.1em] mb-4"
                style={{ color: "var(--accent)", opacity: 0.8 }}
              >
                档案已合上
              </p>
              <p
                className="text-[13px] leading-[1.85]"
                style={{ color: "var(--text-tertiary)" }}
              >
                这一页已经翻过去了。把它当作一个观察的角度就好。
                <br />
                档案馆的门始终开着——需要时，再回来翻开新的一页。
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {demoMode && videoScript && (
          <motion.div
            key="demo-mode"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50 overflow-y-auto"
          >
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{ background: "var(--hero-bg)" }}
            />
            <div
              aria-hidden
              className="absolute pointer-events-none"
              style={{
                top: "-10%",
                left: "50%",
                transform: "translateX(-50%)",
                width: "min(90vw, 900px)",
                height: "50vh",
                background:
                  "radial-gradient(ellipse 55% 50% at 50% 35%, rgba(220,210,195,0.06) 0%, transparent 70%)",
                filter: "blur(8px)",
              }}
            />
            <div
              aria-hidden
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ opacity: 0.08, mixBlendMode: "screen" }}
            >
              <AlchemicalRing size={520} rings={4} />
            </div>
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none opacity-[0.025]"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                backgroundSize: "240px 240px",
                mixBlendMode: "overlay",
              }}
            />
            <CornerOrnament size={28} position="tl" className="absolute top-3 left-3 hidden sm:block z-[1]" style={{ opacity: 0.22 }} />
            <CornerOrnament size={28} position="tr" className="absolute top-3 right-3 hidden sm:block z-[1]" style={{ opacity: 0.22 }} />
            <CornerOrnament size={28} position="bl" className="absolute bottom-3 left-3 hidden sm:block z-[1]" style={{ opacity: 0.22 }} />
            <CornerOrnament size={28} position="br" className="absolute bottom-3 right-3 hidden sm:block z-[1]" style={{ opacity: 0.22 }} />

            <div className="relative z-[2] min-h-full flex items-start justify-center px-4 py-10">
              <div className="flex flex-col items-center gap-7 w-full max-w-[420px]">
                <div className="flex flex-col items-center gap-3 w-full">
                  <div className="flex items-center justify-center gap-3">
                    <span aria-hidden className="block w-6 h-px" style={{ background: "var(--accent)", opacity: 0.5 }} />
                    <ArchiveLabel code="COD.VID" />
                    <span aria-hidden className="block w-6 h-px" style={{ background: "var(--accent)", opacity: 0.5 }} />
                  </div>
                  <h2
                    className="hero-title text-[22px] md:text-[26px] font-light tracking-[-0.012em]"
                    style={{ color: "var(--text-primary)" }}
                  >
                    解读短片预览
                  </h2>
                  <p
                    className="text-[10.5px] tracking-[0.22em]"
                    style={{
                      color: "var(--text-faint)",
                      fontFamily: "var(--font-serif-like)",
                    }}
                  >
                    自 动 播 放 · 字 幕 · 适 合 分 享
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onCloseDemo}
                  className="archive-link absolute top-5 right-5 z-[3]"
                  style={{ padding: "7px 14px" }}
                  aria-label="关闭"
                >
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  <span className="text-[11px]">关闭</span>
                </button>

                <DemoModePlayer
                  script={videoScript}
                  cards={script?.cards?.map((c) => ({
                    card_id: c.card_id,
                    zh_name: c.zh_name,
                    image: c.image,
                    orientation: c.orientation,
                  }))}
                  autoPlay
                  onComplete={() => {}}
                />

                <div className="flex items-center justify-center gap-3 w-full pt-2">
                  <span aria-hidden className="block w-10 h-px" style={{ background: "var(--accent)", opacity: 0.35 }} />
                  <span
                    className="text-[10px] tracking-[0.24em]"
                    style={{
                      color: "var(--text-faint)",
                      fontFamily: "var(--font-serif-like)",
                    }}
                  >
                    封 面
                  </span>
                  <span aria-hidden className="block w-10 h-px" style={{ background: "var(--accent)", opacity: 0.35 }} />
                </div>

                <div className="flex justify-center w-full">
                  <CoverPreview
                    cover={videoScript.cover}
                    cardImage={
                      script?.cards?.find(
                        (c) => c.card_id === videoScript.cover.cover_card_id,
                      )?.image ?? script?.image
                    }
                    aspect="1:1"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
