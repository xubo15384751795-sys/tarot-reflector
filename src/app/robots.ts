/**
 * robots.txt
 *
 * 允许全部公开页索引；屏蔽 /api/ 和带 session 参数的 /reading 详情。
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
        allow: ["/", "/archive", "/explain", "/notes"],
        disallow: ["/api/", "/reading?*"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
