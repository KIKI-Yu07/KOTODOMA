import { useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import type { Page } from "../components/BottomNav";
import { loadProgress } from "../lib/spaced-repetition";
import { getWordSource } from "../lib/wordSource";

interface Props { onNavigate: (p: Page) => void; }

export default function LearnedWords({ onNavigate }: Props) {
  const words = useMemo(() => {
    const progress = loadProgress();
    const source = getWordSource();
    const wordMap = new Map(source.map(w => [w.id, w]));
    return Object.entries(progress)
      .filter(([, p]) => p.lastReview)
      .map(([id, p]) => ({ ...wordMap.get(id)!, progress: p }))
      .filter(w => w.w)
      .sort((a, b) => b.progress.lastReview.localeCompare(a.progress.lastReview));
  }, []);

  const totalWrong = words.reduce((s, w) => s + w.progress.totalWrong, 0);

  return (<>
    <div className="sticky top-0 z-10 bg-bg flex items-center justify-between px-4 py-3">
      <button onClick={() => onNavigate("vocab")} className="flex items-center gap-1.5 text-hint text-xs font-bold active:opacity-60">
        <ArrowLeft size={18} stroke="var(--color-text-tertiary)" strokeWidth={2.5}/>
      </button>
      <span className="text-2xl font-semibold tracking-tight text-main">已学单词</span>
    </div>

    <div className="flex-1 min-h-0 overflow-y-auto scroll-area px-4 pb-6">
      {words.length === 0 ? (
        <div className="flex flex-col items-center justify-center pt-24 gap-3">
          <p className="text-sm font-bold text-main">还没有学习过的单词</p>
          <p className="text-xs text-hint">完成学习后，单词会出现在这里</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4 mb-3 text-xs text-hint">
            <span>共 <b className="text-main">{words.length}</b> 词</span>
            <span>错误 <b className="text-red-500">{totalWrong}</b></span>
          </div>
          <div className="divide-y divide-border rounded-xl overflow-hidden bg-white">
            {words.map((w) => (
              <div key={w.id} className="px-4 py-3 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-bold text-main truncate">{w.w}</span>
                    <span className="text-[11px] text-primary font-medium shrink-0">{w.p}</span>
                  </div>
                  <p className="text-[13px] text-sub mt-0.5 truncate">{w.r}</p>
                  <p className="text-[13px] text-hint truncate">{w.m}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-2">
                  <span className="text-[11px] text-red-400 font-mono tabular-nums">{w.progress.totalWrong}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  </>);
}
