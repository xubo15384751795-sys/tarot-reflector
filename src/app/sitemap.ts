/**
 * Sitemap · 静态路由清单
 *
 * Next.js app router 自动从这里生成 /sitemap.xml。
 * 动态页（/reading 带 query）不进 sitemap——它们是 ephemeral session URL，
 * 不需要 SEO 索引。
 *
 * 内部工具页（/demo、/lab/*、/motion-lab/*、/explain）同样不进：
 * 它们在生产环境由 middleware 一律 404，列进 sitemap 只会给搜索引擎
 * 送一堆死链。/explain 之前就在这里，是个遗留。
 */

import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/archive`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/guide`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/notes`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.4,
    },
  ];
}
