import { useState, useMemo } from "react";
import { ArrowLeft, Heart } from "lucide-react";
import type { Page } from "../components/BottomNav";
import { getFavorites, toggleFavorite } from "../lib/favorites";
import { getAllTextbookWords } from "../lib/wordSource";

interface Props { onNavigate: (p: Page) => void; }

function buildAllWords() {
  const map = new Map<string, {w:string;r:string;m:string}>();
  // Search all textbooks
  getAllTextbookWords().forEach(w => map.set(w.id, {w:w.w,r:w.r,m:w.m}));
  // Search all custom wordbooks
  try {
    const wbs = JSON.parse(localStorage.getItem("wordbooks") || "[]") as any[];
    for (const wb of wbs) {
      for (let i = 0; i < wb.words.length; i++) {
        const w = wb.words[i];
        map.set(`wb_${wb.id}_${i}`, { w: w.word, r: w.reading, m: w.meaning });
      }
    }
  } catch {}
  return map;
}

export default function FavoritesPage({ onNavigate }: Props) {
  const [favs, setFavs] = useState(getFavorites());
  const wordMap = useMemo(() => buildAllWords(), []);

  const list = useMemo(() => favs.map(id => ({ id, ...wordMap.get(id) })).filter(w => w.w), [favs, wordMap]);

  const remove = (id: string) => {
    toggleFavorite(id);
    setFavs(getFavorites());
  };

  return (<>
    <div className="flex items-center justify-between px-4 py-3">
      <button onClick={()=>onNavigate("vocab")} className="flex items-center gap-1.5 text-hint text-xs font-bold active:opacity-60">
        <ArrowLeft size={18} stroke="var(--color-text-tertiary)" strokeWidth={2.5}/>
      </button>
      <span className="text-2xl font-semibold tracking-tight text-main">收藏的单词</span>
    </div>
    <div className="flex-1 overflow-y-auto scroll-area px-4 pb-4">
      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Heart size={40} className="text-hint/30 mb-4" />
          <p className="text-sm font-bold text-hint mb-1">长按题目试试</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {list.map((w: any) => (
            <div key={w.id} className="bg-surface rounded-xl p-4 border border-border/50 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-extrabold text-main">{w.w}</p>
                <p className="text-xs text-primary mt-0.5">{w.r}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-sub">{w.m}</p>
              </div>
              <label className="heart-check shrink-0">
                <input type="checkbox" defaultChecked onChange={()=>remove(w.id)} />
                <div className="heart-mark">
                  <svg viewBox="0 0 256 256"><rect fill="none" height="256" width="256"/><path d="M224.6,51.9a59.5,59.5,0,0,0-43-19.9,60.5,60.5,0,0,0-44,17.6L128,59.1l-7.5-7.4C97.2,28.3,59.2,26.3,35.9,47.4a59.9,59.9,0,0,0-2.3,87l83.1,83.1a15.9,15.9,0,0,0,22.6,0l81-81C243.7,113.2,245.6,75.2,224.6,51.9Z"/></svg>
                </div>
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  </>);
}
