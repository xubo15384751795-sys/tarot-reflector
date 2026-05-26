/**
 * 牌间关系分析器 — 分析多牌阵中牌与牌之间的关系
 *
 * 负责：
 * - 时间线叙事（过去→现在→趋势）
 * - 结构因果分析（情况→阻碍→建议）
 * - 镜像对比（你vs对方）
 * - 元素互动分析
 * - 正逆位组合解读
 */

import type { CardData, DrawnCard, Orientation, SpreadDefinition } from "./schema";

export type CardRelationship = {
  from_index: number;
  to_index: number;
  from_card: string;
  to_card: string;
  relationship_type: string;
  description_zh: string;
};

export type RelationshipAnalysis = {
  relationships: CardRelationship[];
  narrative_zh: string;
  tension_points: string[];
  flow_description: string;
};

const SUIT_ELEMENTS: Record<string, string> = {
  wands: "fire",
  cups: "water",
  swords: "air",
  pentacles: "earth",
};

const ELEMENT_COMPATIBILITY: Record<string, Record<string, string>> = {
  fire: { fire: "同元素共振", water: "水火相激", air: "风助火势", earth: "火土相制" },
  water: { fire: "水火相激", water: "同元素共振", air: "水风相荡", earth: "水土相融" },
  air: { fire: "风助火势", water: "水风相荡", air: "同元素共振", earth: "风土相阻" },
  earth: { fire: "火土相制", water: "水土相融", air: "风土相阻", earth: "同元素共振" },
};

/**
 * 分析牌阵中牌与牌之间的关系
 */
export function analyzeCardRelationships(
  drawnCards: DrawnCard[],
  spread: SpreadDefinition
): RelationshipAnalysis {
  const relationships: CardRelationship[] = [];
  const tensionPoints: string[] = [];

  // 1. 相邻牌关系
  for (let i = 0; i < drawnCards.length - 1; i++) {
    const from = drawnCards[i];
    const to = drawnCards[i + 1];
    const rel = analyzePairwiseRelationship(from, to, spread);
    relationships.push(rel);
  }

  // 2. 对称位置关系（如凯尔特十字中的对立位）
  if (drawnCards.length >= 10) {
    // 凯尔特十字特殊位置关系
    const celticPairs = [
      [0, 1], // 当前处境 vs 当前挑战
      [2, 4], // 潜意识 vs 显意识
      [3, 5], // 过去 vs 趋势
      [6, 7], // 自我 vs 环境
    ];
    for (const [a, b] of celticPairs) {
      if (a < drawnCards.length && b < drawnCards.length) {
        const rel = analyzePairwiseRelationship(
          drawnCards[a],
          drawnCards[b],
          spread
        );
        rel.relationship_type = "对立面";
        relationships.push(rel);
      }
    }
  }

  // 3. 元素互动分析
  const elementInteractions = analyzeElementInteractions(drawnCards);

  // 4. 正逆位组合分析
  const orientationDynamics = analyzeOrientationDynamics(drawnCards);

  // 5. 生成叙事
  const narrative = generateNarrative(
    drawnCards,
    spread,
    relationships,
    elementInteractions,
    orientationDynamics
  );

  // 6. 识别张力点
  for (const rel of relationships) {
    if (
      rel.relationship_type === "冲突" ||
      rel.relationship_type === "对立面"
    ) {
      tensionPoints.push(rel.description_zh);
    }
  }

  return {
    relationships,
    narrative_zh: narrative,
    tension_points: tensionPoints,
    flow_description: elementInteractions,
  };
}

function analyzePairwiseRelationship(
  from: DrawnCard,
  to: DrawnCard,
  spread: SpreadDefinition
): CardRelationship {
  const fromElement = from.card.suit
    ? SUIT_ELEMENTS[from.card.suit]
    : null;
  const toElement = to.card.suit
    ? SUIT_ELEMENTS[to.card.suit]
    : null;

  let relType = "流动";
  let desc = "";

  // 同牌
  if (from.card.id === to.card.id) {
    relType = "重复";
    desc = `${from.card.name_zh}重复出现，说明这个主题需要特别关注。`;
    return {
      from_index: from.position_index,
      to_index: to.position_index,
      from_card: from.card.name_zh,
      to_card: to.card.name_zh,
      relationship_type: relType,
      description_zh: desc,
    };
  }

  // 同花色
  if (from.card.suit && from.card.suit === to.card.suit) {
    relType = "同花色延伸";
    const suitName =
      from.card.suit === "wands"
        ? "权杖"
        : from.card.suit === "cups"
        ? "圣杯"
        : from.card.suit === "swords"
        ? "宝剑"
        : "星币";
    desc = `两张${suitName}形成呼应，说明${suitName}对应的领域是问题重点。`;
    return {
      from_index: from.position_index,
      to_index: to.position_index,
      from_card: from.card.name_zh,
      to_card: to.card.name_zh,
      relationship_type: relType,
      description_zh: desc,
    };
  }

  // 同数字
  if (from.card.number && from.card.number === to.card.number) {
    relType = "同数字主题";
    desc = `两张数字 ${from.card.number} 的牌形成呼应，说明数字 ${from.card.number} 的主题贯穿问题。`;
    return {
      from_index: from.position_index,
      to_index: to.position_index,
      from_card: from.card.name_zh,
      to_card: to.card.name_zh,
      relationship_type: relType,
      description_zh: desc,
    };
  }

  // 大阿尔卡那 vs 小阿尔卡那
  if (from.card.arcana === "major" && to.card.arcana === "minor") {
    relType = "原型→具体";
    desc = `从大阿尔卡那的原型层面进入小阿尔卡那的具体层面，${from.card.name_zh}的主题在${to.card.name_zh}中得到具体呈现。`;
    return {
      from_index: from.position_index,
      to_index: to.position_index,
      from_card: from.card.name_zh,
      to_card: to.card.name_zh,
      relationship_type: relType,
      description_zh: desc,
    };
  }

  if (from.card.arcana === "minor" && to.card.arcana === "major") {
    relType = "具体→原型";
    desc = `从具体事件上升到原型层面，${from.card.name_zh}的处境可能通向${to.card.name_zh}的深层主题。`;
    return {
      from_index: from.position_index,
      to_index: to.position_index,
      from_card: from.card.name_zh,
      to_card: to.card.name_zh,
      relationship_type: relType,
      description_zh: desc,
    };
  }

  // 元素关系
  if (fromElement && toElement) {
    const compat = ELEMENT_COMPATIBILITY[fromElement]?.[toElement];
    if (compat && compat !== "同元素共振") {
      relType = "元素互动";
      desc = `${from.card.name_zh}（${ELEMENT_NAME_MAP[fromElement]}）与${to.card.name_zh}（${ELEMENT_NAME_MAP[toElement]}）形成${compat}的关系。`;
      return {
        from_index: from.position_index,
        to_index: to.position_index,
        from_card: from.card.name_zh,
        to_card: to.card.name_zh,
        relationship_type: relType,
        description_zh: desc,
      };
    }
  }

  // 正逆位对比
  if (from.orientation !== to.orientation) {
    relType = "正逆对比";
    desc = `${from.card.name_zh}（${from.orientation === "upright" ? "正位" : "逆位"}）与${to.card.name_zh}（${to.orientation === "upright" ? "正位" : "逆位"}）形成正逆对比，能量流动方向不同。`;
    return {
      from_index: from.position_index,
      to_index: to.position_index,
      from_card: from.card.name_zh,
      to_card: to.card.name_zh,
      relationship_type: relType,
      description_zh: desc,
    };
  }

  // 默认：一般流动
  desc = `${from.card.name_zh}到${to.card.name_zh}，能量从一个主题流动到另一个主题。`;
  return {
    from_index: from.position_index,
    to_index: to.position_index,
    from_card: from.card.name_zh,
    to_card: to.card.name_zh,
    relationship_type: relType,
    description_zh: desc,
  };
}

const ELEMENT_NAME_MAP: Record<string, string> = {
  fire: "火",
  water: "水",
  air: "风",
  earth: "土",
};

function analyzeElementInteractions(drawnCards: DrawnCard[]): string {
  const elements = drawnCards
    .filter((dc) => dc.card.suit)
    .map((dc) => SUIT_ELEMENTS[dc.card.suit!]);

  if (elements.length < 2) return "";

  const counts: Record<string, number> = {};
  for (const e of elements) {
    counts[e] = (counts[e] || 0) + 1;
  }

  const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  if (dominant && dominant[1] >= 3) {
    return `元素以${ELEMENT_NAME_MAP[dominant[0]]}为主导，问题的能量偏向${dominant[0] === "fire" ? "行动和热情" : dominant[0] === "water" ? "情感和直觉" : dominant[0] === "air" ? "理性和沟通" : "现实和资源"}。`;
  }

  return "";
}

function analyzeOrientationDynamics(drawnCards: DrawnCard[]): string {
  const upright = drawnCards.filter(
    (dc) => dc.orientation === "upright"
  ).length;
  const reversed = drawnCards.length - upright;

  if (reversed > upright && reversed >= 3) {
    return "逆位较多，能量整体偏内化或受阻。";
  }
  if (upright > reversed && upright >= 3) {
    return "正位为主，能量整体外显且顺畅。";
  }
  if (upright === reversed && drawnCards.length >= 4) {
    return "正逆位均衡，内外力量正在拉扯。";
  }
  return "";
}

function generateNarrative(
  drawnCards: DrawnCard[],
  spread: SpreadDefinition,
  relationships: CardRelationship[],
  elementInteractions: string,
  orientationDynamics: string
): string {
  const parts: string[] = [];

  // 牌阵描述
  parts.push(`本次使用「${spread.name_zh}」牌阵，共 ${drawnCards.length} 张牌。`);

  // 各位置牌面
  for (const dc of drawnCards) {
    const oLabel = dc.orientation === "upright" ? "正位" : "逆位";
    parts.push(
      `${dc.position.name_zh}：${dc.card.name_zh}（${oLabel}）`
    );
  }

  // 元素分析
  if (elementInteractions) {
    parts.push(elementInteractions);
  }

  // 正逆位动态
  if (orientationDynamics) {
    parts.push(orientationDynamics);
  }

  return parts.join("\n");
}
