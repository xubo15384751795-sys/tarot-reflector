/**
 * 把 API 响应 + 本地兜底上下文统一规范化成 ReadingScript。
 *
 * UI 层只应该消费 ReadingScript。决定走 API 还是本地兜底，由这里收口。
 */

import type { SpreadId } from "@/lib/schema";
import { mergeApiReading } from "./mergeApiReading";
import { buildLocalFallbackReading } from "./buildLocalFallbackReading";
import type {
  ApiReadingResponse,
  LocalCardMeaning,
  ReadingScript,
  SpreadSnapshot,
} from "../types/reading";

export type NormalizeReadingInput = {
  /** /api/reading/generate 的响应；null 表示请求失败/超时，走本地兜底 */
  api: ApiReadingResponse | null;
  draw: SpreadSnapshot;
  meanings: LocalCardMeaning[];
  spreadId: SpreadId;
  domain: string;
  /** 强制覆盖 spread_name_zh（如 daily 模式覆盖成 "单牌解读"）*/
  spreadNameOverride?: string;
};

export function normalizeReading(input: NormalizeReadingInput): ReadingScript {
  const { api, draw, meanings, spreadId, domain, spreadNameOverride } = input;

  const script = api
    ? mergeApiReading({ api, draw, spreadId, domain })
    : buildLocalFallbackReading({ draw, meanings, spreadId, domain });

  if (spreadNameOverride) {
    return { ...script, spread_name_zh: spreadNameOverride };
  }
  return script;
}
