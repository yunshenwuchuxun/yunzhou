"use client";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useStore } from "@/lib/store";

export default function ConfigModal({ onClose }: { onClose: () => void }) {
  const data = useStore((s) => s.data)!;
  const bind = useStore((s) => s.bind);
  const setAvatar = useStore((s) => s.setAvatar);
  const renameSystem = useStore((s) => s.renameSystem);
  const renamePet = useStore((s) => s.renamePet);
  const setGender = useStore((s) => s.setGender);
  const fileRef = useRef<HTMLInputElement>(null);

  // 本地暂存编辑中的值，点「保存」才提交
  const [hostName, setHostName] = useState(data.hostName);
  const [age, setAge] = useState(String(data.age));
  const [gender, setGenderDraft] = useState(data.gender);
  const [systemName, setSystemName] = useState(data.systemName);
  const [petName, setPetName] = useState(data.petName);
  const [avatar, setAvatarDraft] = useState(data.avatarBase64);

  const ageNum = Number(age);
  const valid = hostName.trim().length > 0 && Number.isFinite(ageNum) && ageNum > 0;

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarDraft(String(ev.target?.result || ""));
    reader.readAsDataURL(file);
  }

  function save() {
    if (!valid) return;
    bind(hostName.trim(), ageNum);
    if (avatar !== data.avatarBase64) setAvatar(avatar);
    if (gender.trim()) setGender(gender.trim());
    if (systemName.trim()) renameSystem(systemName.trim());
    if (petName.trim()) renamePet(petName.trim());
    onClose();
  }

  // 通过 portal 渲染到 body，避免被带 transform/backdrop-filter 的祖先困住，
  // 使 position:fixed 相对视口居中
  return createPortal(
    <div className="config-overlay" onClick={onClose}>
      <div className="config-modal" onClick={(e) => e.stopPropagation()}>
        <h2>
          系统<span>配置</span>
        </h2>

        <div className="config-avatar-row">
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPick} />
          <div className="config-avatar" onClick={() => fileRef.current?.click()} title="点击更换头像">
            {avatar ? <img src={avatar} alt="avatar" /> : <i className="fa-solid fa-microchip" />}
          </div>
          <button className="btn-mini" onClick={() => fileRef.current?.click()}>
            更换头像
          </button>
        </div>

        <div className="input-group">
          <label>宿主代号</label>
          <input className="field" value={hostName} onChange={(e) => setHostName(e.target.value)} placeholder="必填" />
        </div>
        <div className="input-group">
          <label>生命代数（年龄）</label>
          <input className="field" type="number" value={age} onChange={(e) => setAge(e.target.value)} />
        </div>
        <div className="input-group">
          <label>身份标签</label>
          <input className="field" value={gender} onChange={(e) => setGenderDraft(e.target.value)} />
        </div>
        <div className="input-group">
          <label>系统名</label>
          <input className="field" value={systemName} onChange={(e) => setSystemName(e.target.value)} />
        </div>
        <div className="input-group">
          <label>量子猫代号</label>
          <input className="field" value={petName} onChange={(e) => setPetName(e.target.value)} />
        </div>

        {!valid && <div className="err-line">宿主代号不能为空，年龄需为正数。</div>}

        <div className="config-actions">
          <button className="btn-ghost" onClick={onClose}>
            取消
          </button>
          <button className="btn-prime" onClick={save} disabled={!valid}>
            保存
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
