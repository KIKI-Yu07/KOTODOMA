import { useState, useMemo, useCallback, useRef } from "react";
import { ArrowLeft, Zap, AlertTriangle } from "lucide-react";
import type { Page } from "../components/BottomNav";
import StatusBar from "../components/StatusBar";
import { loadProgress, answerWord, getReviewCount, WordProgress } from "../lib/spaced-repetition";

interface StudyPageProps { onNavigate: (p: Page) => void; darkMode?: boolean; }

const allWords = [
  { id:"1-1",word:"生活",reading:"せいかつ",meaning:"生活",pos:"名詞"},{id:"1-2",word:"経験",reading:"けいけん",meaning:"经验",pos:"名詞・スル"},{id:"1-3",word:"出発",reading:"しゅっぱつ",meaning:"出发",pos:"名詞・スル"},{id:"1-4",word:"到着",reading:"とうちゃく",meaning:"到达",pos:"名詞・スル"},{id:"1-5",word:"準備",reading:"じゅんび",meaning:"准备",pos:"名詞・スル"},{id:"1-6",word:"片付ける",reading:"かたづける",meaning:"整理/收拾",pos:"動詞Ⅱ"},{id:"1-7",word:"洗濯",reading:"せんたく",meaning:"洗衣服",pos:"名詞・スル"},{id:"1-8",word:"掃除",reading:"そうじ",meaning:"打扫",pos:"名詞・スル"},{id:"1-9",word:"料理",reading:"りょうり",meaning:"烹饪",pos:"名詞・スル"},{id:"1-10",word:"買い物",reading:"かいもの",meaning:"购物",pos:"名詞・スル"},{id:"1-11",word:"散歩",reading:"さんぽ",meaning:"散步",pos:"名詞・スル"},{id:"1-12",word:"通勤",reading:"つうきん",meaning:"通勤",pos:"名詞・スル"},{id:"2-1",word:"感動",reading:"かんどう",meaning:"感动",pos:"名詞・スル"},{id:"2-2",word:"緊張",reading:"きんちょう",meaning:"紧张",pos:"名詞・スル"},{id:"2-3",word:"安心",reading:"あんしん",meaning:"放心",pos:"名詞・スル"},{id:"2-4",word:"満足",reading:"まんぞく",meaning:"满足",pos:"名詞・スル"},{id:"2-5",word:"失望",reading:"しつぼう",meaning:"失望",pos:"名詞・スル"},{id:"2-6",word:"我慢",reading:"がまん",meaning:"忍耐",pos:"名詞・スル"},{id:"2-7",word:"努力",reading:"どりょく",meaning:"努力",pos:"名詞・スル"},{id:"2-8",word:"感謝",reading:"かんしゃ",meaning:"感谢",pos:"名詞・スル"},{id:"2-9",word:"尊敬",reading:"そんけい",meaning:"尊敬",pos:"名詞・スル"},{id:"2-10",word:"信頼",reading:"しんらい",meaning:"信赖",pos:"名詞・スル"},
];

function getOptions(correct: string, all: string[]): string[] {
  const wrongs = all.filter(m => m !== correct);
  const picks = shuffle(wrongs).slice(0, 3);
  return shuffle([correct, ...picks]);
}

export default function StudyPage({ onNavigate, darkMode }: StudyPageProps) {
  const dailyGoal = parseInt(localStorage.getItem("dailyGoal") || "15");
  const allMeanings = useMemo(() => allWords.map(w => w.meaning), []);
  const today = new Date().toISOString().slice(0, 10);
  const progress = useMemo(() => loadProgress(), []);

  // Build session: review words due today + new words up to dailyGoal
  const sessionWords = useMemo(() => {
    const dueNow = allWords.filter(w => {
      const p = progress[w.id];
      return p && p.nextReview <= today;
    });
    const doneIds = new Set(Object.keys(progress));
    const newPool = allWords.filter(w => !doneIds.has(w.id));
    const newCount = Math.max(0, dailyGoal - dueNow.length);
    const newWords = shuffle(newPool).slice(0, newCount);
    return shuffle([...dueNow, ...newWords]);
  }, [dailyGoal, progress, today]);

  const [queue, setQueue] = useState(() => sessionWords.map(w => w.id));
  const [picked, setPicked] = useState<string | null>(null);
  const [rightCount, setRightCount] = useState<Record<string, number>>({});
  const [done, setDone] = useState(false);
  const [totalRight, setTotalRight] = useState(0);
  const [showExit, setShowExit] = useState(false);
  const answerBuffer = useRef<Record<string, boolean>>({}); // buffer answers, commit only on done

  const currentId = queue[0];
  const current = allWords.find(w => w.id === currentId) || allWords[0];
  const [options, setOptions] = useState(() => getOptions(current.meaning, allMeanings));

  const handleBack = () => { setShowExit(true); };
  const confirmExit = () => { answerBuffer.current = {}; onNavigate("home"); };
  const cancelExit = () => { setShowExit(false); };

  const choose = useCallback((opt: string) => {
    if (picked || done || !current) return;
    setPicked(opt);
    const correct = opt === current.meaning;
    answerBuffer.current[current.id] = correct; // buffer, don't save yet
    const rc = { ...rightCount };
    if (correct) { rc[current.id] = (rc[current.id] || 0) + 1; setRightCount(rc); setTotalRight(t => t + 1); }
    setTimeout(() => {
      const rest = queue.slice(1);
      if (correct) {
        if (Object.keys(rc).length >= sessionWords.length) {
          // All mastered! Commit buffer to storage
          for (const [id, isCorrect] of Object.entries(answerBuffer.current)) {
            answerWord(id, isCorrect);
          }
          // Track study days
          const today = new Date().toISOString().slice(0,10);
          const lastStudy = localStorage.getItem("lastStudyDate") || "";
          if (lastStudy !== today) {
            const days = parseInt(localStorage.getItem("studyDays") || "0") + 1;
            localStorage.setItem("studyDays", String(days));
            localStorage.setItem("lastStudyDate", today);
          }
          setDone(true); return;
        }
        setQueue([...rest, current.id]);
      } else {
        const pos = Math.min(2, rest.length);
        setQueue([...rest.slice(0, pos), current.id, ...rest.slice(pos)]);
      }
      const nextId = rest[0] || current.id;
      setOptions(getOptions(allWords.find(w => w.id === nextId)?.meaning || "", allMeanings));
      setPicked(null);
    }, 600);
  }, [picked, queue, current, rightCount, sessionWords, allMeanings, done]);

  if (done) return (<>
    <StatusBar darkMode={darkMode} />
    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
      {/* Confetti — 16 random positions × 36 = 576 ribbons */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{zIndex:50}}>
        {(()=>{const origins=Array.from({length:16},()=>({ox:Math.random()*90+5+"%",oy:Math.random()*90+5+"%"}));return origins;})().
          flatMap(o=>Array.from({length:36},(_,i)=>{
            const angle = Math.random()*Math.PI*2, dist = 30+Math.random()*90;
            const colors = ["#ff6584","#6c63ff","#ffd700","#3f3d56","#ff6584","#6c63ff"];
            return {c:colors[i%6],x:Math.cos(angle)*dist,y:Math.sin(angle)*dist,r:(Math.random()-0.5)*180,i,ox:o.ox,oy:o.oy};
          })).map((p,i)=>(
          <span key={i} className="absolute block" style={{left:p.ox,top:p.oy,width:5,height:2,borderRadius:1,background:p.c,opacity:0.8,
            animation:`confetti 2.2s ease-out forwards`,
            ["--x" as any]:`${p.x}px`,["--y" as any]:`${p.y}px`,["--r" as any]:`${p.r}deg`}} />
        ))}
      </div>
      <div className="relative w-48 h-48 mb-4 flex items-center justify-center">
        <img src="/icons/complete.svg" alt="" className="w-full h-full object-contain opacity-70" />
        {/* Dancing notes */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 200 200">
          {[
            {x:25,y:65,c:"#ff6584",t:"♪",s:20,d:0,speed:1.3},
            {x:155,y:55,c:"#6c63ff",t:"♫",s:18,d:0.2,speed:1.6},
            {x:15,y:140,c:"#ff6584",t:"♪",s:24,d:0.5,speed:1.1},
            {x:165,y:145,c:"#6c63ff",t:"♫",s:16,d:0.7,speed:1.5},
            {x:100,y:35,c:"#3f3d56",t:"♪",s:22,d:1.0,speed:1.8},
            {x:60,y:120,c:"#ffd700",t:"♫",s:19,d:0.35,speed:1.4},
          ].map((n,i)=>(
            <text key={i} x={n.x} y={n.y} fontSize={n.s} fill={n.c} fontWeight="bold"
              style={{animation:`bounce ${n.speed}s ease-in-out infinite`,animationDelay:`${n.d}s`,transformOrigin:`${n.x}px ${n.y}px`}}>{n.t}</text>
          ))}
        </svg>
      </div>
      <h2 className="text-xl font-bold text-main mb-1">学習完了！</h2>
      <p className="text-sm text-sub mb-2">{sessionWords.length} 語学習しました</p>
      <p className="text-xs text-hint">正解: {totalRight} | 明日の復習: {getReviewCount()} 語</p>
      <button onClick={()=>onNavigate("home")} className="mt-6 px-8 py-3 bg-primary text-white rounded-full text-sm font-bold active:scale-95">ホームへ戻る</button>
    </div>
  </>);

  if (sessionWords.length === 0) { onNavigate("rest"); return null; }

  return (<>
    <StatusBar darkMode={darkMode} />
    <div className="flex items-center gap-3 px-4 py-2">
      <button onClick={handleBack} className="flex items-center gap-1 text-hint text-sm font-bold active:opacity-60"><ArrowLeft size={16} stroke="var(--color-text-tertiary)" strokeWidth={2}/><span>戻る</span></button>
      <span className="text-[15px] font-semibold text-main">単語学習</span>
      <span className="ml-auto text-sm font-bold text-sub">✓ {totalRight}</span>
    </div>
    <div className="flex-1 flex flex-col items-center justify-center px-4">
      <p className="text-[40px] font-extrabold text-main tracking-wider" dangerouslySetInnerHTML={{__html:rubyText(current.word,current.reading)}}/>
      <p className="text-xs text-hint mt-1">{current.pos}</p>
    </div>
    {showExit && (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40" onClick={cancelExit}>
        <div className="bg-surface rounded-2xl p-5 mx-8 shadow-xl text-center" onClick={e=>e.stopPropagation()}>
          <AlertTriangle size={32} className="text-warning mx-auto mb-2" />
          <h3 className="font-bold text-main mb-1">学習を中断しますか？</h3>
          <p className="text-xs text-sub mb-4">まだ完了していない単語の進捗は保存されません</p>
          <div className="flex gap-2">
            <button onClick={cancelExit} className="flex-1 py-2.5 rounded-xl bg-primary-subtle text-primary text-sm font-bold">続ける</button>
            <button onClick={confirmExit} className="flex-1 py-2.5 rounded-xl bg-danger text-white text-sm font-bold">中断する</button>
          </div>
        </div>
      </div>
    )}
    <div className="px-4 pb-4">
      <div className="grid grid-cols-2 gap-3 w-full max-w-[340px] mx-auto">
        {options.map((opt,i)=>{
          const isCorrect=opt===current.meaning;
          const isPicked=picked===opt;
          const show=picked!==null;
          const base = "h-[76px] rounded-2xl border-2 font-bold text-[13px] flex items-center justify-center text-center px-3 transition-all active:scale-[0.97]";
          let style = "bg-surface border-border text-main";
          if (show) {
            if (isCorrect) style = "bg-success-subtle border-success text-success shadow-sm";
            else if (isPicked && !isCorrect) style = "bg-danger-subtle border-danger text-danger shadow-sm";
            else style = "bg-surface border-border text-main opacity-30";
          }
          return (<button key={i} onClick={()=>choose(opt)} className={`${base} ${style}`}>{opt}</button>);
        })}
      </div>
    </div>
  </>);
}

function rubyText(word:string,reading:string):string{
  const hasKanji=/[一-鿿]/.test(word);if(!hasKanji)return word;
  let kanaStart=word.length;for(let i=word.length-1;i>=0;i--){if(/[一-鿿]/.test(word[i])){kanaStart=i+1;break;}}
  const kanjiPart=word.slice(0,kanaStart);const kanaSuffix=word.slice(kanaStart);
  let readingKanji=reading;if(kanaSuffix&&reading.endsWith(kanaSuffix))readingKanji=reading.slice(0,-kanaSuffix.length);
  return `<ruby>${kanjiPart}<rt>${readingKanji}</rt></ruby>${kanaSuffix}`;
}
function shuffle<T>(arr:T[]):T[]{const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
