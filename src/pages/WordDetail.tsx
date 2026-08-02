import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, Check, Lock, Play, X, Flame, ArrowRight, MessageSquareQuote } from "lucide-react";
import { categories, getStage, getQuestions, type Question } from "../data/grammar";
import { cn } from "../lib/utils";

interface WordDetailProps {}
const optionKeys = ["A","B","C","D"];

// ── Quiz Result ──
function QuizResult({ stageTitle, stageNumber, total, correctCount, bestStreak, onBack, onRetry }: {
  stageTitle:string; stageNumber:number; total:number; correctCount:number; bestStreak:number;
  onBack:()=>void; onRetry:()=>void;
}) {
  const rate = Math.round((correctCount/total)*100);
  const passed = rate >= 75;
  const rank = rate >= 95 ? "S" : rate >= 85 ? "A" : rate >= 75 ? "B" : "C";
  return (
    <div className="flex-1 flex flex-col bg-bg">
      <main className="mx-auto w-full max-w-md flex-1 flex flex-col px-5 pb-10 pt-16">
        <p className="font-mono text-[11px] uppercase tracking-widest text-hint">第{String(stageNumber).padStart(2,"0")}関 {passed?"通过":"未通过"}</p>
        <h1 className="mt-2 text-balance text-2xl font-medium leading-tight tracking-tight text-main">{stageTitle}</h1>
        <div className="mt-9 flex items-end justify-between border-b border-border pb-6">
          <div><p className="font-mono text-[11px] uppercase tracking-widest text-hint">正确率</p><p className="mt-1 font-mono text-6xl font-medium leading-none tabular-nums tracking-tight text-main">{rate}</p></div>
          <div className={cn("flex size-16 items-center justify-center rounded-full border-2 font-mono text-2xl font-medium",passed?"border-main text-main":"border-border text-hint")}>{rank}</div>
        </div>
        <dl className="mt-6 flex flex-col divide-y divide-border">
          {[{label:"正确",value:`${correctCount} / ${total}`},{label:"最大连对",value:`${bestStreak}`},{label:"合格线",value:"75%"}].map(row=><div key={row.label} className="flex items-center justify-between py-3"><dt className="text-[13px] text-hint">{row.label}</dt><dd className="font-mono text-[13px] tabular-nums text-main">{row.value}</dd></div>)}
        </dl>
        <div className={cn("mt-8 flex items-start gap-3 rounded-lg border px-4 py-4",passed?"border-main/15 bg-surface":"border-dashed border-border")}>
          {passed?<Check className="mt-0.5 size-4 shrink-0 text-primary"/>:<Lock className="mt-0.5 size-4 shrink-0 text-hint/60"/>}
          <div className="min-w-0"><p className="text-sm font-medium leading-snug text-main">{passed?`第${String(stageNumber+1).padStart(2,"0")}関 已解锁`:"请再次挑战以达到合格线"}</p><p className="mt-1 text-[13px] leading-relaxed text-hint">{passed?"下一关继续加油":"请确认错误题目的规则后再挑战。"}</p></div>
        </div>
        <div className="mt-auto flex flex-col gap-2.5 pt-10">
          <button onClick={onBack} className="inline-flex w-full items-center justify-center rounded-md bg-main px-5 py-3 text-sm font-medium text-bg transition-opacity hover:opacity-85">返回关卡列表</button>
          <button onClick={onRetry} className="inline-flex w-full items-center justify-center rounded-md border border-border px-5 py-3 text-sm font-medium transition-colors hover:bg-surface">再次挑战</button>
        </div>
      </main>
    </div>
  );
}

// ── Quiz Session ──
function QuizSession({ stageTitle, stageSubtitle, categoryLabel, stageNumber, questions, onBack, onComplete }: {
  stageTitle:string; stageSubtitle:string; categoryLabel:string; stageNumber:number; questions:Question[]; onBack:()=>void; onComplete:(passed:boolean, score:number)=>void;
}) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number|null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);

  const question = questions[current];
  const answered = selected !== null;
  const isCorrect = answered && selected === question.answerIndex;
  const isCloze = question.kind === "cloze";
  const isPattern = question.kind === "pattern";
  const hasSentence = isCloze || isPattern;

  function handleSelect(index:number) {
    if (answered) return;
    setSelected(index);
    const hit = index === question.answerIndex;
    setResults(prev=>[...prev, hit]);
    if (hit) { setCorrectCount(c=>c+1); setStreak(s=>{const n=s+1;setBestStreak(b=>Math.max(b,n));return n}); }
    else { setStreak(0); }
  }

  function handleNext() {
    if (current+1 >= questions.length) {
      const rate = Math.round((correctCount/questions.length)*100);
      onComplete(rate >= 75, rate);
      setFinished(true);
      return;
    }
    setCurrent(c=>c+1); setSelected(null);
  }

  if (finished) return <QuizResult stageTitle={stageTitle} stageNumber={stageNumber} total={questions.length} correctCount={correctCount} bestStreak={bestStreak} onBack={onBack} onRetry={()=>{setCurrent(0);setSelected(null);setCorrectCount(0);setStreak(0);setBestStreak(0);setResults([]);setFinished(false);}}/>;

  return (
    <div className="fixed inset-0 z-[999] flex flex-col bg-bg" style={{position:"fixed",top:0,left:0,right:0,bottom:0}}>
      <header className="sticky top-0 z-20 border-b border-border bg-bg/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-xl items-center gap-3 px-5 py-3.5">
          <button onClick={onBack} className="-ml-1.5 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-hint transition-colors hover:bg-surface hover:text-main"><X size={18} strokeWidth={2}/></button>
          <div className="min-w-0 flex-1"><p className="truncate font-mono text-[11px] uppercase tracking-widest text-hint">{categoryLabel} · 第{String(stageNumber).padStart(2,"0")}関</p><p className="truncate text-[13px] font-medium leading-tight tracking-tight text-main">{stageTitle}</p></div>
          <div className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[11px] tabular-nums transition-colors",streak>=2?"border-primary/40 bg-primary/8 text-primary":"border-border text-hint")}><Flame className="size-3.5" strokeWidth={2.5}/>{streak}</div>
        </div>
        <div className="mx-auto flex w-full max-w-xl items-center gap-1.5 px-5 pb-3">
          {questions.map((q,i)=><span key={q.id} className={cn("h-1 flex-1 rounded-full transition-colors",i<results.length?results[i]?"bg-main":"bg-danger":i===current?"bg-primary":"bg-border")}/>)}
          <span className="ml-1.5 font-mono text-[11px] tabular-nums text-hint">{String(current+1).padStart(2,"0")}/{questions.length}</span>
        </div>
      </header>

      <main key={current} className="page-enter mx-auto w-full max-w-xl flex-1 px-3 pb-32 pt-[16px]">
        <p className="text-[13px] leading-relaxed text-hint">{question.prompt}</p>

        {hasSentence?<div className="mt-4 overflow-hidden rounded-xl border border-border bg-surface">
          {isPattern&&question.situation&&<div className="flex items-start gap-2.5 border-b border-border bg-bg/60 px-5 py-3"><MessageSquareQuote className="mt-0.5 size-3.5 shrink-0 text-hint" strokeWidth={2}/><p className="text-[13px] leading-relaxed text-hint text-pretty">{question.situation}</p></div>}
          <div className="px-5 pt-5 pb-3">
            <p className={cn("font-medium tracking-tight transition-all duration-300",isPattern?"text-base leading-[1.5]":"text-lg leading-[1.5]")}>{question.sentenceBefore}<span className={cn("mx-1.5 inline-flex items-center justify-center rounded-md border-b-2 px-2 py-0.5 align-baseline transition-all duration-300",isCloze?"min-w-20":"min-w-28",!answered&&"border-primary bg-primary/8 font-mono text-lg text-primary",answered&&isCorrect&&"border-main bg-main/[0.05]",answered&&!isCorrect&&"border-danger bg-danger/[0.06]")}>{!answered?<span>?</span>:isCorrect?<span className="animate-fade-in">{question.options[question.answerIndex]}</span>:<span className="inline-flex items-baseline gap-1.5"><span className="text-danger line-through decoration-danger decoration-2" style={{animation:"wrongFade 0.2s ease-out forwards"}}>{question.options[selected]}</span><span className="font-mono text-sm text-hint" style={{animation:"wrongFade 0.2s ease-out forwards",animationDelay:"0.1s",opacity:0,animationFillMode:"forwards"}}>→</span><span className="text-main" style={{animation:"correctWrite 0.35s ease-out forwards",animationDelay:"0.2s",opacity:0,animationFillMode:"forwards"}}>{question.options[question.answerIndex]}</span></span>}</span>{question.sentenceAfter}</p>
          </div>
          {question.translation&&<div className="border-t border-border/30 bg-bg/40 px-5 py-3 rounded-b-xl"><p className="flex items-center gap-2.5 text-[13px] leading-relaxed text-hint"><span className="text-hint/40 shrink-0">—</span> {question.translation}</p></div>}
        </div>:<div className="mt-4 border-l-2 border-main pl-4">{question.reading&&<p className="font-mono text-xs tracking-wide text-hint">{question.reading}</p>}<p className="mt-0.5 font-medium leading-tight tracking-tight text-main" style={{fontSize:"clamp(26px, 9vw, 38px)"}}>{question.subject}</p></div>}

        <ul className={cn("mt-7","grid grid-cols-2 gap-2.5")}>
          {question.options.map((option,i)=>{const isAnswer=i===question.answerIndex;const isPicked=selected===i;const showCorrect=answered&&isAnswer;const showWrong=answered&&isPicked&&!isAnswer;const dimmed=answered&&!isAnswer&&!isPicked;
            return(<li key={option}><button type="button" onClick={()=>handleSelect(i)} disabled={answered} className={cn("flex w-full items-center gap-3.5 rounded-lg border text-left transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",isCloze?"px-4 py-3":"px-4 py-3",!answered&&"border-border bg-surface hover:border-main/30 active:scale-[0.995]",showCorrect&&"border-main bg-main/[0.04]",showWrong&&"border-danger/60 bg-danger/[0.05]",dimmed&&"border-border bg-surface opacity-45")}>
              <span className={cn("inline-flex size-6 shrink-0 items-center justify-center rounded font-mono text-[11px] transition-colors",showCorrect?"bg-main text-bg":showWrong?"bg-danger text-white":"bg-bg border border-border text-hint")}>{showCorrect?<Check className="size-3.5" strokeWidth={3}/>:showWrong?<X className="size-3.5" strokeWidth={3}/>:optionKeys[i]}</span>
              <span className={cn("flex-1 font-medium leading-snug tracking-tight",isCloze?"text-base":"text-[15px] text-main")}>{option}</span>
            </button></li>);
          })}
        </ul>

        {answered&&<div className="mt-6 rounded-lg border border-border bg-surface px-4 py-4">
          <div className="flex items-center gap-2"><span className={cn("font-mono text-[11px] uppercase tracking-widest",isCorrect?"text-main":"text-danger")}>{isCorrect?"正确":"不正确"}</span>{question.rule&&<><span className="h-px w-3 bg-border"/><span className="font-mono text-[11px] tracking-wide text-hint">{question.rule}</span></>}</div>
          <p className="mt-2 text-[13px] leading-relaxed text-hint">{question.explanation}</p>
        </div>}
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-bg/95 backdrop-blur" style={{paddingBottom:"env(safe-area-inset-bottom, 0px)"}}>
        <div className="mx-auto flex w-full max-w-xl items-center justify-between gap-4 px-5 py-4">
          <span className="font-mono text-[11px] tabular-nums text-hint">正确 {correctCount} / {results.length}</span>
          <button type="button" onClick={handleNext} disabled={!answered} className={cn("inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium transition-all",answered?"bg-main text-bg hover:opacity-85":"cursor-not-allowed bg-border/30 text-hint")}>{current+1>=questions.length?"查看结果":"下一题"}<ArrowRight className="size-4" strokeWidth={2.5}/></button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──
type StageStatus = "cleared"|"current"|"locked";
type Stage = {id:string;title:string;subtitle:string;questions:number;status:StageStatus;score?:number;progress?:number};
type Category = {id:string;label:string;caption:string;stages:Stage[]};

export default function WordDetail({}: WordDetailProps) {
  const [tab, setTab] = useState<"joshi"|"henkei"|"bunkei">(()=>{
    return (localStorage.getItem("grammar_tab") as any)||"joshi";
  });
  const [completed, setCompleted] = useState<Set<string>>(()=>{
    try { return new Set(JSON.parse(localStorage.getItem("grammar_completed")||"[]")); } catch { return new Set(); }
  });
  const [playingStage, setPlayingStage] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState<Record<string,number>>(()=>{
    try { return JSON.parse(localStorage.getItem("grammar_scores")||"{}"); } catch { return {}; }
  });

  const cats = useMemo<Category[]>(()=>categories.map(c=>({
    ...c,
    stages: c.stages.map((s,i)=>{
      const prev=i===0||completed.has(c.stages[i-1].id);
      const status:StageStatus = completed.has(s.id)?"cleared":prev?"current":"locked";
      return {...s, status, score: scores[s.id], progress:completed.has(s.id)?100:status==="current"?0:undefined};
    })
  })), [completed, scores]);

  const active = cats.find(c=>c.id===tab)??cats[0];
  const cleared = active.stages.filter(s=>s.status==="cleared").length;
  const total = active.stages.length;

  const handleStageComplete = (stageId:string, passed:boolean, score:number) => {
    if (passed) {
      const next = new Set(completed);
      next.add(stageId);
      setCompleted(next);
      localStorage.setItem("grammar_completed", JSON.stringify([...next]));
    }
    const nextScores = {...scores, [stageId]: Math.max(scores[stageId]||0, score)};
    setScores(nextScores);
    localStorage.setItem("grammar_scores", JSON.stringify(nextScores));
  };

  if (loading) return (
    <div className="flex flex-col flex-1 min-h-0 items-center justify-center gap-6 px-8 text-center bg-bg">
      <div className="word-loader" />
      <p className="text-sub text-sm font-medium">音声読み込み中...</p>
      <p className="text-hint text-xs">文法問題を準備しています</p>
    </div>
  );

  // If playing a stage, show quiz session
  if (playingStage) {
    const found = getStage(playingStage);
    if (!found) { setPlayingStage(null); return null; }
    return createPortal(<div className="fixed inset-0 z-[999] flex flex-col bg-bg"><QuizSession
      stageTitle={found.stage.title}
      stageSubtitle={found.stage.subtitle}
      categoryLabel={found.categoryLabel}
      stageNumber={found.index+1}
      questions={getQuestions(playingStage)}
      onBack={()=>setPlayingStage(null)}
      onComplete={(passed, score)=>handleStageComplete(playingStage, passed, score)}
    /></div>, document.body);
  }

  return (<>
    <div className="flex-1 min-h-0 overflow-y-auto scroll-area">
      <header className="sticky top-0 z-20 border-b border-border bg-bg/85 backdrop-blur-md">
        <div className="mx-auto max-w-md px-5 pt-5 pb-4">
          <div className="flex items-end justify-between gap-4">
            <div><p className="font-mono text-[11px] uppercase tracking-[0.18em] text-hint">Grammar Quest</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-main">文法練習</h1></div>
            <div className="text-right"><p className="font-mono text-lg tabular-nums leading-none text-main">{cleared}<span className="text-hint">/{total}</span></p><p className="mt-1 text-[11px] text-hint">通过済み</p></div>
          </div>
          <div className="mt-4 flex items-center gap-1">{active.stages.map(s=><span key={s.id} className={cn("h-1 flex-1 rounded-full",s.status==="cleared"?"bg-main":s.status==="current"?"bg-primary":"bg-border")}/>)}</div>
          <nav className="mt-5 flex gap-6 select-none">{cats.map(c=>{const isActive=c.id===tab;return(
            <label key={c.id} className="flex items-center justify-center flex-grow cursor-pointer">
              <input type="radio" className="hidden peer" checked={isActive} onChange={()=>{setTab(c.id as any);localStorage.setItem("grammar_tab",c.id)}} name="grammar_tab"/>
              <span className={cn("relative text-[15px] font-medium transition-all duration-300",
                "after:opacity-0 peer-checked:after:opacity-100 peer-checked:after:transition-all peer-checked:after:duration-300",
                "peer-checked:after:content-[''] peer-checked:after:block peer-checked:after:w-1/2 peer-checked:after:h-0.5 peer-checked:after:rounded-full peer-checked:after:absolute peer-checked:after:right-0 peer-checked:after:-bottom-1",
                "peer-checked:before:content-[''] peer-checked:before:block peer-checked:before:w-full peer-checked:before:h-0.5 peer-checked:before:rounded-full peer-checked:before:absolute peer-checked:before:right-0 peer-checked:before:bottom-0",
                "before:opacity-0 peer-checked:before:opacity-100 peer-checked:before:transition-all peer-checked:before:duration-300",
                isActive?"text-main after:bg-main before:bg-main":"text-hint hover:text-main/70")}>
                {c.label}
              </span>
            </label>
          );})}</nav>
        </div>
      </header>

      <main className="mx-auto max-w-md px-5 pb-16 pt-6">
        <p className="text-sm leading-relaxed text-sub">{active.caption}</p>
        <ol className="mt-6">
          {active.stages.map((s,i)=>{const isLast=i===active.stages.length-1;const onPlay=()=>{setPlayingStage(s.id);};return(
            <li key={s.id} className="relative flex gap-4">
              {!isLast&&<span className={cn("absolute left-4 top-8 bottom-0 w-px -translate-x-1/2",s.status==="cleared"?"bg-main":"bg-border")}/>}
              <div className={cn("relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-medium",s.status==="cleared"&&"border-main bg-main text-bg",s.status==="current"&&"border-primary bg-primary text-white",s.status==="locked"&&"border-dashed border-border bg-bg text-hint/60")}>{s.status==="cleared"?<Check size={16} strokeWidth={2.5}/>:<span className="font-mono tabular-nums">{String(i+1).padStart(2,"0")}</span>}</div>
              <div className={cn("min-w-0 flex-1 pb-8",isLast&&"pb-0")}>
                <div className={cn("rounded-lg border px-4 py-4 transition-colors",s.status==="current"&&"border-border/50 bg-surface shadow-[0_1px_0_0_var(--color-border)]",s.status!=="current"&&"border-transparent")}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0"><h3 className={cn("text-[17px] font-medium leading-tight tracking-tight",s.status==="locked"?"text-hint":"text-main")}>{s.title}</h3><p className="mt-1 text-sm leading-relaxed text-hint">{s.subtitle}</p></div>
                    {s.status==="locked"?<Lock size={16} className="mt-0.5 shrink-0 text-hint/50"/>:<span className="mt-0.5 shrink-0 font-mono text-xs tabular-nums text-hint">{s.questions}問</span>}
                  </div>
                  {s.status==="current"&&<div className="mt-4 flex flex-col gap-3"><div className="flex items-center gap-3"><div className="h-1 flex-1 overflow-hidden rounded-full bg-border"><div className="h-full rounded-full bg-primary" style={{width:`${s.progress??0}%`}}/></div><span className="font-mono text-[11px] tabular-nums text-hint">{s.progress??0}%</span></div><button onClick={onPlay} className="inline-flex w-fit items-center gap-2 rounded-md bg-main px-3.5 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-85"><Play size={14} strokeWidth={2.5}/>挑戦を始める</button></div>}
                  {s.status==="cleared"&&<div className="mt-3 flex items-center gap-2 text-xs text-hint"><span className="font-mono tabular-nums">最佳 {s.score??100}%</span><span className="h-px w-4 bg-border"/><button onClick={onPlay} className="font-medium text-main/70 underline decoration-border underline-offset-4 transition-colors hover:text-main">再战</button></div>}
                </div>
              </div>
            </li>);})}
        </ol>
        <p className="mt-10 border-t border-border pt-5 text-center font-mono text-[11px] tracking-widest text-hint">通关后解锁下一关</p>
      </main>
    </div>
  </>);
}
