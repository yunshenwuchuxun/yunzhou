// 系统文案：宠物语录（按物种性格分池）、每日运势、系统公告模板。
import type { PetType } from "./state";

// 量子猫日常独白（温柔陪伴，保留原始体验）
export const CAT_DIALOGUES = [
  "宿主，今日的认知熵在下降，继续保持深度专注。",
  "数据流告诉我，你比昨天更接近上岸的坐标了喵。",
  "累了就停三分钟，但别让进度条停下来。",
  "高数的难题不是墙，是你跃迁阶位的踏板喵。",
  "把今天的每日必做先清掉，系统会给你正反馈。",
  "27 考研的倒计时在走，但你的属性也在涨，稳住。",
  "别忘了喝水、远眺、护眼——容貌点也是战斗力喵。",
  "复盘一下昨天，系统帮你把经验沉淀成阶位。",
  "宿主专注的样子，是这个系统里最高能的信号。",
];

// 量子猫鼓励语（温柔即时正反馈，保留原始体验）
export const CAT_ENCOURAGEMENTS = [
  "干得漂亮喵！这一下又把上岸的概率推高了一点。",
  "看到了看到了，宿主的专注度正在拉满！继续冲！",
  "每一次努力都被系统记录在案，稳稳地加油喵～",
  "就是这个节奏！把势能攒起来，迟早要破壁的。",
  "宿主好棒，我把这份努力存进量子缓存了喵。",
  "嗷呜——又前进一步！我可是你最忠实的应援团喵。",
  "别小看这一点点，复利之下都是质变，加油！",
  "能量同步中…检测到宿主斗志上扬，给你鼓掌喵！",
];

// 机甲熊猫日常独白（稳重憨厚，慢条斯理）
const PANDA_DIALOGUES = [
  "嚼着竹子也能镇场，宿主你慢慢来，我顶着。",
  "稳一点，地基打牢的人走得最远。",
  "别急，今天的功课吃透一口算一口。",
  "我这身机甲不是吓人的，是替你扛住焦虑的。",
  "圆滚滚地坐镇，宿主只管专注，杂念交给我。",
  "笨办法不丢人，重复一千次就是真功夫。",
  "稳住节奏，憨人有憨福，努力不会白费。",
];

// 机甲熊猫鼓励语（稳重踏实）
const PANDA_ENCOURAGEMENTS = [
  "稳，这一步踏得扎实，地基又厚了一寸。",
  "不慌不忙，宿主这力道刚刚好，继续。",
  "嗯，记下了，又是一块垒上去的砖。",
  "笨功夫见真章，宿主你做得很稳。",
  "镇场成功，杂念退散，进度照常推进。",
  "圆滚滚为你点个赞，踏实最香。",
];

// 机甲熊猫镇场督促语（每日必做有遗留时偶发）
const PANDA_NAG = [
  "还有必做没清呢，别躺着，先把它啃了。",
  "镇场提醒：今天的任务清单还没扫干净哦。",
  "我盯着进度条呢，落下的那几项，补上吧。",
  "稳归稳，该做的还是得做，去把必做收尾。",
];

// 赤焰小龙日常独白（战意昂扬，热血）
const DRAGON_DIALOGUES = [
  "战意已点燃，宿主，今天我们烧穿哪块硬骨头？",
  "焰心在烧，每一分专注都是助燃剂！",
  "弱者退场，强者赴战——宿主，拔剑吧！",
  "胸腔里的火越攒越旺，破壁就在眼前！",
  "别守了，进攻！把最难的科目当祭品。",
  "龙焰认你为主，宿主越战越勇，我陪你燃到底！",
  "今日不留余力，全力以赴方不负这身火。",
];

// 赤焰小龙鼓励语（战意/喷火，越战越勇）
const DRAGON_ENCOURAGEMENTS = [
  "好！这一击势如喷焰，再来！越战越勇！",
  "焰心暴涨——宿主的战意我接收到了，冲！",
  "干得漂亮！把这股火势保持住，碾碎它！",
  "燃起来了！这一步踏碎瓶颈，乘胜追击！",
  "赤焰加持，宿主势不可挡，继续燃！",
  "嗷——又破一关！强者之路，全力进攻！",
];

// 机械狼日常独白（冷酷凌厉，简洁狠辣）
const WOLF_DIALOGUES = [
  "锁定目标。专注，是猎手唯一的姿态。",
  "无声潜行，宿主，把猎物逐个清算。",
  "不喧哗，不松懈。强者只用结果说话。",
  "钢铁的眼里只有下一个目标。",
  "情绪是噪音，效率是利刃——保持冷静。",
  "狩猎开始。慢即是死，动起来。",
  "锁定即达成，宿主，别让目标喘息。",
];

// 机械狼鼓励语（冷酷凌厉，干净利落）
const WOLF_ENCOURAGEMENTS = [
  "命中。目标清除，锁定下一个。",
  "干净利落。这就是猎手的节奏。",
  "效率达标，宿主，继续推进。",
  "一击致命，毫不拖泥带水。漂亮。",
  "战果确认。保持冷静，扩大战线。",
  "锁定—达成。下一个目标，出发。",
];

// 机械狼临近死线催战语（核心任务将超时时偶发）
const WOLF_DEADLINE = [
  "嗷呜——猎物在逃，契约倒计时拉响，立刻出击！",
  "警告：目标将在数小时内脱锁，宿主，动手。",
  "死线逼近，狩猎窗口正在关闭——别让它溜了。",
  "嚎叫示警：有契约即将超时，现在就去终结它。",
];

// 各物种独白池（量子猫复用 CAT_DIALOGUES，保持原体验）
export const PET_DIALOGUES: Record<PetType, string[]> = {
  "quantum-cat": CAT_DIALOGUES,
  "mecha-panda": PANDA_DIALOGUES,
  "flame-dragon": DRAGON_DIALOGUES,
  "cyber-wolf": WOLF_DIALOGUES,
};

// 各物种鼓励池（量子猫复用 CAT_ENCOURAGEMENTS，保持原体验）
export const PET_ENCOURAGEMENTS: Record<PetType, string[]> = {
  "quantum-cat": CAT_ENCOURAGEMENTS,
  "mecha-panda": PANDA_ENCOURAGEMENTS,
  "flame-dragon": DRAGON_ENCOURAGEMENTS,
  "cyber-wolf": WOLF_ENCOURAGEMENTS,
};

// 从指定物种的池中随机取一条
function pickFrom(pool: string[]): string {
  return pool[Math.floor(Math.random() * pool.length)];
}

// 按物种取一条日常独白
export function petDialogue(type: PetType): string {
  return pickFrom(PET_DIALOGUES[type]);
}

// 按物种取一条鼓励语
export function petEncouragement(type: PetType): string {
  return pickFrom(PET_ENCOURAGEMENTS[type]);
}

// 机甲熊猫镇场督促语（每日必做有遗留时用）
export function pandaNag(): string {
  return pickFrom(PANDA_NAG);
}

// 机械狼临近死线催战语
export function wolfDeadlineHowl(): string {
  return pickFrom(WOLF_DEADLINE);
}

// 里程碑达成文案（属性跨越关键阈值 / 数学连携解锁）
export const CAT_MILESTONE = (mark: number) =>
  `🎉 里程碑达成！该维度突破 ${mark} 点，阶位跃迁——宿主你太强了喵！`;
export const CAT_COMBO_UNLOCK = "⚡ 数学连携已激活！高数 × 现代双线贯通，契约收益加成上线喵！";

export const CAT_HUNGRY = (petName: string) => `【能量告急】${petName} 快饿扁了…投喂点东西嘛喵。`;
export const CAT_LONELY = (host: string) => `量子同步率走低…${host}是不是把我忘了喵。`;
export const CAT_FED = "摄入高能生物质，饱食能级跃升！";
export const CAT_STROKED = "被宿主抚摸了，露个肚皮，亲密度+喵～";

// 每日运势池（按日期取一条，当天固定）
export const FORTUNES = [
  { tag: "大吉", text: "今日心流通畅，适合啃最硬的骨头——把最难的科目放在第一个。" },
  { tag: "中吉", text: "状态平稳，按计划推进即可，别和昨天的自己比。" },
  { tag: "小吉", text: "适合做整理与复盘，把零散的知识点连成网。" },
  { tag: "平", text: "效率一般也没关系，完成每日必做就是胜利。" },
  { tag: "宜静", text: "今天容易心浮，先护眼、喝水、深呼吸，再开始。" },
  { tag: "厚积", text: "看不到提升的日子，其实是在打地基，坚持刷点。" },
  { tag: "破壁", text: "今天有概率突破瓶颈，挑战一个高载荷契约试试。" },
];

// 完成核心任务时的系统公告模板
export function announceTaskDone(host: string, taskText: string, reward: number): string {
  const tpls = [
    `【系统公告】宿主「${host}」已达成契约：${taskText}。判定有效，奖励 ${reward} 积分。`,
    `【系统公告】检测到「${host}」攻克目标：${taskText}。阶位数据已上扬，+${reward} 积分。`,
    `【系统公告】契约交割成功：${taskText}。系统为宿主「${host}」记功 +${reward}。`,
  ];
  // 用任务文本长度选模板，保持纯函数（不依赖随机）
  return tpls[taskText.length % tpls.length];
}

// 按日期确定性地取每日运势（同一天结果固定）
export function fortuneForDate(dateStr: string): { tag: string; text: string } {
  let h = 0;
  for (let i = 0; i < dateStr.length; i++) h = (h * 31 + dateStr.charCodeAt(i)) >>> 0;
  return FORTUNES[h % FORTUNES.length];
}
