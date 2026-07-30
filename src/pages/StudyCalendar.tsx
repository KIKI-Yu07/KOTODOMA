import { useState, useMemo } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import type { Page } from "../components/BottomNav";

interface Props { onNavigate: (p: Page) => void; }

export default function StudyCalendar({ onNavigate }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed

  const studyDays = parseInt(localStorage.getItem("studyDays") || "0");
  const studiedDates = useMemo(() => {
    try { return new Set(JSON.parse(localStorage.getItem("studyDates") || "[]")); }
    catch { return new Set<string>(); }
  }, []);

  // Generate calendar grid
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
  const todayInView = year === today.getFullYear() && month === today.getMonth();

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  const weekDays = ["日","月","火","水","木","金","土"];

  return (
    <div className="flex-1 min-h-0 overflow-y-auto scroll-area bg-bg">
      <div className="flex items-center justify-between px-4 py-2">
        <button onClick={() => onNavigate("vocab")}
          className="flex items-center gap-1 text-hint text-sm font-bold active:opacity-60">
          <ArrowLeft size={16} strokeWidth={2} />
        </button>
        <span className="text-2xl font-semibold tracking-tight text-main">打卡记录</span>
      </div>

      {/* Stats */}
      <div className="px-5 pt-4 pb-6">
        <div className="bg-white rounded-xl p-5 flex items-center justify-between">
          <div className="text-center flex-1">
            <p className="text-2xl font-bold text-main tabular-nums">{studyDays}</p>
            <p className="text-xs text-sub mt-1">累计打卡</p>
          </div>
          <div className="w-px h-10 bg-border" />
          <div className="text-center flex-1">
            <p className="text-2xl font-bold text-main tabular-nums">{studiedDates.size}</p>
            <p className="text-xs text-sub mt-1">学习天数</p>
          </div>
          <div className="w-px h-10 bg-border" />
          <div className="text-center flex-1">
            <p className="text-2xl font-bold text-main tabular-nums">
              {studiedDates.has(todayStr) ? "✓" : "-"}
            </p>
            <p className="text-xs text-sub mt-1">今日打卡</p>
          </div>
        </div>
      </div>

      {/* Month navigator */}
      <div className="flex items-center justify-between px-5 mb-3">
        <button onClick={prevMonth} className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-white active:scale-90">
          <ChevronLeft size={18} className="text-main" />
        </button>
        <span className="text-sm font-bold text-main">{year}年{month + 1}月</span>
        <button onClick={nextMonth} className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-white active:scale-90">
          <ChevronRight size={18} className="text-main" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="px-5 pb-8">
        <div className="bg-white rounded-xl overflow-hidden">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-border">
            {weekDays.map(d => (
              <div key={d} className="py-3 text-center text-xs font-medium text-sub">{d}</div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7">
            {/* Empty cells before first day */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`e${i}`} className="aspect-square" />
            ))}
            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isStudied = studiedDates.has(dateStr);
              const isToday = todayInView && day === today.getDate();

              return (
                <div key={day} className="aspect-square flex flex-col items-center justify-center">
                  {isToday ? (
                    <span className="size-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">{day}</span>
                  ) : (
                    <span className="text-sm text-main">{day}</span>
                  )}
                  {isStudied && (
                    <span className={`mt-0.5 rounded-full ${isToday ? "bg-white" : "bg-primary"} h-1 w-1`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="px-5 pb-8 flex items-center justify-center gap-6 text-xs text-sub">
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" />已打卡</span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary/20" />未打卡</span>
      </div>
    </div>
  );
}
