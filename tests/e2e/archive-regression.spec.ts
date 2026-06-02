import { test } from "@playwright/test";
import fs from "fs";
import path from "path";

const REGRESSION_DIR = path.join("test-results", "regression");

const ARCHIVE_MOTION_FLAGS = [
  "heroEntrance",
  "groupCardsEntrance",
  "thumbEntrance",
  "thumbHover",
  "cursorGlow",
  "scrollReveal",
] as const;

test.beforeAll(() => {
  fs.mkdirSync(REGRESSION_DIR, { recursive: true });
});

async function setTheme(page: import("@playwright/test").Page, theme: "light" | "dark") {
  await page.evaluate((t) => {
    document.documentElement.setAttribute("data-theme", t);
  }, theme);
}

async function waitForArchiveGrid(page: import("@playwright/test").Page) {
  await page.waitForSelector(".cards-grid .archive-thumb", { timeout: 20_000 });
}

async function captureArchive(
  page: import("@playwright/test").Page,
  fileName: string,
  options?: { theme?: "light" | "dark"; motionQuery?: string; mobile?: boolean },
) {
  if (options?.mobile) {
    await page.setViewportSize({ width: 390, height: 844 });
  }
  const query = options?.motionQuery ? `?${options.motionQuery}` : "";
  await page.goto(`/archive${query}`);
  if (options?.theme) await setTheme(page, options.theme);
  await waitForArchiveGrid(page);
  await page.waitForTimeout(600);
  await page.screenshot({
    path: path.join(REGRESSION_DIR, fileName),
    fullPage: true,
  });
}

test.describe("Archive regression baselines", () => {
  test("archive-baseline-light", async ({ page }) => {
    await captureArchive(page, "archive-baseline-light.png", { theme: "light" });
  });

  test("archive-baseline-dark", async ({ page }) => {
    await captureArchive(page, "archive-baseline-dark.png", { theme: "dark" });
  });

  test("archive-baseline-mobile", async ({ page }) => {
    await captureArchive(page, "archive-baseline-mobile.png", {
      theme: "dark",
      mobile: true,
    });
  });
});

test.describe("Archive motion flag isolation", () => {
  for (const flag of ARCHIVE_MOTION_FLAGS) {
    test(`archive-flag-${flag}`, async ({ page }) => {
      await captureArchive(page, `archive-flag-${flag}.png`, {
        theme: "light",
        motionQuery: `archiveMotion=${flag}`,
      });
    });
  }
});

test.describe("Archive legacy motion switch", () => {
  test("archive-motion-on-light", async ({ page }) => {
    await captureArchive(page, "archive-motion-on-light.png", { theme: "light" });
  });

  test("archive-motion-on-dark", async ({ page }) => {
    await captureArchive(page, "archive-motion-on-dark.png", { theme: "dark" });
  });
});
