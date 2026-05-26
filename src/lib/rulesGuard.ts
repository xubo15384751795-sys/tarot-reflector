/**
 * 阈牌项目运行时规则守卫。
 *
 * 该文件是 tarot_rules.md 的代码化版本：每条规则对应一个或多个检查项。
 * 任何解读结果在交付前端之前都必须经过 `validateAgainstRules()`；
 * 凡是返回 `ok: false` 的，调用方都必须重试 / 重写 / 退回 fallback，
 * 不允许直接渲染给用户。
 *
 * 设计原则：
 *   1. 守卫只做"是否合规"判定，不修改原文（重写交给调用方决定）。
 *   2. 违规分两级：`error` 必须阻断；`warning` 记录但允许通过。
 *   3. 守卫不读取外部 IO，方便在任何环境跑（包括 edge runtime）。
 */

import type { TarotReading } from "./schema";
import {
  ALL_CARD_IDS,
  BANNED_SUBSTRINGS,
  DISCLAIMER_KEYWORDS,
  FIELD_LIMITS,
  STEP_LABELS,
} from "./rulesGuard.shared";

export type Severity = "error" | "warning";

export type Violation = {
  code: string;
  severity: Severity;
  field?: string;
  detail: string;
};

export type GuardReport = {
  ok: boolean;
  violations: Violation[];
  /** 仅 error 级别的违规（调用方用来判断是否需要重试） */
  errors: Violation[];
};

/** 自定义错误类型：所有重试用光仍违规时抛出。 */
export class ReadingRulesViolationError extends Error {
  readonly violations: Violation[];
  constructor(message: string, violations: Violation[]) {
    super(message);
    this.name = "ReadingRulesViolationError";
    this.violations = violations;
  }
}

// ----- 工具 -----

const CJK_RE = /[一-鿿]/g;

function cjkRatio(text: string): number {
  if (!text) return 0;
  const matches = text.match(CJK_RE);
  if (!matches) return 0;
  // 仅按字符数估算；空格、标点不算入分母（避免对中英混排过严）。
  const nonWhitespace = text.replace(/\s+/g, "");
  if (nonWhitespace.length === 0) return 0;
  return matches.length / nonWhitespace.length;
}

function chineseLength(text: string): number {
  // 中文字数（粗略）：去掉 ASCII 标点 + 空格后的长度。
  return text.replace(/\s+/g, "").length;
}

/** 在文本里查找首个出现的禁用子串；找不到返回 null。
 *  大小写不敏感（对 "Ta"/"ta"/"TA" 这类英文字符部分有用，中文本身无大小写）。 */
function findBanned(text: string): string | null {
  const lower = text.toLowerCase();
  for (const banned of BANNED_SUBSTRINGS) {
    if (lower.includes(banned.toLowerCase())) return banned;
  }
  return null;
}

function pushError(out: Violation[], code: string, detail: string, field?: string) {
  out.push({ code, severity: "error", detail, field });
}
function pushWarning(out: Violation[], code: string, detail: string, field?: string) {
  out.push({ code, severity: "warning", detail, field });
}

// ----- 单项检查 -----

function checkCardScope(reading: TarotReading, out: Violation[]) {
  // 支持完整 78 张牌（大阿尔卡那 + 小阿尔卡那）
  if (!ALL_CARD_IDS.has(reading.card_id)) {
    pushError(
      out,
      "card.unknown_id",
      `card_id="${reading.card_id}" 不在 78 张牌组中`,
      "card_id"
    );
  }
}

function checkOrientation(reading: TarotReading, out: Violation[]) {
  if (reading.orientation !== "upright" && reading.orientation !== "reversed") {
    pushError(
      out,
      "card.orientation_invalid",
      `orientation 必须是 upright 或 reversed，但收到 "${reading.orientation}"`,
      "orientation"
    );
  }
}

function checkSceneCount(reading: TarotReading, out: Violation[]) {
  const sceneCount = reading.scenes.length;
  const cardCount = reading.cards?.length ?? 1;

  // 多牌阵：最少 card_count + 3（opening + relationship + synthesis + closing）
  // 单牌：最少 3（opening + card_analysis + closing）
  const minScenes = cardCount > 1 ? cardCount + 3 : 3;
  const maxScenes = cardCount > 1 ? cardCount + 8 : 10;

  if (sceneCount < minScenes || sceneCount > maxScenes) {
    pushWarning(
      out,
      "scene.count_unusual",
      `牌阵 ${cardCount} 张牌，场景数 ${sceneCount} 不在预期范围 ${minScenes}-${maxScenes} 内`,
      "scenes"
    );
  }
}

function checkStepLabelOrder(reading: TarotReading, out: Violation[]) {
  const cardCount = reading.cards?.length ?? 1;

  // 多牌阵：跳过严格的 step_label 检查，只检查第一幕（opening）和最后一幕（closing）
  if (cardCount > 1) {
    const firstScene = reading.scenes[0];
    const lastScene = reading.scenes[reading.scenes.length - 1];
    if (firstScene && firstScene.type !== "opening") {
      pushWarning(
        out,
        "scene.first_not_opening",
        `多牌阵第一幕类型应为 opening，实际为 ${firstScene.type}`,
        "scenes[0]"
      );
    }
    if (lastScene && lastScene.type !== "closing") {
      pushWarning(
        out,
        "scene.last_not_closing",
        `多牌阵最后一幕类型应为 closing，实际为 ${lastScene.type}`,
        `scenes[${reading.scenes.length - 1}]`
      );
    }
    return;
  }

  // 单牌：检查 step_label 顺序
  reading.scenes.forEach((scene, i) => {
    const expected = STEP_LABELS[i];
    if (expected && scene.step_label !== expected) {
      pushWarning(
        out,
        "scene.step_label_mismatch",
        `第 ${i + 1} 幕 step_label 应为 "${expected}"，实际 "${scene.step_label}"`,
        `scenes[${i}].step_label`
      );
    }
  });
}

function checkMotifBinding(reading: TarotReading, out: Violation[]) {
  // 多牌阵下，reading.motifs（顶层）只是 theme card 的 motifs（向后兼容字段）。
  // 真正的 motif 集合应该是所有 reading.cards[i].motifs 的并集——否则非 theme
  // 位置的 focus_motif 永远 unknown，模板路径稳定爆 ReadingRulesViolationError。
  const motifIds = new Set<string>();
  reading.motifs.forEach((m) => motifIds.add(m.id));
  if (reading.cards && reading.cards.length > 0) {
    reading.cards.forEach((c) => c.motifs?.forEach((m) => motifIds.add(m.id)));
  }

  reading.scenes.forEach((scene, i) => {
    if (scene.type === "card_analysis") {
      if (!scene.focus_motif) {
        pushError(
          out,
          "scene.motif_focus_missing",
          `第 ${i + 1} 幕（motif_focus）必须绑定 focus_motif`,
          `scenes[${i}].focus_motif`
        );
        return;
      }
      if (!motifIds.has(scene.focus_motif)) {
        pushError(
          out,
          "scene.motif_focus_unknown",
          `第 ${i + 1} 幕 focus_motif="${scene.focus_motif}" 不在牌阵任何一张牌的 motifs[] 中`,
          `scenes[${i}].focus_motif`
        );
      }
    }
  });
}

function checkLengths(reading: TarotReading, out: Violation[]) {
  reading.scenes.forEach((scene, i) => {
    const tag = `scenes[${i}]`;
    if (chineseLength(scene.headline) > FIELD_LIMITS.headline) {
      pushWarning(
        out,
        "length.headline",
        `第 ${i + 1} 幕 headline 超过 ${FIELD_LIMITS.headline} 字`,
        `${tag}.headline`
      );
    }
    if (scene.subtitle && chineseLength(scene.subtitle) > FIELD_LIMITS.subtitle) {
      pushWarning(
        out,
        "length.subtitle",
        `第 ${i + 1} 幕 subtitle 超过 ${FIELD_LIMITS.subtitle} 字`,
        `${tag}.subtitle`
      );
    }
    if (scene.insight && chineseLength(scene.insight) > FIELD_LIMITS.insight) {
      pushWarning(
        out,
        "length.insight",
        `第 ${i + 1} 幕 insight 超过 ${FIELD_LIMITS.insight} 字`,
        `${tag}.insight`
      );
    }
    const paragraphs = scene.body.split(/\n\n+/);
    if (paragraphs.length > FIELD_LIMITS.bodyParagraphs) {
      pushWarning(
        out,
        "length.body_paragraphs",
        `第 ${i + 1} 幕 body 段数 ${paragraphs.length} 超过 ${FIELD_LIMITS.bodyParagraphs}`,
        `${tag}.body`
      );
    }
    paragraphs.forEach((p, j) => {
      if (chineseLength(p) > FIELD_LIMITS.bodyPerParagraph) {
        pushWarning(
          out,
          "length.body_paragraph",
          `第 ${i + 1} 幕 body 段 ${j + 1} 超过 ${FIELD_LIMITS.bodyPerParagraph} 字`,
          `${tag}.body`
        );
      }
    });
    if (scene.connection && chineseLength(scene.connection) > FIELD_LIMITS.connection) {
      pushWarning(
        out,
        "length.connection",
        `第 ${i + 1} 幕 connection 超过 ${FIELD_LIMITS.connection} 字`,
        `${tag}.connection`
      );
    }
  });
}

/** 收集一次解读中所有"用户可见"的中文文本，便于做禁用词扫描 / CJK 占比检查。 */
function collectUserFacingText(reading: TarotReading): Array<{ text: string; field: string }> {
  const items: Array<{ text: string; field: string }> = [];
  items.push({ text: reading.title, field: "title" });
  items.push({ text: reading.thesis, field: "thesis" });
  items.push({ text: reading.closing_line, field: "closing_line" });
  items.push({ text: reading.disclaimer, field: "disclaimer" });
  reading.scenes.forEach((s, i) => {
    items.push({ text: s.headline ?? "", field: `scenes[${i}].headline` });
    if (s.subtitle) items.push({ text: s.subtitle, field: `scenes[${i}].subtitle` });
    if (s.insight) items.push({ text: s.insight, field: `scenes[${i}].insight` });
    items.push({ text: s.body ?? "", field: `scenes[${i}].body` });
    if (s.connection) items.push({ text: s.connection, field: `scenes[${i}].connection` });
  });
  return items;
}

function checkBannedPhrases(reading: TarotReading, out: Violation[]) {
  const texts = collectUserFacingText(reading);
  for (const { text, field } of texts) {
    if (!text) continue;
    const hit = findBanned(text);
    if (hit) {
      pushError(
        out,
        "phrase.banned",
        `字段 ${field} 出现禁用话术 "${hit}"（见 tarot_rules.md §5.2）`,
        field
      );
    }
  }
}

function checkChineseLanguage(reading: TarotReading, out: Violation[]) {
  // 仅对长度足够的字段检查 CJK 占比，避免把"XVI"这种短串误判。
  const fields: Array<{ text: string; field: string }> = [
    { text: reading.thesis, field: "thesis" },
    ...reading.scenes.flatMap((s, i) => [
      { text: s.body, field: `scenes[${i}].body` },
      { text: s.insight ?? "", field: `scenes[${i}].insight` },
    ]),
  ];
  for (const { text, field } of fields) {
    if (!text || chineseLength(text) < 8) continue;
    const ratio = cjkRatio(text);
    if (ratio < 0.4) {
      pushError(
        out,
        "language.not_chinese",
        `字段 ${field} CJK 占比 ${(ratio * 100).toFixed(0)}% < 40%，违反 §5.1`,
        field
      );
    }
  }
}

function checkPredictionPatterns(reading: TarotReading, out: Violation[]) {
  // §5.4 第 1 条：禁止断言式预测句式
  // 这里用启发式正则，捕捉"你将会 / 你一定会 / 一定能 / 未来一定 / 必将 ..."等表达。
  const predictRe = /(你将会|你一定会|你一定能|你必将|必将|未来一定|未来必将|未来必然|你注定|肯定能)/;
  collectUserFacingText(reading).forEach(({ text, field }) => {
    if (!text) return;
    const match = text.match(predictRe);
    if (match) {
      pushError(
        out,
        "phrase.prediction",
        `字段 ${field} 含断言式预测语 "${match[0]}"（违反 §5.4 第 1 条）`,
        field
      );
    }
  });
}

function checkActionableAdvice(reading: TarotReading, out: Violation[]) {
  // §5.4 第 3 条：建议（closing）必须包含至少一条可执行动作
  const closing = reading.scenes.find((s) => s.type === "closing");
  if (!closing) {
    // 多牌阵可能没有明确的 closing scene，跳过检查
    const cardCount = reading.cards?.length ?? 1;
    if (cardCount > 1) return;
    pushWarning(
      out,
      "advice.no_closing_scene",
      "未找到 closing 类型的场景",
      "scenes"
    );
    return;
  }
  const body = closing.body ?? "";
  // 可执行的启发式：
  //   - 出现项目符号 "·" / 数字编号 / 短句中带动词
  //   - 至少 6 个中文字
  const hasBullet = /·|•|、\s|\d\./.test(body);
  const hasActionVerb = /(写下|尝试|留出|留意|做一件|开始|放下|清理|联系|问自己|列出|拆解|预约|安排|停一下|暂停)/.test(body);
  if (!hasBullet && !hasActionVerb) {
    pushWarning(
      out,
      "advice.not_actionable",
      "建议幕（closing）缺少可执行动作；至少应包含 1 条可立即开始做的小步骤",
      "scenes[closing].body"
    );
  }
}

function checkDisclaimer(reading: TarotReading, out: Violation[]) {
  const d = reading.disclaimer ?? "";
  const hasAny = DISCLAIMER_KEYWORDS.some((k) => d.includes(k));
  if (!hasAny) {
    pushWarning(
      out,
      "disclaimer.missing_keywords",
      `disclaimer 字段未包含「${DISCLAIMER_KEYWORDS.join("/")}」之一，调用方应补齐为默认值`,
      "disclaimer"
    );
  }
}

// ----- 主入口 -----

/**
 * 校验一次完整解读是否符合 tarot_rules.md。
 * 不会修改入参；只返回违规列表。
 */
export function validateAgainstRules(reading: TarotReading): GuardReport {
  const violations: Violation[] = [];

  checkCardScope(reading, violations);
  checkOrientation(reading, violations);
  checkSceneCount(reading, violations);
  checkStepLabelOrder(reading, violations);
  checkMotifBinding(reading, violations);
  checkLengths(reading, violations);
  checkBannedPhrases(reading, violations);
  checkPredictionPatterns(reading, violations);
  checkChineseLanguage(reading, violations);
  checkActionableAdvice(reading, violations);
  checkDisclaimer(reading, violations);

  const errors = violations.filter((v) => v.severity === "error");
  return { ok: errors.length === 0, violations, errors };
}

/**
 * 异步重试包装：
 *   - 调用 `generate()` 拿一次候选；
 *   - 跑 `validateAgainstRules()`；
 *   - 若 errors 非空，调用 `onRetry(violations)` 拿到下一次的候选；
 *   - 最多 `maxAttempts` 次（默认 3）；都失败抛 ReadingRulesViolationError。
 *
 * 对 LLM 引擎：`onRetry` 把违规列表注入 prompt 让模型修正。
 * 对模板引擎：`onRetry` 通常 = `generate`（再抽一次），或直接抛错。
 */
export async function generateWithRulesRetry(
  generate: () => Promise<TarotReading>,
  options: {
    maxAttempts?: number;
    onRetry?: (violations: Violation[], attemptIndex: number) => Promise<TarotReading>;
    onAttempt?: (report: GuardReport, attemptIndex: number) => void;
  } = {}
): Promise<{ reading: TarotReading; attempts: number; finalReport: GuardReport }> {
  const maxAttempts = Math.max(1, options.maxAttempts ?? 3);

  let last: TarotReading | null = null;
  let lastReport: GuardReport | null = null;

  for (let i = 0; i < maxAttempts; i++) {
    last =
      i === 0 || !options.onRetry
        ? await generate()
        : await options.onRetry(lastReport?.errors ?? [], i);

    lastReport = validateAgainstRules(last);
    options.onAttempt?.(lastReport, i);

    if (lastReport.ok) {
      return { reading: last, attempts: i + 1, finalReport: lastReport };
    }
  }

  throw new ReadingRulesViolationError(
    `解读连续 ${maxAttempts} 次违规，已放弃。`,
    lastReport?.violations ?? []
  );
}
