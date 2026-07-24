import { useState, useMemo } from "react";
import { ArrowLeft, Search } from "lucide-react";
import type { Page } from "../components/BottomNav";
import StatusBar from "../components/StatusBar";
import { book2Data } from "../data/book2";

interface SearchPageProps { onNavigate: (p: Page) => void; darkMode?: boolean; }

// Build word database from book2
const allWords = book2Data.flatMap(ch =>
  ch.words.map(w => ({ w: w.word, r: w.reading, m: w.meaning, p: w.pos }))
);

export default function SearchPage({ onNavigate, darkMode }: SearchPageProps) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim();
    return allWords.filter(w => w.w.includes(q) || w.r.includes(q) || w.m.includes(q) || w.p.includes(q));
  }, [query]);

  const highlight = (text: string, q: string) => {
    if (!q) return text;
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
    return parts.map((p, i) => p.toLowerCase() === q.toLowerCase()
      ? `<mark class="bg-[#FFE66D] text-main rounded px-0.5 font-bold">${p}</mark>` : p).join('');
  };

  return (<>
    <StatusBar darkMode={darkMode} />
    <div className="flex items-center justify-between px-4 py-2">
      <button onClick={()=>onNavigate("home")} className="flex items-center gap-1 text-hint text-sm font-bold active:opacity-60">
        <ArrowLeft size={16} stroke="var(--color-text-tertiary)" strokeWidth={2} /><span>戻る</span>
      </button>
      <span className="text-lg font-bold text-main">単語検索</span>
    </div>

    <div className="px-4 pb-4">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-hint" />
        <input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="検索したい単語を入力..."
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface text-main outline-none border border-border focus:border-primary text-sm transition-colors" />
      </div>
    </div>

    <div className="flex-1 overflow-y-auto scroll-area px-4 pb-4">
      {query && results.length === 0 ? (
        <div className="text-center py-12 text-hint text-sm">該当する単語がありません</div>
      ) : !query ? (
        <div className="flex flex-col items-center justify-center py-16 px-8">
          <img src="/icons/search-empty.svg" alt="" className="w-40 h-40 opacity-30 dark:opacity-15 mb-4" />
          <p className="text-hint text-sm">単語を検索してみましょう</p>
        </div>
      ) : (
        <div className="space-y-1">
          {results.map((w,i)=>(
            <div key={i} className="bg-surface rounded-xl p-3 shadow-sm border border-border">
              <div className="flex items-center justify-between">
                <p className="text-sm font-extrabold text-main" dangerouslySetInnerHTML={{ __html: highlight(w.w, query) }} />
                <span className="text-[10px] text-primary bg-primary-subtle px-2 py-0.5 rounded-full font-bold">{w.p}</span>
              </div>
              <p className="text-xs text-primary mt-0.5" dangerouslySetInnerHTML={{ __html: highlight(w.r, query) }} />
              <p className="text-xs text-sub mt-0.5" dangerouslySetInnerHTML={{ __html: highlight(w.m, query) }} />
            </div>
          ))}
        </div>
      )}
    </div>
  </>);
}
