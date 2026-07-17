import { useState, useMemo } from "react";
import { Sun, Moon, ChevronDown, ChevronLeft, ChevronRight, Zap, BookOpen, Clock } from "lucide-react";
import type { Page } from "../components/BottomNav";
import StatusBar from "../components/StatusBar";

interface HomeProps {
  onNavigate: (page: Page) => void;
  darkMode: boolean;
  onToggleDark: () => void;
}

const studiedDays = [
  new Date(2026, 6, 1), new Date(2026, 6, 2), new Date(2026, 6, 3),
  new Date(2026, 6, 5), new Date(2026, 6, 6), new Date(2026, 6, 7),
  new Date(2026, 6, 8), new Date(2026, 6, 10),
];

const dailyQuotes = [
  { quote: "猿も木から落ちる", reading: "さるもきからおちる", meaning: "智者千虑，必有一失", note: "「も」表示『连…都』", word: "猿 · 木 · 落ちる" },
  { quote: "塵も積もれば山となる", reading: "ちりもつもればやまとなる", meaning: "积少成多", note: "「〜ば」条件形", word: "塵 · 積もる · 山" },
  { quote: "急がば回れ", reading: "いそがばまわれ", meaning: "欲速则不达", note: "「〜ば」条件形", word: "急ぐ · 回る" },
  { quote: "花より団子", reading: "はなよりだんご", meaning: "舍华求实", note: "「より」比较", word: "花 · 団子" },
  { quote: "三日坊主", reading: "みっかぼうず", meaning: "三天打鱼两天晒网", note: "惯用语", word: "三日 · 坊主" },
  { quote: "石の上にも三年", reading: "いしのうえにもさんねん", meaning: "功到自然成", note: "「にも」强调", word: "石 · 三年" },
  { quote: "泣きっ面に蜂", reading: "なきっつらにはち", meaning: "雪上加霜", note: "「に」表对象", word: "泣き面 · 蜂" },
];

export default function Home({ onNavigate, darkMode, onToggleDark }: HomeProps) {
  const [month, setMonth] = useState<Date>(new Date(2026, 6, 9));
  const [calendarOpen, setCalendarOpen] = useState(false);
  const quote = useMemo(() => dailyQuotes[new Date().getDate() % dailyQuotes.length], []);

  return (
    <>
      <div className={`relative overflow-hidden transition-colors duration-500 ${
        darkMode
          ? "bg-gradient-to-b from-[#0B1525] via-[#1A1133] to-[#0E0A1A]"
          : "bg-gradient-to-b from-[#6D28D9] via-[#A78BFA] to-[#F5F3FF]"
      }`}>
        <div className="absolute inset-0 pattern-dots pointer-events-none" />
        <StatusBar darkMode={darkMode} />
        <div className="relative z-10 flex justify-between items-center px-4 pt-2 pb-4">
          <div>
            <h2 className={`text-xl font-extrabold tracking-tight transition-colors duration-300 ${darkMode ? "text-[#E0E0E0]" : "text-white"}`}>こんにちは</h2>
            <p className={`text-[32px] font-black leading-none mt-1 tracking-wide transition-colors duration-300 ${darkMode ? "text-[#E0E0E0]" : "text-white"}`}>小明</p>
            <p className={`text-xs mt-2 transition-colors duration-300 ${darkMode ? "text-[#A78BFA]" : "text-[#DDD6FE]"}`}>今日も日本語の勉強を頑張りましょう ✨</p>
          </div>
          <div className="flex gap-3 items-start">
            <button onClick={onToggleDark}
              className={`relative w-[76px] h-[30px] rounded-full flex items-center justify-between px-[6px] transition-colors duration-300 ${darkMode ? "bg-[#1A1C22]" : "bg-white/20 backdrop-blur"}`}>
              <Sun size={15} fill={darkMode ? "none" : "#C8161D"} stroke={darkMode ? "#6B7280" : "#C8161D"} className="relative z-10 transition-colors duration-300" />
              <Moon size={14} fill={darkMode ? "#A78BFA" : "none"} stroke={darkMode ? "#A78BFA" : "#DDD6FE"} className="relative z-10 transition-colors duration-300" />
              <span className="absolute top-[3px] w-[24px] h-[24px] rounded-full bg-white shadow-md transition-all duration-300 z-0" style={{ left: darkMode ? "calc(100% - 25px)" : "2px" }} />
            </button>
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm ring-2 ring-white/30">小</div>
          </div>
        </div>

        <div className="relative z-20 px-4 -mb-3">
          <div className={`rounded-2xl p-4 shadow-lg ${darkMode ? "bg-[#1C1828] border border-white/8" : "bg-white"}`}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F3EEFF] dark:bg-[#1F1A2E] text-[#A78BFA] dark:text-[#DDD6FE]">JLPT N3 · 第 8 課</span>
                <h3 className="text-base font-extrabold text-[#1A1C22] dark:text-[#E0E0E0] mt-1.5">今日の学習</h3>
              </div>
              <span className="text-2xl font-black text-[#A78BFA]">68%</span>
            </div>
            <div className="w-full h-1.5 bg-[#F3EEFF] dark:bg-[#1F1A2E] rounded-full overflow-hidden">
              <div className="h-full rounded-full progress-bar progress-gradient" style={{ width: "68%" }} />
            </div>
            <div className="flex gap-2 mt-3">
              {[{ n: 40, label: "マスター" },{ n: 15, label: "学習中" },{ n: 5, label: "未学習" }].map((s, i) => (
                <div key={i} className="flex-1 bg-[#F5F3FF] dark:bg-[#1F1A2E] rounded-lg py-1.5 text-center">
                  <p className="text-sm font-extrabold text-[#A78BFA]">{s.n}</p>
                  <p className="text-[9px] text-[#4A4A50] dark:text-[#999AA0]">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={`h-5 rounded-t-[24px] transition-colors duration-300 ${darkMode ? "bg-[#0E0A1A]" : "bg-[#F5F3FF]"}`} />
      </div>

      <div className="flex-1 overflow-y-auto scroll-area px-4 pb-4 space-y-4 -mt-1">
        <div className="grid grid-cols-2 gap-3">
          <div onClick={() => onNavigate("flashreview")} className="card-action cursor-pointer select-none" style={{ background: darkMode ? "#2D1A10" : "#FFF3EB" }}>
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: darkMode ? "#3D2418" : "#FDEEE5" }}>
                <Zap size={20} fill="#EB5C20" stroke="#EB5C20" />
              </div>
              <p className="text-sm font-extrabold text-[#1A1C22] dark:text-[#E0E0E0]">瞬間</p>
              <p className="text-[20px] font-black text-[#EB5C20] leading-none mt-1">レビュー</p>
              <p className="text-[10px] text-[#4A4A50] dark:text-[#999AA0] mt-1.5">8 語収録</p>
            </div>
          </div>
          <div onClick={() => onNavigate("wordlist")} className="card-action cursor-pointer select-none" style={{ background: darkMode ? "#1A1133" : "#EDE9FE" }}>
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: darkMode ? "#1F1A2E" : "#F3EEFF" }}>
                <BookOpen size={20} stroke="#A78BFA" />
              </div>
              <p className="text-sm font-extrabold text-[#1A1C22] dark:text-[#E0E0E0]">単語帳</p>
              <p className="text-[20px] font-black text-[#A78BFA] leading-none mt-1">リスト</p>
              <p className="text-[10px] text-[#4A4A50] dark:text-[#999AA0] mt-1.5">2冊 · 全単語</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: <Clock size={22} stroke="#7C3AED" />, label: "学習時間", value: "0", unit: "分", bg: darkMode ? "#1F1533" : "#EDE9FE" },
            { icon: <BookOpen size={22} stroke="#A78BFA" />, label: "今日の単語", value: "0", unit: "語", bg: darkMode ? "#1A1133" : "#F3EEFF" },
          ].map((s, i) => (
            <div key={i} className="card rounded-2xl p-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.bg }}>{s.icon}</div>
              <div>
                <p className="text-2xl font-extrabold text-[#1A1C22] dark:text-[#E0E0E0]">{s.value}<span className="text-sm font-medium text-[#4A4A50] dark:text-[#999AA0] ml-1">{s.unit}</span></p>
                <p className="text-[11px] text-[#4A4A50] dark:text-[#999AA0]">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="card rounded-[20px] p-4">
          <button onClick={() => { if (calendarOpen) setMonth(new Date()); setCalendarOpen(!calendarOpen); }} className="w-full flex justify-between items-center">
            <h3 className="font-extrabold text-[15px] text-[#1A1C22] dark:text-[#E0E0E0]">学習カレンダー</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#018B8D] font-bold">今月 {studiedDays.filter(d => d.getMonth() === month.getMonth()).length} 日</span>
              <ChevronDown size={16} stroke="#4A4A50" className={`transition-transform duration-300 ${calendarOpen ? "rotate-180" : ""}`} />
            </div>
          </button>
          <div className="flex items-center justify-between mt-2 mb-1">
            <button onClick={(e) => { e.stopPropagation(); if (calendarOpen) setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1)); }}
              className={`w-7 h-7 rounded-full flex items-center justify-center ${calendarOpen ? "text-[#4A4A50]" : "text-[#DDD6FE] pointer-events-none"}`}>
              <ChevronLeft size={16} /></button>
            <span className="text-sm font-bold text-[#1A1C22] dark:text-[#E0E0E0]">{month.getFullYear()}年{month.getMonth() + 1}月</span>
            <button onClick={(e) => { e.stopPropagation(); if (calendarOpen) setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1)); }}
              className={`w-7 h-7 rounded-full flex items-center justify-center ${calendarOpen ? "text-[#4A4A50]" : "text-[#DDD6FE] pointer-events-none"}`}>
              <ChevronRight size={16} /></button>
          </div>
          <div className={`transition-[max-height,opacity] duration-500 ease-in-out overflow-hidden ${calendarOpen ? "max-h-[400px] opacity-100" : "max-h-[64px] opacity-60"}`}>
            <div className="grid grid-cols-7 text-center mb-0.5">
              {["日","月","火","水","木","金","土"].map(w => (
                <span key={w} className={`text-xs font-bold py-1 ${w==="日"?"text-[#C8161D]":w==="土"?"text-[#8B5CF6]":"text-[#4A4A50] dark:text-[#999AA0]"}`}>{w}</span>
              ))}
            </div>
            {(() => {
              const year = month.getFullYear(), m = month.getMonth();
              const firstDay = new Date(year, m, 1).getDay();
              const daysInMonth = new Date(year, m + 1, 0).getDate();
              const today = new Date();
              const todayStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
              const studiedStrs = new Set(studiedDays.map(d => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`));
              const cells = [];
              for (let i = 0; i < firstDay; i++) cells.push({ day: 0, isToday: false, isStudied: false });
              for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, isToday: `${year}-${m}-${d}` === todayStr, isStudied: studiedStrs.has(`${year}-${m}-${d}`) });
              const rows = [];
              for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
              const todayRow = rows.findIndex(row => row.some(c => c.isToday));
              const offset = calendarOpen ? 0 : (todayRow >= 0 ? todayRow * 36 : 0);
              return (
                <div className="transition-transform duration-500 ease-in-out" style={{ transform: `translateY(-${offset}px)` }}>
                  {rows.map((row, ri) => (
                    <div key={ri} className={`grid grid-cols-7 text-center transition-all duration-500 ${!calendarOpen && ri !== todayRow ? "opacity-0" : ""}`}>
                      {row.map((c, ci) => (
                        <div key={ci} className="flex items-center justify-center py-0.5">
                          {c.day > 0 && (
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-colors ${
                              c.isToday ? "bg-[#A78BFA] text-white today-glow" :
                              c.isStudied ? "bg-[#F3EEFF] dark:bg-[#1F1A2E] text-[#A78BFA]" :
                              "text-[#1A1C22] dark:text-[#E0E0E0]"}`}>{c.day}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>

        <div className="relative px-1 py-2">
          <span className="quote-mark absolute top-0 left-0 leading-none select-none">"</span>
          <div className="pl-8">
            <p className="text-[22px] font-black text-[#1A1C22] dark:text-[#E0E0E0] tracking-wide leading-snug">{quote.quote}</p>
            <p className="text-sm font-bold text-[#A78BFA] dark:text-[#DDD6FE] mt-2">{quote.reading}</p>
            <p className="text-xs text-[#4A4A50] dark:text-[#999AA0] mt-1">{quote.meaning}</p>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F3EEFF] dark:bg-[#1F1A2E] text-[#A78BFA] dark:text-[#DDD6FE] font-semibold">{quote.note}</span>
              <span className="text-[10px] text-[#4A4A50] dark:text-[#999AA0]">{quote.word}</span>
            </div>
          </div>
        </div>

        <div className="h-4" />
      </div>
    </>
  );
}
