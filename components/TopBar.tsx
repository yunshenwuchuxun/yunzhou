"use client";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { EXAM_DEADLINE } from "@/lib/model";

export default function TopBar() {
  const data = useStore((s) => s.data)!;
  const [muted, setMuted] = useState(false);
  const [cd, setCd] = useState("CALCULATING...");

  useEffect(() => {
    function tick() {
      const diff = Math.max(0, new Date(EXAM_DEADLINE).getTime() - Date.now());
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCd(`${d}天 ${String(h).padStart(2, "0")}时 ${String(m).padStart(2, "0")}分 ${String(s).padStart(2, "0")}秒`);
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    if (typeof window !== "undefined") (window as unknown as { __muted: boolean }).__muted = next;
  }

  return (
    <div className="top-navbar">
      <div className="countdown">
        ⏳ 27 考研倒计时：<span>{cd}</span>
      </div>
      {data.dailyFortune && (
        <div className="fortune-chip" title={data.dailyFortune.text}>
          🔮 今日运势 · {data.dailyFortune.tag}：{data.dailyFortune.text.slice(0, 16)}…
        </div>
      )}
      <div className="top-currency">
        <button className="icon-btn" onClick={toggleMute} title="音效开关">
          <i className={`fa-solid ${muted ? "fa-volume-xmark" : "fa-volume-high"}`} style={muted ? { color: "var(--red)" } : undefined} />
        </button>
        <span>
          <i className="fa-solid fa-atom" /> 积分：{data.currency}
        </span>
      </div>
    </div>
  );
}
