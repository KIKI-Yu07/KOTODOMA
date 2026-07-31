import { ChevronRight, BookOpen, CalendarDays, Heart, Library, MessageSquare, Info } from "lucide-react";
import type { Page } from "../components/BottomNav";
import { loadProgress } from "../lib/spaced-repetition";
import { getWordSource } from "../lib/wordSource";
import { getNickname, getAvatar } from "../lib/userStore";
import { getFavoriteCount } from "../lib/favorites";

interface VocabGridProps { onNavigate: (page: Page) => void; }

type MenuItem = {
  icon: React.ElementType;
  title: string;
  description?: string;
  value?: string;
  action?: () => void;
  showChevron?: boolean;
};

function MenuList({ items }: { items: MenuItem[] }) {
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-xl bg-white">
      {items.map((item) => {
        const Icon = item.icon;
        const showChevron = item.showChevron ?? true;
        return (
          <li key={item.title}>
            <button
              type="button"
              onClick={item.action}
              className="group flex w-full items-center gap-4 px-5 py-4 text-left transition-colors active:bg-surface-subtle"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-subtle">
                <Icon className="size-[18px] text-main" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-medium tracking-tight text-main">
                  {item.title}
                </span>
                {item.description ? (
                  <span className="mt-0.5 block truncate text-[13px] leading-relaxed text-sub">
                    {item.description}
                  </span>
                ) : null}
              </span>
              {item.value ? (
                <span className="shrink-0 font-mono text-[13px] tabular-nums text-sub">
                  {item.value}
                </span>
              ) : null}
              {showChevron ? (
                <ChevronRight
                  className="size-[18px] shrink-0 text-hint transition-transform group-active:translate-x-0.5"
                  aria-hidden="true"
                />
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export default function VocabularyGrid({ onNavigate }: VocabGridProps) {
  const totalWords = getWordSource().length;
  const sourceIds = new Set(getWordSource().map(w => w.id));
  const totalLearned = Object.keys(loadProgress()).filter(id => sourceIds.has(id)).length;
  const studyDays = parseInt(localStorage.getItem("studyDays") || "0");
  const favoriteCount = getFavoriteCount();
  const nick = getNickname();
  const av = getAvatar();
  const selectedBook = localStorage.getItem("selectedBook") || "all";
  const bookName = (() => {
    const textbookMap: Record<string,string> = { vol1: "第一册", vol2: "第二册", all: "全部词书" };
    if (textbookMap[selectedBook]) return textbookMap[selectedBook];
    try {
      const wbs = JSON.parse(localStorage.getItem("wordbooks") || "[]") as {id:string;name:string;words:any[]}[];
      const wb = wbs.find(b => b.id === selectedBook);
      if (wb) return wb.name;
    } catch {}
    return "未选择词书";
  })();
  const userId =
    localStorage.getItem("userId") ||
    (() => {
      const id = Math.random().toString(36).slice(2, 8).toUpperCase();
      localStorage.setItem("userId", id);
      return id;
    })();

  const percent = totalWords > 0 ? Math.min(100, (totalLearned / totalWords) * 100) : 0;

  const grammarCleared = (() => {
    try { return JSON.parse(localStorage.getItem("grammar_completed") || "[]").length; }
    catch { return 0; }
  })();

  const stats = [
    { value: studyDays, label: "学習日数" },
    { value: favoriteCount, label: "お気に入り" },
    { value: grammarCleared, label: "语法通关" },
  ];

  const mainItems: MenuItem[] = [
    {
      icon: CalendarDays,
      title: "学習カレンダー",
      description: "打卡记录 · 学習天数",
      action: () => onNavigate("calendar"),
    },
    {
      icon: BookOpen,
      title: "单词记录",
      description: "记住了 · 忘记了",
      action: () => onNavigate("wordrecord"),
    },
    {
      icon: Heart,
      title: "お気に入り",
      description: `收藏的单词 · ${favoriteCount} 語`,
      action: () => onNavigate("favorites"),
    },
    {
      icon: Library,
      title: "我的单词本",
      description: "自建词库 · 单词本管理",
      action: () => onNavigate("wordbooks"),
    },
  ];

  const aboutItems: MenuItem[] = [
    {
      icon: Info,
      title: "バージョン",
      value: "v1.0",
      showChevron: false,
    },
    {
      icon: MessageSquare,
      title: "フィードバック",
      action: () => onNavigate("feedback"),
    },
  ];

  return (
    <div className="flex-1 min-h-0 overflow-y-auto scroll-area bg-bg">
      {/* ── Profile Header ── */}
      <header className="relative overflow-hidden pattern-geo">
        <div className="relative">
          {/* Profile */}
          <button
            type="button"
            onClick={() => onNavigate("profile")}
            className="group flex w-full items-center gap-4 px-5 pb-5 pt-8 text-left transition-colors active:bg-black/[0.02]"
          >
            {av ? (
              <img
                src={av}
                alt=""
                className="size-[52px] shrink-0 rounded-full object-cover ring-2 ring-surface-subtle"
              />
            ) : (
              <div
                aria-hidden="true"
                className="flex size-[52px] shrink-0 items-center justify-center rounded-full bg-primary text-lg font-semibold tracking-tight text-white shadow-sm"
              >
                {(nick || "小")[0]}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-[19px] font-semibold tracking-tight text-main">
                {nick}
              </h1>
              <p className="mt-0.5 truncate text-[13px] leading-relaxed text-sub">
                {bookName} 学習中
                <span className="mx-1.5 text-border">·</span>
                <span className="font-mono text-[12px] tracking-tight">ID: {userId}</span>
              </p>
            </div>

            <ChevronRight
              className="size-5 shrink-0 text-hint transition-transform group-active:translate-x-0.5"
              aria-hidden="true"
            />
            <span className="sr-only">查看个人资料</span>
          </button>

          {/* Stats row */}
          <dl className="flex items-stretch border-y border-border">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`flex flex-1 flex-col items-center justify-center gap-1 py-4 ${
                  index > 0 ? "border-l border-border" : ""
                }`}
              >
                <dd className="text-[26px] font-semibold leading-none tracking-tight text-main tabular-nums">
                  {stat.value}
                </dd>
                <dt className="text-[11px] leading-relaxed text-sub">
                  {stat.label}
                </dt>
              </div>
            ))}
          </dl>
        </div>
      </header>

      {/* ── Progress Card ── */}
      <section className="px-5 pt-4">
        <button
          type="button"
          onClick={() => onNavigate("learned")}
          className="group w-full rounded-xl bg-primary px-5 py-5 text-left text-white transition-opacity active:opacity-90"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[15px] font-medium tracking-tight">
                累计已学{" "}
                <span className="font-mono text-xl font-semibold tabular-nums">
                  {totalLearned}
                </span>
                <span className="text-white/60"> / {totalWords}</span>{" "}
                词
              </p>
            </div>
            <ChevronRight
              className="mt-0.5 size-5 shrink-0 text-white/50 transition-transform group-active:translate-x-0.5"
              aria-hidden="true"
            />
          </div>

          <div className="mt-5 flex items-center gap-3">
            <div
              className="h-1 flex-1 overflow-hidden rounded-full bg-white/20"
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="学习进度"
            >
              <div
                className="h-full rounded-full bg-white transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="font-mono text-[11px] tabular-nums text-white/60">
              {percent.toFixed(2)}%
            </span>
          </div>
        </button>
      </section>

      {/* ── Main Menu ── */}
      <section className="px-5 pt-4">
        <h2 className="sr-only">学習メニュー</h2>
        <MenuList items={mainItems} />
      </section>

      {/* ── About ── */}
      <section className="px-5 pt-4">
        <h2 className="sr-only">关于</h2>
        <MenuList items={aboutItems} />
      </section>

      {/* ── Footer ── */}
      <p className="px-4 pt-8 pb-12 text-center font-mono text-[11px] tracking-wide text-sub/70">
        言霊 · ことだま
      </p>
    </div>
  );
}
