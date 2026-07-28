import { useState, useMemo, useRef, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import type { Page } from "../components/BottomNav";
import { loadProgress } from "../lib/spaced-repetition";

interface Props { onNavigate: (p: Page) => void; darkMode?: boolean; }

const fakeWords = [
  {w:"挑戦",r:"ちょうせん",m:"挑战"},{w:"努力",r:"どりょく",m:"努力"},{w:"経験",r:"けいけん",m:"经验"},{w:"確認",r:"かくにん",m:"确认"},{w:"準備",r:"じゅんび",m:"准备"},{w:"安心",r:"あんしん",m:"安心"},{w:"感動",r:"かんどう",m:"感动"},{w:"緊張",r:"きんちょう",m:"紧张"},
];

export default function CardMatch({ onNavigate, darkMode }: Props) {
  const [idx, setIdx] = useState(0);
  const [swiping, setSwiping] = useState<"left"|"right"|null>(null);
  const [remembered, setRemembered] = useState(0);
  const [forgot, setForgot] = useState(0);
  const [tilt, setTilt] = useState(0);
  const [tiltAllowed, setTiltAllowed] = useState(true); // iOS permission disabled for now
  const tiltTimer = useRef<ReturnType<typeof setTimeout>>();
  const tiltRef = useRef(0);

  const requestTilt = () => {
    const D = DeviceOrientationEvent as any;
    if (typeof D.requestPermission === "function") {
      D.requestPermission().then((p: string) => {
        if (p === "granted") setTiltAllowed(true);
      }).catch(() => {
        setTiltAllowed(true); // fallback for older iOS
      });
    } else {
      setTiltAllowed(true);
    }
  };

  // Device tilt detection
  useEffect(() => {
    if (!tiltAllowed) return;
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
  }, [swiping, tiltAllowed]);

  const words = useMemo(() => {
    const progress = loadProgress();
    const studiedIds = new Set(Object.keys(progress).filter(id => progress[id].lastReview));
    let pool = fakeWords.filter(w => !studiedIds.size || studiedIds.has(w.w));
    if (pool.length < 4) pool = fakeWords;
    return pool;
  }, []);

  const current = words[idx % words.length];
  const next1 = words[(idx + 1) % words.length];
  const next2 = words[(idx + 2) % words.length];

  const doSwipe = (dir: "left"|"right") => {
    if (swiping) return;
    setSwiping(dir);
    if (dir === "left") setRemembered(r => r + 1);
    else setForgot(f => f + 1);
    setTimeout(() => {
      setIdx(i => i + 1);
      setSwiping(null);
    }, 500);
  };

  return (<>
    <div className="flex items-center justify-between px-4 py-3">
      <button onClick={()=>onNavigate("home")} className="flex items-center gap-1.5 text-hint text-xs font-bold active:opacity-60">
        <ArrowLeft size={18} stroke="var(--color-text-tertiary)" strokeWidth={2.5}/><span>戻る</span>
      </button>
      <span className="text-lg font-extrabold text-main">记忆卡片</span>
    </div>

    <div className="flex-1 flex flex-col items-center justify-center px-6 pb-6 relative overflow-hidden">

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
      <div className="relative w-full max-w-[300px]" style={{height:380}}>
        {/* Card 3 */}
        <div className="absolute inset-x-0 top-4 scale-[0.82] translate-y-4 opacity-25">
          <div className="bg-white rounded-3xl shadow-lg h-[340px]" />
        </div>
        {/* Card 2 */}
        <div className="absolute inset-x-0 top-2 scale-[0.90] translate-y-2 opacity-50">
          <div className="bg-white rounded-3xl shadow-xl h-[340px] overflow-hidden">
            <div className="p-6 flex flex-col items-center justify-center h-full">
              <span className="text-sm text-primary">{next1.r}</span>
              <span className="text-3xl font-extrabold text-main mt-4">{next1.w}</span>
              <span className="text-xs text-hint mt-2">{next1.m}</span>
            </div>
          </div>
        </div>

        {/* Card 1 — front */}
        <div className={`absolute inset-0 transition-all duration-[400ms] ease-out
          ${swiping==="left" ? "-translate-x-[140%] -rotate-[20deg] opacity-0 scale-90" :
            swiping==="right" ? "translate-x-[140%] rotate-[20deg] opacity-0 scale-90" :
            ""}`}
>
          <div className="bg-white rounded-3xl shadow-2xl h-[340px] overflow-hidden">
            <div className="absolute top-4 left-4 bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">漢字</div>
            <div className="absolute top-4 right-4 text-[10px] font-bold text-hint/40">{idx + 1}/{words.length}</div>
            <div className="p-6 flex flex-col items-center justify-center h-full">
              <span className="text-lg text-primary font-bold tracking-wider">{current.r}</span>
              <span className="text-4xl font-extrabold text-main mt-4 tracking-wider">{current.w}</span>
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
      <p className="text-[10px] text-hint/30 text-center mt-3">← 左倾记住 · 右倾忘记 →</p>
    </div>
  </>);
}
