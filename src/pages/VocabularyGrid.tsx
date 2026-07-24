import { ChevronRight, BarChart3, BookOpen, Calendar, Heart, Clock } from "lucide-react";
import type { Page } from "../components/BottomNav";
import StatusBar from "../components/StatusBar";
import { loadProgress, getReviewCount } from "../lib/spaced-repetition";
import { getNickname, getAvatar } from "../lib/userStore";

interface VocabGridProps { onNavigate: (page: Page) => void; darkMode?: boolean; }

export default function VocabularyGrid({ onNavigate, darkMode }: VocabGridProps) {
  const totalLearned = Object.keys(loadProgress()).length;
  const studyDays = parseInt(localStorage.getItem("studyDays") || "0");
  const bookName = { vol1: "第一册", vol2: "第二册", all: "全部词书" }[localStorage.getItem("selectedBook") || "all"] || "全部词书";

  return (<>
    <StatusBar darkMode={darkMode} />
    <div className="flex-1 min-h-0 overflow-y-auto scroll-area">

      {/* ── Pattern Background Hero ── */}
      <div className="pattern-geo relative overflow-hidden mx-4 mt-3 rounded-t-[2px] p-5">
        <div className="relative z-10 flex items-center gap-4">
          {getAvatar() ? <img src={getAvatar()} alt="" className="w-16 h-16 rounded-full object-cover ring-4 ring-white/15" /> : <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center p-3 ring-4 ring-white/15"><img src="/icons/logo.svg" alt="Logo" className="w-full h-full object-contain" /></div>}
          <div className="flex-1">
            <h2 className="text-lg font-bold text-main">{getNickname()}</h2>
            <p className="text-sub text-xs mt-0.5">{bookName} 学習中 · ID: {localStorage.getItem("userId") || (() => { const id = Math.random().toString(36).slice(2,8).toUpperCase(); localStorage.setItem("userId", id); return id; })()}</p>
          </div>
          <button onClick={()=>onNavigate("profile")} className="active:scale-90 transition-transform"><ChevronRight size={18} className="text-sub" /></button>
        </div>
        <div className="relative z-10 flex gap-4 mt-4">
          {[
            { n: totalLearned, l: "累計単語" },
            { n: studyDays, l: "学習日数" },
            { n: getReviewCount(), l: "待復習" },
          ].map((s, i) => (
            <div key={i} className="flex-1 text-center">
              <p className="text-2xl font-extrabold text-main">{s.n}</p>
              <p className="text-[10px] text-sub">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="px-4 pt-0">
        <div className="bg-primary-subtle rounded-b-[2px] p-4 flex items-center gap-3">
          <BarChart3 size={28} className="text-primary" />
          <div>
            <p className="text-sm text-main font-bold">累计已学 <span className="text-primary text-lg">{totalLearned}</span> 词</p>
            <p className="text-xs text-hint mt-0.5">今日待复习 {getReviewCount()} 词</p>
          </div>
        </div>
      </div>

      {/* ── Function List ── */}
      <div className="px-4 pt-2 mb-6">
        <div className="bg-surface rounded-[2px] shadow-sm overflow-hidden">
        {[
          { icon:<Calendar size={20} className="text-primary" />, l:"学習カレンダー", d:"打卡记录 · 学习天数", a:()=>onNavigate("home") },
          { icon:<BookOpen size={20} className="text-primary" />, l:"単語リスト", d:"2冊 · 全単語を閲覧", a:()=>onNavigate("wordlist") },
          { icon:<Clock size={20} className="text-primary" />, l:"学習データ", d:`累計 ${totalLearned} 語マスター`, a:()=>{} },
          { icon:<Heart size={20} className="text-primary" />, l:"お気に入り", d:"收藏的单词 · 0 語", a:()=>{} },
          { icon:<BookOpen size={20} className="text-primary" />, l:"我的单词书", d:"自建词库 · 管理单词", a:()=>onNavigate("wordbooks") },
        ].map((item,i)=>(
          <div key={i} onClick={item.a} className="flex items-center px-4 py-3.5 cursor-pointer active:bg-primary-subtle transition-colors">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mr-3 shrink-0">{item.icon}</div>
            <div className="flex-1"><p className="text-sm font-bold text-main">{item.l}</p><p className="text-xs text-hint">{item.d}</p></div>
            <ChevronRight size={16} className="text-hint" />
          </div>
        ))}
        </div>
      </div>

      {/* ── Bottom Info ── */}
      <div className="px-4 pt-[2px] mb-6">
        <div className="bg-surface rounded-[2px] shadow-sm overflow-hidden">
          <div className="flex items-center px-4 py-3.5 cursor-pointer active:bg-primary-subtle transition-colors">
            <div className="flex-1"><p className="text-sm font-bold text-main">バージョン</p></div>
            <span className="text-xs text-hint">v1.0</span>
          </div>
          <div className="flex items-center px-4 py-3.5 cursor-pointer active:bg-primary-subtle transition-colors">
            <div className="flex-1"><p className="text-sm font-bold text-main">フィードバック</p></div>
            <ChevronRight size={16} className="text-hint" />
          </div>
        </div>
      </div>

    </div>
  </>);
}
