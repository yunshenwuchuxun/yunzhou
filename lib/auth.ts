// 单一密码会话：用 Web Crypto HMAC-SHA256 签名一个带过期时间的 token，
// 写入 httpOnly cookie。Web Crypto 在 Edge(middleware) 与 Node(route) 均可用。

export const COOKIE_NAME = "yz_session";
export const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 天

const encoder = new TextEncoder();

function bytesToB64url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlToBytes(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function strToB64url(s: string): string {
  return bytesToB64url(encoder.encode(s));
}

function b64urlToStr(s: string): string {
  return new TextDecoder().decode(b64urlToBytes(s));
}

// 取出底层 ArrayBuffer，满足 Web Crypto 的 BufferSource 类型（TS 5.7+ 收紧了泛型）。
function buf(u: Uint8Array): ArrayBuffer {
  return u.buffer.slice(u.byteOffset, u.byteOffset + u.byteLength) as ArrayBuffer;
}

async function getKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function signToken(secret: string, ttlMs = TTL_MS): Promise<string> {
  const payload = strToB64url(JSON.stringify({ exp: Date.now() + ttlMs }));
  const key = await getKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, buf(encoder.encode(payload)));
  return `${payload}.${bytesToB64url(new Uint8Array(sig))}`;
}

export async function verifyToken(secret: string, token: string): Promise<boolean> {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  try {
    const key = await getKey(secret);
    const ok = await crypto.subtle.verify(
      "HMAC",
      key,
      buf(b64urlToBytes(sig)),
      buf(encoder.encode(payload)),
    );
    if (!ok) return false;
    const { exp } = JSON.parse(b64urlToStr(payload));
    return typeof exp === "number" && Date.now() < exp;
  } catch {
    return false;
  }
}

// 生产环境必须显式配置密钥与密码；缺失时 fail-closed，避免使用可猜测的默认值。
// 仅在非生产(开发)环境提供兜底，方便本地零配置启动。
export function getSecret(): string {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 16) return s;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET 未配置（生产环境必须设置，且至少 16 位）");
  }
  return "dev-only-insecure-secret-do-not-use-in-prod";
}

export function getPassword(): string {
  const p = process.env.APP_PASSWORD;
  if (p) return p;
  if (process.env.NODE_ENV === "production") {
    throw new Error("APP_PASSWORD 未配置（生产环境必须设置）");
  }
  return "dev-password";
}
