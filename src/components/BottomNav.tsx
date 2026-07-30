export type Page = "home" | "word" | "vocab" | "wordlist"  | "settings" | "study" | "profile" | "search" | "wordbooks" | "practice" | "rest" | "favorites" | "cardmatch" | "feedback" | "calendar" | "wordrecord" | "listreview" | "learned" ;

interface BottomNavProps { active: Page; onNavigate: (p: Page) => void; }

const tabs: { id: Page; shortLabel: string }[] = [
  { id: "home", shortLabel: "单词" }, { id: "search", shortLabel: "搜索" }, { id: "word", shortLabel: "语法" }, { id: "vocab", shortLabel: "我的" },
];

const navPages: Page[] = ["home", "search", "word", "vocab"];

export default function BottomNav({ active, onNavigate }: BottomNavProps) {
  if (!navPages.includes(active)) return null;
  const activeIdx = tabs.findIndex(t => t.id === active);
  return (
    <div className="relative bg-white rounded-t-2xl rounded-b-[2px] border-t border-border" style={{paddingBottom:"calc(14px + env(safe-area-inset-bottom, 0px))"}}>
      <div className="relative mx-3 h-[3px]">
        <span className="absolute top-0 h-[3px] w-[36px] bg-primary rounded-b-[3px] transition-all duration-300 ease-out"
          style={{ left: `calc(${activeIdx * 25 + 12.5}% - 18px)` }} />
      </div>
      <div className="flex items-end px-3 pt-1">
        {tabs.map(({ id, shortLabel }) => {
          const isActive = active === id;
          const c = isActive ? "var(--color-primary)" : "var(--color-text-tertiary)";
          const f = isActive ? "drop-shadow(0 0 3px rgba(93,63,211,0.3))" : "none";
          return (
            <button key={id} onClick={() => onNavigate(id)}
              className="flex-1 flex flex-col items-center gap-0.5 transition-colors duration-300" aria-label={shortLabel}>
              <svg viewBox="0 0 24 24" width="20" height="20" style={{ filter: f, transform: isActive ? "scale(1.1)" : "scale(1)", transition: "all .3s" }}>
                {id === "home" && <><rect x="3" y="4" width="18" height="17" rx="3" fill={c} opacity=".15" /><path d="M7 2v20l5-3 5 3V2a2 2 0 00-2-2H9a2 2 0 00-2 2z" fill={c} /></>}
                {id === "search" && <><circle cx="11" cy="11" r="7" fill={c} opacity=".12" /><circle cx="11" cy="11" r="4.5" fill="none" stroke={c} strokeWidth="2" /><path d="M15 15l5 5" stroke={c} strokeWidth="2.5" strokeLinecap="round" /></>}
                {id === "word" && <><rect x="4" y="2" width="16" height="20" rx="3" fill={c} opacity=".12" /><path d="M18 2l-6 6h6V2z" fill={c} opacity=".3" /><path d="M8 11h8M8 14h6M8 17h7" stroke={c} strokeWidth="1.8" strokeLinecap="round" /></>}
                {id === "vocab" && <><circle cx="12" cy="10" r="5" fill={c} /><ellipse cx="12" cy="22" rx="9" ry="5" fill={c} /><circle cx="12" cy="10" r="5" fill={c} opacity=".2" /></>}
              </svg>
              <span className={`text-[9px] font-medium transition-colors duration-300 ${isActive ? "text-primary" : "text-hint"}`}>{shortLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
