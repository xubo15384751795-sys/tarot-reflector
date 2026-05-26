/**
 * 应用外壳：侧边栏导航 + 顶栏（含重新抽牌、分享等操作）。
 * 设置 / 语音按钮当前为 UI 占位。
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import ThemeToggle from "./ThemeToggle";

type NavItem = {
  id: string;
  label: string;
  href: string;
  icon: ReactNode;
  active?: boolean;
  disabled?: boolean;
  /** 显示一个"即将推出"的微角标，表示位置已预留但功能未上线 */
  soon?: boolean;
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
function IconSettings() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2 v3 M12 19 v3 M2 12 h3 M19 12 h3 M5 5 l2 2 M17 17 l2 2 M5 19 l2 -2 M17 7 l2 -2" />
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

type Props = {
  children: ReactNode;
  onRedraw?: () => void;
  onShare?: () => void;
  showActions?: boolean;
  /** 分享操作后的短暂提示（如「已复制到剪贴板」） */
  shareHint?: string | null;
};

function IconExplain() {
  // 三层放大镜/聚光：呼应"科普聚焦"
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="11" cy="11" r="6" />
      <circle cx="11" cy="11" r="2.5" />
      <line x1="15.5" y1="15.5" x2="20" y2="20" strokeLinecap="round" />
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
  { id: "draw", label: "抽牌", href: "/", icon: <IconStack /> },
  { id: "archive", label: "档案", href: "/archive", icon: <IconArchive /> },
  { id: "reading", label: "解读", href: "/reading", icon: <IconCompass /> },
  { id: "explain", label: "科普", href: "/explain", icon: <IconExplain /> },
  { id: "notes", label: "笔记", href: "/notes", icon: <IconNotes /> },
];

export default function AppShell({
  children,
  onRedraw,
  onShare,
  showActions = true,
  shareHint,
}: Props) {
  const pathname = usePathname();

  return (
    <div className="flex flex-row min-h-screen w-full">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col items-center w-[88px] py-8 relative z-20" style={{ borderRight: "1px solid var(--border-glass)", background: "var(--bg-elevated)", opacity: 0.95 }}>
        <Link
          href="/"
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
              (item.id === "archive" && pathname?.startsWith("/archive"));
            return (
              <Link
                key={item.id}
                href={item.href}
                aria-disabled={item.disabled}
                title={item.soon ? "即将推出" : item.disabled ? "尚未实现" : undefined}
                onClick={item.disabled ? (e) => e.preventDefault() : undefined}
                className="group flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl w-[64px] transition-all"
                style={{
                  color: item.disabled
                    ? "var(--text-faint)"
                    : active
                    ? "var(--text-primary)"
                    : "var(--text-tertiary)",
                  background: active ? "var(--bg-glass-hover)" : "transparent",
                  cursor: item.disabled ? "not-allowed" : "pointer",
                  opacity: item.disabled ? 0.55 : 1,
                }}
              >
                <span
                  className="relative"
                  style={{ color: active ? "var(--accent)" : "currentColor" }}
                >
                  {item.icon}
                  {item.soon && (
                    <span
                      aria-hidden
                      className="absolute -top-0.5 -right-1.5 w-1.5 h-1.5 rounded-full"
                      style={{ background: "var(--accent)", opacity: 0.7 }}
                    />
                  )}
                </span>
                <span className="text-[10px] tracking-[0.08em]">
                  {item.label}
                </span>
                {item.soon && (
                  <span
                    className="text-[8px] tracking-[0.12em] leading-none"
                    style={{ color: "var(--accent)", opacity: 0.7 }}
                  >
                    SOON
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto pt-6">
          <button
            className="flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl w-[64px] transition-all"
            style={{ color: "var(--text-tertiary)" }}
            aria-label="设置（尚未实现）"
            title="尚未实现"
          >
            <IconSettings />
            <span className="text-[10px] tracking-[0.08em]">设置</span>
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Top bar — 移动端隐藏副标题与样本徽章，避免按钮被挤到换行 */}
        <header className="flex items-center justify-between px-4 md:px-10 py-4 md:py-5 z-10" style={{ borderBottom: "1px solid var(--border-glass)", background: "var(--bg-elevated)", backdropFilter: "blur(12px)" }}>
          <div className="flex items-baseline gap-3 min-w-0">
            <h1 className="text-[18px] md:text-[20px] font-light tracking-[0.18em] shrink-0" style={{ color: "var(--text-primary)" }}>
              阈牌
            </h1>
            <span className="hidden md:inline text-[10px] tracking-[0.14em]" style={{ color: "var(--text-faint)" }}>
              神秘档案馆
            </span>
            <span className="hidden lg:inline text-[9px] tracking-[0.12em] px-2 py-0.5 rounded archive-border-thin" style={{ color: "var(--ink-warm)", opacity: 0.8 }}>
              RWS · 传统牌义
            </span>
          </div>

          {showActions && (
            <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
              {shareHint && (
                <span className="hidden md:inline text-[12px] tracking-[0.02em] mr-1" style={{ color: "var(--accent)", opacity: 0.9 }}>
                  {shareHint}
                </span>
              )}
              <ThemeToggle variant="pill" />
              {onShare && (
                <button
                  onClick={onShare}
                  className="action-pill"
                  aria-label="分享此刻"
                >
                  <IconShare />
                  <span className="hidden md:inline">分享此刻</span>
                </button>
              )}
              {onRedraw && (
                /* 重新抽牌：女性友好原则下降级为次级，弱化视觉权重 */
                <button
                  onClick={onRedraw}
                  className="action-pill"
                  aria-label="重新抽牌"
                  title="重新抽牌（建议先完成这次解读再决定）"
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
          )}
        </header>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-auto">{children}</div>
      </div>
    </div>
  );
}
