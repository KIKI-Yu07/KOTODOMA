import { useState, useMemo } from "react";
import type { Page } from "../components/BottomNav";
import { getWordSource } from "../lib/wordSource";
import { useLongPress } from "../lib/longPress";
import { toggleFavorite } from "../lib/favorites";

interface SearchPageProps { onNavigate: (p: Page) => void; }

function SearchResult({ w, query }: { w: {id:string;w:string;r:string;m:string;p:string}; query: string }) {
  const handlers = useLongPress(() => toggleFavorite(w.id));
  const highlight = (text: string) => {
    if (!query) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
    return parts.map((p, i) => p.toLowerCase() === query.toLowerCase()
      ? `<mark class="bg-highlight text-main rounded px-0.5 font-bold">${p}</mark>` : p).join('');
  };
  return (
    <div {...handlers} className="bg-surface rounded-xl p-3 shadow-sm border border-border">
      <div className="flex items-center justify-between">
        <p className="text-sm font-extrabold text-main" dangerouslySetInnerHTML={{ __html: highlight(w.w) }} />
        <span className="text-[10px] text-primary bg-primary-subtle px-2 py-0.5 rounded-full font-bold">{w.p}</span>
      </div>
      <p className="text-xs text-primary mt-0.5" dangerouslySetInnerHTML={{ __html: highlight(w.r) }} />
      <p className="text-xs text-sub mt-0.5" dangerouslySetInnerHTML={{ __html: highlight(w.m) }} />
    </div>
  );
}

export default function SearchPage({ onNavigate }: SearchPageProps) {
  const allWords = getWordSource().map(w => ({ id: w.id, w: w.w, r: w.r, m: w.m, p: w.p }));
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim();
    return allWords.filter(w => w.w.includes(q) || w.r.includes(q) || w.m.includes(q) || w.p.includes(q));
  }, [query]);

  return (<>
    <div className="flex items-center justify-center px-4 py-2">
      <span className="text-2xl font-semibold tracking-tight text-main">単語検索</span>
    </div>

    <div className="px-4 pb-4">
      <div className="search-group">
        <svg className="search-icon" aria-hidden="true" viewBox="0 0 24 24">
          <g><path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path></g>
        </svg>
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="検索したい単語を入力..." type="search" className="search-input" />
      </div>
    </div>

    <div className="flex-1 overflow-y-auto scroll-area px-4 pb-4">
      {query && results.length === 0 ? (
        <div className="text-center py-12 text-hint text-sm">該当する単語がありません</div>
      ) : !query ? (
        <div className="flex flex-col items-center justify-center py-16 px-8">
          <img src={`${import.meta.env.BASE_URL}icons/search-empty.svg`} alt="" className="w-40 h-40 opacity-30 mb-4" />
          <p className="text-hint text-sm">単語を検索してみましょう</p>
        </div>
      ) : (
        <div className="space-y-1">
          {results.map((w,i) => (
            <SearchResult key={i} w={w} query={query} />
          ))}
        </div>
      )}
    </div>
  </>);
}
