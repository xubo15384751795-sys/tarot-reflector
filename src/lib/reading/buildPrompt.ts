/**
 * 拼装一次 LLM 解读请求的 prompt。
 *
 * 结构：
 *   [tarotRulesPrompt.buildRulesInjection()]   ← 强制注入，来自 tarot_rules.md
 *   [prompts/dynamic_reading_prompt.txt]       ← 任务模板（带占位符）
 *   [可选：buildRetryInstruction(violations)]  ← 上次违规时追加
 */

import fs from "fs";
import path from "path";
import {
  buildRetryInstruction,
  buildRulesInjection,
} from "../tarotRulesPrompt";
import type { Violation } from "../rulesGuard";
import type { ReadingContext } from "./types";

const PROMPT_FILE = "prompts/dynamic_reading_prompt.txt";

let cachedTemplate: string | null = null;

function loadTemplate(): string {
  if (cachedTemplate) return cachedTemplate;
  const filePath = path.join(process.cwd(), PROMPT_FILE);
  cachedTemplate = fs.readFileSync(filePath, "utf-8");
  return cachedTemplate;
}

/** 供测试或热更新时清缓存 */
export function clearPromptCache(): void {
  cachedTemplate = null;
}

function fillTemplate(template: string, ctx: ReadingContext): string {
  const { input } = ctx;
  const card = ctx.card!;
  const replacements: Record<string, string> = {
    question: input.question,
    domain: input.domain,
    context: input.context ?? "",
    card_name: card.card_name,
    zh_name: card.zh_name,
    orientation: card.orientation,
    core_symbols: card.core_symbols.join("、"),
    domain_meaning: card.domain_meaning,
    risk: card.risk.join("、"),
    advice: card.advice.join("、"),
    visual_motifs: card.visual_motifs.join("、"),
  };
  return Object.entries(replacements).reduce(
    (text, [key, value]) => text.replaceAll(`{{${key}}}`, value),
    template
  );
}

/**
 * 首次生成时用的完整 prompt = 规则注入 + 模板。
 * 守卫层（rulesGuard.ts）的所有硬性条款都在这里强制传给模型。
 */
export function buildDynamicReadingPrompt(ctx: ReadingContext): string {
  const rules = buildRulesInjection();
  const task = fillTemplate(loadTemplate(), ctx);
  return `${rules}\n\n${task}`;
}

/**
 * 重试时用的 prompt = 首次 prompt + 违规反馈。
 * 由 aiGenerator 在校验失败后调用。
 */
export function buildRetryPrompt(
  ctx: ReadingContext,
  violations: Violation[]
): string {
  return `${buildDynamicReadingPrompt(ctx)}\n\n${buildRetryInstruction(violations)}`;
}
