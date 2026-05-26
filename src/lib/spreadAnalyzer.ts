/**
 * 牌阵分析器 — 分析多牌阵的整体格局
 *
 * 负责：
 * - 大阿尔卡那比例分析
 * - 花色集中度分析
 * - 逆位比例分析
 * - 元素平衡分析
 * - 数字模式分析
 */

import type { CardData, DrawnCard, Orientation } from "./schema";

export type SpreadAnalysis = {
  major_arcana_count: number;
  major_arcana_ratio: number;
  suit_counts: Record<string, number>;
  dominant_suit: string | null;
  reversal_count: number;
  reversal_ratio: number;
  element_balance: Record<string, number>;
  missing_elements: string[];
  number_patterns: Record<number, number>;
  court_card_count: number;
  relationship_notes: string[];
};

const ELEMENT_MAP: Record<string, string> = {
  wands: "fire",
  cups: "water",
  swords: "air",
  pentacles: "earth",
};

const ELEMENT_NAMES: Record<string, string> = {
  fire: "火",
  water: "水",
  air: "风",
  earth: "土",
};

/**
 * 分析一次多牌阵抽牌结果的整体格局
 */
export function analyzeSpread(drawnCards: DrawnCard[]): SpreadAnalysis {
  const total = drawnCards.length;
  if (total === 0) {
    return {
      major_arcana_count: 0,
      major_arcana_ratio: 0,
      suit_counts: {},
      dominant_suit: null,
      reversal_count: 0,
      reversal_ratio: 0,
      element_balance: {},
      missing_elements: ["fire", "water", "air", "earth"],
      number_patterns: {},
      court_card_count: 0,
      relationship_notes: [],
    };
  }

  // 大阿尔卡那计数
  const majorCount = drawnCards.filter(
    (dc) => dc.card.arcana === "major"
  ).length;

  // 花色统计
  const suitCounts: Record<string, number> = {};
  for (const dc of drawnCards) {
    if (dc.card.suit) {
      suitCounts[dc.card.suit] = (suitCounts[dc.card.suit] || 0) + 1;
    }
  }
  const dominantSuit = Object.entries(suitCounts).sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0] ?? null;

  // 逆位统计
  const reversalCount = drawnCards.filter(
    (dc) => dc.orientation === "reversed"
  ).length;

  // 元素平衡
  const elementBalance: Record<string, number> = {
    fire: 0,
    water: 0,
    air: 0,
    earth: 0,
  };
  for (const dc of drawnCards) {
    if (dc.card.suit) {
      const element = ELEMENT_MAP[dc.card.suit];
      if (element) {
        elementBalance[element]++;
      }
    }
  }
  const missingElements = Object.entries(elementBalance)
    .filter(([, count]) => count === 0)
    .map(([element]) => element);

  // 数字模式
  const numberPatterns: Record<number, number> = {};
  for (const dc of drawnCards) {
    if (dc.card.number) {
      numberPatterns[dc.card.number] =
        (numberPatterns[dc.card.number] || 0) + 1;
    }
  }

  // 宫廷牌计数
  const courtCount = drawnCards.filter(
    (dc) => dc.card.court_rank
  ).length;

  // 生成关系分析注释
  const notes = generateRelationshipNotes(
    total,
    majorCount,
    suitCounts,
    dominantSuit,
    reversalCount,
    elementBalance,
    missingElements,
    numberPatterns,
    courtCount
  );

  return {
    major_arcana_count: majorCount,
    major_arcana_ratio: majorCount / total,
    suit_counts: suitCounts,
    dominant_suit: dominantSuit,
    reversal_count: reversalCount,
    reversal_ratio: reversalCount / total,
    element_balance: elementBalance,
    missing_elements: missingElements,
    number_patterns: numberPatterns,
    court_card_count: courtCount,
    relationship_notes: notes,
  };
}

function generateRelationshipNotes(
  total: number,
  majorCount: number,
  suitCounts: Record<string, number>,
  dominantSuit: string | null,
  reversalCount: number,
  elementBalance: Record<string, number>,
  missingElements: string[],
  numberPatterns: Record<number, number>,
  courtCount: number
): string[] {
  const notes: string[] = [];

  // 大阿尔卡那比例
  if (majorCount >= 4) {
    notes.push(
      `牌阵中出现 ${majorCount} 张大阿尔卡那（${Math.round((majorCount / total) * 100)}%），说明问题触及深层结构性主题。`
    );
  } else if (majorCount <= 1 && total >= 3) {
    notes.push(
      `牌阵以小阿尔卡那为主，问题更偏向日常事件和具体行动层面。`
    );
  }

  // 花色集中度
  if (dominantSuit) {
    const count = suitCounts[dominantSuit] || 0;
    if (count >= 3) {
      const suitName =
        dominantSuit === "wands"
          ? "权杖"
          : dominantSuit === "cups"
          ? "圣杯"
          : dominantSuit === "swords"
          ? "宝剑"
          : "星币";
      notes.push(
        `${suitName}出现 ${count} 次，说明问题核心在${
          dominantSuit === "wands"
            ? "行动、热情和创造力"
            : dominantSuit === "cups"
            ? "情感、关系和内在感受"
            : dominantSuit === "swords"
            ? "理性、判断和沟通"
            : "现实、资源和长期建设"
        }上。`
      );
    }
  }

  // 逆位比例
  if (reversalCount >= 3 && total >= 4) {
    notes.push(
      `逆位较多（${reversalCount}/${total}），说明能量流动存在阻碍或内化，需要关注被忽略的部分。`
    );
  }

  // 缺失元素
  if (missingElements.length >= 2) {
    const names = missingElements.map((e) => ELEMENT_NAMES[e]).join("、");
    notes.push(
      `牌阵中缺少${names}元素，可能说明这些维度在当前问题中被忽略。`
    );
  }

  // 数字模式
  for (const [num, count] of Object.entries(numberPatterns)) {
    if (count >= 2) {
      notes.push(
        `多张数字 ${num} 的牌出现，说明"${
          num === "5"
            ? "冲突和变化"
            : num === "1"
            ? "新的开始"
            : num === "10"
            ? "周期结束"
            : "特定数字主题"
        }"是当前问题的重点之一。`
      );
    }
  }

  return notes;
}
