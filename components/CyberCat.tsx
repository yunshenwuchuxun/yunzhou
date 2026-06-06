"use client";
import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { useStore } from "@/lib/store";
import { petDialogue, pandaNag, wolfDeadlineHowl, CAT_HUNGRY, CAT_LONELY } from "@/lib/content";
import { PETS, petMeta } from "@/lib/pets";
import { CORE_TASK_TTL } from "@/lib/settle";
import type { AppState, PetType } from "@/lib/state";

type CatState = "idle" | "walking" | "laying" | "dragging" | "belly" | "eating" | "jumping";

// 各物种专属彩带配色：龙=赤焰、狼=钢蓝、熊猫=黑白灰、量子猫=青绿
const CHEER_COLORS: Record<PetType, string[]> = {
  "quantum-cat": ["#00d4ff", "#39ff14", "#7af9ff"],
  "mecha-panda": ["#ffffff", "#1a1a1a", "#9aa0a6"],
  "flame-dragon": ["#ff3b1d", "#ff8a00", "#ffd000"],
  "cyber-wolf": ["#2f80ff", "#c0c8d4", "#00e0ff"],
};

// 狼系催战阈值：核心任务距 48h 死线不足 6h 即视为临近
const WOLF_HOWL_LEAD = 6 * 60 * 60 * 1000;

// 是否存在「未完成且临近死线」的核心任务（只读，不改数据）
function hasUrgentCoreTask(data: AppState, now: number): boolean {
  return data.coreTasks.some((t) => {
    if (t.completed || t.isOverdue) return false;
    const remaining = t.createdTs + CORE_TASK_TTL - now;
    return remaining > 0 && remaining < WOLF_HOWL_LEAD;
  });
}

// 是否还有未完成的每日必做（熊猫镇场督促条件）
function hasPendingDaily(data: AppState): boolean {
  return data.dailyTasks.some((t) => !t.done);
}

// 各物种的视觉子结构。共享外层 .pet-mesh.<type> 与共享状态类（idle/walking/...），
// 仅此处的内部 DOM 与对应 CSS 命名空间不同，运动/交互引擎完全复用。
function PetBody({ type }: { type: PetType }) {
  switch (type) {
    case "mecha-panda":
      return (
        <>
          <div className="cat-tail" />
          <div className="cat-torso">
            <div className="panda-armor" />
            <div className="cat-head">
              <div className="panda-ear panda-ear-l" />
              <div className="panda-ear panda-ear-r" />
              <div className="cat-eyes" />
            </div>
          </div>
          <div className="cat-leg leg-fr" />
          <div className="cat-leg leg-fl" />
          <div className="cat-leg leg-br" />
          <div className="cat-leg leg-bl" />
        </>
      );
    case "flame-dragon":
      return (
        <>
          <div className="cat-tail" />
          <div className="cat-torso">
            <div className="dragon-flame" />
            <div className="cat-head">
              <div className="dragon-horn dragon-horn-l" />
              <div className="dragon-horn dragon-horn-r" />
              <div className="cat-eyes" />
            </div>
          </div>
          <div className="cat-leg leg-fr" />
          <div className="cat-leg leg-fl" />
          <div className="cat-leg leg-br" />
          <div className="cat-leg leg-bl" />
        </>
      );
    case "cyber-wolf":
      return (
        <>
          <div className="cat-tail" />
          <div className="cat-torso">
            <div className="cat-head">
              <div className="wolf-ear wolf-ear-l" />
              <div className="wolf-ear wolf-ear-r" />
              <div className="cat-eyes" />
            </div>
          </div>
          <div className="cat-leg leg-fr" />
          <div className="cat-leg leg-fl" />
          <div className="cat-leg leg-br" />
          <div className="cat-leg leg-bl" />
        </>
      );
    case "quantum-cat":
    default:
      return (
        <>
          <div className="cat-tail" />
          <div className="cat-torso">
            <div className="cat-head">
              <div className="cat-eyes" />
            </div>
          </div>
          <div className="cat-leg leg-fr" />
          <div className="cat-leg leg-fl" />
          <div className="cat-leg leg-br" />
          <div className="cat-leg leg-bl" />
        </>
      );
  }
}

// 当前栖息地面线（贴地基准 y）。运动引擎与拖拽松手都以此为基准。
function groundY() {
  return window.innerHeight - 110;
}

// 宠物本体 + 运动/拖拽/独白引擎。仅在未隐藏时挂载，
// 卸载即自动清理所有 interval / raf / 事件监听，隐藏时不空跑定时器。
function PetEntity() {
  const data = useStore((s) => s.data);
  const catSignal = useStore((s) => s.catSignal);
  const strokePet = useStore((s) => s.strokePet);
  const feedPet = useStore((s) => s.feedPet);
  const cheerMe = useStore((s) => s.cheerMe);

  const petType: PetType = data?.petType ?? "quantum-cat";
  const petName = data?.petName ?? "AI-CAT-01";
  const petFood = data?.petFood ?? 100;
  const petLove = data?.petLove ?? 100;
  const hostName = data?.hostName ?? "宿主";

  const catRef = useRef<HTMLDivElement>(null);
  const [stateClass, setStateClass] = useState<CatState>("idle");
  const [bubble, setBubble] = useState("");
  const [showBubble, setShowBubble] = useState(false);
  const [showBowl, setShowBowl] = useState(false);
  const [heartKey, setHeartKey] = useState(0);
  const [hubOpen, setHubOpen] = useState(false);
  const [hubPos, setHubPos] = useState({ x: 0, y: 0 });

  // 用 ref 持有物理量，避免频繁 re-render。
  // baseY = 当前栖息 y（拖拽松手后更新为放置处），运动引擎以它为基准，不再每帧强制回贴地线。
  const phys = useRef({ x: 340, y: 0, baseY: 0, targetX: 340, speed: 1.4, state: "idle" as CatState, hubOpen: false, dragging: false });
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 保持最新的喂养/饥饿数据给定时器读取（含当前出战物种与完整状态用于签名反应）
  const liveRef = useRef({ petFood, petLove, petName, hostName, petType, data });
  liveRef.current = { petFood, petLove, petName, hostName, petType, data };

  function say(text: string) {
    setBubble(text);
    setShowBubble(true);
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    bubbleTimer.current = setTimeout(() => setShowBubble(false), 3500);
  }

  function setCat(s: CatState) {
    phys.current.state = s;
    setStateClass(s);
  }

  // ---------- 初始化：运动引擎 + 拖拽 + 自主独白 ----------
  useEffect(() => {
    const el = catRef.current;
    if (!el) return;
    const p = phys.current;
    p.baseY = groundY();
    p.y = p.baseY;
    el.style.left = p.x + "px";
    el.style.top = p.y + "px";

    // 窗口尺寸变化时夹取，防止宠物跑出视口
    function onResize() {
      const maxX = window.innerWidth - 90;
      const maxY = window.innerHeight - 90;
      p.baseY = Math.min(p.baseY, maxY);
      p.x = Math.max(0, Math.min(maxX, p.x));
      p.targetX = Math.max(0, Math.min(maxX, p.targetX));
      if (p.state !== "walking" && p.state !== "jumping") p.y = p.baseY;
      el!.style.left = p.x + "px";
      el!.style.top = p.y + "px";
    }
    window.addEventListener("resize", onResize);

    // 轻跳跃落地定时器：单独持有引用，卸载时清理，避免隐藏后回调在已卸载组件上 setState
    let jumpTimer: ReturnType<typeof setTimeout> | null = null;

    // 随机漫步 / 躺卧 / 轻跳跃（以当前 x 为中心小范围移动，不再横穿整屏）
    const wander = setInterval(() => {
      if (p.dragging || p.hubOpen || p.state === "eating" || p.state === "belly" || p.state === "jumping") return;
      if (liveRef.current.petFood < 20 && Math.random() > 0.2) {
        setCat("laying");
        return;
      }
      const roll = Math.random();
      if (roll < 0.18) {
        // 低频不定时轻跳跃：原地短促上下弹跳（带极小水平位移），跳完回 idle
        const maxX = window.innerWidth - 90;
        p.x = Math.max(0, Math.min(maxX, p.x + (Math.random() * 24 - 12)));
        p.targetX = p.x;
        el!.style.left = p.x + "px";
        setCat("jumping");
        if (jumpTimer) clearTimeout(jumpTimer);
        jumpTimer = setTimeout(() => {
          if (!p.dragging && p.state === "jumping") setCat("idle");
        }, 560);
      } else if (roll < 0.58) {
        // 小范围游走：以当前 x 为中心 ±40~80px 随机选点
        const span = 40 + Math.random() * 40;
        const dir = Math.random() < 0.5 ? -1 : 1;
        const maxX = window.innerWidth - 90;
        p.targetX = Math.max(0, Math.min(maxX, p.x + dir * span));
        setCat("walking");
      } else if (roll < 0.72) {
        setCat("laying");
      } else {
        setCat("idle");
      }
    }, 5000);

    // 行走帧：水平向 targetX 步进，y 始终锁定到 baseY（贴当前栖息线）
    let raf = 0;
    function frame() {
      if (p.state === "walking" && !p.hubOpen && !p.dragging) {
        const step = p.targetX > p.x ? p.speed : -p.speed;
        p.x += step;
        if (Math.abs(p.x - p.targetX) <= 2) {
          p.x = p.targetX;
          setCat("idle");
        }
        p.y = p.baseY;
        if (el) {
          el.style.left = p.x + "px";
          el.style.top = p.y + "px";
        }
      }
      raf = requestAnimationFrame(frame);
    }
    frame();

    // 自主独白
    const mind = setInterval(() => {
      if (p.dragging) return;
      const { petFood, petLove, petName, hostName, petType, data } = liveRef.current;
      if (petFood < 25) { say(CAT_HUNGRY(petName)); return; }
      if (petLove < 30) { say(CAT_LONELY(hostName)); return; }
      // 物种签名反应（低频、条件满足时择一插入，不喧宾夺主）
      if (data) {
        // 机械狼：核心契约临近死线时嚎叫催战（约 60% 概率，避免每 tick 刷屏）
        if (petType === "cyber-wolf" && hasUrgentCoreTask(data, Date.now()) && Math.random() < 0.6) {
          say(wolfDeadlineHowl());
          return;
        }
        // 机甲熊猫：每日必做有遗留时镇场督促（约 45% 概率）
        if (petType === "mecha-panda" && hasPendingDaily(data) && Math.random() < 0.45) {
          say(pandaNag());
          return;
        }
      }
      // 默认：按当前出战物种从其专属独白池取一条
      say(petDialogue(petType));
    }, 12000);

    return () => {
      clearInterval(wander);
      clearInterval(mind);
      cancelAnimationFrame(raf);
      if (jumpTimer) clearTimeout(jumpTimer);
      if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // ---------- 拖拽 ----------
  useEffect(() => {
    const el = catRef.current;
    if (!el) return;
    const p = phys.current;
    let down = false;
    let ox = 0;
    let oy = 0;

    function onDown(e: MouseEvent) {
      if ((e.target as HTMLElement).closest("button")) return;
      down = true;
      p.dragging = true;
      el!.classList.add("dragging");
      setCat("idle");
      el!.querySelector(".pet-mesh")?.classList.add("floating");
      const r = el!.getBoundingClientRect();
      ox = e.clientX - r.left;
      oy = e.clientY - r.top;
      setHubOpen(false);
      p.hubOpen = false;
    }
    function onMove(e: MouseEvent) {
      if (!down) return;
      p.x = Math.max(0, Math.min(window.innerWidth - 90, e.clientX - ox));
      p.y = Math.max(0, Math.min(window.innerHeight - 90, e.clientY - oy));
      el!.style.left = p.x + "px";
      el!.style.top = p.y + "px";
    }
    function onUp() {
      if (!down) return;
      down = false;
      p.dragging = false;
      el!.classList.remove("dragging");
      el!.querySelector(".pet-mesh")?.classList.remove("floating");
      setCat("idle");
      // 松手后停在放置处：x/y 都保留，并把当前 y 记为新的栖息基准
      p.targetX = p.x;
      p.baseY = p.y;
      el!.style.left = p.x + "px";
      el!.style.top = p.y + "px";
      say("已在此处重新锚定坐标。");
    }

    el.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      el.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  // ---------- 响应抚摸 / 投喂信号 ----------
  useEffect(() => {
    if (!catSignal) return;
    if (catSignal.type === "stroke") {
      setCat("belly");
      setHeartKey((k) => k + 1);
      confetti({ particleCount: 36, spread: 55, origin: { x: phys.current.x / window.innerWidth, y: 0.85 } });
      const t = setTimeout(() => setCat("idle"), 2600);
      return () => clearTimeout(t);
    }
    if (catSignal.type === "eat" || catSignal.type === "feed") {
      setCat("eating");
      setShowBowl(true);
      setHeartKey((k) => k + 1);
      say("呜姆…吃东西最幸福了喵。");
      const t = setTimeout(() => {
        setShowBowl(false);
        setCat("idle");
      }, 3200);
      return () => clearTimeout(t);
    }
    if (catSignal.type === "cheer") {
      if (catSignal.text) say(catSignal.text);
      setCat("belly");
      setHeartKey((k) => k + 1);
      const ox = phys.current.x / window.innerWidth;
      const colors = CHEER_COLORS[petType];
      if (catSignal.big) {
        // 加强版：多段彩带（里程碑 / 主动求鼓励），按物种配色
        confetti({ particleCount: 80, spread: 75, startVelocity: 45, colors, origin: { x: ox, y: 0.85 } });
        const burst = setTimeout(
          () => confetti({ particleCount: 60, spread: 100, scalar: 1.1, colors, origin: { x: ox, y: 0.7 } }),
          250,
        );
        const back = setTimeout(() => setCat("idle"), 2600);
        return () => {
          clearTimeout(burst);
          clearTimeout(back);
        };
      }
      confetti({ particleCount: 42, spread: 60, colors, origin: { x: ox, y: 0.85 } });
      const back = setTimeout(() => setCat("idle"), 2000);
      return () => clearTimeout(back);
    }
  }, [catSignal, petType]);

  // 饥饿时显示不开心表情（非进食/抚摸态）
  const hungry = petFood < 20 && stateClass !== "eating" && stateClass !== "belly";
  const meshClass = `pet-mesh ${petType} ${stateClass} ${hungry ? "sad" : ""}`;

  function toggleHub(e: React.MouseEvent) {
    if (phys.current.dragging) return;
    e.stopPropagation();
    const next = !hubOpen;
    setHubOpen(next);
    phys.current.hubOpen = next;
    if (next) {
      setCat("laying");
      setHubPos({
        x: Math.min(phys.current.x, window.innerWidth - 310),
        y: window.innerHeight - 320,
      });
    } else {
      setCat("idle");
    }
  }

  if (!data) return null;

  return (
    <>
      <div id="cyber-pet" ref={catRef} onClick={toggleHub}>
        <div className={`pet-bubble ${showBubble ? "show" : ""}`}>{bubble}</div>
        {heartKey > 0 && <div className="cat-heart" key={heartKey}>💗</div>}
        <div className={meshClass}>
          <PetBody type={petType} />
          {showBowl && <div className="cat-bowl" />}
        </div>
      </div>

      {hubOpen && (
        <div className="pet-hub" style={{ left: hubPos.x, top: hubPos.y }}>
          <div className="hub-header">
            <span>🤖 系统实体交互枢纽</span>
            <button onClick={() => { setHubOpen(false); phys.current.hubOpen = false; setCat("idle"); }}>
              <i className="fa-solid fa-xmark" />
            </button>
          </div>
          <div style={{ fontSize: 13, marginBottom: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>实体代号:</span>
              <b style={{ color: "var(--primary)" }}>{petName}</b>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>亲密度:</span>
              <b style={{ color: "var(--pink)" }}>{petLove}</b>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>饱食能级:</span>
              <b style={{ color: "var(--green)" }}>{petFood}%</b>
            </div>
          </div>
          <div className="input-fields" style={{ gap: 10 }}>
            <button className="btn-prime" onClick={(e) => { e.stopPropagation(); strokePet(); }}>
              🤚 抚摸（露肚皮 · 消耗2积分）
            </button>
            <button className="btn-prime btn-gold" onClick={(e) => { e.stopPropagation(); feedPet(); }}>
              🐟 快速投喂（消耗5积分）
            </button>
            <button className="btn-prime" onClick={(e) => { e.stopPropagation(); cheerMe(); }}>
              ✨ 求鼓励（让我给你加油喵）
            </button>
            <span className="muted" style={{ fontSize: 11 }}>提示：在商城背包点击食物可让猫咪进食。</span>
          </div>
        </div>
      )}
    </>
  );
}

// 常驻快捷切换坞：固定右下角，不必点开枢纽即可切换出战实体 / 隐藏召回。
// 半透明小尺寸低干扰；隐藏状态下收起 chip 仅留召回按钮。
function PetDock() {
  const petType: PetType = useStore((s) => s.data?.petType ?? "quantum-cat");
  const petHidden = useStore((s) => s.data?.petHidden ?? false);
  const setPetType = useStore((s) => s.setPetType);
  const togglePetVisibility = useStore((s) => s.togglePetVisibility);

  return (
    <div className="pet-dock">
      {petHidden ? (
        <button
          className="pet-dock-recall"
          title="召回宠物"
          onClick={() => togglePetVisibility()}
        >
          <span className="pet-chip-emoji">{petMeta(petType).emoji}</span>
          <span>召回宠物</span>
        </button>
      ) : (
        <>
          {PETS.map((p) => (
            <button
              key={p.type}
              className={`pet-dock-chip ${p.type === petType ? "active" : ""}`}
              title={`${p.label} · ${p.blurb}`}
              onClick={() => setPetType(p.type)}
            >
              <span className="pet-chip-emoji">{p.emoji}</span>
            </button>
          ))}
          <button
            className="pet-dock-toggle"
            title="隐藏宠物"
            onClick={() => togglePetVisibility()}
          >
            <i className="fa-solid fa-eye-slash" />
          </button>
        </>
      )}
    </div>
  );
}

export default function CyberCat() {
  const petHidden = useStore((s) => s.data?.petHidden ?? false);
  const loaded = useStore((s) => s.data !== null);
  if (!loaded) return null;
  return (
    <>
      {/* 隐藏时不挂载本体：运动引擎随之卸载，定时器/raf 全部清理，无空跑 */}
      {!petHidden && <PetEntity />}
      <PetDock />
    </>
  );
}
