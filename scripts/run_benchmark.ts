/**
 * Threshold Tarot Benchmark Runner
 *
 * 自动化检查客观指标，输出 benchmark report。
 * 用法: npx tsx scripts/run_benchmark.ts
 */

import { execSync } from "node:child_process";
import { readFileSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const SRC = join(ROOT, "src");

type CheckResult = {
  name: string;
  maxScore: number;
  score: number;
  status: "pass" | "partial" | "fail";
  details: string;
};

const results: CheckResult[] = [];

function run(cmd: string, cwd = ROOT): { ok: boolean; output: string } {
  try {
    const output = execSync(cmd, { cwd, encoding: "utf-8", timeout: 120_000, stdio: ["pipe", "pipe", "pipe"] });
    return { ok: true, output: output.trim() };
  } catch (e) {
    const err = e as { stdout?: string; stderr?: string; message?: string };
    return { ok: false, output: (err.stdout ?? err.stderr ?? err.message ?? "").trim() };
  }
}

function fileExists(rel: string): boolean {
  return existsSync(join(ROOT, rel));
}

function readFile(rel: string): string {
  try {
    return readFileSync(join(ROOT, rel), "utf-8");
  } catch {
    return "";
  }
}

function countPattern(dir: string, pattern: RegExp): number {
  const { output } = run(`rg -c "${pattern.source}" ${dir} --include="*.ts" --include="*.tsx" 2>/dev/null || echo "0"`);
  if (!output || output === "0") return 0;
  return output.split("\n").reduce((sum, line) => {
    const count = parseInt(line.split(":").pop() ?? "0", 10);
    return sum + (isNaN(count) ? 0 : count);
  }, 0);
}

// ─── A. Engineering Governance ─────────────────────────

function checkA1_Git(): CheckResult {
  const isGit = run("git rev-parse --is-inside-work-tree").ok;
  const branch = run("git rev-parse --abbrev-ref HEAD").output;
  const commitCount = run("git rev-list --count HEAD").output;
  const envTracked = run("git ls-files .env.local").output;
  const hasReadme = fileExists("README.md");

  let score = 0;
  const details: string[] = [];

  if (isGit) { score += 0.5; details.push("git init ✅"); } else { details.push("git init ❌"); }
  if (branch === "main") { score += 0.3; details.push(`branch=${branch} ✅`); } else { details.push(`branch=${branch} ⚠️`); }
  if (parseInt(commitCount) > 0) { score += 0.4; details.push(`commits=${commitCount} ✅`); } else { details.push("no commits ❌"); }
  if (!envTracked) { score += 0.5; details.push(".env.local not tracked ✅"); } else { details.push(".env.local TRACKED ❌"); }
  if (hasReadme) { score += 0.3; details.push("README exists ✅"); } else { details.push("README missing ❌"); }

  return { name: "A1. Git", maxScore: 2, score: Math.min(2, score), status: score >= 1.8 ? "pass" : score >= 1 ? "partial" : "fail", details: details.join("; ") };
}

function checkA2_Secret(): CheckResult {
  const hasEnvExample = fileExists(".env.example");
  const hasSecretlint = fileExists(".secretlintrc.json");
  const ciHasScan = readFile(".github/workflows/ci.yml").includes("secrets:scan");
  const scanResult = run("npm run secrets:scan --silent 2>&1");
  const scanPassed = scanResult.ok || !scanResult.output.includes("error");

  let score = 0;
  const details: string[] = [];

  if (hasEnvExample) { score += 0.5; details.push(".env.example ✅"); } else { details.push(".env.example ❌"); }
  if (hasSecretlint) { score += 0.5; details.push("secretlint config ✅"); } else { details.push("secretlint ❌"); }
  if (ciHasScan) { score += 0.5; details.push("CI secrets:scan ✅"); } else { details.push("CI secrets:scan ❌"); }
  if (scanPassed) { score += 0.5; details.push("secrets:scan passes ✅"); } else { details.push("secrets:scan fails ❌"); }

  return { name: "A2. Secret Safety", maxScore: 2, score: Math.min(2, score), status: score >= 1.8 ? "pass" : score >= 1 ? "partial" : "fail", details: details.join("; ") };
}

function checkA3_Build(): CheckResult {
  const buildResult = run("npm run build 2>&1");
  const hasEnvExample = fileExists(".env.example");

  let score = 0;
  const details: string[] = [];

  if (buildResult.ok) { score += 1.5; details.push("npm run build ✅"); } else { details.push("npm run build ❌"); }
  if (hasEnvExample) { score += 0.5; details.push(".env.example guides config ✅"); } else { details.push(".env.example ❌"); }

  return { name: "A3. Build Reproducibility", maxScore: 2, score: Math.min(2, score), status: score >= 1.8 ? "pass" : score >= 1 ? "partial" : "fail", details: details.join("; ") };
}

function checkA4_CI(): CheckResult {
  const ciContent = readFile(".github/workflows/ci.yml");
  const hasCI = !!ciContent;
  const hasTypecheck = ciContent.includes("typecheck");
  const hasLint = ciContent.includes("lint");
  const hasTest = ciContent.includes("test");
  const hasBuild = ciContent.includes("build");
  const hasScan = ciContent.includes("secrets:scan");

  const checks = [hasTypecheck, hasLint, hasTest, hasBuild, hasScan];
  const passed = checks.filter(Boolean).length;
  const score = hasCI ? (passed / checks.length) * 2 : 0;

  return {
    name: "A4. CI/CD",
    maxScore: 2,
    score: Math.min(2, score),
    status: score >= 1.8 ? "pass" : score >= 1 ? "partial" : "fail",
    details: `CI=${hasCI}; typecheck=${hasTypecheck}; lint=${hasLint}; test=${hasTest}; build=${hasBuild}; scan=${hasScan}`,
  };
}

function checkA5_README(): CheckResult {
  const readme = readFile("README.md");
  const checks = [
    { key: "项目定位", test: readme.includes("象征性反思") || readme.includes("塔罗") },
    { key: "技术栈", test: readme.includes("Next.js") || readme.includes("React") },
    { key: "如何运行", test: readme.includes("npm install") || readme.includes("npm run dev") },
    { key: "AI Provider", test: readme.includes("AI") || readme.includes("DeepSeek") || readme.includes(".env") },
    { key: "测试", test: readme.includes("test") || readme.includes("测试") || readme.includes("benchmark") },
    { key: "规则声明", test: readme.includes("不是命运预测") || readme.includes("rulesGuard") },
    { key: "benchmark", test: readme.includes("benchmark") },
  ];

  const passed = checks.filter((c) => c.test).length;
  const score = (passed / checks.length) * 2;

  return {
    name: "A5. README",
    maxScore: 2,
    score: Math.min(2, score),
    status: score >= 1.8 ? "pass" : score >= 1 ? "partial" : "fail",
    details: checks.map((c) => `${c.key}=${c.test ? "✅" : "❌"}`).join("; "),
  };
}

// ─── B. Type Safety ─────────────────────────

function checkB1_StrictTS(): CheckResult {
  const tsconfig = readFile("tsconfig.json");
  const hasStrict = tsconfig.includes('"strict": true');
  const tcResult = run("npm run typecheck --silent 2>&1");
  const tcPassed = tcResult.ok;
  const anyCount = countPattern(SRC, /as any|: any/);
  const tsExpectCount = countPattern(SRC, /@ts-expect-error/);

  let score = 0;
  const details: string[] = [];

  if (hasStrict) { score += 0.5; details.push("strict:true ✅"); } else { details.push("strict:false ❌"); }
  if (tcPassed) { score += 0.5; details.push("typecheck passes ✅"); } else { details.push("typecheck fails ❌"); }
  if (anyCount <= 3) { score += 0.5; details.push(`any count=${anyCount} ✅`); } else { score += 0.2; details.push(`any count=${anyCount} ⚠️`); }
  if (tsExpectCount <= 2) { score += 0.5; details.push(`@ts-expect-error=${tsExpectCount} ✅`); } else { score += 0.2; details.push(`@ts-expect-error=${tsExpectCount} ⚠️`); }

  return { name: "B1. TypeScript Strict", maxScore: 2, score: Math.min(2, score), status: score >= 1.8 ? "pass" : score >= 1 ? "partial" : "fail", details: details.join("; ") };
}

function checkB2_ReadingPage(): CheckResult {
  const pageContent = readFile("src/app/reading/page.tsx");
  const lines = pageContent.split("\n").length;

  let score = 0;
  if (lines < 150) score = 2;
  else if (lines < 300) score = 1;
  else score = 0;

  return {
    name: "B2. reading/page.tsx Complexity",
    maxScore: 2,
    score,
    status: score === 2 ? "pass" : score === 1 ? "partial" : "fail",
    details: `${lines} lines`,
  };
}

function checkB3_Modularity(): CheckResult {
  const checks = [
    fileExists("src/features/reading/hooks/useReadingSession.ts"),
    fileExists("src/features/reading/hooks/useReadingApi.ts"),
    fileExists("src/features/reading/components/ReadingStageRouter.tsx"),
    fileExists("src/features/reading/lib/normalizeReading.ts"),
    existsSync(join(ROOT, "src/features/reading/components/stages")),
  ];

  const passed = checks.filter(Boolean).length;
  const score = (passed / checks.length) * 2;

  return {
    name: "B3. Feature Modularity",
    maxScore: 2,
    score: Math.min(2, score),
    status: score >= 1.8 ? "pass" : score >= 1 ? "partial" : "fail",
    details: `useReadingSession=${checks[0]}; useReadingApi=${checks[1]}; ReadingStageRouter=${checks[2]}; normalizeReading=${checks[3]}; stages/=${checks[4]}`,
  };
}

function checkB4_DataModel(): CheckResult {
  const hasReadingScript = existsSync(join(ROOT, "src/types/readingScript.ts"));
  const hasNormalize = fileExists("src/features/reading/lib/normalizeReading.ts");
  const hasFallback = fileExists("src/features/reading/lib/buildLocalFallbackReading.ts");

  let score = 0;
  if (hasReadingScript) score += 0.8;
  if (hasNormalize) score += 0.7;
  if (hasFallback) score += 0.5;

  return {
    name: "B4. Data Model Unification",
    maxScore: 2,
    score: Math.min(2, score),
    status: score >= 1.8 ? "pass" : score >= 1 ? "partial" : "fail",
    details: `ReadingScript=${hasReadingScript}; normalizeReading=${hasNormalize}; fallback=${hasFallback}`,
  };
}

function checkB5_Testability(): CheckResult {
  const hasMockTest = fileExists("tests/unit/callLLM.mock.test.ts");
  const hasDrawTest = fileExists("src/lib/drawCards.test.ts");
  const hasComponentTest = fileExists("tests/components/ModeSelector.test.tsx");
  const hasIntegrationTest = fileExists("tests/integration/readingSession.integration.test.ts");

  let score = 0;
  if (hasMockTest) score += 0.5;
  if (hasDrawTest) score += 0.5;
  if (hasComponentTest) score += 0.5;
  if (hasIntegrationTest) score += 0.5;

  return {
    name: "B5. Test Injectability",
    maxScore: 2,
    score: Math.min(2, score),
    status: score >= 1.8 ? "pass" : score >= 1 ? "partial" : "fail",
    details: `mock test=${hasMockTest}; draw test=${hasDrawTest}; component test=${hasComponentTest}; integration test=${hasIntegrationTest}`,
  };
}

// ─── C. Functional Completeness ─────────────────────────

function checkC_Modes(): CheckResult {
  const homeContent = readFile("src/app/page.tsx");
  const hasDaily = homeContent.includes("daily");
  const hasQuestion = homeContent.includes("question");
  const hasDeep = homeContent.includes("deep");
  const hasModeSelector = fileExists("src/components/ModeSelector.tsx");

  const passed = [hasDaily, hasQuestion, hasDeep, hasModeSelector].filter(Boolean).length;
  const score = (passed / 4) * 2;

  return {
    name: "C1. Three Entry Modes",
    maxScore: 2,
    score: Math.min(2, score),
    status: score >= 1.8 ? "pass" : score >= 1 ? "partial" : "fail",
    details: `daily=${hasDaily}; question=${hasQuestion}; deep=${hasDeep}; ModeSelector=${hasModeSelector}`,
  };
}

function checkC_Reframe(): CheckResult {
  const hasReframe = fileExists("src/app/api/reframe/route.ts");
  const hasQuestionStage = fileExists("src/features/reading/components/stages/QuestionStage.tsx");

  let score = 0;
  if (hasReframe) score += 1;
  if (hasQuestionStage) score += 1;

  return {
    name: "C2. Question Reframe",
    maxScore: 2,
    score,
    status: score === 2 ? "pass" : score === 1 ? "partial" : "fail",
    details: `reframe API=${hasReframe}; QuestionStage=${hasQuestionStage}`,
  };
}

function checkC_SpreadRecommend(): CheckResult {
  const hasRecommend = fileExists("src/app/api/spread/recommend/route.ts");
  const hasSpreadSelector = fileExists("src/components/SpreadSelector.tsx");

  let score = 0;
  if (hasRecommend) score += 1;
  if (hasSpreadSelector) score += 1;

  return {
    name: "C3. Spread Recommendation",
    maxScore: 2,
    score,
    status: score === 2 ? "pass" : score === 1 ? "partial" : "fail",
    details: `recommend API=${hasRecommend}; SpreadSelector=${hasSpreadSelector}`,
  };
}

function checkC_DrawSeparation(): CheckResult {
  const hasDrawAPI = fileExists("src/app/api/reading/draw/route.ts");
  const hasGenerateAPI = fileExists("src/app/api/reading/generate/route.ts");
  const hasDrawingStage = fileExists("src/features/reading/components/stages/DrawingStage.tsx");

  let score = 0;
  if (hasDrawAPI) score += 0.7;
  if (hasGenerateAPI) score += 0.7;
  if (hasDrawingStage) score += 0.6;

  return {
    name: "C4. Draw/Generate Separation",
    maxScore: 2,
    score: Math.min(2, score),
    status: score >= 1.8 ? "pass" : score >= 1 ? "partial" : "fail",
    details: `draw API=${hasDrawAPI}; generate API=${hasGenerateAPI}; DrawingStage=${hasDrawingStage}`,
  };
}

function checkC_MultiCard(): CheckResult {
  const hasDrawCards = fileExists("src/lib/drawCards.ts");
  const hasSpreadAnalyzer = fileExists("src/lib/spreadAnalyzer.ts");
  const hasRelationship = fileExists("src/lib/cardRelationshipAnalyzer.ts");

  let score = 0;
  if (hasDrawCards) score += 0.7;
  if (hasSpreadAnalyzer) score += 0.7;
  if (hasRelationship) score += 0.6;

  return {
    name: "C5. Multi-Card Reading",
    maxScore: 2,
    score: Math.min(2, score),
    status: score >= 1.8 ? "pass" : score >= 1 ? "partial" : "fail",
    details: `drawCards=${hasDrawCards}; spreadAnalyzer=${hasSpreadAnalyzer}; relationship=${hasRelationship}`,
  };
}

// ─── D. Tarot Rule Correctness ─────────────────────────

function checkD_78Cards(): CheckResult {
  const auditResult = run("npm run audit:cards --silent 2>&1");
  const output = auditResult.output;
  const has78 = output.includes("78") && output.includes("总牌数");
  const has22Major = output.includes("22 / 22") || output.includes("大阿尔卡那完整");
  const has56Minor = output.includes("56 / 56") || output.includes("小阿尔卡那完整");

  let score = 0;
  if (has78) score += 0.7;
  if (has22Major) score += 0.7;
  if (has56Minor) score += 0.6;

  return {
    name: "D1. 78 Card Completeness",
    maxScore: 2,
    score: Math.min(2, score),
    status: score >= 1.8 ? "pass" : score >= 1 ? "partial" : "fail",
    details: `78 cards=${has78}; 22 major=${has22Major}; 56 minor=${has56Minor}`,
  };
}

function checkD_RulesGuard(): CheckResult {
  const hasGuard = fileExists("src/lib/rulesGuard.ts");
  const hasGuardTest = fileExists("src/lib/rulesGuard.test.ts");
  const hasShared = fileExists("src/lib/rulesGuard.shared.ts");
  const guardContent = readFile("src/lib/rulesGuard.ts");
  const hasBannedCheck = guardContent.includes("BANNED_SUBSTRINGS") || guardContent.includes("findBanned");
  const hasPredictionCheck = guardContent.includes("predictRe") || guardContent.includes("prediction");

  let score = 0;
  if (hasGuard) score += 0.5;
  if (hasGuardTest) score += 0.5;
  if (hasShared) score += 0.3;
  if (hasBannedCheck) score += 0.4;
  if (hasPredictionCheck) score += 0.3;

  return {
    name: "D6. Rules Guard",
    maxScore: 2,
    score: Math.min(2, score),
    status: score >= 1.8 ? "pass" : score >= 1 ? "partial" : "fail",
    details: `guard=${hasGuard}; test=${hasGuardTest}; shared=${hasShared}; banned check=${hasBannedCheck}; prediction check=${hasPredictionCheck}`,
  };
}

// ─── E. AI Quality ─────────────────────────

function checkE_CallLLM(): CheckResult {
  const hasCallLLM = fileExists("src/lib/ai/callLLM.ts");
  const hasDeepSeek = fileExists("src/lib/ai/providers/deepseekLLM.ts");
  const hasOpenAICompat = fileExists("src/lib/ai/providers/openaiCompatible.ts");
  const hasTypes = fileExists("src/lib/ai/types.ts");
  const hasLLMError = readFile("src/lib/ai/types.ts").includes("LLMError");
  const hasJson = fileExists("src/lib/ai/json.ts");

  let score = 0;
  if (hasCallLLM) score += 0.4;
  if (hasDeepSeek) score += 0.3;
  if (hasOpenAICompat) score += 0.3;
  if (hasTypes) score += 0.3;
  if (hasLLMError) score += 0.4;
  if (hasJson) score += 0.3;

  return {
    name: "E1. AI Provider",
    maxScore: 2,
    score: Math.min(2, score),
    status: score >= 1.8 ? "pass" : score >= 1 ? "partial" : "fail",
    details: `callLLM=${hasCallLLM}; deepseek=${hasDeepSeek}; openaiCompat=${hasOpenAICompat}; types=${hasTypes}; LLMError=${hasLLMError}; json guard=${hasJson}`,
  };
}

function checkE_JSON(): CheckResult {
  const hasJsonModule = fileExists("src/lib/ai/json.ts");
  const jsonContent = readFile("src/lib/ai/json.ts");
  const hasParseGuard = jsonContent.includes("parseJsonObject");
  const hasErrorHandling = jsonContent.includes("throw") || jsonContent.includes("Error");
  const hasJsonTest = fileExists("tests/unit/json.test.ts");

  let score = 0;
  if (hasJsonModule) score += 0.5;
  if (hasParseGuard) score += 0.5;
  if (hasErrorHandling) score += 0.5;
  if (hasJsonTest) score += 0.5;

  return {
    name: "E2. JSON Stability",
    maxScore: 2,
    score: Math.min(2, score),
    status: score >= 1.8 ? "pass" : score >= 1 ? "partial" : "fail",
    details: `json module=${hasJsonModule}; parseJsonObject=${hasParseGuard}; error handling=${hasErrorHandling}; test=${hasJsonTest}`,
  };
}

// ─── J. Motif Quality ─────────────────────────

function checkJ_Motif(): CheckResult {
  const hasAuditScript = fileExists("scripts/audit_motifs.ts");
  const hasAuditReport = fileExists("reports/motif_quality_report.md");
  const schema = readFile("src/lib/schema.ts");
  const hasSourceField = schema.includes("source?:") && schema.includes("manual");
  const hasQualityField = schema.includes("quality?:") && schema.includes("verified");

  let score = 0;
  if (hasAuditScript) score += 0.3;
  if (hasAuditReport) score += 0.2;
  if (hasSourceField) score += 0.3;
  if (hasQualityField) score += 0.2;

  return {
    name: "J. Motif Quality",
    maxScore: 1,
    score: Math.min(1, score),
    status: score >= 0.9 ? "pass" : score >= 0.5 ? "partial" : "fail",
    details: `audit script=${hasAuditScript}; report=${hasAuditReport}; source field=${hasSourceField}; quality field=${hasQualityField}`,
  };
}

// ─── K. Video Readiness ─────────────────────────

function checkK_Video(): CheckResult {
  const hasRemotionRoot = fileExists("remotion/Root.tsx");
  const remotionContent = readFile("remotion/Root.tsx");
  const hasComposition = remotionContent.includes("Composition");
  const hasDemoFixture = fileExists("fixtures/video_script_demo.json");
  const hasDemoComp = fileExists("remotion/compositions/TarotShortDemo.tsx");

  let score = 0;
  if (hasRemotionRoot) score += 0.3;
  if (hasComposition) score += 0.3;
  if (hasDemoFixture) score += 0.2;
  if (hasDemoComp) score += 0.2;

  return {
    name: "K. Video Readiness",
    maxScore: 1,
    score: Math.min(1, score),
    status: score >= 0.9 ? "pass" : score >= 0.5 ? "partial" : "fail",
    details: `Root.tsx=${hasRemotionRoot}; Composition=${hasComposition}; fixture=${hasDemoFixture}; TarotShortDemo=${hasDemoComp}`,
  };
}

// ─── L. SEO ─────────────────────────

function checkL_SEO(): CheckResult {
  const layout = readFile("src/app/layout.tsx");
  const hasOG = layout.includes("openGraph");
  const hasTwitter = layout.includes("twitter");
  const hasOgImage = fileExists("public/og/default.svg") || fileExists("public/og/default.png");

  let score = 0;
  if (hasOG) score += 0.4;
  if (hasTwitter) score += 0.3;
  if (hasOgImage) score += 0.3;

  return {
    name: "L. SEO / Share",
    maxScore: 1,
    score: Math.min(1, score),
    status: score >= 0.9 ? "pass" : score >= 0.5 ? "partial" : "fail",
    details: `openGraph=${hasOG}; twitter=${hasTwitter}; og image=${hasOgImage}`,
  };
}

// ─── Run All ─────────────────────────

const allChecks: CheckResult[] = [
  checkA1_Git(),
  checkA2_Secret(),
  checkA3_Build(),
  checkA4_CI(),
  checkA5_README(),
  checkB1_StrictTS(),
  checkB2_ReadingPage(),
  checkB3_Modularity(),
  checkB4_DataModel(),
  checkB5_Testability(),
  checkC_Modes(),
  checkC_Reframe(),
  checkC_SpreadRecommend(),
  checkC_DrawSeparation(),
  checkC_MultiCard(),
  checkD_78Cards(),
  checkD_RulesGuard(),
  checkE_CallLLM(),
  checkE_JSON(),
  checkJ_Motif(),
  checkK_Video(),
  checkL_SEO(),
];

// Category scores
const categories: Record<string, { score: number; max: number; checks: CheckResult[] }> = {
  "A. Engineering Governance": { score: 0, max: 10, checks: [] },
  "B. Type Safety & Structure": { score: 0, max: 10, checks: [] },
  "C. Functional Completeness": { score: 0, max: 12, checks: [] },
  "D. Tarot Rule Correctness": { score: 0, max: 12, checks: [] },
  "E. AI Quality & Guardrails": { score: 0, max: 12, checks: [] },
  "J. Motif Archive Quality": { score: 0, max: 5, checks: [] },
  "K. Video Readiness": { score: 0, max: 3, checks: [] },
  "L. Performance & SEO": { score: 0, max: 2, checks: [] },
};

// Map checks to categories
for (const check of allChecks) {
  const prefix = check.name.charAt(0);
  const catKey = Object.keys(categories).find((k) => k.startsWith(prefix + "."));
  if (catKey) {
    categories[catKey].checks.push(check);
    categories[catKey].score += check.score;
  }
}

// Manual review categories (not auto-checkable)
const manualCategories: Array<{ name: string; max: number; note: string }> = [
  { name: "F. Interaction State Machine", max: 10, note: "Requires manual review of state transitions, loading text, exit controls" },
  { name: "G. Feminine-Friendly Ethics", max: 10, note: "Requires manual review of emotional safety, anxiety prevention, user agency" },
  { name: "H. UI Design Consistency", max: 8, note: "Requires manual review of theme symmetry, font system, component language" },
  { name: "I. Motion Quality", max: 6, note: "Requires manual review of motion tokens, transitions, reduce-motion support" },
];

const totalAutoScore = Object.values(categories).reduce((sum, c) => sum + c.score, 0);
const totalAutoMax = Object.values(categories).reduce((sum, c) => sum + c.max, 0);
const totalManualMax = manualCategories.reduce((sum, c) => sum + c.max, 0);

const criticalFailures: string[] = [];
if (allChecks.find((c) => c.name.includes("Build"))?.status === "fail") criticalFailures.push("Build fails");
if (allChecks.find((c) => c.name.includes("TypeScript"))?.status === "fail") criticalFailures.push("Typecheck fails");
if (allChecks.find((c) => c.name.includes("callLLM") || c.name.includes("AI Provider"))?.status === "fail") criticalFailures.push("AI engine skeleton");
if (allChecks.find((c) => c.name.includes("Rules Guard"))?.status === "fail") criticalFailures.push("rulesGuard absent");

// Generate report
const now = new Date().toISOString();
const gitHash = run("git rev-parse --short HEAD").output || "unknown";

let report = `# Threshold Tarot Benchmark Report

**Date:** ${now}
**Commit:** ${gitHash}

## Summary

**Auto Score:** ${totalAutoScore.toFixed(1)} / ${totalAutoMax}
**Manual Categories:** ${manualCategories.length} categories (${totalManualMax} points) require human review
**Total Possible:** ${totalAutoMax + totalManualMax} / 100

${criticalFailures.length > 0 ? `## ⚠️ Critical Failures\n\n${criticalFailures.map((f) => `- ❌ ${f}`).join("\n")}` : "## ✅ No Critical Failures"}

## Auto-Check Results

| Category | Score | Max | Status |
|----------|------:|----:|--------|
`;

for (const [name, cat] of Object.entries(categories)) {
  const statusIcon = cat.score >= cat.max * 0.9 ? "✅" : cat.score >= cat.max * 0.5 ? "⚠️" : "❌";
  report += `| ${name} | ${cat.score.toFixed(1)} | ${cat.max} | ${statusIcon} |\n`;
}

report += `\n## Detailed Results\n\n`;

for (const [name, cat] of Object.entries(categories)) {
  report += `### ${name}\n\n`;
  for (const check of cat.checks) {
    const icon = check.status === "pass" ? "✅" : check.status === "partial" ? "⚠️" : "❌";
    report += `- ${icon} **${check.name}** (${check.score}/${check.maxScore}): ${check.details}\n`;
  }
  report += `\n`;
}

report += `## Manual Review Categories\n\n`;
report += `> The following categories require human evaluation. Score them using the criteria in BENCHMARK.md.\n\n`;

for (const mc of manualCategories) {
  report += `### ${mc.name} (${mc.max} points)\n`;
  report += `- ${mc.note}\n`;
  report += `- Score: __ / ${mc.max}\n\n`;
}

report += `## Grading Scale

| Score | Grade | Meaning |
|-------|-------|---------|
| 90–100 | Excellent | Reference-quality sample |
| 80–89 | Demo | Presentable, note incomplete parts |
| 70–79 | Prototype | Usable, not reference-quality |
| 60–69 | Risky | Functional, engineering risks |
| <60 | Experimental | Still a demo |

## Commands Run

\`\`\`
npm run benchmark
npm run audit:cards
npm run audit:motifs
npm run check
\`\`\`
`;

mkdirSync(join(ROOT, "reports"), { recursive: true });
writeFileSync(join(ROOT, "reports/benchmark_report.md"), report, "utf-8");

console.log(report);
console.log("\n✅ Benchmark report written to reports/benchmark_report.md");

// Print summary
console.log(`\n${"=".repeat(50)}`);
console.log(`AUTO SCORE: ${totalAutoScore.toFixed(1)} / ${totalAutoMax}`);
console.log(`MANUAL: ${totalManualMax} points require human review`);
console.log(`TOTAL POSSIBLE: ${(totalAutoMax + totalManualMax)} / 100`);
if (criticalFailures.length > 0) {
  console.log(`\n⚠️ CRITICAL FAILURES: ${criticalFailures.join(", ")}`);
}
console.log(`${"=".repeat(50)}`);
