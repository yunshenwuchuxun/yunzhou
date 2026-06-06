import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { loadState, saveState } from "@/lib/db";
import { COOKIE_NAME, getSecret, verifyToken } from "@/lib/auth";

export const runtime = "nodejs";

// 二次校验会话（不仅依赖 proxy 守卫，防止中间件被绕过）。
async function requireAuth(): Promise<NextResponse | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token || !(await verifyToken(getSecret(), token))) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const denied = await requireAuth();
  if (denied) return denied;
  const data = await loadState();
  return NextResponse.json({ data });
}

export async function PUT(req: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;
  let body: { data?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad request" }, { status: 400 });
  }
  if (body.data == null) {
    return NextResponse.json({ ok: false, error: "no data" }, { status: 400 });
  }
  await saveState(body.data);
  return NextResponse.json({ ok: true });
}
