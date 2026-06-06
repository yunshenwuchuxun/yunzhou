"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Starfield from "@/components/Starfield";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.replace("/");
      } else {
        const j = await res.json().catch(() => ({}));
        setErr(j.error || "密码错误");
      }
    } catch {
      setErr("网络异常，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Starfield />
      <div className="login-wrap">
        <div className="binding-box">
          <h2>
            云舟 <span>系统鉴权</span>
          </h2>
          <div className="input-group">
            <label>访问密钥 (PASSCODE)</label>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="ENTER PASSCODE..."
            />
          </div>
          <div className="err-line">{err}</div>
          <button className="btn-bind" onClick={submit} disabled={loading}>
            {loading ? "校验中..." : "解锁核心"}
          </button>
        </div>
      </div>
    </>
  );
}
