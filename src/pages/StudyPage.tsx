import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { ArrowLeft, Zap, AlertTriangle } from "lucide-react";
import type { Page } from "../components/BottomNav";
import { loadProgress, answerWord, getReviewCount } from "../lib/spaced-repetition";
import { setLocal } from "../lib/store";
import { getExample } from "../data/examples";
import { book2Data } from "../data/book2";

interface StudyPageProps { onNavigate: (p: Page) => void; darkMode?: boolean; }

const book1Words = [
  {id:"1-1",w:"生活",r:"せいかつ",m:"生活",p:"名詞"},{id:"1-2",w:"経験",r:"けいけん",m:"经验",p:"名詞・スル"},{id:"1-3",w:"出発",r:"しゅっぱつ",m:"出发",p:"名詞・スル"},{id:"1-4",w:"到着",r:"とうちゃく",m:"到达",p:"名詞・スル"},{id:"1-5",w:"準備",r:"じゅんび",m:"准备",p:"名詞・スル"},{id:"1-6",w:"片付ける",r:"かたづける",m:"整理/收拾",p:"動詞Ⅱ"},{id:"1-7",w:"洗濯",r:"せんたく",m:"洗衣服",p:"名詞・スル"},{id:"1-8",w:"掃除",r:"そうじ",m:"打扫",p:"名詞・スル"},{id:"1-9",w:"料理",r:"りょうり",m:"烹饪",p:"名詞・スル"},{id:"1-10",w:"買い物",r:"かいもの",m:"购物",p:"名詞・スル"},{id:"1-11",w:"散歩",r:"さんぽ",m:"散步",p:"名詞・スル"},{id:"1-12",w:"通勤",r:"つうきん",m:"通勤",p:"名詞・スル"},{id:"2-1",w:"感動",r:"かんどう",m:"感动",p:"名詞・スル"},{id:"2-2",w:"緊張",r:"きんちょう",m:"紧张",p:"名詞・スル"},{id:"2-3",w:"安心",r:"あんしん",m:"放心",p:"名詞・スル"},{id:"2-4",w:"満足",r:"まんぞく",m:"满足",p:"名詞・スル"},{id:"2-5",w:"失望",r:"しつぼう",m:"失望",p:"名詞・スル"},{id:"2-6",w:"我慢",r:"がまん",m:"忍耐",p:"名詞・スル"},{id:"2-7",w:"努力",r:"どりょく",m:"努力",p:"名詞・スル"},{id:"2-8",w:"感謝",r:"かんしゃ",m:"感谢",p:"名詞・スル"},{id:"2-9",w:"尊敬",r:"そんけい",m:"尊敬",p:"名詞・スル"},{id:"2-10",w:"信頼",r:"しんらい",m:"信赖",p:"名詞・スル"},
];

const allWords = [...book1Words, ...book2Data.flatMap(ch => ch.words.map(w => ({ id:w.id, w:w.word, r:w.reading, m:w.meaning, p:w.pos })))];

function genOptions(correct:string, all:string[]):string[]{const w=all.filter(m=>m!==correct);return shuffle([correct,...shuffle(w).slice(0,3)]);}
function shuffle<T>(a:T[]):T[]{const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b}

interface Q { prompt:string; correct:string; options:string[]; type:0|1|2 }

export default function StudyPage({ onNavigate }: StudyPageProps) {
  const dailyGoal = parseInt(localStorage.getItem("dailyGoal")||"15");
  const today = new Date().toISOString().slice(0,10);
  const progress = useMemo(()=>loadProgress(),[]);
  const allMs = useMemo(()=>allWords.map(w=>w.m),[]);
  const allRs = useMemo(()=>allWords.map(w=>w.r),[]);

  const { reviewWords, newWords } = useMemo(()=>{
    const due = allWords.filter(w=>{const p=progress[w.id];return p&&p.nextReview<=today});
    const done = new Set(Object.keys(progress));
    // Filter by start chapter
    const startCh = localStorage.getItem("startChapter") || "0";
    let available = allWords.filter(w=>!done.has(w.id));
    if (startCh !== "0") {
      const startIdx = book2Data.findIndex(ch=>ch.id===startCh);
      if (startIdx >= 0) {
        const allowedIds = new Set(book2Data.slice(startIdx).flatMap(ch=>ch.words.map(w=>w.id)));
        available = available.filter(w=>allowedIds.has(w.id));
      }
    }
    const randomMode = localStorage.getItem("randomMode") !== "false";
    const news = randomMode ? shuffle(available).slice(0, dailyGoal) : available.slice(0, dailyGoal);
    return {reviewWords:due, newWords:news};
  },[dailyGoal,progress,today]);

  const allIds = useMemo(()=>[...reviewWords.map(w=>w.id),...newWords.map(w=>w.id)],[reviewWords,newWords]);
  const allCount = allIds.length;

  const phases = ["复习巩固","新词认知","多维练习"];
  const typeLabels = ["假名→中文","汉字→假名","汉字→中文"];

  // ── State ──
  const [phase, setPhase] = useState(()=>reviewWords.length>0?0:newWords.length>0?1:2);
  const [queue, setQueue] = useState<string[]>(()=>reviewWords.length?reviewWords.map(w=>w.id):newWords.length?newWords.map(w=>w.id):allIds);
  const [picked, setPicked] = useState<string|null>(null);
  const [done, setDone] = useState(false);
  const [totalRight, setTotalRight] = useState(0);
  const [dueTomorrow, setDueTomorrow] = useState(0);
  const [showExit, setShowExit] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // ── Refs ──
  const phaseCorrect = useRef(new Set<string>());
  const errorPool = useRef<string[]>([]);
  const errorCount = useRef<Record<string,number>>({});
  const answers = useRef<Record<string,boolean>>({});
  const exampleCache = useRef<Record<string,string>>({});
  const busy = useRef(false);
  const timer = useRef<any>(null);
  const audioCtx = useRef<AudioContext|null>(null);

  const successAudio = useRef<HTMLAudioElement|null>(null);
  const playSuccess = () => {
    try {
      if (!successAudio.current) successAudio.current = new Audio("/icons/success.mp3");
      const a = successAudio.current;
      a.currentTime = 0; a.volume = 0.6; a.play().catch(()=>{});
    } catch {}
  };
  const playError = () => {
    try {
      playBeep(260, 0.3, "triangle");
    } catch {}
  };
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
  const cur = allWords.find(w=>w.id===currentId)||allWords[0];
  const phaseWords = phase===0?reviewWords:phase===1?newWords:[...reviewWords,...newWords];
  const phaseTotal = phaseWords.length;

  useEffect(() => { if (cur.r && ttsUnlocked.current) speak(cur.r); }, [currentId]);

  // ── Generate question ──
  const makeQ = (wid:string, ph:number):Q => {
    const w = allWords.find(x=>x.id===wid)||allWords[0];
    if (ph===0){const t=Math.random()>.5?1:0;if(t===0)return{type:0,prompt:w.r,correct:w.m,options:genOptions(w.m,allMs)};return{type:1,prompt:w.w,correct:w.r,options:genOptions(w.r,allRs)}}
    if (ph===1) return {type:2,prompt:w.w,correct:w.m,options:genOptions(w.m,allMs)};
    const t=Math.floor(Math.random()*3)as 0|1|2;
    if(t===0)return{type:0,prompt:w.r,correct:w.m,options:genOptions(w.m,allMs)};
    if(t===1)return{type:1,prompt:w.w,correct:w.r,options:genOptions(w.r,allRs)};
    return{type:2,prompt:w.w,correct:w.m,options:genOptions(w.m,allMs)};
  };

  const [question, setQuestion] = useState<Q>(()=>makeQ(currentId, phase));

  // ── Advance ──
  const advance = (rest:string[], ph:number) => {
    if (timer.current) clearTimeout(timer.current);
    if (rest.length>0) {
      setQueue(rest);
      setQuestion(makeQ(rest[0], ph));
      setPicked(null); busy.current=false; return;
    }
    // Phase 3 re-queue: word still in queue, just show it
    if (ph===2 && queue.length>0) {
      setQuestion(makeQ(queue[0], ph));
      setPicked(null); busy.current=false; return;
    }
    // Queue empty — check error pool
    if (errorPool.current.length>0) {
      const pool = [...new Set(errorPool.current)]; errorPool.current=[];
      setQueue(pool); phaseCorrect.current=new Set();
      setQuestion(makeQ(pool[0], ph));
      setPicked(null); busy.current=false; return;
    }
    // Next phase or done
    if (ph===0||ph===1) {
      const np = ph+1; setPhase(np); phaseCorrect.current=new Set();
      const nq = np===1?newWords.map(w=>w.id):allIds;
      if (nq.length===0) { settle(); return; }
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
    const ts = new Date().toISOString().slice(0,10);
    if ((localStorage.getItem("lastStudyDate")||"")!==ts){setLocal("studyDays",String(parseInt(localStorage.getItem("studyDays")||"0")+1));setLocal("lastStudyDate",ts)}
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
      if (phase===0) answerWord(cur.id, true);
      setQueue(rest);
      busy.current=true;
      timer.current = setTimeout(()=>{ advance(rest, phase); }, 500);
    } else {
      playError();
      errorCount.current[cur.id]=(errorCount.current[cur.id]||0)+1;
      if (phase===0||phase===1) {
        // Phases 1&2: wrong → show answer → error pool
        errorPool.current.push(cur.id);
        setShowHint(true); busy.current=true;
        timer.current = setTimeout(()=>{
          setShowHint(false);
          advance(rest, phase);
        }, phase===0?1300:2000);
      } else {
        // Phase 3: wrong → re-queue, ≥3 errors → show hint but still pass when correct
        const pos = Math.min(2, rest.length);
        const nextQ = [...rest.slice(0,pos), cur.id, ...rest.slice(pos)];
        setQueue(nextQ); busy.current=true;
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

  const showExample = phase===1 || showHint || (phase===2 && (errorCount.current[currentId]||0)>=3);

  if (done) return (<>
    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{zIndex:50}}>
        {Array.from({length:12},()=>({ox:Math.random()*90+5+"%",oy:Math.random()*90+5+"%"})).flatMap(o=>Array.from({length:24},(_,i)=>{const a=Math.random()*Math.PI*2,d=30+Math.random()*90;return{ox:o.ox,oy:o.oy,x:Math.cos(a)*d,y:Math.sin(a)*d,r:(Math.random()-.5)*180,c:["#ff6584","#6c63ff","#ffd700","#3f3d56","#ff6584","#6c63ff"][i%6]}})).map((p,i)=>(<span key={i} className="absolute block" style={{left:p.ox,top:p.oy,width:5,height:2,borderRadius:1,background:p.c,opacity:.8,animation:"confetti 2.2s ease-out forwards",["--x" as any]:`${p.x}px`,["--y" as any]:`${p.y}px`,["--r" as any]:`${p.r}deg`}}/>))}
      </div>
      <div className="relative w-48 h-48 mb-4 flex items-center justify-center"><img src="/icons/complete.svg" alt="" className="w-full h-full object-contain opacity-70"/></div>
      <h2 className="text-xl font-bold text-main mb-1">学習完了！</h2>
      <p className="text-sm text-sub mb-2">{allCount} 語学習しました</p>
      <p className="text-xs text-hint">正解: {totalRight} | 明日复习: {dueTomorrow} 語</p>
      <button onClick={()=>onNavigate("home")} className="mt-6 px-8 py-3 bg-primary text-white rounded-full text-sm font-bold active:scale-95">ホームへ戻る</button>
    </div>
  </>);

  return (<>
    <div className="flex items-center gap-3 px-4 py-2">
      <button onClick={handleBack} className="flex items-center gap-1 text-hint text-sm font-bold active:opacity-60"><ArrowLeft size={16} stroke="var(--color-text-tertiary)" strokeWidth={2}/><span>戻る</span></button>
      <span className="text-[15px] font-semibold text-main">単語学習 <span className="text-[10px] text-hint font-normal">· {phases[phase]}</span></span>
      <span className="ml-auto text-sm font-bold text-sub">✓ {totalRight}</span>
    </div>
    <div className="flex-1 flex flex-col items-center justify-center px-4">
      {phase===2 && <p className="text-[10px] text-hint font-bold mb-2">{typeLabels[question.type]}</p>}
      {(phase===1||showHint) && <p className="text-sm text-primary font-bold mb-1">{cur.r}</p>}
      <p className="text-[40px] font-extrabold text-main tracking-wider">{question.prompt}</p>
      <p className="text-xs text-hint mt-1">{cur.p}</p>
      {showHint && <p className="text-lg font-extrabold text-success mt-2 animate-pop-in">{question.correct}</p>}
      {showExample && (
        <div className="mt-4 px-5 py-3 bg-primary-subtle rounded-2xl max-w-[320px] text-center">
          {phase===2&&(errorCount.current[currentId]||0)>=3&&<p className="text-[10px] text-danger/60 mb-0.5">已错{errorCount.current[currentId]}次</p>}
          <p className="text-[10px] text-hint/60 mb-1">例文</p>
          <p className="text-xs text-main leading-relaxed">
            {(()=>{const id=currentId;if(!exampleCache.current[id])exampleCache.current[id]=getExample(cur.w,cur.p||"");return exampleCache.current[id];})().split("【").map((part,i)=>i===0?part:part.split("】").map((p,j)=>j===0?<span key={i} className="font-extrabold text-primary">{p}</span>:p))}
          </p>
        </div>
      )}
    </div>
    {showExit && (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40" onClick={cancelExit}>
        <div className="bg-surface rounded-2xl p-5 mx-8 shadow-xl text-center" onClick={e=>e.stopPropagation()}>
          <AlertTriangle size={32} className="text-warning mx-auto mb-2"/>
          <h3 className="font-bold text-main mb-1">学習を中断しますか？</h3>
          <p className="text-xs text-sub mb-4">まだ完了していない単語の進捗は保存されません</p>
          <div className="flex gap-2">
            <button onClick={cancelExit} className="flex-1 py-2.5 rounded-xl bg-primary-subtle text-primary text-sm font-bold">続ける</button>
            <button onClick={confirmExit} className="flex-1 py-2.5 rounded-xl bg-danger text-white text-sm font-bold">中断する</button>
          </div>
        </div>
      </div>
    )}
    <div className="px-4 pb-4">
      <div className="grid grid-cols-2 gap-3 w-full max-w-[340px] mx-auto">
        {question.options.map((opt,i)=>{
          const isCorrect=opt===question.correct; const isPicked=picked===opt; const show=picked!==null;
          const highlight=show&&(isCorrect||isPicked);
          return(<button key={i} onClick={()=>answer(opt)} className={`relative h-[76px] rounded-2xl font-bold text-[13px] flex items-center justify-center text-center px-3 transition-all active:scale-[0.97] overflow-hidden
            ${show?(isCorrect?"bg-success-subtle border-2 border-success text-success shadow-sm":isPicked?"bg-danger-subtle border-2 border-danger text-danger shadow-sm":"bg-surface border border-border text-main opacity-30"):"bg-surface border border-border text-main hover:border-primary/30"}`}>
            {highlight && <svg className="absolute left-0 top-0 h-full" width="8" viewBox="0 0 8 64" preserveAspectRatio="none"><path d="M5 0 Q2.5 4 5 8 T5 16 Q2.5 20 5 24 T5 32 Q2.5 36 5 40 T5 48 Q2.5 52 5 56 T5 64 L0 64 L0 0 Z" fill={isCorrect?"#22c55e":"#ef4444"}/></svg>}
            {highlight && <span className="absolute top-0.5 right-0.5 text-xs leading-none" style={{color:isCorrect?"#22c55e":"#ef4444"}}>{isCorrect?"✓":"✗"}</span>}
            {opt}
          </button>);
        })}
      </div>
    </div>
  </>);
}
