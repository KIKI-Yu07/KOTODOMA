import { useState, useMemo } from "react";
import { ArrowLeft, Zap } from "lucide-react";
import type { Page } from "../components/BottomNav";
import StatusBar from "../components/StatusBar";

interface Props { onNavigate: (p: Page) => void; darkMode?: boolean; mode: "zh2jp" | "spell"; }

const rawWords = [
  { w:"生活",r:"せいかつ",m:"生活" },{ w:"経験",r:"けいけん",m:"经验" },{ w:"出発",r:"しゅっぱつ",m:"出发" },
  { w:"到着",r:"とうちゃく",m:"到达" },{ w:"準備",r:"じゅんび",m:"准备" },{ w:"感動",r:"かんどう",m:"感动" },
  { w:"緊張",r:"きんちょう",m:"紧张" },{ w:"安心",r:"あんしん",m:"放心" },{ w:"満足",r:"まんぞく",m:"满足" },
  { w:"努力",r:"どりょく",m:"努力" },{ w:"感謝",r:"かんしゃ",m:"感谢" },{ w:"尊敬",r:"そんけい",m:"尊敬" },
  { w:"小学校",r:"しょうがっこう",m:"小学" },{ w:"専門",r:"せんもん",m:"专业" },{ w:"話題",r:"わだい",m:"话题" },
  { w:"作文",r:"さくぶん",m:"作文" },{ w:"成績",r:"せいせき",m:"成绩" },{ w:"完璧",r:"かんぺき",m:"完美" },
  { w:"目標",r:"もくひょう",m:"目标" },{ w:"教科書",r:"きょうかしょ",m:"教科书" },
];

function shuffle<T>(arr: T[]): T[] { const a = [...arr]; for (let i = a.length-1; i>0; i--) { const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

export default function MatchGame({ onNavigate, darkMode, mode }: Props) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [right, setRight] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [done, setDone] = useState(false);

  const words = useMemo(() => shuffle(rawWords).slice(0, 10), []);
  const cur = words[idx];
  const allWs = useMemo(() => rawWords.map(w => w.w), []);
  const options = useMemo(() => {
    const wrongs = shuffle(allWs.filter(w => w !== cur.w)).slice(0, 3);
    return shuffle([cur.w, ...wrongs]);
  }, [cur, allWs]);

  const answer = (opt: string) => {
    if (picked) return;
    setPicked(opt);
    if (opt === cur.w) setRight(r => r + 1); else setWrong(w => w + 1);
    setTimeout(() => {
      if (idx + 1 >= words.length) { setDone(true); return; }
      setIdx(idx + 1); setPicked(null);
    }, 600);
  };

  if (done) return (<>
    <StatusBar darkMode={darkMode} />
    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
      <Zap size={36} className="text-primary mb-4" />
      <h2 className="text-xl font-bold text-main">完成！</h2>
      <div className="flex gap-6 mt-2 text-sm"><span className="text-success font-bold">✓ {right}</span><span className="text-danger font-bold">✗ {wrong}</span></div>
      <button onClick={()=>onNavigate("home")} className="mt-6 px-6 py-3 bg-primary text-white rounded-full text-sm font-bold active:scale-95">返回</button>
    </div>
  </>);

  return (<>
    <StatusBar darkMode={darkMode} />
    <div className="flex items-center justify-between px-4 py-2">
      <button onClick={()=>onNavigate("home")} className="flex items-center gap-1 text-hint text-sm font-bold active:opacity-60"><ArrowLeft size={16} stroke="var(--color-text-tertiary)" strokeWidth={2}/><span>戻る</span></button>
      <span className="text-lg font-bold text-main">{mode === "zh2jp" ? "中日选词" : "组合拼写"}</span>
      <span className="text-sm font-bold text-sub">{idx + 1}/{words.length}</span>
    </div>
    <div className="flex-1 flex flex-col items-center justify-center px-4">
      {mode === "zh2jp" ? (
        <p className="text-2xl font-extrabold text-main mb-8">{cur.m}</p>
      ) : (
        <div className="flex gap-2 mb-8 flex-wrap justify-center">
          {shuffle(cur.w.split("")).map((ch, i) => (
            <span key={i} className="w-12 h-12 rounded-xl bg-primary-subtle flex items-center justify-center text-lg font-extrabold text-primary">{ch}</span>
          ))}
        </div>
      )}
      <p className="text-xs text-hint mb-8">{mode === "zh2jp" ? "选出正确日语单词" : "选出正确的组合顺序"}</p>
      <div className="grid grid-cols-2 gap-3 w-full max-w-[320px]">
        {options.map((opt, i) => {
          const isCorrect = opt === cur.w;
          const isPicked = picked === opt;
          const show = picked !== null;
          let bg = "bg-surface border border-border text-main";
          if (show) { if (isCorrect) bg = "bg-success-subtle border-success text-success"; else if (isPicked) bg = "bg-danger-subtle border-danger text-danger"; else bg = "opacity-30"; }
          return <button key={i} onClick={()=>answer(opt)} className={`h-[60px] rounded-2xl border-2 font-bold text-sm flex items-center justify-center px-2 transition-all active:scale-[0.97] ${bg}`}>{opt}</button>;
        })}
      </div>
    </div>
  </>);
}
