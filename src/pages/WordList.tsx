import { useState, useMemo, useRef, useEffect } from "react";
import { ArrowLeft, ChevronDown, ChevronRight } from "lucide-react";
import type { Page } from "../components/BottomNav";
import { getWordSource, getTextbookChapters, type WordEntry } from "../lib/wordSource";

interface WordListProps { onNavigate: (page: Page) => void; }

type FilterTab = "all" | "learned" | "unlearned";

export default function WordList({ onNavigate }: WordListProps) {
  const [tab, setTab] = useState<FilterTab>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<"time" | "alpha">("time");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [showCount, setShowCount] = useState(20);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const allWords = useMemo(() => getWordSource(), []);

  // Build date-groups from study progress
  const progress = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("word_progress") || "{}") as Record<string,{lastReview?:string}>; }
    catch { return {} as Record<string,{lastReview?:string}>; }
  }, []);

  const textbookChapters = useMemo(() => getTextbookChapters(), []);

  // Group words: "已学" by date, "全部"/"未学" by textbook chapter
  const groups = useMemo(() => {
    const learnedIds = new Set(Object.keys(progress).filter(id => progress[id]?.lastReview));

    // "已学" tab — group by study date
    if (tab === "learned") {
      const map = new Map<string, WordEntry[]>();
      for (const w of allWords) {
        if (!learnedIds.has(w.id)) continue;
        const date = progress[w.id]?.lastReview || "未分组";
        if (!map.has(date)) map.set(date, []);
        map.get(date)!.push(w);
      }
      const entries = [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
      if (sortBy === "alpha") {
        const all: WordEntry[] = [];
        entries.forEach(([, words]) => all.push(...words));
        all.sort((a, b) => a.w.localeCompare(b.w, "ja"));
        return [{ date: "", words: all }];
      }
      return entries.map(([date, words]) => ({ date, words }));
    }

    // "全部" / "未学" — group by textbook chapter
    const chapterMap = new Map<string, { name: string; words: WordEntry[] }>();
    const ungrouped: WordEntry[] = [];
    const wordIdToChapter = new Map<string, string>();

    // Build ID → chapter mapping from textbook data
    for (const book of textbookChapters) {
      for (const ch of book.chapters) {
        for (const w of ch.words) {
          wordIdToChapter.set(w.id, ch.name);
        }
      }
    }

    for (const w of allWords) {
      if (tab === "unlearned" && learnedIds.has(w.id)) continue;
      const chName = wordIdToChapter.get(w.id);
      if (chName) {
        if (!chapterMap.has(chName)) chapterMap.set(chName, { name: chName, words: [] });
        chapterMap.get(chName)!.words.push(w);
      } else {
        ungrouped.push(w);
      }
    }

    if (sortBy === "alpha") {
      const all: WordEntry[] = [];
      chapterMap.forEach(ch => all.push(...ch.words));
      all.push(...ungrouped);
      all.sort((a, b) => a.w.localeCompare(b.w, "ja"));
      return [{ date: "", words: all }];
    }

    const result = [...chapterMap.values()].map(ch => ({ date: ch.name, words: ch.words }));
    if (ungrouped.length > 0) result.push({ date: "未分组", words: ungrouped });
    return result;
  }, [allWords, tab, sortBy, progress, textbookChapters]);

  const totalInTab = groups.reduce((s, g) => s + g.words.length, 0);

  // Build map of real group sizes before slicing
  const groupSizes = useMemo(() => {
    const map = new Map<string, number>();
    for (const g of groups) map.set(g.date, g.words.length);
    return map;
  }, [groups]);

  // Slice groups to showCount total words for lazy load
  const slicedGroups = useMemo(() => {
    let remaining = showCount;
    const result: { date: string; words: WordEntry[] }[] = [];
    for (const g of groups) {
      if (remaining <= 0) break;
      const slice = g.words.slice(0, remaining);
      result.push({ date: g.date, words: slice });
      remaining -= slice.length;
    }
    return result;
  }, [groups, showCount]);

  const hasMore = slicedGroups.reduce((s, g) => s + g.words.length, 0) < totalInTab;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) setShowCount(c => c + 20); }, { threshold: 0.1 });
    ob.observe(el);
    return () => ob.disconnect();
  }, [hasMore, slicedGroups]);

  const toggleGroup = (date: string) => {
    const next = new Set(collapsed);
    next.has(date) ? next.delete(date) : next.add(date);
    setCollapsed(next);
  };

  const toggleWord = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const formatDate = (d: string) => {
    if (!d || d === "未分组") return d || "";
    const parts = d.split("-");
    if (parts.length === 3) return `${parseInt(parts[1])}月${parseInt(parts[2])}日`;
    return d;
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-bg flex items-center justify-between px-4 py-3">
        <button onClick={() => onNavigate("home")}
          className="flex items-center gap-1 text-hint active:opacity-60">
          <ArrowLeft size={20} strokeWidth={1.5} />
        </button>
        <span className="text-2xl font-semibold tracking-tight text-main">选择单词</span>
      </div>

      {/* Tabs — glass radio group */}
      <div className="px-4 pb-3">
        <div className="tab-radio-group">
          <input type="radio" name="tab" id="tab-all" checked={tab === "all"} onChange={() => { setTab("all"); setShowCount(20); }} />
          <label htmlFor="tab-all">全部</label>
          <input type="radio" name="tab" id="tab-learned" checked={tab === "learned"} onChange={() => { setTab("learned"); setShowCount(20); }} />
          <label htmlFor="tab-learned">已学</label>
          <input type="radio" name="tab" id="tab-unlearned" checked={tab === "unlearned"} onChange={() => { setTab("unlearned"); setShowCount(20); }} />
          <label htmlFor="tab-unlearned">未学</label>
          <div className="tab-glider" />
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between px-4 pb-3">
        <span className="text-xs text-sub">共{totalInTab}词</span>
        <button onClick={() => setSortBy(s => s === "time" ? "alpha" : "time")}
          className="flex items-center gap-1 text-xs text-hint">
          {sortBy === "time" ? "按时间排序" : "按字母排序"}
          <ChevronDown size={12} strokeWidth={1.5} />
        </button>
      </div>

      {/* Word list grouped by date */}
      <div className="flex-1 min-h-0 overflow-y-auto scroll-area px-4">
        {slicedGroups.map(g => {
          const isCollapsed = collapsed.has(g.date);
          return (
            <div key={g.date}>
              {/* Date / Chapter header */}
              {g.date ? (
                g.date === "未分组" ? (
                  <div className="py-2.5">
                    <span className="text-base font-bold text-main">未分组</span>
                    <span className="text-xs text-hint ml-2">{groupSizes.get(g.date)}词</span>
                  </div>
                ) : (
                  <div onClick={() => toggleGroup(g.date)}
                    className="flex items-center justify-between py-2.5 cursor-pointer active:bg-surface-hover -mx-2 px-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="size-5 rounded-full border-2 border-border-medium flex items-center justify-center">
                        {isCollapsed ? <ChevronRight size={12} className="text-hint" /> : <ChevronDown size={12} className="text-hint" />}
                      </span>
                      <span className="text-base font-bold text-main">
                        {tab === "learned" ? formatDate(g.date) : g.date}
                      </span>
                    </div>
                    <span className="text-xs text-hint">{groupSizes.get(g.date)}词</span>
                  </div>
                )
              ) : null}

              {/* Words under date/chapter */}
              {(!g.date || !isCollapsed) && (
                <div className={g.date ? "divide-y divide-surface-gray" : "divide-y divide-surface-gray"}>
                  {g.words.map(w => {
                    const active = selected.has(w.id);
                    return (
                      <div key={w.id} className="chk-row py-2.5 cursor-pointer" onClick={() => toggleWord(w.id)}>
                        <input type="checkbox" className="chk-input pointer-events-none" checked={active} readOnly />
                        <span className="chk-label flex items-center gap-3">
                          <div className="min-w-0 flex-1">
                            <span className="text-[15px] font-bold text-[#333]">{w.w}</span>
                            <span className="text-xs text-hint ml-2">{w.r}</span>
                          </div>
                          <span className="text-xs text-hint shrink-0">{w.m}</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        {hasMore && (
          <div ref={sentinelRef} className="flex items-center justify-center py-4">
            <span className="text-xs text-hint/50">加载中...</span>
          </div>
        )}
        <div className="h-4" />
      </div>

      {/* Bottom bar */}
      <div className="sticky bottom-0 z-10 flex items-center justify-between px-5 py-3 border-t border-border bg-white" style={{paddingBottom:"calc(0.75rem + env(safe-area-inset-bottom, 0px))"}}>
        <div className="flex items-center gap-2">
          <span className="text-sm text-sub">已选</span>
          <span className={`min-w-[22px] h-[22px] rounded-full flex items-center justify-center text-xs text-white font-bold ${
            selected.size > 0 ? "bg-danger" : "bg-hint/30"
          }`}>{selected.size}</span>
        </div>
        <button
          disabled={selected.size === 0}
          onClick={() => {
            localStorage.setItem("wl_selected", JSON.stringify([...selected]));
            onNavigate("listreview");
          }}
          className={`px-8 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            selected.size > 0 ? "bg-primary text-white" : "bg-disabled-dark text-hint"
          }`}>开始学习</button>
      </div>
    </div>
  );
}
