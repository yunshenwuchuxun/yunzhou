// 结算逻辑（纯函数，原地修改传入的 draft，便于在加载时统一计算与单测）。
// 包含：每日 0 点结算、智慧衰减、核心任务 48h 超时、宠物离线衰减。
import type { AppState } from "./state";
import {
  WISDOM_KEYS,
  WISDOM_DECAY,
  DAILY_TASK_PENALTY,
  MAX_POINT,
} from "./model";
import { dateStr, dayDiff, clamp } from "./util";

// 核心任务存活时长（48h），导出供宠物催战提醒等复用，避免硬编码。
export const CORE_TASK_TTL = 48 * 60 * 60 * 1000;

function addAttr(s: AppState, key: string, delta: number) {
  if (s.attrs[key] === undefined) return;
  s.attrs[key] = clamp(s.attrs[key] + delta, 0, MAX_POINT);
}

// 每日 0 点结算：跨越的每个自然日，对未完成的应罚每日任务扣点，
// 并把当日统计沉淀进 historyDaily，最后重置 done 与今日计数。
export function settleDaily(s: AppState, now: Date = new Date()): boolean {
  const today = dateStr(now);
  const gap = dayDiff(s.lastDailySettleDate, today);
  if (gap <= 0) return false;

  const penaltyTasks = s.dailyTasks.filter((t) => t.penalty);

  // 第 1 个跨越日 = 刚结束的那天（用当前 done 状态结算）
  let penaltyToday = 0;
  for (const t of penaltyTasks) {
    if (!t.done) {
      addAttr(s, t.attrKey, -DAILY_TASK_PENALTY);
      penaltyToday += DAILY_TASK_PENALTY;
    }
  }
  s.historyDaily.push({
    date: s.lastDailySettleDate,
    attrGain: s.todayStats.attrGain - penaltyToday,
    pointsEarned: s.todayStats.pointsEarned,
    pointsSpent: s.todayStats.pointsSpent,
  });

  // 中间完全错过的日子（全部应罚任务漏做）
  const totalDailyPenalty = penaltyTasks.length * DAILY_TASK_PENALTY;
  const startDate = new Date(s.lastDailySettleDate + "T00:00:00");
  for (let i = 1; i < gap; i++) {
    for (const t of penaltyTasks) addAttr(s, t.attrKey, -DAILY_TASK_PENALTY);
    const d = new Date(startDate.getTime() + i * 86400000);
    s.historyDaily.push({
      date: dateStr(d),
      attrGain: -totalDailyPenalty,
      pointsEarned: 0,
      pointsSpent: 0,
    });
  }

  // 重置今日
  s.dailyTasks.forEach((t) => (t.done = false));
  s.todayStats = { attrGain: 0, pointsEarned: 0, pointsSpent: 0 };
  s.todayDoneLogs = [];
  s.lastDailySettleDate = today;
  return true;
}

// 智慧衰减：如果在某天没碰过智慧，跨天后各学科扣点。
export function settleWisdomDecay(s: AppState, now: Date = new Date()): boolean {
  const today = dateStr(now);
  const gap = dayDiff(s.lastWisdomActiveDate, today);
  if (gap <= 0) return false;
  // 漏掉的天数（今天还没做也算潜在衰减，但今天可补；只对已过去的整天扣）
  const missedDays = gap; // 自上次活跃起，每整天衰减一次
  for (const k of WISDOM_KEYS) addAttr(s, k, -WISDOM_DECAY * missedDays);
  // 不直接把 lastWisdomActiveDate 设为今天——保持为上次真正活跃日，
  // 这样若今天也没做，明天会继续衰减。但为避免重复扣，记录已结算到今天。
  s.lastWisdomActiveDate = today;
  return missedDays > 0;
}

// 核心任务 48h 超时惩罚。返回是否有任务变为超时。
export function settleCoreTasks(s: AppState, now: Date = new Date()): boolean {
  const t = now.getTime();
  let dirty = false;
  for (const task of s.coreTasks) {
    if (!task.completed && !task.isOverdue && t >= task.createdTs + CORE_TASK_TTL) {
      task.isOverdue = true;
      const isGamble = task.mode === "gamble";
      s.currency = Math.max(0, s.currency - (isGamble ? 40 : 20));
      addAttr(s, task.attrKey, -(isGamble ? 5 : 2));
      dirty = true;
    }
  }
  return dirty;
}

// 宠物离线衰减：每小时饱食 -4，饱食见底则亲密度连带下降。
export function settlePet(s: AppState, now: Date = new Date()): boolean {
  const passedHours = (now.getTime() - s.lastPetSettle) / 3600000;
  if (passedHours < 1) return false;
  const cycles = Math.floor(passedHours);
  s.petFood = Math.max(0, s.petFood - cycles * 4);
  if (s.petFood === 0) s.petLove = Math.max(0, s.petLove - cycles * 3);
  s.lastPetSettle = now.getTime();
  return true;
}

// 加载时统一结算入口。
export function settleAll(s: AppState, now: Date = new Date()): boolean {
  let dirty = false;
  dirty = settleDaily(s, now) || dirty;
  dirty = settleWisdomDecay(s, now) || dirty;
  dirty = settleCoreTasks(s, now) || dirty;
  dirty = settlePet(s, now) || dirty;
  return dirty;
}
