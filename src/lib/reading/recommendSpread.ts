import type { Domain, SpreadId, SpreadRecommendation } from "../schema";

const RELATIONSHIP_KEYWORDS = [
  "关系", "感情", "他", "她", "对方", "恋爱", "婚姻", "分手",
  "复合", "暧昧", "伴侣", "对象", "喜欢", "爱",
];

function containsRelationshipKeywords(q: string): boolean {
  return RELATIONSHIP_KEYWORDS.some((kw) => q.includes(kw));
}

const DOMAIN_DEFAULT: Record<Domain, SpreadId> = {
  love: "relationship_mirror",
  career: "situation_obstacle_advice",
  study: "past_present_trend",
  project: "structural_three",
  money: "situation_obstacle_advice",
  self: "past_present_trend",
};

export function recommendSpread(
  question: string,
  domain: Domain,
  depth?: "quick" | "standard" | "deep",
): SpreadRecommendation {
  if (depth === "quick" || domain === "self") {
    return {
      spread_id: "single_card",
      reason_zh: "快速提问或日常反思，一张牌足矣。简洁直接，不绕弯。",
      alternatives: ["past_present_trend", "situation_obstacle_advice"],
    };
  }

  if (depth === "deep") {
    return {
      spread_id: "celtic_cross",
      reason_zh: "深度问题需要更完整的视角，凯尔特十字的十个位置覆盖了问题的各个维度。",
      alternatives: ["relationship_mirror", "structural_three"],
    };
  }

  if (containsRelationshipKeywords(question)) {
    return {
      spread_id: "relationship_mirror",
      reason_zh: "你的问题涉及关系层面的动态，关系镜像牌阵可以帮助你看到双方的位置和张力。",
      alternatives: ["situation_obstacle_advice", "past_present_trend"],
    };
  }

  const defaultSpread = DOMAIN_DEFAULT[domain];
  const alternatives: SpreadId[] = ["past_present_trend", "situation_obstacle_advice"];

  return {
    spread_id: defaultSpread,
    reason_zh: `基于你当前关注的${domain === "love" ? "感情" : domain === "career" ? "工作" : domain === "study" ? "学习" : domain === "project" ? "项目" : domain === "money" ? "财务" : "自我"}领域，这个牌阵能提供最有针对性的视角。`,
    alternatives,
  };
}
