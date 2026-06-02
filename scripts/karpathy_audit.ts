#!/usr/bin/env tsx
/**
 * Karpathy-style code audit — static checks + command gates.
 * Run: npm run karpathy:audit
 * Output: reports/karpathy_audit_report.md
 */
import { execSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const REPORT_DIR = path.join(ROOT, "reports");
const REPORT_PATH = path.join(REPORT_DIR, "karpathy_audit_report.md");

type AuditResult = {
  id: string;
  category: string;
  passed: boolean;
  detail: string;
  blocking: boolean;
};

const results: AuditResult[] = [];

function audit(
  category: string,
  id: string,
  passed: boolean,
  detail: string,
  blocking = true,
) {
  results.push({ id, category, passed, detail, blocking });
  const icon = passed ? "✅" : blocking ? "❌" : "⚠️";
  console.log(`${icon} [${id}] ${detail}`);
}

function read(rel: string): string {
  return fs.readFileSync(path.join(ROOT, rel), "utf-8");
}

function exists(rel: string): boolean {
  return fs.existsSync(path.join(ROOT, rel));
}

function walk(dir: string, exts: string[], out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.name === "node_modules" || entry.name === ".next" || entry.name === "storybook-static") {
      continue;
    }
    if (entry.isDirectory()) walk(full, exts, out);
    else if (exts.some((e) => entry.name.endsWith(e))) out.push(full);
  }
  return out;
}

function rel(p: string): string {
  return path.relative(ROOT, p);
}

function runCmd(label: string, cmd: string): boolean {
  try {
    execSync(cmd, { cwd: ROOT, stdio: "pipe", encoding: "utf-8" });
    audit("Commands", label, true, `${cmd} — passed`);
    return true;
  } catch (e) {
    const err = e as { stdout?: string; stderr?: string };
    const msg = (err.stderr || err.stdout || "failed").slice(0, 400);
    audit("Commands", label, false, `${cmd} — ${msg}`);
    return false;
  }
}

// ─── 1–3. Command gates ───
console.log("\n▶ Command gates");
runCmd("typecheck", "npm run typecheck");
runCmd("lint", "npm run lint");
runCmd("build", "npm run build");

// ─── 4. Broad CSS selectors ───
console.log("\n▶ CSS hygiene");
const cssFiles = walk(path.join(ROOT, "src"), [".css"]);
const broadPatterns: Array<{ id: string; re: RegExp; allowScoped?: RegExp }> = [
  {
    id: "css-global-tarot-card-image",
    re: /^\s*\.tarot-card-image\s*\{/m,
    allowScoped: /\.[\w-]+\s+\.tarot-card-image\s*\{/,
  },
  { id: "css-global-card-frame-img", re: /^\s*\.card-frame\s+img\s*\{/m },
  { id: "css-global-img", re: /^\s*img\s*\{/m },
  {
    id: "css-glass-card-layout",
    re: /\.glass-card\s*\{[^}]*(?:width:\s*100vw|min-height:\s*\d{3,}|position:\s*absolute|display:\s*contents)/m,
  },
];

for (const { id, re, allowScoped } of broadPatterns) {
  const hits: string[] = [];
  for (const file of cssFiles) {
    const content = fs.readFileSync(file, "utf-8");
    if (!re.test(content)) continue;
    if (allowScoped && allowScoped.test(content) && !re.test(content.replace(allowScoped, ""))) {
      continue;
    }
    hits.push(rel(file));
  }
  audit(
    "CSS",
    id,
    hits.length === 0,
    hits.length === 0 ? "No unscoped broad selectors" : `Found in: ${hits.join(", ")}`,
    false,
  );
}

// ─── 5–6. File size limits ───
console.log("\n▶ File size limits");
const pageFiles = walk(path.join(ROOT, "src/app"), [".tsx"]).filter((f) =>
  path.basename(f) === "page.tsx",
);
const oversizedPages = pageFiles.filter((f) => fs.readFileSync(f, "utf-8").split("\n").length > 300);
audit(
  "Size",
  "page-tsx-300-lines",
  oversizedPages.length === 0,
  oversizedPages.length === 0
    ? "All page.tsx ≤ 300 lines"
    : `Over limit: ${oversizedPages.map(rel).join(", ")}`,
  false,
);

const globalsLines = exists("src/app/globals.css")
  ? read("src/app/globals.css").split("\n").length
  : 0;
audit(
  "Size",
  "globals-css-300-lines",
  globalsLines <= 300,
  `globals.css: ${globalsLines} lines (limit 300 — modular imports expected)`,
);

// ─── 7. any / ts-expect-error ───
console.log("\n▶ Type safety");
const tsFiles = walk(path.join(ROOT, "src"), [".ts", ".tsx"]).filter(
  (f) => !f.includes(".stories.") && !f.includes("node_modules"),
);
const anyHits: string[] = [];
for (const file of tsFiles) {
  const lines = fs.readFileSync(file, "utf-8").split("\n");
  lines.forEach((line, i) => {
    if (/\bas any\b/.test(line) || /@ts-expect-error/.test(line) || /:\s*any\b/.test(line)) {
      anyHits.push(`${rel(file)}:${i + 1}`);
    }
  });
}
audit(
  "Types",
  "no-any-or-ts-expect-error",
  anyHits.length === 0,
  anyHits.length === 0 ? "Clean" : anyHits.slice(0, 12).join("; ") + (anyHits.length > 12 ? "…" : ""),
  false,
);

// ─── 8. GSAP + Motion same file ───
console.log("\n▶ Motion mixing");
const motionMixHits: string[] = [];
for (const file of walk(path.join(ROOT, "src"), [".tsx"])) {
  const content = fs.readFileSync(file, "utf-8");
  const hasGsap =
    /from\s+["']gsap/.test(content) ||
    /from\s+["']@gsap\//.test(content) ||
    /useGSAP/.test(content);
  const hasMotion =
    /from\s+["']framer-motion["']/.test(content) && /motion\.|AnimatePresence/.test(content);
  if (hasGsap && hasMotion) motionMixHits.push(rel(file));
}
audit(
  "Motion",
  "no-gsap-motion-same-file",
  motionMixHits.length === 0,
  motionMixHits.length === 0
    ? "No file mixes GSAP + Framer Motion"
    : `Advisory — mixed: ${motionMixHits.join(", ")}`,
  false,
);

// ─── 9. Image fill without aspect-ratio parent ───
console.log("\n▶ Image layer");
const imageFillRisks: string[] = [];
for (const file of walk(path.join(ROOT, "src"), [".tsx"])) {
  const content = fs.readFileSync(file, "utf-8");
  if (!/<Image[^>]*\bfill\b/.test(content)) continue;
  const hasAspect =
    /aspect-ratio|aspectRatio|card-thumb-frame__image|motif-archive-card-stage|tarot-card-stage|card-stage/.test(
      content,
    );
  if (!hasAspect) imageFillRisks.push(rel(file));
}
audit(
  "Image",
  "image-fill-has-aspect-context",
  imageFillRisks.length === 0,
  imageFillRisks.length === 0
    ? "All Image fill usages appear scoped to aspect-ratio containers"
    : `Review: ${imageFillRisks.join(", ")}`,
  false,
);

// ─── 10. Archive / home wrapper risk ───
console.log("\n▶ Layout wrappers");
const archivePage = exists("src/app/archive/page.tsx") ? read("src/app/archive/page.tsx") : "";
const archiveEntrance = exists("src/components/archive/ArchiveDeckEntrance.tsx")
  ? read("src/components/archive/ArchiveDeckEntrance.tsx")
  : "";
const archiveBundle = archivePage + archiveEntrance;
const requiredArchiveWrappers = [
  "archive-page",
  "archive-groups",
  "cards-grid",
  "archive-preview",
];
const missingArchive = requiredArchiveWrappers.filter((w) => !archiveBundle.includes(w));
audit(
  "Layout",
  "archive-page-wrappers",
  missingArchive.length === 0,
  missingArchive.length === 0
    ? "Archive production page has required wrappers"
    : `Missing: ${missingArchive.join(", ")}`,
);

const homePage = exists("src/app/page.tsx") ? read("src/app/page.tsx") : "";
const modeSelector = exists("src/components/ModeSelector.tsx")
  ? read("src/components/ModeSelector.tsx")
  : "";
const homeBundle = homePage + modeSelector;
const homeHasMode =
  homeBundle.includes("mode-selector") || homeBundle.includes("ModeSelector");
const homeHasShell =
  homeBundle.includes("hero-shell") && homeBundle.includes("home-page");
audit(
  "Layout",
  "home-page-wrappers",
  homeHasMode && homeHasShell,
  homeHasMode && homeHasShell
    ? "Home production page has required wrappers"
    : `Missing: ${!homeHasShell ? "hero-shell/home-page " : ""}${!homeHasMode ? "mode-selector" : ""}`.trim(),
);

// ─── Reference lab pages exist ───
console.log("\n▶ Reference lab");
const labPages = [
  "src/app/lab/archive-reference/page.tsx",
  "src/app/lab/reading-reference/page.tsx",
  "src/app/lab/motif-reference/page.tsx",
];
const missingLab = labPages.filter((p) => !exists(p));
audit(
  "Reference",
  "lab-pages-exist",
  missingLab.length === 0,
  missingLab.length === 0 ? "All lab reference pages present" : `Missing: ${missingLab.join(", ")}`,
);

const fixtureFiles = [
  "fixtures/archive_reference.json",
  "fixtures/reading_reference_daily.json",
  "fixtures/motif_reference_magician.json",
];
const missingFixtures = fixtureFiles.filter((p) => !exists(p));
audit(
  "Reference",
  "fixtures-exist",
  missingFixtures.length === 0,
  missingFixtures.length === 0 ? "All fixtures present" : `Missing: ${missingFixtures.join(", ")}`,
);

// ─── Report ───
const passed = results.filter((r) => r.passed).length;
const failed = results.filter((r) => !r.passed && r.blocking).length;
const advisory = results.filter((r) => !r.passed && !r.blocking).length;
const now = new Date().toISOString();

const md = `# Karpathy Audit Report

Generated: ${now}

## Summary

| Metric | Value |
|--------|-------|
| Total checks | ${results.length} |
| Passed | ${passed} |
| Failed (blocking) | ${failed} |
| Advisory | ${advisory} |
| Status | ${failed === 0 ? "**PASS**" : "**FAIL**"} |

## Results

| ID | Category | Status | Detail |
|----|----------|--------|--------|
${results.map((r) => `| ${r.id} | ${r.category} | ${r.passed ? "✅" : "❌"} | ${r.detail.replace(/\|/g, "\\|").replace(/\n/g, " ")} |`).join("\n")}

## Workflow

See [docs/KARPATHY_STYLE_AUDIT.md](../docs/KARPATHY_STYLE_AUDIT.md) for experiment protocol.

> Note: Command gates (typecheck/lint/build) run during this audit. Visual gate: \`npm run test:karpathy-visual\`.
`;

fs.mkdirSync(REPORT_DIR, { recursive: true });
fs.writeFileSync(REPORT_PATH, md);
console.log(`\n📄 Report: ${REPORT_PATH}`);
console.log(`\n${failed === 0 ? "✅ All checks passed" : `❌ ${failed} check(s) failed`}`);
process.exit(failed > 0 ? 1 : 0);
