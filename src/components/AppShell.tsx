/**
 * 应用外壳：顶栏（品牌 + 导航 + 操作）+ 主内容。
 *
 * 全站只有这一套导航。之前首页用顶部横排、其余页面用左侧 88px 图标栏，
 * 换个页面就换一次导航骨架；而且两套都是 `hidden md:flex`，窄屏上
 * 等于没有导航。现在统一成顶部横排，并且在窄屏也保留。
 */

"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ensureNotesRepository } from "@/features/notes/repository";
import ThemeToggle from "./ThemeToggle";
import EditorialTopNav from "./EditorialTopNav";

function IconRedraw() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M4 12a8 8 0 1 1 2.5 5.8" />
      <polyline points="3,11 6.5,17.5 11,14" />
    </svg>
  );
}
function IconShare() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="6" cy="12" r="2" />
      <circle cx="18" cy="6" r="2" />
      <circle cx="18" cy="18" r="2" />
      <line x1="8" y1="11" x2="16" y2="7" />
      <line x1="8" y1="13" x2="16" y2="17" />
    </svg>
  );
}
type Props = {
  children: ReactNode;
  /** 传入即显示「重新抽牌」；不传即隐藏（不需要额外的 showActions 开关） */
  onRedraw?: () => void;
  /** 传入即显示「分享此刻」 */
  onShare?: () => void;
  shareHint?: string | null;
  /** 首页/入口：整页共用 hero 背景，顶栏无硬分割线 */
  immersive?: boolean;
};

export default function AppShell({
  children,
  onRedraw,
  onShare,
  shareHint,
  immersive = false,
}: Props) {
  const [confirmRedraw, setConfirmRedraw] = useState(false);

  useEffect(() => {
    void ensureNotesRepository();
  }, []);

  return (
    <div
      className={`flex flex-col min-h-screen w-full relative ${immersive ? "app-shell--immersive" : ""}`}
    >
      {immersive && <div aria-hidden className="app-shell-atmosphere pointer-events-none" />}

      <div className="app-shell-main flex-1 flex flex-col min-w-0 relative z-[1]">
        <header
          className={`app-shell-header flex items-center justify-between px-4 md:px-10 py-4 md:py-5 sticky top-0 z-20 shrink-0 ${
            immersive ? "app-shell-header--immersive app-shell-header--editorial" : ""
          }`}
          style={
            immersive
              ? undefined
              : {
                  borderBottom: "1px solid var(--border-glass)",
                  background: "var(--bg-elevated)",
                  backdropFilter: "blur(12px)",
                }
          }
        >
          <div className="app-shell-header__brand flex items-baseline gap-3 min-w-0">
            <Link
              href="/"
              className="text-[length:var(--text-title-sm)] md:text-[length:var(--text-title-md)] font-light tracking-[0.18em] shrink-0 transition-opacity hover:opacity-80"
              style={{ color: "var(--text-primary)", fontFamily: "var(--font-serif-like)" }}
            >
              阈牌
            </Link>
            {!immersive && (
              <span
                className="hidden lg:inline app-shell-header__tagline"
                style={{ color: "var(--text-faint)" }}
              >
                神秘档案馆
              </span>
            )}
          </div>

          <EditorialTopNav />

          <div className="app-shell-header__actions flex items-center gap-1.5 md:gap-2 shrink-0">
            {shareHint && (
              <span
                className="hidden md:inline text-[12px] tracking-[0.02em] mr-1"
                style={{ color: "var(--accent)", opacity: 0.9 }}
              >
                {shareHint}
              </span>
            )}
            <ThemeToggle variant="pill" />
            {onShare && (
              <button onClick={onShare} className="action-pill" aria-label="分享此刻">
                <IconShare />
                <span className="hidden md:inline">分享此刻</span>
              </button>
            )}
            {onRedraw && (
              <button
                onClick={() => setConfirmRedraw(true)}
                className="action-pill"
                aria-label="重新抽牌"
                style={{ opacity: 0.7 }}
              >
                <IconRedraw />
                <span className="hidden lg:inline">重新抽牌</span>
              </button>
            )}
          </div>
        </header>

        {/* 单一滚动上下文：内容随 document 滚动，不再嵌套 overflow-auto。
            flex 链让内容自然拿到「视口减顶栏」的高度，不用硬编码 header 高度。 */}
        <div className="flex-1 min-w-0 min-h-0 flex flex-col">{children}</div>
      </div>

      <AnimatePresence>
        {confirmRedraw && (
          <motion.div
            key="confirm-redraw"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center px-5"
            style={{ background: "rgba(8,7,10,0.62)", backdropFilter: "blur(8px)" }}
            onClick={() => setConfirmRedraw(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[420px] rounded-2xl p-7 flex flex-col gap-5"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
              }}
            >
              <p
                className="text-[15px] leading-[1.8] text-center"
                style={{ fontFamily: "var(--font-serif-like)" }}
              >
                这次解读还在。
                <br />
                确定要重新开始吗？
              </p>
              <div className="flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmRedraw(false)}
                  className="hero-cta w-full"
                >
                  <span className="tracking-[0.1em]">保留这次，下次再说</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmRedraw(false);
                    onRedraw?.();
                  }}
                  className="text-[11px] underline underline-offset-4"
                  style={{ color: "var(--text-faint)" }}
                >
                  确定重新开始
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
