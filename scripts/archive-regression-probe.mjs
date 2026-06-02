/**
 * Archive layout probe — detects horizontal strips and missing thumb images.
 * Usage: node scripts/archive-regression-probe.mjs [url]
 */
import { chromium } from "playwright";

const url = process.argv[2] ?? "http://localhost:3025/archive";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });
await page.waitForSelector(".cards-grid .archive-thumb", { timeout: 20_000 });

const report = await page.evaluate(() => {
  const thumbs = Array.from(document.querySelectorAll(".archive-thumb"));
  const frames = thumbs.map((t) => t.querySelector(".card-thumb-frame__image"));
  const imgStats = frames.map((frame, i) => {
    if (!frame) return { i, error: "no-frame" };
    const img = frame.querySelector("img");
    const r = frame.getBoundingClientRect();
    const ir = img?.getBoundingClientRect();
    const ratio = r.width / Math.max(r.height, 1);
    return {
      i,
      frameW: Math.round(r.width),
      frameH: Math.round(r.height),
      aspect: Number(ratio.toFixed(2)),
      stripLike: ratio > 1.35,
      hasImg: Boolean(img),
      imgVisible: img ? img.complete && ir.width > 4 && ir.height > 4 : false,
      imgOpacity: img ? getComputedStyle(img).opacity : null,
    };
  });
  const stripCount = imgStats.filter((s) => s.stripLike).length;
  const missingImg = imgStats.filter((s) => !s.imgVisible).length;
  const groupCards = document.querySelectorAll(".archive-glass-card");
  const groupStyles = Array.from(groupCards).slice(0, 5).map((el) => {
    const s = getComputedStyle(el);
    return {
      opacity: s.opacity,
      visibility: s.visibility,
      transform: s.transform,
    };
  });
  return {
    thumbCount: thumbs.length,
    stripCount,
    missingImg,
    worst: imgStats.filter((s) => s.stripLike || !s.imgVisible).slice(0, 5),
    groupStyles,
    consoleErrors: [],
  };
});

console.log(JSON.stringify({ url, ...report }, null, 2));
await browser.close();
