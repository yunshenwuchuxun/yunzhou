"use client";
import { useRef, useState } from "react";
import { useStore } from "@/lib/store";

export default function ShopPanel() {
  const data = useStore((s) => s.data)!;
  const drawGacha = useStore((s) => s.drawGacha);
  const addShopItem = useStore((s) => s.addShopItem);
  const removeShopItem = useStore((s) => s.removeShopItem);
  const buyItem = useStore((s) => s.buyItem);
  const useBagItem = useStore((s) => s.useBagItem);
  const pushToast = useStore((s) => s.pushToast);

  const [spinning, setSpinning] = useState(false);
  const [deg, setDeg] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);

  const [iName, setIName] = useState("");
  const [iDesc, setIDesc] = useState("");
  const [iPrice, setIPrice] = useState("");

  function spin() {
    if (spinning) return;
    if (data.currency < 20) { pushToast("积分不足（需 20）。"); return; }
    setSpinning(true);
    setDeg((d) => d + 6 * 360 + Math.floor(Math.random() * 360));
    setTimeout(() => {
      const prize = drawGacha();
      setSpinning(false);
      if (prize) pushToast(`🎰 奇点崩塌，产出：${prize}`);
    }, 4000);
  }

  function addItem() {
    const price = parseInt(iPrice, 10);
    if (!iName.trim() || isNaN(price) || price < 0) { pushToast("请填写名称与有效价格。"); return; }
    addShopItem(iName.trim(), iDesc.trim(), price);
    setIName(""); setIDesc(""); setIPrice("");
  }

  const bagKeys = Object.keys(data.inventory);

  return (
    <div className="view-panel">
      <div className="panel-title">🪙 商城 · 抽奖与兑换</div>
      <div className="mall-grid">
        <div className="wheel-panel">
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)" }}>气运扭曲奇点</div>
          <div className="muted" style={{ fontSize: 11, margin: "6px 0 0" }}>单次消耗 20 积分</div>
          <div className="wheel-arrow" />
          <div ref={wheelRef} className="wheel-disc" style={{ transform: `rotate(${deg}deg)` }} />
          <button className="btn-prime btn-gold" style={{ width: "100%" }} onClick={spin} disabled={spinning}>
            {spinning ? "扰动中…" : "扰动概率场"}
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div className="panel-card">
            <div className="section-title">🛍️ 兑换终端（支持自定义商品）</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <input className="field" style={{ flex: 1, minWidth: 120 }} placeholder="名称(如 🍧 冰淇淋)" value={iName} onChange={(e) => setIName(e.target.value)} />
              <input className="field" style={{ flex: 1.5, minWidth: 140 }} placeholder="说明…" value={iDesc} onChange={(e) => setIDesc(e.target.value)} />
              <input className="field" style={{ width: 90 }} type="number" placeholder="积分" value={iPrice} onChange={(e) => setIPrice(e.target.value)} />
              <button className="btn-prime" style={{ padding: "0 18px" }} onClick={addItem}>架设</button>
            </div>
            <div className="goods-grid" style={{ marginTop: 16 }}>
              {data.shopItems.map((item) => (
                <div key={item.id} className="goods-card">
                  <button className="goods-del" onClick={() => removeShopItem(item.id)}><i className="fa-solid fa-xmark" /></button>
                  <div>
                    <h4 style={{ fontSize: 13, fontWeight: 700 }}>{item.name}</h4>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{item.desc}</p>
                  </div>
                  <button className="btn-mini btn-gold" onClick={() => buyItem(item.id)}>{item.price} pt</button>
                </div>
              ))}
            </div>
          </div>

          <div className="bag-strip">
            <div className="section-title"><i className="fa-solid fa-box-open" /> 随身背包（点击食物可投喂猫咪）</div>
            <div className="bag-grid">
              {bagKeys.length === 0 ? (
                <span className="muted" style={{ fontSize: 12 }}>背包空空如也…</span>
              ) : (
                bagKeys.map((name) => (
                  <div key={name} className="bag-node">
                    <span>{name} ×{data.inventory[name]}</span>
                    <button className="btn-mini" onClick={() => useBagItem(name)}>使用</button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
