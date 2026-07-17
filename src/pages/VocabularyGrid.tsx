import { ChevronRight, BookOpen, Clock, Award, Settings, Moon, Sun } from "lucide-react";
import type { Page } from "../components/BottomNav";
import StatusBar from "../components/StatusBar";

interface VocabGridProps {
  onNavigate: (page: Page) => void;
  darkMode?: boolean;
}

const menuSections = [
  {
    title: "学習データ",
    items: [
      { icon: <BookOpen size={18} stroke="var(--primary-400)" />, label: "単語帳一覧", desc: "12冊 · 256語マスター", color: "#A78BFA", bg: "var(--[#F3EEFF])", darkBg: "var(--[#F3EEFF])" },
      { icon: <Clock size={18} stroke="var(--primary-600)" />, label: "学習履歴", desc: "累計 0 時間", color: "#8B5CF6", bg: "var(--[#F3EEFF])", darkBg: "var(--[#F3EEFF])" },
      { icon: <Award size={18} stroke="var(--success-teal)" />, label: "達成記録", desc: "最長 7 日連続", color: "#018B8D", bg: "var(--teal-bg)", darkBg: "var(--teal-bg)" },
    ],
  },
  {
    title: "設定",
    items: [
      { icon: <Bell size={18} />, label: "リマインダー", desc: "毎日 20:00", color: "#EB5C20", bg: "var(--orange-bg)", darkBg: "var(--orange-bg)" },
      { icon: <Globe size={18} />, label: "学習目標", desc: "毎日 20 語", color: "#A78BFA", bg: "var(--[#F3EEFF])", darkBg: "var(--[#F3EEFF])" },
      { icon: <SettingsIcon size={18} />, label: "アプリ設定", desc: "通知 · 音声 · フォント", color: "#4A4A50", bg: "#F3F3F3", darkBg: "var(--[#F3EEFF])" },
    ],
  },
];

function Bell({ size, stroke }: { size: number; stroke?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function Globe({ size, stroke }: { size: number; stroke?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function SettingsIcon({ size, stroke }: { size: number; stroke?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

export default function VocabularyGrid({ onNavigate, darkMode }: VocabGridProps) {
  return (
    <>
      <StatusBar darkMode={darkMode} />
      <div className="flex items-center justify-between px-4 py-2">
        <h2 className="text-lg font-extrabold text-[#1A1C22] dark:text-[#1A1C22]">マイページ</h2>
      </div>

      <div className="flex-1 overflow-y-auto scroll-area">

        {/* ── Profile Header ── */}
        <div className="flex flex-col items-center px-4 pt-2 pb-5">
          <div className="w-20 h-20 bg-gradient-to-br from-[#A78BFA] to-[#8B5CF6] rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg ring-4 ring-[#F3EEFF] dark:ring-[#1F1A2E] mb-3">
            小
          </div>
          <h3 className="text-lg font-extrabold text-[#1A1C22] dark:text-[#1A1C22]">小明</h3>
          <p className="text-xs text-[#4A4A50] dark:text-[#999AA0] mt-0.5">JLPT N3 学習中 · 7日連続達成</p>
          {/* Stats row */}
          <div className="flex gap-6 mt-4">
            {[
              { n: 256, label: "単語" },
              { n: 12, label: "単語帳" },
              { n: 7, label: "連続日" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-xl font-extrabold [#A78BFA]">{s.n}</p>
                <p className="text-[10px] text-[#4A4A50] dark:text-[#999AA0]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Menu Sections ── */}
        {menuSections.map((section, si) => (
          <div key={si}>
            <div className="px-4 pt-2 pb-1">
              <span className="text-[11px] font-bold text-[#4A4A50] dark:text-[#999AA0] uppercase tracking-wider px-1">{section.title}</span>
            </div>
            <div className={`mx-4 rounded-2xl overflow-hidden ${darkMode ? "bg-[#1C1828]" : "bg-white"}`}>
              {section.items.map((item, ii) => (
                <div key={ii}>
                  <div className="flex items-center px-4 py-3.5 cursor-pointer btn-press">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mr-3 shrink-0"
                      style={{ backgroundColor: darkMode ? item.darkBg : item.bg }}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#1A1C22] dark:text-[#1A1C22]">{item.label}</p>
                      <p className="text-[11px] text-[#4A4A50] dark:text-[#999AA0]">{item.desc}</p>
                    </div>
                    <ChevronRight size={16} className="text-[#DDD6FE] dark:text-[#999AA0] shrink-0" />
                  </div>
                  {ii < section.items.length - 1 && (
                    <div className={`mx-4 h-px ${darkMode ? "bg-white/5" : "bg-[#F3EEFF]"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* ── Dark Mode Toggle ── */}
        <div className="px-4 pt-5 pb-1">
          <span className="text-[11px] font-bold text-[#4A4A50] dark:text-[#999AA0] uppercase tracking-wider px-1">表示</span>
        </div>
        <div className={`mx-4 rounded-2xl overflow-hidden mb-6 ${darkMode ? "bg-[#1C1828]" : "bg-white"}`}>
          <div className="flex items-center px-4 py-3.5">
            <div className="w-9 h-9 rounded-xl [#F3EEFF] dark:[#F3EEFF] flex items-center justify-center mr-3 shrink-0">
              {darkMode ? <Moon size={18} fill="var(--primary-400)" stroke="var(--primary-400)" /> : <Sun size={18} stroke="var(--primary-600)" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-[#1A1C22] dark:text-[#1A1C22]">ダークモード</p>
              <p className="text-[11px] text-[#4A4A50] dark:text-[#999AA0]">{darkMode ? "オン" : "オフ"}</p>
            </div>
            <span className="text-xs font-bold [#A78BFA]">App v1.0</span>
          </div>
        </div>

      </div>
    </>
  );
}
