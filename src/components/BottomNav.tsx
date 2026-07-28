export type Page = "home" | "course" | "word" | "vocab" | "wordlist" | "flashreview" | "settings" | "study" | "profile" | "search" | "wordbooks" | "practice" | "rest" | "favorites" | "cardmatch" ;

interface BottomNavProps { active: Page; onNavigate: (p: Page) => void; darkMode?: boolean; }

const tabs: { id: Page; shortLabel: string }[] = [
  { id: "home", shortLabel: "单词" }, { id: "course", shortLabel: "词库" }, { id: "word", shortLabel: "语法" }, { id: "vocab", shortLabel: "我的" },
];

const navPages: Page[] = ["home", "course", "word", "vocab"];

export default function BottomNav({ active, onNavigate, darkMode }: BottomNavProps) {
  if (!navPages.includes(active)) return null;
  const activeIdx = tabs.findIndex(t => t.id === active);
  return (
    <div className="relative pb-4 bg-white dark:bg-surface rounded-t-2xl rounded-b-[2px] border-t border-border">
      <div className="relative mx-3 h-[4px]">
        <span className="absolute top-0 h-[4px] w-[40px] bg-primary rounded-b-[4px] transition-all duration-300 ease-out"
          style={{ left: `calc(${activeIdx * 25 + 12.5}% - 20px)` }} />
      </div>
      <div className="flex items-end px-3 pt-2">
        {tabs.map(({ id, shortLabel }) => {
          const isActive = active === id;
          const c = isActive ? "var(--color-primary)" : "var(--color-text-tertiary)";
          const f = isActive ? "drop-shadow(0 0 3px rgba(93,63,211,0.3))" : "none";
          return (
            <button key={id} onClick={() => onNavigate(id)}
              className="flex-1 flex flex-col items-center gap-1 transition-colors duration-300" aria-label={shortLabel}>
              <svg viewBox="0 0 24 24" width="22" height="22" style={{ filter: f, transform: isActive ? "scale(1.1)" : "scale(1)", transition: "all .3s" }}>
                {id === "home" && <><rect x="3" y="4" width="18" height="17" rx="3" fill={c} opacity=".15" /><path d="M7 2v20l5-3 5 3V2a2 2 0 00-2-2H9a2 2 0 00-2 2z" fill={c} /></>}
                {id === "course" && <><rect x="2" y="5" width="20" height="15" rx="3" fill={c} opacity=".12" /><rect x="7" y="8" width="10" height="9" rx="2" fill={c} /><path d="M10 11h4M10 14h3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" /></>}
                {id === "word" && <><rect x="4" y="2" width="16" height="20" rx="3" fill={c} opacity=".12" /><path d="M18 2l-6 6h6V2z" fill={c} opacity=".3" /><path d="M8 11h8M8 14h6M8 17h7" stroke={c} strokeWidth="1.8" strokeLinecap="round" /></>}
                {id === "vocab" && <><circle cx="12" cy="10" r="5" fill={c} /><ellipse cx="12" cy="22" rx="9" ry="5" fill={c} /><circle cx="12" cy="10" r="5" fill={c} opacity=".2" /></>}
              </svg>
              <span className={`text-[10px] font-medium transition-colors duration-300 ${isActive ? "text-primary" : "text-hint"}`}>{shortLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
