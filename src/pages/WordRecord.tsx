import { useState, useMemo, useRef } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import type { Page } from "../components/BottomNav";
import { getRemembered, getForgotten, type WordRecord as WR } from "../lib/wordRecord";

interface Props { onNavigate: (p: Page) => void; }

type Tab = "remembered" | "forgotten";

// Left-swipe card with delete
function SwipeDeleteCard({ w, index, onDelete }: { w: WR; index: number; onDelete: () => void }) {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const start = useRef<{ x: number; y: number } | null>(null);
  const axis = useRef<"none"|"x"|"y">("none");
  const moved = useRef(false);

  const handleDelete = () => {
    setDeleting(true);
    setTimeout(onDelete, 300);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    start.current = { x: e.clientX, y: e.clientY };
    axis.current = "none";
    moved.current = false;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!start.current) return;
    const dx = start.current.x - e.clientX;
    const dy = e.clientY - start.current.y;
    if (axis.current === "none") {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      axis.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (axis.current === "x") setDragging(true);
    }
    if (axis.current !== "x") return;
    moved.current = true;
    setOffset(Math.max(0, Math.min(dx, 80)));
  };
  const endDrag = () => {
    if (!start.current) return;
    start.current = null;
    setDragging(false);
    if (offset > 50) handleDelete();
    else setOffset(0);
  };

  return (
    <li className={`relative overflow-hidden rounded-xl ${deleting ? "animate-[pop-out_0.3s_ease-out_forwards]" : ""}`}>
      {/* Delete button behind card */}
      <div className="absolute inset-y-0 right-0 flex items-center">
        <button
          onClick={handleDelete}
          className="h-full w-[80px] bg-red-500 flex items-center justify-center rounded-r-xl active:opacity-80 transition-opacity">
          <Trash2 size={20} stroke="#fff" strokeWidth={2} />
        </button>
      </div>

      {/* Card */}
      <div
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerCancel={endDrag}
        style={{
          transform: `translateX(${-offset}px)`,
          transition: dragging ? "none" : "transform 260ms cubic-bezier(0.22,1,0.36,1)",
        }}
        className="relative bg-white rounded-xl px-4 py-3.5 flex items-center justify-between touch-pan-y select-none">
        <div className="min-w-0 flex-1">
          <span className="text-[11px] text-sub block">{w.r}</span>
          <span className="text-[15px] font-bold text-main block leading-tight">{w.w}</span>
        </div>
        <div className="text-right shrink-0 ml-4">
          <p className="text-[13px] font-medium text-sub">{w.m}</p>
          <p className="text-[10px] text-hint mt-0.5">{w.date}</p>
        </div>
      </div>
    </li>
  );
}

export default function WordRecord({ onNavigate }: Props) {
  const [tab, setTab] = useState<Tab>("remembered");
  const [remembered, setRemembered] = useState(() => getRemembered());
  const [forgotten, setForgotten] = useState(() => getForgotten());

  const list = tab === "remembered" ? remembered : forgotten;

  const handleDelete = (index: number) => {
    if (tab === "remembered") {
      const updated = remembered.filter((_, i) => i !== index);
      setRemembered(updated);
      localStorage.setItem("word_record_remembered", JSON.stringify(updated));
    } else {
      const updated = forgotten.filter((_, i) => i !== index);
      setForgotten(updated);
      localStorage.setItem("word_record_forgotten", JSON.stringify(updated));
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-bg">
      <div className="flex items-center justify-between px-4 py-2">
        <button onClick={() => onNavigate("vocab")}
          className="flex items-center gap-1 text-hint text-sm font-bold active:opacity-60">
          <ArrowLeft size={16} strokeWidth={2} />
        </button>
        <span className="text-2xl font-semibold tracking-tight text-main">单词记录</span>
      </div>

      <div className="flex px-4 gap-2 pb-3">
        <button onClick={() => setTab("remembered")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${
            tab === "remembered" ? "bg-[#1A1A1A] text-white" : "bg-white text-sub border border-border"
          }`}>
          记住了 <span className="font-mono text-xs ml-1">({remembered.length})</span>
        </button>
        <button onClick={() => setTab("forgotten")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${
            tab === "forgotten" ? "bg-[#1A1A1A] text-white" : "bg-white text-sub border border-border"
          }`}>
          忘记了 <span className="font-mono text-xs ml-1">({forgotten.length})</span>
        </button>
      </div>

      {list.length > 0 && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 text-xs text-hint/60 bg-[#F8F8F8] rounded-lg px-3 py-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            <span>左滑删除记录</span>
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto scroll-area px-4 pb-4">
        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm font-bold text-sub mb-1">
              {tab === "remembered" ? "还没有记住的单词" : "还没有忘记的单词"}
            </p>
            <p className="text-xs text-hint">去记忆卡片页面滑动练习吧</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {list.map((w, i) => (
              <SwipeDeleteCard key={`${w.w}-${i}`} w={w} index={i} onDelete={() => handleDelete(i)} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
