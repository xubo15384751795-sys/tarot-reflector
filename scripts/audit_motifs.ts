/**
 * Motif 数据质量审计脚本
 *
 * 扫描所有牌的 motif 数据，输出质量报告。
 * 用法: npx tsx scripts/audit_motifs.ts
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

type MotifAnnotation = {
  id: string;
  label_zh?: string;
  label?: string;
  meaning_zh?: string;
  meaning?: string;
  bbox?: { x: number; y: number; w: number; h: number };
  anchor?: { x: number; y: number };
  source?: "manual" | "script_generated" | "ai_assisted";
  quality?: "verified" | "needs_review" | "rough";
  precision?: "precise" | "approximate";
  reviewed_at?: string;
  reviewed_by?: string;
};

type CardFile = {
  id: string;
  name_zh: string;
  arcana: string;
  motifs?: MotifAnnotation[];
};

function loadJson<T>(relPath: string): T {
  return JSON.parse(readFileSync(join(ROOT, relPath), "utf-8")) as T;
}

const SUIT_FILES = [
  "src/data/cards/major_arcana.json",
  "src/data/cards/minor_wands.json",
  "src/data/cards/minor_cups.json",
  "src/data/cards/minor_swords.json",
  "src/data/cards/minor_pentacles.json",
];

let totalCards = 0;
let totalMotifs = 0;
let manualVerified = 0;
let scriptGenerated = 0;
let needsReview = 0;
let rough = 0;
let noSource = 0;
let noBbox = 0;
let noAnchor = 0;
let approximatePrecision = 0;

const issues: string[] = [];

for (const file of SUIT_FILES) {
  let cards: CardFile[];
  try {
    cards = loadJson<CardFile[]>(file);
  } catch {
    issues.push(`Cannot load ${file}`);
    continue;
  }

  for (const card of cards) {
    totalCards++;
    if (!card.motifs || card.motifs.length === 0) {
      issues.push(`${card.id}: no motifs`);
      continue;
    }

    for (const m of card.motifs) {
      totalMotifs++;

      if (!m.source) noSource++;
      if (!m.quality) {
        // Infer from precision field
        if (m.precision === "approximate") {
          rough++;
        } else {
          noSource++;
        }
      }

      if (m.source === "manual" && m.quality === "verified") manualVerified++;
      if (m.source === "script_generated") scriptGenerated++;
      if (m.quality === "needs_review") needsReview++;
      if (m.quality === "rough") rough++;
      if (m.precision === "approximate") approximatePrecision++;

      if (!m.bbox) noBbox++;
      if (!m.anchor) noAnchor++;
    }
  }
}

const report = `# Motif 数据质量报告

生成时间: ${new Date().toISOString()}

## 总览

| 指标 | 数量 |
|------|------|
| 总牌数 | ${totalCards} |
| 总 motif 数 | ${totalMotifs} |
| 已人工校准 (manual + verified) | ${manualVerified} |
| 脚本生成 (script_generated) | ${scriptGenerated} |
| 需审查 (needs_review) | ${needsReview} |
| 近似 (rough) | ${rough} |
| 无来源标记 | ${noSource} |
| 缺 bbox | ${noBbox} |
| 缺 anchor | ${noAnchor} |
| approximate 精度 | ${approximatePrecision} |

## 风险评估

${rough > 0 ? `⚠️ ${rough} 个 motif 为 rough 级别，不应作为精准牌面交互依据。` : "✅ 无 rough 级别 motif。"}
${noSource > totalMotifs * 0.5 ? `⚠️ ${noSource} 个 motif 缺少来源标记（超过半数），数据治理需加强。` : ""}
${noBbox > 0 ? `⚠️ ${noBbox} 个 motif 缺少 bbox 坐标。` : ""}

## 问题列表

${issues.length > 0 ? issues.map((i) => `- ${i}`).join("\n") : "无问题。"}

## 建议

1. 所有小阿尔卡那脚本生成的 motif 必须标记 \`source: "script_generated"\`, \`quality: "rough"\`
2. 大阿尔卡那已校准的 motif 标记 \`source: "manual"\`, \`quality: "verified"\`
3. UI 中只有 verified motif 才能启用精准 hotspot / bbox 高亮
4. rough motif 只能作为基础符号列表显示
`;

mkdirSync(join(ROOT, "reports"), { recursive: true });
writeFileSync(join(ROOT, "reports/motif_quality_report.md"), report, "utf-8");

console.log(report);
console.log("\n✅ Report written to reports/motif_quality_report.md");
