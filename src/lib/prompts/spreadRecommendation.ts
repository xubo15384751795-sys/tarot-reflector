/**
 * 牌阵推荐 Prompt
 *
 * 根据问题和领域推荐最适合的牌阵。
 */

import spreadsData from "@/data/tarot_rules/spreads.json";

export function buildSpreadRecommendPrompt(params: {
  question: string;
  domain: string;
  depth?: string;
}): { systemPrompt: string; userPrompt: string } {
  const spreadList = spreadsData.spreads
    .map(
      (s) =>
        `- ${s.id}: ${s.name_zh}（${s.card_count}张牌，${s.difficulty}）— ${s.description_zh}`
    )
    .join("\n");

  return {
    systemPrompt: `你是一个塔罗牌阵推荐助手。

你的任务是：
1. 根据用户的问题、领域和深度偏好，推荐最适合的牌阵。
2. 解释为什么这个牌阵适合这个问题。
3. 提供 1-2 个替代方案。
4. 不要推荐用户没有列出的牌阵。
5. 所有输出必须是中文。

可用牌阵：
${spreadList}

输出格式：合法 JSON
{
  "recommended_spread_id": "牌阵ID",
  "recommended_spread_name_zh": "牌阵中文名",
  "reason_zh": "推荐理由",
  "alternatives": [
    {
      "spread_id": "替代牌阵ID",
      "name_zh": "替代牌阵中文名",
      "reason_zh": "为什么也适合"
    }
  ]
}`,
    userPrompt: `用户问题：${params.question}
领域：${params.domain}
深度偏好：${params.depth ?? "适中"}

请推荐最适合的牌阵。`,
  };
}

/** 基于规则的默认推荐（不需要 AI） */
export function getDefaultSpreadRecommend(
  domain: string,
  depth?: string
): { spread_id: string; spread_name_zh: string; reason_zh: string } {
  if (domain === "love") {
    return {
      spread_id: "relationship_mirror",
      spread_name_zh: "关系镜像牌阵",
      reason_zh: "感情问题更适合用关系镜像牌阵，从多个角度观察关系动态。",
    };
  }
  if (depth === "深度" || depth === "认真看清楚") {
    return {
      spread_id: "structural_three",
      spread_name_zh: "结构三牌阵",
      reason_zh: "深度问题适合结构三牌阵，看清表层信号、深层张力和下一步。",
    };
  }
  return {
    spread_id: "single_card",
    spread_name_zh: "单牌解读",
    reason_zh: "快速问题用单牌解读即可。",
  };
}
