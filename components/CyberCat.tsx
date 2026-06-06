"use client";
import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { useStore } from "@/lib/store";
import { CAT_DIALOGUES, CAT_HUNGRY, CAT_LONELY } from "@/lib/content";

type CatState = "idle" | "walking" | "laying" | "dragging" | "belly" | "eating";

export default function CyberCat() {
  const data = useStore((s) => s.data);
  const catSignal = useStore((s) => s.catSignal);
  const strokePet = useStore((s) => s.strokePet);
  const feedPet = useStore((s) => s.feedPet);
  const cheerMe = useStore((s) => s.cheerMe);

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

  // 用 ref 持有物理量，避免频繁 re-render
  const phys = useRef({ x: 340, y: 0, targetX: 340, speed: 1.4, state: "idle" as CatState, hubOpen: false, dragging: false });
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 保持最新的喂养/饥饿数据给定时器读取
  const liveRef = useRef({ petFood, petLove, petName, hostName });
  liveRef.current = { petFood, petLove, petName, hostName };

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
    p.y = window.innerHeight - 110;
    el.style.left = p.x + "px";
    el.style.top = p.y + "px";

    // 随机漫步 / 躺卧
    const wander = setInterval(() => {
      if (p.dragging || p.hubOpen || p.state === "eating" || p.state === "belly") return;
      if (liveRef.current.petFood < 20 && Math.random() > 0.2) {
        setCat("laying");
        return;
      }
      if (Math.random() > 0.6) {
        const maxW = window.innerWidth - 120;
        p.targetX = Math.floor(Math.random() * Math.max(1, maxW - 350)) + 350;
        setCat("walking");
      } else if (Math.random() > 0.7) {
        setCat("laying");
      } else {
        setCat("idle");
      }
    }, 5000);

    // 行走帧
    let raf = 0;
    function frame() {
      if (p.state === "walking" && !p.hubOpen && !p.dragging) {
        const step = p.targetX > p.x ? p.speed : -p.speed;
        p.x += step;
        if (Math.abs(p.x - p.targetX) <= 2) {
          p.x = p.targetX;
          setCat("idle");
        }
        p.y = window.innerHeight - 110;
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
      const { petFood, petLove, petName, hostName } = liveRef.current;
      if (petFood < 25) say(CAT_HUNGRY(petName));
      else if (petLove < 30) say(CAT_LONELY(hostName));
      else say(CAT_DIALOGUES[Math.floor(Math.random() * CAT_DIALOGUES.length)]);
    }, 12000);

    return () => {
      clearInterval(wander);
      clearInterval(mind);
      cancelAnimationFrame(raf);
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
      el!.querySelector(".cat-mesh")?.classList.add("floating");
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
      el!.querySelector(".cat-mesh")?.classList.remove("floating");
      setCat("idle");
      p.targetX = p.x;
      p.y = window.innerHeight - 110;
      el!.style.top = p.y + "px";
      say("安全着陆，重力总线重锁成功。");
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
      if (catSignal.big) {
        // 加强版：多段彩带（里程碑 / 主动求鼓励）
        confetti({ particleCount: 80, spread: 75, startVelocity: 45, origin: { x: ox, y: 0.85 } });
        const burst = setTimeout(
          () => confetti({ particleCount: 60, spread: 100, scalar: 1.1, origin: { x: ox, y: 0.7 } }),
          250,
        );
        const back = setTimeout(() => setCat("idle"), 2600);
        return () => {
          clearTimeout(burst);
          clearTimeout(back);
        };
      }
      confetti({ particleCount: 42, spread: 60, origin: { x: ox, y: 0.85 } });
      const back = setTimeout(() => setCat("idle"), 2000);
      return () => clearTimeout(back);
    }
  }, [catSignal]);

  // 饥饿时显示不开心表情（非进食/抚摸态）
  const hungry = petFood < 20 && stateClass !== "eating" && stateClass !== "belly";
  const meshClass = `cat-mesh ${stateClass} ${hungry ? "sad" : ""}`;

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
