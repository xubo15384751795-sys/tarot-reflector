/**
 * 多牌阵模板解读生成器
 *
 * 为多牌阵生成位置解读、关系分析和牌阵综合等场景。
 * 不依赖外部 API，用本地规则拼装 scenes。
 */

import { APP_DISCLAIMER, DOMAIN_LABELS } from "../constants";
import { analyzeCardRelationships } from "../cardRelationshipAnalyzer";
import { analyzeSpread } from "../spreadAnalyzer";
import type {
  DrawnCard,
  Motif,
  SpreadDefinition,
  TarotReading,
  TarotScene,
  UserInput,
} from "../schema";
import {
  analyzeInput,
  groundingLineFor,
  tonePrefixFor,
  weaveUserKeyword,
  type InputSignals,
} from "./inputAnalyzer";
import type { ReadingContext, ReadingGenerator } from "./types";

function clip(s: string, max: number): string {
  if (!s) return "";
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

function makeMotifs(dc: DrawnCard): Motif[] {
  const keywords =
    dc.orientation === "upright"
      ? dc.card.traditional.upright.keywords_zh
      : dc.card.traditional.reversed.keywords_zh;
  return keywords.slice(0, 5).map((kw, i) => ({
    id: `${dc.card.id}_kw_${i}`,
    label: kw,
    meaning: kw,
    bbox: { x: 0, y: 0, w: 0, h: 0 },
  }));
}

function buildOpening(
  input: UserInput,
  spread: SpreadDefinition,
  signals: InputSignals,
): TarotScene {
  const tonePrefix = tonePrefixFor(signals.primaryEmotion, signals.selfDoubt);
  const bodyParts = [
    `你带着一个关于${DOMAIN_LABELS[input.domain]}的问题，抽取了「${spread.name_zh}」牌阵。`,
  ];
  if (signals.richness !== "minimal") {
    bodyParts.push(`${tonePrefix}${spread.description_zh}`);
  }
  if (signals.richness === "rich" || signals.richness === "detailed") {
    const focal = signals.quotedSegment ?? signals.keywords[0];
    if (focal) {
      bodyParts.push(`你提到「${focal}」——它会在后续每张牌里回响。`);
    }
  }

  return {
    scene_id: 1,
    type: "opening",
    step_label: "牌阵",
    headline: `${spread.name_zh} · ${spread.card_count} 张牌`,
    subtitle: spread.description_zh,
    insight: "牌阵是一个视角，不是答案。它帮你把问题分成几个可以观察的维度。",
    body: bodyParts.join("\n\n"),
    connection: input.question
      ? `你的问题是：${clip(input.question, Math.min(signals.recommendedBodyChars / 2, 96))}。先保持这个疑问，留意每一个位置带来的视角。`
      : "先保持开放的心态，留意每一个位置带来的视角。",
    visual_direction: "All cards face down, spread layout visible.",
    duration: 5,
    focus_motif: null,
    annotation_label: null,
  };
}

function buildPositionScene(
  dc: DrawnCard,
  sceneId: number,
  input: UserInput,
  motifs: Motif[],
  signals: InputSignals,
): TarotScene {
  const oLabel = dc.orientation === "upright" ? "正位" : "逆位";
  const meaning =
    dc.orientation === "upright"
      ? dc.card.traditional.upright.meaning_zh
      : dc.card.traditional.reversed.meaning_zh;

  const domainKey =
    input.domain === "love"
      ? "感情"
      : input.domain === "career"
        ? "工作"
        : input.domain === "project"
          ? "项目"
          : input.domain === "study"
            ? "学习"
            : input.domain === "money"
              ? "财务"
              : "自我";

  const domainMeaning = dc.card.domain_mapping[domainKey];
  const parts = [
    `【${dc.position.name_zh}】${dc.position.meaning_zh}`,
    ``,
    `${dc.card.name_zh} · ${oLabel}`,
    clip(meaning, signals.recommendedBodyChars),
  ];
  if (domainMeaning) {
    parts.push(
      `\n【${domainKey}领域】${clip(domainMeaning, signals.recommendedBodyChars)}`
    );
  }

  let body = parts.join("\n");
  // 详细输入：在最后一段织入用户关键词，让位置解读"读了你的话"
  if (signals.richness === "rich" || signals.richness === "detailed") {
    body = weaveUserKeyword(body, signals, body.length + 120);
  }

  // connection 在详细输入下用更具体的人称/时间锚
  const richConnection =
    signals.pronouns.length > 0
      ? `${dc.position.name_zh}里出现的${dc.card.name_zh}，对你和${signals.pronouns[0]}之间的事，提示了什么？`
      : signals.timeWords.length > 0
      ? `回到${signals.timeWords[0]}的语境，${dc.position.name_zh}的${dc.card.name_zh}照亮了哪一面？`
      : `${dc.position.name_zh}的${dc.card.name_zh}对你当前的处境有什么提示？`;

  return {
    scene_id: sceneId,
    type: "card_analysis",
    step_label: dc.position.name_zh,
    headline: `${dc.card.name_zh} · ${oLabel}`,
    subtitle: dc.position.name_zh,
    insight: clip(dc.position.meaning_zh, 48),
    body,
    connection: signals.richness === "minimal" ? `${dc.position.name_zh}对你提示了什么？` : richConnection,
    visual_direction: `Highlight card at position ${dc.position_index}.`,
    duration: 6,
    focus_card_id: dc.card.id,
    focus_motif: motifs[0]?.id ?? null,
    annotation_label: motifs[0]?.label ?? motifs[1]?.label ?? null,
    position_name: dc.position.name_zh,
  };
}

function buildRelationshipsScene(
  drawnCards: DrawnCard[],
  spread: SpreadDefinition,
): TarotScene {
  const analysis = analyzeCardRelationships(drawnCards, spread);
  const bodyParts: string[] = [];

  if (analysis.narrative_zh) bodyParts.push(analysis.narrative_zh);
  if (analysis.flow_description) bodyParts.push(`\n${analysis.flow_description}`);
  for (const rel of analysis.relationships) {
    bodyParts.push(`\n· ${rel.description_zh}`);
  }

  return {
    scene_id: drawnCards.length + 2,
    type: "relationship_analysis",
    step_label: "牌间关系",
    headline: "牌与牌的对话",
    subtitle: "关系分析和元素互动",
    insight: "牌阵中的每张牌不是孤立的，它们通过位置、元素和象征相互呼应。",
    body: bodyParts.join("\n"),
    connection: "你觉得这些牌之间的张力，是否也反映在你生活中的某些关系或矛盾中？",
    visual_direction:
      "Show connection lines between related card positions.",
    duration: 8,
    focus_motif: null,
    annotation_label: null,
  };
}

function buildSynthesisScene(
  drawnCards: DrawnCard[],
): TarotScene {
  const analysis = analyzeSpread(drawnCards);
  const parts: string[] = [];

  parts.push(
    `牌阵中共有 ${drawnCards.length} 张牌，其中大阿尔卡那 ${analysis.major_arcana_count} 张（${Math.round(analysis.major_arcana_ratio * 100)}%），小阿尔卡那 ${drawnCards.length - analysis.major_arcana_count} 张。`,
  );

  if (analysis.dominant_suit) {
    const suitNames: Record<string, string> = {
      wands: "权杖",
      cups: "圣杯",
      swords: "宝剑",
      pentacles: "星币",
    };
    const sn = suitNames[analysis.dominant_suit] ?? analysis.dominant_suit;
    parts.push(
      `${sn}出现 ${analysis.suit_counts[analysis.dominant_suit]} 次，${analysis.suit_counts[analysis.dominant_suit]! >= 2 ? "能量偏集中。" : "分布均匀。"}`,
    );
  }

  if (analysis.reversal_count > 0) {
    parts.push(
      `逆位 ${analysis.reversal_count} 张（${Math.round(analysis.reversal_ratio * 100)}%），${analysis.reversal_ratio > 0.5 ? "能量整体偏内化，需要关注被忽略的部分。" : "正逆位相对均衡。"}`,
    );
  }

  for (const note of analysis.relationship_notes) {
    parts.push(`\n${note}`);
  }

  return {
    scene_id: drawnCards.length + 3,
    type: "spread_synthesis",
    step_label: "综合",
    headline: "牌阵整体格局",
    subtitle: "统计与能量分布",
    insight: "整体的能量分布比单张牌更能揭示问题的结构。",
    body: parts.join("\n"),
    connection: "整体格局中，哪个维度最引起你的注意？",
    visual_direction: "Show statistical overlay on spread.",
    duration: 7,
    focus_motif: null,
    annotation_label: null,
  };
}

function buildClosing(signals: InputSignals): TarotScene {
  // 简短输入：只留一两条；详细输入：保留三条 + grounding 句
  // 用 —— 破折号代替 · 项目符号；前者像散文，后者像 todo 列表
  const bullets = [
    "—— 回顾每张牌在各自位置上的提示",
    "—— 留意牌之间的联系如何反映你的处境",
    "—— 选择其中最能共鸣的一点，作为今天的思考起点",
  ];
  const keepCount =
    signals.richness === "minimal" ? 1 : signals.richness === "brief" ? 2 : 3;
  const lines = bullets.slice(0, keepCount).join("\n");
  const grounding = groundingLineFor(signals.primaryEmotion);
  const body = grounding ? `${lines}\n\n${grounding}` : lines;

  return {
    scene_id: 0,
    type: "closing",
    step_label: "反思",
    headline: "留意",
    subtitle: "不必现在就做。先听听这些句子。",
    insight: "解读提供了一个视角，行动的主动权在你手中。",
    body,
    connection: signals.selfDoubt
      ? "请记得：审判自己往往比解决问题更耗能。先停一停。"
      : "哪些发现可以带入你今天的行动或观察中？",
    visual_direction: "Spread fades, text remains.",
    duration: 5,
    focus_motif: null,
    annotation_label: null,
  };
}

function generateFromTemplate(ctx: ReadingContext): TarotReading {
  const { input, drawn_cards, spread } = ctx;
  const cards = drawn_cards!;
  const spr = spread!;
  const themeCard = cards[0]!;
  const thesis = `${spr.name_zh}揭示了${DOMAIN_LABELS[input.domain]}方面的${cards.length}个维度。`;

  const signals = analyzeInput(input.question ?? "");

  const scenes: TarotScene[] = [];
  scenes.push(buildOpening(input, spr, signals));

  for (let i = 0; i < cards.length; i++) {
    const motifs = makeMotifs(cards[i]!);
    scenes.push(buildPositionScene(cards[i]!, i + 2, input, motifs, signals));
  }

  scenes.push(buildRelationshipsScene(cards, spr));
  scenes.push(buildSynthesisScene(cards));

  const closing = buildClosing(signals);
  closing.scene_id = scenes.length + 1;
  scenes.push(closing);

  return {
    title: `${spr.name_zh} · ${themeCard.card.name_zh}等${cards.length}张牌`,
    thesis,
    spread_id: spr.id,
    spread_name_zh: spr.name_zh,
    cards: cards.map((dc) => ({
      card_id: dc.card.id,
      card_name: dc.card.name_en,
      zh_name: dc.card.name_zh,
      orientation: dc.orientation,
      image: dc.card.image,
      position_name: dc.position.name_zh,
      position_index: dc.position_index,
      motifs: makeMotifs(dc),
    })),
    card_id: themeCard.card.id,
    card_name: themeCard.card.name_en,
    zh_name: themeCard.card.name_zh,
    orientation: themeCard.orientation,
    domain: input.domain,
    motifs: makeMotifs(themeCard),
    image: themeCard.card.image,
    scenes,
    closing_line: thesis,
    disclaimer: APP_DISCLAIMER,
  };
}

export const multiCardReadingGenerator: ReadingGenerator = {
  id: "multi_card_template",
  label: "多牌阵模板解读",
  async generate(ctx) {
    return generateFromTemplate(ctx);
  },
};

export function generateMultiCardTemplateReading(
  ctx: ReadingContext,
): TarotReading {
  return generateFromTemplate(ctx);
}
