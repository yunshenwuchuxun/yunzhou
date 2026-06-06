import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, verifyToken, getSecret } from "@/lib/auth";

// 拦截除登录页、登录接口与静态资源外的所有请求，校验会话 cookie。
// Next 16 用 proxy 取代旧的 middleware 约定。
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|login|api/auth).*)"],
};

export default async function proxy(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (token && (await verifyToken(getSecret(), token))) {
    return NextResponse.next();
  }
  if (req.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  return NextResponse.redirect(url);
}
