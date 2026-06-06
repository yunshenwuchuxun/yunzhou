import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, TTL_MS, signToken, getSecret, getPassword } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let password = "";
  try {
    ({ password } = await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: "bad request" }, { status: 400 });
  }
  if (password !== getPassword()) {
    return NextResponse.json({ ok: false, error: "密码错误" }, { status: 401 });
  }
  const token = await signToken(getSecret());
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(TTL_MS / 1000),
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE_NAME);
  return res;
}
