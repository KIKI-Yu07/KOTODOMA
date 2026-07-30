import { useState, useMemo, useRef, useCallback } from "react";
import { ArrowLeft, Check, RotateCcw } from "lucide-react";
import type { Page } from "../components/BottomNav";
import { getWordSource, type WordEntry } from "../lib/wordSource";
import { isFavorite, toggleFavorite } from "../lib/favorites";

interface Props { onNavigate: (p: Page) => void; }

type MaskField = "word" | "kana" | "meaning" | "both";

export default function ListReview({ onNavigate }: Props) {
  const [masks, setMasks] = useState<Record<string, Set<MaskField>>>({});
  const [knownIds, setKnownIds] = useState<Set<string>>(new Set());
  const [animIds, setAnimIds] = useState<Set<string>>(new Set());
  const [menuOpen, setMenuOpen] = useState(false);
  const [mode, setMode] = useState<MaskField>("meaning");

  const selectedIds = useMemo(() => {
    try { return new Set(JSON.parse(localStorage.getItem("wl_selected") || "[]") as string[]); }
    catch { return new Set<string>(); }
  }, []);

  const allWords = useMemo(() => getWordSource(), []);
  const words = useMemo(() => allWords.filter(w => selectedIds.has(w.id)), [allWords, selectedIds]);

  const isMasked = (id: string, field: MaskField) => {
    if (mode === "both") return (field === "word" || field === "meaning") && !masks[id]?.has(field);
    return field === mode && !masks[id]?.has(field);
  };

  const toggleMask = (id: string, field: MaskField) => {
    setMasks(prev => {
      const next = { ...prev };
      const s = new Set(prev[id]);
      s.has(field) ? s.delete(field) : s.add(field);
      next[id] = s;
      return next;
    });
  };

  const markKnown = (id: string) => setKnownIds(p => { const n = new Set(p); n.add(id); return n; });
  const restoreWord = (id: string) => { setKnownIds(p => { const n = new Set(p); n.delete(id); return n; }); setAnimIds(p => { const n = new Set(p); n.add(id); return n; }); };

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-bg">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-bg sticky top-0 z-10">
        <button onClick={() => onNavigate("wordlist")}
          className="flex items-center gap-1 text-main active:opacity-60">
          <ArrowLeft size={20} strokeWidth={1.5} />
        </button>
        <span className="text-2xl font-semibold tracking-tight text-main">列表刷词</span>
      </div>

      {/* Swipe hint + dropdown */}
      <div className="px-5 pb-2 flex items-center gap-2">
        <div className="flex items-center gap-2 text-xs text-hint/60 bg-surface-hover rounded-lg px-3 py-2 flex-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          <span>向右滑动卡片标记为已掌握</span>
        </div>
        <div className="relative shrink-0">
          <label className="dropdown-btn" onClick={(e) => e.stopPropagation()}>
            {mode === "word" ? "遮挡单词" : mode === "kana" ? "遮挡读音" : mode === "meaning" ? "遮挡释义" : "遮挡单词+释义"}
            <input className="dd-inp" type="checkbox" checked={menuOpen} onChange={(e) => setMenuOpen(e.target.checked)} />
            <div className="dd-bar">
              <span className="dd-bar-list dd-top" />
              <span className="dd-bar-list dd-middle" />
              <span className="dd-bar-list dd-bottom" />
            </div>
          </label>
          <div className={`dd-menu-container ${menuOpen ? "" : "dd-closed"}`} style={{position:"absolute",width:"100%",left:0,top:"120%",zIndex:50}}>
            {([["word","遮挡单词"],["kana","遮挡读音"],["meaning","遮挡释义"],["both","遮挡单词+释义"]] as const).map(([k,label]) => (
              <div key={k} className={`dd-menu-item ${mode === k ? "font-bold" : ""}`}
                onClick={(e) => { e.stopPropagation(); setMode(k as MaskField); setMenuOpen(false); setMasks({}); }}>
                {label}
              </div>
            ))}
            <div className="dd-menu-item text-hint"
              onClick={(e) => { e.stopPropagation(); setMasks({}); setKnownIds(new Set()); setMenuOpen(false); }}>
              重置所有
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 min-h-0 overflow-y-auto scroll-area px-4 pb-4">
        {words.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-hint/30 text-5xl mb-3">📝</span>
            <p className="text-sm font-bold text-sub">未选择单词</p>
            <p className="text-xs text-hint mt-1">请在上个页面选择要学习的单词</p>
          </div>
        ) : (
          <ul className="space-y-3 pt-2">
            {words.map((w, index) => {
              const known = knownIds.has(w.id);

              if (known) {
                return (
                  <li key={w.id} className="animate-pop-in flex items-center gap-3 rounded-2xl border border-primary/15 bg-primary/[0.03] px-4 py-2.5">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                    <span className="min-w-0 flex-1 truncate font-serif text-base font-semibold text-main/70">
                      {w.w}
                      <span className="ml-2 font-sans text-xs font-normal text-sub">{w.m}</span>
                    </span>
                    <button onClick={() => restoreWord(w.id)}
                      className="flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs text-hint hover:text-main">
                      <RotateCcw className="size-3.5" strokeWidth={1.75} />撤销
                    </button>
                  </li>
                );
              }

              const justRestored = animIds.has(w.id);
              return <SwipeWordCard key={w.id} index={index} word={w} animIn={justRestored}
                isMasked={(f: MaskField) => isMasked(w.id, f)}
                onToggle={(f: MaskField) => toggleMask(w.id, f)}
                onKnown={() => markKnown(w.id)}
              />;
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

// ── SwipeWordCard with right-swipe to mark known ──
const THRESHOLD = 88;
const MAX_OFFSET = 132;

function SwipeWordCard({ index, word, isMasked, onToggle, onKnown, animIn }: {
  index: number; word: WordEntry; isMasked: (f: MaskField) => boolean; onToggle: (f: MaskField) => void; onKnown: () => void; animIn?: boolean;
}) {
  const [favKey, setFavKey] = useState(0);
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const start = useRef<{ x: number; y: number } | null>(null);
  const axis = useRef<"none" | "x" | "y">("none");
  const moved = useRef(false);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    start.current = { x: e.clientX, y: e.clientY };
    axis.current = "none";
    moved.current = false;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!start.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    if (axis.current === "none") {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      axis.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (axis.current === "x") setDragging(true);
    }
    if (axis.current !== "x") return;
    moved.current = true;
    const eased = dx <= THRESHOLD ? dx : THRESHOLD + (dx - THRESHOLD) * 0.35;
    setOffset(Math.max(0, Math.min(eased, MAX_OFFSET)));
  };

  const endDrag = () => {
    if (!start.current) return;
    start.current = null;
    setDragging(false);
    if (offset >= THRESHOLD) { setOffset(0); onKnown(); }
    else setOffset(0);
  };

  const onClickCapture = (e: React.MouseEvent) => {
    if (moved.current) { e.preventDefault(); e.stopPropagation(); moved.current = false; }
  };

  const progress = Math.min(offset / THRESHOLD, 1);

  return (
    <li className={`relative overflow-hidden rounded-2xl ${animIn ? "animate-pop-in" : ""}`}>
      {/* Swipe reveal background */}
      <div aria-hidden="true" className="absolute inset-0 flex items-center gap-2 rounded-2xl bg-surface-subtle px-5 text-primary" style={{ opacity: progress }}>
        <span className="flex size-6 items-center justify-center rounded-full bg-primary text-white transition-transform" style={{ transform: `scale(${0.7 + progress * 0.3})` }}>
          <Check className="size-3.5" strokeWidth={3} />
        </span>
        <span className="text-sm font-medium">{progress >= 1 ? "松手记为已掌握" : "记住了"}</span>
      </div>

      {/* Card */}
      <div
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
        style={{ transform: `translateX(${offset}px)`, transition: dragging ? "none" : "transform 260ms cubic-bezier(0.22,1,0.36,1)" }}
        className="relative touch-pan-y select-none rounded-2xl border border-border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] px-4 py-3">
        <div className="flex items-start gap-4">
          <span className="mt-1 w-5 shrink-0 font-mono text-[11px] tabular-nums text-sub">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="min-w-0 flex-1">
            <MaskBlock masked={isMasked("kana")} onToggle={() => onToggle("kana")} className="mb-1">
              <span className="text-sm tracking-wide text-sub">{word.r}</span>
            </MaskBlock>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <MaskBlock masked={isMasked("word")} onToggle={() => onToggle("word")}>
                <span className="font-serif text-xl font-semibold leading-tight tracking-tight text-main">{word.w}</span>
              </MaskBlock>
              {word.p && <span className="rounded-full border border-border px-2 py-0.5 text-[11px] leading-4 text-sub">{word.p}</span>}
            </div>
            <div className="mt-1.5 flex items-start gap-2">
              <span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-primary" />
              <MaskBlock masked={isMasked("meaning")} onToggle={() => onToggle("meaning")}>
                <span className="text-[15px] leading-relaxed text-main/70">{word.m}</span>
              </MaskBlock>
            </div>
          </div>
          <div className="list-heart mt-0.5 shrink-0" title="收藏" onClick={(e) => e.stopPropagation()}>
            <input className="lh-check" type="checkbox" checked={isFavorite(word.id)} onChange={() => { toggleFavorite(word.id); setFavKey(k => k + 1); }} />
            <div className="lh-svg-wrap">
              <svg className="lh-outline" viewBox="0 0 24 24" width="18" height="18">
                <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Zm-3.585,18.4a2.973,2.973,0,0,1-3.83,0C4.947,16.006,2,11.87,2,8.967a4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,11,8.967a1,1,0,0,0,2,0,4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,22,8.967C22,11.87,19.053,16.006,13.915,20.313Z"/>
              </svg>
              <svg className="lh-filled" viewBox="0 0 24 24" width="18" height="18">
                <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Z"/>
              </svg>
              <svg className="lh-celebrate" viewBox="0 0 100 100" width="30" height="30">
                <polygon points="10,10 20,20"/><polygon points="10,50 20,50"/><polygon points="20,80 30,70"/>
                <polygon points="90,10 80,20"/><polygon points="90,50 80,50"/><polygon points="80,80 70,70"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

// Mask effect: opacity 0 + blur when hidden, gray overlay
function MaskBlock({ masked, onToggle, children, className = "" }: {
  masked: boolean; onToggle: () => void; children: React.ReactNode; className?: string;
}) {
  return (
    <button
      type="button" onClick={onToggle}
      className={`group relative inline-flex max-w-full items-center rounded-md text-left align-middle transition-colors duration-200 ${className}`}>
      <span className={`transition-[opacity,filter] duration-200 ${
        masked ? "pointer-events-none select-none opacity-0 blur-[2px]" : "opacity-100"
      }`}>
        {children}
      </span>
      <span aria-hidden="true"
        className={`absolute inset-y-[8%] -inset-x-1.5 rounded-md bg-disabled-dark transition-[opacity,transform] duration-200 ease-out ${
          masked ? "scale-100 opacity-100 group-hover:bg-surface-gray group-active:scale-[0.98]" : "scale-95 opacity-0"
        }`} />
    </button>
  );
}
