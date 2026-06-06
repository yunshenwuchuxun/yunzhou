"use client";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";

// 系统公告 / 提示 toast。读取 store.toast，几秒后自动消失。
export default function Toast() {
  const toast = useStore((s) => s.toast);
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!toast) return;
    setText(toast.text);
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 4200);
    return () => clearTimeout(t);
  }, [toast]);

  if (!visible) return null;
  return <div className="toast">{text}</div>;
}
