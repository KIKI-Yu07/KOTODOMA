import { useState, useMemo } from "react";
import { ArrowLeft, Heart } from "lucide-react";
import type { Page } from "../components/BottomNav";
import { getFavorites, toggleFavorite } from "../lib/favorites";
import { book2Data } from "../data/book2";

interface Props { onNavigate: (p: Page) => void; darkMode?: boolean; }

const book1Words = [
  {id:"1-1",word:"生活",reading:"せいかつ",meaning:"生活"},{id:"1-2",word:"経験",reading:"けいけん",meaning:"经验"},{id:"1-3",word:"出発",reading:"しゅっぱつ",meaning:"出发"},{id:"1-4",word:"到着",reading:"とうちゃく",meaning:"到达"},{id:"1-5",word:"準備",reading:"じゅんび",meaning:"准备"},{id:"1-6",word:"片付ける",reading:"かたづける",meaning:"整理"},{id:"1-7",word:"洗濯",reading:"せんたく",meaning:"洗衣服"},{id:"1-8",word:"掃除",reading:"そうじ",meaning:"打扫"},{id:"1-9",word:"料理",reading:"りょうり",meaning:"烹饪"},{id:"1-10",word:"買い物",reading:"かいもの",meaning:"购物"},{id:"1-11",word:"散歩",reading:"さんぽ",meaning:"散步"},{id:"1-12",word:"通勤",reading:"つうきん",meaning:"通勤"},{id:"2-1",word:"感動",reading:"かんどう",meaning:"感动"},{id:"2-2",word:"緊張",reading:"きんちょう",meaning:"紧张"},{id:"2-3",word:"安心",reading:"あんしん",meaning:"放心"},{id:"2-4",word:"満足",reading:"まんぞく",meaning:"满足"},{id:"2-5",word:"失望",reading:"しつぼう",meaning:"失望"},{id:"2-6",word:"我慢",reading:"がまん",meaning:"忍耐"},{id:"2-7",word:"努力",reading:"どりょく",meaning:"努力"},{id:"2-8",word:"感謝",reading:"かんしゃ",meaning:"感谢"},{id:"2-9",word:"尊敬",reading:"そんけい",meaning:"尊敬"},{id:"2-10",word:"信頼",reading:"しんらい",meaning:"信赖"},
];

const allWords = new Map<string, {w:string;r:string;m:string}>();
book1Words.forEach(w => allWords.set(w.id, {w:w.word,r:w.reading,m:w.meaning}));
book2Data.forEach(ch => ch.words.forEach(w => allWords.set(w.id, {w:w.word,r:w.reading,m:w.meaning})));

export default function FavoritesPage({ onNavigate, darkMode }: Props) {
  const [favs, setFavs] = useState(getFavorites());

  const list = useMemo(() => favs.map(id => ({ id, ...allWords.get(id) })).filter(w => w.w), [favs]);

  const remove = (id: string) => {
    toggleFavorite(id);
    setFavs(getFavorites());
  };

  return (<>
    <div className="flex items-center justify-between px-4 py-3">
      <button onClick={()=>onNavigate("vocab")} className="flex items-center gap-1.5 text-hint text-xs font-bold active:opacity-60">
        <ArrowLeft size={18} stroke="var(--color-text-tertiary)" strokeWidth={2.5}/><span>戻る</span>
      </button>
      <span className="text-sm font-extrabold text-main">お気に入り</span>
      <div className="w-10"/>
    </div>
    <div className="flex-1 overflow-y-auto scroll-area px-4 pb-4">
      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Heart size={40} className="text-hint/30 mb-4" />
          <p className="text-sm font-bold text-hint mb-1">还没有收藏单词</p>
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
