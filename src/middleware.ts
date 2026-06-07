import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * 内部 / 演示页面隔离。
 * /demo、/lab/*、/motion-lab/* 是开发期工具页（视觉与产品不一致），
 * 仅在开发环境可访问；生产环境一律 404，避免产品感泄漏。
 */
const INTERNAL = [/^\/demo(?:\/|$)/, /^\/lab(?:\/|$)/, /^\/motion-lab(?:\/|$)/];

export function middleware(req: NextRequest) {
  if (
    process.env.NODE_ENV === "production" &&
    INTERNAL.some((re) => re.test(req.nextUrl.pathname))
  ) {
    return new NextResponse(null, { status: 404 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/demo", "/lab/:path*", "/motion-lab", "/motion-lab/:path*"],
};
