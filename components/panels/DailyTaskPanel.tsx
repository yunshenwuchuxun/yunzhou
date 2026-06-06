"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { attrOptions, UNIT_LABELS } from "@/lib/model";

export default function DailyTaskPanel() {
  const data = useStore((s) => s.data)!;
  const toggleDaily = useStore((s) => s.toggleDaily);
  const addCustomDaily = useStore((s) => s.addCustomDaily);
  const removeDaily = useStore((s) => s.removeDaily);

  const [name, setName] = useState("");
  const [attrKey, setAttrKey] = useState("yanjing");
  const [penalty, setPenalty] = useState(false);

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
    if (!name.trim()) return;
    addCustomDaily(name.trim(), attrKey, penalty);
    setName("");
  }

  const doneCount = data.dailyTasks.filter((t) => t.done).length;

  return (
    <div className="view-panel">
      <div className="panel-title">📅 每日必做（次日 0 点自动结算刷新）</div>
      <div className="task-view-grid">
        <div className="panel-card" style={{ height: "fit-content" }}>
          <div className="section-title">自定义每日任务</div>
          <div className="input-fields">
            <input className="field" placeholder="任务名，如：背50个单词" value={name} onChange={(e) => setName(e.target.value)} />
            <select className="field" value={attrKey} onChange={(e) => setAttrKey(e.target.value)}>
              {options.map((o) => (
                <option key={o.key} value={o.key}>{o.label}</option>
              ))}
            </select>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-muted)" }}>
              <input type="checkbox" checked={penalty} onChange={(e) => setPenalty(e.target.checked)} />
              漏做扣点（默认仅完成加点）
            </label>
            <button className="btn-prime" onClick={add}>添加每日任务</button>
          </div>
          <p className="muted" style={{ fontSize: 11, marginTop: 16 }}>
            今日进度：{doneCount}/{data.dailyTasks.length}。容貌组与「每天五杯水」漏做会在 0 点扣点。
          </p>
        </div>

        <div className="panel-card" style={{ display: "flex", flexDirection: "column" }}>
          <div className="section-title">今日清单</div>
          <div className="scroller" style={{ maxHeight: 460 }}>
            {data.dailyTasks.map((t) => (
              <div key={t.id} className={`daily-row ${t.done ? "done" : ""}`}>
                <div className={`daily-check ${t.done ? "on" : ""}`} onClick={() => toggleDaily(t.id)}>
                  {t.done && <i className="fa-solid fa-check" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14 }}>{t.name}</div>
                  <div className="daily-meta">
                    挂钩：{attrLabel(t.attrKey)} {t.penalty && <span style={{ color: "var(--red)" }}>· 漏做扣点</span>}
                  </div>
                </div>
                {!t.builtin && (
                  <button className="goods-del" style={{ position: "static" }} onClick={() => removeDaily(t.id)}>
                    <i className="fa-solid fa-xmark" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
