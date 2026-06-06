// 属性体系常量定义。所有最小属性单位用扁平 key 存在 state.attrs 里，
// 这里描述它们的分组、标签、雷达图归属与解锁规则。

export const MAX_POINT = 999; // 属性点 / 技能点上限
export const SKILL_GRIND_STEP = 10; // 智慧每次刷技能点的增量
export const WISDOM_LEVEL_DIVISOR = 50; // 智慧阶位 = 各学科总和 / 该系数
export const DAILY_TASK_GAIN = 2; // 完成每日必做任务获得的属性点
export const DAILY_TASK_PENALTY = 3; // 漏做应罚每日任务扣除的属性点
export const DAILY_TASK_REWARD = 5; // 完成每日必做任务获得的积分
export const WISDOM_DECAY = 2; // 某天没碰智慧，每个学科衰减的技能点
export const COMBO_THRESHOLD = 50; // 数理协同解锁阈值

export const ZHENGZHI_UNLOCK_DATE = "2026-09-01"; // 考研政治解锁日期
export const EXAM_DEADLINE = "2026-12-21T08:30:00"; // 27 考研初试

export interface SubjectDef {
  key: string;
  label: string;
  group: "gaoshu" | "408" | "yingyu" | "zhengzhi";
  radar: string; // 雷达图短标签
  unlockDate?: string;
}

// 3. 智慧（知识矩阵）
export const WISDOM_SUBJECTS: SubjectDef[] = [
  { key: "gaoshu", label: "高等数学", group: "gaoshu", radar: "高数" },
  { key: "xiandai", label: "线性代数", group: "gaoshu", radar: "线代" },
  { key: "ds", label: "数据结构", group: "408", radar: "数构" },
  { key: "jizu", label: "计算机组成原理", group: "408", radar: "计组" },
  { key: "os", label: "操作系统", group: "408", radar: "OS" },
  { key: "jiwang", label: "计算机网络", group: "408", radar: "计网" },
  { key: "yingyu", label: "考研英语", group: "yingyu", radar: "英语" },
  { key: "zhengzhi", label: "考研政治", group: "zhengzhi", radar: "政治", unlockDate: ZHENGZHI_UNLOCK_DATE },
];

export const WISDOM_KEYS = WISDOM_SUBJECTS.map((s) => s.key);

// 单位标签表（含智慧 + 魅力 + 气质 + 体质）
export const UNIT_LABELS: Record<string, string> = {
  // 智慧
  gaoshu: "高等数学", xiandai: "线性代数", ds: "数据结构", jizu: "计算机组成原理",
  os: "操作系统", jiwang: "计算机网络", yingyu: "考研英语", zhengzhi: "考研政治",
  // 魅力 - 容貌细分
  yanjing: "眼睛", shengyin: "声音", toufa: "头发", fuzhi: "肤质", qise: "气色",
  // 魅力 - 体态
  titai: "体态",
  // 气质
  qinggan: "情感", luoji: "逻辑", tantu: "谈吐", bowen: "博闻", guanchali: "观察力",
  // 体质
  shuimian: "睡眠", yinshi: "饮食", xiguan: "习惯", duanlian: "锻炼",
};

export const CHARM_FACE = ["yanjing", "shengyin", "toufa", "fuzhi", "qise"]; // 容貌
export const CHARM_KEYS = [...CHARM_FACE, "titai"];
export const TEMPERAMENT_KEYS = ["qinggan", "luoji", "tantu", "bowen", "guanchali"];
export const PHYSIQUE_KEYS = ["shuimian", "yinshi", "xiguan", "duanlian"];

// 所有非智慧的固定属性单位（用于初始化 attrs）
export const NON_WISDOM_KEYS = [...CHARM_KEYS, ...TEMPERAMENT_KEYS, ...PHYSIQUE_KEYS];
export const ALL_FIXED_KEYS = [...WISDOM_KEYS, ...NON_WISDOM_KEYS];

// 顶层分类（用于属性面板 + 总览雷达）
export interface Category {
  key: string;
  label: string;
  icon: string;
}
export const CATEGORIES: Category[] = [
  { key: "wisdom", label: "智慧", icon: "🧠" },
  { key: "charm", label: "魅力", icon: "💄" },
  { key: "temperament", label: "气质", icon: "🌸" },
  { key: "physique", label: "体质", icon: "🩸" },
  { key: "talent", label: "才艺", icon: "🎨" },
];

// 内置每日必做任务（与最小属性单位挂钩）
export interface DailyTaskDef {
  id: string;
  name: string;
  attrKey: string;
  penalty: boolean; // 漏做是否扣点
  group: "容貌" | "体质";
}
export const BUILTIN_DAILY_TASKS: DailyTaskDef[] = [
  // 容貌组：漏做扣对应容貌点
  { id: "d_yanbaojiancao", name: "眼保健操", attrKey: "yanjing", penalty: true, group: "容貌" },
  { id: "d_diyanyaoshui", name: "滴眼药水", attrKey: "yanjing", penalty: true, group: "容貌" },
  { id: "d_yuantiao", name: "远眺10分钟", attrKey: "yanjing", penalty: true, group: "容貌" },
  { id: "d_pingpang", name: "打乒乓球60个", attrKey: "yanjing", penalty: true, group: "容貌" },
  { id: "d_hufajingyou", name: "使用护发精油", attrKey: "toufa", penalty: true, group: "容貌" },
  { id: "d_hufu", name: "护肤", attrKey: "fuzhi", penalty: true, group: "容貌" },
  // 体质组：仅"每天五杯水"漏做扣点，其余只刷新不罚
  { id: "d_zaoshui", name: "早睡早起", attrKey: "shuimian", penalty: false, group: "体质" },
  { id: "d_guilvyinshi", name: "规律饮食", attrKey: "yinshi", penalty: false, group: "体质" },
  { id: "d_wubeishui", name: "每天五杯水", attrKey: "xiguan", penalty: true, group: "体质" },
  { id: "d_yundong", name: "每日运动", attrKey: "duanlian", penalty: false, group: "体质" },
];

// 政治是否已解锁（按现实日期判断）
export function isZhengzhiUnlocked(now: Date = new Date()): boolean {
  return now >= new Date(ZHENGZHI_UNLOCK_DATE + "T00:00:00");
}

// 可挂钩核心任务的最小单位选项（智慧用学科，其余用固定单位 + 才艺单独处理）
export function attrOptions(): { key: string; label: string }[] {
  return ALL_FIXED_KEYS.map((k) => ({ key: k, label: UNIT_LABELS[k] }));
}
