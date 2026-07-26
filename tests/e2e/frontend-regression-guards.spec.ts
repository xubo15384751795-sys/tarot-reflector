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
  /**
   * 内容不得依赖 JS 才可见。
   *
   * 这条在本分支上栽过三次：
   *   1. HeroTitleSplit 把 <h1> 渲染成 opacity:0，等 GSAP 抬起来；
   *   2. 快照卡的「删除」用 Framer 内联 opacity:1 压过了 CSS 的 opacity:0；
   *   3. 首页整屏 + 三个入口带着 opacity:0 发出 SSR HTML，
   *      JS 不跑就只剩一条顶栏。
   *
   * 首页是预渲染的，所以 initial={{opacity:0}} 会真的写进 HTML。
   * 关掉 JS 跑一遍是唯一可靠的验法。
   */
  test("home — 关闭 JS 时首页内容依然可见", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto("/", { waitUntil: "domcontentloaded" });

    /**
     * 必须算上祖先的 opacity。
     * opacity 不继承：包在 opacity:0 的 div 里的按钮，自己的
     * computed opacity 仍是 1。第一版守卫就是这么写的，把 bug 放了过去。
     * checkVisibility({opacityProperty:true}) 会把整条祖先链算进来。
     */
    const visible = async (selector: string) =>
      page.evaluate(
        (sel) =>
          [...document.querySelectorAll(sel)].filter((e) => {
            const r = e.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) return false;
            return (e as HTMLElement).checkVisibility({
              opacityProperty: true,
              visibilityProperty: true,
            });
          }).length,
        selector,
      );

    // 三个入口是首页最不能丢的东西
    expect(await visible(".mode-deck-slot")).toBe(3);
    expect(await visible(".hero-title")).toBe(1);

    // 任何已布局的文本节点都不该停在 opacity:0
    const stranded = await page.evaluate(() =>
      [...document.querySelectorAll("p,h1,h2,h3,span,a,button,li")]
        .filter((e) => (e.textContent ?? "").trim().length > 1)
        .filter((e) => {
          const r = e.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) return false;
          // 已经占了版面，却因为自身或祖先的 opacity 而看不见
          return !(e as HTMLElement).checkVisibility({
            opacityProperty: true,
            visibilityProperty: true,
          });
        })
        .map((e) => e.tagName + "." + String(e.className).slice(0, 40)),
    );
    expect(stranded, `这些文本在无 JS 时不可见: ${stranded.join(", ")}`).toEqual([]);

    await ctx.close();
  });

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
