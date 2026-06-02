/**
 * 科普工作台牌库：78 张（大阿尔卡那精确 motif + 小阿尔卡那示意 motif）
 */

import type { Motif } from "@/lib/schema";

export type ExplainMotif = {
  id: string;
  label: string;
  meaning: string;
  label_zh?: string;
  meaning_zh?: string;
  bbox: { x: number; y: number; w: number; h: number };
  anchor?: { x: number; y: number };
  precision?: "precise" | "approximate";
};

export type ExplainCard = {
  id: string;
  zh_name: string;
  name: string;
  number?: number | null;
  image: string;
  arcana: "major" | "minor";
  suit?: string;
  core_symbols?: string[];
  upright: { keywords: string[]; meaning: string };
  motifs: ExplainMotif[];
};

export type ExplainTabId = "major" | "wands" | "cups" | "swords" | "pentacles";

export const EXPLAIN_TABS: { id: ExplainTabId; label: string; count: number }[] = [
  { id: "major", label: "大阿尔卡那", count: 22 },
  { id: "wands", label: "权杖", count: 14 },
  { id: "cups", label: "圣杯", count: 14 },
  { id: "swords", label: "宝剑", count: 14 },
  { id: "pentacles", label: "星币", count: 14 },
];

function anchorFromMotif(m: Motif): { x: number; y: number } {
  if (m.anchor) return m.anchor;
  return { x: m.bbox.x + m.bbox.w / 2, y: m.bbox.y + m.bbox.h / 2 };
}

function toExplainMotif(m: Motif): ExplainMotif {
  return {
    id: m.id,
    label: m.label_zh ?? m.label,
    meaning: m.meaning_zh ?? m.meaning,
    label_zh: m.label_zh,
    meaning_zh: m.meaning_zh,
    bbox: m.bbox,
    anchor: anchorFromMotif(m),
    precision: m.precision ?? (m.quality === "verified" ? "precise" : "approximate"),
  };
}

type RawExplainCard = {
  id: string;
  name_zh?: string;
  zh_name?: string;
  name?: string;
  name_en?: string;
  number?: number | null;
  image: string;
  arcana?: "major" | "minor";
  suit?: string;
  core_symbols?: string[];
  upright?: {
    keywords?: string[];
    keywords_zh?: string[];
    meaning?: string;
    meaning_zh?: string;
  };
  traditional?: { upright: { keywords_zh: string[]; meaning_zh: string } };
  motifs?: Motif[];
};

function toExplainCard(raw: RawExplainCard): ExplainCard | null {
  if (!raw.motifs?.length) return null;
  const trad = raw.traditional?.upright;
  const up = raw.upright;
  if (!up && !trad) return null;

  const keywords =
    up?.keywords ??
    up?.keywords_zh ??
    trad?.keywords_zh ??
    [];
  const meaning =
    up?.meaning ??
    up?.meaning_zh ??
    trad?.meaning_zh ??
    "";

  return {
    id: raw.id,
    zh_name: raw.name_zh ?? raw.zh_name ?? raw.name_en ?? raw.id,
    name: raw.name ?? raw.name_en ?? raw.id,
    number: raw.number,
    image: raw.image,
    arcana: raw.arcana ?? "major",
    suit: raw.suit,
    core_symbols: raw.core_symbols,
    upright: { keywords, meaning },
    motifs: raw.motifs.map(toExplainMotif),
  };
}

const tabCache = new Map<ExplainTabId, ExplainCard[]>();

export async function loadExplainTab(tabId: ExplainTabId): Promise<ExplainCard[]> {
  const cached = tabCache.get(tabId);
  if (cached) return cached;

  let cards: ExplainCard[] = [];

  if (tabId === "major") {
    const taro = await import("@/data/tarot_cards.json");
    const list = (taro.default ?? taro) as RawExplainCard[];
    cards = list
      .map((c) => toExplainCard({ ...c, arcana: "major" }))
      .filter((c): c is ExplainCard => c !== null);
  } else {
    const loaders: Record<Exclude<ExplainTabId, "major">, () => Promise<unknown>> = {
      wands: () => import("@/data/cards/minor_wands.json"),
      cups: () => import("@/data/cards/minor_cups.json"),
      swords: () => import("@/data/cards/minor_swords.json"),
      pentacles: () => import("@/data/cards/minor_pentacles.json"),
    };
    const mod = await loaders[tabId]();
    const list = ((mod as { default?: unknown }).default ?? mod) as RawExplainCard[];
    cards = list
      .map((c) => toExplainCard({ ...c, arcana: "minor" }))
      .filter((c): c is ExplainCard => c !== null);
  }

  tabCache.set(tabId, cards);
  return cards;
}
