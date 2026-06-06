"use client";
import { Chart as ChartJS, registerables } from "chart.js";
import { Radar } from "react-chartjs-2";

ChartJS.register(...registerables);

export default function RadarChart({
  labels,
  data,
  max = 999,
}: {
  labels: string[];
  data: number[];
  max?: number;
}) {
  return (
    <Radar
      data={{
        labels,
        datasets: [
          {
            data,
            backgroundColor: "rgba(0, 243, 255, 0.08)",
            borderColor: "#00f3ff",
            borderWidth: 1.5,
            pointBackgroundColor: "#bf5af2",
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          r: {
            angleLines: { color: "rgba(255,255,255,0.05)" },
            grid: { color: "rgba(255,255,255,0.05)" },
            pointLabels: { color: "#8e8e93", font: { size: 11 } },
            ticks: { display: false },
            suggestedMin: 0,
            suggestedMax: max,
          },
        },
      }}
    />
  );
}
