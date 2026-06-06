"use client";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import Starfield from "@/components/Starfield";
import Sidebar, { ViewDef } from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import CyberCat from "@/components/CyberCat";
import Toast from "@/components/Toast";
import WisdomPanel from "@/components/panels/WisdomPanel";
import { CharmPanel, TemperamentPanel, PhysiquePanel } from "@/components/panels/AttrPanels";
import TalentPanel from "@/components/panels/TalentPanel";
import DailyTaskPanel from "@/components/panels/DailyTaskPanel";
import CoreTaskPanel from "@/components/panels/CoreTaskPanel";
import ShopPanel from "@/components/panels/ShopPanel";
import SummaryPanel from "@/components/panels/SummaryPanel";
import ReviewPanel from "@/components/panels/ReviewPanel";

const VIEWS: ViewDef[] = [
  { key: "wisdom", label: "认知矩阵", icon: "🧠" },
  { key: "charm", label: "魅力", icon: "💄" },
  { key: "temperament", label: "气质", icon: "🌸" },
  { key: "physique", label: "体质", icon: "🩸" },
  { key: "talent", label: "才艺", icon: "🎨" },
  { key: "daily", label: "每日必做", icon: "📅" },
  { key: "core", label: "核心任务", icon: "⚔️" },
  { key: "shop", label: "商城", icon: "🪙" },
  { key: "summary", label: "每日总结", icon: "🌙" },
  { key: "review", label: "周月复盘", icon: "📈" },
];

function ActivePanel({ view }: { view: string }) {
  switch (view) {
    case "wisdom": return <WisdomPanel />;
    case "charm": return <CharmPanel />;
    case "temperament": return <TemperamentPanel />;
    case "physique": return <PhysiquePanel />;
    case "talent": return <TalentPanel />;
    case "daily": return <DailyTaskPanel />;
    case "core": return <CoreTaskPanel />;
    case "shop": return <ShopPanel />;
    case "summary": return <SummaryPanel />;
    case "review": return <ReviewPanel />;
    default: return <WisdomPanel />;
  }
}

function BindingOverlay() {
  const bind = useStore((s) => s.bind);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");

  function go() {
    const a = parseInt(age, 10);
    if (!name.trim() || isNaN(a)) return;
    bind(name.trim(), a);
  }

  return (
    <div className="binding-overlay">
      <div className="binding-box">
        <h2>云舟 <span>基因锁绑定</span></h2>
        <div className="input-group">
          <label>使用者本源真名 (NAME)</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="ENTER SUBJECT NAME..." />
        </div>
        <div className="input-group">
          <label>生命周期代数 (AGE)</label>
          <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="ENTER SUBJECT AGE..." />
        </div>
        <button className="btn-bind" onClick={go}>激活核心序列</button>
      </div>
    </div>
  );
}

export default function Home() {
  const load = useStore((s) => s.load);
  const data = useStore((s) => s.data);
  const loaded = useStore((s) => s.loaded);
  const [view, setView] = useState("wisdom");
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    load();
  }, [load]);

  // 移动端选中面板后自动收起抽屉
  function switchView(k: string) {
    setView(k);
    setDrawerOpen(false);
  }

  if (!loaded) {
    return (
      <>
        <Starfield />
        <div className="login-wrap">
          <div style={{ color: "var(--primary)", letterSpacing: 2 }}>SYSTEM BOOTING...</div>
        </div>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <Starfield />
        <div className="login-wrap">
          <div style={{ color: "var(--red)" }}>加载失败，请刷新重试。</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Starfield />
      <Toast />
      {!data.hostName && <BindingOverlay />}
      <div className="main-app">
        {drawerOpen && <div className="drawer-backdrop" onClick={() => setDrawerOpen(false)} />}
        <div className={`sidebar-wrap ${drawerOpen ? "open" : ""}`}>
          <Sidebar views={VIEWS} active={view} onSwitch={switchView} />
        </div>
        <div className="main-content">
          <button
            className="drawer-toggle"
            onClick={() => setDrawerOpen(true)}
            aria-label="打开导航菜单"
          >
            <i className="fa-solid fa-bars" />
          </button>
          <TopBar />
          <ActivePanel view={view} />
          <div className="ticker">&gt; 总线在线 · 进度已云端同步 · 遥测稳定</div>
        </div>
      </div>
      <CyberCat />
    </>
  );
}
