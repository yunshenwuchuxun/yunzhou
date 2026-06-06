"use client";
import { useStore } from "@/lib/store";
import RadarChart from "@/components/RadarChart";
import { WISDOM_SUBJECTS, MAX_POINT, COMBO_THRESHOLD, isZhengzhiUnlocked } from "@/lib/model";
import { wisdomLevel, wisdomTotal } from "@/lib/derive";

export default function WisdomPanel() {
  const data = useStore((s) => s.data)!;
  const grindSkill = useStore((s) => s.grindSkill);

  const lv = wisdomLevel(data);
  const total = wisdomTotal(data);
  const levelProgress = (total % 50) * 2; // 0-100%
  const comboOn = data.attrs.gaoshu >= COMBO_THRESHOLD && data.attrs.xiandai >= COMBO_THRESHOLD;
  const zhengzhiUnlocked = isZhengzhiUnlocked();

  const radarSubjects = WISDOM_SUBJECTS;
  return (
    <div className="view-panel">
      <div className="panel-title">🧠 认知与知识矩阵</div>
      <div className="dashboard-grid">
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div className="panel-card">
            <div style={{ color: "var(--primary)", fontSize: 14, fontWeight: 600, marginBottom: 14 }}>
              知识阶位 Lv.{lv}（累积总知识度 {total} pt）
            </div>
            <div className="progress-track">
              <div className="progress-bar" style={{ width: `${levelProgress}%`, background: "linear-gradient(90deg, var(--primary), var(--purple))" }} />
            </div>
            <p className="muted" style={{ fontSize: 11, marginTop: 14 }}>
              * 每刷 50 点知识度，阶位向上跃迁一级。开放刷点：高数 / 408 / 考研英语。
            </p>
          </div>
        </div>
        <div className="panel-card" style={{ height: 300, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <RadarChart
            labels={radarSubjects.map((s) => s.radar)}
            data={radarSubjects.map((s) => data.attrs[s.key] || 0)}
            max={MAX_POINT}
          />
        </div>
      </div>

      <div className="panel-card combo-box" style={{ marginBottom: 22 }}>
        <div style={{ fontWeight: 700, color: comboOn ? "var(--green)" : "var(--primary)", marginBottom: 6 }}>
          <i className="fa-solid fa-wave-square" /> 数理协同被动
        </div>
        <div className="muted">
          {comboOn
            ? "🟢 共振中：完成高数/线代契约时额外 +2 积分。"
            : `🔒 高等数学与线性代数均达 ${COMBO_THRESHOLD} pt 时自动激活。`}
        </div>
      </div>

      <div className="section-title">
        <i className="fa-solid fa-layer-group" /> 学科技能点（上限 {MAX_POINT}）
      </div>
      <div className="grid-3-col">
        {WISDOM_SUBJECTS.map((s) => {
          const val = data.attrs[s.key] || 0;
          const locked = s.key === "zhengzhi" && !zhengzhiUnlocked;
          return (
            <div key={s.key} className={`card-mini ${val >= MAX_POINT ? "maxed" : ""} ${locked ? "locked" : ""}`}>
              <h5>{s.label} · {s.group === "gaoshu" ? "高数" : s.group === "408" ? "408" : s.group === "yingyu" ? "英语" : "政治"}</h5>
              <div className="val">{val >= MAX_POINT ? `${MAX_POINT} [MAX]` : `${val} pt`}</div>
              <button
                className="btn-mini"
                disabled={locked}
                onClick={() => grindSkill(s.key)}
              >
                {locked ? "9月后解锁" : "刷技能点 +10"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
