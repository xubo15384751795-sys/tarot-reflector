/**
 * 牌面阅读流程中的等待态文案。
 * 统一隐喻：用户在等牌面被读出，而非等机器生成内容。
 */

export type ReadingStatusKey =
  | "question_reframing"
  | "spread_recommending"
  | "shuffling"
  | "card_revealed"
  | "generating_reading"
  | "linking_context"
  | "synthesizing"
  | "saving_snapshot"
  | "reading_slow"
  /** 档案馆 / 科普页懒加载牌组数据 */
  | "archive_browsing";

export const READING_STATUS_COPY: Record<ReadingStatusKey, string> = {
  question_reframing: "正在靠近你的问题……",
  spread_recommending: "正在选择适合的牌阵……",
  shuffling: "正在抽取牌面……",
  card_revealed: "牌面已出现。",
  generating_reading: "正在读取牌面符号……",
  linking_context: "正在把牌面与你的问题连起来……",
  synthesizing: "正在收束这次解读……",
  saving_snapshot: "正在把这次牌面归档……",
  reading_slow: "这次解读生成有点慢，你可以先查看牌面。",
  archive_browsing: "正在翻阅档案……",
};

export function readingStatusText(key: ReadingStatusKey): string {
  return READING_STATUS_COPY[key];
}
