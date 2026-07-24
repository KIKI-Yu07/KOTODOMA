import { useState, useRef } from "react";
import { ArrowLeft, BookOpen, Bookmark, Pencil, CheckCircle } from "lucide-react";
import type { Page } from "../components/BottomNav";
import StatusBar from "../components/StatusBar";
import { book2Data } from "../data/book2";

interface WordListProps {
  onNavigate: (page: Page) => void;
  darkMode?: boolean;
}

interface Word {
  id: string;
  word: string;
  reading: string;
  meaning: string;
  pos: string;
  example: string;
  exampleReading: string;
  exampleMeaning: string;
}

interface Chapter {
  id: string;
  name: string;
  words: Word[];
}

interface Book {
  id: string;
  name: string;
  chapters: Chapter[];
}

const books: Book[] = [
  {
    id: "vol1",
    name: "第一册",
    chapters: [
      { id: "1", name: "第1課 · 日常・生活", words: [
        { id:"1-1", word:"生活", reading:"せいかつ", meaning:"生活", pos:"名詞", example:"日本での生活に慣れました。", exampleReading:"にほんでのせいかつになれました。", exampleMeaning:"已经习惯了在日本的生活。" },
        { id:"1-2", word:"経験", reading:"けいけん", meaning:"经验", pos:"名詞・スル", example:"留学の経験を活かしたい。", exampleReading:"りゅうがくのけいけんをいかしたい。", exampleMeaning:"想活用留学的经验。" },
        { id:"1-3", word:"出発", reading:"しゅっぱつ", meaning:"出发", pos:"名詞・スル", example:"明日の朝6時に出発します。", exampleReading:"あしたのあさ6じにしゅっぱつします。", exampleMeaning:"明天早上6点出发。" },
        { id:"1-4", word:"到着", reading:"とうちゃく", meaning:"到达", pos:"名詞・スル", example:"電車はまもなく到着します。", exampleReading:"でんしゃはまもなくとうちゃくします。", exampleMeaning:"电车马上就要到了。" },
        { id:"1-5", word:"準備", reading:"じゅんび", meaning:"准备", pos:"名詞・スル", example:"旅行の準備はもうできた？", exampleReading:"りょこうのじゅんびはもうできた？", exampleMeaning:"旅行的准备已经做好了吗？" },
        { id:"1-6", word:"片付ける", reading:"かたづける", meaning:"整理/收拾", pos:"動詞Ⅱ", example:"部屋をきれいに片付けてください。", exampleReading:"へやをきれいにかたづけてください。", exampleMeaning:"请把房间收拾干净。" },
        { id:"1-7", word:"洗濯", reading:"せんたく", meaning:"洗衣服", pos:"名詞・スル", example:"今日は洗濯日和ですね。", exampleReading:"きょうはせんたくびよりですね。", exampleMeaning:"今天是适合洗衣服的好天气呢。" },
        { id:"1-8", word:"掃除", reading:"そうじ", meaning:"打扫", pos:"名詞・スル", example:"週末に家の掃除をします。", exampleReading:"しゅうまつにいえのそうじをします。", exampleMeaning:"周末打扫家里。" },
        { id:"1-9", word:"料理", reading:"りょうり", meaning:"烹饪", pos:"名詞・スル", example:"母の料理は世界一おいしい。", exampleReading:"ははのりょうりはせかいいちおいしい。", exampleMeaning:"妈妈做的菜是世界上最好吃的。" },
        { id:"1-10", word:"買い物", reading:"かいもの", meaning:"购物", pos:"名詞・スル", example:"デパートへ買い物に行きました。", exampleReading:"デパートへかいものにいきました。", exampleMeaning:"去百货商店购物了。" },
        { id:"1-11", word:"散歩", reading:"さんぽ", meaning:"散步", pos:"名詞・スル", example:"毎朝公園を散歩しています。", exampleReading:"まいあさこうえんをさんぽしています。", exampleMeaning:"每天早上在公园散步。" },
        { id:"1-12", word:"通勤", reading:"つうきん", meaning:"通勤", pos:"名詞・スル", example:"通勤に1時間かかります。", exampleReading:"つうきんに1じかんかかります。", exampleMeaning:"通勤需要一个小时。" },
      ]},
      { id: "2", name: "第2課 · 感情・状態", words: [
        { id:"2-1", word:"感動", reading:"かんどう", meaning:"感动", pos:"名詞・スル", example:"映画に感動して涙が出た。", exampleReading:"えいがにかんどうしてなみだがでた。", exampleMeaning:"被电影感动得流泪了。" },
        { id:"2-2", word:"緊張", reading:"きんちょう", meaning:"紧张", pos:"名詞・スル", example:"面接前はいつも緊張します。", exampleReading:"めんせつまえはいつもきんちょうします。", exampleMeaning:"面试前总是很紧张。" },
        { id:"2-3", word:"安心", reading:"あんしん", meaning:"放心", pos:"名詞・スル", example:"無事だと聞いて安心した。", exampleReading:"ぶじだときいてあんしんした。", exampleMeaning:"听说平安无事就放心了。" },
        { id:"2-4", word:"満足", reading:"まんぞく", meaning:"满足", pos:"名詞・スル", example:"今の生活に満足しています。", exampleReading:"いまのせいかつにまんぞくしています。", exampleMeaning:"对现在的生活很满足。" },
        { id:"2-5", word:"失望", reading:"しつぼう", meaning:"失望", pos:"名詞・スル", example:"結果に失望してしまった。", exampleReading:"けっかにしつぼうしてしまった。", exampleMeaning:"对结果感到失望了。" },
        { id:"2-6", word:"我慢", reading:"がまん", meaning:"忍耐", pos:"名詞・スル", example:"もう我慢できない！", exampleReading:"もうがまんできない！", exampleMeaning:"已经忍无可忍了！" },
        { id:"2-7", word:"努力", reading:"どりょく", meaning:"努力", pos:"名詞・スル", example:"努力は必ず報われる。", exampleReading:"どりょくはかならずむくわれる。", exampleMeaning:"努力一定会有回报。" },
        { id:"2-8", word:"感謝", reading:"かんしゃ", meaning:"感谢", pos:"名詞・スル", example:"ご支援に心から感謝します。", exampleReading:"ごしえんにこころからかんしゃします。", exampleMeaning:"衷心感谢您的支持。" },
        { id:"2-9", word:"尊敬", reading:"そんけい", meaning:"尊敬", pos:"名詞・スル", example:"彼はみんなから尊敬されている。", exampleReading:"かれはみんなからそんけいされている。", exampleMeaning:"他受到大家的尊敬。" },
        { id:"2-10", word:"信頼", reading:"しんらい", meaning:"信赖", pos:"名詞・スル", example:"信頼できる友達がいる。", exampleReading:"しんらいできるともだちがいる。", exampleMeaning:"有值得信赖的朋友。" },
      ]},
    ],
  },
  {
    id: "vol2",
    name: "第二册",
    chapters: book2Data,  },
];

export default function WordList({ onNavigate, darkMode }: WordListProps) {
  const [selectedBookId, setSelectedBookId] = useState(books[0].id);
  const [selectedChapterId, setSelectedChapterId] = useState(books[0].chapters[0].id);
  const [bookOpen, setBookOpen] = useState(false);
  const [chapterOpen, setChapterOpen] = useState(false);
  const [openSwipeId, setOpenSwipeId] = useState<string | null>(null);
  const [animKey, setAnimKey] = useState(0);
  const swipeX = useRef<Record<string, number>>({});
  const [, tick] = useState(0);
  const touchStart = useRef(0);

  const selectedBook = books.find((b) => b.id === selectedBookId)!;
  const selectedChapter = selectedBook.chapters.find((c) => c.id === selectedChapterId)!;

  const handleBookChange = (bookId: string) => {
    setSelectedBookId(bookId);
    const book = books.find((b) => b.id === bookId)!;
    setSelectedChapterId(book.chapters[0].id);
    setBookOpen(false);
    setOpenSwipeId(null);
    swipeX.current = {};
    setAnimKey(k => k + 1);
  };

  const handleChapterChange = (chapterId: string) => {
    setSelectedChapterId(chapterId);
    setChapterOpen(false);
    setOpenSwipeId(null);
    swipeX.current = {};
    setAnimKey(k => k + 1);
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
        <span className="text-lg font-bold text-main dark:text-main">単語リスト</span>
      </div>

      {/* Selection form */}
      <div className="px-4 pb-3 space-y-2">
        <div className="relative">
          <button
            onClick={() => { setBookOpen(!bookOpen); setChapterOpen(false); }}
            className="w-full card rounded-xl px-4 py-3 flex items-center justify-between font-semibold text-main dark:text-main"
          >
            <div className="flex items-center gap-2.5">
              <BookOpen size={16} stroke="#0F64B5" />
              <span className="text-sm">{selectedBook.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-sub dark:text-hint font-normal">{selectedBook.chapters.length}章</span>
              <div className={`picker-bar ${bookOpen ? 'open' : ''}`}>
                <span className="top" /><span className="middle" /><span className="bottom" />
              </div>
            </div>
          </button>
          <div className={`dropdown-menu absolute top-full left-0 right-0 mt-1 bg-white dark:bg-surface rounded-xl shadow-lg z-30 ${bookOpen ? 'open' : ''}`}>
            {books.map((b) => (
              <button key={b.id} onClick={() => handleBookChange(b.id)}
                className={`dropdown-item w-full px-4 py-3 text-left flex items-center justify-between ${selectedBookId === b.id ? "text-primary" : "text-main dark:text-main"}`}>
                <span className="text-sm font-semibold">{b.name}</span>
                {selectedBookId === b.id && <span className="text-[10px]">✓</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => { setChapterOpen(!chapterOpen); setBookOpen(false); }}
            className="w-full card rounded-xl px-4 py-3 flex items-center justify-between font-semibold text-main dark:text-main"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-bold [#D13838]">第{selectedChapter.id}課</span>
              <span className="text-sm">{selectedChapter.name.split("·")[1]?.trim() || selectedChapter.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] [#0F64B5] font-normal">{selectedChapter.words.length}語</span>
              <div className={`picker-bar ${chapterOpen ? 'open' : ''}`}>
                <span className="top" /><span className="middle" /><span className="bottom" />
              </div>
            </div>
          </button>
          <div className={`dropdown-menu absolute top-full left-0 right-0 mt-1 bg-white dark:bg-surface rounded-xl shadow-lg z-30 max-h-[184px] overflow-y-auto scroll-area ${chapterOpen ? 'open' : ''}`}>
            {selectedBook.chapters.map((ch) => (
              <button key={ch.id} onClick={() => handleChapterChange(ch.id)}
                className={`dropdown-item w-full px-4 py-3 text-left flex items-center justify-between ${selectedChapterId === ch.id ? "[#D13838]" : "text-main dark:text-main"}`}>
                <span className="text-sm font-semibold">{ch.name}</span>
                <span className="text-[10px] [#0F64B5]">{ch.words.length}語</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 px-1">
          <span className="text-[10px] text-sub dark:text-hint">
            已学 {selectedChapter.words.length - 2}/{selectedChapter.words.length} 词
          </span>
          <div className="flex-1 h-1 [#E8F2FB] dark:bg-primary-subtle rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${Math.round((selectedChapter.words.length - 2) / selectedChapter.words.length * 100)}%` }} />
          </div>
        </div>
      </div>

      {/* Word List */}
      <div className="flex-1 min-h-0 overflow-y-auto scroll-area px-4 pb-4">
        <div key={animKey} className="space-y-2">
          {selectedChapter.words.map((w, i) => {
            const offset = swipeX.current[w.id] || 0;
            const isOpen = openSwipeId === w.id;
            return (
              <div key={w.id} className={`relative h-[72px] overflow-hidden rounded-[8px] ${i % 2 === 0 ? "word-slide-right" : "word-slide-left"}`} style={{ animationDelay: `${i * 0.04}s` }}>
                {/* Action bar + spine — fixed, revealed when card slides right */}
                <div className="absolute inset-y-0 left-0 flex items-stretch z-0">
                  <div className="flex items-stretch rounded-l-[8px] overflow-hidden" style={{ width: 180 }}>
                    <button onClick={() => { swipeX.current[w.id] = 0; setOpenSwipeId(null); tick(n => n + 1); }} className="flex-1 flex flex-col items-center justify-center gap-1 bg-[#EB5C20] active:opacity-80">
                      <Bookmark size={18} stroke="#fff" fill="#fff" />
                      <span className="text-[9px] text-white font-semibold">标记</span>
                    </button>
                    <button onClick={() => { swipeX.current[w.id] = 0; setOpenSwipeId(null); tick(n => n + 1); }} className="flex-1 flex flex-col items-center justify-center gap-1 [#0F64B5] active:opacity-80">
                      <Pencil size={18} stroke="#fff" />
                      <span className="text-[9px] text-white font-semibold">编辑</span>
                    </button>
                    <button onClick={() => { swipeX.current[w.id] = 0; setOpenSwipeId(null); tick(n => n + 1); }} className="flex-1 flex flex-col items-center justify-center gap-1 bg-primary active:opacity-80">
                      <CheckCircle size={18} stroke="#fff" fill="#fff" />
                      <span className="text-[9px] text-white font-semibold">熟记</span>
                    </button>
                  </div>
                  {/* Spine — bridges action bar and card, visible when open */}
                  <div className={`w-[16px] h-full transition-colors ${isOpen ? "bg-primary-subtle" : "bg-primary-subtle"}`} />
                </div>

                {/* Card that slides right */}
                <div
                  className="absolute inset-y-0 left-0 card flex items-stretch z-10 select-none !rounded-[8px]"
                  style={{
                    width: '100%',
                    borderRadius: offset > 0 ? '0 8px 8px 0' : '8px',
                    transform: `translateX(${offset}px)`,
                    transition: offset === 0 || offset === 180 ? 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
                    touchAction: 'pan-y',
                  }}
                  onTouchStart={(e) => { touchStart.current = e.touches[0].clientX; }}
                  onTouchMove={(e) => {
                    const dx = e.touches[0].clientX - touchStart.current;
                    if (Math.abs(dx) > 8) e.preventDefault();
                    swipeX.current[w.id] = Math.max(0, Math.min(180, Math.round(dx)));
                    tick(n => n + 1);
                  }}
                  onTouchEnd={() => {
                    const dx = swipeX.current[w.id] || 0;
                    swipeX.current[w.id] = dx > 50 ? 180 : 0;
                    setOpenSwipeId(dx > 50 ? w.id : null);
                    tick(n => n + 1);
                  }}
                  onMouseDown={(e) => { touchStart.current = e.clientX; }}
                  onMouseMove={(e) => {
                    if (e.buttons === 1) {
                      const dx = e.clientX - touchStart.current;
                      swipeX.current[w.id] = Math.max(0, Math.min(180, Math.round(dx)));
                      tick(n => n + 1);
                    }
                  }}
                  onMouseUp={() => {
                    const dx = swipeX.current[w.id] || 0;
                    swipeX.current[w.id] = dx > 50 ? 180 : 0;
                    setOpenSwipeId(dx > 50 ? w.id : null);
                    tick(n => n + 1);
                  }}
                  onMouseLeave={() => {
                    const dx = swipeX.current[w.id] || 0;
                    if (dx > 0 && dx < 180) { swipeX.current[w.id] = dx > 50 ? 180 : 0; tick(n => n + 1); }
                  }}
                >
                  {/* Word content */}
                  <div className="flex-1 min-w-0 p-3.5 flex items-center">
                    <div className="flex items-center justify-between w-full">
                      <div className="min-w-0 flex-1">
                        <span className="text-[11px] text-primary block">{w.reading}</span>
                        <span className="text-[16px] font-bold text-main dark:text-main block leading-tight">{w.word}</span>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md [#E8F2FB] dark:bg-primary-subtle [#0F64B5] inline-block">{w.pos}</span>
                        <p className="text-[13px] font-medium text-sub dark:text-hint mt-1">{w.meaning}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="h-4" />
      </div>
    </>
  );
}
