import { useState } from "react";
import { ArrowLeft, RefreshCw, Zap } from "lucide-react";
import type { Page } from "../components/BottomNav";
import StatusBar from "../components/StatusBar";

interface FlashReviewProps {
  onNavigate: (page: Page) => void;
  darkMode?: boolean;
}

const reviewWords = [
  { word: "挑戦", reading: "ちょうせん", meaning: "挑战" },
  { word: "努力", reading: "どりょく", meaning: "努力" },
  { word: "経験", reading: "けいけん", meaning: "经验" },
  { word: "確認", reading: "かくにん", meaning: "确认" },
  { word: "準備", reading: "じゅんび", meaning: "准备" },
  { word: "安心", reading: "あんしん", meaning: "放心/安心" },
  { word: "約束", reading: "やくそく", meaning: "约定/承诺" },
  { word: "感動", reading: "かんどう", meaning: "感动" },
];

export default function FlashReview({ onNavigate, darkMode }: FlashReviewProps) {
  const [flipped, setFlipped] = useState(false);
  const [wordIdx, setWordIdx] = useState(() => Math.floor(Math.random() * reviewWords.length));
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const nextWord = () => {
    setFlipped(false);
    setFeedback(null);
    setWordIdx((wordIdx + 1) % reviewWords.length);
  };

  const handleAnswer = (remembered: boolean) => {
    setFeedback(remembered ? "correct" : "wrong");
    setTimeout(nextWord, 800);
  };

  return (
    <>
      <StatusBar darkMode={darkMode} />
      <div className="flex items-center justify-between px-4 py-2">
        <button onClick={() => onNavigate("home")}
          className="flex items-center gap-1 text-hint text-sm font-bold active:opacity-60 transition-opacity">
          <ArrowLeft size={16} stroke="var(--color-text-tertiary)" strokeWidth={2} />
          <span>戻る</span>
        </button>
        <span className="text-lg font-bold text-main dark:text-main">瞬間レビュー</span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scroll-area px-4 pb-4 space-y-4">
        {/* Flashcard */}
        <div className="card rounded-[20px] p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap size={16} fill="#EB5C20" stroke="#EB5C20" />
              <span className="font-bold text-[15px] text-main dark:text-main">
                {wordIdx + 1} / {reviewWords.length}
              </span>
            </div>
            <button onClick={nextWord} className="w-7 h-7 rounded-full [#E8F2FB] dark:bg-primary-subtle flex items-center justify-center active:scale-90 transition-transform">
              <RefreshCw size={13} stroke="#0F64B5" />
            </button>
          </div>

          {/* Card */}
          <div
            onClick={() => !feedback && setFlipped(!flipped)}
            className={`relative w-full h-[180px] rounded-2xl cursor-pointer transition-all duration-500 ${
              feedback === "correct" ? "[#E8F2FB] dark:[#E8F2FB] scale-[0.97]" :
              feedback === "wrong" ? "bg-danger-subtle dark:[#FBEAE9] scale-[0.97]" :
              flipped ? "bg-primary-subtle dark:bg-primary-subtle" :
              "[#FFFBEA] dark:bg-primary-subtle"
            }`}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
              <div className={`transition-all duration-300 ${flipped ? "opacity-0 translate-y-[-10px] absolute" : "opacity-100"}`}>
                <span className="text-3xl font-bold text-main dark:text-main tracking-wider">{reviewWords[wordIdx].word}</span>
                <p className="text-xs text-sub dark:text-hint mt-2">タップで答えを見る</p>
              </div>
              <div className={`transition-all duration-300 ${flipped ? "opacity-100" : "opacity-0 translate-y-[10px] absolute"}`}>
                <p className="text-base font-semibold [#0F64B5]">{reviewWords[wordIdx].reading}</p>
                <p className="text-2xl font-bold text-main dark:text-main mt-2">{reviewWords[wordIdx].meaning}</p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className={`flex gap-3 mt-4 transition-all duration-300 ${flipped && !feedback ? "opacity-100 max-h-12" : "opacity-0 max-h-0 overflow-hidden"}`}>
            <button onClick={() => handleAnswer(false)} className="flex-1 py-3 rounded-full text-sm font-semibold bg-danger-subtle dark:[#FBEAE9] [#D13838] active:scale-95 transition-transform">
              ✕ 忘れた
            </button>
            <button onClick={() => handleAnswer(true)} className="flex-1 py-3 rounded-full text-sm font-semibold [#E8F2FB] dark:[#E8F2FB] [#0F64B5] active:scale-95 transition-transform">
              ✓ 覚えた
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="card rounded-[20px] p-4">
          <h3 className="font-bold text-[15px] text-main dark:text-main mb-3">学習状況</h3>
          <div className="flex gap-3">
            {[
              { n: 5, label: "覚えた", color: "#0F64B5" },
              { n: 2, label: "もう少し", color: "#EB5C20" },
              { n: 1, label: "未学習", color: "#D13838" },
            ].map((s, i) => (
              <div key={i} className="flex-1 text-center [#FFFBEA] dark:bg-primary-subtle rounded-xl p-3">
                <p className="text-xl font-bold" style={{ color: s.color }}>{s.n}</p>
                <p className="text-[10px] text-sub dark:text-hint">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="h-2" />
      </div>
    </>
  );
}
