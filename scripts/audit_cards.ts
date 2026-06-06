/**
 * 78 张牌完整性审计脚本
 *
 * 检查所有牌是否具有完整字段。
 * 用法: npx tsx scripts/audit_cards.ts
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

type CardData = {
  id: string;
  name_zh: string;
  name_en: string;
  arcana: "major" | "minor";
  suit?: string;
  number?: number | null;
  court_rank?: string;
  image?: string;
  traditional?: {
    upright?: { keywords_zh?: string[]; meaning_zh?: string };
    reversed?: { keywords_zh?: string[]; meaning_zh?: string };
  };
};

function loadJson<T>(relPath: string): T {
  return JSON.parse(readFileSync(join(ROOT, relPath), "utf-8")) as T;
}

const SUIT_FILES: Array<{ path: string; expectedArcana: string; suit?: string }> = [
  { path: "src/data/cards/major_arcana.json", expectedArcana: "major" },
  { path: "src/data/cards/minor_wands.json", expectedArcana: "minor", suit: "wands" },
  { path: "src/data/cards/minor_cups.json", expectedArcana: "minor", suit: "cups" },
  { path: "src/data/cards/minor_swords.json", expectedArcana: "minor", suit: "swords" },
  { path: "src/data/cards/minor_pentacles.json", expectedArcana: "minor", suit: "pentacles" },
];

const issues: string[] = [];
let totalCards = 0;
let completeCards = 0;
const allIds = new Set<string>();

for (const { path, expectedArcana, suit } of SUIT_FILES) {
  let cards: CardData[];
  try {
    cards = loadJson<CardData[]>(path);
  } catch (e) {
    issues.push(`Cannot load ${path}: ${(e as Error).message}`);
    continue;
  }

  for (const card of cards) {
    totalCards++;
    const cardIssues: string[] = [];

    if (!card.id) cardIssues.push("missing id");
    if (allIds.has(card.id)) cardIssues.push("duplicate id");
    allIds.add(card.id);

    if (!card.name_zh) cardIssues.push("missing name_zh");
    if (!card.name_en) cardIssues.push("missing name_en");
    if (card.arcana !== expectedArcana) cardIssues.push(`arcana="${card.arcana}" expected="${expectedArcana}"`);

    if (expectedArcana === "minor") {
      if (!card.suit && suit) cardIssues.push(`missing suit (expected ${suit})`);
      if (card.number === undefined || card.number === null) {
        if (!card.court_rank) cardIssues.push("missing number and court_rank");
      }
    }

    if (!card.image) cardIssues.push("missing image");

    const up = card.traditional?.upright;
    if (!up?.keywords_zh?.length) cardIssues.push("missing upright keywords_zh");
    if (!up?.meaning_zh) cardIssues.push("missing upright meaning_zh");

    const rev = card.traditional?.reversed;
    if (!rev?.keywords_zh?.length) cardIssues.push("missing reversed keywords_zh");
    if (!rev?.meaning_zh) cardIssues.push("missing reversed meaning_zh");

    if (cardIssues.length > 0) {
      issues.push(`${card.id}: ${cardIssues.join("; ")}`);
    } else {
      completeCards++;
    }
  }
}

// Check for missing cards
const expectedMajor = 22;
const expectedMinor = 56;
// Count by loading actual data
let actualMajor = 0;
let actualMinor = 0;
for (const { path, expectedArcana } of SUIT_FILES) {
  try {
    const cards = loadJson<CardData[]>(path);
    if (expectedArcana === "major") actualMajor = cards.length;
    else actualMinor += cards.length;
  } catch { /* already reported */ }
}

const report = `# 78 张牌完整性审计报告

生成时间: ${new Date().toISOString()}

## 总览

| 指标 | 数量 |
|------|------|
| 总牌数 | ${totalCards} |
| 完整牌数 | ${completeCards} |
| 有问题牌数 | ${totalCards - completeCards} |
| 大阿尔卡那 | ${actualMajor} / ${expectedMajor} |
| 小阿尔卡那 | ${actualMinor} / ${expectedMinor} |
| 唯一 ID 数 | ${allIds.size} |

## 评估

${totalCards === 78 ? "✅ 总牌数正确 (78)" : `❌ 总牌数不正确: ${totalCards} (expected 78)`}
${actualMajor === expectedMajor ? "✅ 大阿尔卡那完整 (22)" : `❌ 大阿尔卡那: ${actualMajor}/${expectedMajor}`}
${actualMinor === expectedMinor ? "✅ 小阿尔卡那完整 (56)" : `❌ 小阿尔卡那: ${actualMinor}/${expectedMinor}`}
${allIds.size === totalCards ? "✅ 所有 ID 唯一" : `❌ 有重复 ID`}
${completeCards === totalCards ? "✅ 所有字段完整" : `⚠️ ${totalCards - completeCards} 张牌有缺失字段`}

## 问题列表

${issues.length > 0 ? issues.map((i) => `- ${i}`).join("\n") : "无问题。"}
`;

mkdirSync(join(ROOT, "reports"), { recursive: true });
writeFileSync(join(ROOT, "reports/card_audit_report.md"), report, "utf-8");

console.log(report);
console.log("\n✅ Report written to reports/card_audit_report.md");

// Exit with error if critical issues
if (totalCards !== 78 || allIds.size !== totalCards) {
  process.exit(1);
}
