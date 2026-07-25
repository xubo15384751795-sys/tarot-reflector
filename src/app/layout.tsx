import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

// metadataBase 用于 Next.js 把相对 og:image 路径解析为绝对 URL；
// 部署时通过 NEXT_PUBLIC_SITE_URL 注入，本地 fallback 到 localhost。
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "阈牌｜中文动态塔罗解读",
    template: "%s · 阈牌",
  },
  description: "基于 Rider–Waite–Smith 传统牌义的中文动态塔罗反思工具——象征性反思，不是命运预测。",
  keywords: [
    "塔罗",
    "塔罗牌",
    "Rider-Waite-Smith",
    "韦特塔罗",
    "心理反思",
    "象征解读",
    "阈牌",
  ],
  authors: [{ name: "阈牌" }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "阈牌｜中文动态塔罗解读",
    description: "翻开一页档案，看见你问题的结构。象征性反思，不是命运预测。",
    type: "website" as const,
    locale: "zh_CN",
    siteName: "阈牌",
    images: [
      {
        url: "/og/default.svg",
        width: 1200,
        height: 630,
        alt: "阈牌 · 中文动态塔罗解读",
      },
    ],
  },
  twitter: {
    card: "summary_large_image" as const,
    title: "阈牌",
    description: "翻开一页档案，看见你问题的结构。",
    images: ["/og/default.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

/** 首屏主题：beforeInteractive，在水合前读 localStorage，避免主题闪烁 */
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Noto+Serif+SC:wght@200;300;400;500&family=ZCOOL+XiaoWei&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col relative">
        <Script id="tarot-theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
        {children}
      </body>
    </html>
  );
}
