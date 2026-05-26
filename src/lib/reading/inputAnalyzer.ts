/**
 * 输入分析器 — 把用户的 question 拆成可以驱动模板深度的信号
 *
 * 三种信号：
 *   1. richness   — 长度档（minimal | brief | moderate | rich | detailed），
 *                   决定 scene 数量和单 scene 段落长度
 *   2. keywords   — 抽出的语义锚点（人称、时间、地点、动词、引用片段），
 *                   scene body 里回插这些词，让解读像"读过你的问题"
 *   3. emotion    — 情绪信号词典命中（焦虑 / 期待 / 迷茫 / ...），
 *                   决定 closing 是否补 grounding 语 + thesis 措辞调子
 *
 * 全部纯函数 + 字典，无外部依赖。
 */

export type Richness = "minimal" | "brief" | "moderate" | "rich" | "detailed";

export type EmotionTone =
  | "anxious" // 焦虑、紧张、害怕
  | "stuck" // 迷茫、卡住、犹豫
  | "hopeful" // 期待、向往
  | "hurt" // 难过、受伤、孤独
  | "angry" // 愤怒、不平
  | "calm" // 平静、释然
  | "neutral";

export type InputSignals = {
  /** 字符数（已 trim） */
  length: number;
  richness: Richness;
  /** 推荐的 motif scene 数（不超过实际 motif 数量） */
  recommendedSceneCount: number;
  /** 推荐的单 scene body 字符数上限 */
  recommendedBodyChars: number;
  /** 抽出的关键短语，按优先级排序，scene body 里可以回插 */
  keywords: string[];
  /** 检测到的人称（你/他/她/我们/某人 等） */
  pronouns: string[];
  /** 检测到的时间词（昨天 / 三个月 / 这周 / 明年 等） */
  timeWords: string[];
  /** 引用的具体语句（"他说..." 之类） */
  quotedSegment: string | null;
  emotions: EmotionTone[];
  primaryEmotion: EmotionTone;
  /** 是否检测到自我怀疑（"是不是我..."、"我做错了吗"），影响安抚句强度 */
  selfDoubt: boolean;
  /**
   * 危机信号（自杀 / 自残 / 严重绝望）。命中时调用方应跳过常规解读流程，
   * 改为渲染 SafetyExit 页（含真实热线）。
   * 我们的塔罗工具不能也不应该处理这一层痛苦——把人引向能真正陪伴的资源。
   */
  crisis: boolean;
  /** 命中的危机关键词（用于在 SafetyExit 页温和回引，不公开展示）*/
  crisisHits: string[];
};

// ── 情绪词典 ──
// 每个调子对应一组触发词；命中即归类。
const EMOTION_LEXICON: Record<Exclude<EmotionTone, "neutral">, string[]> = {
  anxious: [
    "焦虑", "紧张", "害怕", "恐惧", "担心", "不安", "压力", "崩溃", "慌",
    "怕", "睡不着", "心慌", "喘不过气", "睡不好", "胸闷",
  ],
  stuck: [
    "迷茫", "卡住", "犹豫", "纠结", "不知道", "无所适从", "矛盾", "拉扯",
    "动不了", "原地", "走不出", "选不出", "想不通", "拎不清",
  ],
  hopeful: [
    "期待", "希望", "向往", "想要", "渴望", "梦想", "盼望", "想做",
    "想试", "想试试", "应该可以", "想去",
  ],
  hurt: [
    "难过", "难受", "伤心", "受伤", "孤独", "委屈", "失望", "心碎",
    "想哭", "哭", "崩溃", "撑不住",
  ],
  angry: [
    "愤怒", "生气", "气", "不爽", "不平", "凭什么", "恶心", "讨厌",
    "受不了", "烦", "怒",
  ],
  calm: [
    "平静", "释然", "放下", "想开", "想通", "接受", "明白", "OK",
    "还好", "也行",
  ],
};

const PRONOUN_PATTERN = /([我你他她它]们?|某人|对方|那个人|那家伙|这个人)/g;
const TIME_PATTERN =
  /(昨[天日]|今[天日]|明[天日]|前几天|这[几周月]|上[周月年]|下[周月年]|去年|今年|明年|[一二三四五六七八九十0-9]+\s*[天周月年小时分秒]|最近|当时|那时|那一年|这阵子)/g;
const QUOTE_PATTERN = /[「"'""''『「]([^」"'""''』」]{2,40})[」"'""''』」]/;

// 简单的高频虚词，提取关键词时过滤掉
const STOPWORDS = new Set([
  "的", "了", "是", "我", "你", "他", "她", "在", "和", "也", "都",
  "就", "不", "没", "有", "这", "那", "一", "个", "之", "于", "与",
  "把", "被", "给", "为", "对", "向", "从", "到", "上", "下", "中",
  "里", "外", "前", "后", "时候", "可以", "应该", "需要", "可能",
]);

// ── 长度档 ──
function gradeRichness(len: number): Richness {
  if (len < 8) return "minimal";
  if (len < 24) return "brief";
  if (len < 60) return "moderate";
  if (len < 140) return "rich";
  return "detailed";
}

function recommendSceneCount(r: Richness): number {
  switch (r) {
    case "minimal":
      return 2;
    case "brief":
      return 3;
    case "moderate":
      return 4;
    case "rich":
      return 5;
    case "detailed":
      return 6;
  }
}

function recommendBodyChars(r: Richness): number {
  switch (r) {
    case "minimal":
      return 60;
    case "brief":
      return 90;
    case "moderate":
      return 130;
    case "rich":
      return 180;
    case "detailed":
      return 240;
  }
}

// ── 关键短语提取 ──
// 不用真分词器（中文要装包）。改用：
//   1. 把句子按 标点 / 空格 切片
//   2. 每片长度 2–10 之间且不全是 stopword 的，作为候选
//   3. 取前 5 个最长的（直观假设：长一点的片段信息密度更高）
function extractKeywords(q: string): string[] {
  const segments = q
    .split(/[，。！？、；,.!?;()\s\n]+/g)
    .map((s) => s.trim())
    .filter((s) => s.length >= 2 && s.length <= 14);
  const interesting = segments.filter((s) => {
    // 至少要有一个非 stopword 字
    return Array.from(s).some((ch) => !STOPWORDS.has(ch));
  });
  // 去重 + 按长度倒序
  const seen = new Set<string>();
  const unique = interesting.filter((s) => {
    if (seen.has(s)) return false;
    seen.add(s);
    return true;
  });
  unique.sort((a, b) => b.length - a.length);
  return unique.slice(0, 5);
}

function detectEmotions(q: string): EmotionTone[] {
  const hits: EmotionTone[] = [];
  for (const [tone, words] of Object.entries(EMOTION_LEXICON) as [
    Exclude<EmotionTone, "neutral">,
    string[]
  ][]) {
    if (words.some((w) => q.includes(w))) hits.push(tone);
  }
  return hits;
}

const SELF_DOUBT_PATTERNS = [
  "是不是我",
  "我是不是",
  "我做错了",
  "是我的问题",
  "怪我",
  "我不该",
  "我不配",
];

/**
 * 危机词典。
 *
 * 原则：宁可误报、不可漏报。任何字面命中都先走 SafetyExit，
 * 让人决定是否继续，而不是替人决定。
 *
 * 不收录"完蛋了 / 撑不住"这类高频日常表达——会产生大量误报反而稀释信号。
 * 只收录直接指向自伤 / 结束生命 / 严重绝望的措辞。
 */
const CRISIS_LEXICON: string[] = [
  // 自杀意念
  "自杀", "想死", "去死", "想结束", "结束自己", "结束生命", "结束这一切",
  "不想活", "不想活了", "活不下去", "不想活下去", "活着没意思",
  "我想消失", "想消失", "消失算了", "从这世界消失",
  "解脱", "想解脱",
  // 自伤
  "自残", "伤害自己", "划自己", "割腕", "割自己",
  // 严重绝望（保守收录少量）
  "撑不住了想死",
];

function detectCrisis(q: string): string[] {
  const hits: string[] = [];
  for (const w of CRISIS_LEXICON) {
    if (q.includes(w)) hits.push(w);
  }
  return hits;
}

function detectSelfDoubt(q: string): boolean {
  return SELF_DOUBT_PATTERNS.some((p) => q.includes(p));
}

function detectPronouns(q: string): string[] {
  const m = q.match(PRONOUN_PATTERN);
  if (!m) return [];
  return Array.from(new Set(m));
}

function detectTimeWords(q: string): string[] {
  const m = q.match(TIME_PATTERN);
  if (!m) return [];
  return Array.from(new Set(m));
}

function extractQuotedSegment(q: string): string | null {
  const m = q.match(QUOTE_PATTERN);
  return m ? m[1].trim() : null;
}

function pickPrimaryEmotion(emotions: EmotionTone[]): EmotionTone {
  // 优先级：anxious > hurt > stuck > angry > hopeful > calm > neutral
  // anxious 最优先因为需要最强的安抚动作；calm 最弱因为不需要特殊处理。
  const priority: EmotionTone[] = [
    "anxious",
    "hurt",
    "stuck",
    "angry",
    "hopeful",
    "calm",
  ];
  for (const t of priority) {
    if (emotions.includes(t)) return t;
  }
  return "neutral";
}

export function analyzeInput(question: string): InputSignals {
  const q = (question ?? "").trim();
  const len = q.length;
  const richness = gradeRichness(len);
  const emotions = q ? detectEmotions(q) : [];
  const crisisHits = q ? detectCrisis(q) : [];
  return {
    length: len,
    richness,
    recommendedSceneCount: recommendSceneCount(richness),
    recommendedBodyChars: recommendBodyChars(richness),
    keywords: q ? extractKeywords(q) : [],
    pronouns: q ? detectPronouns(q) : [],
    timeWords: q ? detectTimeWords(q) : [],
    quotedSegment: q ? extractQuotedSegment(q) : null,
    emotions,
    primaryEmotion: pickPrimaryEmotion(emotions),
    selfDoubt: q ? detectSelfDoubt(q) : false,
    crisis: crisisHits.length > 0,
    crisisHits,
  };
}

// ── 文案模板：根据 primaryEmotion 输出安抚 / 调子句 ──
// 这些不是用来"治愈"，而是让 closing 不显得机械。

export function groundingLineFor(emotion: EmotionTone): string | null {
  switch (emotion) {
    case "anxious":
      return "如果此刻心跳很快，先把这一页合上，给自己三次呼吸的时间，再决定下一步。";
    case "hurt":
      return "牌面不替你消化情绪，只是让你看见此刻的状态。允许自己慢一点。";
    case "stuck":
      return "卡住不是失败。当你能说出'我卡住了'，这本身已经是一种推进。";
    case "angry":
      return "把愤怒先放在桌上，不必立刻处理它；先看它在指向什么。";
    case "hopeful":
      return "保留那份期待，但允许它在路上被修订。";
    case "calm":
    case "neutral":
      return null;
  }
}

export function tonePrefixFor(emotion: EmotionTone, selfDoubt: boolean): string {
  if (selfDoubt) {
    return "先把对自己的审判放下半步——";
  }
  switch (emotion) {
    case "anxious":
      return "稳住，慢慢看——";
    case "hurt":
      return "允许这份感觉先存在一会儿——";
    case "stuck":
      return "卡住有它的形状，先看清——";
    case "angry":
      return "先不下定论，看下层——";
    case "hopeful":
      return "带着这份希望往里看——";
    default:
      return "";
  }
}

/**
 * 把 keyword 自然回插进一段文本里。
 * 优先级：quotedSegment > keywords[0] > 没有就返回原文。
 * 返回新文本（保证不超过 limit 字符）。
 */
export function weaveUserKeyword(
  base: string,
  signals: InputSignals,
  limit: number
): string {
  const anchor = signals.quotedSegment ?? signals.keywords[0] ?? null;
  if (!anchor || base.includes(anchor)) {
    return base.length > limit ? base.slice(0, limit - 1) + "…" : base;
  }
  const woven = `${base}你提到「${anchor}」——这一处尤其值得放回去对照。`;
  return woven.length > limit ? woven.slice(0, limit - 1) + "…" : woven;
}
