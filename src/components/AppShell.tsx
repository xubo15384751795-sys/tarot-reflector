/**
 * 应用外壳：图标导航 + 顶栏 + 主内容。
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ensureNotesRepository } from "@/features/notes/repository";
import ThemeToggle from "./ThemeToggle";
import EditorialTopNav from "./EditorialTopNav";

type NavItem = {
  id: string;
  label: string;
  href: string;
  icon: ReactNode;
};

function IconStack() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="6" y="4" width="12" height="16" rx="2" />
      <line x1="9" y1="9" x2="15" y2="9" />
      <line x1="9" y1="13" x2="15" y2="13" />
    </svg>
  );
}
function IconNotes() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M6 4 H18 V20 L12 17 L6 20 Z" />
    </svg>
  );
}
function IconSpark() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z" />
    </svg>
  );
}
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
function IconArchive() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="3" y="3" width="18" height="5" rx="1" />
      <path d="M5 8 v10 a2 2 0 0 0 2 2 h10 a2 2 0 0 0 2-2 V8" />
      <line x1="10" y1="12" x2="14" y2="12" />
    </svg>
  );
}

const primaryNavItems: NavItem[] = [
  { id: "draw", label: "开始", href: "/", icon: <IconStack /> },
  { id: "archive", label: "档案", href: "/archive", icon: <IconArchive /> },
  { id: "notes", label: "笔记", href: "/notes", icon: <IconNotes /> },
];

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
  const pathname = usePathname();
  const [confirmRedraw, setConfirmRedraw] = useState(false);

  useEffect(() => {
    void ensureNotesRepository();
  }, []);

  return (
    <div
      className={`flex flex-row min-h-screen w-full relative ${immersive ? "app-shell--immersive" : ""}`}
    >
      {immersive && <div aria-hidden className="app-shell-atmosphere pointer-events-none" />}
      <aside
        className={`app-shell-sidebar ${
          immersive ? "hidden" : "hidden md:flex"
        } flex-col items-center w-[88px] py-8 sticky top-0 h-screen z-30 shrink-0 ${
          immersive ? "app-shell-sidebar--immersive" : "app-shell-sidebar--glass"
        }`}
        style={
          immersive
            ? undefined
            : {
                borderRight: "1px solid var(--border-glass)",
              }
        }
      >
        <Link
          href="/"
          aria-label="回到首页"
          className="flex items-center justify-center w-10 h-10 rounded-xl mb-10 transition-colors archive-border-thin"
          style={{ color: "var(--accent)" }}
        >
          <IconSpark />
        </Link>
        <nav className="flex-1 flex flex-col items-center gap-1 w-full">
          {primaryNavItems.map((item) => {
            const active =
              item.href === pathname ||
              (item.id === "draw" && pathname?.startsWith("/reading")) ||
              (item.id === "archive" && pathname?.startsWith("/archive")) ||
              (item.id === "notes" && pathname?.startsWith("/notes"));
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`group flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl w-[64px] transition-all nav-item-active-glow ${active ? "is-active" : ""}`}
                style={{
                  color: active ? "var(--text-primary)" : "var(--text-tertiary)",
                  background: active ? "var(--bg-glass-hover)" : "transparent",
                }}
              >
                <span style={{ color: active ? "var(--accent)" : "currentColor" }}>
                  {item.icon}
                </span>
                <span className="text-[10px] tracking-[0.08em]">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <Link
          href="/guide"
          className="mt-4 px-2 py-2 rounded-lg text-[10px] tracking-[0.1em] transition-colors"
          style={{
            color: pathname?.startsWith("/guide") ? "var(--accent)" : "var(--text-faint)",
          }}
        >
          科普
        </Link>
      </aside>

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
                className="hidden md:inline app-shell-header__tagline"
                style={{ color: "var(--text-faint)" }}
              >
                神秘档案馆
              </span>
            )}
          </div>

          {immersive && <EditorialTopNav />}

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
