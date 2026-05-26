"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { ArchiveTabId, ArchiveTabItem } from "./types";

export function TabBar({
  tabs,
  activeTab,
  onTabChange,
}: {
  tabs: ArchiveTabItem[];
  activeTab: ArchiveTabId;
  onTabChange: (id: ArchiveTabId) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<ArchiveTabId, HTMLButtonElement>>(new Map());
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(
    null,
  );

  useEffect(() => {
    const btn = buttonRefs.current.get(activeTab);
    const container = containerRef.current;
    if (!btn || !container) return;

    const btnRect = btn.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    setIndicator({
      left: btnRect.left - containerRect.left,
      width: btnRect.width,
    });
  }, [activeTab]);

  return (
    <div className="flex justify-center">
      <div
        ref={containerRef}
        className="inline-flex items-center gap-0 rounded-full px-1.5 py-1 relative"
        style={{
          background: "var(--bg-glass)",
          border: "1px solid var(--border-glass)",
        }}
      >
        {indicator && (
          <motion.div
            className="absolute top-1 bottom-1 rounded-full"
            style={{ background: "var(--accent)" }}
            animate={{
              left: indicator.left,
              width: indicator.width,
            }}
            transition={{
              type: "spring",
              stiffness: 380,
              damping: 32,
            }}
          />
        )}

        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                if (el) buttonRefs.current.set(tab.id, el);
              }}
              onClick={() => onTabChange(tab.id)}
              className="relative flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full transition-colors duration-200 shrink-0 z-10"
              style={{
                color: isActive ? "var(--bg-base)" : "var(--text-tertiary)",
              }}
            >
              {tab.icon && (
                <span
                  className="transition-colors duration-200"
                  style={{ color: isActive ? "var(--bg-base)" : "var(--text-faint)" }}
                >
                  {tab.icon}
                </span>
              )}
              <span
                className="text-[12px] sm:text-[13px] tracking-[0.03em] whitespace-nowrap"
                style={{ fontFamily: "var(--font-serif-like)" }}
              >
                {tab.label}
              </span>
              <span
                className="text-[10px] tabular-nums whitespace-nowrap"
                style={{ opacity: isActive ? 0.75 : 0.5 }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
