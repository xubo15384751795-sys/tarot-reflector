import { test } from "@playwright/test";
import fs from "fs";
import path from "path";

/**
 * Karpathy visual gate — reference labs + production pages.
 * Run: npm run test:karpathy-visual
 * Output: test-results/karpathy-visual/
 */

const OUT_DIR = path.join("test-results", "karpathy-visual");

test.beforeAll(() => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
});

async function setTheme(page: import("@playwright/test").Page, theme: "light" | "dark") {
  await page.evaluate((t) => {
    document.documentElement.setAttribute("data-theme", t);
  }, theme);
}

test.describe("Karpathy Reference Visual Gate", () => {
  test("lab archive reference", async ({ page }) => {
    await page.goto("/lab/archive-reference");
    await setTheme(page, "light");
    await page.waitForTimeout(800);
    await page.screenshot({
      path: path.join(OUT_DIR, "lab-archive-reference.png"),
      fullPage: true,
    });
  });

  test("lab reading reference", async ({ page }) => {
    await page.goto("/lab/reading-reference");
    await setTheme(page, "dark");
    await page.waitForTimeout(800);
    await page.screenshot({
      path: path.join(OUT_DIR, "lab-reading-reference.png"),
      fullPage: true,
    });
  });

  test("lab motif reference", async ({ page }) => {
    await page.goto("/lab/motif-reference");
    await setTheme(page, "dark");
    await page.waitForTimeout(800);
    await page.screenshot({
      path: path.join(OUT_DIR, "lab-motif-reference.png"),
      fullPage: true,
    });
  });

  test("archive production", async ({ page }) => {
    await page.goto("/archive");
    await setTheme(page, "light");
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(OUT_DIR, "archive-production.png"),
      fullPage: true,
    });
  });

  test("home production", async ({ page }) => {
    await page.goto("/");
    await setTheme(page, "light");
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(OUT_DIR, "home-production.png"),
      fullPage: true,
    });
  });
});
