/**
 * 给所有 motif 加上 source + quality + precision 元数据。
 *
 * 规则：
 *   - tarot_cards.json（22 张大阿尔卡那 motif）：手工标注，
 *     source: manual / quality: verified / precision: precise
 *   - minor_*.json（56 张小阿尔卡那 motif）：脚本生成，
 *     source: script_generated / quality: rough / precision: approximate
 *
 * 已经有这些字段的 motif 不会被覆盖（idempotent）。
 *
 * 用法：npx tsx scripts/tag_motif_quality.ts
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

type Motif = {
  id: string;
  source?: "manual" | "script_generated" | "ai_assisted";
  quality?: "verified" | "needs_review" | "rough";
  precision?: "precise" | "approximate";
  reviewed_at?: string;
  reviewed_by?: string;
  [key: string]: unknown;
};

type Card = {
  id: string;
  motifs?: Motif[];
  [key: string]: unknown;
};

function tagMotifs(
  cards: Card[],
  source: Motif["source"],
  quality: Motif["quality"],
  precision: Motif["precision"],
): { changed: number; total: number } {
  let changed = 0;
  let total = 0;
  for (const card of cards) {
    if (!card.motifs?.length) continue;
    for (const m of card.motifs) {
      total++;
      let mutated = false;
      if (!m.source) {
        m.source = source;
        mutated = true;
      }
      if (!m.quality) {
        m.quality = quality;
        mutated = true;
      }
      if (!m.precision) {
        m.precision = precision;
        mutated = true;
      }
      if (mutated) changed++;
    }
  }
  return { changed, total };
}

function processFile(
  relPath: string,
  source: Motif["source"],
  quality: Motif["quality"],
  precision: Motif["precision"],
): void {
  const abs = join(ROOT, relPath);
  const cards = JSON.parse(readFileSync(abs, "utf-8")) as Card[];
  const { changed, total } = tagMotifs(cards, source, quality, precision);
  writeFileSync(abs, JSON.stringify(cards, null, 2) + "\n", "utf-8");
  console.log(`${relPath}: ${changed}/${total} motif 元数据已补齐`);
}

// 大阿尔卡那精确标注（手工）
processFile("src/data/tarot_cards.json", "manual", "verified", "precise");

// 小阿尔卡那脚本生成（粗糙）
processFile(
  "src/data/cards/minor_wands.json",
  "script_generated",
  "rough",
  "approximate",
);
processFile(
  "src/data/cards/minor_cups.json",
  "script_generated",
  "rough",
  "approximate",
);
processFile(
  "src/data/cards/minor_swords.json",
  "script_generated",
  "rough",
  "approximate",
);
processFile(
  "src/data/cards/minor_pentacles.json",
  "script_generated",
  "rough",
  "approximate",
);

console.log("\n✅ 所有 motif 已标注 source/quality/precision");
