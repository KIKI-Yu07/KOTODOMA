import { useState } from "react";
import { ArrowLeft, BookOpen } from "lucide-react";
import type { Page } from "../components/BottomNav";
import StatusBar from "../components/StatusBar";

interface SettingsPageProps {
  onNavigate: (page: Page) => void;
  darkMode?: boolean;
}

const wordBooks = [
  { id: "vol1", name: "第一册", desc: "日常・生活 · 感情・状態", count: 22 },
  { id: "vol2", name: "第二册", desc: "全 16 課 · ~1100 語", count: 1106 },
  { id: "all", name: "全部词书", desc: "第一册 + 第二册", count: 1128 },
];

export default function SettingsPage({ onNavigate, darkMode }: SettingsPageProps) {
  const origGoal = parseInt(localStorage.getItem("dailyGoal") || "15");
  const origBook = localStorage.getItem("selectedBook") || "all";
  const [dailyGoal, setDailyGoal] = useState(origGoal);
  const [selectedBook, setSelectedBook] = useState(origBook);
  const [showUnsaved, setShowUnsaved] = useState(false);

  const isDirty = dailyGoal !== origGoal || selectedBook !== origBook;
  const handleBack = () => { if (isDirty) { setShowUnsaved(true); return; } onNavigate("home"); };
  const save = () => {
    localStorage.setItem("dailyGoal", String(dailyGoal));
    localStorage.setItem("selectedBook", selectedBook);
    onNavigate("home");
  };

  return (<>
    <StatusBar darkMode={darkMode} />
    <div className="flex items-center px-4 py-2 relative">
      <button onClick={handleBack}
        className="absolute left-4 z-10 flex items-center gap-1 text-hint text-sm font-bold active:opacity-60 transition-opacity">
        <ArrowLeft size={16} stroke="var(--color-text-secondary)" strokeWidth={2} />
        <span>戻る</span>
      </button>
      <span className="text-lg font-extrabold text-main dark:text-main w-full text-center">学習設定</span>
    </div>

    <div className="flex-1 overflow-y-auto scroll-area px-4 pb-4 space-y-5">

      {/* Daily Goal — scroll picker */}
      <div>
        <h3 className="text-sm font-bold text-sub dark:text-hint mb-2">每日新学单词数</h3>
        <div className="bg-surface rounded-2xl shadow-sm border border-border p-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setDailyGoal(Math.max(5, dailyGoal - 5))} className="w-10 h-10 rounded-full bg-primary-subtle flex items-center justify-center text-primary text-xl font-bold active:scale-90 shrink-0">−</button>
            <div className="flex-1 flex items-center justify-between min-w-0">
              <div className="flex items-baseline gap-1 shrink-0">
                <span className="text-[48px] font-extrabold text-primary leading-none tabular-nums w-[60px] text-right">{dailyGoal}</span>
                <span className="text-sm text-sub font-bold">词/日</span>
              </div>
              <p className="text-xs text-hint italic w-[130px] text-right shrink-0">{dailyGoal <= 5 ? "何时能上岸" : dailyGoal <= 10 ? "老年人起步" : dailyGoal <= 15 ? "还行，不算太懒" : dailyGoal <= 20 ? "突然认真起来了？" : dailyGoal <= 25 ? "别装学霸，不用假努力" : dailyGoal <= 30 ? "别明天就放弃啊" : dailyGoal <= 35 ? "梦里啥都有" : dailyGoal <= 40 ? "词典你写的啊" : dailyGoal <= 45 ? "别这样，对身体不好" : "你知道50什么概念吗"}</p>
            </div>
            <button onClick={() => setDailyGoal(Math.min(50, dailyGoal + 5))} className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold active:scale-90 shrink-0">+</button>
          </div>
          <div className="flex justify-between mt-3 px-2">
            {[5,10,15,20,25,30,35,40,45,50].map(n => (
              <button key={n} onClick={() => setDailyGoal(n)}
                className={`w-8 h-8 rounded-full text-[10px] font-bold transition-all ${
                  dailyGoal === n ? "bg-primary text-white scale-110" : "text-hint hover:text-sub"
                }`}>{n}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Word Book */}
      <div>
        <h3 className="text-sm font-bold text-sub dark:text-hint mb-2">选择词书</h3>
        <div className="space-y-2">
          {wordBooks.map(b => (
            <button key={b.id} onClick={() => setSelectedBook(b.id)}
              className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all active:scale-[0.98] ${
                selectedBook === b.id
                  ? "bg-[#FFE66D] shadow-sm"
                  : "bg-white dark:bg-surface"
              }`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                selectedBook === b.id ? "bg-white/40" : "bg-primary-subtle dark:bg-primary-subtle"
              }`}>
                <BookOpen size={18} stroke={selectedBook === b.id ? "#0F1419" : "#0F64B5"} />
              </div>
              <div className="flex-1 text-left">
                <p className={`text-sm font-bold ${selectedBook === b.id ? "text-main" : "text-main dark:text-main"}`}>{b.name}</p>
                <p className={`text-xs ${selectedBook === b.id ? "text-sub" : "text-sub dark:text-hint"}`}>{b.desc}</p>
              </div>
              <span className={`text-xs font-bold ${selectedBook === b.id ? "text-sub" : "text-hint"}`}>{b.count} 語</span>
            </button>
          ))}
        </div>
      </div>
    </div>

    {/* Save */}
    <div className="px-4 py-3 bg-white dark:bg-surface border-t border-primary-subtle dark:border-primary-subtle">
      <button onClick={save} className="w-full py-3.5 rounded-xl bg-primary text-white font-extrabold text-sm active:scale-[0.98] transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30">保存して戻る</button>
    </div>

    {showUnsaved && (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40" onClick={()=>setShowUnsaved(false)}>
        <div className="bg-surface rounded-2xl w-[280px] p-5 shadow-xl text-center" onClick={e=>e.stopPropagation()}>
          <h3 className="font-bold text-main mb-1">保存しますか？</h3>
          <p className="text-xs text-sub mb-4">変更内容が保存されていません</p>
          <div className="flex gap-2">
            <button onClick={()=>onNavigate("home")} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-main text-sm font-bold">破棄</button>
            <button onClick={save} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold">保存</button>
          </div>
        </div>
      </div>
    )}
  </>);
}
