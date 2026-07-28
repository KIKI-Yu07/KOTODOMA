import { useState } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import type { Page } from "../components/BottomNav";
import { loadProfile, saveProfile } from "../lib/userStore";

interface ProfileEditProps { onNavigate: (p: Page) => void; darkMode?: boolean; }

export default function ProfileEdit({ onNavigate, darkMode }: ProfileEditProps) {
  const profile = loadProfile();
  const origNick = profile.nickname || "小明";
  const origGender = profile.gender || "保密";
  const origAvatar = profile.avatar || "";
  const [nickname, setNickname] = useState(origNick);
  const [gender, setGender] = useState(origGender);
  const [avatar, setAvatar] = useState(origAvatar);
  const [editing, setEditing] = useState<string | null>(null);
  const [tempVal, setTempVal] = useState("");
  const [showUnsaved, setShowUnsaved] = useState(false);

  const isDirty = nickname !== origNick || gender !== origGender || avatar !== origAvatar;

  const handleBack = () => {
    if (isDirty) { setShowUnsaved(true); return; }
    onNavigate("vocab");
  };
  const saveAndLeave = () => { saveProfile({nickname, gender, avatar}); setShowUnsaved(false); onNavigate("vocab"); };
  const discardAndLeave = () => { setShowUnsaved(false); onNavigate("vocab"); };

  const handleAvatar = () => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = "image/*";
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (!file) return;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const max = 200;
        let w = img.width, h = img.height;
        if (w > h) { if (w > max) { h = h * max / w; w = max; } }
        else { if (h > max) { w = w * max / h; h = max; } }
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
        setAvatar(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.src = URL.createObjectURL(file);
    };
    input.click();
  };

  const startEdit = (key: string, val: string) => { setEditing(key); setTempVal(val); };
  const confirmEdit = () => {
    if (editing === "nickname") setNickname(tempVal);
    if (editing === "gender") setGender(tempVal);
    setEditing(null);
  };

  const [saved, setSaved] = useState(false);
  const handleSave = () => {
    if (!isDirty) return;
    saveProfile({ nickname, gender, avatar });
    setSaved(true);
    setTimeout(() => { setSaved(false); onNavigate("vocab"); }, 800);
  };

  return (<>
    <div className="flex items-center gap-3 px-4 py-2">
      <button onClick={handleBack} className="flex items-center gap-1 text-hint text-sm font-bold active:opacity-60">
        <ArrowLeft size={16} stroke="var(--color-text-tertiary)" strokeWidth={2} />
        <span>戻る</span>
      </button>
      <span className="text-[15px] font-semibold text-main">個人資料</span>
    </div>

    <div className="flex-1 overflow-y-auto scroll-area">
      <div className="bg-surface rounded-[2px] shadow-sm mx-4 mt-3 overflow-hidden">
        <div onClick={handleAvatar} className="flex items-center px-4 py-3.5 cursor-pointer active:bg-primary-subtle transition-colors">
          <p className="text-sm text-main flex-1">头像</p>
          {avatar ? (
            <img src={avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-white">小</div>
          )}
          <ChevronRight size={16} className="text-hint ml-2" />
        </div>
        <div onClick={()=>startEdit("nickname", nickname)} className="flex items-center px-4 py-3.5 cursor-pointer active:bg-primary-subtle transition-colors">
          <p className="text-sm text-main flex-1">昵称</p>
          <span className="text-sm text-sub">{nickname}</span>
          <ChevronRight size={16} className="text-hint ml-2" />
        </div>
        <div onClick={()=>startEdit("gender", gender)} className="flex items-center px-4 py-3.5 cursor-pointer active:bg-primary-subtle transition-colors">
          <p className="text-sm text-main flex-1">性别</p>
          <span className="text-sm text-sub">{gender}</span>
          <ChevronRight size={16} className="text-hint ml-2" />
        </div>
        <div className="flex items-center px-4 py-3.5">
          <p className="text-sm text-main flex-1">年级</p><span className="text-sm text-sub">N3 学習中</span>
        </div>
      </div>

      <div className="mx-4 mt-6">
        <button onClick={handleSave} className="pushable w-full mt-2">
          <span className="shadow-3d"></span>
          <span className="edge-3d"></span>
          <span className={`front-3d text-center transition-colors duration-300 ${saved?"bg-emerald-500":""}`}>
            {saved ? "✓ 已保存" : "保存して戻る"}
          </span>
        </button>
      </div>
    </div>

    {/* Edit Modal */}
    {editing && (
      <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/40" onClick={()=>setEditing(null)}>
        <div className="bg-surface rounded-t-2xl w-full p-5 shadow-xl" onClick={e=>e.stopPropagation()}>
          <h3 className="font-bold text-main text-lg mb-4">{editing==="nickname"?"修改昵称":"修改性别"}</h3>
          {editing === "gender" ? (
            <div className="flex gap-2 mb-4">
              {["男","女","保密"].map(g=>(
                <button key={g} onClick={()=>setTempVal(g)} className={`flex-1 py-3 rounded-xl text-sm font-bold ${tempVal===g?"bg-primary text-white":"bg-primary-subtle text-main"}`}>{g}</button>
              ))}
            </div>
          ) : (
            <input autoFocus value={tempVal} onChange={e=>setTempVal(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-primary-subtle text-main outline-none text-sm mb-4" placeholder="输入昵称" />
          )}
          <div className="flex gap-2">
            <button onClick={()=>setEditing(null)} className="flex-1 py-3 rounded-xl bg-primary-subtle text-main text-sm font-bold">取消</button>
            <button onClick={confirmEdit} className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-bold">確定</button>
          </div>
        </div>
      </div>
    )}

    {/* Unsaved changes warning */}
    {showUnsaved && (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40" onClick={discardAndLeave}>
        <div className="bg-surface rounded-2xl w-[280px] p-5 shadow-xl text-center" onClick={e=>e.stopPropagation()}>
          <h3 className="font-bold text-main mb-1">保存しますか？</h3>
          <p className="text-xs text-sub mb-4">変更内容が保存されていません</p>
          <div className="flex gap-2">
            <button onClick={discardAndLeave} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-main text-sm font-bold">破棄</button>
            <button onClick={saveAndLeave} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold">保存</button>
          </div>
        </div>
      </div>
    )}
  </>);
}
