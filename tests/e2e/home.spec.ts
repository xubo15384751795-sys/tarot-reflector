import { expect, test } from "@playwright/test";

test("home page shows three reading modes", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("今日一牌")).toBeVisible();
  await expect(page.getByText("问题解读")).toBeVisible();
  await expect(page.getByText("深度牌阵")).toBeVisible();
});

test("home page shows hero title", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("翻开一页档案")).toBeVisible();
});
