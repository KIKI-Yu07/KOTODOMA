import { Home, Layers, Monitor, User } from "lucide-react";
import { cn } from "@/lib/utils";

export type Page = "home" | "course" | "word" | "vocab" | "wordlist" | "flashreview";

interface BottomNavProps {
  active: Page;
  onNavigate: (page: Page) => void;
  darkMode?: boolean;
}

const tabs: { id: Page; icon: typeof Home; label: string }[] = [
  { id: "home", icon: Home, label: "ホーム" },
  { id: "course", icon: Layers, label: "AI" },
  { id: "word", icon: Monitor, label: "文法" },
  { id: "vocab", icon: User, label: "我的" },
];

const activeIndex: Record<Page, number> = {
  home: 0, course: 1, word: 2, vocab: 3, wordlist: 0, flashreview: 0,
};

const navPages: Page[] = ["home", "course", "word", "vocab"];

export default function BottomNav({ active, onNavigate, darkMode }: BottomNavProps) {
  if (!navPages.includes(active)) return null;
  return (
    <div className={cn("relative pt-2 pb-5", darkMode ? "bg-[#111019]" : "bg-[#F5F5F5]")}>
      <div className={cn(
        "relative rounded-[25px] mx-3 h-[50px] flex items-center shadow-lg",
        darkMode ? "bg-[#1C1828]" : "bg-white",
      )}>
        <span
          className="absolute top-1 h-[42px] w-[calc(25%-6px)] rounded-[21px] bg-[#8B5CF6] transition-all duration-300 ease-out glow-primary"
          style={{ left: `calc(${activeIndex[active] * 25}% + 3px)` }}
        />
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className="flex-1 h-[42px] rounded-[21px] flex items-center justify-center relative z-10 transition-colors duration-300"
            aria-label={label}
          >
            <Icon
              size={20}
              stroke={active === id ? "#fff" : darkMode ? "#A78BFA" : "#C4B5FD"}
              className="transition-colors duration-300"
            />
          </button>
        ))}
      </div>
      <div className={cn(
        "w-[134px] h-[5px] rounded-full mx-auto mt-3",
        darkMode ? "bg-[#2D3036]" : "bg-[#1A1C22]",
      )} />
    </div>
  );
}
