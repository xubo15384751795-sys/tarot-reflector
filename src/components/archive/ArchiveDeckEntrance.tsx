"use client";

import { useCallback, useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import {
  useReducedMotion,
  useCursorGlowOnScope,
} from "@/features/motion";
import type { ArchiveTabId, ArchiveTabItem } from "./types";

const DECK_META: Record<
  ArchiveTabId,
  { element: string; theme: string; desc: string; caption: string }
> = {
  major: {
    element: "旅程",
    theme: "愚者之旅",
    desc: "从启程到整合的原型弧线。",
    caption: "大阿尔卡那 · 22 · 愚者之旅",
  },
  wands: {
    element: "火",
    theme: "行动",
    desc: "意志、创造与推进",
    caption: "权杖 · 14 · 火 / 行动",
  },
  cups: {
    element: "水",
    theme: "情感",
    desc: "关系、感受与承接",
    caption: "圣杯 · 14 · 水 / 情感",
  },
  swords: {
    element: "风",
    theme: "判断",
    desc: "思考、冲突与切割",
    caption: "宝剑 · 14 · 风 / 判断",
  },
  pentacles: {
    element: "土",
    theme: "现实",
    desc: "资源、身体与秩序",
    caption: "星币 · 14 · 土 / 现实",
  },
};

const MINOR_TAB_IDS: ArchiveTabId[] = ["wands", "cups", "swords", "pentacles"];

export function getArchiveTabCaption(id: ArchiveTabId): string {
  return DECK_META[id].caption;
}

function findTab(tabs: ArchiveTabItem[], id: ArchiveTabId): ArchiveTabItem {
  const tab = tabs.find((t) => t.id === id);
  if (!tab) throw new Error(`Missing archive tab: ${id}`);
  return tab;
}

export function ArchiveDeckEntrance({
  tabs,
  activeTab,
  onTabChange,
  onPreviewHover,
  onPreviewLeave,
}: {
  tabs: ArchiveTabItem[];
  activeTab: ArchiveTabId;
  onTabChange: (id: ArchiveTabId) => void;
  onPreviewHover?: (id: ArchiveTabId) => void;
  onPreviewLeave?: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const scopeRef = useRef<HTMLDivElement>(null);

  useCursorGlowOnScope(scopeRef, ".interactive-glow");

  const majorTab = findTab(tabs, "major");
  const majorMeta = DECK_META.major;

  useGSAP(
    () => {
      if (reducedMotion || !scopeRef.current) return;
      const major = scopeRef.current.querySelector(".major-arcana-card");
      const minor = scopeRef.current.querySelectorAll(".minor-grid__card");
      if (major) {
        gsap.from(major, {
          autoAlpha: 0,
          y: 16,
          duration: 0.55,
          ease: "power2.out",
          delay: 0.12,
        });
      }
      if (minor.length) {
        gsap.from(minor, {
          autoAlpha: 0,
          y: 12,
          duration: 0.48,
          ease: "power2.out",
          stagger: 0.07,
          delay: 0.32,
        });
      }
    },
    { scope: scopeRef, dependencies: [reducedMotion] },
  );

  const handleSelect = useCallback(
    (id: ArchiveTabId, el: HTMLButtonElement | null) => {
      if (el && !reducedMotion) {
        gsap.fromTo(
          el,
          { scale: 0.992 },
          { scale: 1, duration: 0.28, ease: "power2.out" },
        );
      }
      onTabChange(id);
    },
    [onTabChange, reducedMotion],
  );

  const handlePointerEnter = useCallback(
    (id: ArchiveTabId) => {
      onPreviewHover?.(id);
    },
    [onPreviewHover],
  );

  const handlePointerLeave = useCallback(() => {
    onPreviewLeave?.();
  }, [onPreviewLeave]);

  return (
    <div ref={scopeRef} className="archive-groups">
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === "major"}
        className={`major-arcana-card archive-glass-card interactive-glow physical-card${activeTab === "major" ? " is-active" : ""}`}
        onClick={(e) => handleSelect("major", e.currentTarget)}
        onPointerEnter={() => handlePointerEnter("major")}
        onPointerLeave={handlePointerLeave}
      >
        <span className="major-arcana-card__inner">
          <span className="archive-card__label">{majorTab.label}</span>
          <span className="major-arcana-card__count">{majorTab.count}</span>
          <span className="archive-card__theme">{majorMeta.theme}</span>
          <span className="archive-card__desc">{majorMeta.desc}</span>
        </span>
      </button>

      <div className="minor-section">
        <h3 className="minor-section__title">小阿尔卡那 · 四种现实维度</h3>
        <div className="minor-grid" role="tablist" aria-label="小阿尔卡那花色">
          {MINOR_TAB_IDS.map((id) => {
            const tab = findTab(tabs, id);
            const meta = DECK_META[id];
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`minor-grid__card archive-glass-card interactive-glow physical-card${isActive ? " is-active" : ""}`}
                onClick={(e) => handleSelect(id, e.currentTarget)}
                onPointerEnter={() => handlePointerEnter(id)}
                onPointerLeave={handlePointerLeave}
              >
                <span className="minor-grid__card-inner">
                  {tab.icon && (
                    <span className="minor-grid__icon" aria-hidden>
                      {tab.icon}
                    </span>
                  )}
                  <span className="archive-card__label">{tab.label}</span>
                  <span className="minor-grid__count">{tab.count}</span>
                  <span className="archive-card__element">
                    {meta.element} / {meta.theme}
                  </span>
                  <span className="archive-card__desc">{meta.desc}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
