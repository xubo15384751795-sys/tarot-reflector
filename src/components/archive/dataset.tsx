/**
 * 档案馆数据装配 · 按 tab 懒加载版
 *
 * 旧版在 client 模块顶层静态 import 6 个 JSON（共 276 KB），首屏全打包；
 * 现在改成 dynamic import：每个 tab / motif 资源都是独立 chunk，
 * 只有用户切到该 tab 或点开 modal 才下载。
 *
 * 静态保留的只剩：tab 元数据（id/label/count/icon）和 subtitle 文案——
 * 这些是必须立刻能渲染的导航骨架，加起来才 1KB。
 */

import type { Motif } from "@/lib/schema";
import type { ArchiveCardData, ArchiveTabId, ArchiveTabItem } from "./types";
import {
  SuitWands,
  SuitCups,
  SuitSwords,
  SuitPentacles,
} from "@/components/ArchiveEmblems";

// ─── 静态元数据（必须立刻渲染的部分）───

export const ARCHIVE_TABS: ArchiveTabItem[] = [
  { id: "major", label: "大阿尔卡那", subtitle: "22 · 愚者之旅", count: 22 },
  { id: "wands", label: "权杖", subtitle: "14 · 火 / 行动", count: 14, icon: <SuitWands /> },
  { id: "cups", label: "圣杯", subtitle: "14 · 水 / 情感", count: 14, icon: <SuitCups /> },
  { id: "swords", label: "宝剑", subtitle: "14 · 风 / 判断", count: 14, icon: <SuitSwords /> },
  { id: "pentacles", label: "星币", subtitle: "14 · 土 / 现实", count: 14, icon: <SuitPentacles /> },
];

export const ARCHIVE_TAB_SUBTITLES: Record<ArchiveTabId, string> = {
  major: "22 张 Major Arcana",
  wands: "行动与创造 · 14 张",
  cups: "情感与直觉 · 14 张",
  swords: "理性与判断 · 14 张",
  pentacles: "现实与积累 · 14 张",
};

// ─── 动态资源（按需下载）───

/**
 * 每个 tab 的卡片列表 + 该 tab 的精确度档：
 *   major: precision = "precise"（手工标注 motif 在 tarot_cards.json）
 *   minor: precision = "approximate"（脚本生成 motif 在各 suit.json）
 */
type TabLoadResult = {
  cards: ArchiveCardData[];
  /** 同时返回该 tab 的 motif 解析器（避免每次都重新加载 motif 源） */
  resolveMotifs: (card: ArchiveCardData) => Motif[];
};

const tabLoaders: Record<ArchiveTabId, () => Promise<TabLoadResult>> = {
  major: async () => {
    // 大阿尔卡那 motif 来源是 tarot_cards.json（精确）；
    // 牌列表本身来自 major_arcana.json
    const [major, taro] = await Promise.all([
      import("@/data/cards/major_arcana.json"),
      import("@/data/tarot_cards.json"),
    ]);
    const cards = (major.default ?? major) as ArchiveCardData[];
    const motifSrc = (taro.default ?? taro) as Array<{
      name?: string;
      motifs?: Motif[];
    }>;
    const map = new Map<string, Motif[]>();
    motifSrc.forEach((c) => {
      if (c.name && c.motifs?.length) {
        map.set(
          c.name.toLowerCase(),
          c.motifs.map((m) => ({ ...m, precision: m.precision ?? "precise" })),
        );
      }
    });
    return {
      cards,
      resolveMotifs: (card) => map.get(card.name_en.toLowerCase()) ?? [],
    };
  },
  wands: () => loadMinor(() => import("@/data/cards/minor_wands.json")),
  cups: () => loadMinor(() => import("@/data/cards/minor_cups.json")),
  swords: () => loadMinor(() => import("@/data/cards/minor_swords.json")),
  pentacles: () => loadMinor(() => import("@/data/cards/minor_pentacles.json")),
};

async function loadMinor(
  importer: () => Promise<{ default: unknown } | unknown>,
): Promise<TabLoadResult> {
  const mod = await importer();
  const cards = (
    (mod as { default?: unknown }).default ?? mod
  ) as Array<ArchiveCardData & { motifs?: Motif[] }>;
  const map = new Map<string, Motif[]>();
  cards.forEach((c) => {
    if (c.motifs?.length) {
      map.set(
        c.name_en.toLowerCase(),
        c.motifs.map((m) => ({ ...m, precision: m.precision ?? "approximate" })),
      );
    }
  });
  return {
    cards: cards.map((c) => {
      // 从主索引剥离 motifs 字段；motif 通过 resolveMotifs 拿，
      // 避免 modal 之外的 card grid 也带着 motif 数组
      const { motifs: _motifs, ...rest } = c;
      void _motifs;
      return rest;
    }),
    resolveMotifs: (card) => map.get(card.name_en.toLowerCase()) ?? [],
  };
}

// ─── 模块级缓存：同一 tab 切回来不重复 fetch ───

const tabCache = new Map<ArchiveTabId, TabLoadResult>();

export async function loadArchiveTab(tabId: ArchiveTabId): Promise<TabLoadResult> {
  const cached = tabCache.get(tabId);
  if (cached) return cached;
  const result = await tabLoaders[tabId]();
  tabCache.set(tabId, result);
  return result;
}

/**
 * 兼容旧调用点：同步取 motif。
 * 仅在 tab 已经被 loadArchiveTab 加载过后才能返回内容；
 * 用 React 时应优先用 useArchiveTab() hook + load.resolveMotifs。
 */
export function getMotifsForCard(card: ArchiveCardData): Motif[] {
  // 通过反查所有缓存来兼容；通常 modal 打开时该 tab 必然已加载
  for (const result of tabCache.values()) {
    const m = result.resolveMotifs(card);
    if (m.length) return m;
  }
  return [];
}
