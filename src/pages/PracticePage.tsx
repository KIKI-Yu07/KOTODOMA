import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import type { Page } from "../components/BottomNav";
import StatusBar from "../components/StatusBar";
import MatchGame from "./MatchGame";

interface Props { onNavigate: (p: Page) => void; darkMode?: boolean; }

export default function PracticePage({ onNavigate, darkMode }: Props) {
  const [mode, setMode] = useState<"zh2jp" | "spell" | null>(null);

  if (mode) return <MatchGame onNavigate={onNavigate} darkMode={darkMode} mode={mode} />;

  return (<>
    <StatusBar darkMode={darkMode} />
    <div className="flex items-center justify-between px-4 py-2">
      <button onClick={()=>onNavigate("home")} className="flex items-center gap-1 text-hint text-sm font-bold active:opacity-60">
        <ArrowLeft size={16} stroke="var(--color-text-tertiary)" strokeWidth={2}/><span>戻る</span>
      </button>
      <span className="text-lg font-bold text-main">练习中心</span>
      <div className="w-10" />
    </div>
    <div className="flex-1 overflow-y-auto scroll-area px-4 pb-4">
      <div className="grid grid-cols-1 gap-3 mt-3">
        {[
          {t:"中日选词",d:"看中文释义，选出正确日语单词",a:()=>setMode("zh2jp"),bg:"#E0F7FA",c:"#00BCD4"},
          {t:"组合拼写",d:"看到打散的文字，拼出正确日语单词",a:()=>setMode("spell"),bg:"#FFF8E1",c:"#FFC107"},
        ].map((c,i)=>(
          <button key={i} onClick={c.a} className="bg-surface rounded-2xl p-4 shadow-sm border border-border flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-all text-left">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{backgroundColor:c.bg}}>
              <span style={{color:c.c}}>{i===0?"中":"拼"}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-extrabold text-main">{c.t}</p>
              <p className="text-xs text-hint mt-0.5">{c.d}</p>
            </div>
            <ArrowLeft size={16} className="text-hint rotate-180" />
          </button>
        ))}
      </div>
    </div>
  </>);
}
