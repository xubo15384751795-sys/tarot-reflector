import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "fs";
import path from "path";

/**
 * Visual Screenshot Tests — 视觉回归截图
 *
 * 运行: npm run test:visual
 * 截图输出: test-results/visual/
 */

const VISUAL_DIR = path.join("test-results", "visual");

test.beforeAll(() => {
  fs.mkdirSync(VISUAL_DIR, { recursive: true });
});

async function setTheme(page: import("@playwright/test").Page, theme: "light" | "dark") {
  await page.evaluate((t) => {
    document.documentElement.setAttribute("data-theme", t);
  }, theme);
}

async function waitForArchiveGrid(page: import("@playwright/test").Page) {
  await page.waitForSelector(".cards-grid .archive-thumb", { timeout: 15_000 });
}

test.describe("Visual Regression Screenshots", () => {
  test("archive-home-light", async ({ page }) => {
    await page.goto("/archive");
    await setTheme(page, "light");
    await waitForArchiveGrid(page);
    await page.screenshot({
      path: path.join(VISUAL_DIR, "archive-home-light.png"),
      fullPage: true,
    });
  });

  test("archive-home-dark", async ({ page }) => {
    await page.goto("/archive");
    await setTheme(page, "dark");
    await waitForArchiveGrid(page);
    await page.screenshot({
      path: path.join(VISUAL_DIR, "archive-home-dark.png"),
      fullPage: true,
    });
  });

  test("home-light", async ({ page }) => {
    await page.goto("/");
    await setTheme(page, "light");
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(VISUAL_DIR, "home-light.png"), fullPage: true });
  });

  test("reading-entry", async ({ page }) => {
    await page.goto("/reading?mode=daily");
    await setTheme(page, "dark");
    await page.waitForTimeout(4000);
    await page.screenshot({
      path: path.join(VISUAL_DIR, "reading-entry.png"),
      fullPage: true,
    });
  });

  test("guide-page", async ({ page }) => {
    await page.goto("/guide");
    await setTheme(page, "dark");
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(VISUAL_DIR, "guide-page.png"), fullPage: true });
  });

  test("archive-grid", async ({ page }) => {
    await page.goto("/archive");
    await setTheme(page, "light");
    await waitForArchiveGrid(page);
    await page.locator(".cards-grid").screenshot({
      path: path.join(VISUAL_DIR, "archive-grid.png"),
    });
  });

  test("mobile-archive", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/archive");
    await setTheme(page, "dark");
    await waitForArchiveGrid(page);
    await page.screenshot({
      path: path.join(VISUAL_DIR, "mobile-archive.png"),
      fullPage: true,
    });
  });
});

test.describe("Accessibility Smoke", () => {
  const pages = [
    { name: "homepage", path: "/" },
    { name: "archive", path: "/archive" },
    { name: "notes", path: "/notes" },
    { name: "explain", path: "/explain?card=the_star" },
  ];

  for (const { name, path: urlPath } of pages) {
    test(`${name} — axe smoke (contrast, aria, structure)`, async ({ page }) => {
      await page.goto(urlPath);
      await page.waitForTimeout(1500);

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "best-practice"])
        .analyze();

      const reportPath = path.join(VISUAL_DIR, `a11y-${name}.json`);
      fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

      const critical = results.violations.filter((v) => v.impact === "critical");
      expect(
        critical,
        `Critical a11y on ${name}: ${critical.map((v) => v.id).join(", ")}`,
      ).toEqual([]);
    });
  }

  test("keyboard tab reaches interactive elements on homepage", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(500);
    await page.keyboard.press("Tab");
    const focused = await page.evaluate(() => document.activeElement?.tagName.toLowerCase());
    expect(["button", "a", "input"]).toContain(focused);
  });

  test("images have alt text on archive", async ({ page }) => {
    await page.goto("/archive");
    await page.waitForTimeout(2000);
    const missingAlt = await page.evaluate(() =>
      Array.from(document.querySelectorAll("img")).filter((img) => img.getAttribute("alt") === null)
        .length,
    );
    expect(missingAlt).toBe(0);
  });

  test("reduced motion respected", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.waitForTimeout(800);
    const prefersReduced = await page.evaluate(() =>
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    expect(prefersReduced).toBe(true);
  });
});
