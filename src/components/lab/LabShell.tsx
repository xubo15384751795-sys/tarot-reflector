import type { ReactNode } from "react";
import Link from "next/link";

/** 最小 lab shell — 无 AI / Dexie / 动效，仅验证静态 UI */
export function LabShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div
      className="lab-reference-page min-h-screen"
      style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
      data-karpathy-lab="true"
    >
      <header
        className="lab-reference-page__header border-b px-4 py-3"
        style={{ borderColor: "var(--border-glass)" }}
      >
        <div className="max-w-5xl mx-auto flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <p
              className="text-[10px] tracking-[0.18em] uppercase mb-1"
              style={{ color: "var(--text-faint)" }}
            >
              Karpathy Reference · Static Only
            </p>
            <h1 className="text-lg font-medium tracking-[0.04em]">{title}</h1>
            <p className="text-[12px] mt-0.5" style={{ color: "var(--text-muted)" }}>
              {subtitle}
            </p>
          </div>
          <nav className="flex gap-3 text-[11px] tracking-[0.06em]">
            <Link href="/lab/archive-reference" className="hover:underline">
              Archive
            </Link>
            <Link href="/lab/reading-reference" className="hover:underline">
              Reading
            </Link>
            <Link href="/lab/motif-reference" className="hover:underline">
              Motif
            </Link>
            <Link href="/" className="hover:underline" style={{ color: "var(--accent)" }}>
              Production →
            </Link>
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}
