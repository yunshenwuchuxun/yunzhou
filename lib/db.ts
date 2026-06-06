// 状态持久化：单行 JSON 存储。
// - 生产(Vercel)：检测到 POSTGRES_URL 时用 Vercel Postgres，单行 JSONB。
// - 本地开发：无数据库时退回到 .data/state.json 文件，方便直接 pnpm dev。
import { promises as fs } from "fs";
import path from "path";

const ROW_ID = "main";
const usePg = !!process.env.POSTGRES_URL;
const LOCAL_DIR = path.join(process.cwd(), ".data");
const LOCAL_FILE = path.join(LOCAL_DIR, "state.json");

async function ensureTable() {
  const { sql } = await import("@vercel/postgres");
  await sql`CREATE TABLE IF NOT EXISTS app_state (
    id text PRIMARY KEY,
    data jsonb NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now()
  )`;
}

export async function loadState(): Promise<unknown | null> {
  if (usePg) {
    const { sql } = await import("@vercel/postgres");
    await ensureTable();
    const r = await sql`SELECT data FROM app_state WHERE id = ${ROW_ID}`;
    return r.rows[0]?.data ?? null;
  }
  try {
    return JSON.parse(await fs.readFile(LOCAL_FILE, "utf8"));
  } catch {
    return null;
  }
}

export async function saveState(data: unknown): Promise<void> {
  if (usePg) {
    const { sql } = await import("@vercel/postgres");
    await ensureTable();
    await sql`INSERT INTO app_state (id, data, updated_at)
      VALUES (${ROW_ID}, ${JSON.stringify(data)}::jsonb, now())
      ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()`;
    return;
  }
  await fs.mkdir(LOCAL_DIR, { recursive: true });
  await fs.writeFile(LOCAL_FILE, JSON.stringify(data, null, 2), "utf8");
}
