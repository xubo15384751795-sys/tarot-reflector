/**
 * 解读微调 Prompt
 *
 * 根据用户反馈调整解读的特定部分。
 */

export type RefineInput = {
  reading_id: string;
  user_feedback: {
    selected_option?: string;
    free_text?: string;
  };
  current_reading_summary: string;
  target_section: string;
};

export function buildReadingRefinePrompt(input: RefineInput): {
  systemPrompt: string;
  userPrompt: string;
} {
  return {
    systemPrompt: `你是一个塔罗解读微调助手。

你的任务是：根据用户反馈，调整解读的特定部分。

你必须遵循的规则：
1. 不能改变原始牌义。牌是确定的，不能因为用户反馈就换牌义。
2. 不能做出比原始解读更强烈的预测。
3. 不能替对方内心下确定判断。
4. 所有输出必须是中文。
5. 保持温柔克制的语气。
6. 微调应该让用户感到被理解，而不是被纠正。

输出格式：合法 JSON
{
  "refined_summary_zh": "调整后的总结",
  "updated_final_advice_zh": ["调整后的建议1", "建议2", "建议3"],
  "closing_line_zh": "调整后的收尾语"
}`,
    userPrompt: `原始解读摘要：${input.current_reading_summary}
用户反馈：${input.user_feedback.free_text ?? input.user_feedback.selected_option ?? "无"}
目标调整部分：${input.target_section}

请根据反馈微调解读。`,
  };
}
