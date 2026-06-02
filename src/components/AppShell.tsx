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
function IconCompass() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="12" cy="12" r="9" />
      <polygon points="12,6 14,12 12,18 10,12" fill="currentColor" stroke="none" opacity="0.7" />
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
function IconAudio() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4">
      <line x1="4" y1="12" x2="4" y2="12" strokeWidth="2" />
      <line x1="8" y1="9" x2="8" y2="15" strokeWidth="2" />
      <line x1="12" y1="6" x2="12" y2="18" strokeWidth="2" />
      <line x1="16" y1="9" x2="16" y2="15" strokeWidth="2" />
      <line x1="20" y1="11" x2="20" y2="13" strokeWidth="2" />
    </svg>
  );
}
function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="11" cy="11" r="7" />
      <line x1="16.5" y1="16.5" x2="21" y2="21" />
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

const navItems: NavItem[] = [
  { id: "draw", label: "开始", href: "/", icon: <IconStack /> },
  { id: "archive", label: "档案", href: "/archive", icon: <IconArchive /> },
  { id: "reading", label: "解读", href: "/reading", icon: <IconCompass /> },
  { id: "guide", label: "科普", href: "/guide", icon: <IconSearch /> },
  { id: "notes", label: "笔记", href: "/notes", icon: <IconNotes /> },
];

type Props = {
  children: ReactNode;
  onRedraw?: () => void;
  onShare?: () => void;
  showActions?: boolean;
  shareHint?: string | null;
  /** 首页/入口：整页共用 hero 背景，顶栏无硬分割线 */
  immersive?: boolean;
};

export default function AppShell({
  children,
  onRedraw,
  onShare,
  showActions = true,
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
        className={`app-shell-sidebar hidden md:flex flex-col items-center w-[88px] py-8 relative z-30 shrink-0 ${immersive ? "app-shell-sidebar--immersive" : ""}`}
        style={
          immersive
            ? undefined
            : {
                borderRight: "1px solid var(--border-glass)",
                background: "var(--bg-elevated)",
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
        <nav className="flex-1 flex flex-col items-center gap-1">
          {navItems.map((item) => {
            const active =
              item.href === pathname ||
              (item.id === "reading" && pathname?.startsWith("/reading")) ||
              (item.id === "archive" && pathname?.startsWith("/archive")) ||
              (item.id === "guide" && pathname?.startsWith("/guide")) ||
              (item.id === "notes" && pathname?.startsWith("/notes"));
            return (
              <Link
                key={item.id}
                href={item.href}
                className="group flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl w-[64px] transition-all"
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
      </aside>

      <div className="app-shell-main flex-1 flex flex-col min-w-0 relative z-[1]">
        <header
          className={`app-shell-header flex items-center justify-between px-4 md:px-10 py-4 md:py-5 z-10 shrink-0 ${immersive ? "app-shell-header--immersive" : ""}`}
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
          <div className="flex items-baseline gap-3 min-w-0">
            <h1
              className="text-[18px] md:text-[20px] font-light tracking-[0.18em] shrink-0"
              style={{ color: "var(--text-primary)" }}
            >
              阈牌
            </h1>
            <span
              className="hidden md:inline text-[10px] tracking-[0.14em]"
              style={{ color: "var(--text-faint)" }}
            >
              神秘档案馆
            </span>
          </div>

          <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
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
            <button
              className="action-pill action-pill-icon hidden md:inline-flex"
              aria-label="语音（尚未实现）"
              title="尚未实现"
            >
              <IconAudio />
            </button>
          </div>
        </header>

        <div className="flex-1 min-h-0 overflow-auto">{children}</div>
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
