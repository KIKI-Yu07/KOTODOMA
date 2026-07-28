import { useState } from "react";
import { Settings, Search } from "lucide-react";
import type { Page } from "../components/BottomNav";
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
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 text-center border border-white/15">
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
              <button onClick={()=>{const r=indexedDB.deleteDatabase("nihongo_app");r.onsuccess=r.onerror=()=>{localStorage.clear();location.reload()}}} className="text-white/30 text-[10px] active:text-white/60">
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
            <p className="text-xs text-primary mb-0.5">{todayWord.rn}</p>
            <p className="font-serif text-xl font-bold text-main">{todayWord.jp}</p>
            <p className="text-xs text-sub mt-1">{todayWord.zh}</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-4 gap-2">
          {[
            {ill:<FlashReviewSvg c="#3B82F6"/>, bg:"bg-[#EFF6FF] dark:bg-[#1E3A5F]/60", label:"瞬間レビュー", a:"flashreview"as Page},
            {ill:<WordListSvg c="#10B981"/>, bg:"bg-[#ECFDF5] dark:bg-[#064E3B]/40", label:"列表学习", a:"wordlist"as Page, img:"/icons/bg-wordlist.jpg"},
            {ill:<GrammarSvg c="#8B5CF6"/>, bg:"bg-[#F5F3FF] dark:bg-[#3B1F7E]/40", label:"记忆卡片", a:"cardmatch"as Page, img:"/icons/bg-cardmatch.jpg"},
            {ill:<MatchZhSvg c="#F59E0B"/>, bg:"bg-[#FFFBEB] dark:bg-[#78350F]/40", label:"单词修罗", a:"practice"as Page, img:"/icons/bg-shura.jpg"},
          ].map((c,i)=>(
            <button key={i} onClick={()=>onNavigate(c.a)}
              className={`flex flex-col items-center justify-center gap-1 aspect-square rounded-xl border-0 active:scale-95 transition-all relative overflow-hidden ${(c as any).img?"":" "+c.bg}`}
              style={(c as any).img?{backgroundImage:`url(${(c as any).img})`,backgroundSize:"cover",backgroundPosition:"center"}:{}}>
              {(c as any).img&&<div className="absolute inset-0 bg-black/30" />}
              {(c as any).img?null:<span className="relative z-10">{c.ill}</span>}
              <span className="relative z-10 text-sm font-extrabold tracking-wider" style={(c as any).img?{color:"#fff",textShadow:"0 2px 8px rgba(0,0,0,0.6)",fontFamily:"serif"}:{}}>{c.label}</span>
            </button>
          ))}
        </div>

        {/* Decorative Card */}
        <div className="bg-white dark:bg-surface rounded-2xl p-5 shadow-sm border border-border relative overflow-hidden select-none pointer-events-none">
          {/* Seigaiha wave pattern background */}
          <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs><pattern id="wave" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="28" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary"/>
                <circle cx="0" cy="0" r="28" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary"/>
                <circle cx="60" cy="0" r="28" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary"/>
                <circle cx="0" cy="60" r="28" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary"/>
                <circle cx="60" cy="60" r="28" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary"/>
              </pattern></defs>
              <rect width="100%" height="100%" fill="url(#wave)"/>
            </svg>
          </div>
          {/* Decorative line + text */}
          <div className="relative z-10 flex flex-col items-center gap-3">
            <div className="flex items-center gap-3 w-full">
              <div className="h-px flex-1 bg-border"/>
              <span className="text-[10px] text-hint font-bold tracking-[0.2em]">日 語 学 習</span>
              <div className="h-px flex-1 bg-border"/>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary/30"/>
              <div className="w-2 h-2 rounded-full bg-primary/50"/>
              <div className="w-1.5 h-1.5 rounded-full bg-primary/30"/>
            </div>
            <p className="text-[10px] text-hint/60 tracking-wider">継続は力なり</p>
          </div>
        </div>

        <div className="h-2"/>
      </div>
    </div>
  );
}

// Thin line-art SVG icons — reference style
const S = 20;
function FlashReviewSvg({c}:{c:string}){return(<svg width={S} height={S} viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10" fill="none" stroke={c} strokeWidth="2"/></svg>)}
function WordListSvg({c}:{c:string}){return(<svg width={S} height={S} viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 10h16M4 14h10" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round"/><rect x="4" y="16" width="6" height="4" rx="1" fill={c} opacity=".4"/><rect x="14" y="16" width="6" height="4" rx="1" fill={c} opacity=".7"/></svg>)}
function GrammarSvg({c}:{c:string}){return(<svg width={S} height={S} viewBox="0 0 24 24" fill="none"><path d="M8 4v16M16 4v16M6 2h12M6 22h12" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round"/><path d="M10 8h4M10 12h4" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>)}

function MatchZhSvg({c}:{c:string}){return(<svg width={S} height={S} viewBox="0 0 24 24" fill="none"><circle cx="9" cy="9" r="2" stroke="#94A3B8" strokeWidth="2"/><circle cx="15" cy="15" r="2" stroke={c} strokeWidth="2"/><path d="M10.5 10.5L13.5 13.5" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round"/></svg>)}
