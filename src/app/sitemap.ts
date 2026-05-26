/**
 * Sitemap · 静态路由清单
 *
 * Next.js app router 自动从这里生成 /sitemap.xml。
 * 动态页（/reading 带 query）不进 sitemap——它们是 ephemeral session URL，
 * 不需要 SEO 索引。
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
      url: `${SITE_URL}/explain`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/notes`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.4,
    },
  ];
}
