"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import ReviewCharts from "@/components/ReviewCharts";

export default function ReviewPanel() {
  const data = useStore((s) => s.data)!;
  const submitReview = useStore((s) => s.submitReview);
  const pushToast = useStore((s) => s.pushToast);
  const [weekly, setWeekly] = useState("");
  const [monthly, setMonthly] = useState("");

  function submit(type: "weekly" | "monthly", text: string, clear: () => void) {
    if (submitReview(text, type)) {
      clear();
      pushToast(type === "weekly" ? "周复盘已灌注，亲密度 +5。" : "月复盘已灌注，系统饱食加满。");
    } else {
      pushToast(type === "weekly" ? "周复盘至少 15 字。" : "月复盘至少 30 字。");
    }
  }

  return (
    <div className="view-panel">
      <div className="panel-title">📈 周 / 月复盘</div>

      <ReviewCharts history={data.historyDaily} />

      <div className="review-flex-box" style={{ marginTop: 22 }}>
        <div className="panel-card">
          <div style={{ fontSize: 13, color: "var(--pink)", fontWeight: 700, marginBottom: 12 }}>
            <i className="fa-solid fa-calendar-week" /> 周复盘（+5 亲密度）
          </div>
          <textarea className="review-textarea" placeholder="本周行为过载度、薄弱点、下周改进计划…" value={weekly} onChange={(e) => setWeekly(e.target.value)} />
          <button className="btn-prime" style={{ marginTop: 12 }} onClick={() => submit("weekly", weekly, () => setWeekly(""))}>
            灌注周复盘
          </button>
        </div>
        <div className="panel-card">
          <div style={{ fontSize: 13, color: "var(--gold)", fontWeight: 700, marginBottom: 12 }}>
            <i className="fa-solid fa-calendar-days" /> 月复盘（系统饱食加满）
          </div>
          <textarea className="review-textarea" placeholder="本月核心成果、积分转化率、下阶段蓝图…" value={monthly} onChange={(e) => setMonthly(e.target.value)} />
          <button className="btn-prime btn-gold" style={{ marginTop: 12 }} onClick={() => submit("monthly", monthly, () => setMonthly(""))}>
            灌注月复盘
          </button>
        </div>
      </div>

      <div className="section-title" style={{ marginTop: 22 }}>📜 复盘日志</div>
      <div className="log-screen">
        {data.reviewLogs.length === 0 ? "> 暂无复盘记录。" : data.reviewLogs.join("\n\n-----------------------\n\n")}
      </div>
    </div>
  );
}
