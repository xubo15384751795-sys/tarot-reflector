/**
 * 解读生成 Prompt
 *
 * 把本地规则库、牌义、牌阵、motif 组装成受控上下文，
 * 让 AI 生成自然中文解读。
 */

import type { ReadingContext } from "../reading/types";
import { getCardMeaningContext, buildFullRulesContext } from "../buildReadingContext";
import { analyzeSpread } from "../spreadAnalyzer";
import { analyzeCardRelationships } from "../cardRelationshipAnalyzer";
import type { DrawnCard } from "../schema";

export type GenerateReadingInput = {
  reading_id: string;
  user: {
    question_original: string;
    question_reframed?: string;
    domain: string;
    depth?: string;
  };
  spread: {
    id: string;
    name_zh: string;
    positions: Array<{
      index: number;
      name_zh: string;
      meaning_zh: string;
    }>;
  };
  drawn_cards: DrawnCard[];
  rules_context: string;
  spread_analysis: ReturnType<typeof analyzeSpread>;
  relationship_analysis: ReturnType<typeof analyzeCardRelationships>;
};

export function buildReadingGeneratePrompt(input: GenerateReadingInput): {
  systemPrompt: string;
  userPrompt: string;
} {
  const cardDetails = input.drawn_cards
    .map((dc, i) => {
      const oLabel = dc.orientation === "upright" ? "正位" : "逆位";
      const traditional =
        dc.orientation === "upright"
          ? dc.card.traditional.upright
          : dc.card.traditional.reversed;
      return `第${i + 1}张牌 — ${dc.position.name_zh}（${dc.position.meaning_zh}）
牌面：${dc.card.name_zh}（${dc.card.name_en}）· ${oLabel}
关键词：${traditional.keywords_zh.join("、")}
牌义：${traditional.meaning_zh}
组合解读：${dc.card.symbolic_components.combined_rule_zh}`;
    })
    .join("\n\n");

  const analysisNotes = [
    ...input.spread_analysis.relationship_notes,
    input.relationship_analysis.narrative_zh,
  ].join("\n");

  return {
    systemPrompt: `你是中文 Rider–Waite–Smith 塔罗解读引擎。

你的任务是：基于本地规则库、牌义、牌阵和视觉元素，生成一段自然、温柔、有洞察力的中文塔罗解读。

你必须遵循的规则：
1. 只使用输入提供的牌义、规则、牌阵位置和视觉元素。不自创塔罗规则。
2. 不做确定性预测。不说"一定会"、"必定"、"注定"。
3. 不使用恐吓、宿命、强判断话术。
4. 所有输出必须是中文。不出现英文 UI 文案。
5. 多牌阵必须解释每张牌在其位置上的含义，不能孤立解释。
6. 多牌阵必须分析牌与牌之间的关系。
7. 感情问题不能替对方内心下确定判断。只描述牌面呈现的关系动态。
8. 逆位不能简单等同于"坏"。要给出具体模式（阻滞/内化/过度/不足/反转）。
9. 女性友好：温柔但诚实，不居高临下，不讨好，不恐吓。
10. 输出必须是合法 JSON。

文案风格：
- 温柔克制，像一个安静的朋友在和你说话
- 不用"你应该如何"，用"你可以考虑"
- 不用"你必须"，用"牌面提示"
- 正文 75% 对比度，辅助 55%，装饰 20-35%
- 标题可以有诗意，但正文要落地

输出格式：合法 JSON
{
  "title_zh": "解读标题（简洁有力）",
  "opening_zh": "开场白（承接用户问题）",
  "spread_overview": {
    "summary_zh": "牌阵整体印象",
    "arcana_density_zh": "大阿尔卡那比例分析",
    "reversal_density_zh": "逆位比例分析"
  },
  "position_readings": [
    {
      "position_index": 1,
      "position_name_zh": "位置名称",
      "card_id": "牌ID",
      "card_name_zh": "牌中文名",
      "orientation_zh": "正位/逆位",
      "headline_zh": "小标题",
      "body_zh": "正文解读",
      "scenes": [
        {
          "scene_id": 1,
          "type": "motif_focus",
          "focus_motif": "motif_id",
          "headline_zh": "场景标题",
          "body_zh": "场景正文",
          "annotation_label_zh": "标注文字",
          "duration": 6
        }
      ]
    }
  ],
  "relationship_analysis": {
    "narrative_flow_zh": "牌与牌之间的叙事流动",
    "suit_balance_zh": "花色平衡分析",
    "action_focus_zh": "行动焦点"
  },
  "final_advice_zh": ["建议1", "建议2", "建议3"],
  "closing_line_zh": "收尾语",
  "disclaimer_zh": "这不是命运预测，而是一种基于塔罗传统象征的反思性解读。"
}`,

    userPrompt: `用户问题：${input.user.question_original}
${input.user.question_reframed ? `问题复述：${input.user.question_reframed}` : ""}
领域：${input.user.domain}
${input.user.depth ? `深度偏好：${input.user.depth}` : ""}

牌阵：${input.spread.name_zh}（${input.spread.id}）

抽到的牌：
${cardDetails}

分析信息：
${analysisNotes}

请生成完整解读 JSON。`,
  };
}
