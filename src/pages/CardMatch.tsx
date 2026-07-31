import { useState, useMemo, useRef, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import type { Page } from "../components/BottomNav";
import { loadProgress } from "../lib/spaced-repetition";
import { getWordSource } from "../lib/wordSource";
import { addRemembered, addForgotten } from "../lib/wordRecord";

interface Props { onNavigate: (p: Page) => void; }

export default function CardMatch({ onNavigate }: Props) {
  const [idx, setIdx] = useState(0);
  const [swiping, setSwiping] = useState<"left"|"right"|null>(null);
  const [remembered, setRemembered] = useState(0);
  const [forgot, setForgot] = useState(0);
  const [tilt, setTilt] = useState(0);
  const tiltTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tiltRef = useRef(0);

  // Device tilt detection
  useEffect(() => {
    const handler = (e: DeviceOrientationEvent) => {
      const gamma = e.gamma || 0;
      tiltRef.current = gamma;
      setTilt(gamma);
      if (Math.abs(gamma) > 18 && !swiping) {
        if (tiltTimer.current) clearTimeout(tiltTimer.current);
        tiltTimer.current = setTimeout(() => {
          if (Math.abs(tiltRef.current) > 18) {
            doSwipe(gamma > 0 ? "right" : "left");
          }
        }, 400);
      }
    };
    window.addEventListener("deviceorientation", handler);
    return () => window.removeEventListener("deviceorientation", handler);
  }, [swiping]);

  const words = useMemo(() => {
    const progress = loadProgress();
    const studiedIds = new Set(Object.keys(progress).filter(id => progress[id].lastReview));
    const source = getWordSource();
    const pool = source.filter(w => studiedIds.has(w.id)).map(w => ({ w: w.w, r: w.r, m: w.m }));
    // Fisher-Yates shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool;
  }, []);

  const finished = idx >= words.length;
  const current = finished ? words[words.length - 1] : words[idx];
  const next1 = finished ? undefined : words[(idx + 1) % words.length];
  const next2 = finished ? undefined : words[(idx + 2) % words.length];

  if (words.length === 0) {
    return (<>
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={()=>onNavigate("home")} className="flex items-center gap-1.5 text-hint text-xs font-bold active:opacity-60">
          <ArrowLeft size={18} stroke="var(--color-text-tertiary)" strokeWidth={2.5}/>
        </button>
        <span className="text-2xl font-semibold tracking-tight text-main">记忆卡片</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-6 gap-4">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round">
            <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
        </div>
        <p className="text-sm font-bold text-main">还没有学习过的单词</p>
        <p className="text-xs text-hint">先去学习，积累的单词会出现在这里</p>
        <button onClick={()=>onNavigate("study")} className="mt-2 px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-full active:scale-95 transition-transform">
          开始学习
        </button>
      </div>
    </>);
  }

  if (finished) {
    return (<>
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={()=>onNavigate("home")} className="flex items-center gap-1.5 text-hint text-xs font-bold active:opacity-60">
          <ArrowLeft size={18} stroke="var(--color-text-tertiary)" strokeWidth={2.5}/>
        </button>
        <span className="text-2xl font-semibold tracking-tight text-main">记忆卡片</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-6 gap-4">
        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <p className="text-sm font-bold text-main">一轮完成</p>
        <div className="flex gap-6 text-xs font-bold">
          <span className="text-amber-600">记住了 {remembered}</span>
          <span className="text-red-500">忘记了 {forgot}</span>
        </div>
        <button onClick={()=>onNavigate("home")} className="mt-2 px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-full active:scale-95 transition-transform">
          返回首页
        </button>
      </div>
    </>);
  }

  const doSwipe = (dir: "left"|"right") => {
    if (swiping) return;
    setSwiping(dir);
    if (dir === "left") { setRemembered(r => r + 1); addRemembered({ w: current.w, r: current.r, m: current.m }); }
    else { setForgot(f => f + 1); addForgotten({ w: current.w, r: current.r, m: current.m }); }
    setTimeout(() => {
      setIdx(i => i + 1);
      setSwiping(null);
    }, 500);
  };

  return (<>
    <div className="flex items-center justify-between px-4 py-3">
      <button onClick={()=>onNavigate("home")} className="flex items-center gap-1.5 text-hint text-xs font-bold active:opacity-60">
        <ArrowLeft size={18} stroke="var(--color-text-tertiary)" strokeWidth={2.5}/>
      </button>
      <span className="text-2xl font-semibold tracking-tight text-main">记忆卡片</span>
    </div>

    <div className="flex-1 flex flex-col items-center justify-center px-6 relative overflow-hidden" style={{paddingBottom:"calc(1.5rem + env(safe-area-inset-bottom, 0px))"}}>

      {/* Tilt permission prompt (iOS) — disabled for now */}
      {/* {!tiltAllowed && ( ... )} */}

      {/* Folder icon — left side */}
      <div className={`absolute left-6 top-1/2 -translate-y-1/2 transition-all duration-500 z-20 pointer-events-none
        ${swiping==="left" ? "scale-125 opacity-100" : tilt < -12 ? "scale-110 opacity-60" : "scale-75 opacity-0"}`}>
        <div className="w-20 h-20 rounded-2xl bg-amber-100 flex items-center justify-center shadow-lg">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round">
            <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
          </svg>
        </div>
        <p className="text-[10px] font-bold text-amber-600 text-center mt-1">记住了</p>
      </div>

      {/* Trash icon — right side */}
      <div className={`absolute right-6 top-1/2 -translate-y-1/2 transition-all duration-500 z-20 pointer-events-none
        ${swiping==="right" ? "scale-125 opacity-100" : tilt > 12 ? "scale-110 opacity-60" : "scale-75 opacity-0"}`}>
        <div className="w-20 h-20 rounded-2xl bg-red-100 flex items-center justify-center shadow-lg">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
          </svg>
        </div>
        <p className="text-[10px] font-bold text-red-600 text-center mt-1">忘记了</p>
      </div>

      {/* Card stack */}
      <div className="relative w-full max-w-[300px] mx-auto" style={{height:"min(380px, 55dvh)"}}>
        {/* Card 3 */}
        <div className="absolute inset-x-0 top-4 scale-[0.82] translate-y-4 opacity-25">
          <div className="bg-white rounded-3xl shadow-lg" style={{height:"min(340px, 50dvh)"}} />
        </div>
        {/* Card 2 */}
        <div className="absolute inset-x-0 top-2 scale-[0.90] translate-y-2 opacity-50">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden" style={{height:"min(340px, 50dvh)"}}>
            {next1 && (
            <div className="p-6 flex flex-col items-center justify-center h-full">
              <span className="text-sm text-primary">{next1.r}</span>
              <span className="text-3xl font-extrabold text-main mt-4">{next1.w}</span>
              <span className="text-xs text-hint mt-2">{next1.m}</span>
            </div>
            )}
          </div>
        </div>

        {/* Card 1 — front */}
        <div className={`absolute inset-0 transition-all duration-[400ms] ease-out
          ${swiping==="left" ? "-translate-x-[140%] -rotate-[20deg] opacity-0 scale-90" :
            swiping==="right" ? "translate-x-[140%] rotate-[20deg] opacity-0 scale-90" :
            ""}`}
>
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden" style={{height:"min(340px, 50dvh)"}}>
            <div className="absolute top-4 left-4 bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">漢字</div>
            <div className="absolute top-4 right-4 text-[10px] font-bold text-hint/40">{idx + 1}/{words.length}</div>
            <div className="p-6 flex flex-col items-center justify-center h-full">
              <span className="text-lg text-primary font-bold tracking-wider">{current.r}</span>
              <span className="text-4xl font-extrabold text-main mt-4 tracking-wider break-words">{current.w}</span>
              <span className="text-sm text-hint mt-3">{current.m}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom buttons */}
      <div className="flex items-center gap-8 mt-6">
        <button onClick={()=>doSwipe("left")} className="w-14 h-14 rounded-full bg-red-50 shadow-md flex items-center justify-center active:scale-90 transition-all">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div className="text-center">
          <div className="flex gap-3 text-xs font-bold">
            <span className="text-amber-600">✓ {remembered}</span>
            <span className="text-red-500">✗ {forgot}</span>
          </div>
        </div>
        <button onClick={()=>doSwipe("right")} className="w-14 h-14 rounded-full bg-amber-50 shadow-md flex items-center justify-center active:scale-90 transition-all">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
      <p className="text-[10px] text-hint/30 text-center mt-3">← 左倾手机记住 · 右倾手机忘记 →</p>
    </div>
  </>);
}
