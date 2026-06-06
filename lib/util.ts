// 通用工具：本地日期字符串、跨天天数、限幅。

export function dateStr(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// 两个 YYYY-MM-DD 之间相差的自然天数（b - a）
export function dayDiff(a: string, b: string): number {
  const da = new Date(a + "T00:00:00").getTime();
  const db = new Date(b + "T00:00:00").getTime();
  return Math.round((db - da) / 86400000);
}

export function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

export function uid(): number {
  // 避免 Date.now 在同一毫秒碰撞，加一个递增计数
  uidCounter = (uidCounter + 1) % 1000;
  return Date.now() * 1000 + uidCounter;
}
let uidCounter = 0;
