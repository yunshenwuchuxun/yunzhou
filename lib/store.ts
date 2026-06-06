"use client";
// 全局状态仓库（zustand）：持有整份 AppState + 所有领域 action。
// 任何修改都会触发防抖保存到云端 /api/state；加载时先拉取并统一结算。
import { create } from "zustand";
import type { AppState, ShopItem } from "./state";
import { createDefaultState, migrateState } from "./state";
import { settleAll } from "./settle";
import {
  MAX_POINT,
  SKILL_GRIND_STEP,
  DAILY_TASK_GAIN,
  DAILY_TASK_REWARD,
  WISDOM_KEYS,
  NON_WISDOM_KEYS,
  COMBO_THRESHOLD,
  isZhengzhiUnlocked,
} from "./model";
import { clamp, dateStr, uid } from "./util";
import { announceTaskDone, fortuneForDate, CAT_FED, CAT_STROKED } from "./content";
import { playSound } from "./audio";

// ---------- 在 draft 上操作的纯辅助 ----------
function adjustUnit(d: AppState, key: string, n: number) {
  if (key.startsWith("talent:")) {
    const id = Number(key.slice(7));
    const t = d.talents.find((x) => x.id === id);
    if (t) {
      const before = t.points;
      t.points = clamp(before + n, 0, MAX_POINT);
      d.todayStats.attrGain += t.points - before;
    }
    return;
  }
  if (d.attrs[key] === undefined) return;
  const before = d.attrs[key];
  d.attrs[key] = clamp(before + n, 0, MAX_POINT);
  d.todayStats.attrGain += d.attrs[key] - before;
}

function earn(d: AppState, n: number) {
  d.currency += n;
  d.todayStats.pointsEarned += n;
}
function spend(d: AppState, n: number): boolean {
  if (d.currency < n) return false;
  d.currency -= n;
  d.todayStats.pointsSpent += n;
  return true;
}
function mathCombo(d: AppState): boolean {
  return d.attrs.gaoshu >= COMBO_THRESHOLD && d.attrs.xiandai >= COMBO_THRESHOLD;
}

// ---------- 防抖保存 ----------
let saveTimer: ReturnType<typeof setTimeout> | null = null;
async function putState(data: AppState) {
  try {
    await fetch("/api/state", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    });
  } catch {
    /* 离线时静默，下次成功保存覆盖 */
  }
}

export type CatSignal = { type: "stroke" | "feed" | "eat" | "sad"; ts: number; food?: string };

interface Store {
  data: AppState | null;
  loaded: boolean;
  error: string | null;
  catSignal: CatSignal | null;
  toast: { text: string; ts: number } | null;

  load: () => Promise<void>;
  logout: () => Promise<void>;
  hardReset: () => Promise<void>;
  apply: (fn: (d: AppState) => void) => void;
  signalCat: (s: Omit<CatSignal, "ts">) => void;
  pushToast: (text: string) => void;

  // 领域 actions
  bind: (name: string, age: number) => void;
  setAvatar: (b64: string) => void;
  renameSystem: (name: string) => void;
  renamePet: (name: string) => void;
  setGender: (gender: string) => void;
  grindSkill: (key: string) => void;
  addTalent: (name: string) => void;
  removeTalent: (id: number) => void;
  grindTalent: (id: number) => void;
  toggleDaily: (id: string) => void;
  addCustomDaily: (name: string, attrKey: string, penalty: boolean) => void;
  removeDaily: (id: string) => void;
  addCoreTask: (text: string, attrKey: string, mode: "normal" | "gamble") => void;
  completeCoreTask: (id: number) => void;
  removeCoreTask: (id: number) => void;
  suppressDemon: () => void;
  drawGacha: () => string | null;
  addShopItem: (name: string, desc: string, price: number) => void;
  removeShopItem: (id: number) => void;
  buyItem: (id: number) => void;
  useBagItem: (name: string) => void;
  strokePet: () => void;
  feedPet: () => void;
  submitReview: (text: string, type: "weekly" | "monthly") => boolean;
}

export const useStore = create<Store>((set, get) => ({
  data: null,
  loaded: false,
  error: null,
  catSignal: null,
  toast: null,

  load: async () => {
    try {
      const res = await fetch("/api/state");
      if (!res.ok) throw new Error("load failed");
      const { data: raw } = await res.json();
      const now = new Date();
      const data = raw ? migrateState(raw) : createDefaultState(now);
      // 确保今日运势存在
      const today = dateStr(now);
      if (!data.dailyFortune || data.dailyFortune.date !== today) {
        const f = fortuneForDate(today);
        data.dailyFortune = { date: today, tag: f.tag, text: f.text };
      }
      settleAll(data, now);
      set({ data, loaded: true, error: null });
      putState(data); // 持久化结算结果
    } catch (e) {
      set({ error: String(e), loaded: true });
    }
  },

  logout: async () => {
    await fetch("/api/auth", { method: "DELETE" });
    window.location.href = "/login";
  },

  hardReset: async () => {
    const data = createDefaultState();
    set({ data });
    await putState(data);
    window.location.reload();
  },

  apply: (fn) => {
    const cur = get().data;
    if (!cur) return;
    const next = structuredClone(cur) as AppState;
    fn(next);
    set({ data: next });
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => putState(next), 800);
  },

  signalCat: (s) => set({ catSignal: { ...s, ts: Date.now() } }),
  pushToast: (text) => set({ toast: { text, ts: Date.now() } }),

  bind: (name, age) => get().apply((d) => {
    d.hostName = name;
    d.age = age;
  }),
  setAvatar: (b64) => get().apply((d) => {
    d.avatarBase64 = b64;
  }),
  renameSystem: (name) => get().apply((d) => {
    d.systemName = name;
  }),
  renamePet: (name) => get().apply((d) => {
    d.petName = name;
  }),
  setGender: (gender) => get().apply((d) => {
    d.gender = gender;
  }),

  grindSkill: (key) => {
    if (!WISDOM_KEYS.includes(key)) return;
    if (key === "zhengzhi" && !isZhengzhiUnlocked()) {
      get().pushToast("考研政治将于 9 月后解锁。");
      return;
    }
    get().apply((d) => {
      adjustUnit(d, key, SKILL_GRIND_STEP);
      d.lastWisdomActiveDate = dateStr();
      d.todayDoneLogs.push(`🧠 [刷技能点] ${key} +${SKILL_GRIND_STEP}`);
    });
    playSound("success");
  },

  addTalent: (name) => get().apply((d) => {
    d.talents.push({ id: uid(), name, points: 0 });
  }),
  removeTalent: (id) => get().apply((d) => {
    d.talents = d.talents.filter((t) => t.id !== id);
  }),
  grindTalent: (id) => get().apply((d) => {
    adjustUnit(d, `talent:${id}`, SKILL_GRIND_STEP);
    const t = d.talents.find((x) => x.id === id);
    if (t) d.todayDoneLogs.push(`🎨 [才艺精进] ${t.name} +${SKILL_GRIND_STEP}`);
  }),

  toggleDaily: (id) => get().apply((d) => {
    const t = d.dailyTasks.find((x) => x.id === id);
    if (!t) return;
    if (!t.done) {
      t.done = true;
      adjustUnit(d, t.attrKey, DAILY_TASK_GAIN);
      earn(d, DAILY_TASK_REWARD);
      d.todayDoneLogs.push(`✅ [每日必做] ${t.name} 完成 +${DAILY_TASK_GAIN}属性 +${DAILY_TASK_REWARD}积分`);
      playSound("success");
    } else {
      t.done = false;
      adjustUnit(d, t.attrKey, -DAILY_TASK_GAIN);
      d.currency = Math.max(0, d.currency - DAILY_TASK_REWARD);
      d.todayStats.pointsEarned -= DAILY_TASK_REWARD;
    }
  }),
  addCustomDaily: (name, attrKey, penalty) => get().apply((d) => {
    d.dailyTasks.push({ id: `c_${uid()}`, name, attrKey, penalty, builtin: false, done: false });
  }),
  removeDaily: (id) => get().apply((d) => {
    d.dailyTasks = d.dailyTasks.filter((t) => t.id !== id || t.builtin);
  }),

  addCoreTask: (text, attrKey, mode) => get().apply((d) => {
    d.coreTasks.push({
      id: uid(), text, attrKey, mode,
      completed: false, isOverdue: false, createdTs: Date.now(),
    });
  }),
  completeCoreTask: (id) => {
    const data = get().data;
    if (!data) return;
    const task = data.coreTasks.find((t) => t.id === id);
    if (!task || task.completed) return;
    let reward = task.mode === "gamble" ? 25 : 10;
    get().apply((d) => {
      const t = d.coreTasks.find((x) => x.id === id)!;
      t.completed = true;
      if (["gaoshu", "xiandai"].includes(t.attrKey) && mathCombo(d)) reward += 2;
      earn(d, reward);
      adjustUnit(d, t.attrKey, 1);
      const ann = announceTaskDone(d.hostName || "宿主", t.text, reward);
      d.todayDoneLogs.push(`⚔️ [契约达成] ${t.text} +${reward}积分`);
      d.announcements.unshift(ann);
      d.announcements = d.announcements.slice(0, 30);
    });
    get().pushToast(announceTaskDone(data.hostName || "宿主", task.text, reward));
    playSound("success");
  },
  removeCoreTask: (id) => get().apply((d) => {
    d.coreTasks = d.coreTasks.filter((t) => t.id !== id);
  }),

  suppressDemon: () => get().apply((d) => {
    if (!spend(d, 15)) return;
    const keys = [...WISDOM_KEYS, ...NON_WISDOM_KEYS];
    const target = keys[Math.floor((Date.now() / 1000) % keys.length)];
    adjustUnit(d, target, -1);
    d.todayDoneLogs.push("⚠️ [镇压心魔] -15积分");
  }),

  drawGacha: () => {
    const data = get().data;
    if (!data || data.currency < 20) {
      get().pushToast("积分不足（需 20）。");
      return null;
    }
    const rand = Math.random();
    let prize = "🧾 未知波形残留";
    let bonus = 0;
    if (rand > 0.75) prize = "🧬 全维度机能改良剂";
    else if (rand > 0.5) prize = "🥫 生物质能量舱";
    else if (rand > 0.3) { prize = "🪙 因果溢出 (+40积分)"; bonus = 40; }
    get().apply((d) => {
      spend(d, 20);
      if (bonus) earn(d, bonus);
      else d.inventory[prize] = (d.inventory[prize] || 0) + 1;
      d.todayDoneLogs.push(`🎰 [抽奖] 产出：${prize}`);
    });
    return prize;
  },

  addShopItem: (name, desc, price) => get().apply((d) => {
    d.shopItems.push({ id: uid(), name, desc: desc || "—", price });
  }),
  removeShopItem: (id) => get().apply((d) => {
    d.shopItems = d.shopItems.filter((i) => i.id !== id);
  }),
  buyItem: (id) => get().apply((d) => {
    const item = d.shopItems.find((i) => i.id === id) as ShopItem | undefined;
    if (!item) return;
    if (!spend(d, item.price)) return;
    d.inventory[item.name] = (d.inventory[item.name] || 0) + 1;
    d.todayDoneLogs.push(`🛍️ [兑换] ${item.name} -${item.price}积分`);
  }),
  useBagItem: (name) => {
    get().apply((d) => {
      if (!d.inventory[name]) return;
      d.inventory[name]--;
      if (d.inventory[name] <= 0) delete d.inventory[name];
      if (name.includes("改良剂")) {
        [...WISDOM_KEYS, ...NON_WISDOM_KEYS].forEach((k) => adjustUnit(d, k, 2));
      } else if (name.includes("能量舱") || name.includes("冰淇淋") || name.includes("冰激凌")) {
        d.petFood = Math.min(100, d.petFood + 30);
      }
    });
    // 食物类触发猫咪进食动画
    if (name.includes("能量舱") || name.includes("冰淇淋") || name.includes("冰激凌") || name.includes("🐟") || name.includes("🍧")) {
      get().signalCat({ type: "eat", food: name });
    }
  },

  strokePet: () => {
    const d = get().data;
    if (!d) return;
    if (d.currency < 2) { get().pushToast("积分不足。"); return; }
    get().apply((s) => {
      spend(s, 2);
      s.petLove = Math.min(100, s.petLove + 5);
    });
    get().signalCat({ type: "stroke" });
    get().pushToast(CAT_STROKED);
  },
  feedPet: () => {
    const d = get().data;
    if (!d) return;
    if (d.currency < 5) { get().pushToast("积分不足。"); return; }
    get().apply((s) => {
      spend(s, 5);
      s.petFood = Math.min(100, s.petFood + 25);
    });
    get().signalCat({ type: "eat" });
    get().pushToast(CAT_FED);
  },

  submitReview: (text, type) => {
    const min = type === "weekly" ? 15 : 30;
    if (!text || text.trim().length < min) return false;
    get().apply((d) => {
      if (type === "weekly") d.petLove = Math.min(100, d.petLove + 5);
      else d.petFood = 100;
      const stamp = new Date().toLocaleString("zh-CN");
      const head = type === "weekly" ? "周复盘" : "月复盘";
      d.reviewLogs.unshift(`[${stamp} ${head}]\n${text.trim()}`);
      d.reviewLogs = d.reviewLogs.slice(0, 60);
    });
    return true;
  },
}));
