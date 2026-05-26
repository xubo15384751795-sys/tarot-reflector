/**
 * AI 输出校验守卫
 *
 * 校验 AI 生成的解读 JSON 是否符合塔罗规则。
 * 与原有的 rulesGuard.ts 分工：
 * - rulesGuard.ts: 校验旧版 TarotReading 结构
 * - aiReadingGuard.ts: 校验新版 AI 生成的结构化解读
 */

import ethicsData from "@/data/tarot_rules/ethics.json";

export type AiGuardViolation = {
  code: string;
  severity: "error" | "warning";
  field?: string;
  detail: string;
};

export type AiGuardReport = {
  ok: boolean;
  violations: AiGuardViolation[];
  errors: AiGuardViolation[];
};

// ─── 工具 ───

const CJK_RE = /[一-鿿]/g;

function cjkRatio(text: string): number {
  if (!text) return 0;
  const matches = text.match(CJK_RE);
  if (!matches) return 0;
  const nonWhitespace = text.replace(/\s+/g, "");
  if (nonWhitespace.length === 0) return 0;
  return matches.length / nonWhitespace.length;
}

function findBanned(text: string): string | null {
  const lower = text.toLowerCase();
  for (const banned of ethicsData.forbidden_phrases) {
    if (lower.includes(banned.toLowerCase())) return banned;
  }
  return null;
}

function pushError(out: AiGuardViolation[], code: string, detail: string, field?: string) {
  out.push({ code, severity: "error", detail, field });
}
function pushWarning(out: AiGuardViolation[], code: string, detail: string, field?: string) {
  out.push({ code, severity: "warning", detail, field });
}

// ─── 校验函数 ───

function checkRequiredFields(data: Record<string, unknown>, out: AiGuardViolation[]) {
  const required = ["title_zh", "opening_zh", "position_readings", "final_advice_zh", "closing_line_zh", "disclaimer_zh"];
  for (const field of required) {
    if (!data[field]) {
      pushError(out, "field.missing", `缺少必要字段: ${field}`, field);
    }
  }
}

function checkChineseLanguage(data: Record<string, unknown>, out: AiGuardViolation[]) {
  const textFields = ["title_zh", "opening_zh", "closing_line_zh"];
  for (const field of textFields) {
    const val = data[field];
    if (typeof val !== "string" || val.length < 4) continue;
    const ratio = cjkRatio(val);
    if (ratio < 0.4) {
      pushError(out, "language.not_chinese", `字段 ${field} CJK 占比 ${(ratio * 100).toFixed(0)}% < 40%`, field);
    }
  }

  // Check position_readings body
  const readings = data.position_readings;
  if (Array.isArray(readings)) {
    readings.forEach((r: Record<string, unknown>, i: number) => {
      const body = r.body_zh;
      if (typeof body === "string" && body.length > 8) {
        const ratio = cjkRatio(body);
        if (ratio < 0.4) {
          pushError(out, "language.not_chinese", `position_readings[${i}].body_zh CJK 占比 ${(ratio * 100).toFixed(0)}%`, `position_readings[${i}].body_zh`);
        }
      }
    });
  }
}

function checkBannedPhrases(data: Record<string, unknown>, out: AiGuardViolation[]) {
  const collectText = (obj: Record<string, unknown>, prefix: string): Array<{ text: string; field: string }> => {
    const items: Array<{ text: string; field: string }> = [];
    for (const [key, val] of Object.entries(obj)) {
      if (typeof val === "string") {
        items.push({ text: val, field: `${prefix}.${key}` });
      } else if (Array.isArray(val)) {
        val.forEach((item, i) => {
          if (typeof item === "string") {
            items.push({ text: item, field: `${prefix}.${key}[${i}]` });
          } else if (typeof item === "object" && item !== null) {
            items.push(...collectText(item as Record<string, unknown>, `${prefix}.${key}[${i}]`));
          }
        });
      } else if (typeof val === "object" && val !== null) {
        items.push(...collectText(val as Record<string, unknown>, `${prefix}.${key}`));
      }
    }
    return items;
  };

  const texts = collectText(data, "root");
  for (const { text, field } of texts) {
    if (!text || text.length < 4) continue;
    const hit = findBanned(text);
    if (hit) {
      pushError(out, "phrase.banned", `字段 ${field} 包含禁用话术「${hit}」`, field);
    }
  }
}

function checkPredictionPatterns(data: Record<string, unknown>, out: AiGuardViolation[]) {
  const predictRe = /(你将会|你一定会|你一定能|你必将|必将|未来一定|未来必将|未来必然|你注定|肯定能|一定会发生|一定会成功|一定会失败)/;
  const collectText = (obj: Record<string, unknown>, prefix: string): Array<{ text: string; field: string }> => {
    const items: Array<{ text: string; field: string }> = [];
    for (const [key, val] of Object.entries(obj)) {
      if (typeof val === "string") items.push({ text: val, field: `${prefix}.${key}` });
      else if (Array.isArray(val)) val.forEach((item, i) => {
        if (typeof item === "string") items.push({ text: item, field: `${prefix}.${key}[${i}]` });
        else if (typeof item === "object" && item !== null) items.push(...collectText(item as Record<string, unknown>, `${prefix}.${key}[${i}]`));
      });
      else if (typeof val === "object" && val !== null) items.push(...collectText(val as Record<string, unknown>, `${prefix}.${key}`));
    }
    return items;
  };

  for (const { text, field } of collectText(data, "root")) {
    if (!text || text.length < 4) continue;
    const match = text.match(predictRe);
    if (match) {
      pushError(out, "phrase.prediction", `字段 ${field} 含断言式预测语「${match[0]}」`, field);
    }
  }
}

function checkPositionReadings(data: Record<string, unknown>, out: AiGuardViolation[]) {
  const readings = data.position_readings;
  if (!Array.isArray(readings) || readings.length === 0) {
    pushError(out, "structure.no_position_readings", "缺少 position_readings 数组");
    return;
  }

  readings.forEach((r: Record<string, unknown>, i: number) => {
    if (!r.position_index) pushError(out, "position.missing_index", `position_readings[${i}] 缺少 position_index`, `position_readings[${i}]`);
    if (!r.position_name_zh) pushWarning(out, "position.missing_name", `position_readings[${i}] 缺少 position_name_zh`, `position_readings[${i}]`);
    if (!r.headline_zh) pushWarning(out, "position.missing_headline", `position_readings[${i}] 缺少 headline_zh`, `position_readings[${i}]`);
    if (!r.body_zh) pushError(out, "position.missing_body", `position_readings[${i}] 缺少 body_zh`, `position_readings[${i}]`);
  });
}

function checkMultiCardRelationship(data: Record<string, unknown>, drawnCardCount: number, out: AiGuardViolation[]) {
  if (drawnCardCount <= 1) return;

  const analysis = data.relationship_analysis;
  if (!analysis || typeof analysis !== "object") {
    pushError(out, "analysis.missing_relationship", "多牌阵缺少 relationship_analysis");
    return;
  }

  const a = analysis as Record<string, unknown>;
  if (!a.narrative_flow_zh) pushError(out, "analysis.missing_narrative", "多牌阵缺少叙事流动分析 narrative_flow_zh");
  if (!a.action_focus_zh) pushWarning(out, "analysis.missing_action", "多牌阵缺少行动焦点 action_focus_zh");
}

function checkLoveDomainProtection(data: Record<string, unknown>, domain: string, out: AiGuardViolation[]) {
  if (domain !== "love") return;

  // 检查是否替对方内心下确定判断
  const otherJudgmentRe = /(他一定|她一定|他肯定|她肯定|他心里|她心里|他真正|她真正|他其实|她其实)/;
  const collectText = (obj: Record<string, unknown>, prefix: string): Array<{ text: string; field: string }> => {
    const items: Array<{ text: string; field: string }> = [];
    for (const [key, val] of Object.entries(obj)) {
      if (typeof val === "string") items.push({ text: val, field: `${prefix}.${key}` });
      else if (Array.isArray(val)) val.forEach((item, i) => {
        if (typeof item === "string") items.push({ text: item, field: `${prefix}.${key}[${i}]` });
        else if (typeof item === "object" && item !== null) items.push(...collectText(item as Record<string, unknown>, `${prefix}.${key}[${i}]`));
      });
      else if (typeof val === "object" && val !== null) items.push(...collectText(val as Record<string, unknown>, `${prefix}.${key}`));
    }
    return items;
  };

  for (const { text, field } of collectText(data, "root")) {
    if (!text) continue;
    const match = text.match(otherJudgmentRe);
    if (match) {
      pushError(out, "love替对方判断", `感情问题中替对方内心做确定判断「${match[0]}」`, field);
    }
  }
}

// ─── 主入口 ───

export function validateAiReading(
  data: Record<string, unknown>,
  context: {
    drawnCardCount: number;
    domain: string;
  }
): AiGuardReport {
  const violations: AiGuardViolation[] = [];

  checkRequiredFields(data, violations);
  checkChineseLanguage(data, violations);
  checkBannedPhrases(data, violations);
  checkPredictionPatterns(data, violations);
  checkPositionReadings(data, violations);
  checkMultiCardRelationship(data, context.drawnCardCount, violations);
  checkLoveDomainProtection(data, context.domain, violations);

  const errors = violations.filter((v) => v.severity === "error");
  return { ok: errors.length === 0, violations, errors };
}

/**
 * 带重试的 AI 生成包装
 */
export async function generateWithAiGuard<T extends Record<string, unknown>>(
  generate: () => Promise<T>,
  context: { drawnCardCount: number; domain: string },
  options: {
    maxAttempts?: number;
    onRetry?: (violations: AiGuardViolation[]) => Promise<T>;
  } = {}
): Promise<{ result: T; attempts: number; report: AiGuardReport }> {
  const maxAttempts = Math.max(1, options.maxAttempts ?? 3);
  let last: T | null = null;
  let lastReport: AiGuardReport | null = null;

  for (let i = 0; i < maxAttempts; i++) {
    last = i === 0 || !options.onRetry
      ? await generate()
      : await options.onRetry(lastReport?.errors ?? []);

    lastReport = validateAiReading(last as Record<string, unknown>, context);

    if (lastReport.ok) {
      return { result: last, attempts: i + 1, report: lastReport };
    }
  }

  throw new Error(
    `AI 生成连续 ${maxAttempts} 次校验失败: ${lastReport?.errors.map((e) => e.code).join(", ")}`
  );
}
