"use client";

/**
 * 主题切换：夜间玻璃（dark）↔ 月白纸面（light）。
 * 用 data-theme 属性挂在 <html> 上；CSS 变量在 globals.css 中切换。
 * 首选状态写在 localStorage，并由 layout.tsx 的 inline script 在首屏注入，
 * 避免页面切换时闪一下深色。
 */

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

const STORAGE_KEY = "tarot:theme";

function readInitial(): Theme {
  if (typeof document === "undefined") return "dark";
  const fromAttr = document.documentElement.getAttribute("data-theme") as Theme | null;
  if (fromAttr === "dark" || fromAttr === "light") return fromAttr;
  return "dark";
}

function applyTheme(t: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", t);
  try {
    localStorage.setItem(STORAGE_KEY, t);
  } catch {
    /* localStorage 不可用时静默失败 */
  }
}

type Props = {
  /** 'pill' 用于 AppShell 顶栏；'icon' 用于入口页右上角 */
  variant?: "pill" | "icon";
};

function IconSun() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2 M12 20v2 M2 12h2 M20 12h2 M5 5l1.5 1.5 M17.5 17.5L19 19 M5 19l1.5-1.5 M17.5 6.5L19 5" strokeLinecap="round" />
    </svg>
  );
}
function IconMoon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a7.5 7.5 0 1 0 10.5 10.5z" />
    </svg>
  );
}

export default function ThemeToggle({ variant = "pill" }: Props) {
  const [theme, setTheme] = useState<Theme>("dark");
  // 客户端挂载后读取真正的 theme（first-paint 由 layout 注入）。
  // 一次性 sync，不会引发 cascading renders。
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(readInitial());
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  };

  const label = theme === "dark" ? "月白" : "夜间";
  const Icon = theme === "dark" ? IconSun : IconMoon;

  if (variant === "icon") {
    return (
      <button
        onClick={toggle}
        title={`切换到${label}`}
        aria-label={`切换到${label}主题`}
        className="theme-toggle-icon transition-transform"
      >
        <span className="theme-toggle-icon-circle">
          <Icon />
        </span>
      </button>
    );
  }

  return (
    <button onClick={toggle} className="action-pill" aria-label={`切换到${label}主题`} title={`切换到${label}`}>
      <Icon />
      <span className="hidden md:inline">{label}</span>
    </button>
  );
}
