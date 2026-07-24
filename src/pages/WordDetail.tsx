import { useState } from "react";
import { Play } from "lucide-react";
import StatusBar from "../components/StatusBar";

interface WordDetailProps { darkMode?: boolean; }

const compareItems = [
  { l:"は vs が",d:"主題と主語の使い分け",n:20,p:["は","が"] },
  { l:"に vs で",d:"場所・手段の表現",n:18,p:["に","で"] },
  { l:"を vs が",d:"目的語と自動詞",n:15,p:["を","が"] },
  { l:"も・と・や",d:"並列助詞の比較",n:12,p:["も","と","や"] },
  { l:"から vs まで",d:"起点と終点",n:10,p:["から","まで"] },
  { l:"へ vs に",d:"方向表現",n:10,p:["へ","に"] },
  { l:"より vs の",d:"比較と所属",n:8,p:["より","の"] },
];
const positionItems = [
  { l:"主題の「は」",d:"文頭付近の主題提示",n:15,p:["は"] },{ l:"主語の「が」",d:"述語直前の主格",n:15,p:["が"] },
  { l:"目的語の「を」",d:"動詞直前の対象",n:15,p:["を"] },{ l:"場所の「に/で」",d:"動作の場所表現",n:18,p:["に","で"] },
  { l:"時間の「に」",d:"時点の位置",n:12,p:["に"] },{ l:"手段の「で」",d:"方法・道具",n:12,p:["で"] },
  { l:"到達点の「へ/に」",d:"方向・目的地",n:10,p:["へ","に"] },{ l:"起点〜終点",d:"から/まで の語順",n:10,p:["から","まで"] },
  { l:"並列の「と/や」",d:"並列接続の位置",n:8,p:["と","や"] },{ l:"所属の「の」",d:"修飾関係",n:10,p:["の"] },
];
const conjugateItems = [
  { l:"て形変換",d:"動詞→て形",n:30 },{ l:"た形変換",d:"動詞→た形",n:30 },{ l:"ない形変換",d:"動詞→ない形",n:25 },
  { l:"辞書形↔ます形",d:"相互変換",n:28 },{ l:"受身形・使役形",d:"上級変形",n:20 },
];
const sentenceItems = [
  { l:"〜てください",d:"依頼表現",n:15 },{ l:"〜てもいい",d:"許可表現",n:12 },{ l:"〜なければならない",d:"義務表現",n:10 },
  { l:"〜たことがある",d:"経験表現",n:14 },{ l:"条件表現",d:"と・ば・たら・なら",n:20 },
];

const tabConfig = [
  { id:"particle" as const, label:"助詞", sub:"Particles", emoji:"を", desc:"14種類の助詞の使い方をマスター" },
  { id:"conjugate" as const, label:"変形", sub:"Conjugation", emoji:"変", desc:"動詞の活用形を練習" },
  { id:"sentence" as const, label:"文型", sub:"Patterns", emoji:"文", desc:"重要文型のパターンを暗記" },
];

export default function WordDetail({ darkMode }: WordDetailProps) {
  const [tab, setTab] = useState<"particle"|"conjugate"|"sentence">("particle");
  const [subTab, setSubTab] = useState<"compare"|"position">("compare");
  const items = tab==="particle"
    ? (subTab==="compare"?compareItems:positionItems)
    : tab==="conjugate"?conjugateItems:sentenceItems;

  return (<>
    <StatusBar darkMode={darkMode} />
    <div className="flex-1 min-h-0 overflow-y-auto scroll-area">

      {/* ── Header ── */}
      <div className="flex items-center justify-end px-4 py-2">
        <span className="text-lg font-bold text-main">文法練習</span>
      </div>

      {/* ── Tab Cards ── */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-3 gap-2">
          {tabConfig.map(t=>{const active=tab===t.id;return(
            <button key={t.id} onClick={()=>setTab(t.id)}
              className={`rounded-2xl p-3 text-left transition-all active:scale-95 ${active?"bg-primary text-white shadow-lg":"bg-surface text-main border border-border"}`}>
              <span className={`text-2xl block mb-1 ${active?"opacity-90":"text-hint"}`}>{t.emoji}</span>
              <p className={`text-xs font-extrabold ${active?"text-white":"text-main"}`}>{t.label}</p>
              <p className={`text-[9px] mt-0.5 ${active?"text-white/50":"text-hint"}`}>{t.sub}</p>
            </button>
          )})}
        </div>
      </div>

      {/* ── Content Area ── */}
      <div className="px-4 pb-4 space-y-3">

        {/* Particle mode — sub toggle */}
        {tab === "particle" && (
          <div className="flex rounded-[6px] overflow-hidden border border-border">
            {["compare","position"].map((s,i)=>(
              <button key={s} onClick={()=>setSubTab(s as any)}
                className={`flex-1 py-2.5 text-xs font-bold transition-all ${subTab===s?"bg-primary text-white":"bg-surface text-sub"}`}>
                {s==="compare"?"助詞の比較":"文中の位置"}
              </button>
            ))}
          </div>
        )}

        {/* Conjugate / Sentence mode — simple label */}
        {tab !== "particle" && (
          <p className="text-xs text-hint px-1">{tab==="conjugate"?"動詞の活用パターンを選択してください":"学習したい文型を選んでください"}</p>
        )}

        {/* Exercise List */}
        <div className="space-y-2">
          {items.map((item,i)=>(
            <div key={i} className="bg-surface rounded-2xl p-4 shadow-sm border border-border active:scale-[0.98] transition-all cursor-pointer">
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
