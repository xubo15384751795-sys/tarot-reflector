/**
 * robots.txt
 *
 * 允许全部公开页索引；屏蔽 /api/ 和带 session 参数的 /reading 详情。
 *
 * 只列真正对外的页。/explain 曾经在 allow 里，但它是团队录屏工具，
 * 生产环境已 404 —— 顺带补上一直漏掉的 /guide（它在顶栏里，是公开页）。
 * /reading 路由本身可索引（落地到首页跳转），但具体 query 参数承载的是
 * 用户私密上下文，不应被搜索引擎收录。
 */

import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/archive", "/guide", "/notes"],
        disallow: ["/api/", "/reading?*"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
