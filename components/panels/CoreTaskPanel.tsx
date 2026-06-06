"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { attrOptions, UNIT_LABELS } from "@/lib/model";

export default function CoreTaskPanel() {
  const data = useStore((s) => s.data)!;
  const addCoreTask = useStore((s) => s.addCoreTask);
  const completeCoreTask = useStore((s) => s.completeCoreTask);
  const removeCoreTask = useStore((s) => s.removeCoreTask);
  const suppressDemon = useStore((s) => s.suppressDemon);

  const [text, setText] = useState("");
  const [attrKey, setAttrKey] = useState("gaoshu");
  const [mode, setMode] = useState<"normal" | "gamble">("normal");

  const options = [
    ...attrOptions(),
    ...data.talents.map((t) => ({ key: `talent:${t.id}`, label: `才艺·${t.name}` })),
  ];
  function attrLabel(k: string) {
    if (k.startsWith("talent:")) {
      const t = data.talents.find((x) => `talent:${x.id}` === k);
      return t ? `才艺·${t.name}` : "才艺";
    }
    return UNIT_LABELS[k] || k;
  }

  function add() {
    if (!text.trim()) return;
    addCoreTask(text.trim(), attrKey, mode);
    setText("");
  }

  const active = data.coreTasks.filter((t) => !t.completed);

  return (
    <div className="view-panel">
      <div className="panel-title">⚔️ 核心任务（48 小时死线）</div>
      <div className="task-view-grid">
        <div className="panel-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div className="section-title">📜 颁布今日核心契约</div>
            <div className="input-fields">
              <input className="field" placeholder="必须攻克的具体目标…" value={text} onChange={(e) => setText(e.target.value)} />
              <select className="field" value={attrKey} onChange={(e) => setAttrKey(e.target.value)}>
                {options.map((o) => (
                  <option key={o.key} value={o.key}>{o.label}</option>
                ))}
              </select>
              <select className="field" value={mode} onChange={(e) => setMode(e.target.value as "normal" | "gamble")}>
                <option value="normal">⚖️ 标准契约（成 +10，超时 -20）</option>
                <option value="gamble">🔥 高载荷契约（成 +25，超时 -40）</option>
              </select>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 18 }}>
            <button className="btn-prime" onClick={add}>颁布契约</button>
            <button className="btn-prime btn-danger" onClick={suppressDemon}>⚠️ 镇压心魔（扣 15 积分）</button>
          </div>
        </div>

        <div className="panel-card" style={{ display: "flex", flexDirection: "column" }}>
          <div className="section-title">⚡ 进行中契约（48h 倒计时）</div>
          <div className="scroller" style={{ maxHeight: 480 }}>
            {active.length === 0 && <p className="muted" style={{ fontSize: 13 }}>暂无进行中的核心契约。</p>}
            {active.map((t) => {
              const dl = new Date(t.createdTs + 48 * 3600000);
              const dlStr = `${dl.getMonth() + 1}/${dl.getDate()} ${String(dl.getHours()).padStart(2, "0")}:${String(dl.getMinutes()).padStart(2, "0")}`;
              return (
                <div key={t.id} className={`task-node ${t.mode === "gamble" ? "gamble" : ""}`}>
                  <div>
                    <h4>{t.mode === "gamble" ? "[高载荷] " : ""}{t.text}</h4>
                    <p>挂钩 {attrLabel(t.attrKey)} · ⏳ 死线 {dlStr}</p>
                  </div>
                  {t.isOverdue ? (
                    <span style={{ color: "var(--red)", fontSize: 12 }}>已超时
                      <button className="goods-del" style={{ position: "static", marginLeft: 8 }} onClick={() => removeCoreTask(t.id)}>
                        <i className="fa-solid fa-xmark" />
                      </button>
                    </span>
                  ) : (
                    <button className="btn-mini" onClick={() => completeCoreTask(t.id)}>交割</button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
