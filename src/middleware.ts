import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * 内部 / 演示页面隔离。
 * /demo、/lab/*、/motion-lab/*、/explain 是开发期工具页
 * （视觉与产品不一致），仅在开发环境可访问；生产环境一律 404，
 * 避免产品感泄漏。
 *
 * /explain 是后加进来的：它自称「短视频科普工作台」，页面顶部是
 * 9:16 / 1:1 / 16:9 导出比例、每幕时长、「纯净录屏」，docblock 里写着
 * 「URL 参数（OBS / 录屏场景预设）」。这是团队做短视频用的工具，
 * 和 /demo 同类，但一直没被隔离，还从 /guide 的「快捷入口」公开链出去。
 */
const INTERNAL = [
  /^\/demo(?:\/|$)/,
  /^\/lab(?:\/|$)/,
  /^\/motion-lab(?:\/|$)/,
  /^\/explain(?:\/|$)/,
];

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
  matcher: [
    "/demo",
    "/lab/:path*",
    "/motion-lab",
    "/motion-lab/:path*",
    "/explain",
    "/explain/:path*",
  ],
};
