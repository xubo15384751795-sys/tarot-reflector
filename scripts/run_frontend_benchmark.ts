/**
 * Frontend Experience Benchmark — 自动检查脚本
 *
 * 运行: npx tsx scripts/run_frontend_benchmark.ts
 * 输出: reports/frontend_experience_benchmark.md
 */

import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const REPORT_DIR = path.join(ROOT, "reports");
const REPORT_PATH = path.join(REPORT_DIR, "frontend_experience_benchmark.md");

type CheckResult = {
  name: string;
  passed: boolean;
  detail: string;
  category: string;
};

const results: CheckResult[] = [];

function check(category: string, name: string, passed: boolean, detail: string) {
  results.push({ category, name, passed, detail });
  const icon = passed ? "✅" : "❌";
  console.log(`  ${icon} ${name}: ${detail}`);
}

function fileExists(rel: string): boolean {
  return fs.existsSync(path.join(ROOT, rel));
}

function readFile(rel: string): string {
  return fs.readFileSync(path.join(ROOT, rel), "utf-8");
}

function countLines(rel: string): number {
  return readFile(rel).split("\n").length;
}

// ═══════════════════════════════════════════════
// A. 信息架构与用户路径
// ═══════════════════════════════════════════════
console.log("\n📋 A. 信息架构与用户路径");

check("A", "首页三模式存在", (() => {
  const page = readFile("src/app/page.tsx");
  return page.includes("ModeSelector");
})(), "首页使用 ModeSelector 组件");

check("A", "ModeSelector 包含三种模式", (() => {
  const comp = readFile("src/components/ModeSelector.tsx");
  return comp.includes("daily") && comp.includes("question") && comp.includes("deep");
})(), "ModeSelector 包含 daily/question/deep 三种模式");

check("A", "推荐标记存在", (() => {
  const comp = readFile("src/components/ModeSelector.tsx");
  return comp.includes("recommended");
})(), "问题解读有 recommended 标记");

check("A", "辅助提示存在", (() => {
  const page = readFile("src/app/page.tsx");
  return page.includes("不知道选哪个");
})(), "首页有辅助提示文案");

check("A", "笔记页面存在", (() => {
  return fileExists("src/app/notes/page.tsx") && fileExists("src/app/notes/[id]/page.tsx");
})(), "笔记列表页和详情页均存在");

check("A", "视频演示入口存在", (() => {
  return fileExists("src/app/demo/page.tsx") || fileExists("src/app/explain/page.tsx");
})(), "至少有一个视频演示页面");

// ═══════════════════════════════════════════════
// B. 交互逻辑与状态一致性
// ═══════════════════════════════════════════════
console.log("\n📋 B. 交互逻辑与状态一致性");

check("B", "reading/page.tsx 行数合理", (() => {
  const lines = countLines("src/app/reading/page.tsx");
  return lines < 300;
})(), `${countLines("src/app/reading/page.tsx")} 行 (< 300)`);

check("B", "状态机定义存在", (() => {
  const types = readFile("src/features/reading/types/reading.ts");
  return types.includes("ReadingStage");
})(), "ReadingStage 类型已定义");

check("B", "抽牌与生成分离", (() => {
  const session = readFile("src/features/reading/hooks/useReadingSession.ts");
  return session.includes("draw") && session.includes("generate");
})(), "useReadingSession 包含抽牌和生成逻辑");

check("B", "本地 fallback 存在", (() => {
  return fileExists("src/features/reading/lib/buildLocalFallbackReading.ts");
})(), "本地 fallback 解读生成器存在");

check("B", "SSE 流式端点存在", (() => {
  return fileExists("src/app/api/reading/generate/stream/route.ts");
})(), "SSE 流式生成端点存在");

// ═══════════════════════════════════════════════
// C. 视觉系统与美感一致性
// ═══════════════════════════════════════════════
console.log("\n📋 C. 视觉系统与美感一致性");

check("C", "Theme tokens 完整", (() => {
  const css = readFile("src/app/globals.css");
  return css.includes("--bg-base") && css.includes("--surface") && css.includes("--text-primary");
})(), "globals.css 包含完整 theme tokens");

check("C", "明暗双主题定义", (() => {
  const css = readFile("src/app/globals.css");
  return css.includes('data-theme="dark"') && css.includes('data-theme="light"');
})(), "暗色和浅色主题均已定义");

check("C", "字体系统定义", (() => {
  const css = readFile("src/app/globals.css");
  return css.includes("--font-sans") && css.includes("--font-serif-like") && css.includes("--font-mono");
})(), "三层字体系统已定义");

check("C", "LuminousLayer 存在", (() => {
  return fileExists("src/components/LuminousLayer.tsx");
})(), "微光层组件存在");

check("C", "ArchiveEmblems 存在", (() => {
  return fileExists("src/components/ArchiveEmblems.tsx");
})(), "装饰元素组件存在");

// ═══════════════════════════════════════════════
// D. 动效与交互手感
// ═══════════════════════════════════════════════
console.log("\n📋 D. 动效与交互手感");

check("D", "GSAP 已安装", (() => {
  return fileExists("node_modules/gsap/package.json");
})(), "gsap 包已安装");

check("D", "@gsap/react 已安装", (() => {
  return fileExists("node_modules/@gsap/react/package.json");
})(), "@gsap/react 包已安装");

check("D", "Motion tokens 存在", (() => {
  return fileExists("src/features/motion/motionTokens.ts");
})(), "motionTokens.ts 存在");

check("D", "Card Reveal GSAP 实现", (() => {
  const comp = readFile("src/components/CardReveal.tsx");
  return comp.includes("gsap") && comp.includes("createCardRevealTimeline") || comp.includes("gsap.timeline");
})(), "CardReveal 使用 GSAP timeline");

check("D", "MotifCanvas Phase2 DOM 连接线", (() => {
  const comp = readFile("src/components/MotifCanvas.tsx");
  const hook = fileExists("src/hooks/useMotifConnector.ts");
  const measure = fileExists("src/lib/motifConnectorPath.ts");
  return (
    comp.includes("archive-layout") &&
    comp.includes("MotifNote") &&
    comp.includes("useMotifConnector") &&
    comp.includes("motif-connector") &&
    hook &&
    measure
  );
})(), "档案标注：三栏 + 仅 active 时 DOM 测位连接线");

check("D", "prefers-reduced-motion 支持", (() => {
  const hook = fileExists("src/features/motion/useReducedMotion.ts");
  const css = readFile("src/app/globals.css").includes("prefers-reduced-motion");
  return hook && css;
})(), "useReducedMotion hook + CSS media query 均存在");

check("D", "Cursor glow hook 存在", (() => {
  return fileExists("src/features/motion/useCursorGlow.ts");
})(), "useCursorGlow hook 存在");

check("D", "Handwritten line 工具存在", (() => {
  return fileExists("src/features/motion/handwrittenLine.gsap.ts");
})(), "handwrittenLine.gsap.ts 存在");

// ═══════════════════════════════════════════════
// E. 女性友好与情绪安全
// ═══════════════════════════════════════════════
console.log("\n📋 E. 女性友好与情绪安全");

check("E", "禁用词清单充足", (() => {
  const shared = readFile("src/lib/rulesGuard.shared.ts");
  // Count quoted strings in BANNED_SUBSTRINGS array
  const arrayMatch = shared.match(/BANNED_SUBSTRINGS:\s*string\[\]\s*=\s*\[([\s\S]*?)\];/);
  if (!arrayMatch) return false;
  const items = arrayMatch[1].match(/"[^"]+"/g);
  return Boolean(items && items.length > 30);
})(), "BANNED_SUBSTRINGS 包含 30+ 条禁用词");

check("E", "感情承诺禁用词存在", (() => {
  const shared = readFile("src/lib/rulesGuard.shared.ts");
  return shared.includes("他一定爱你") && shared.includes("他会回来");
})(), "感情承诺类禁用词已覆盖");

check("E", "命运/宿命禁用词存在", (() => {
  const shared = readFile("src/lib/rulesGuard.shared.ts");
  return shared.includes("命中注定") && shared.includes("宿命");
})(), "命运/宿命类禁用词已覆盖");

check("E", "强制性话术禁用词存在", (() => {
  const shared = readFile("src/lib/rulesGuard.shared.ts");
  return shared.includes("你必须") && shared.includes("无法改变");
})(), "强制性话术禁用词已覆盖");

check("E", "rulesGuard 运行时校验存在", (() => {
  return fileExists("src/lib/rulesGuard.ts");
})(), "rulesGuard.ts 存在");

check("E", "反刍检测存在", (() => {
  return fileExists("src/features/reading/lib/ruminationCheck.ts");
})(), "反刍检测逻辑存在");

// ═══════════════════════════════════════════════
// F. 响应式与可访问性
// ═══════════════════════════════════════════════
console.log("\n📋 F. 响应式与可访问性");

check("F", "MotifCanvas 有移动端适配", (() => {
  const comp = readFile("src/components/MotifCanvas.tsx");
  return comp.includes("motif-canvas-mobile");
})(), "MotifCanvas 包含移动端布局");

check("F", "Motif 锚点有 aria-label", (() => {
  const comp = readFile("src/components/MotifCanvas.tsx");
  return comp.includes("aria-label") && comp.includes("motif-anchor");
})(), "锚点按钮包含 aria-label");

check("F", "Playwright 配置存在", (() => {
  return fileExists("playwright.config.ts");
})(), "playwright.config.ts 存在");

// ═══════════════════════════════════════════════
// G. 产品差异化与记忆点
// ═══════════════════════════════════════════════
console.log("\n📋 G. 产品差异化与记忆点");

check("G", "ReadingScript 类型存在", (() => {
  return fileExists("src/types/readingScript.ts") || fileExists("src/features/reading/types/reading.ts");
})(), "ReadingScript 类型已定义");

check("G", "tarot_rules.md 规则文档存在", (() => {
  return fileExists("tarot_rules.md");
})(), "tarot_rules.md 存在");

check("G", "MOTION_SYSTEM.md 文档存在", (() => {
  return fileExists("docs/MOTION_SYSTEM.md");
})(), "动效体系文档存在");

check("G", "motion-lab 演示页存在", (() => {
  return fileExists("src/app/motion-lab/page.tsx");
})(), "motion-lab 原型验证页存在");

// ═══════════════════════════════════════════════
// 生成报告
// ═══════════════════════════════════════════════
console.log("\n📊 生成报告...");

const categories = [
  { key: "A", name: "信息架构与用户路径", max: 15 },
  { key: "B", name: "交互逻辑与状态一致性", max: 15 },
  { key: "C", name: "视觉系统与美感一致性", max: 20 },
  { key: "D", name: "动效与交互手感", max: 15 },
  { key: "E", name: "女性友好与情绪安全", max: 15 },
  { key: "F", name: "响应式与可访问性", max: 10 },
  { key: "G", name: "产品差异化与记忆点", max: 10 },
];

let totalScore = 0;
const categoryScores: Array<{ key: string; name: string; score: number; max: number; pct: number }> = [];

for (const cat of categories) {
  const catResults = results.filter((r) => r.category === cat.key);
  const passed = catResults.filter((r) => r.passed).length;
  const pct = catResults.length > 0 ? passed / catResults.length : 0;
  const score = Math.round(pct * cat.max);
  totalScore += score;
  categoryScores.push({ key: cat.key, name: cat.name, score, max: cat.max, pct });
}

function getGrade(score: number): string {
  if (score >= 90) return "产品级 — 可作为样本展示";
  if (score >= 80) return "体验成立 — 基本可用，局部割裂";
  if (score >= 70) return "原型可用 — 美感和交互不稳定";
  if (score >= 60) return "页面能跑 — 产品感不足";
  return "Demo 拼接 — 仍像实验页面";
}

const now = new Date().toISOString().split("T")[0];

let report = `# Frontend Experience Benchmark Report

> 自动生成于 ${now}
> 运行命令: \`npx tsx scripts/run_frontend_benchmark.ts\`

---

## 总分: ${totalScore} / 100

**评级: ${getGrade(totalScore)}**

| 类别 | 得分 | 满分 | 通过率 |
|------|------|------|--------|
${categoryScores.map((c) => `| ${c.key}. ${c.name} | ${c.score} | ${c.max} | ${Math.round(c.pct * 100)}% |`).join("\n")}

---

## 检查结果明细

`;

for (const cat of categories) {
  const catResults = results.filter((r) => r.category === cat.key);
  report += `### ${cat.key}. ${cat.name}\n\n`;
  report += `| 检查项 | 状态 | 详情 |\n|--------|------|------|\n`;
  for (const r of catResults) {
    const icon = r.passed ? "✅" : "❌";
    report += `| ${r.name} | ${icon} | ${r.detail} |\n`;
  }
  report += "\n";
}

// 失败项汇总
const failed = results.filter((r) => !r.passed);
if (failed.length > 0) {
  report += `---\n\n## 未通过项 (${failed.length})\n\n`;
  for (const f of failed) {
    report += `- **[${f.category}] ${f.name}**: ${f.detail}\n`;
  }
  report += "\n";
}

// 人工审查清单
report += `---

## 人工审查清单

每张截图问 5 个问题（每题 1-5 分）：

1. 我一眼知道这是哪里吗？
2. 我知道下一步能做什么吗？
3. 页面元素像同一个产品吗？
4. 动效/交互是否像"靠近"，而不是"命令"？
5. 这个页面有女性友好的边界感吗？

### 需要截图的页面

- [ ] homepage-light.png
- [ ] homepage-dark.png
- [ ] reading-card-revealed.png
- [ ] archive-hotspot-active.png
- [ ] notes-list.png
- [ ] mobile-homepage.png
`;

fs.mkdirSync(REPORT_DIR, { recursive: true });
fs.writeFileSync(REPORT_PATH, report, "utf-8");

console.log(`\n✅ 报告已生成: ${REPORT_PATH}`);
console.log(`\n📊 总分: ${totalScore} / 100 — ${getGrade(totalScore)}`);
