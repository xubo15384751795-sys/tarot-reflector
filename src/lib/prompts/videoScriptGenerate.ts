/**
 * 视频脚本生成 Prompt
 *
 * 把塔罗解读转成适合 60-90 秒自媒体视频的分镜脚本。
 */

import type { TarotReading } from "../schema";

export type VideoScriptInput = {
  reading: TarotReading;
  video_style?: string;
  target_duration?: number;
  aspect_ratio?: string;
};

export function buildVideoScriptPrompt(input: VideoScriptInput): {
  systemPrompt: string;
  userPrompt: string;
} {
  const reading = input.reading;
  const cardList = reading.cards
    .map(
      (c, i) =>
        `${i + 1}. ${c.zh_name}（${c.card_name}）· ${c.orientation === "upright" ? "正位" : "逆位"} — 牌阵位置：${c.position_name}`
    )
    .join("\n");

  const sceneText = reading.scenes
    .map(
      (s) =>
        `【${s.step_label}】${s.headline}\n${s.body}${s.insight ? `\n洞察：${s.insight}` : ""}`
    )
    .join("\n\n");

  return {
    systemPrompt: `你是中文塔罗短视频分镜脚本引擎。

你的任务是：把塔罗解读转成适合 ${input.target_duration ?? 75} 秒自媒体视频的分镜脚本。

你必须遵循的规则：
1. 所有文字必须中文。
2. 每幕旁白不超过 45 个中文字（适合 TTS 朗读）。
3. 每幕字幕不超过 24 个中文字（适合屏幕显示）。
4. 每幕必须有 visual_instruction（画面指令）。
5. 如果该幕解释牌面元素，必须提供 focus_motif。
6. 语气温柔、克制、有洞察，不要恐吓。
7. 不使用"命中注定""宇宙告诉你""一定发生"等禁用话术。
8. 结尾必须声明：这不是命运预测，而是一种象征性反思。
9. 视觉风格：${input.video_style ?? "月光档案馆"}（深色玻璃、暗金细线、真实牌面）。

视频结构要求：
0-5s：开场问题
5-12s：抽牌与翻牌
12-25s：牌面整体含义
25-45s：圈出 2-3 个关键元素
45-65s：映射到用户问题
65-80s：行动建议
80-90s：一句话总结 + 免责声明

输出格式：合法 JSON
{
  "title_zh": "视频标题（简洁有力，适合封面）",
  "video_style": "${input.video_style ?? "moonlight_archive"}",
  "total_duration": 75,
  "scenes": [
    {
      "scene_id": 1,
      "type": "opening",
      "duration": 5,
      "headline_zh": "大标题",
      "body_zh": "正文",
      "voiceover_zh": "旁白（自然口语，适合朗读）",
      "subtitle_zh": "字幕（更短，适合屏幕）",
      "active_card_id": "牌ID（如有）",
      "focus_motif": "motif_id（如有）",
      "annotation_label_zh": "注释文字（如有）",
      "visual": {
        "layout": "single_card",
        "camera": "slow_push_in",
        "transition": "fade",
        "background": "dark_glass"
      }
    }
  ],
  "cover": {
    "title_zh": "封面标题",
    "subtitle_zh": "封面副标题",
    "keywords_zh": ["关键词1", "关键词2"],
    "cover_card_id": "封面牌ID"
  }
}`,
    userPrompt: `解读标题：${reading.title}
牌阵：${reading.spread_name_zh}

抽到的牌：
${cardList}

解读内容：
${sceneText}

综合分析：
${reading.analysis?.relationship_notes?.join("；") ?? "无"}

请生成 ${input.target_duration ?? 75} 秒竖屏短视频分镜脚本。`,
  };
}
