import { useState, useMemo, useEffect, useRef } from "react";
import { ArrowLeft, Zap } from "lucide-react";
import type { Page } from "../components/BottomNav";

interface GameWord { w: string; r: string; m: string; }

interface Props { onNavigate: (p: Page) => void; onBack: () => void; onReplay?: () => void; onRetry?: () => void; darkMode?: boolean; mode: "zh2jp" | "spell" | "fillKana"; words: GameWord[]; }

function shuffle<T>(arr: T[]): T[] { const a = [...arr]; for (let i = a.length-1; i>0; i--) { const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

const kanaPool = "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ";
const allKana = Array.from(kanaPool);

export default function MatchGame({ onNavigate, onBack, onReplay, onRetry, darkMode, mode, words: wordPool }: Props) {
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
  const shownReading = useMemo(() => {
    if (isCorrectReading) return cur.r;
    const chars = Array.from(cur.r);
    if (chars.length < 2) return cur.r;
    const pos = Math.floor(Math.random() * chars.length);
    const pool = shuffle(allKana.filter(k => k !== chars[pos]));
    chars[pos] = pool[0];
    return chars.join("");
  }, [idx, cur.r, isCorrectReading]);

  const [options, correctAnswer, optType, isNoError] = useMemo(() => {
    if (mode === "fillKana") {
      const wrongs = shuffle(allKana.filter(k => k !== blankChar)).slice(0, 5);
      return [shuffle([blankChar, ...wrongs]), blankChar, "kana", false] as const;
    }
    if (mode === "spell") {
      const chars = Array.from(cur.r);
      const wrongs: string[] = [];
      const used = new Set([cur.r]);
      for (let attempt = 0; attempt < 20 && wrongs.length < 3; attempt++) {
        const a = [...chars];
        const pos = Math.floor(Math.random() * a.length);
        const rep = shuffle(allKana.filter(k => k !== a[pos]))[0];
        a[pos] = rep;
        const s = a.join("");
        if (!used.has(s)) { used.add(s); wrongs.push(s); }
      }
      if (isCorrectReading) {
        return [shuffle(wrongs).concat(["读音正确"]), "读音正确", "spell", true] as const;
      }
      return [shuffle([cur.r, ...wrongs]).concat(["读音正确"]), cur.r, "spell", false] as const;
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
    if (isRight) setRight(r => r + 1);
    else setWrong(w => w + 1);
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
                  <p className="text-xl font-extrabold" style={{color:"#22c55e"}}>{right}</p>
                  <p className="text-[10px] text-hint">正解</p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="text-center">
                  <p className="text-xl font-extrabold" style={{color: wrong > 0 ? "#ef4444" : "var(--color-text-tertiary)"}}>{wrong}</p>
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

  return (<>
    <div className="flex items-center justify-between px-4 py-2">
      <button onClick={()=>onBack()} className="flex items-center gap-1 text-hint text-sm font-bold active:opacity-60"><ArrowLeft size={16} stroke="var(--color-text-tertiary)" strokeWidth={2}/><span>戻る</span></button>
      <span className="text-lg font-bold text-main">{mode==="zh2jp"?"假名选词":mode==="spell"?"単語找茬":"假名补全"}</span>
      <span className="text-sm font-bold text-hint">残り <span className="text-primary">{words.length - idx - 1}</span></span>
    </div>
    {/* Answer banner */}
    <div className={`overflow-hidden transition-all duration-300 ${lastAnswer ? "max-h-9 opacity-100" : "max-h-0 opacity-0"}`}>
      {lastAnswer && (
        <div className={`flex items-center justify-center gap-2 px-4 py-1 border-b ${lastAnswer.correct ? "bg-success/5 border-success/10" : "bg-danger/5 border-danger/10"}`}>
          <span className="text-[10px] font-bold" style={{color: lastAnswer.correct ? "#22c55e" : "#ef4444"}}>{lastAnswer.correct ? "✓" : "✗"}</span>
          <div className="flex flex-col items-center leading-tight">
            <span className="text-[10px] text-primary">{lastAnswer.r}</span>
            <span className="font-serif text-sm font-bold text-main">{lastAnswer.w}</span>
          </div>
          <span className="text-[11px] text-hint">{lastAnswer.m}</span>
        </div>
      )}
    </div>
    <div className="flex-1 flex flex-col items-center justify-center px-4">
      {mode === "fillKana" ? (
        <>
          <div className="flex items-center gap-1 mb-3 text-2xl font-extrabold">
            {kanaChars.map((ch, i) => (
              <span key={i} className={i === blankIdx
                ? "w-10 h-10 rounded-xl bg-primary/10 border-2 border-dashed border-primary flex items-center justify-center text-primary"
                : "text-main"}>{i === blankIdx ? (picked || "?") : ch}</span>
            ))}
          </div>
          <p className="text-lg font-bold text-sub mb-8">{cur.w}</p>
          <p className="text-xs text-hint mb-6">选出缺失的假名</p>
          <div className="grid grid-cols-3 gap-2.5 w-full max-w-[300px]">
            {options.map((opt, i) => {
              const isCorrect = opt === correctAnswer;
              const isPicked = picked === opt;
              const show = picked !== null;
              const highlight = show && (isCorrect || isPicked);
              return (
                <button key={i} onClick={()=>answer(opt)}
                  className={`relative h-[54px] rounded-2xl font-bold text-xl flex items-center justify-center transition-all duration-200 active:scale-[0.97] shadow-sm overflow-hidden
                    ${show ? (isCorrect ? "bg-success/8 border-2 border-success text-success" : isPicked ? "bg-danger/8 border-2 border-danger text-danger" : "opacity-25 bg-surface border border-border/60 text-main") : "bg-surface border border-border/60 text-main hover:border-primary/30 hover:bg-primary-subtle/50"}`}>
                  {highlight && (
                    <svg className="absolute left-0 top-0 h-full" width="8" viewBox="0 0 8 54" preserveAspectRatio="none">
                      <path d="M 5 0 Q 2.5 3.4 5 6.8 T 5 13.6 Q 2.5 17 5 20.4 T 5 27.2 Q 2.5 30.6 5 34 T 5 40.8 Q 2.5 44.2 5 47.6 T 5 54 L 0 54 L 0 0 Z" fill={isCorrect ? "#22c55e" : "#ef4444"} />
                    </svg>
                  )}
                  {highlight && (
                    <span className="absolute top-0.5 right-0.5 text-xs leading-none" style={{color: isCorrect ? "#22c55e" : "#ef4444"}}>
                      {isCorrect ? "✓" : "✗"}
                    </span>
                  )}
                  {opt}
                </button>
              );
            })}
          </div>
        </>
      ) : mode === "zh2jp" ? (
        <>
          <p className="text-2xl font-extrabold text-main mb-8">{cur.r}</p>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{backgroundColor: optType==="kanji"?"#EFF6FF":"#FFF7ED", color: optType==="kanji"?"#3B82F6":"#F97316"}}>
              {optType === "kanji" ? "选汉字" : "选中文"}
            </span>
          </div>
          <p className="text-xs text-hint mb-6">{optType==="kanji"?"选出正确日语汉字":"选出正确中文释义"}</p>
          <div className="w-full max-w-[320px] space-y-2.5">
            <div className="grid grid-cols-3 gap-2.5">
              {options.map((opt, i) => {
                const isCorrect = opt === correctAnswer;
                const isPicked = picked === opt;
                const show = picked !== null;
                const highlight = show && (isCorrect || isPicked);
                return (
                  <button key={i} onClick={()=>answer(opt)}
                    className={`relative h-[64px] rounded-2xl font-bold text-[15px] flex items-center justify-center px-2 transition-all duration-200 active:scale-[0.97] shadow-sm overflow-hidden
                      ${show ? (isCorrect ? "bg-success/8 border-2 border-success text-success" : isPicked ? "bg-danger/8 border-2 border-danger text-danger" : "opacity-25 bg-surface border border-border/60 text-main") : "bg-surface border border-border/60 text-main hover:border-primary/30 hover:bg-primary-subtle/50"}`}>
                    {/* Wave edge */}
                    {highlight && (
                      <svg className="absolute left-0 top-0 h-full" width="8" viewBox="0 0 8 64" preserveAspectRatio="none">
                        <path d="M 5 0 Q 2.5 4 5 8 T 5 16 Q 2.5 20 5 24 T 5 32 Q 2.5 36 5 40 T 5 48 Q 2.5 52 5 56 T 5 64 L 0 64 L 0 0 Z" fill={isCorrect ? "#22c55e" : "#ef4444"} />
                      </svg>
                    )}
                    {/* Check / X icon */}
                    {highlight && (
                      <span className="absolute top-0.5 right-0.5 text-xs leading-none" style={{color: isCorrect ? "#22c55e" : "#ef4444"}}>
                        {isCorrect ? "✓" : "✗"}
                      </span>
                    )}
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <>
          <p className="text-2xl font-extrabold text-main mb-2">{shownReading}</p>
          <p className="text-lg font-bold text-sub mb-6">{cur.w}</p>
          <p className="text-xs text-hint mb-6">判断读音是否正确，选出正确答案</p>
          <div className="w-full max-w-[320px] space-y-2.5">
            <div className="grid grid-cols-3 gap-2.5">
              {options.map((opt, i) => {
                const isCorrect = opt === correctAnswer;
                const isPicked = picked === opt;
                const show = picked !== null;
                const highlight = show && (isCorrect || isPicked);
                return (
                  <button key={i} onClick={()=>answer(opt)}
                    className={`relative h-[64px] rounded-2xl font-bold text-[15px] flex items-center justify-center px-2 transition-all duration-200 active:scale-[0.97] shadow-sm overflow-hidden
                      ${show ? (isCorrect ? "bg-success/8 border-2 border-success text-success" : isPicked ? "bg-danger/8 border-2 border-danger text-danger" : "opacity-25 bg-surface border border-border/60 text-main") : "bg-surface border border-border/60 text-main hover:border-primary/30 hover:bg-primary-subtle/50"}`}>
                    {/* Wave edge */}
                    {highlight && (
                      <svg className="absolute left-0 top-0 h-full" width="8" viewBox="0 0 8 64" preserveAspectRatio="none">
                        <path d="M 5 0 Q 2.5 4 5 8 T 5 16 Q 2.5 20 5 24 T 5 32 Q 2.5 36 5 40 T 5 48 Q 2.5 52 5 56 T 5 64 L 0 64 L 0 0 Z" fill={isCorrect ? "#22c55e" : "#ef4444"} />
                      </svg>
                    )}
                    {/* Check / X icon */}
                    {highlight && (
                      <span className="absolute top-0.5 right-0.5 text-xs leading-none" style={{color: isCorrect ? "#22c55e" : "#ef4444"}}>
                        {isCorrect ? "✓" : "✗"}
                      </span>
                    )}
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  </>);
}
