"use client";
import { useStore } from "@/lib/store";

export default function SummaryPanel() {
  const data = useStore((s) => s.data)!;
  const logs = data.todayDoneLogs;

  return (
    <div className="view-panel">
      <div className="panel-title">🌙 每日总结</div>
      <div className="dashboard-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <div className="panel-card">
          <div className="muted" style={{ fontSize: 12 }}>今日属性净增</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--primary)" }}>{data.todayStats.attrGain}</div>
        </div>
        <div className="panel-card">
          <div className="muted" style={{ fontSize: 12 }}>今日获得积分</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--green)" }}>{data.todayStats.pointsEarned}</div>
        </div>
        <div className="panel-card">
          <div className="muted" style={{ fontSize: 12 }}>今日消耗积分</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--red)" }}>{data.todayStats.pointsSpent}</div>
        </div>
      </div>

      {data.dailyFortune && (
        <div className="panel-card" style={{ margin: "0 0 22px" }}>
          <div className="section-title">🔮 今日运势 · {data.dailyFortune.tag}</div>
          <div className="muted" style={{ fontSize: 13 }}>{data.dailyFortune.text}</div>
        </div>
      )}

      <div className="section-title">📋 今日行为日志</div>
      <div className="log-screen">
        {logs.length === 0 ? "> 今天还没有完成任何任务，去刷点技能或勾选每日必做吧。" : logs.join("\n")}
      </div>
    </div>
  );
}
