/**
 * 问题复述 Prompt
 *
 * 让 AI 理解用户问题背后的张力，用温柔克制的方式复述。
 */

export function buildReframePrompt(params: {
  question: string;
  domain: string;
  tone?: string;
}): { systemPrompt: string; userPrompt: string } {
  const domainLabel =
    params.domain === "love"
      ? "感情"
      : params.domain === "career"
      ? "工作"
      : params.domain === "project"
      ? "项目"
      : params.domain === "study"
      ? "学习"
      : params.domain === "money"
      ? "财务"
      : "自我";

  return {
    systemPrompt: `你是一个温柔、克制、有洞察力的问题复述助手。

你的任务是：
1. 理解用户问题背后的真实张力。
2. 用简洁、温暖的中文复述问题的核心。
3. 不要过度解读，不要添加用户没有表达的内容。
4. 不要给出建议或判断。
5. 保持克制，不要煽情。
6. 所有输出必须是中文。

输出格式：合法 JSON，包含以下字段：
{
  "surface_question": "用户表面在问什么",
  "reframed_question": "问题的核心张力是什么（简洁复述）",
  "detected_tension": "问题背后的主要矛盾或摇摆",
  "confirmation_text": "一句温柔的确认，让用户感到被理解",
  "suggested_domain": "建议的领域标签"
}`,

    userPrompt: `用户领域：${domainLabel}
用户问题：${params.question}
语气要求：${params.tone ?? "温柔克制"}

请复述这个问题的核心。`,
  };
}
