/**
 * 反刍护栏 · rumination check
 *
 * 心理咨询语境里，反复对同一个问题抽牌往往是焦虑反刍 / 依赖征兆。
 * 这个工具不阻止用户，只是在 24h 同问题 ≥2 次时给一句温柔暂停。
 *
 * 数据源：localStorage["tarot:reading:history"]，由 useReadingSession
 * 在到达 summary 时写入。结构：
 *   { savedAt, reading_id, question, domain, script }
 */

const HISTORY_STORAGE_KEY = "tarot:reading:history";

type HistoryEntry = {
  savedAt: string;
  question?: string;
  domain?: string;
};

/**
 * 统计最近 `withinMs` 内、问题相同（trim 后 case-sensitive）的解读次数。
 * 空问题（daily 模式 / 用户没输入）不参与计数——避免每日一牌都触发。
 */
export function countRecentReadingsForQuestion(
  question: string,
  withinMs: number = 24 * 60 * 60 * 1000,
): number {
  const q = (question ?? "").trim();
  if (!q) return 0;
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return 0;
    const list = JSON.parse(raw) as HistoryEntry[];
    if (!Array.isArray(list)) return 0;
    const cutoff = Date.now() - withinMs;
    return list.filter((h) => {
      const t = new Date(h.savedAt).getTime();
      if (!Number.isFinite(t) || t < cutoff) return false;
      return (h.question ?? "").trim() === q;
    }).length;
  } catch {
    return 0;
  }
}

/** 触发反刍提示的阈值：24h 内同问题 ≥ 此数 */
export const RUMINATION_THRESHOLD = 2;
