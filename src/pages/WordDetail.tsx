import { useState, useMemo, useEffect } from "react";
import { ArrowLeft, Zap, Play } from "lucide-react";
import { exerciseData, compareItems, conjugateItems, sentenceItems } from "../data/grammar";
import type { Exercise } from "../data/grammar";

interface WordDetailProps { darkMode?: boolean; }

const tabConfig = [
  { id:"particle" as const, label:"助詞", sub:"Particles", emoji:"を", desc:"14種類の助詞の使い方をマスター" },
  { id:"conjugate" as const, label:"変形", sub:"Conjugation", emoji:"変", desc:"動詞の活用形を練習" },
  { id:"sentence" as const, label:"文型", sub:"Patterns", emoji:"文", desc:"重要文型のパターンを暗記" },
];

export default function WordDetail({ darkMode }: WordDetailProps) {
  const [tab, setTab] = useState<"particle"|"conjugate"|"sentence">(()=>{
    return (localStorage.getItem("grammar_tab") as "particle"|"conjugate"|"sentence") || "particle";
  });
  const [topic, setTopic] = useState<string | null>(null);
  const [qIdx, setQIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState({ right:0, wrong:0 });
  const [done, setDone] = useState(false);
  const [wrongHint, setWrongHint] = useState("");
  const [waitingNext, setWaitingNext] = useState(false);
  const [lives, setLives] = useState(3);
  const [heartBreak, setHeartBreak] = useState(false);
  const [blankIdx, setBlankIdx] = useState(0);
  const [filled, setFilled] = useState<string[]>([]);
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(()=>{
    try { return new Set(JSON.parse(localStorage.getItem("grammar_completed")||"[]")); } catch { return new Set(); }
  });
  const items = tab==="particle" ? compareItems : tab==="conjugate" ? conjugateItems : sentenceItems;

  const exercises = topic ? (exerciseData[topic] || []) : [];
  const curEx = exercises[qIdx];
  const options = useMemo(() => {
    if (!curEx) return [];
    const correct = curEx.a;
    let opts = curEx.particles || items.find(i=>i.l===topic)?.p || [];
    if (!opts.includes(correct)) opts = [...opts, correct];
    return opts.length <= 4 ? opts.slice(0,4) : opts.slice(0,6);
  }, [curEx, topic]);

  const answer = (opt: string) => {
    if (picked) return;
    setPicked(opt);
    const isRight = opt === curEx.a;
    const newFilled = [...filled, opt];
    setFilled(newFilled);
    const isFinal = blankIdx + 1 >= blankCount;
    if (isFinal) {
      if (isRight) {
        setScore(s=>({...s, right:s.right+1}));
        setWrongHint("");
        setWaitingNext(false);
        setTimeout(() => {
          if (qIdx + 1 >= exercises.length) { setDone(true); return; }
          setQIdx(qIdx+1); setPicked(null); setBlankIdx(0); setFilled([]);
        }, 600);
      } else {
        setScore(s=>({...s, wrong:s.wrong+1}));
        setWrongHint(curEx.hint || "");
        setWaitingNext(true);
        setLives(l=>{const n=l-1;if(n<=0)setTimeout(()=>setDone(true),1200);return Math.max(0,n);});
        setHeartBreak(true); setTimeout(()=>setHeartBreak(false),500);
      }
    } else {
      setTimeout(() => { setBlankIdx(b=>b+1); setPicked(null); }, 400);
    }
  };

  const nextQuestion = () => {
    if (qIdx + 1 >= exercises.length) { setDone(true); return; }
    setQIdx(qIdx+1); setPicked(null); setWrongHint(""); setWaitingNext(false); setBlankIdx(0); setFilled([]);
  };

  const blankCount = curEx ? (curEx.q.match(/___/g)||[]).length : 0;

  useEffect(()=>{if(done&&lives>0&&topic){const n=new Set(completedTopics);n.add(topic);localStorage.setItem("grammar_completed",JSON.stringify([...n]));setCompletedTopics(n)}},[done]);

  const exitExercise = () => { setTopic(null); setQIdx(0); setPicked(null); setDone(false); setScore({right:0,wrong:0}); setWrongHint(""); setWaitingNext(false); setBlankIdx(0); setFilled([]);  };

  if (topic && done) return (<>
    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
      <Zap size={36} className="text-primary mb-4" />
      <h2 className="text-lg font-bold text-main mb-2">{lives<=0?"闯关失败":"练习完成！"}</h2>
      <p className="text-sm text-sub">{topic}</p>
      {lives<=0 && <p className="text-xs text-danger mb-1">生命值耗尽</p>}
      <div className="flex gap-4 mt-2 text-sm">
        <span className="text-success font-bold">✓ {score.right}</span>
        <span className="text-danger font-bold">✗ {score.wrong}</span>
      </div>
      <button onClick={exitExercise} className="mt-6 px-8 py-3 bg-primary text-white rounded-full text-sm font-bold active:scale-95">返回列表</button>
    </div>
  </>);

  if (topic && curEx) return (<>
    <div className="flex items-center justify-between px-4 pt-3 pb-1">
      <button onClick={exitExercise} className="flex items-center gap-1 text-hint text-xs font-bold active:opacity-60">
        <ArrowLeft size={16} stroke="var(--color-text-tertiary)" strokeWidth={2}/><span>戻る</span>
      </button>
      <span className="text-sm font-extrabold text-main">{topic}</span>
      <span className="text-xs font-bold text-sub">{qIdx+1}/{exercises.length}</span>
    </div>
    <div className="flex justify-end px-4 pb-2">
      <div className="flex gap-0.5">
        {[0,1,2].map(i=>(
          <svg key={i} width="18" height="18" viewBox="0 0 24 24" className={`transition-all duration-300 ${i>=lives?"opacity-30":""}`}
            style={{fill:i>=lives?"none":"#ef4444",stroke:i>=lives?"#ef4444":"none",strokeWidth:i>=lives?2:0,animation:heartBreak&&i===lives?"heartBreak 0.5s ease-out":""}}>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        ))}
      </div>
    </div>
    <div className="flex-1 flex flex-col items-center justify-center px-6 relative">
      {/* Question — always centered */}
      <div className="flex flex-col items-center w-full">
        <p className="text-2xl font-extrabold text-main text-center leading-relaxed">
          {curEx.q.split("___").map((part,i,arr)=>(
            <span key={i}>{part}{i < arr.length-1 ? (
              <span className="inline-block w-14 mx-0.5">
                <span className="block border-b-[3px] border-primary rounded-sm">
                  {filled[i] ? (
                  <span className="text-main">{filled[i]}</span>
                ) : <span className="opacity-0">は</span>}
                </span>
              </span>
            ) : null}</span>
          ))}
        </p>
      </div>
      {/* Hint — absolute positioned at bottom of question area, doesn't shift question */}
      <div className="absolute bottom-20 left-4 right-4 flex justify-center pointer-events-none">
        {wrongHint && (
          <div className="animate-slide-up w-full max-w-[280px]">
            <div className="bg-gradient-to-r from-[#DC2626] to-[#B91C1C] rounded-xl px-4 py-3 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-12 h-12 rounded-full bg-white/5"/>
              <p className="text-[10px] text-red-200/70 font-bold tracking-wider mb-0.5">核心考法</p>
              <p className="text-sm font-extrabold text-white leading-snug">{wrongHint}</p>
            </div>
          </div>
        )}
      </div>
    </div>
    {/* Options — bottom of screen */}
    <div className="px-4 pb-4">
      <div className="w-full max-w-[280px] mx-auto">
        <div className="flex flex-wrap justify-center gap-3 mb-2">
        {options.map((opt,i)=>{
          const isCorrect = opt === curEx.a;
          const isPicked = picked === opt;
          const show = picked !== null;
          let cls = "w-16 h-16 rounded-2xl font-bold text-xl flex items-center justify-center transition-all active:scale-95 shadow-sm bg-surface border border-border text-main";
          if (show) {
            if (isCorrect) cls = "w-16 h-16 rounded-2xl font-bold text-xl flex items-center justify-center shadow-sm bg-success/10 border-2 border-success text-success";
            else if (isPicked) cls = "w-16 h-16 rounded-2xl font-bold text-xl flex items-center justify-center shadow-sm bg-danger/10 border-2 border-danger text-danger";
            else cls = "w-16 h-16 rounded-2xl font-bold text-xl flex items-center justify-center opacity-25 bg-surface border border-border";
          }
          return <button key={i} onClick={()=>answer(opt)} className={cls}>{opt}</button>;
        })}
        </div>
        <div className="h-12">
          {waitingNext && (
            <button onClick={nextQuestion} className="animate-fade-in w-full py-3 bg-primary text-white rounded-full text-sm font-bold active:scale-95 shadow-lg shadow-primary/20">
              {qIdx+1 >= exercises.length ? "查看结果" : "下一题 →"}
            </button>
          )}
        </div>
      </div>
    </div>
  </>);

  return (<>
    <div className="flex-1 min-h-0 overflow-y-auto scroll-area">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-[10px] text-hint/60 font-bold">点击标签切换 →</span>
        <span className="text-lg font-bold text-main">文法練習</span>
      </div>

      {/* ── Tab Slider ── */}
      <div className="px-4 pb-4">
        <div className="rslider-wrap">
          <input type="radio" id="tab-particle" name="maintab" className="rd-0" checked={tab==="particle"} onChange={()=>{setTab("particle");localStorage.setItem("grammar_tab","particle")}} />
          <label htmlFor="tab-particle" className="rs-label"><span>助詞</span></label>
          <input type="radio" id="tab-conjugate" name="maintab" className="rd-1" checked={tab==="conjugate"} onChange={()=>{setTab("conjugate");localStorage.setItem("grammar_tab","conjugate")}} />
          <label htmlFor="tab-conjugate" className="rs-label"><span>変形</span></label>
          <input type="radio" id="tab-sentence" name="maintab" className="rd-2" checked={tab==="sentence"} onChange={()=>{setTab("sentence");localStorage.setItem("grammar_tab","sentence")}} />
          <label htmlFor="tab-sentence" className="rs-label"><span>文型</span></label>
          <div className="rs-bar"/>
          <div className="rs-slide"/>
        </div>
      </div>

      {/* ── Content Area ── */}
      <div className="px-4 pb-4 space-y-3">

        {/* Mode hint */}
        <p className="text-xs text-hint px-1">
          {tab==="particle"?"助詞の比較テーマを選んで練習を始めましょう":
           tab==="conjugate"?"動詞の活用パターンを選択してください":
           "学習したい文型を選んでください"}
        </p>


        {/* Exercise List */}
        <div className="space-y-2">
          {items.map((item,i)=>(
            <div key={i} onClick={()=>{setTopic(item.l);setQIdx(0);setPicked(null);setDone(false);setScore({right:0,wrong:0});setWrongHint("");setWaitingNext(false);setLives(3);setBlankIdx(0);setFilled([]);}}
              className="bg-surface rounded-2xl p-4 shadow-sm border border-border active:scale-[0.98] transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-extrabold text-main">{item.l}</p>
                <span className="text-[10px] font-bold text-primary bg-primary-subtle px-2 py-0.5 rounded-full">{item.n} 問</span>
              </div>
              <p className="text-[11px] text-hint">{item.d}</p>
              <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-border">
                <Play size={12} className="text-primary" />
                <span className="text-[11px] font-bold text-primary">練習を始める</span>
              </div>
            </div>
          ))}
        </div>

        <div className="h-2" />
      </div>
    </div>
  </>);
}
