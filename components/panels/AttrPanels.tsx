"use client";
import { useStore } from "@/lib/store";
import {
  CHARM_FACE,
  TEMPERAMENT_KEYS,
  PHYSIQUE_KEYS,
  UNIT_LABELS,
  MAX_POINT,
} from "@/lib/model";

function Bar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="stat-group">
      <div className="stat-header">
        <span>{label}</span>
        <b>{value}/{MAX_POINT}</b>
      </div>
      <div className="progress-track">
        <div className="progress-bar" style={{ width: `${(value / MAX_POINT) * 100}%`, background: color }} />
      </div>
    </div>
  );
}

const COLORS = ["var(--pink)", "var(--purple)", "var(--primary)", "var(--green)", "var(--gold)"];

export function CharmPanel() {
  const data = useStore((s) => s.data)!;
  return (
    <div className="view-panel">
      <div className="panel-title">💄 魅力 · 容貌与体态</div>
      <div className="panel-card" style={{ marginBottom: 22 }}>
        <div className="section-title">容貌细分（与每日必做挂钩）</div>
        {CHARM_FACE.map((k, i) => (
          <Bar key={k} label={UNIT_LABELS[k]} value={data.attrs[k] || 0} color={COLORS[i % COLORS.length]} />
        ))}
      </div>
      <div className="panel-card">
        <div className="section-title">体态</div>
        <Bar label={UNIT_LABELS.titai} value={data.attrs.titai || 0} color="var(--purple)" />
        <p className="muted" style={{ fontSize: 11 }}>* 体态可通过挂钩「体态」的核心任务来提升。</p>
      </div>
    </div>
  );
}

export function TemperamentPanel() {
  const data = useStore((s) => s.data)!;
  return (
    <div className="view-panel">
      <div className="panel-title">🌸 气质指标</div>
      <div className="panel-card">
        {TEMPERAMENT_KEYS.map((k, i) => (
          <Bar key={k} label={UNIT_LABELS[k]} value={data.attrs[k] || 0} color={COLORS[i % COLORS.length]} />
        ))}
        <p className="muted" style={{ fontSize: 11 }}>* 情感 / 逻辑 / 谈吐 / 博闻 / 观察力 通过挂钩相应核心任务提升。</p>
      </div>
    </div>
  );
}

export function PhysiquePanel() {
  const data = useStore((s) => s.data)!;
  return (
    <div className="view-panel">
      <div className="panel-title">🩸 体质指标</div>
      <div className="panel-card">
        {PHYSIQUE_KEYS.map((k, i) => (
          <Bar key={k} label={UNIT_LABELS[k]} value={data.attrs[k] || 0} color={COLORS[i % COLORS.length]} />
        ))}
        <p className="muted" style={{ fontSize: 11 }}>
          * 睡眠 / 饮食 / 习惯 / 锻炼 与每日必做挂钩，次日 0 点结算；其中「每天五杯水」漏做会扣点。
        </p>
      </div>
    </div>
  );
}
