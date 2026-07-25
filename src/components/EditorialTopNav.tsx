"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { id: "draw", label: "开始", href: "/" },
  { id: "archive", label: "档案", href: "/archive" },
  { id: "notes", label: "笔记", href: "/notes" },
  { id: "guide", label: "科普", href: "/guide" },
] as const;

function isActive(id: string, href: string, pathname: string | null) {
  if (!pathname) return false;
  if (href === pathname) return true;
  if (id === "draw" && pathname.startsWith("/reading")) return true;
  if (id === "archive" && pathname.startsWith("/archive")) return true;
  if (id === "notes" && pathname.startsWith("/notes")) return true;
  if (id === "guide" && pathname.startsWith("/guide")) return true;
  return false;
}

/** 首页沉浸式 desktop 顶栏 — 居中细线下划线导航 */
export default function EditorialTopNav() {
  const pathname = usePathname();

  return (
    <nav
      className="editorial-top-nav hidden md:flex items-center gap-8 lg:gap-10"
      aria-label="主菜单"
    >
      {ITEMS.map((item) => {
        const active = isActive(item.id, item.href, pathname);
        return (
          <Link
            key={item.id}
            href={item.href}
            className={`editorial-underline-link ${active ? "is-active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
