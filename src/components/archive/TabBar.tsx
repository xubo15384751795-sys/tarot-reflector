"use client";

import { useCallback, useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import {
  animateArchiveTabIndicator,
  measureTabIndicator,
  useReducedMotion,
} from "@/features/motion";
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
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<ArchiveTabId, HTMLButtonElement>>(new Map());
  const firstPaint = useRef(true);

  const updateIndicator = useCallback(
    (immediate = false) => {
      const container = containerRef.current;
      const indicator = indicatorRef.current;
      const btn = buttonRefs.current.get(activeTab);
      if (!container || !indicator || !btn) return;

      const metrics = measureTabIndicator(container, btn);
      animateArchiveTabIndicator(indicator, metrics, {
        reducedMotion,
        immediate: immediate || firstPaint.current,
      });
      firstPaint.current = false;
    },
    [activeTab, reducedMotion],
  );

  useGSAP(
    () => {
      updateIndicator();
      const container = containerRef.current;
      if (!container) return;

      const ro = new ResizeObserver(() => updateIndicator(true));
      ro.observe(container);
      return () => ro.disconnect();
    },
    {
      scope: containerRef,
      dependencies: [activeTab, updateIndicator],
      revertOnUpdate: true,
    },
  );

  const handleTabClick = (id: ArchiveTabId) => {
    const btn = buttonRefs.current.get(id);
    if (btn && !reducedMotion) {
      gsap.fromTo(
        btn,
        { scale: 0.97 },
        { scale: 1, duration: 0.35, ease: "power2.out" },
      );
    }
    onTabChange(id);
  };

  return (
    <div className="flex justify-center">
      <div ref={containerRef} className="archive-tab-bar inline-flex items-center gap-0 rounded-full px-1.5 py-1 relative" role="tablist" aria-label="档案分类">
        <div ref={indicatorRef} className="archive-tab-indicator" aria-hidden />

        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                if (el) buttonRefs.current.set(tab.id, el);
                else buttonRefs.current.delete(tab.id);
              }}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => handleTabClick(tab.id)}
              className={`archive-tab-btn relative flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full shrink-0 z-10 ${
                isActive ? "is-active" : ""
              }`}
            >
              {tab.icon && (
                <span className="archive-tab-btn__icon" aria-hidden>
                  {tab.icon}
                </span>
              )}
              <span
                className="text-[12px] sm:text-[13px] tracking-[0.03em] whitespace-nowrap"
                style={{ fontFamily: "var(--font-serif-like)" }}
              >
                {tab.label}
              </span>
              <span className="text-[10px] tabular-nums whitespace-nowrap archive-tab-btn__count">
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
