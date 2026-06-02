/**
 * 牌阵选择页 · 规则与介绍文案（与 tarot_rules.md / spreads.json 一致）
 */

import type { SpreadDefinition } from "@/lib/schema";

export const TAROT_INTRO_SECTIONS = [
  {
    title: "塔罗在这里是什么",
    body: "阈牌把塔罗当作一面镜子，用来外化、命名你此刻的感受——不预测命运，不替你做决定，也不替代专业咨询。",
  },
  {
    title: "牌组与体系",
    body: "采用 Rider–Waite–Smith（韦特派）公版牌面。牌义以项目内牌义档案为准；正位偏外显与流动，逆位偏内隐、阻滞或需要向内看，不是简单的「反义词」。",
  },
  {
    title: "什么是牌阵",
    body: "牌阵是把多张牌放在固定位置上，每个位置回答问题的一个侧面（例如「过去」「阻碍」「建议」）。选牌阵 ≈ 选一种看问题的结构，不是选「更准」的魔法。",
  },
] as const;

export const DIFFICULTY_HINTS: Record<string, string> = {
  beginner: "入门：1–3 张，适合日常反思或问题尚清晰时。",
  intermediate: "进阶：看清结构或关系动态，需要多一点耐心阅读。",
  advanced: "深入：牌位多、叙事长，适合愿意慢读的复杂议题。",
};

export function getSpreadDetailSections(
  def: SpreadDefinition | undefined,
): Array<{ title: string; body?: string; items?: string[] }> {
  if (!def) return [];

  const sections: Array<{ title: string; body?: string; items?: string[] }> = [
    {
      title: def.name_zh,
      body: def.description_zh,
    },
    {
      title: `牌位含义（共 ${def.card_count} 张）`,
      items: def.positions.map(
        (p) =>
          `${p.index}. ${p.name_zh}：${p.meaning_zh}${p.warning ? `（${p.warning}）` : ""}`,
      ),
    },
  ];

  if (def.protection_rules?.length) {
    sections.push({
      title: "感情类硬底线",
      items: def.protection_rules,
    });
  }

  if (def.relationship_rules?.length) {
    sections.push({
      title: "牌与牌如何连读",
      items: def.relationship_rules,
    });
  }

  return sections;
}
