// 应用状态类型与默认值。整份 AppState 以 JSON 形式持久化到云端 Postgres。
import {
  ALL_FIXED_KEYS,
  BUILTIN_DAILY_TASKS,
  MAX_POINT,
} from "./model";
import { dateStr } from "./util";

export const STATE_VERSION = 1;

// 宠物物种联合类型（Phase 1 首批 4 只，全部可切换）
export type PetType = "quantum-cat" | "mecha-panda" | "flame-dragon" | "cyber-wolf";

export interface Talent {
  id: number;
  name: string;
  points: number;
}

export interface DailyTask {
  id: string;
  name: string;
  attrKey: string; // 挂钩的最小属性单位 key（或 talent:<id>）
  penalty: boolean; // 漏做是否扣点
  builtin: boolean;
  done: boolean;
}

export interface CoreTask {
  id: number;
  text: string;
  attrKey: string; // 挂钩最小单位（智慧学科或固定单位）
  mode: "normal" | "gamble";
  completed: boolean;
  isOverdue: boolean;
  createdTs: number;
}

export interface ShopItem {
  id: number;
  name: string;
  desc: string;
  price: number;
}

export interface DailyHistory {
  date: string; // YYYY-MM-DD
  attrGain: number; // 当日属性净增量
  pointsEarned: number; // 当日获得积分
  pointsSpent: number; // 当日消耗积分
}

export interface AppState {
  version: number;
  // 绑定 / 身份
  hostName: string;
  age: number;
  gender: string;
  avatarBase64: string;
  systemName: string; // 系统名（侧边栏可改）
  petName: string;
  petType: PetType; // 出战宠物物种
  petHidden: boolean; // 宠物是否隐藏（仅留召回入口）
  // 资源
  currency: number;
  // 属性：所有固定最小单位（智慧学科 + 魅力/气质/体质）
  attrs: Record<string, number>;
  talents: Talent[];
  // 任务
  dailyTasks: DailyTask[];
  coreTasks: CoreTask[];
  lastDailySettleDate: string; // 上次每日结算的日期
  lastWisdomActiveDate: string; // 上次做智慧的日期
  // 商城
  shopItems: ShopItem[];
  inventory: Record<string, number>;
  // 宠物
  petLove: number;
  petFood: number;
  lastPetSettle: number; // 时间戳
  // 日志 / 复盘
  todayDoneLogs: string[];
  historyDaily: DailyHistory[];
  todayStats: { attrGain: number; pointsEarned: number; pointsSpent: number };
  reviewLogs: string[]; // 周/月复盘文本
  // 运势 / 公告
  dailyFortune: { date: string; tag: string; text: string } | null;
  announcements: string[];
}

export function createDefaultState(now: Date = new Date()): AppState {
  const attrs: Record<string, number> = {};
  for (const k of ALL_FIXED_KEYS) attrs[k] = 0;
  const today = dateStr(now);
  return {
    version: STATE_VERSION,
    hostName: "",
    age: 20,
    gender: "👩‍⚕️ 女神主程序",
    avatarBase64: "",
    systemName: "Goddess Core",
    petName: "AI-CAT-01",
    petType: "quantum-cat",
    petHidden: false,
    currency: 50,
    attrs,
    talents: [],
    dailyTasks: BUILTIN_DAILY_TASKS.map((t) => ({
      id: t.id,
      name: t.name,
      attrKey: t.attrKey,
      penalty: t.penalty,
      builtin: true,
      done: false,
    })),
    coreTasks: [],
    lastDailySettleDate: today,
    lastWisdomActiveDate: today,
    shopItems: [
      { id: 1, name: "💤 深层睡眠 30 分钟", desc: "强制静态深度休息，回血再战", price: 30 },
      { id: 2, name: "🍧 吃一根冰淇淋", desc: "给辛苦的宿主一点甜", price: 25 },
      { id: 3, name: "🎯 心流专注券", desc: "屏蔽噪声，进入极限专注 1 小时", price: 50 },
      { id: 4, name: "🥫 生物质能量舱", desc: "投喂系统猫咪，拉升饱食能级", price: 15 },
    ],
    inventory: {},
    petLove: 60,
    petFood: 85,
    lastPetSettle: now.getTime(),
    todayDoneLogs: [],
    historyDaily: [],
    todayStats: { attrGain: 0, pointsEarned: 0, pointsSpent: 0 },
    reviewLogs: [],
    dailyFortune: null,
    announcements: [],
  };
}

// 把旧/不完整的存档补齐到当前结构，防止字段缺失导致崩溃。
export function migrateState(raw: unknown): AppState {
  const base = createDefaultState();
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Partial<AppState>;
  const merged: AppState = {
    ...base,
    ...r,
    attrs: { ...base.attrs, ...(r.attrs || {}) },
    inventory: { ...(r.inventory || {}) },
  };
  // 补齐内置每日任务（保留已存在的完成状态）
  const existingIds = new Set((r.dailyTasks || []).map((t) => t.id));
  const builtinMissing = base.dailyTasks.filter((t) => !existingIds.has(t.id));
  merged.dailyTasks = [...(r.dailyTasks || []), ...builtinMissing];
  // 旧存档无 petType，补默认；非法值回落到量子猫
  const validPetTypes: PetType[] = ["quantum-cat", "mecha-panda", "flame-dragon", "cyber-wolf"];
  if (!validPetTypes.includes(merged.petType)) merged.petType = "quantum-cat";
  // 旧存档无 petHidden，缺则默认显示
  merged.petHidden = r.petHidden === true;
  // 限幅所有属性
  for (const k of Object.keys(merged.attrs)) {
    merged.attrs[k] = Math.max(0, Math.min(MAX_POINT, merged.attrs[k] || 0));
  }
  merged.version = STATE_VERSION;
  return merged;
}
