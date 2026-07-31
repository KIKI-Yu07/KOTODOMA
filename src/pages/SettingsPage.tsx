import { useState, useMemo } from "react";
import { ArrowLeft, BookOpen, ChevronDown, Library, Plus } from "lucide-react";
import type { Page } from "../components/BottomNav";
import { setLocal } from "../lib/store";
import { getBook1WordCount, getBook2WordCount, getTextbookChapters } from "../lib/wordSource";

const textBooks = [
  { id: "vol1", name: "第一册", desc: "全 " + getBook1WordCount() + " 語", count: getBook1WordCount() },
  { id: "vol2", name: "第二册", desc: "全 16 課 · ~" + getBook2WordCount() + " 語", count: getBook2WordCount() },
  { id: "all", name: "全部词书", desc: "第一册 + 第二册", count: getBook1WordCount() + getBook2WordCount() },
];

interface SettingsPageProps {
  onNavigate: (page: Page) => void;
}

export default function SettingsPage({ onNavigate }: SettingsPageProps) {
  const origGoal = parseInt(localStorage.getItem("dailyGoal") || "15");
  const origBook = localStorage.getItem("selectedBook") || "all";
  const [dailyGoal, setDailyGoal] = useState(origGoal);
  const origRandom = localStorage.getItem("randomMode") || "true";
  const [selectedBook, setSelectedBook] = useState(origBook);
  const [randomMode, setRandomMode] = useState(origRandom === "true");
  const origStart = localStorage.getItem("startChapter") || "0";
  const [startChapter, setStartChapter] = useState(origStart);
  const [wbOpen, setWbOpen] = useState(false);
  const [chapOpen, setChapOpen] = useState(false);
  const [showUnsaved, setShowUnsaved] = useState(false);
  const [saved, setSaved] = useState(false);

  const textbookChapters = useMemo(() => getTextbookChapters(), []);
  const selectedBookChapters = textbookChapters.find(b => b.id === selectedBook)?.chapters || [];

  const customBooks = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("wordbooks") || "[]") as {id:string;name:string;words:any[]}[]; }
    catch { return []; }
  }, [wbOpen]);
  const isTextbook = ["vol1","vol2","all"].includes(selectedBook);
  const selectedCustomName = !isTextbook && selectedBook ? customBooks.find(b => b.id === selectedBook)?.name : null;

  const isDirty = dailyGoal !== origGoal || selectedBook !== origBook || startChapter !== origStart || randomMode !== (origRandom==="true");
  const handleBack = () => { if (isDirty) { setShowUnsaved(true); return; } onNavigate("home"); };
  const save = () => {
    if (!isDirty) return;
    setLocal("dailyGoal", String(dailyGoal));
    setLocal("selectedBook", selectedBook);
    setLocal("startChapter", startChapter);
    setLocal("randomMode", String(randomMode));
    setSaved(true);
    setTimeout(() => { setSaved(false); onNavigate("home"); }, 800);
  };

  return (<>
    <div className="flex items-center px-4 py-2 relative">
      <button onClick={handleBack}
        className="absolute left-4 z-10 flex items-center gap-1 text-hint text-sm font-bold active:opacity-60 transition-opacity">
        <ArrowLeft size={16} stroke="var(--color-text-secondary)" strokeWidth={2} />
        
      </button>
      <span className="text-2xl font-semibold tracking-tight text-main w-full text-center">学習設定</span>
    </div>

    <div className="flex-1 overflow-y-auto scroll-area px-4 pb-4 space-y-5">

      {/* Daily Goal — scroll picker */}
      <div>
        <h3 className="text-sm font-bold text-sub mb-2">每日新学单词数</h3>
        <div className="bg-surface rounded-2xl shadow-sm border border-border p-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setDailyGoal(Math.max(5, dailyGoal - 5))} className="min-h-[44px] min-w-[44px] rounded-full bg-primary-subtle flex items-center justify-center text-primary text-xl font-bold active:scale-90 transition-transform shrink-0" style={{willChange:"transform"}}>−</button>
            <div className="flex-1 flex items-center justify-between min-w-0">
              <div className="flex items-baseline gap-1 shrink-0">
                <span className="font-extrabold text-primary leading-none tabular-nums w-[60px] text-right" style={{fontSize:"clamp(32px, 12vw, 48px)"}}>{dailyGoal}</span>
                <span className="text-sm text-sub font-bold">词/日</span>
              </div>
              <p className="text-xs text-hint italic w-[130px] text-right shrink-0">{dailyGoal <= 5 ? "何时能上岸" : dailyGoal <= 10 ? "老年人起步" : dailyGoal <= 15 ? "还行，不算太懒" : dailyGoal <= 20 ? "突然认真起来了？" : dailyGoal <= 25 ? "别装学霸，不用假努力" : dailyGoal <= 30 ? "别明天就放弃啊" : dailyGoal <= 35 ? "梦里啥都有" : dailyGoal <= 40 ? "词典你写的啊" : dailyGoal <= 45 ? "别这样，对身体不好" : "你知道50什么概念吗"}</p>
            </div>
            <button onClick={() => setDailyGoal(Math.min(50, dailyGoal + 5))} className="min-h-[44px] min-w-[44px] rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold active:scale-90 transition-transform shrink-0" style={{willChange:"transform"}}>+</button>
          </div>
          <div className="flex justify-between mt-3 px-2">
            {[5,10,15,20,25,30,35,40,45,50].map(n => (
              <button key={n} onClick={() => setDailyGoal(n)}
                className={`text-[10px] font-bold transition-colors duration-150 flex items-center justify-center ${
                  dailyGoal === n ? "bg-primary text-white" : "text-hint hover:text-sub"
                }`}
                style={{ width: 32, height: 32, borderRadius: "50%" }}
              >{n}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Word Book */}
      <div>
        <h3 className="text-sm font-bold text-sub mb-2">选择词书</h3>
        <div className="space-y-2">
          {textBooks.map(b => (
            <button key={b.id} onClick={() => setSelectedBook(b.id)}
              className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all active:scale-[0.98] ${
                selectedBook === b.id ? "bg-highlight shadow-sm" : "bg-white"
              }`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                selectedBook === b.id ? "bg-white/40" : "bg-primary-subtle"
              }`}>
                <BookOpen size={18} stroke={selectedBook === b.id ? "#0F1419" : "var(--color-primary)"} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold text-main">{b.name}</p>
                <p className="text-xs text-sub">{b.desc}</p>
              </div>
              <span className="text-xs font-bold text-hint">{b.count} 語</span>
            </button>
          ))}

          {/* Custom wordbook option */}
          <button onClick={() => setWbOpen(true)}
            className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all active:scale-[0.98] ${
              !isTextbook && selectedBook ? "bg-highlight shadow-sm" : "bg-white"
            }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              !isTextbook && selectedBook ? "bg-white/40" : "bg-primary-subtle"
            }`}>
              <Library size={18} stroke={!isTextbook && selectedBook ? "#0F1419" : "var(--color-primary)"} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-main">
                {!isTextbook && selectedCustomName ? selectedCustomName : "单词本"}
              </p>
              <p className="text-xs text-sub">
                {!isTextbook && selectedBook ? "自定义词库" : "使用自建单词本学习"}
              </p>
            </div>
            <ChevronDown size={16} className="text-hint" />
          </button>
        </div>
      </div>

      {/* Start Chapter — for vol1 / vol2 */}
      {(selectedBook === "vol1" || selectedBook === "vol2") && (
        <div>
          <h3 className="text-sm font-bold text-sub mb-2">从第几课开始</h3>
          <button onClick={()=>setChapOpen(true)} className="w-full flex items-center justify-between p-4 rounded-xl bg-white border border-border">
            <span className="text-sm font-bold text-main">
              {startChapter === "0" || !selectedBookChapters.find(c => c.id === startChapter)
                ? (selectedBookChapters[0]?.name || "第1課")
                : selectedBookChapters.find(c => c.id === startChapter)?.name}
            </span>
            <ChevronDown size={16} className="text-hint"/>
          </button>
        </div>
      )}

      {/* Chapter picker modal */}
      <div className={`absolute inset-0 z-50 flex items-end bg-black/40 transition-opacity duration-300 ${chapOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={()=>setChapOpen(false)}>
        <div className={`bg-white rounded-t-2xl w-full max-h-[60%] overflow-y-auto shadow-xl transition-transform duration-300 ease-out ${chapOpen ? 'translate-y-0' : 'translate-y-full'}`} onClick={e=>e.stopPropagation()}>
          <div className="sticky top-0 bg-white px-4 pt-4 pb-2 border-b border-border">
            <h3 className="text-sm font-extrabold text-main">选择起始课次</h3>
          </div>
          <div className="p-2">
            {selectedBookChapters.map((ch, i) => (
              <button key={ch.id} onClick={()=>{setStartChapter(ch.id);setChapOpen(false)}}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between ${startChapter===ch.id?"bg-primary-subtle text-primary":"text-main"}`}>
                <span>{ch.name}</span>
                <span className="text-xs text-hint font-normal">{ch.words.length} 词</span>
              </button>
            ))}
            <div className="h-4"/>
          </div>
        </div>
      </div>

      {/* Random mode toggle */}
      <div className="flex items-center justify-between px-1">
        <div>
          <span className="text-xs font-bold text-sub">随机抽取单词</span>
          <p className="text-[10px] text-hint mt-0.5">关闭后按顺序学习</p>
        </div>
        <button onClick={()=>setRandomMode(!randomMode)}
          className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${randomMode?"bg-primary":"bg-border"}`}>
          <div className={`w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-all ${randomMode?"left-6":"left-0.5"}`}/>
        </button>
      </div>

      {/* Wordbook picker modal */}
      <div className={`absolute inset-0 z-50 flex items-end bg-black/40 transition-opacity duration-300 ${wbOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={()=>setWbOpen(false)}>
        <div className={`bg-white rounded-t-2xl w-full max-h-[60%] overflow-y-auto shadow-xl transition-transform duration-300 ease-out ${wbOpen ? 'translate-y-0' : 'translate-y-full'}`} onClick={e=>e.stopPropagation()}>
          <div className="sticky top-0 bg-white px-4 pt-4 pb-2 border-b border-border">
            <h3 className="text-sm font-extrabold text-main">选择单词本</h3>
          </div>
          <div className="p-2">
            {customBooks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <Library size={40} className="text-hint/40 mb-3" strokeWidth={1.5} />
                <p className="text-sm font-bold text-sub mb-1">还没有单词本</p>
                <p className="text-xs text-hint mb-4">先去个人页面自定义单词本吧</p>
                <button onClick={() => { setWbOpen(false); onNavigate("wordbooks"); }}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium active:scale-95">
                  <Plus size={16} />新建单词本
                </button>
              </div>
            ) : (
              customBooks.map((b) => (
                <button key={b.id} onClick={() => { setSelectedBook(b.id); setWbOpen(false); }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between ${
                    selectedBook === b.id ? "bg-primary-subtle text-primary" : "text-main"
                  }`}>
                  <span>{b.name}</span>
                  <span className="text-xs text-hint font-normal">{b.words?.length || 0} 词</span>
                </button>
              ))
            )}
            <div className="h-4"/>
          </div>
        </div>
      </div>

    </div>

    {/* Save */}
    <div className="px-4 py-3 bg-white border-t border-primary-subtle">
      <button onClick={save} className="pushable w-full">
        <span className="shadow-3d"></span>
        <span className="edge-3d"></span>
        <span className={`front-3d text-center transition-colors duration-300 ${saved?"bg-emerald-500":""}`}>
          {saved ? "✓ 已保存" : "保存して戻る"}
        </span>
      </button>
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
