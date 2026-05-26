/**
 * 模板解读生成器（默认实现）
 *
 * 不依赖外部 LLM。用本地规则 + 输入分析器拼装 scenes，
 * scene 数量、单 scene 字数、措辞调子、closing 安抚都跟着用户输入变化：
 *   - 长度档（minimal→detailed）决定 scene 数（2–6）和 body 字符上限（60–240）
 *   - 关键词 / 引用片段在 scene body 里回插，让解读"读了你的话"
 *   - 情绪信号（焦虑 / 迷茫 / 受伤 / ...）触发 closing 的 grounding 句和开场调子
 */

import { APP_DISCLAIMER, DOMAIN_LABELS } from "../constants";
import type { TarotReading, TarotScene, Domain, Motif } from "../schema";
import {
  analyzeInput,
  groundingLineFor,
  tonePrefixFor,
  weaveUserKeyword,
  type InputSignals,
} from "./inputAnalyzer";
import type { ReadingContext, ReadingGenerator } from "./types";

const THESIS_TEMPLATES: Record<string, Record<string, string>> = {
  the_fool: {
    upright: "在地面浮现之前先纵身一跃。",
    reversed: "并非所有犹豫都是恐惧，其中一些是智慧。",
  },
  the_magician: {
    upright: "你已经握有所需的一切。",
    reversed: "没有方向的技巧只是噪音。",
  },
  the_high_priestess: {
    upright: "答案比问题更安静。",
    reversed: "宁静被噪音取代了。",
  },
  the_empress: {
    upright: "让它生长，不要去拉扯根部。",
    reversed: "先滋养你自己，再去滋养别的。",
  },
  the_emperor: {
    upright: "先建立容器，再去填满它。",
    reversed: "僵硬并不等同于力量。",
  },
  the_hierophant: {
    upright: "有些路已经被人走过。",
    reversed: "地图不等于领土。",
  },
  the_lovers: {
    upright: "并非所有选择都是岔路，有些是镜子。",
    reversed: "对齐比同意更重要。",
  },
  the_chariot: {
    upright: "对立的力量也能拉向同一个方向。",
    reversed: "没有方向的速度只是漂移。",
  },
  strength: {
    upright: "最安静的声音往往撬动最多。",
    reversed: "没有温柔的耐力会变成消耗。",
  },
  the_hermit: {
    upright: "信号在寂静中更清晰。",
    reversed: "孤立和独处并不相同。",
  },
  wheel_of_fortune: {
    upright: "模式在转动，注意季节。",
    reversed: "并非每个低谷都是下行。",
  },
  justice: {
    upright: "因果不接受谈判。",
    reversed: "迟到的诚实即是被否认的诚实。",
  },
  the_hanged_man: {
    upright: "当你停下，视角才会改变。",
    reversed: "交付不是放弃，是放手。",
  },
  death: {
    upright: "不再承载你的事物，让它过去。",
    reversed: "握住不放不等于撑得住。",
  },
  temperance: {
    upright: "平衡不是静止，是持续微调。",
    reversed: "中间道路不是轻松的路。",
  },
  the_devil: {
    upright: "锁链比感觉中更松。",
    reversed: "看见锁的一刻，自由就开始了。",
  },
  the_tower: {
    upright: "结构本来就已经裂了。",
    reversed: "推迟崩塌不等于修复它。",
  },
  the_star: {
    upright: "风暴之后，空气变得清晰。",
    reversed: "希望不是计划，但它是一个开始。",
  },
  the_moon: {
    upright: "并非所有的模糊都是威胁。",
    reversed: "雾散了，被遮蔽的开始显现。",
  },
  the_sun: {
    upright: "清晰不是奖赏，是一个瞬间。",
    reversed: "光在那里，你只是别开了脸。",
  },
  judgement: {
    upright: "再听一次，听得更深。",
    reversed: "召唤已经发出，你回应了吗？",
  },
  the_world: {
    upright: "圆环闭合，新的一圈开始。",
    reversed: "接近完成，不要停在门槛上。",
  },
};

const OPENING_HEADLINES: Record<string, string> = {
  the_tower: "整体：旧结构正在松动",
  the_star: "整体：风暴之后的微光",
  the_moon: "整体：你正穿过低能见度",
  the_sun: "整体：光本身就是信号",
  the_fool: "整体：出发的姿态就是答案",
  death: "整体：结束也是一种结构",
  the_devil: "整体：锁链比想象更松",
};

const STEP_LABELS = ["整体", "元素一", "元素二", "元素三", "元素四", "综合", "建议"];

function clip(s: string, max: number): string {
  if (!s) return "";
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

function buildOpening(
  cardId: string,
  zhName: string,
  orientation: string,
  question: string,
  domain: Domain,
  thesis: string,
  signals: InputSignals
): TarotScene {
  const oZh = orientation === "upright" ? "正位" : "逆位";
  const headline = OPENING_HEADLINES[cardId] ?? `整体：${zhName} · ${oZh}`;
  const tonePrefix = tonePrefixFor(signals.primaryEmotion, signals.selfDoubt);
  const contextLine = question
    ? `你带着一个关于${DOMAIN_LABELS[domain]}的问题来到这里：${clip(question, Math.min(signals.recommendedBodyChars / 2, 96))}`
    : `你带着一个关于${DOMAIN_LABELS[domain]}的问题来到这里。`;

  // 短输入：开场仅一句；详细输入：再多一段铺垫
  const bodyParts = [contextLine];
  if (signals.richness !== "minimal") {
    bodyParts.push(
      `${tonePrefix}这次解读不会给你「是或否」，而是把这张牌拆成几个可以观察的元素，逐一对照你所处的处境。`
    );
  }
  if (signals.richness === "rich" || signals.richness === "detailed") {
    const focal = signals.quotedSegment ?? signals.keywords[0];
    if (focal) {
      bodyParts.push(
        `特别留意你提到的「${focal}」——它在这次牌面里会成为一个回声点。`
      );
    }
  }

  return {
    scene_id: 1,
    type: "opening",
    step_label: STEP_LABELS[0],
    headline,
    subtitle: `${zhName} · ${oZh}`,
    insight: thesis,
    body: bodyParts.join("\n\n"),
    connection:
      signals.primaryEmotion === "anxious"
        ? "在进入元素之前，先慢三个呼吸，让心跳从喉咙里降回胸腔。"
        : "在进入元素之前，先用一秒钟停下，留意此刻你身上最强烈的感受是什么。",
    visual_direction: "All motifs visible, none highlighted. Card glows softly.",
    duration: 5,
    focus_motif: null,
    annotation_label: null,
  };
}

function buildMotifScene(
  motif: Motif,
  idx: number,
  zhName: string,
  orientation: string,
  domain: Domain,
  coreSymbols: string[],
  risk: string[],
  advice: string[],
  signals: InputSignals
): TarotScene {
  const subtitle = `${coreSymbols[idx % Math.max(coreSymbols.length, 1)] ?? ""} · ${
    idx % 2 === 0 ? "压力点" : "支撑点"
  }`.replace(/^\s·\s/, "");

  const insight = `${motif.label}并不是装饰。它指向${
    coreSymbols[idx % Math.max(coreSymbols.length, 1)] ?? "这张牌的核心张力"
  }。`;

  const angle = idx % 2 === 0 ? risk : advice;
  const angleLine = angle[idx % Math.max(angle.length, 1)] ?? "";

  // Base body
  let body = [
    `在${orientation === "upright" ? "正位" : "逆位"}的${zhName}中，${motif.label}承载着「${
      coreSymbols[idx % Math.max(coreSymbols.length, 1)] ?? "核心张力"
    }」这一层意涵。`,
    angleLine ? clip(angleLine, Math.min(96, signals.recommendedBodyChars / 2)) + "。" : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  // 详细输入：每隔一个 motif 注入一次用户关键词，避免重复轰炸
  if (
    (signals.richness === "rich" || signals.richness === "detailed") &&
    idx % 2 === 1
  ) {
    body = weaveUserKeyword(body, signals, signals.recommendedBodyChars);
  } else if (body.length > signals.recommendedBodyChars) {
    body = body.slice(0, signals.recommendedBodyChars - 1) + "…";
  }

  // connection 也跟着用户语境走
  const baseConnection = `如果你把${motif.label}放回你的处境里，它最像哪一处具体的情绪、关系或决定？`;
  const richConnection =
    signals.pronouns.length > 0
      ? `如果你把${motif.label}放回${signals.pronouns[0]}和你之间的那件事里，它最像哪一处？`
      : signals.timeWords.length > 0
      ? `回到${signals.timeWords[0]}的那个时刻，${motif.label}最像那一刻里的哪一面？`
      : baseConnection;
  const connection = signals.richness === "minimal" ? baseConnection : richConnection;

  return {
    scene_id: idx + 2,
    type: "card_analysis",
    step_label: STEP_LABELS[idx + 1] ?? `元素${idx + 1}`,
    headline: motif.label.replace(/[、，。!?,.]/g, "").slice(0, 10),
    subtitle,
    insight,
    body,
    connection,
    visual_direction: `Spotlight ${motif.id}. Leader line label glows.`,
    duration: 6,
    focus_motif: motif.id,
    annotation_label: motif.label,
  };
}

function buildMapping(
  motifs: Motif[],
  domain: Domain,
  question: string,
  domainMeaning: string,
  zhName: string
): TarotScene {
  const focus = motifs[1] ?? motifs[0] ?? null;
  const body = domainMeaning
    ? clip(domainMeaning, 120)
    : `把上面几个元素并排放回${DOMAIN_LABELS[domain]}的处境里，${zhName}并没有要你立刻得出结论，而是让你看清当前正在承压的部分。`;

  return {
    scene_id: motifs.length + 2,
    type: "mapping",
    step_label: STEP_LABELS[5],
    headline: "综合：把信号映射到你的问题",
    subtitle: `${zhName} → ${DOMAIN_LABELS[domain]}`,
    insight: "把元素并排看，结构会比单独看任何一个更清楚。",
    body,
    connection: question
      ? `回到你的问题：${clip(question, 48)}。哪些元素正在悄悄影响你，但你之前没意识到？`
      : "哪些元素正在悄悄影响你，但你之前没意识到？",
    visual_direction: "Settle on structural motif.",
    duration: 7,
    focus_motif: focus?.id ?? null,
    annotation_label: focus?.label ?? null,
  };
}

function buildClosing(
  thesis: string,
  advice: string[],
  signals: InputSignals
): TarotScene {
  // 详细输入：保留 3 条建议；简短输入：只留 1–2 条避免堆砌
  const adviceCount =
    signals.richness === "minimal"
      ? 1
      : signals.richness === "brief"
      ? 2
      : 3;
  const adviceLines = advice
    .slice(0, adviceCount)
    .map((a) => `· ${clip(a, Math.min(48, signals.recommendedBodyChars / 3))}`)
    .join("\n");
  const grounding = groundingLineFor(signals.primaryEmotion);
  const body = grounding ? `${adviceLines}\n\n${grounding}` : adviceLines;

  return {
    scene_id: 0,
    type: "closing",
    step_label: STEP_LABELS[6],
    headline: "建议",
    subtitle: "下一步可以做的一件事",
    insight: thesis,
    body,
    connection:
      signals.selfDoubt
        ? "请记得：审判自己往往比解决问题更耗能。先停一停。"
        : "不需要一次做完，先选一件今天就可以开始的小事。",
    visual_direction: "Spotlight releases. Card returns to whole.",
    duration: 5,
    focus_motif: null,
    annotation_label: null,
  };
}

function generateFromTemplate(ctx: ReadingContext): TarotReading {
  const { input } = ctx;
  const card = ctx.card!;
  const orientation = card.orientation;
  const thesis =
    THESIS_TEMPLATES[card.id]?.[orientation] ?? "一个值得留意的信号。";

  // 输入信号驱动 scene 数量与文字深度
  const signals = analyzeInput(input.question ?? "");
  const motifCount = Math.min(signals.recommendedSceneCount, card.motifs.length);
  const motifFocus = card.motifs.slice(0, motifCount);

  const opening = buildOpening(
    card.id,
    card.zh_name,
    orientation,
    input.question,
    input.domain,
    thesis,
    signals
  );
  const motifScenes = motifFocus.map((m, idx) =>
    buildMotifScene(
      m,
      idx,
      card.zh_name,
      orientation,
      input.domain,
      card.core_symbols,
      card.risk,
      card.advice,
      signals
    )
  );
  const mapping = buildMapping(
    card.motifs,
    input.domain,
    input.question,
    card.domain_meaning,
    card.zh_name
  );
  const closing = buildClosing(thesis, card.advice, signals);
  closing.scene_id = motifScenes.length + 3;

  return {
    title: `${card.zh_name} · ${orientation === "upright" ? "正位" : "逆位"}`,
    thesis,
    spread_id: "single_card",
    spread_name_zh: "单牌解读",
    cards: [
      {
        card_id: card.id,
        card_name: card.card_name,
        zh_name: card.zh_name,
        orientation,
        image: card.image,
        position_name: "核心象征",
        position_index: 0,
        motifs: card.motifs,
      },
    ],
    card_id: card.id,
    card_name: card.card_name,
    zh_name: card.zh_name,
    orientation,
    domain: input.domain,
    motifs: card.motifs,
    image: card.image,
    scenes: [opening, ...motifScenes, mapping, closing],
    closing_line: thesis,
    disclaimer: APP_DISCLAIMER,
  };
}

export const templateReadingGenerator: ReadingGenerator = {
  id: "template",
  label: "本地模板",
  async generate(ctx) {
    return generateFromTemplate(ctx);
  },
};

/** 若其他生成器失败，可回退到此函数 */
export function generateTemplateReading(ctx: ReadingContext): TarotReading {
  return generateFromTemplate(ctx);
}
