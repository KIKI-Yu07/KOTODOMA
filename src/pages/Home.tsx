import { useState } from "react";
import { Settings, Search } from "lucide-react";
import type { Page } from "../components/BottomNav";
import StatusBar from "../components/StatusBar";
import { getReviewCount } from "../lib/spaced-repetition";
import { getNickname, getAvatar } from "../lib/userStore";

interface HomeProps { onNavigate: (p: Page) => void; darkMode: boolean; onToggleDark: () => void; }

const quotes = [
  { jp:"継続は力なり",rn:"けいぞくはちからなり",zh:"坚持就是力量" },
  { jp:"千里の道も一歩から",rn:"せんりのみちもいっぽから",zh:"千里之行始于足下" },
  { jp:"習うより慣れろ",rn:"ならうよりなれろ",zh:"熟能生巧" },
  { jp:"一念岩をも通す",rn:"いちねんいわをもとおす",zh:"精诚所至金石为开" },
];

export default function Home({ onNavigate, darkMode, onToggleDark }: HomeProps) {
  const [dailyGoal] = useState(() => parseInt(localStorage.getItem("dailyGoal")||"15"));
  const reviewCount = getReviewCount();
  const nick = getNickname();
  const av = getAvatar();
  const studyDays = parseInt(localStorage.getItem("studyDays")||"0");
  const todayWord = quotes[new Date().getDate() % quotes.length];

  return (
    <div className="flex-1 min-h-0 overflow-y-auto scroll-area bg-bg">
      <StatusBar darkMode={darkMode} />

      {/* Hero */}
      <div className="pattern-hero overflow-hidden dark:bg-[#1A2A4A]">
        <div className="relative z-10 px-5 pt-3 pb-5">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-3">
              {av ? <img src={av} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-white/15" /> :
               <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold text-white ring-2 ring-white/15">{(nick||"小")[0]}</div>}
              <div>
                <p className="text-white/60 text-xs">{studyDays > 0 ? `已坚持 ${studyDays} 天` : "こんにちは"}</p>
                <h1 className="text-white text-lg font-bold">{nick}</h1>
              </div>
            </div>
            <button onClick={()=>onNavigate("search")} className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center active:scale-90">
              <Search size={16} stroke="white" />
            </button>
          </div>

          {/* Challenge Card */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-4 text-center border border-white/10">
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider mb-1">Daily Target</p>
            <h2 className="text-white text-xl font-extrabold mb-3">今日の学習目標</h2>
            <div className="flex justify-center gap-6 mb-3">
              <div className="text-center"><p className="text-white text-3xl font-extrabold">{dailyGoal}</p><p className="text-white/40 text-[10px]">新学</p></div>
              <div className="w-px bg-white/10"/>
              <div className="text-center"><p className="text-white text-3xl font-extrabold">{reviewCount}</p><p className="text-white/40 text-[10px]">复习</p></div>
              <div className="w-px bg-white/10"/>
              <div className="text-center"><p className="text-[#FFD700] text-3xl font-extrabold">{studyDays}</p><p className="text-white/40 text-[10px]">坚持</p></div>
            </div>
            <button onClick={()=>{
              const today = new Date().toISOString().slice(0,10);
              const last = localStorage.getItem("lastStudyDate")||"";
              onNavigate(last===today?"rest":"study");
            }} className="w-full py-3 bg-white text-[#0F64B5] rounded-full font-extrabold text-base active:scale-[0.97]">
              学習を始める
            </button>
            <div className="flex justify-center gap-3 mt-2">
              <button onClick={()=>onNavigate("settings")} className="text-white/40 text-[10px] font-bold active:text-white/70">
                <Settings size={10} className="inline mr-1" />目標設定
              </button>
              <button onClick={()=>{localStorage.clear();location.reload()}} className="text-white/30 text-[10px] active:text-white/60">
                リセット
              </button>
            </div>
          </div>
        </div>
        <div className="h-5 bg-bg rounded-t-[20px]"/>
      </div>

      {/* Content */}
      <div className="px-5 pb-4 space-y-3 -mt-2">

        {/* Today's Quote */}
        <div className="bg-white dark:bg-surface rounded-2xl p-4 shadow-sm border border-border relative overflow-hidden">
          <img src={`/icons/d${new Date().getDay()}.svg`} alt="" className="absolute right-2 bottom-0 w-28 h-28 opacity-20 dark:opacity-10 pointer-events-none" />
          <div className="relative z-10">
            <p className="text-[10px] text-hint font-bold uppercase tracking-wider mb-1">今日の一言</p>
            <p className="font-serif text-xl font-bold text-main">{todayWord.jp}</p>
            <p className="text-xs text-primary mt-1">{todayWord.rn}</p>
            <p className="text-xs text-sub mt-0.5">{todayWord.zh}</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-4 gap-2">
          {[
            {ill:<FlashReviewSvg/>,l:"瞬間レビュー",a:"flashreview"as Page},
            {ill:<WordListSvg/>,l:"単語リスト",a:"wordlist"as Page},
            {ill:<GrammarSvg/>,l:"文法練習",a:"word"as Page},
            {ill:<VocabSvg/>,l:"单词巩固",a:"vocab"as Page},
            {ill:<MatchZhSvg/>,l:"练习中心",a:"practice"as Page},
          ].map((c,i)=>(
            <button key={i} onClick={()=>onNavigate(c.a)}
              className="flex flex-col items-center justify-center gap-1 aspect-square rounded-[8px] bg-white dark:bg-surface shadow-sm border border-border active:scale-95 transition-all">
              {c.ill}
              <span className="text-[10px] font-bold text-sub">{c.l}</span>
            </button>
          ))}
        </div>

        <div className="h-2"/>
      </div>
    </div>
  );
}

// Thin line-art SVG icons — reference style
const S = 20;
function FlashReviewSvg(){return(<svg width={S} height={S} viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10" fill="none" stroke="#0F64B5" strokeWidth="2"/></svg>)}
function WordListSvg(){return(<svg width={S} height={S} viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 10h16M4 14h10" stroke="#333" strokeWidth="2" strokeLinecap="round"/><rect x="4" y="16" width="6" height="4" rx="1" fill="#0F64B5" opacity=".3"/><rect x="14" y="16" width="6" height="4" rx="1" fill="#0F64B5" opacity=".6"/></svg>)}
function GrammarSvg(){return(<svg width={S} height={S} viewBox="0 0 24 24" fill="none"><path d="M8 4v16M16 4v16M6 2h12M6 22h12" stroke="#333" strokeWidth="2" strokeLinecap="round"/><path d="M10 8h4M10 12h4" stroke="#0F64B5" strokeWidth="1.5" strokeLinecap="round"/></svg>)}
function VocabSvg(){return(<svg width={S} height={S} viewBox="0 0 24 24" fill="none"><path d="M4 4h16v16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" stroke="#333" strokeWidth="2"/><path d="M8 8l4 4-4 4" stroke="#0F64B5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>)}
function MatchZhSvg(){return(<svg width={S} height={S} viewBox="0 0 24 24" fill="none"><circle cx="9" cy="9" r="2" stroke="#333" strokeWidth="2"/><circle cx="15" cy="15" r="2" stroke="#0F64B5" strokeWidth="2"/><path d="M10.5 10.5L13.5 13.5" stroke="#333" strokeWidth="2" strokeLinecap="round"/></svg>)}
