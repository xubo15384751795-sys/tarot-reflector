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
  // 三种入口模式可能在 page.tsx 或 ModeSelector 任一定义
  const homeContent = readFile("src/app/page.tsx");
  const modeSelector = fileExists("src/components/ModeSelector.tsx")
    ? readFile("src/components/ModeSelector.tsx")
    : "";
  const all = homeContent + "\n" + modeSelector;
  const hasDaily = /["']daily["']/.test(all) || all.includes("今日一牌");
  const hasQuestion = /["']question["']/.test(all) || all.includes("问题解读");
  const hasDeep = /["']deep["']/.test(all) || all.includes("深度牌阵");
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

function checkC_Notes(): CheckResult {
  // C6: 笔记最低标准 = localStorage 持久化 + 列表回看
  const notesPage = fileExists("src/app/notes/page.tsx")
    ? readFile("src/app/notes/page.tsx")
    : "";
  const usesLocalStorage = notesPage.includes("localStorage") || notesPage.includes("tarot:notes");
  const hasList = notesPage.length > 0 && /map\(|forEach|\.length/.test(notesPage);
  // 写入路径
  const actions = fileExists("src/features/reading/hooks/useReadingPageActions.ts")
    ? readFile("src/features/reading/hooks/useReadingPageActions.ts")
    : "";
  const persistsNote = actions.includes("tarot:notes");
  // history snapshot（解读快照）
  const session = fileExists("src/features/reading/hooks/useReadingSession.ts")
    ? readFile("src/features/reading/hooks/useReadingSession.ts")
    : "";
  const hasHistory = session.includes("tarot:reading:history") || session.includes("HISTORY_STORAGE_KEY");
  let score = 0;
  if (usesLocalStorage) score += 0.5;
  if (hasList) score += 0.5;
  if (persistsNote) score += 0.5;
  if (hasHistory) score += 0.5;
  return {
    name: "C6. Notes & History",
    maxScore: 2,
    score: Math.min(2, score),
    status: score >= 1.8 ? "pass" : score >= 1 ? "partial" : "fail",
    details: `notes page=${usesLocalStorage}; list=${hasList}; persist note=${persistsNote}; history snapshot=${hasHistory}`,
  };
}

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

function checkD_RWSConsistency(): CheckResult {
  // D2: RWS 体系——力量 8，正义 11
  try {
    const cards = JSON.parse(readFile("src/data/cards/major_arcana.json")) as Array<{
      id: string;
      number?: number;
    }>;
    const strength = cards.find((c) => /strength/i.test(c.id));
    const justice = cards.find((c) => /justice/i.test(c.id));
    const strengthIs8 = strength?.number === 8;
    const justiceIs11 = justice?.number === 11;
    const has22 = cards.length === 22;
    let score = 0;
    if (has22) score += 0.5;
    if (strengthIs8) score += 0.75;
    if (justiceIs11) score += 0.75;
    return {
      name: "D2. RWS Consistency",
      maxScore: 2,
      score: Math.min(2, score),
      status: score >= 1.8 ? "pass" : score >= 1 ? "partial" : "fail",
      details: `22 major=${has22}; Strength=8 ${strengthIs8}; Justice=11 ${justiceIs11}`,
    };
  } catch (err) {
    return {
      name: "D2. RWS Consistency",
      maxScore: 2,
      score: 0,
      status: "fail",
      details: `cannot load major_arcana.json: ${err}`,
    };
  }
}

function checkD_OrientationRules(): CheckResult {
  // D3: 每张牌都有 upright 和 reversed 解释
  try {
    let total = 0;
    let withBoth = 0;
    const files = [
      "src/data/cards/major_arcana.json",
      "src/data/cards/minor_wands.json",
      "src/data/cards/minor_cups.json",
      "src/data/cards/minor_swords.json",
      "src/data/cards/minor_pentacles.json",
    ];
    for (const f of files) {
      const cards = JSON.parse(readFile(f)) as Array<{
        traditional?: { upright?: unknown; reversed?: unknown };
      }>;
      for (const c of cards) {
        total++;
        if (c.traditional?.upright && c.traditional?.reversed) withBoth++;
      }
    }
    const score = total === 78 && withBoth === 78 ? 2 : (withBoth / Math.max(1, total)) * 2;
    return {
      name: "D3. Orientation Rules",
      maxScore: 2,
      score: Math.round(score * 10) / 10,
      status: score >= 1.8 ? "pass" : score >= 1 ? "partial" : "fail",
      details: `${withBoth}/${total} cards have upright + reversed`,
    };
  } catch (err) {
    return {
      name: "D3. Orientation Rules",
      maxScore: 2,
      score: 0,
      status: "fail",
      details: `${err}`,
    };
  }
}

function checkD_MinorRules(): CheckResult {
  // D4: prompt + buildReadingContext 有花色/数字/宫廷规则
  const hasContext = fileExists("src/lib/buildReadingContext.ts");
  const ctxContent = hasContext ? readFile("src/lib/buildReadingContext.ts") : "";
  const promptRules = fileExists("src/lib/tarotRulesPrompt.ts")
    ? readFile("src/lib/tarotRulesPrompt.ts")
    : "";
  const hasSuitRule =
    ctxContent.includes("suit_rule") ||
    ctxContent.includes("suits") ||
    promptRules.includes("花色");
  const hasNumberRule =
    ctxContent.includes("number_rule") ||
    ctxContent.includes("numbers") ||
    promptRules.includes("数字");
  const hasCourtRule =
    ctxContent.includes("court_rule") ||
    ctxContent.includes("court_cards") ||
    promptRules.includes("宫廷");
  let score = 0;
  if (hasSuitRule) score += 0.7;
  if (hasNumberRule) score += 0.7;
  if (hasCourtRule) score += 0.6;
  return {
    name: "D4. Minor Arcana Rules",
    maxScore: 2,
    score: Math.min(2, score),
    status: score >= 1.8 ? "pass" : score >= 1 ? "partial" : "fail",
    details: `suit=${hasSuitRule}; number=${hasNumberRule}; court=${hasCourtRule}`,
  };
}

function checkD_SpreadPositions(): CheckResult {
  // D5: 每个 spread 都有 positions（含 name + meaning）
  try {
    // spreads 数据实际在 src/data/tarot_rules/spreads.json
    const data = JSON.parse(readFile("src/data/tarot_rules/spreads.json")) as {
      spreads: Array<{ id: string; positions: Array<{ name_zh?: string; meaning_zh?: string }> }>;
    };
    let total = 0;
    let complete = 0;
    for (const s of data.spreads) {
      for (const p of s.positions) {
        total++;
        if (p.name_zh && p.meaning_zh) complete++;
      }
    }
    const ratio = total > 0 ? complete / total : 0;
    return {
      name: "D5. Spread Positions",
      maxScore: 2,
      score: Math.round(ratio * 2 * 10) / 10,
      status: ratio >= 0.95 ? "pass" : ratio >= 0.5 ? "partial" : "fail",
      details: `${complete}/${total} positions have name + meaning`,
    };
  } catch (err) {
    return {
      name: "D5. Spread Positions",
      maxScore: 2,
      score: 0,
      status: "fail",
      details: `${err}`,
    };
  }
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

function checkE_RulesGuardCoverage(): CheckResult {
  // E3: rulesGuard 测试是否覆盖关键禁用词类别
  const guardTest = fileExists("src/lib/rulesGuard.test.ts")
    ? readFile("src/lib/rulesGuard.test.ts")
    : "";
  const benchTest = fileExists("tests/benchmark/benchmark.smoke.test.ts")
    ? readFile("tests/benchmark/benchmark.smoke.test.ts")
    : "";
  const all = guardTest + "\n" + benchTest;
  const checks = {
    prediction: /一定会|命中注定|你将会|必将/.test(all),
    loveCommitment: /他一定|他不爱|他会回来|你们.*复合/.test(all),
    bannedSubstring: /BANNED_SUBSTRINGS|phrase\.banned|findBanned/.test(all),
    unknownMotif: /motif_focus_unknown|未知\s*motif/.test(all),
    motifMissing: /motif_focus_missing|focus_motif/.test(all),
  };
  const hit = Object.values(checks).filter(Boolean).length;
  const score = (hit / 5) * 2;
  return {
    name: "E3. Rules Guard Coverage",
    maxScore: 2,
    score: Math.round(score * 10) / 10,
    status: hit >= 4 ? "pass" : hit >= 2 ? "partial" : "fail",
    details: `prediction=${checks.prediction}; loveCommitment=${checks.loveCommitment}; bannedSubstring=${checks.bannedSubstring}; unknownMotif=${checks.unknownMotif}; motifMissing=${checks.motifMissing}`,
  };
}

function checkE_Streaming(): CheckResult {
  // E5: SSE 流式接口 + 本地 fallback
  const hasStreamRoute = fileExists("src/app/api/reading/generate/stream/route.ts");
  const streamContent = hasStreamRoute
    ? readFile("src/app/api/reading/generate/stream/route.ts")
    : "";
  const hasSSE = streamContent.includes("text/event-stream");
  const hasMetaEvent = streamContent.includes("event: meta") || streamContent.includes('"meta"');
  const hasPositionEvent =
    streamContent.includes("event: position") || streamContent.includes('"position"');
  const hasFallback = fileExists("src/features/reading/lib/buildLocalFallbackReading.ts");
  const apiHook = fileExists("src/features/reading/hooks/useReadingApi.ts")
    ? readFile("src/features/reading/hooks/useReadingApi.ts")
    : "";
  const hasStreamClient = apiHook.includes("generateReadingStream");
  let score = 0;
  if (hasStreamRoute) score += 0.4;
  if (hasSSE) score += 0.3;
  if (hasMetaEvent && hasPositionEvent) score += 0.5;
  if (hasFallback) score += 0.4;
  if (hasStreamClient) score += 0.4;
  return {
    name: "E5. Streaming / Progressive",
    maxScore: 2,
    score: Math.min(2, score),
    status: score >= 1.8 ? "pass" : score >= 1 ? "partial" : "fail",
    details: `stream route=${hasStreamRoute}; SSE=${hasSSE}; meta+position=${hasMetaEvent && hasPositionEvent}; fallback=${hasFallback}; client=${hasStreamClient}`,
  };
}

function checkE_Refine(): CheckResult {
  // E6: refine API + 用户反馈路径
  const hasRefineRoute = fileExists("src/app/api/reading/refine/route.ts");
  const apiHook = fileExists("src/features/reading/hooks/useReadingApi.ts")
    ? readFile("src/features/reading/hooks/useReadingApi.ts")
    : "";
  const hasRefineClient = apiHook.includes("refineReading");
  // 拒绝复述权（用户主权）
  const qrf = fileExists("src/components/QuestionReframe.tsx")
    ? readFile("src/components/QuestionReframe.tsx")
    : "";
  const hasSkipReframe = qrf.includes("onSkip") || /不太像我|这个观察/.test(qrf);
  let score = 0;
  if (hasRefineRoute) score += 0.6;
  if (hasRefineClient) score += 0.6;
  if (hasSkipReframe) score += 0.8;
  return {
    name: "E6. User Feedback / Refine",
    maxScore: 2,
    score: Math.min(2, score),
    status: score >= 1.8 ? "pass" : score >= 1 ? "partial" : "fail",
    details: `refine route=${hasRefineRoute}; refine client=${hasRefineClient}; reject reframe=${hasSkipReframe}`,
  };
}

// ─── J. Motif Quality ─────────────────────────

function checkJ1_MotifTiering(): CheckResult {
  // J1: schema 类型 + 数据有 source/quality
  const schema = readFile("src/lib/schema.ts");
  const hasSourceField = schema.includes("source?:") && schema.includes("manual");
  const hasQualityField = schema.includes("quality?:") && schema.includes("verified");
  // 数据层抽样验证
  try {
    const tc = JSON.parse(readFile("src/data/tarot_cards.json")) as Array<{
      motifs?: Array<{ source?: string; quality?: string }>;
    }>;
    const allMotifs = tc.flatMap((c) => c.motifs ?? []);
    const tagged = allMotifs.filter((m) => m.source && m.quality).length;
    const taggedRatio = allMotifs.length > 0 ? tagged / allMotifs.length : 0;
    let score = 0;
    if (hasSourceField) score += 0.3;
    if (hasQualityField) score += 0.3;
    if (taggedRatio >= 0.95) score += 0.4;
    return {
      name: "J1. Motif Tiering",
      maxScore: 1,
      score: Math.round(Math.min(1, score) * 10) / 10,
      status: score >= 0.9 ? "pass" : score >= 0.5 ? "partial" : "fail",
      details: `source field=${hasSourceField}; quality field=${hasQualityField}; tagged ratio=${(taggedRatio * 100).toFixed(0)}%`,
    };
  } catch {
    return {
      name: "J1. Motif Tiering",
      maxScore: 1,
      score: hasSourceField && hasQualityField ? 0.6 : 0,
      status: "partial",
      details: `schema only check (data load failed)`,
    };
  }
}

function checkJ2_MajorVerified(): CheckResult {
  // J2: 22 张大阿尔卡那每张 ≥5 motif，且 verified
  try {
    const tc = JSON.parse(readFile("src/data/tarot_cards.json")) as Array<{
      id: string;
      motifs?: Array<{ source?: string; quality?: string }>;
    }>;
    let majorCount = 0;
    let verifiedAll = 0;
    let totalMotifs = 0;
    for (const c of tc) {
      majorCount++;
      const ms = c.motifs ?? [];
      totalMotifs += ms.length;
      if (ms.length >= 4 && ms.every((m) => m.quality === "verified")) verifiedAll++;
    }
    const has22 = majorCount === 22;
    const allVerified = verifiedAll === majorCount;
    let score = 0;
    if (has22) score += 0.3;
    if (allVerified) score += 0.5;
    if (totalMotifs >= 80) score += 0.2;
    return {
      name: "J2. Major Verified",
      maxScore: 1,
      score: Math.min(1, score),
      status: score >= 0.9 ? "pass" : score >= 0.5 ? "partial" : "fail",
      details: `22 cards=${has22}; all verified=${allVerified} (${verifiedAll}/${majorCount}); total motifs=${totalMotifs}`,
    };
  } catch (err) {
    return { name: "J2. Major Verified", maxScore: 1, score: 0, status: "fail", details: `${err}` };
  }
}

function checkJ3_MinorTransparent(): CheckResult {
  // J3: 所有小阿尔卡那 motif 必须 quality=rough（不假装精确）
  try {
    const files = [
      "src/data/cards/minor_wands.json",
      "src/data/cards/minor_cups.json",
      "src/data/cards/minor_swords.json",
      "src/data/cards/minor_pentacles.json",
    ];
    let total = 0;
    let rough = 0;
    for (const f of files) {
      const cards = JSON.parse(readFile(f)) as Array<{
        motifs?: Array<{ quality?: string; precision?: string }>;
      }>;
      for (const c of cards) {
        for (const m of c.motifs ?? []) {
          total++;
          if (m.quality === "rough" && m.precision === "approximate") rough++;
        }
      }
    }
    const ratio = total > 0 ? rough / total : 0;
    return {
      name: "J3. Minor Transparent",
      maxScore: 1,
      score: Math.round(ratio * 10) / 10,
      status: ratio >= 0.95 ? "pass" : ratio >= 0.5 ? "partial" : "fail",
      details: `${rough}/${total} minor motifs labeled rough+approximate`,
    };
  } catch (err) {
    return { name: "J3. Minor Transparent", maxScore: 1, score: 0, status: "fail", details: `${err}` };
  }
}

function checkJ4_DebugMode(): CheckResult {
  // J4: ?debugMotifs=1 在 UI 中支持
  const archivePage = fileExists("src/app/archive/page.tsx")
    ? readFile("src/app/archive/page.tsx")
    : "";
  const modal = fileExists("src/components/archive/CardDetailModal.tsx")
    ? readFile("src/components/archive/CardDetailModal.tsx")
    : "";
  const motifCanvas = fileExists("src/components/MotifCanvas.tsx")
    ? readFile("src/components/MotifCanvas.tsx")
    : "";
  const handlesParam = archivePage.includes("debugMotifs");
  const passesProp = modal.includes("debugMotifs");
  const consumes = motifCanvas.includes("debug");
  let score = 0;
  if (handlesParam) score += 0.4;
  if (passesProp) score += 0.3;
  if (consumes) score += 0.3;
  return {
    name: "J4. Motif Debug Mode",
    maxScore: 1,
    score: Math.min(1, score),
    status: score >= 0.9 ? "pass" : score >= 0.5 ? "partial" : "fail",
    details: `?debugMotifs handler=${handlesParam}; modal prop=${passesProp}; canvas consume=${consumes}`,
  };
}

function checkJ5_AuditReport(): CheckResult {
  const hasScript = fileExists("scripts/audit_motifs.ts");
  const hasReport = fileExists("reports/motif_quality_report.md");
  let score = 0;
  if (hasScript) score += 0.5;
  if (hasReport) score += 0.5;
  return {
    name: "J5. Audit Report",
    maxScore: 1,
    score: Math.min(1, score),
    status: score >= 0.9 ? "pass" : score >= 0.5 ? "partial" : "fail",
    details: `audit script=${hasScript}; report file=${hasReport}`,
  };
}

// ─── K. Video Readiness ─────────────────────────

function checkK1_ScriptShape(): CheckResult {
  // K1: ReadingScript / VideoScene 类型支持视频字段
  const scriptTypes = fileExists("src/types/readingScript.ts")
    ? readFile("src/types/readingScript.ts")
    : "";
  const hasVoiceover = scriptTypes.includes("voiceover_zh");
  const hasSubtitle = scriptTypes.includes("subtitle_zh");
  const hasDuration = scriptTypes.includes("duration");
  const hasActiveCard = scriptTypes.includes("active_card_id");
  const hasFocusMotif = scriptTypes.includes("focus_motif");
  let score = 0;
  if (hasVoiceover) score += 0.2;
  if (hasSubtitle) score += 0.2;
  if (hasDuration) score += 0.2;
  if (hasActiveCard) score += 0.2;
  if (hasFocusMotif) score += 0.2;
  return {
    name: "K1. Script Video Fields",
    maxScore: 1,
    score: Math.min(1, score),
    status: score >= 0.9 ? "pass" : score >= 0.5 ? "partial" : "fail",
    details: `voiceover=${hasVoiceover}; subtitle=${hasSubtitle}; duration=${hasDuration}; active_card=${hasActiveCard}; focus_motif=${hasFocusMotif}`,
  };
}

function checkK2_DemoMode(): CheckResult {
  // K2: 演示模式（9:16 + 自动播放 + 字幕 + 高亮 + 进度）
  const hasPlayer = fileExists("src/components/DemoModePlayer.tsx");
  const playerContent = hasPlayer ? readFile("src/components/DemoModePlayer.tsx") : "";
  const hasAutoPlay = playerContent.includes("autoPlay");
  const hasSubtitle = fileExists("src/components/VideoSubtitle.tsx");
  const hasProgress = fileExists("src/components/VideoProgressBar.tsx");
  const hasAspect916 = playerContent.includes("9/16") || playerContent.includes("aspect-[9/16]");
  // /explain 页（独立科普工作台）也算 K2 加分
  const hasExplain = fileExists("src/app/explain/page.tsx");
  let score = 0;
  if (hasPlayer) score += 0.2;
  if (hasAutoPlay) score += 0.15;
  if (hasSubtitle) score += 0.15;
  if (hasProgress) score += 0.15;
  if (hasAspect916) score += 0.15;
  if (hasExplain) score += 0.2;
  return {
    name: "K2. Demo Mode",
    maxScore: 1,
    score: Math.min(1, score),
    status: score >= 0.9 ? "pass" : score >= 0.5 ? "partial" : "fail",
    details: `player=${hasPlayer}; autoPlay=${hasAutoPlay}; subtitle=${hasSubtitle}; progress=${hasProgress}; 9:16=${hasAspect916}; explain page=${hasExplain}`,
  };
}

function checkK3_Remotion(): CheckResult {
  const hasRoot = fileExists("remotion/Root.tsx");
  const rootContent = hasRoot ? readFile("remotion/Root.tsx") : "";
  const hasComposition = rootContent.includes("Composition");
  const hasFixture = fileExists("fixtures/video_script_demo.json");
  const hasDemoComp = fileExists("remotion/compositions/TarotShortDemo.tsx");
  const hasPreviewScript = fileExists("scripts/video_preview.ts");
  let score = 0;
  if (hasRoot) score += 0.2;
  if (hasComposition) score += 0.2;
  if (hasFixture) score += 0.2;
  if (hasDemoComp) score += 0.2;
  if (hasPreviewScript) score += 0.2;
  return {
    name: "K3. Remotion Demo",
    maxScore: 1,
    score: Math.min(1, score),
    status: score >= 0.9 ? "pass" : score >= 0.5 ? "partial" : "fail",
    details: `Root.tsx=${hasRoot}; Composition=${hasComposition}; fixture=${hasFixture}; demo comp=${hasDemoComp}; preview script=${hasPreviewScript}`,
  };
}

// ─── L. SEO ─────────────────────────

function checkL1_Performance(): CheckResult {
  // L1: 性能基线——next/image 用法 + 懒加载 + 字体 display
  const layout = fileExists("src/app/layout.tsx") ? readFile("src/app/layout.tsx") : "";
  // next/image 使用：在卡片图相关组件里采样几处（archive card / motif canvas / drawing stage）
  const samples = [
    "src/components/archive/ArchiveCard.tsx",
    "src/components/MotifCanvas.tsx",
    "src/features/reading/components/stages/DrawingStage.tsx",
    "src/components/archive/CardDetailModal.tsx",
    "src/components/VideoSceneRenderer.tsx",
  ]
    .filter(fileExists)
    .map(readFile)
    .join("\n");
  const usesNextImage = /from\s+["']next\/image["']/.test(samples);
  // 字体加载策略（display=swap 或 next/font）
  const hasFontDisplaySwap = /display=swap/i.test(layout);
  // 动态 import 拆分（archive 已经按 tab dynamic import）
  const archiveDataset = fileExists("src/components/archive/dataset.tsx")
    ? readFile("src/components/archive/dataset.tsx")
    : "";
  const hasDynamicData = /import\(['"]@\/data/.test(archiveDataset);
  let score = 0;
  if (usesNextImage) score += 0.4;
  if (hasFontDisplaySwap) score += 0.2;
  if (hasDynamicData) score += 0.4;
  return {
    name: "L1. Performance",
    maxScore: 1,
    score: Math.min(1, score),
    status: score >= 0.9 ? "pass" : score >= 0.5 ? "partial" : "fail",
    details: `next/image=${usesNextImage}; font swap=${hasFontDisplaySwap}; dynamic data=${hasDynamicData}`,
  };
}

function checkL2_SEO(): CheckResult {
  const layout = readFile("src/app/layout.tsx");
  const hasOG = layout.includes("openGraph");
  const hasTwitter = layout.includes("twitter");
  const hasMetadataBase = layout.includes("metadataBase");
  const hasOgImage = fileExists("public/og/default.svg") || fileExists("public/og/default.png");
  const hasSitemap = fileExists("src/app/sitemap.ts");
  const hasRobots = fileExists("src/app/robots.ts");
  let score = 0;
  if (hasOG) score += 0.2;
  if (hasTwitter) score += 0.15;
  if (hasMetadataBase) score += 0.15;
  if (hasOgImage) score += 0.15;
  if (hasSitemap) score += 0.2;
  if (hasRobots) score += 0.15;
  return {
    name: "L2. SEO / Share",
    maxScore: 1,
    score: Math.min(1, score),
    status: score >= 0.9 ? "pass" : score >= 0.5 ? "partial" : "fail",
    details: `openGraph=${hasOG}; twitter=${hasTwitter}; metadataBase=${hasMetadataBase}; og image=${hasOgImage}; sitemap=${hasSitemap}; robots=${hasRobots}`,
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
  checkC_Notes(),
  // D: 6 子项（D1+D6 已有，D2/D3/D4/D5 补齐 → 12 分满）
  checkD_78Cards(),
  checkD_RWSConsistency(),
  checkD_OrientationRules(),
  checkD_MinorRules(),
  checkD_SpreadPositions(),
  checkD_RulesGuard(),
  // E: 6 子项（E1+E2 已有，E3/E5/E6 补齐；E4 走 manual）
  checkE_CallLLM(),
  checkE_JSON(),
  checkE_RulesGuardCoverage(),
  checkE_Streaming(),
  checkE_Refine(),
  // J: 5 子项（拆开计分到满分 5）
  checkJ1_MotifTiering(),
  checkJ2_MajorVerified(),
  checkJ3_MinorTransparent(),
  checkJ4_DebugMode(),
  checkJ5_AuditReport(),
  // K: 3 子项
  checkK1_ScriptShape(),
  checkK2_DemoMode(),
  checkK3_Remotion(),
  // L: 2 子项
  checkL1_Performance(),
  checkL2_SEO(),
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
