import { NextRequest, NextResponse } from "next/server";
import { loadState, saveState } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const data = await loadState();
  return NextResponse.json({ data });
}

export async function PUT(req: NextRequest) {
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
