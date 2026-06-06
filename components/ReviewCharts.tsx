"use client";
import { Chart as ChartJS, registerables } from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import type { DailyHistory } from "@/lib/state";

ChartJS.register(...registerables);

const axis = {
  ticks: { color: "#8e8e93", font: { size: 10 } },
  grid: { color: "rgba(255,255,255,0.04)" },
};

export default function ReviewCharts({ history }: { history: DailyHistory[] }) {
  const recent = history.slice(-30);
  const labels = recent.map((h) => h.date.slice(5));

  if (recent.length === 0) {
    return <p className="muted" style={{ fontSize: 13 }}>暂无历史数据，完成每日结算后这里会出现属性提升与积分曲线。</p>;
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
      <div className="chart-box" style={{ height: 280 }}>
        <div className="section-title">📊 每日属性净增量</div>
        <div style={{ height: 220 }}>
          <Bar
            data={{
              labels,
              datasets: [
                {
                  label: "属性增量",
                  data: recent.map((h) => h.attrGain),
                  backgroundColor: "rgba(0,243,255,0.4)",
                  borderColor: "#00f3ff",
                  borderWidth: 1,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: { x: axis, y: axis },
            }}
          />
        </div>
      </div>
      <div className="chart-box" style={{ height: 280 }}>
        <div className="section-title">📈 每日积分收支</div>
        <div style={{ height: 220 }}>
          <Line
            data={{
              labels,
              datasets: [
                {
                  label: "获得",
                  data: recent.map((h) => h.pointsEarned),
                  borderColor: "#30d158",
                  backgroundColor: "rgba(48,209,88,0.1)",
                  tension: 0.3,
                },
                {
                  label: "消耗",
                  data: recent.map((h) => h.pointsSpent),
                  borderColor: "#ff453a",
                  backgroundColor: "rgba(255,69,58,0.1)",
                  tension: 0.3,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { labels: { color: "#8e8e93", font: { size: 10 } } } },
              scales: { x: axis, y: axis },
            }}
          />
        </div>
      </div>
    </div>
  );
}
