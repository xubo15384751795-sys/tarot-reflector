/**
 * 截图脚本 —— 为 README 生成视觉 proof。
 * 用法：npx tsx scripts/capture_screenshots.ts [baseUrl]
 * 默认对本地已运行的 dev server (http://localhost:3000) 截图。
 */
import { chromium, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = process.argv[2] ?? "http://localhost:3000";
const OUT = path.join(process.cwd(), "docs", "screenshots");

async function shoot(page: Page, name: string) {
  await page.screenshot({ path: path.join(OUT, `${name}.png`) });
  console.log(`  ✓ ${name}.png`);
}

async function settle(page: Page, ms = 1100) {
  await page.waitForTimeout(ms);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();

  // ── Desktop ──
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 860 },
    deviceScaleFactor: 2,
    colorScheme: "dark",
  });
  const page = await ctx.newPage();

  console.log("home (desktop)…");
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await settle(page);
  await shoot(page, "home");

  console.log("archive…");
  await page.goto(`${BASE}/archive`, { waitUntil: "networkidle" });
  await settle(page, 1400);
  await shoot(page, "archive");

  console.log("card-detail (live card face)…");
  // 打开第一张牌的档案详情 —— 可点击金点的「活牌面」
  const firstCard = page.locator(".archive-thumb").first();
  await firstCard.click();
  await settle(page, 1400);
  await shoot(page, "card-detail");
  await page.keyboard.press("Escape");
  await settle(page, 400);

  console.log("reading (single card)…");
  await page.goto(`${BASE}/reading?mode=daily`, { waitUntil: "networkidle" });
  await settle(page, 2600);
  await shoot(page, "reading");

  await ctx.close();

  // ── Mobile ──
  const mctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    colorScheme: "dark",
    isMobile: true,
  });
  const mpage = await mctx.newPage();
  console.log("home (mobile)…");
  await mpage.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await settle(mpage);
  await shoot(mpage, "home-mobile");
  await mctx.close();

  await browser.close();
  console.log(`\nDone → ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
