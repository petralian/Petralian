import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ENZO_SITE_HOST } from "@/lib/enzo-site";

const ENZO_HEADER = "x-enzo-site";

function isEnzoHost(host: string): boolean {
  const bare = host.split(":")[0];
  return bare === ENZO_SITE_HOST || bare === "enzo.localhost";
}

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const { pathname } = request.nextUrl;
  const onEnzoHost = isEnzoHost(host);
  const onEnzoPath = pathname === "/enzo" || pathname.startsWith("/enzo/");

  if (onEnzoHost && !onEnzoPath) {
    const url = request.nextUrl.clone();
    const suffix = pathname === "/" ? "" : pathname;
    url.pathname = `/enzo${suffix}`;
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(ENZO_HEADER, "1");
    return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  }

  if (onEnzoPath || onEnzoHost) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(ENZO_HEADER, "1");
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/).*)"],
};
