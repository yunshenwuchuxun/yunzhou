"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { MAX_POINT } from "@/lib/model";

export default function TalentPanel() {
  const data = useStore((s) => s.data)!;
  const addTalent = useStore((s) => s.addTalent);
  const removeTalent = useStore((s) => s.removeTalent);
  const grindTalent = useStore((s) => s.grindTalent);
  const [name, setName] = useState("");

  function add() {
    if (!name.trim()) return;
    addTalent(name.trim());
    setName("");
  }

  return (
    <div className="view-panel">
      <div className="panel-title">🎨 才艺 · 自定义</div>
      <div className="panel-card" style={{ marginBottom: 22 }}>
        <div className="section-title">新增才艺项</div>
        <div style={{ display: "flex", gap: 12 }}>
          <input
            className="field"
            placeholder="如：钢琴、绘画、书法、舞蹈…"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
          />
          <button className="btn-prime" style={{ padding: "0 22px" }} onClick={add}>
            创建
          </button>
        </div>
      </div>

      {data.talents.length === 0 ? (
        <p className="muted" style={{ fontSize: 13 }}>暂未添加任何才艺，先在上方创建一项吧。</p>
      ) : (
        <div className="grid-3-col">
          {data.talents.map((t) => (
            <div key={t.id} className={`card-mini ${t.points >= MAX_POINT ? "maxed" : ""}`}>
              <h5>{t.name}</h5>
              <div className="val">{t.points >= MAX_POINT ? `${MAX_POINT} [MAX]` : `${t.points} pt`}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-mini" onClick={() => grindTalent(t.id)}>精进 +10</button>
                <button className="btn-mini btn-danger" onClick={() => removeTalent(t.id)}>删除</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
