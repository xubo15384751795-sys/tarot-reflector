/**
 * 全局侧栏指南 · 文案与路由上下文
 */

import { ALL_SPREADS } from "@/features/reading/lib/spreads";
import {
  TAROT_INTRO_SECTIONS,
  DIFFICULTY_HINTS,
  getSpreadDetailSections,
} from "@/lib/spreadGuide";
import { getSpreadDef } from "@/features/reading/lib/spreads";
import type { SpreadId } from "@/lib/schema";

export { TAROT_INTRO_SECTIONS, DIFFICULTY_HINTS, getSpreadDetailSections };

export const MODE_GUIDE = [
  {
    title: "今日一牌",
    body: "没有具体问题时使用。抽一张牌，看看今天有什么值得被轻轻看见。",
  },
  {
    title: "问题解读",
    body: "带着一个具体问题进入。系统会先帮你澄清问法，再推荐合适的牌阵。",
  },
  {
    title: "深度牌阵",
    body: "适合反复出现、暂时说不清的问题。用多张牌，慢慢看见它的层次。",
  },
] as const;

export const ARCHIVE_GUIDE = {
  title: "牌义档案库",
  body: "78 张韦特牌的正逆位关键词、领域含义与牌面符号（motif）坐标。大阿尔卡那为手工校准，小阿尔卡那符号位置为示意。",
} as const;

export const EXPLAIN_GUIDE = {
  title: "科普工作台",
  body: "为录屏讲解准备：逐张牌、逐个符号高亮，可设 9:16 比例与纯净模式。不是个人解读流程。",
} as const;

export const NOTES_GUIDE = {
  title: "解读笔记",
  body: "解读结束后可把牌面与感受存为快照，仅保存在本设备。可回看，不会上传到服务器。",
} as const;

export type RouteGuideKey = "home" | "reading" | "archive" | "explain" | "notes" | "other";

export function routeGuideKey(pathname: string | null): RouteGuideKey {
  if (!pathname || pathname === "/") return "home";
  if (pathname.startsWith("/reading")) return "reading";
  if (pathname.startsWith("/archive")) return "archive";
  if (pathname.startsWith("/explain")) return "explain";
  if (pathname.startsWith("/notes")) return "notes";
  return "other";
}

export function getRouteGuideLabel(key: RouteGuideKey): string {
  switch (key) {
    case "home":
      return "从这里开始";
    case "reading":
      return "解读流程";
    case "archive":
      return "查阅档案";
    case "explain":
      return "录屏科普";
    case "notes":
      return "笔记回看";
    default:
      return "阈牌指南";
  }
}

export const SPREAD_CATALOG = ALL_SPREADS.map((s) => ({
  id: s.spread_id,
  name_zh: s.name_zh,
  card_count: s.card_count,
  difficulty: s.difficulty,
  difficultyHint: DIFFICULTY_HINTS[s.difficulty] ?? "",
}));

export function getSpreadGuideBundle(spreadId: string | null) {
  if (!spreadId) return null;
  const def = getSpreadDef(spreadId as SpreadId);
  if (!def) return null;
  return {
    meta: ALL_SPREADS.find((s) => s.spread_id === spreadId),
    sections: getSpreadDetailSections(def),
    difficultyHint: DIFFICULTY_HINTS[def.difficulty] ?? "",
  };
}
