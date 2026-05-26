import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "阈牌｜中文动态塔罗解读",
  description: "基于 Rider–Waite–Smith 传统牌义的中文动态塔罗反思工具。",
  openGraph: {
    title: "阈牌｜中文动态塔罗解读",
    description: "翻开一页档案，看见你问题的结构。",
    type: "website" as const,
    images: [
      {
        url: "/og/default.png",
        width: 1200,
        height: 630,
        alt: "阈牌",
      },
    ],
  },
  twitter: {
    card: "summary_large_image" as const,
    title: "阈牌",
    description: "翻开一页档案，看见你问题的结构。",
    images: ["/og/default.png"],
  },
};

/**
 * 首屏注入主题：在 React 水合之前直接读 localStorage 并设置 data-theme，
 * 避免页面加载时先闪一下默认深色再切到浅色。
 *
 * 不依赖 next/script 因为我们需要 beforeInteractive 时机，
 * 直接用 dangerouslySetInnerHTML 写在 <head> 里。
 */
const THEME_INIT_SCRIPT = `
try {
  var saved = localStorage.getItem('tarot:theme');
  if (saved === 'light' || saved === 'dark') {
    document.documentElement.setAttribute('data-theme', saved);
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
} catch (e) {
  document.documentElement.setAttribute('data-theme', 'dark');
}
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased" data-theme="dark" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.7.0/style.css"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col relative">{children}</body>
    </html>
  );
}
