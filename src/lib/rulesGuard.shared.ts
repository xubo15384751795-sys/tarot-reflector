/**
 * 共享的常量：禁用词清单、字段长度上限等。
 *
 * 之所以单独成文件，是因为 `tarotRulesPrompt.ts`（写给 LLM 的 prompt）和
 * `rulesGuard.ts`（运行时校验）都要读这些常量，单独抽出以避免循环依赖。
 *
 * 任何新增禁用词都在这里加；规则源头仍以 tarot_rules.md 为准。
 */

/** §5.2 禁止话术清单（按类别归组，仅做注释；运行时把所有桶展开来扫描） */
export const BANNED_SUBSTRINGS: string[] = [
  // 命运 / 宿命
  "命中注定",
  "命运注定",
  "注定会",
  "必然会",
  "一定会",
  "肯定会",
  "未来必",
  "必将",
  "宿命",

  // 神秘夸张
  "宇宙告诉你",
  "宇宙的安排",
  "神明指引",
  "灵魂深处的召唤",
  "天意",
  "灵性能量",
  "能量场打开",
  "磁场",
  "转运",

  // 恐吓
  "否则你会",
  "不听就会",
  "再不…就晚了",
  "灾难即将降临",
  "厄运",
  "血光",

  // 财富承诺
  "财运打开",
  "横财",
  "暴富",
  "必赚",
  "稳赚",
  "招财",

  // 感情承诺 / 替对方下判断（女性友好硬底线，见 tarot_rules.md §11.2）
  "真命天子",
  "命中注定的人",
  "他一定爱你",
  "他一定不爱你",
  "他根本不爱你",
  "他还爱你",
  "他不爱你了",
  "他心里还有你",
  "他心里只有你",
  "他心里没有你",
  "他后悔了",
  "他一定后悔",
  "他根本不在乎",
  "他会回来",
  "他不会回来",
  "他一定会回来",
  "ta 一定爱你",
  "ta 一定不爱你",
  "ta 心里还有你",
  "ta 心里只有你",
  "ta 会回来",
  "ta 不会回来",
  "复合一定",
  "你们一定会复合",
  "正缘即将出现",
  "正缘已到",
  "三天内复合",

  // 伪科学 / 焦虑收割
  "量子能量",
  "你能量太低",
  "你气场太弱",
  "你磁场不对",

  // 强制性 / 控制性话术（女性友好补充）
  "你必须",
  "你一定",
  "无法改变",
  "灵魂召唤",
  "七天转运",
  "三天内复合",
  "你们注定",
  "第三者一定存在",
];

/** §6 字段字数上限（中文字符计） */
export const FIELD_LIMITS = {
  headline: 12,
  subtitle: 18,
  insight: 32,
  bodyPerParagraph: 80,
  bodyParagraphs: 3,
  connection: 50,
} as const;

/** §6 必备 7 幕的步骤标签顺序（与 templateGenerator 保持一致） */
export const STEP_LABELS = [
  "整体",
  "元素一",
  "元素二",
  "元素三",
  "元素四",
  "综合",
  "建议",
] as const;

/** §7 disclaimer 必须包含的关键语义子串（满足任一即视为合格，建议同时出现） */
export const DISCLAIMER_KEYWORDS = ["象征性反思", "不是命运预测"];

/** 所有 78 张牌的 id 集合（大阿尔卡那 + 小阿尔卡那） */
export const MAJOR_ARCANA_IDS = new Set<string>([
  "the_fool",
  "the_magician",
  "the_high_priestess",
  "the_empress",
  "the_emperor",
  "the_hierophant",
  "the_lovers",
  "the_chariot",
  "strength",
  "the_hermit",
  "wheel_of_fortune",
  "justice",
  "the_hanged_man",
  "death",
  "temperance",
  "the_devil",
  "the_tower",
  "the_star",
  "the_moon",
  "the_sun",
  "judgement",
  "the_world",
]);

/** 所有已知牌 ID（78 张完整牌组） */
export const ALL_CARD_IDS = new Set<string>([
  ...MAJOR_ARCANA_IDS,
  // Minor Arcana - Wands
  "wands_ace", "wands_02", "wands_03", "wands_04", "wands_05", "wands_06",
  "wands_07", "wands_08", "wands_09", "wands_10", "wands_page", "wands_knight",
  "wands_queen", "wands_king",
  // Minor Arcana - Cups
  "cups_ace", "cups_02", "cups_03", "cups_04", "cups_05", "cups_06",
  "cups_07", "cups_08", "cups_09", "cups_10", "cups_page", "cups_knight",
  "cups_queen", "cups_king",
  // Minor Arcana - Swords
  "swords_ace", "swords_02", "swords_03", "swords_04", "swords_05", "swords_06",
  "swords_07", "swords_08", "swords_09", "swords_10", "swords_page", "swords_knight",
  "swords_queen", "swords_king",
  // Minor Arcana - Pentacles
  "pentacles_ace", "pentacles_02", "pentacles_03", "pentacles_04", "pentacles_05", "pentacles_06",
  "pentacles_07", "pentacles_08", "pentacles_09", "pentacles_10", "pentacles_page", "pentacles_knight",
  "pentacles_queen", "pentacles_king",
]);
