#!/usr/bin/env node
/**
 * Split a monolithic globals.css into src/styles/* modules.
 * Run: node scripts/split-globals.mjs [source.css]
 *
 * IMPORTANT: Never run against src/app/globals.css after it has been reduced
 * to @import lines only — pass the monolithic backup explicitly.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const defaultSource = path.join(ROOT, "src/app/globals.css");
const sourcePath = process.argv[2] ? path.resolve(process.argv[2]) : defaultSource;
const stylesDir = path.join(ROOT, "src/styles");
const globalsPath = path.join(ROOT, "src/app/globals.css");

const lines = fs.readFileSync(sourcePath, "utf8").split("\n");

if (lines.length < 500) {
  console.error(
    `Refusing to split ${sourcePath}: only ${lines.length} lines. ` +
      "Pass the monolithic backup, e.g. node scripts/split-globals.mjs /tmp/tarot-orig-globals.css",
  );
  process.exit(1);
}

/** Assign each line index (0-based) to exactly one bucket */
const buckets = {
  motion: new Set(),
  tokens: new Set(),
  base: new Set(),
  typography: new Set(),
  theme: new Set(),
  surfaces: new Set(),
  guide: new Set(),
  archive: new Set(),
  reading: new Set(),
  home: new Set(),
  notes: new Set(),
};

function addRange(bucket, start, end) {
  for (let i = start - 1; i <= end - 1; i++) buckets[bucket].add(i);
}

// motion
addRange("motion", 1, 49);
addRange("motion", 253, 271);
addRange("motion", 4003, lines.length);

// tokens (design system variables)
addRange("tokens", 51, 231);

// base reset
addRange("base", 593, 676);
addRange("base", 3267, 3267);
addRange("base", 1923, 1925);

// typography
addRange("typography", 607, 666);

// theme light overrides
addRange("theme", 2927, 3264);
addRange("theme", 248, 251);
addRange("theme", 650, 653);
addRange("theme", 2725, 2736);

// surfaces / shared UI
addRange("surfaces", 232, 312);
addRange("surfaces", 314, 591);
addRange("surfaces", 678, 896);
addRange("surfaces", 2651, 2925);

// guide
addRange("guide", 1216, 1501);
addRange("guide", 1900, 1920);
addRange("guide", 2367, 2433);

// archive
addRange("archive", 1503, 1898);
addRange("archive", 1961, 2025);
addRange("archive", 3269, 4001);

// home / hero / mode entry
addRange("home", 1957, 1959);
addRange("home", 2027, 2364);
addRange("home", 2599, 2649);
addRange("home", 2739, 2925);

// reading / spread / stage (excluding home blocks above)
addRange("reading", 898, 1214);
addRange("reading", 1922, 1956);
addRange("reading", 2435, 2595);
addRange("reading", 3355, 3420);

// notes (shared note-card + motif side columns)
addRange("notes", 943, 1043);
addRange("notes", 3723, 3736);

// Assign unclaimed lines to surfaces (fallback)
const allAssigned = new Set();
for (const set of Object.values(buckets)) {
  for (const i of set) allAssigned.add(i);
}
for (let i = 0; i < lines.length; i++) {
  if (!allAssigned.has(i)) buckets.surfaces.add(i);
}

function extract(bucket) {
  const indices = [...buckets[bucket]].sort((a, b) => a - b);
  return indices.map((i) => lines[i]).join("\n");
}

fs.mkdirSync(stylesDir, { recursive: true });

const files = {
  "tokens.css": extract("tokens"),
  "base.css": extract("base"),
  "typography.css": extract("typography"),
  "theme.css": extract("theme"),
  "surfaces.css": extract("surfaces"),
  "motion.css": extract("motion"),
  "home.css": extract("home"),
  "archive.css": extract("archive"),
  "guide.css": extract("guide"),
  "reading.css": extract("reading"),
  "notes.css": extract("notes"),
};

for (const [name, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(stylesDir, name), content.trim() + "\n");
}

const globals = `@import "tailwindcss";

@import "../styles/tokens.css";
@import "../styles/base.css";
@import "../styles/typography.css";
@import "../styles/theme.css";
@import "../styles/surfaces.css";
@import "../styles/motion.css";
@import "../styles/home.css";
@import "../styles/archive.css";
@import "../styles/guide.css";
@import "../styles/reading.css";
@import "../styles/notes.css";
`;

fs.writeFileSync(globalsPath, globals);
console.log(`Split ${sourcePath} into src/styles/*.css`);
for (const [name, content] of Object.entries(files)) {
  console.log(`  ${name}: ${content.split("\n").length} lines`);
}
console.log(`  globals.css: ${globals.split("\n").length} lines`);
