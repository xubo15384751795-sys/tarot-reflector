/**
 * 全局常量与配置入口
 *
 * 领域列表、默认文案、解读引擎开关等集中在此，便于接手者修改。
 */

import type { Domain } from "./schema";

/** 前端领域选择器 + 后端校验共用 */
export const DOMAINS: { value: Domain; label: string }[] = [
  { value: "love", label: "感情" },
  { value: "career", label: "工作" },
  { value: "project", label: "项目" },
  { value: "study", label: "学习" },
  { value: "self", label: "自我" },
  { value: "money", label: "财务" },
];

export const DOMAIN_LABELS: Record<Domain, string> = Object.fromEntries(
  DOMAINS.map((d) => [d.value, d.label])
) as Record<Domain, string>;

export const VALID_DOMAINS: Domain[] = DOMAINS.map((d) => d.value);

export const DEFAULT_DOMAIN: Domain = "self";

/** 解读页底部固定免责声明 */
export const APP_DISCLAIMER = "每张牌是一页古老图像档案，不是命运判决。";

/**
 * 解读引擎类型（通过环境变量 READING_PROVIDER 切换）
 *
 * - template：本地模板（默认，无需 API Key）
 * - ai：LLM 生成（需在 aiGenerator 中实现，见 docs/讲解.md）
 */
export type ReadingProvider = "template" | "ai";

export const READING_PROVIDER_ENV = "READING_PROVIDER";

/** OpenAI 兼容接口的环境变量名（接 AI 时使用，见 .env.example） */
export const LLM_ENV = {
  API_KEY: "LLM_API_KEY",
  BASE_URL: "LLM_BASE_URL",
  MODEL: "LLM_MODEL",
} as const;
