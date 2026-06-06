// 宠物物种元数据表（Phase 1 首批 4 只）。
// 仅描述展示用元信息；视觉形象由 components/CyberCat.tsx 的 mesh DOM +
// app/globals.css 的 .pet-mesh.<type> 命名空间驱动；专属玩法留待后续阶段。
import type { PetType } from "./state";

export interface PetMeta {
  type: PetType;
  label: string; // 中文名
  emoji: string;
  blurb: string; // 一句话简介
}

export const PETS: PetMeta[] = [
  { type: "quantum-cat", label: "量子猫·喵格物", emoji: "🐱", blurb: "可爱陪伴，专注陪跑。" },
  { type: "mecha-panda", label: "机甲熊猫·滚滚", emoji: "🐼", blurb: "憨萌镇场，稳如磐石。" },
  { type: "flame-dragon", label: "赤焰小龙·烛龙", emoji: "🐉", blurb: "霸气战意，越战越勇。" },
  { type: "cyber-wolf", label: "机械狼·苍刃", emoji: "🐺", blurb: "冷酷狩猎，锁定即达。" },
];

export function petMeta(type: PetType): PetMeta {
  return PETS.find((p) => p.type === type) ?? PETS[0];
}
