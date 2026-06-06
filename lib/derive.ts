// 从扁平 attrs 派生分类聚合值，供雷达图与进度条展示。
import type { AppState } from "./state";
import {
  WISDOM_KEYS,
  CHARM_KEYS,
  CHARM_FACE,
  TEMPERAMENT_KEYS,
  PHYSIQUE_KEYS,
  WISDOM_LEVEL_DIVISOR,
} from "./model";

export function avg(state: AppState, keys: string[]): number {
  if (keys.length === 0) return 0;
  const sum = keys.reduce((s, k) => s + (state.attrs[k] || 0), 0);
  return Math.round(sum / keys.length);
}

export function wisdomTotal(state: AppState): number {
  return WISDOM_KEYS.reduce((s, k) => s + (state.attrs[k] || 0), 0);
}

export function wisdomLevel(state: AppState): number {
  return Math.floor(wisdomTotal(state) / WISDOM_LEVEL_DIVISOR);
}

export function talentAvg(state: AppState): number {
  if (state.talents.length === 0) return 0;
  return Math.round(state.talents.reduce((s, t) => s + t.points, 0) / state.talents.length);
}

// 顶层五维总览（用于总览雷达）
export function categoryRadar(state: AppState): { labels: string[]; data: number[] } {
  return {
    labels: ["智慧", "魅力", "气质", "体质", "才艺"],
    data: [
      Math.round(wisdomTotal(state) / WISDOM_KEYS.length),
      avg(state, CHARM_KEYS),
      avg(state, TEMPERAMENT_KEYS),
      avg(state, PHYSIQUE_KEYS),
      talentAvg(state),
    ],
  };
}

export { CHARM_FACE };
