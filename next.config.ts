import type { NextConfig } from "next";

// PACKAGE_BUILD=1 时切到「可分发离线包」模式：
//  - standalone：只打包运行所需的最小依赖，配自带 Node 即可双击运行
//  - images.unoptimized：不依赖 sharp 原生二进制，跨机器更稳
// 普通 / Vercel 构建不设此变量，行为完全不变。
const isPackageBuild = process.env.PACKAGE_BUILD === "1";

const nextConfig: NextConfig = {
  turbopack: {
    root: import.meta.dirname,
  },
  ...(isPackageBuild
    ? { output: "standalone" as const, images: { unoptimized: true } }
    : {}),
};

export default nextConfig;
