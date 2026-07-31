import { useState, useMemo, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import type { Page } from "../components/BottomNav";
import MatchGame from "./MatchGame";
import { loadProgress } from "../lib/spaced-repetition";
import { getWordSource, getTextbookChapters, getAllTextbookWords } from "../lib/wordSource";
import { audioReady } from "../lib/audio";
function loadBooksSync() { try { return JSON.parse(localStorage.getItem("wordbooks") || "[]"); } catch { return []; } }

interface Props { onNavigate: (p: Page) => void; }

type GameMode = "zh2jp" | "spell" | "fillKana";
type Step = "menu" | "chapters" | "wordbooks" | "play";
type Source = "review" | "textbook" | "wordbook";

const CHAPTER_PICK = 15;

const games = [
  { t:"仮名選詞", desc:"看假名读音，选出正确的日语汉字", mode:"zh2jp" as GameMode, img:"arena1" },
  { t:"仮名補完", desc:"单词假名被挖空，从6个选项中补全", mode:"fillKana" as GameMode, img:"arena2" },
  { t:"単語找茬", desc:"找出假名读音中的错误，选出正确读法", mode:"spell" as GameMode, img:"arena3" },
];

const srcBtns: { key:Source; label:string; hint:string }[] = [
  { key:"review", label:"复习", hint:"已学单词" },
  { key:"textbook", label:"课本", hint:"全部单词" },
  { key:"wordbook", label:"单词本", hint:"自定义词" },
];

export default function PracticePage({ onNavigate }: Props) {
  const [preGameLoading, setPreGameLoading] = useState(false);
  const [step, setStep] = useState<Step>("menu");
  const [gameMode, setGameMode] = useState<GameMode>("zh2jp");
  const [gameWords, setGameWords] = useState<{w:string;r:string;m:string}[]>([]);
  const [gameKey, setGameKey] = useState(0);
  const [wordBooks, setWordBooks] = useState<any[]>([]);
  const [hint, setHint] = useState("");
  const [textbook, setTextbook] = useState<"vol1"|"vol2">("vol2");
  const [selChapters, setSelChapters] = useState<Set<string>>(new Set());
  const [playSource, setPlaySource] = useState<Source>("textbook");
  const [currentWB, setCurrentWB] = useState<any>(null);

  useEffect(() => { if (step === "wordbooks") setWordBooks(loadBooksSync()); }, [step]);

  const sourceWords = useMemo(() => getWordSource(), []);
  const reviewCount = useMemo(() => Object.values(loadProgress()).filter(p => p.lastReview).length, []);

  const textbookChapters = useMemo(() => getTextbookChapters(), []);
  const vol1Chs = textbookChapters.find(b => b.id === "vol1")?.chapters ?? [];
  const vol2Chs = textbookChapters.find(b => b.id === "vol2")?.chapters ?? [];
  const chapters = textbook==="vol1"?vol1Chs:vol2Chs;

  const startReview = async () => {
    setPreGameLoading(true);
    await audioReady();
    const progress = loadProgress();
    const studied = shuffle(Object.entries(progress).filter(([,p])=>p.lastReview).map(([id])=>id)).slice(0,CHAPTER_PICK);
    const allSources = [...getAllTextbookWords()];
    try {
      const wbs = JSON.parse(localStorage.getItem("wordbooks") || "[]") as any[];
      for (const wb of wbs) for (let i = 0; i < wb.words.length; i++) {
        allSources.push({ id: `wb_${wb.id}_${i}`, w: wb.words[i].word, r: wb.words[i].reading, m: wb.words[i].meaning, p: wb.words[i].pos || "" });
      }
    } catch {}
    const pool = allSources.filter(w => studied.includes(w.id)).map(w => ({ w: w.w, r: w.r, m: w.m }));
    const final = pool.length >= 4 ? pool : shuffle(sourceWords.map(w => ({ w: w.w, r: w.r, m: w.m }))).slice(0, CHAPTER_PICK);
    setPlaySource("review"); setGameKey(k=>k+1); setGameWords(shuffle(final)); setStep("play");
    setPreGameLoading(false);
  };

  const startChapters = async () => {
    setPreGameLoading(true);
    await audioReady();
    const pool: {w:string;r:string;m:string}[] = [];
    for (const ch of chapters) if (selChapters.has(ch.id)) for (const w of ch.words) pool.push({ w: w.w, r: w.r, m: w.m });
    setPlaySource("textbook"); setGameKey(k=>k+1); setGameWords(shuffle(pool).slice(0, CHAPTER_PICK)); setStep("play");
    setPreGameLoading(false);
  };

  const startWordBook = async (book:any) => {
    const pool: {w:string;r:string;m:string}[] = book.words.map((w:any)=>({ w:w.word||w.w, r:w.reading||w.r, m:w.meaning||w.m }));
    if (pool.length < 15) { setHint("单词本单词不足 15 个，请先添加更多单词"); return; }
    setPreGameLoading(true);
    await audioReady();
    setPlaySource("wordbook"); setCurrentWB(book);
    const s = shuffle(pool); setGameKey(k=>k+1); setGameWords(s.length>CHAPTER_PICK?s.slice(0,CHAPTER_PICK):s); setStep("play");
    setPreGameLoading(false);
  };

  const pick = (mode:GameMode, src:Source) => {
    setGameMode(mode);
    setPlaySource(src);
    if (src==="review") { if (reviewCount>=5) startReview(); }
    else if (src==="textbook") { setSelChapters(new Set()); setStep("chapters"); }
    else setStep("wordbooks");
  };
  const selectedTotal = useMemo(() => { let n=0; for (const ch of chapters) if (selChapters.has(ch.id)) n+=ch.words.length; return n; }, [selChapters, chapters]);
  const toggleChapter = (id:string) => setSelChapters(p => { const s = new Set(p); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const replay = ()=>{
    if (playSource === "review") startReview();
    else if (playSource === "wordbook" && currentWB) startWordBook(currentWB);
    else startChapters();
  };
  const retry = ()=>{ setGameKey(k=>k+1); setGameWords(p=>shuffle([...p])); };
  const goBack = ()=>{ step==="chapters"||step==="wordbooks"?setStep("menu"):onNavigate("home"); };

  if (step==="play") return <MatchGame key={gameKey} onNavigate={onNavigate} onBack={()=>{setStep("menu");setSelChapters(new Set())}} onReplay={replay} onRetry={retry} mode={gameMode} words={gameWords} />;

  if (preGameLoading) return (
    <div className="flex flex-col flex-1 min-h-0 items-center justify-center gap-6 px-8 text-center relative" style={{background:"#F5F0E8"}}>
      <div className="absolute inset-0 pointer-events-none" style={{backgroundImage:"url(/icons/bg-arena.jpg)", backgroundSize:"cover", backgroundPosition:"center", opacity:0.08}} />
      <div className="relative z-10 word-loader" />
      <p className="relative z-10 text-sub text-sm font-medium">音声読み込み中...</p>
      <p className="relative z-10 text-hint text-xs">单词修罗の準備をしています</p>
    </div>
  );

  return (<div className="flex flex-col flex-1 min-h-0 relative" style={{background:"#F5F0E8"}}>
    <div className="absolute inset-0 pointer-events-none" style={{backgroundImage:"url(/icons/bg-arena.jpg)", backgroundSize:"cover", backgroundPosition:"center", opacity:0.12}} />
    <div className="relative z-10 flex items-center justify-between px-5 py-3">
      <button onClick={goBack} className="flex items-center gap-1.5 text-hint text-xs font-bold active:opacity-60">
        <ArrowLeft size={18} stroke="var(--color-text-tertiary)" strokeWidth={2.5}/>
      </button>
      <div/>
      <span className="text-2xl font-semibold tracking-tight text-main">
        {step==="chapters"?"選択課本":step==="wordbooks"?"選択単語帳":"单词修罗"}
      </span>
    </div>

    <div className="flex-1 overflow-y-auto scroll-area pb-6 relative z-10">
      {hint && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={()=>setHint("")}>
        <div className="bg-surface rounded-2xl p-6 shadow-xl border border-border max-w-[280px] w-[85%] animate-pop-in" onClick={e=>e.stopPropagation()}>
          <div className="flex items-start justify-between gap-3 mb-3">
            <p className="text-sm font-extrabold text-main">提示</p>
            <button onClick={()=>setHint("")} className="text-hint hover:text-main shrink-0"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
          </div>
          <p className="text-sm text-sub leading-relaxed">{hint}</p>
        </div>
      </div>)}
      {step==="menu"&&(
        <div className="flex flex-col gap-4 px-4 pt-3">
          {games.map((g,i)=>(<div key={i} className="rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.08)] relative" style={{background:"#2C2420"}}>
              <div className="absolute top-3 right-3 z-10 w-9 h-9 rounded-xl flex items-center justify-center text-lg font-extrabold text-white/80 backdrop-blur-md bg-white/10">{[..."しゅら"][i]}</div>
              {/* Rice paper texture */}
              <div className="absolute inset-0 opacity-[0.02]" style={{backgroundImage:"repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 3px)"}} />
              {/* Main image on right */}
              <img src={`/icons/${g.img}.jpg`} alt="" className="absolute right-0 bottom-0 w-[48%] h-full object-cover object-left" />
              {/* Left gradient fade into image */}
              <div className="absolute right-0 top-0 bottom-0 w-[48%] bg-gradient-to-l from-transparent to-[#2C2420]" />
              {/* Content */}
              <div className="relative px-4 py-2 min-h-[40px] flex flex-col justify-center" style={{paddingRight:"52%"}}>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-white tracking-wider" style={{fontFamily:"serif"}}>{g.t}</h3>
                  <span className="text-sm font-bold text-red-500/80 tracking-wider select-none" style={{fontFamily:"serif"}}>【{["選","補","査"][i]}】</span>
                </div>
                <p className="text-xs leading-relaxed" style={{color:"#C9A96E"}}>{g.desc}</p>
              </div>
              {/* Source buttons */}
              <div className="relative px-4 pb-2">
                <p className="text-[8px] text-white/20 text-center pb-1">— 选择单词来源 —</p>
                <div className="flex gap-2">
                {srcBtns.map((s)=>(
                  <button key={s.key} onClick={()=>{
                    if (s.key==="review"&&reviewCount<5) {
                      setHint("新学单词不足5个，请先学习更多单词");
                      return;
                    }
                    pick(g.mode,s.key);
                  }}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg transition-all active:scale-95 backdrop-blur-md ${s.key==="review"&&reviewCount<5?"opacity-20 bg-white/5":"bg-white/10 hover:bg-white/20"}`}>
                    <span className="text-xs">{
                      s.key==="review"?"復":s.key==="textbook"?"課":"本"
                    }</span>
                    <span className="text-[10px] font-bold text-white/70">{s.label}</span>
                  </button>
                ))}
              </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {step==="chapters"&&(<div className="px-4">
        <div className="rounded-2xl overflow-hidden">
          {/* Textbook selector */}
          <div className="bg-white/90 rounded-2xl p-4 mb-3">
            <p className="text-xs font-bold mb-3" style={{color:"#C9A96E"}}>选择课本</p>
            {[{k:"vol1" as const,l:"第一册",n:vol1Chs.reduce((s,ch)=>s+ch.words.length,0),c:vol1Chs.length},{k:"vol2" as const,l:"第二册",n:vol2Chs.reduce((s,ch)=>s+ch.words.length,0),c:vol2Chs.length}].map(b=>(
              <div key={b.k} className="cbx-wrapper mb-2 last:mb-0" onClick={()=>{setTextbook(b.k);setSelChapters(new Set())}}>
                <input type="checkbox" className="cbx-check" checked={textbook===b.k} readOnly />
                <label className={`cbx-label p-3 rounded-xl transition-all ${textbook===b.k?"bg-[#E6F2FF]":"bg-surface-hover hover:bg-[#F0F0F0]"}`}>
                  <svg width="26" height="26" viewBox="0 0 95 95">
                    <rect x="30" y="20" width="50" height="50" stroke={textbook===b.k?"#4F46E5":"#CCC"} fill="none" strokeWidth="3"/>
                    <g transform="translate(0,-952.36222)">
                      <path d="m 56,963 c -102,122 6,9 7,9 17,-5 -66,69 -38,52 122,-77 -7,14 18,4 29,-11 45,-43 23,-4" stroke="#4F46E5" strokeWidth="3" fill="none" className="cbx-path"/>
                    </g>
                  </svg>
                  <div>
                    <span className="text-sm font-bold text-[#333]">{b.l}</span>
                    <span className="text-xs text-[#999] ml-2">{b.n}词 · {b.c}课</span>
                  </div>
                </label>
              </div>))}
          </div>

          {/* Chapter checklist */}
          <div className="bg-white/90 rounded-2xl p-4">
            <p className="text-xs font-bold mb-3" style={{color:"#C9A96E"}}>选择课次（可多选）</p>
            <div className="grid grid-cols-2 gap-x-2 gap-y-0 max-h-[220px] overflow-y-auto scroll-area">
              {chapters.map(ch=>{
                const active = selChapters.has(ch.id);
                return (
                  <div key={ch.id} className="chk-row py-2 cursor-pointer" onClick={()=>toggleChapter(ch.id)}>
                    <input type="checkbox" className="chk-input pointer-events-none" checked={active} readOnly />
                    <span className="chk-label text-sm font-bold">{ch.name}</span>
                    <span className="text-[10px] text-hint ml-auto">{ch.words.length}词</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {selChapters.size>0&&<button onClick={startChapters} className="w-full mt-4 py-3.5 bg-[#4F46E5] text-white rounded-2xl font-extrabold text-sm shadow-[0_4px_16px_rgba(79,70,229,0.25)] active:scale-[0.97]">随机抽取 {Math.min(CHAPTER_PICK,selectedTotal)} 词（共 {selectedTotal} 词可选）</button>}
      </div>)}

      {step==="wordbooks"&&(<div key="wordbooks" className="page-enter">
        {wordBooks.length>0 && <p className="text-[11px] text-hint font-bold px-1 mb-2.5">選択単語帳</p>}
        {wordBooks.length===0?(
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <img src="/icons/empty-book.svg" alt="" className="w-48 h-32 object-contain mb-4 opacity-60" />
            <p className="text-sm font-bold text-hint mb-1">还没有单词本</p>
            <p className="text-xs text-hint/50">先去个人页面自定义单词本吧</p>
          </div>
        ):(
          <div className="flex flex-col gap-2.5">
            {wordBooks.map((book:any)=>(
              <button key={book.id} onClick={()=>startWordBook(book)} className="bg-surface rounded-xl p-4 border border-border/50 flex items-center justify-between active:scale-[0.98] transition-all">
                <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-50 to-violet-100 flex items-center justify-center text-sm font-extrabold text-violet-600">{book.name[0]}</div><div><p className="text-sm font-extrabold text-main">{book.name}</p><p className="text-[10px] text-hint">{book.words?.length||0} 词</p></div></div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
              </button>))}
          </div>)}</div>)}
    </div>
  </div>);
}

function shuffle<T>(arr:T[]):T[]{ const a=[...arr]; for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]; } return a; }
