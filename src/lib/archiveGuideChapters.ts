/**
 * 科普页 · 档案馆导览章节（非长文堆叠）
 */

import {
  ARCHIVE_GUIDE,
  EXPLAIN_GUIDE,
  MODE_GUIDE,
  NOTES_GUIDE,
} from "@/lib/appGuide";
import { TAROT_INTRO_SECTIONS } from "@/lib/spreadGuide";

export type GuideChapter = {
  id: string;
  number: string;
  arch: string;
  title: string;
  /** 一句核心解释 */
  lead: string;
  /** 2–3 行正文 */
  body: string[];
  hint?: string;
};

const [introWhat, introDeck, introSpread] = TAROT_INTRO_SECTIONS;

export const ARCHIVE_GUIDE_CHAPTERS: GuideChapter[] = [
  {
    id: "what",
    number: "01",
    arch: "ARCH.01",
    title: introWhat.title,
    lead: "一面镜子，用来外化与命名你此刻的感受。",
    body: [introWhat.body],
  },
  {
    id: "deck",
    number: "02",
    arch: "ARCH.02",
    title: introDeck.title,
    lead: "韦特派公版牌面，正逆位各有自己的语气。",
    body: [introDeck.body],
  },
  {
    id: "spread",
    number: "03",
    arch: "ARCH.03",
    title: introSpread.title,
    lead: "选牌阵，是选一种看问题的结构。",
    body: [introSpread.body],
    hint: "不是选「更准」的魔法，而是选你要照亮哪些侧面。",
  },
  {
    id: "modes",
    number: "04",
    arch: "ARCH.04",
    title: "三种进入方式",
    lead: "按你此刻的状态选入口，而不是选难度。",
    body: MODE_GUIDE.map((m) => `${m.title}：${m.body}`),
  },
  {
    id: "flow",
    number: "05",
    arch: "ARCH.05",
    title: "解读流程",
    lead: "从澄清问题到收束，像靠近一张被翻开的牌。",
    body: [
      "澄清问题 → 推荐或自选牌阵 → 抽牌翻牌 → 按位置读牌 → 收束总结。",
      "选牌阵时可查看各牌位含义与连读规则，不必一次记牢。",
    ],
  },
  {
    id: "archive",
    number: "06",
    arch: "ARCH.06",
    title: ARCHIVE_GUIDE.title,
    lead: "78 张牌义与符号坐标，供慢读与对照。",
    body: [ARCHIVE_GUIDE.body],
    hint: "大阿尔卡那为手工校准；小阿尔卡那符号位置为示意。",
  },
  {
    id: "notes",
    number: "07",
    arch: "ARCH.07",
    title: NOTES_GUIDE.title,
    lead: "把当下的牌面与感受留在本设备。",
    body: [NOTES_GUIDE.body],
  },
  {
    id: "explain",
    number: "08",
    arch: "ARCH.08",
    title: EXPLAIN_GUIDE.title,
    lead: "为录屏讲解准备的符号工作台。",
    body: [EXPLAIN_GUIDE.body],
  },
];
