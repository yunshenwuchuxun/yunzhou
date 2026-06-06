"use client";
import { useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { wisdomLevel } from "@/lib/derive";

export interface ViewDef {
  key: string;
  label: string;
  icon: string;
}

export default function Sidebar({
  views,
  active,
  onSwitch,
}: {
  views: ViewDef[];
  active: string;
  onSwitch: (k: string) => void;
}) {
  const data = useStore((s) => s.data)!;
  const setAvatar = useStore((s) => s.setAvatar);
  const renameSystem = useStore((s) => s.renameSystem);
  const logout = useStore((s) => s.logout);
  const hardReset = useStore((s) => s.hardReset);
  const fileRef = useRef<HTMLInputElement>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(data.systemName);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatar(String(ev.target?.result || ""));
    reader.readAsDataURL(file);
  }

  const lv = wisdomLevel(data);
  const activeCore = data.coreTasks.filter((t) => !t.completed && !t.isOverdue).length;
  const dailyLeft = data.dailyTasks.filter((t) => !t.done).length;

  return (
    <div className="sidebar">
      <div className="host-card">
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPick} />
        <div className="avatar-frame" onClick={() => fileRef.current?.click()} title="点击更换头像">
          {data.avatarBase64 ? (
            <img src={data.avatarBase64} alt="avatar" />
          ) : (
            <i className="fa-solid fa-microchip" />
          )}
        </div>
        <div className="host-name">{data.hostName || "-"}</div>
        <div className="host-tag">{data.gender}</div>
        <div className="sys-name-row">
          系统名：
          {editingName ? (
            <>
              <input
                className="field"
                style={{ width: 110, padding: "4px 6px", fontSize: 11 }}
                value={nameDraft}
                autoFocus
                onChange={(e) => setNameDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && nameDraft.trim()) {
                    renameSystem(nameDraft.trim());
                    setEditingName(false);
                  }
                }}
              />
              <button onClick={() => { if (nameDraft.trim()) renameSystem(nameDraft.trim()); setEditingName(false); }}>
                ✓
              </button>
            </>
          ) : (
            <>
              <b>{data.systemName}</b>
              <button onClick={() => { setNameDraft(data.systemName); setEditingName(true); }} title="改系统名">
                <i className="fa-solid fa-pen" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="menu-list">
        {views.map((v) => {
          let badge: string | null = null;
          if (v.key === "wisdom") badge = `Lv.${lv}`;
          if (v.key === "core" && activeCore) badge = String(activeCore);
          if (v.key === "daily" && dailyLeft) badge = String(dailyLeft);
          return (
            <button
              key={v.key}
              className={`menu-btn ${active === v.key ? "active" : ""}`}
              onClick={() => onSwitch(v.key)}
            >
              <span>
                {v.icon} {v.label}
              </span>
              {badge && (
                <span className="menu-badge" style={{ color: v.key === "wisdom" ? "var(--pink)" : "var(--red)" }}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <button
        onClick={logout}
        style={{ background: "none", border: "1px solid var(--panel-border)", color: "var(--text-muted)", fontSize: 11, cursor: "pointer", padding: "8px", borderRadius: 3 }}
      >
        <i className="fa-solid fa-right-from-bracket" /> 退出登录
      </button>
      <button
        onClick={() => { if (confirm("全盘格式化擦除底层数据链？此操作不可撤销。")) hardReset(); }}
        style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 10, cursor: "pointer" }}
      >
        [ ESCAPE &amp; FORMAT ALL ]
      </button>
    </div>
  );
}
