import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

const OUT = path.join("test-results", "regression");

test.beforeAll(() => {
  fs.mkdirSync(OUT, { recursive: true });
});

async function setTheme(page: import("@playwright/test").Page, theme: "light" | "dark") {
  await page.evaluate((t) => {
    document.documentElement.setAttribute("data-theme", t);
  }, theme);
}

test.describe("Frontend regression DOM guards", () => {
  test("guide — no concatenated rail index string", async ({ page }) => {
    await page.goto("/guide");
    await page.waitForSelector(".guide-shell");
    await expect(page.locator("text=0102030405060708+")).toHaveCount(0);
    await expect(
      page.locator(".guide-rail button").filter({ hasNotText: "+" }),
    ).toHaveCount(8);
    expect(await page.locator(".guide-section").count()).toBeGreaterThanOrEqual(8);
  });

  test("archive — thumbnail aspect ratio guard", async ({ page }) => {
    await page.goto("/archive");
    await page.waitForSelector(".cards-grid .archive-thumb");
    const frame = page.locator(".card-thumb-frame__image").first();
    const box = await frame.boundingBox();
    expect(box).not.toBeNull();
    const ratio = box!.height / box!.width;
    expect(ratio, "horizontal strip if ratio < 1.2").toBeGreaterThan(1.45);
    expect(ratio).toBeLessThan(1.95);
  });

  test("archive — grid and minimum thumb count", async ({ page }) => {
    await page.goto("/archive");
    await page.waitForSelector(".cards-grid");
    await expect(page.locator(".cards-grid")).toHaveCount(1);
    expect(await page.locator(".archive-thumb").count()).toBeGreaterThanOrEqual(6);
    expect(await page.locator(".card-thumb-frame__image img").count()).toBeGreaterThanOrEqual(6);
  });

  test("home — hero not top-left; mode cards", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector(".home-page");
    const heroTitle = page.locator(".home-page h1, .home-page .hero-title-split").first();
    await expect(heroTitle).toBeVisible();
    const box = await heroTitle.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x, "hero title stuck top-left").toBeGreaterThan(40);
    await expect(page.locator(".mode-card")).toHaveCount(3);
  });
});

test.describe("Frontend regression screenshots", () => {
  test("archive-light", async ({ page }) => {
    await page.goto("/archive");
    await setTheme(page, "light");
    await page.waitForSelector(".cards-grid .archive-thumb");
    await page.screenshot({ path: path.join(OUT, "archive-light.png"), fullPage: true });
  });

  test("archive-dark", async ({ page }) => {
    await page.goto("/archive");
    await setTheme(page, "dark");
    await page.waitForSelector(".cards-grid .archive-thumb");
    await page.screenshot({ path: path.join(OUT, "archive-dark.png"), fullPage: true });
  });

  test("guide", async ({ page }) => {
    await page.goto("/guide");
    await page.waitForSelector(".guide-shell");
    await page.screenshot({ path: path.join(OUT, "guide.png"), fullPage: true });
  });

  test("home", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector(".home-page");
    await page.screenshot({ path: path.join(OUT, "home.png"), fullPage: true });
  });

  test("mobile-archive", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/archive");
    await page.waitForSelector(".cards-grid .archive-thumb");
    await page.screenshot({ path: path.join(OUT, "mobile-archive.png"), fullPage: true });
  });
});
