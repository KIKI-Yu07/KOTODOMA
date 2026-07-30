import { useState, useMemo, useEffect, useRef } from "react";
import { ArrowLeft, Zap } from "lucide-react";
import { playSuccess, playError } from "../lib/audio";
import { useLongPress } from "../lib/longPress";
import { toggleFavorite } from "../lib/favorites";
import { getWordSource } from "../lib/wordSource";

// Helper: find word ID from kanji + reading
function findWordId(w: string, r: string): string {
  const found = getWordSource().find(x => x.w === w && x.r === r);
  if (found) return found.id;
  try {
    const wbs = JSON.parse(localStorage.getItem("wordbooks") || "[]") as any[];
    for (const wb of wbs) for (let i = 0; i < wb.words.length; i++) {
      if (wb.words[i].word === w && wb.words[i].reading === r) return `wb_${wb.id}_${i}`;
    }
  } catch {}
  return w + r;
}
import type { Page } from "../components/BottomNav";

interface GameWord { w: string; r: string; m: string; }

interface Props { onNavigate: (p: Page) => void; onBack: () => void; onReplay?: () => void; onRetry?: () => void; mode: "zh2jp" | "spell" | "fillKana"; words: GameWord[]; }

function shuffle<T>(arr: T[]): T[] { const a = [...arr]; for (let i = a.length-1; i>0; i--) { const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

function LongPressWrapper({ word, reading, children }: { word: string; reading: string; children: React.ReactNode }) {
  const handlers = useLongPress(() => toggleFavorite(findWordId(word, reading)));
  return <div {...handlers} className="inline">{children}</div>;
}

const kanaPool = "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ";
const kataPool = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポ";
const allKana = Array.from(kanaPool);
const allKata = Array.from(kataPool);
const isKatakana = (s: string) => /^[゠-ヿ]+$/.test(s);

export default function MatchGame({ onNavigate, onBack, onReplay, onRetry, mode, words: wordPool }: Props) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [right, setRight] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [done, setDone] = useState(false);
  const [animPct, setAnimPct] = useState(0);
  const [lastAnswer, setLastAnswer] = useState<{w:string;r:string;m:string;correct:boolean} | null>(null);

  const words = useMemo(() => shuffle(wordPool), [wordPool]);
  const cur = words[idx] || { w: "加载中...", r: "", m: "" };
  const finalPct = words.length > 0 ? Math.round((right / words.length) * 100) : 0;

  useEffect(() => {
    if (!done) { setAnimPct(0); return; }
    let frame: number;
    const start = performance.now();
    const duration = 1200;
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimPct(Math.round(eased * finalPct));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [done, finalPct]);

  // fillKana: pick a random position in the reading to blank out
  const kanaChars = useMemo(() => Array.from(cur.r), [cur]);
  const blankIdx = useMemo(() => Math.floor(Math.random() * kanaChars.length), [idx, kanaChars.length]);
  const blankChar = kanaChars[blankIdx];
  const allWs = useMemo(() => wordPool.map(w => w.w), []);
  const allMs = useMemo(() => wordPool.map(w => w.m), []);
  const allRs = useMemo(() => wordPool.map(w => w.r), []);

  // spell mode: randomly show correct or wrong reading
  const isCorrectReading = useMemo(() => Math.random() > 0.5, [idx]);
  const kanaCharPool = useMemo(() => isKatakana(cur.r) ? allKata : allKana, [cur.r]);

  const shownReading = useMemo(() => {
    if (isCorrectReading) return cur.r;
    const chars = Array.from(cur.r);
    if (chars.length < 2) return cur.r;
    const pos = Math.floor(Math.random() * chars.length);
    const pool = shuffle(kanaCharPool.filter(k => k !== chars[pos]));
    chars[pos] = pool[0];
    return chars.join("");
  }, [idx, cur.r, isCorrectReading, kanaCharPool]);

  const [options, correctAnswer, optType, isNoError] = useMemo(() => {
    if (mode === "fillKana") {
      const wrongs = shuffle(kanaCharPool.filter(k => k !== blankChar)).slice(0, 5);
      return [shuffle([blankChar, ...wrongs]), blankChar, "kana", false] as const;
    }
    if (mode === "spell") {
      const pool = isKatakana(cur.r) ? allKata : allKana;
      const chars = Array.from(cur.r);
      const wrongs: string[] = [];
      const used = new Set([cur.r]);
      for (let attempt = 0; attempt < 30 && wrongs.length < 5; attempt++) {
        const a = [...chars];
        const pos = Math.floor(Math.random() * a.length);
        const rep = shuffle(pool.filter(k => k !== a[pos]))[0];
        a[pos] = rep;
        const s = a.join("");
        if (!used.has(s)) { used.add(s); wrongs.push(s); }
      }
      if (isCorrectReading) {
        const opts = shuffle(wrongs);
        return [[...opts, "读音正确"], "读音正确", "spell", true] as const;
      }
      const opts = shuffle([cur.r, ...wrongs.slice(0,4)]);
      return [[...opts, "读音正确"], cur.r, "spell", false] as const;
    }
    const useKanji = Math.random() > 0.5;
    if (useKanji) {
      const wrongs = shuffle(allWs.filter(w => w !== cur.w)).slice(0, 3);
      return [shuffle([cur.w, ...wrongs]), cur.w, "kanji"] as const;
    } else {
      const wrongs = shuffle(allMs.filter(m => m !== cur.m)).slice(0, 3);
      return [shuffle([cur.m, ...wrongs]), cur.m, "meaning"] as const;
    }
  }, [mode, idx, allWs, allMs, allRs, blankChar, cur.r, cur.w, cur.m, isCorrectReading]);

  const prevWord = useRef<{w:string;r:string;m:string} | null>(null);
  const prevCorrect = useRef(false);

  const answer = (opt: string) => {
    if (picked) return;
    setPicked(opt);
    const isRight = opt === correctAnswer;
    if (isRight) { setRight(r => r + 1); playSuccess(); }
    else { setWrong(w => w + 1); playError(); }
    prevWord.current = { w: cur.w, r: cur.r, m: cur.m };
    prevCorrect.current = isRight;
    setTimeout(() => {
      if (idx + 1 >= words.length) { setDone(true); return; }
      setIdx(idx + 1); setPicked(null);
    }, 1200);
  };

  useEffect(() => {
    if (idx > 0 && prevWord.current) {
      setLastAnswer({ ...prevWord.current, correct: prevCorrect.current });
    }
  }, [idx]);

  if (done) return (<>
    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center relative">
      {/* Confetti — only on 100% */}
      {wrong === 0 && <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{zIndex:50}}>
        {(()=>{const origins=Array.from({length:12},()=>({ox:Math.random()*90+5+"%",oy:Math.random()*90+5+"%"}));return origins;})().
          flatMap(o=>Array.from({length:24},(_,i)=>{
            const angle = Math.random()*Math.PI*2, dist = 30+Math.random()*90;
            const colors = ["#ff6584","#6c63ff","#ffd700","#3f3d56","#ff6584","#6c63ff"];
            return {c:colors[i%6],x:Math.cos(angle)*dist,y:Math.sin(angle)*dist,r:(Math.random()-0.5)*180,i,ox:o.ox,oy:o.oy};
          })).map((p,i)=>(
          <span key={i} className="absolute block" style={{left:p.ox,top:p.oy,width:5,height:2,borderRadius:1,background:p.c,opacity:0.8,
            animation:`confetti 2.2s ease-out forwards`,
            ["--x" as any]:`${p.x}px`,["--y" as any]:`${p.y}px`,["--r" as any]:`${p.r}deg`}} />
        ))}
      </div>}
      {(() => {
        const pct = finalPct;
        const grade = pct >= 90 ? {jp:"完璧！",zh:"完美无缺",c1:"#7C3AED",c2:"#A78BFA"} : pct >= 70 ? {jp:"素晴らしい！",zh:"非常出色",c1:"#4F46E5",c2:"#818CF8"} : pct >= 50 ? {jp:"頑張ったね！",zh:"继续加油",c1:"#059669",c2:"#34D399"} : {jp:"もう少し！",zh:"再来一次",c1:"#EA580C",c2:"#FB923C"};
        const r = 34;
        const circ = 2 * Math.PI * r;
        return (<>
          {/* Floating header card */}
          <div className="relative w-full max-w-[280px]">
            <div className="relative mx-4 -mb-10 rounded-2xl shadow-lg text-white overflow-hidden" style={{background:`linear-gradient(135deg,${grade.c1},${grade.c2})`}}>
              <div className="px-5 py-5 flex items-center gap-4">
                {/* Ring chart */}
                <div className="relative w-[80px] h-[80px] shrink-0">
                  <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                    <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="6" />
                    <circle cx="40" cy="40" r={r} fill="none" stroke="white" strokeWidth="6" strokeLinecap="round"
                      strokeDasharray={circ} strokeDashoffset={circ - (circ * animPct) / 100} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-extrabold">{animPct}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-extrabold">{grade.jp}</p>
                  <p className="text-xs opacity-80">{grade.zh}</p>
                </div>
              </div>
            </div>

            {/* Stats card body */}
            <div className="bg-surface rounded-2xl shadow-sm border border-border pt-12 px-5 pb-5">
              <div className="flex items-center justify-center gap-5">
                <div className="text-center">
                  <p className="text-xl font-extrabold" style={{color:"var(--color-success-bright)"}}>{right}</p>
                  <p className="text-[10px] text-hint">正解</p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="text-center">
                  <p className="text-xl font-extrabold" style={{color: wrong > 0 ? "var(--color-danger)" : "var(--color-text-tertiary)"}}>{wrong}</p>
                  <p className="text-[10px] text-hint">不正解</p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="text-center">
                  <p className="text-xl font-extrabold text-main">{words.length}</p>
                  <p className="text-[10px] text-hint">総数</p>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-5">
                {onRetry && <button onClick={onRetry} className="w-full py-2.5 rounded-xl text-sm font-bold text-white active:scale-95" style={{background:`linear-gradient(135deg,${grade.c1},${grade.c2})`}}>再来一次</button>}
                {onReplay && <button onClick={onReplay} className="w-full py-2.5 rounded-xl text-sm font-bold text-primary active:scale-95 bg-primary/10 border border-primary/20">换一批单词</button>}
                <button onClick={()=>onBack()} className="w-full py-2.5 rounded-xl text-sm font-bold text-hint active:scale-95">返回</button>
              </div>
            </div>
          </div>
        </>);
      })()}
    </div>
  </>);

  const remaining = words.length - idx - 1;

  // ── Wuxia Quiz Header ──
  if (mode === "zh2jp") return (<div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-bg">
    <header className="relative z-10 shrink-0 px-4 pt-4 pb-3">
      <div className="flex items-center justify-between gap-3">
        <button onClick={()=>onBack()} className="-ml-1 flex items-center gap-1 rounded-sm px-1.5 py-1 text-hint transition-colors active:text-main">
          <ArrowLeft size={16} stroke="currentColor"/><span className="font-serif text-sm tracking-[0.2em]">戻る</span>
        </button>
        <h1 className="font-serif text-[17px] font-semibold tracking-[0.32em] text-main">仮名選詞</h1>
        <div className="flex items-baseline gap-1.5">
          <span className="font-serif text-[11px] tracking-[0.15em] text-hint">残</span>
          <span className="font-serif text-lg leading-none font-semibold text-primary tabular-nums">{remaining}</span>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"/>
        <span className="font-serif text-[10px] tracking-[0.25em] text-hint/40">修羅 · 選詞</span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"/>
      </div>
      <div className="mt-3 flex gap-1">
        {Array.from({length:words.length}).map((_,i)=>(<span key={i} className={`h-[3px] flex-1 rounded-full transition-colors duration-500 ${i<=idx?"bg-primary/70":"bg-border/30"}`}/>))}
      </div>
      <div className={`overflow-hidden transition-all duration-300 ${lastAnswer?"max-h-8 opacity-100 mt-2":"max-h-0 opacity-0"}`}>
        {lastAnswer&&<p className="text-center leading-tight" style={{color:lastAnswer.correct?"var(--color-success-bright)":"var(--color-danger)"}}>{lastAnswer.correct?<span className="font-serif text-[11px] tracking-wider">正</span>:<span className="block text-[10px]">{lastAnswer.r}</span>}</p>}
      </div>
    </header>

    <div className="relative z-10 flex flex-1 flex-col justify-center gap-8 pb-10">
      <div className="flex flex-col items-center px-6 text-center">
        <span className="seal-stamp">{optType==="kanji"?"選漢字":"選中文"}</span>
        <div className="flex flex-col items-center gap-1 mt-6">
          <p className="text-sm text-hint font-medium">{cur.w}</p>
          <LongPressWrapper word={cur.w} reading={cur.r}>
            <div className="flex items-center gap-4">
              <span className="h-8 w-px bg-gradient-to-b from-transparent via-primary/40 to-transparent"/>
              <h2 className="font-serif text-[40px] leading-tight font-medium tracking-[0.08em] text-main break-all">{cur.r}</h2>
              <span className="h-8 w-px bg-gradient-to-b from-transparent via-primary/40 to-transparent"/>
            </div>
          </LongPressWrapper>
        </div>
        <p className="mt-4 text-xs leading-relaxed tracking-[0.14em] text-hint">{optType==="kanji"?"辨其音，择其正解":"辨其音，择其释义"}</p>
      </div>

      <ul className="relative z-10 flex flex-col gap-2.5 px-4">
        {options.map((opt,i)=>{
          const isAnswer=opt===correctAnswer;
          const isPicked=picked===opt;
          const locked=picked!==null;
          const revealCorrect=locked&&isAnswer;
          const revealWrong=locked&&isPicked&&!isAnswer;
          const ordinals=["壹","貳","參","肆"];
          return(<li key={i} className="ink-rise" style={{animationDelay:`${80+i*60}ms`}}>
            <button type="button" disabled={locked} onClick={()=>answer(opt)}
              className={`ink-frame group flex w-full items-center gap-3 rounded-md px-4 py-3.5 text-left transition-all duration-300  ${
                revealCorrect?"bg-primary/10 shadow-[inset_0_0_0_1px_var(--color-primary)]":
                revealWrong?"bg-danger/10 shadow-[inset_0_0_0_1px_var(--color-danger)]":
                locked?"bg-surface/50 opacity-45":"bg-surface border border-border/30 hover:bg-surface"}`}>
              <span className={`flex size-6 shrink-0 items-center justify-center rounded-[2px] border font-serif text-[11px] leading-none transition-colors ${
                revealCorrect?"border-primary/70 bg-primary/20 text-primary":
                revealWrong?"border-danger/70 bg-danger/20 text-danger":
                "border-border/40 bg-bg/50 text-hint"}`}>{ordinals[i]}</span>
              <span className={`flex-1 font-sans text-[15px] tracking-[0.06em] ${revealCorrect?"text-primary":revealWrong?"text-danger":"text-main"}`}>{opt}</span>
              {revealCorrect&&<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-primary shrink-0"><path d="M20 6L9 17l-5-5"/></svg>}
              {revealWrong&&<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-danger shrink-0"><path d="M18 6L6 18M6 6l12 12"/></svg>}
            </button>
          </li>);
        })}
      </ul>
    </div>

    <footer className="relative z-10 shrink-0 pb-6 text-center" style={{paddingBottom:"calc(1.5rem + env(safe-area-inset-bottom, 0px))"}}>
      <p className="font-serif text-[10px] tracking-[0.35em] text-hint/30">一 字 一 劍 · 日 進 其 功</p>
    </footer>
  </div>);

  return (<>
    <div className="flex items-center justify-between px-4 py-2">
      <button onClick={()=>onBack()} className="flex items-center gap-1 text-hint text-sm font-bold active:opacity-60"><ArrowLeft size={16} stroke="var(--color-text-tertiary)" strokeWidth={2}/></button>
      <span className="text-2xl font-semibold tracking-tight text-main">{mode==="zh2jp"?"假名选词":mode==="spell"?"単語找茬":"假名补全"}</span>
      <span className="text-sm font-bold text-hint">残り <span className="text-primary">{remaining}</span></span>
    </div>
    {/* Answer banner */}
    <div className={`overflow-hidden transition-all duration-300 ${lastAnswer ? "max-h-9 opacity-100" : "max-h-0 opacity-0"}`}>
      {lastAnswer && (
        <div className={`flex items-center justify-center gap-2 px-4 py-1 border-b ${lastAnswer.correct ? "bg-success/5 border-success/10" : "bg-danger/5 border-danger/10"}`}>
          <div className="flex flex-col items-center leading-tight" style={{color: lastAnswer.correct ? "var(--color-success-bright)" : "var(--color-danger)"}}>
            <span className="text-[10px]">{lastAnswer.r}</span>
            <span className="font-serif text-sm font-bold">{lastAnswer.w}</span>
          </div>
        </div>
      )}
    </div>
    <div className="flex-1 flex flex-col items-center justify-center px-4">
      {mode === "fillKana" ? (
        <>
          <span className="seal-stamp mb-4">補仮名</span>
          <div className="flex items-center gap-1 mb-3 text-2xl font-extrabold">
            {kanaChars.map((ch, i) => (
              <span key={i} className={i === blankIdx
                ? "w-10 h-10 rounded-xl bg-primary/10 border-2 border-dashed border-primary flex items-center justify-center text-primary"
                : "text-main"}>{i === blankIdx ? (picked || "?") : ch}</span>
            ))}
          </div>
          <p className="text-lg font-bold text-sub mb-4">{cur.w}</p>
          <p className="text-xs text-hint mb-6 tracking-[0.14em]">择其空所，补其正音</p>
          <ul className="grid grid-cols-3 gap-2.5 w-full max-w-[340px]">
            {options.map((opt, i) => {
              const isAnswer = opt === correctAnswer;
              const isPicked = picked === opt;
              const locked = picked !== null;
              const revealCorrect = locked && isAnswer;
              const revealWrong = locked && isPicked && !isAnswer;
              const ordinals = ["壹","貳","參","肆","伍","陸"];
              return (
                <li key={i} className="ink-rise" style={{animationDelay:`${80+i*60}ms`}}>
                  <button type="button" disabled={locked} onClick={()=>answer(opt)}
                    className={`ink-frame group flex w-full items-center justify-center gap-2 rounded-md px-3 py-3.5 text-center transition-colors duration-300 ${
                      revealCorrect?"bg-primary/10 shadow-[inset_0_0_0_1px_var(--color-primary)]":
                      revealWrong?"bg-danger/10 shadow-[inset_0_0_0_1px_var(--color-danger)]":
                      locked?"bg-surface/50 opacity-45":"bg-surface border border-border/30 hover:bg-surface"}`}>
                    <span className={`flex size-5 shrink-0 items-center justify-center rounded-[2px] border font-serif text-[10px] leading-none transition-colors ${
                      revealCorrect?"border-primary/70 bg-primary/20 text-primary":
                      revealWrong?"border-danger/70 bg-danger/20 text-danger":
                      "border-border/40 bg-bg/50 text-hint"}`}>{ordinals[i]}</span>
                    <span className={`font-sans text-[15px] tracking-[0.06em] ${revealCorrect?"text-primary":revealWrong?"text-danger":"text-main"}`}>{opt}</span>
                    {revealCorrect&&<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-primary shrink-0"><path d="M20 6L9 17l-5-5"/></svg>}
                    {revealWrong&&<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-danger shrink-0"><path d="M18 6L6 18M6 6l12 12"/></svg>}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      ) : mode === "zh2jp" ? (
        <div className="flex flex-col items-center flex-1">
          {/* Kana Prompt */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 w-full">
            <span className="seal-stamp">{optType==="kanji"?"選漢字":"選中文"}</span>
            <div className="flex items-center gap-4 mt-6">
              <span className="h-8 w-px bg-gradient-to-b from-transparent via-primary/40 to-transparent"/>
              <h2 className="font-serif text-[40px] leading-tight font-medium tracking-[0.08em] text-main break-all">{cur.r}</h2>
              <span className="h-8 w-px bg-gradient-to-b from-transparent via-primary/40 to-transparent"/>
            </div>
            <p className="mt-4 text-xs leading-relaxed tracking-[0.14em] text-hint">{optType==="kanji"?"辨其音，择其正解":"辨其音，择其释义"}</p>
          </div>

          {/* Answer Options */}
          <ul className="w-full max-w-[320px] flex flex-col gap-2.5 px-4 pb-8">
            {options.map((opt, i) => {
              const isAnswer = opt === correctAnswer;
              const isPicked = picked === opt;
              const locked = picked !== null;
              const revealCorrect = locked && isAnswer;
              const revealWrong = locked && isPicked && !isAnswer;
              const ordinals = ["壹","貳","參","肆"];
              return (
                <li key={i} className="ink-rise" style={{animationDelay:`${80+i*60}ms`}}>
                  <button type="button" disabled={locked} onClick={()=>answer(opt)}
                    className={`ink-frame group flex w-full items-center gap-3 rounded-md px-4 py-3.5 text-left transition-all duration-300  ${
                      revealCorrect ? "bg-primary/14 shadow-[inset_0_0_0_1px_var(--color-primary)]" :
                      revealWrong ? "bg-danger/14 shadow-[inset_0_0_0_1px_var(--color-danger)]" :
                      locked ? "bg-surface/50 opacity-45" : "bg-surface border border-border/40 hover:bg-surface"}`}>
                    <span className={`flex size-6 shrink-0 items-center justify-center rounded-[2px] border font-serif text-[11px] leading-none transition-colors ${
                      revealCorrect ? "border-primary/70 bg-primary/20 text-primary" :
                      revealWrong ? "border-danger/70 bg-danger/20 text-danger" :
                      "border-border/30 bg-bg/50 text-hint"}`}>{ordinals[i]}</span>
                    <span className={`flex-1 font-sans text-[15px] tracking-[0.06em] ${
                      revealCorrect ? "text-primary" : revealWrong ? "text-danger" : "text-main"}`}>{opt}</span>
                    {revealCorrect && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-primary shrink-0"><path d="M20 6L9 17l-5-5"/></svg>}
                    {revealWrong && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-danger shrink-0"><path d="M18 6L6 18M6 6l12 12"/></svg>}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Footer */}
          <p className="text-center font-serif text-[10px] tracking-[0.15em] text-hint/40" style={{paddingBottom:"env(safe-area-inset-bottom, 0px)"}}>一字一劍 · 日進其功</p>
        </div>
      ) : (
        <>
          <span className="seal-stamp mb-4">找茬</span>
          <p className="text-2xl font-extrabold text-main mb-3 tracking-wider break-all">{shownReading}</p>
          <p className="text-lg font-bold text-sub mb-4 break-words">{cur.w}</p>
          <p className="text-xs text-hint mb-6 tracking-[0.14em]">辨其真假，择其正音</p>
          <ul className="grid grid-cols-2 gap-2.5 w-full max-w-[340px]">
            {options.map((opt, i) => {
              const isAnswer = opt === correctAnswer;
              const isPicked = picked === opt;
              const locked = picked !== null;
              const revealCorrect = locked && isAnswer;
              const revealWrong = locked && isPicked && !isAnswer;
              const ordinals = ["壹","貳","參","肆","伍","陸"];
              return (
                <li key={i} className="ink-rise" style={{animationDelay:`${80+i*60}ms`}}>
                  <button type="button" disabled={locked} onClick={()=>answer(opt)}
                    className={`ink-frame group flex w-full items-center justify-center gap-2 rounded-md px-3 py-3.5 text-center transition-colors duration-300 ${
                      revealCorrect?"bg-primary/10 shadow-[inset_0_0_0_1px_var(--color-primary)]":
                      revealWrong?"bg-danger/10 shadow-[inset_0_0_0_1px_var(--color-danger)]":
                      locked?"bg-surface/50 opacity-45":"bg-surface border border-border/30 hover:bg-surface"}`}>
                    <span className={`flex size-5 shrink-0 items-center justify-center rounded-[2px] border font-serif text-[10px] leading-none transition-colors ${
                      revealCorrect?"border-primary/70 bg-primary/20 text-primary":
                      revealWrong?"border-danger/70 bg-danger/20 text-danger":
                      "border-border/40 bg-bg/50 text-hint"}`}>{ordinals[i]}</span>
                    <span className={`font-sans text-[15px] tracking-[0.06em] ${revealCorrect?"text-primary":revealWrong?"text-danger":"text-main"}`}>{opt}</span>
                    {revealCorrect&&<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-primary shrink-0"><path d="M20 6L9 17l-5-5"/></svg>}
                    {revealWrong&&<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-danger shrink-0"><path d="M18 6L6 18M6 6l12 12"/></svg>}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  </>);
}
