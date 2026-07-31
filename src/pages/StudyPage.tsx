import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { ArrowLeft, Check, Volume2, AlertTriangle } from "lucide-react";
import type { Page } from "../components/BottomNav";
import { loadProgress, answerWord, getReviewCount } from "../lib/spaced-repetition";
import { setLocal } from "../lib/store";
import { getExample } from "../data/examples";
import { getWordSource } from "../lib/wordSource";
import { playSuccess, playError, audioReady } from "../lib/audio";
import { useLongPress } from "../lib/longPress";
import { toggleFavorite } from "../lib/favorites";

interface StudyPageProps { onNavigate: (p: Page) => void; }

function genOptions(correct:string, all:string[]):string[]{const w=all.filter(m=>m!==correct);return shuffle([correct,...shuffle(w).slice(0,3)]);}
function shuffle<T>(a:T[]):T[]{const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b}

interface Q { prompt:string; correct:string; options:string[]; type:0|1|2 }

const phases = ["复习巩固","新词认知","多维练习"];
const typeLabels = ["仮名→中文","漢字→仮名","漢字→中文"];

// Long-press wrapper for word → add to favorites
function LongPressWord({ wordId, onFavorite, children }: { wordId: string; onFavorite: () => boolean; children: React.ReactNode }) {
  const handlers = useLongPress(() => onFavorite());
  return <div {...handlers} className="inline">{children}</div>;
}

export default function StudyPage({ onNavigate }: StudyPageProps) {
  const dailyGoal = parseInt(localStorage.getItem("dailyGoal")||"15");
  const today = new Date().toISOString().slice(0,10);
  const progress = useMemo(()=>loadProgress(),[]);
  const selectedBook = localStorage.getItem("selectedBook") || "all";
  const sourceWords = useMemo(() => getWordSource(), [selectedBook]);
  const allMs = useMemo(()=>sourceWords.map(w=>w.m),[sourceWords]);
  const allRs = useMemo(()=>sourceWords.map(w=>w.r),[sourceWords]);

  const { reviewWords, newWords } = useMemo(()=>{
    const due = sourceWords.filter(w=>{const p=progress[w.id];return p&&p.nextReview<=today});
    const done = new Set(Object.keys(progress));
    let available = sourceWords.filter(w=>!done.has(w.id));
    const randomMode = localStorage.getItem("randomMode") !== "false";
    const news = randomMode ? shuffle(available).slice(0, dailyGoal) : available.slice(0, dailyGoal);
    return {reviewWords:due, newWords:news};
  },[dailyGoal,progress,today,sourceWords]);

  const allIds = useMemo(()=>[...reviewWords.map(w=>w.id),...newWords.map(w=>w.id)],[reviewWords,newWords]);
  const allCount = allIds.length;

  // ── State ──
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("準備中...");
  const [phase, setPhase] = useState(()=>reviewWords.length>0?0:newWords.length>0?1:2);
  const [queue, setQueue] = useState<string[]>(()=>reviewWords.length?reviewWords.map(w=>w.id):newWords.length?newWords.map(w=>w.id):allIds);
  const [picked, setPicked] = useState<string|null>(null);
  const [done, setDone] = useState(false);
  const [totalRight, setTotalRight] = useState(0);
  const [dueTomorrow, setDueTomorrow] = useState(0);
  const [showExit, setShowExit] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [phaseBanner, setPhaseBanner] = useState<string | null>(null);

  // ── Refs ──
  const phaseCorrect = useRef(new Set<string>());
  const errorPool = useRef<string[]>([]);
  const errorCount = useRef<Record<string,number>>({});
  const answers = useRef<Record<string,boolean>>({});
  const exampleCache = useRef<Record<string,string>>({});
  const busy = useRef(false);
  const timer = useRef<any>(null);
  const bannerTimer = useRef<any>(null);
  const errorRound = useRef(false);
  const errorRoundTotal = useRef(0);
  const phase2Attempted = useRef(new Set<string>());
  const phase2CleanupTotal = useRef(0);
  const audioCtx = useRef<AudioContext|null>(null);

  const playBeep = (freq: number, dur: number, type: OscillatorType) => {
    try {
      if (!audioCtx.current) audioCtx.current = new (window.AudioContext||(window as any).webkitAudioContext)();
      const ctx = audioCtx.current;
      if (ctx.state==="suspended") ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = type; osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      osc.start(); osc.stop(ctx.currentTime + dur);
    } catch {}
  };

  // Preload audio via shared instances
  useEffect(() => {
    setLoadingText("音声読み込み中...");
    audioReady().then(() => {
      setLoadingText("準備完了");
      setTimeout(() => setLoading(false), 400);
    });
    const t = setTimeout(() => setLoading(false), 3000);
    // Pre-warm TTS
    try { const u = new SpeechSynthesisUtterance(""); u.volume = 0; u.lang = "ja-JP"; speechSynthesis.speak(u); } catch {}
    return () => clearTimeout(t);
  }, []);

  const ttsUnlocked = useRef(false);
  const speak = (text: string) => {
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "ja-JP"; u.rate = 0.85; u.volume = 1;
      window.speechSynthesis.speak(u);
    } catch {}
  };

  const currentId = queue[0]||"";
  const cur = sourceWords.find(w=>w.id===currentId)||sourceWords[0];
  const phaseWords = phase===0?reviewWords:phase===1?newWords:[...reviewWords,...newWords];
  const phaseTotal = phaseWords.length;

  useEffect(() => { if (cur.r && ttsUnlocked.current) speak(cur.r); }, [currentId]);

  // ── Generate question ──
  const makeQ = (wid:string, ph:number):Q => {
    const w = sourceWords.find(x=>x.id===wid)||sourceWords[0];
    if (ph===0){const t=Math.random()>.5?1:0;if(t===0)return{type:0,prompt:w.r,correct:w.m,options:genOptions(w.m,allMs)};return{type:1,prompt:w.w,correct:w.r,options:genOptions(w.r,allRs)}}
    if (ph===1) return {type:2,prompt:w.w,correct:w.m,options:genOptions(w.m,allMs)};
    const t=Math.floor(Math.random()*3)as 0|1|2;
    if(t===0)return{type:0,prompt:w.r,correct:w.m,options:genOptions(w.m,allMs)};
    if(t===1)return{type:1,prompt:w.w,correct:w.r,options:genOptions(w.r,allRs)};
    return{type:2,prompt:w.w,correct:w.m,options:genOptions(w.m,allMs)};
  };

  const [question, setQuestion] = useState<Q>(()=>makeQ(currentId, phase));

  const answered = picked !== null;
  const isCorrect = picked === question.correct;

  // ── Advance ──
  const advance = (rest:string[], ph:number) => {
    if (timer.current) clearTimeout(timer.current);
    if (rest.length>0) {
      setQueue(rest);
      setQuestion(makeQ(rest[0], ph));
      setPicked(null); busy.current=false; return;
    }
    if (ph===2 && queue.length>0) {
      setQuestion(makeQ(queue[0], ph));
      setPicked(null); busy.current=false; return;
    }
    if (errorPool.current.length>0) {
      const pool = [...new Set(errorPool.current)]; errorPool.current=[];
      setQueue(pool); phaseCorrect.current=new Set();
      errorRound.current = true; errorRoundTotal.current = pool.length;
      setQuestion(makeQ(pool[0], ph));
      setPicked(null); busy.current=false; return;
    }
    if (ph===0||ph===1) {
      errorRound.current = false;
      phase2Attempted.current = new Set();
      phase2CleanupTotal.current = 0;
      const np = ph+1; setPhase(np); phaseCorrect.current=new Set();
      const nq = np===1?newWords.map(w=>w.id):allIds;
      if (nq.length===0) { settle(); return; }
      // Show phase transition banner
      setPhaseBanner(phases[np]);
      if (bannerTimer.current) clearTimeout(bannerTimer.current);
      bannerTimer.current = setTimeout(() => setPhaseBanner(null), 1500);
      setQueue(nq); setQuestion(makeQ(nq[0], np));
      setPicked(null); busy.current=false;
    } else {
      settle();
    }
  };

  // ── Settlement ──
  const settle = () => {
    let tomorrowCount = 0;
    for (const id of allIds) {
      const ec = errorCount.current[id]||0;
      const dt = ec>=2;
      if (dt) { tomorrowCount++; const d=new Date();d.setDate(d.getDate()+1);answerWord(id,false,d.toISOString().slice(0,10)); }
      else { answerWord(id, answers.current[id]??false); }
    }
    setDueTomorrow(tomorrowCount);
    const d = new Date();
    const ts = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    if ((localStorage.getItem("lastStudyDate")||"")!==ts){setLocal("studyDays",String(parseInt(localStorage.getItem("studyDays")||"0")+1));setLocal("lastStudyDate",ts)}
    // Record study date for weekly calendar
    try {
      const dates = JSON.parse(localStorage.getItem("studyDates")||"[]");
      if (!dates.includes(ts)) { dates.push(ts); setLocal("studyDates", JSON.stringify(dates)); }
    } catch {}
    setDone(true);
  };

  // ── Answer handler ──
  const answer = useCallback((opt:string)=>{
    if (picked||done||!cur||busy.current) return;
    if (timer.current) clearTimeout(timer.current);
    setPicked(opt);
    const ok = opt===question.correct;
    answers.current[cur.id] = ok||(answers.current[cur.id]??false);
    const rest = queue.slice(1);

    if (ok) {
      playSuccess();
      setTotalRight(t=>t+1);
      phaseCorrect.current.add(cur.id);
      if (phase===2) phase2Attempted.current.add(cur.id);
      if (phase===0) answerWord(cur.id, true);
      setQueue(rest);
      busy.current=true;
      timer.current = setTimeout(()=>{ advance(rest, phase); }, 500);
    } else {
      playError();
      errorCount.current[cur.id]=(errorCount.current[cur.id]||0)+1;
      if (phase===0||phase===1) {
        errorPool.current.push(cur.id);
        setShowHint(true); busy.current=true;
        timer.current = setTimeout(()=>{
          setShowHint(false);
          advance(rest, phase);
        }, phase===0?1000:2000);
      } else {
        const pos = Math.min(2, rest.length);
        const nextQ = [...rest.slice(0,pos), cur.id, ...rest.slice(pos)];
        setQueue(nextQ); busy.current=true;
        phase2Attempted.current.add(cur.id);
        const ec = errorCount.current[cur.id];
        if (ec >= 3) setShowHint(true);
        timer.current = setTimeout(()=>{
          setShowHint(false);
          advance(nextQ.slice(1), phase);
        }, ec >= 3 ? 3000 : 800);
      }
    }
  },[picked,queue,cur,done,question,phase]);

  // Pre-activate audio on first user gesture
  useEffect(() => {
    const unlock = () => {
      if (!audioCtx.current) audioCtx.current = new (window.AudioContext||(window as any).webkitAudioContext)();
      if (audioCtx.current.state==="suspended") audioCtx.current.resume();
      document.removeEventListener("touchstart", unlock); document.removeEventListener("click", unlock);
    };
    document.addEventListener("touchstart", unlock); document.addEventListener("click", unlock);
    return () => { document.removeEventListener("touchstart", unlock); document.removeEventListener("click", unlock); };
  }, []);

  const handleBack = ()=>{setShowExit(true);};
  const confirmExit = ()=>{answers.current={};onNavigate("home");};
  const cancelExit = ()=>{setShowExit(false);};

  if (allCount===0){onNavigate("rest");return null;}

  // ── Loading screen ──
  if (loading) return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 px-8 text-center bg-bg">
      <div className="word-loader" />
      <p className="text-sub text-sm font-medium">{loadingText}</p>
      <p className="text-hint text-xs">単語と音声を準備しています</p>
    </div>
  );

  const inErrorRound = errorRound.current;
  const phase2InCleanup = phase === 2 && phase2Attempted.current.size >= allIds.length && queue.length > 0;
  if (phase2InCleanup && phase2CleanupTotal.current === 0) {
    phase2CleanupTotal.current = queue.length;
  }
  const totalForProgress = inErrorRound
    ? errorRoundTotal.current
    : phase2InCleanup ? phase2CleanupTotal.current
    : phase === 0 ? reviewWords.length
    : phase === 1 ? newWords.length
    : allIds.length;
  const currentPos = inErrorRound
    ? (errorRoundTotal.current - queue.length)
    : phase2InCleanup ? Math.max(0, phase2CleanupTotal.current - queue.length)
    : phase === 0 ? (reviewWords.length - queue.length)
    : phase === 1 ? (newWords.length - queue.length)
    : phase2Attempted.current.size;
  const rawPct = totalForProgress > 0 ? ((currentPos + (answered ? 1 : 0)) / totalForProgress) * 100 : 0;
  const progressPct = Math.min(100, Math.max(0, rawPct));

  const showExample = phase===1 || showHint || (phase===2 && (errorCount.current[currentId]||0)>=3);

  // ── Done screen ──
  if (done) return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 px-8 text-center relative">
      {/* Confetti */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{zIndex:50}}>
        {Array.from({length:12},()=>({ox:Math.random()*90+5+"%",oy:Math.random()*90+5+"%"})).flatMap(o=>Array.from({length:24},(_,i)=>{const a=Math.random()*Math.PI*2,d=30+Math.random()*90;return{ox:o.ox,oy:o.oy,x:Math.cos(a)*d,y:Math.sin(a)*d,r:(Math.random()-.5)*180,c:["#ff6584","#6c63ff","#ffd700","#3f3d56","#ff6584","#6c63ff"][i%6]}})).map((p,i)=>(<span key={i} className="absolute block" style={{left:p.ox,top:p.oy,width:5,height:2,borderRadius:1,background:p.c,opacity:.8,animation:"confetti 2.2s ease-out forwards",["--x" as any]:`${p.x}px`,["--y" as any]:`${p.y}px`,["--r" as any]:`${p.r}deg`}}/>))}
      </div>
      {/* Floating music notes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {["♪","♫","♩","🎵"].map((note, i) => (
          <span key={i} className="absolute text-2xl opacity-20"
            style={{
              left: `${15 + i * 25}%`,
              top: `${20 + (i % 3) * 25}%`,
              animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}>{note}</span>
        ))}
      </div>
      <div className="relative w-48 h-48 mb-2 flex items-center justify-center">
        <img src={`${import.meta.env.BASE_URL}icons/complete.svg`} alt="" className="w-full h-full object-contain opacity-70" />
      </div>
      <p className="text-sub text-[11px] tracking-[0.32em]">COMPLETE</p>
      <h1 className="font-serif text-3xl text-main">お疲れさまでした</h1>
      <button
        onClick={() => onNavigate("home")}
        className="bg-primary text-white hover:bg-primary/88 mt-2 rounded-full px-10 py-3.5 text-sm font-medium tracking-wide transition-colors"
      >
        返回首页
      </button>
    </div>
  );

  // ── Quiz screen ──
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-bg relative">
      {/* ── Top bar (sticky, glass) ── */}
      <header className="bg-bg/90 sticky top-0 z-10 backdrop-blur">
        <div className="flex items-center gap-3 px-5 py-4">
          <button
            onClick={handleBack}
            className="text-main hover:text-sub flex items-center gap-1.5 text-sm transition-colors"
          >
            <ArrowLeft className="size-4" strokeWidth={1.5} />
            戻る
          </button>
          <div className="ml-1 flex min-w-0 items-baseline gap-2">
            <span className="font-serif text-base text-main">単語学習</span>
            <span className="text-hint truncate text-[11px]">· {phases[phase]}</span>
          </div>
          <span className="text-sub ml-auto flex items-center gap-1.5 text-xs tabular-nums">
            <Check className="size-4" strokeWidth={1.5} />
            {totalRight}
          </span>
        </div>

        {/* Progress bar */}
        <div className="px-5 pb-3">
          <div className="bg-border h-px w-full">
            <div
              className="bg-primary h-px transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="text-hint mt-2 flex justify-between text-[10px] tracking-[0.2em]">
            <span>QUESTION</span>
            <span className="tabular-nums">
              {Math.min(currentPos + 1, totalForProgress)} / {totalForProgress}
            </span>
          </div>
        </div>
      </header>

      {/* ── Question area ── */}
      <div className="flex flex-1 flex-col relative">
        {/* Phase transition banner — absolute overlay, doesn't shift content */}
        {phaseBanner && (
        <div className="absolute left-0 right-0 z-20 flex justify-center pointer-events-none" style={{top: 'env(safe-area-inset-top, 0px)'}}>
          <div className="animate-pop-in bg-primary text-white text-center py-3 px-8 mx-5 rounded-xl w-full max-w-[340px]">
            <p className="text-[11px] tracking-[0.2em] opacity-60">NEXT PHASE</p>
            <p className="text-sm font-semibold mt-0.5">{phaseBanner}</p>
          </div>
        </div>
      )}
      <main className="flex flex-1 flex-col items-center justify-center px-5 pt-8 pb-[6px] text-center">
        {/* Type badge */}
        {phase === 2 && (
          <span className="text-hint border-border mb-6 rounded-full border px-3 py-1 text-[10px] tracking-[0.2em]">
            {typeLabels[question.type]}
          </span>
        )}

        {/* Reading (shown in phase 1 or when hint is revealed) */}
        {phase === 1 && (
          <p className="text-sub mb-2 text-sm">{cur.r}</p>
        )}

        {/* Main word */}
        <LongPressWord wordId={currentId} onFavorite={() => toggleFavorite(currentId)}>
          <h1 className="font-serif text-5xl leading-none tracking-wide text-main md:text-6xl break-words">
            {question.prompt}
          </h1>
        </LongPressWord>

        {/* Part of speech */}
        <p className="text-sub mt-4 text-sm">{cur.p}</p>

        {/* Audio button */}
        <button
          type="button"
          onClick={() => { ttsUnlocked.current = true; speak(cur.r); }}
          className="text-sub hover:text-main border-border hover:border-primary/40 mt-7 flex items-center gap-2 rounded-full border px-4 py-2 text-xs transition-colors"
          aria-label="播放读音"
        >
          <Volume2 className="size-4" strokeWidth={1.5} />
          発音
        </button>

        {/* Answer reveal (shown after picking) */}
        <div
          className={`mt-7 transition-all duration-300 ${
            answered ? 'opacity-100' : 'opacity-0'
          }`}
          aria-live="polite"
        >
          {answered ? (
            <p className="text-main text-sm">
              <span className="font-semibold">{question.correct}</span>
              {question.type !== 1 && cur.m !== question.correct && (
                <span className="text-hint ml-1">— {cur.m}</span>
              )}
            </p>
          ) : (
            <p className="text-sm">　</p>
          )}
        </div>

        {/* Example sentence — reserved space to prevent layout shift */}
        <div className="mt-5 min-h-[80px] flex items-center justify-center">
          {showExample ? (
            <div className="rounded-xl bg-surface-subtle px-5 py-3 max-w-[320px] text-center animate-pop-in">
              {phase===2 && (errorCount.current[currentId]||0) >= 3 && (
                <p className="text-danger/60 mb-0.5 text-[10px]">已错{errorCount.current[currentId]}次</p>
              )}
              <p className="text-hint mb-1 text-[10px]">例文</p>
              <p className="text-main text-xs leading-relaxed">
                {(()=>{const id=currentId;if(!exampleCache.current[id])exampleCache.current[id]=getExample(cur.w,cur.p||"");return exampleCache.current[id];})().split("【").map((part,i)=>i===0?part:part.split("】").map((p,j)=>j===0?<span key={i} className="text-primary font-extrabold">{p}</span>:p))}
              </p>
            </div>
          ) : (
            <div className="rounded-xl bg-surface-subtle px-5 py-3 max-w-[320px] text-center invisible">
              <p className="text-hint mb-1 text-[10px] leading-relaxed">&nbsp;</p>
              <p className="text-main text-xs leading-relaxed">&nbsp;</p>
            </div>
          )}
        </div>
      </main>

      {/* ── Options ── */}
      <footer className="px-5 pt-2 flex-shrink-0 relative" style={{paddingBottom:"calc(2rem + env(safe-area-inset-bottom, 0px))"}}>
        <div className="mx-auto grid w-full max-w-[340px] grid-cols-2 gap-3">
          {question.options.map((option) => {
            const isAnswer = option === question.correct;
            const isPicked = option === picked;

            let tone = 'bg-white border-border text-main hover:border-primary/40';
            if (answered && isAnswer) {
              tone = 'bg-primary border-primary text-white';
            } else if (answered && isPicked) {
              tone = 'bg-surface-subtle border-border text-sub line-through';
            } else if (answered) {
              tone = 'bg-white border-border text-sub/60';
            }

            return (
              <button
                key={option}
                type="button"
                onClick={() => answer(option)}
                disabled={answered}
                className={`rounded-xl border py-6 text-center text-[15px] font-medium transition-colors ${tone}`}
              >
                {option}
              </button>
            );
          })}
        </div>

        {/* Bottom hint — absolute so it doesn't shift layout */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center text-[11px] tracking-[0.2em] text-hint pointer-events-none" style={{paddingBottom:"calc(env(safe-area-inset-bottom, 0px))",height:"calc(2.5rem + env(safe-area-inset-bottom, 0px))"}}>
          選択してください
        </div>
      </footer>
      </div>

      {/* ── Exit confirm modal ── */}
      {showExit && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40" onClick={cancelExit}>
          <div className="bg-white rounded-2xl p-6 mx-8 shadow-xl text-center max-w-[280px]" onClick={e=>e.stopPropagation()}>
            <AlertTriangle className="size-8 text-sub mx-auto mb-3" strokeWidth={1.5} />
            <h3 className="text-main text-[15px] font-semibold mb-1">学習を中断しますか？</h3>
            <p className="text-sub text-[13px] mb-5">まだ完了していない単語の進捗は保存されません</p>
            <div className="flex gap-3">
              <button onClick={cancelExit} className="flex-1 py-2.5 rounded-xl bg-surface-subtle text-main text-sm font-medium">続ける</button>
              <button onClick={confirmExit} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium">中断する</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
