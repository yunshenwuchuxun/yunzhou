// 系统文案：猫咪语录（贴合考研自我提升）、每日运势、系统公告模板。

// 猫咪日常独白（系统语录，已按考研养成规划改写）
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

// 鼓励加油语料池（完成任务 / 刷技能点等行为即时正反馈）
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
