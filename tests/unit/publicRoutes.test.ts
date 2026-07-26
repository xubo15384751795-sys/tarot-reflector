/**
 * 对外路由与内部工具页的一致性。
 *
 * 起因：/explain 是团队做短视频用的工具（9:16 导出比例、纯净录屏模式、
 * OBS 参数预设），却既没被 middleware 隔离，又同时出现在 sitemap.xml、
 * robots.txt 的 allow 列表，还从 /guide 的「快捷入口」公开链出去。
 *
 * 这里锁的是：内部工具页不得出现在任何对外清单里。
 * 三份清单各自独立维护，很容易再次漂移。
 */
import { describe, expect, it } from "vitest";
import { config } from "@/middleware";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";

/** 生产环境应当 404 的内部工具页 */
const INTERNAL_ROUTES = ["/demo", "/lab", "/motion-lab", "/explain"];

/** 真正对外的产品页 */
const PUBLIC_ROUTES = ["/", "/archive", "/guide", "/notes"];

describe("对外路由清单", () => {
  it("每个内部工具页都被 middleware matcher 覆盖", () => {
    const matcher = config.matcher as string[];
    for (const route of INTERNAL_ROUTES) {
      const covered = matcher.some(
        (m) => m === route || m.startsWith(`${route}/`),
      );
      expect(covered, `${route} 不在 middleware matcher 里，生产环境不会 404`).toBe(
        true,
      );
    }
  });

  it("sitemap 不含任何内部工具页", () => {
    const paths = sitemap().map((e) => new URL(e.url).pathname);
    for (const route of INTERNAL_ROUTES) {
      expect(
        paths.some((p) => p === route || p.startsWith(`${route}/`)),
        `${route} 出现在 sitemap 里 —— 它在生产环境 404，等于给搜索引擎送死链`,
      ).toBe(false);
    }
  });

  it("robots 的 allow 不含任何内部工具页", () => {
    const rules = robots().rules;
    const allow = (Array.isArray(rules) ? rules : [rules]).flatMap((r) => {
      const a = r.allow;
      return a == null ? [] : Array.isArray(a) ? a : [a];
    });
    for (const route of INTERNAL_ROUTES) {
      expect(
        allow.includes(route),
        `${route} 出现在 robots.txt 的 allow 里`,
      ).toBe(false);
    }
  });

  it("每个对外产品页都同时出现在 sitemap 和 robots allow 里", () => {
    const paths = sitemap().map((e) => new URL(e.url).pathname || "/");
    const rules = robots().rules;
    const allow = (Array.isArray(rules) ? rules : [rules]).flatMap((r) => {
      const a = r.allow;
      return a == null ? [] : Array.isArray(a) ? a : [a];
    });
    for (const route of PUBLIC_ROUTES) {
      expect(paths, `${route} 不在 sitemap 里`).toContain(route);
      expect(allow, `${route} 不在 robots allow 里`).toContain(route);
    }
  });
});
