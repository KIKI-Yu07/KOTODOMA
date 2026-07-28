import { useState, useMemo } from "react";
import { ArrowLeft, RefreshCw, Zap } from "lucide-react";
import type { Page } from "../components/BottomNav";
import { loadProgress } from "../lib/spaced-repetition";
import { book2Data } from "../data/book2";

interface FlashReviewProps {
  onNavigate: (page: Page) => void;
  darkMode?: boolean;
}

const book1Words = [
  {w:"生活",r:"せいかつ",m:"生活"},{w:"経験",r:"けいけん",m:"经验"},{w:"出発",r:"しゅっぱつ",m:"出发"},{w:"到着",r:"とうちゃく",m:"到达"},{w:"準備",r:"じゅんび",m:"准备"},{w:"片付ける",r:"かたづける",m:"整理"},{w:"洗濯",r:"せんたく",m:"洗衣服"},{w:"掃除",r:"そうじ",m:"打扫"},{w:"料理",r:"りょうり",m:"烹饪"},{w:"買い物",r:"かいもの",m:"购物"},{w:"散歩",r:"さんぽ",m:"散步"},{w:"通勤",r:"つうきん",m:"通勤"},{w:"感動",r:"かんどう",m:"感动"},{w:"緊張",r:"きんちょう",m:"紧张"},{w:"安心",r:"あんしん",m:"放心"},{w:"満足",r:"まんぞく",m:"满足"},{w:"失望",r:"しつぼう",m:"失望"},{w:"我慢",r:"がまん",m:"忍耐"},{w:"努力",r:"どりょく",m:"努力"},{w:"感謝",r:"かんしゃ",m:"感谢"},{w:"尊敬",r:"そんけい",m:"尊敬"},{w:"信頼",r:"しんらい",m:"信赖"},
];

function getStudiedWords() {
  const progress = loadProgress();
  const studiedIds = new Set(Object.keys(progress).filter(id => progress[id].lastReview));
  const words: { word:string; reading:string; meaning:string }[] = [];
  for (const w of book1Words) { if (studiedIds.has(w.w)) words.push({word:w.w,reading:w.r,meaning:w.m}); }
  for (const ch of book2Data) { for (const w of ch.words) { if (studiedIds.has(w.id)) words.push({word:w.word,reading:w.reading,meaning:w.meaning}); } }
  return words;
}

export default function FlashReview({ onNavigate, darkMode }: FlashReviewProps) {
  const words = useMemo(() => {
    const studied = getStudiedWords();
    return studied.length > 0 ? studied : [{word:"まず勉強しましょう",reading:"",meaning:"请先学习新单词"}];
  }, []);

  const [flipped, setFlipped] = useState(false);
  const [wordIdx, setWordIdx] = useState(() => Math.floor(Math.random() * words.length));
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const nextWord = () => {
    setFlipped(false);
    setFeedback(null);
    setWordIdx(Math.floor(Math.random() * words.length));
  };

  const handleAnswer = (remembered: boolean) => {
    setFeedback(remembered ? "correct" : "wrong");
    setTimeout(nextWord, 800);
  };

  return (
    <>
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
                {wordIdx + 1} / {words.length}
              </span>
            </div>
            <button onClick={nextWord} className="w-7 h-7 rounded-full [#E8F2FB] dark:bg-primary-subtle flex items-center justify-center active:scale-90 transition-transform">
              <RefreshCw size={13} stroke="#0F64B5" />
            </button>
          </div>

          {/* Card */}
          <div
            onClick={() => words.length > 1 && !feedback && setFlipped(!flipped)}
            className={`relative w-full h-[180px] rounded-2xl cursor-pointer transition-all duration-500 ${
              feedback === "correct" ? "[#E8F2FB] dark:[#E8F2FB] scale-[0.97]" :
              feedback === "wrong" ? "bg-danger-subtle dark:[#FBEAE9] scale-[0.97]" :
              flipped ? "bg-primary-subtle dark:bg-primary-subtle" :
              "[#FFFBEA] dark:bg-primary-subtle"
            }`}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
              <div className={`transition-all duration-300 ${flipped ? "opacity-0 translate-y-[-10px] absolute" : "opacity-100"}`}>
                <span className="text-3xl font-bold text-main dark:text-main tracking-wider">{words[wordIdx].word}</span>
                {words.length > 1 && <p className="text-xs text-sub dark:text-hint mt-2">タップで答えを見る</p>}
              </div>
              <div className={`transition-all duration-300 ${flipped ? "opacity-100" : "opacity-0 translate-y-[10px] absolute"}`}>
                <p className="text-base font-semibold [#0F64B5]">{words[wordIdx].reading}</p>
                <p className="text-2xl font-bold text-main dark:text-main mt-2">{words[wordIdx].meaning}</p>
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
