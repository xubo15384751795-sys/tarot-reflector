import type { Domain, QuestionReframe } from "../schema";

const DOMAIN_REFRAMES: Record<
  Domain,
  { tensionPattern: string; reframePattern: string }
> = {
  love: {
    // 不预设"在挣扎"——允许欣喜 / 想确认 / 想看清都是合理动机
    tensionPattern: "你在问一段关系，背后可能是想被看见，也可能是想看清。",
    reframePattern: "这段关系里，此刻你最想被看见的部分是什么？",
  },
  career: {
    tensionPattern: "你在思考职业方向的选择，但问题的背后可能是对不确定性的焦虑。",
    reframePattern: "如果排除他人的期待和社会的标准，你自己真正想往哪个方向走？",
  },
  study: {
    tensionPattern: "你在关注学习或考试的结果，但问题的背后可能是对自我价值的拷问。",
    reframePattern: "学习的过程本身正在如何改变你？除了结果，这段经历带给你什么？",
  },
  project: {
    tensionPattern: "你在担心项目的进展或结果，但问题的背后可能是对控制的渴望。",
    reframePattern: "在当前的项目中，哪些因素是你真正可以影响的，哪些需要交给过程？",
  },
  money: {
    tensionPattern: "你在忧虑财务问题，但问题的背后可能是对安全感的深层需求。",
    reframePattern: "你与金钱的关系是什么样的？除了数字增长，财富对你意味着什么？",
  },
  self: {
    tensionPattern: "你在向内探寻，但问题的措辞可能仍在寻求外部的确认。",
    reframePattern: "如果抛开所有的'应该'和'必须'，此刻你内心最真实的声音是什么？",
  },
};

export function reframeQuestion(
  question: string,
  domain: Domain,
): QuestionReframe {
  const tpl = DOMAIN_REFRAMES[domain] ?? DOMAIN_REFRAMES.self;
  return {
    original: question,
    tension: tpl.tensionPattern,
    reframed: tpl.reframePattern,
  };
}
