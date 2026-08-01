import { useState } from "react";
import { ChevronRight, BookOpen, Layers, Swords } from "lucide-react";
import type { Page } from "../components/BottomNav";
import { loadProgress } from "../lib/spaced-repetition";
import { getWordSource } from "../lib/wordSource";

interface HomeProps { onNavigate: (p: Page) => void; }

const quotes = [
  { jp:"継続は力なり",rn:"けいぞくはちからなり",zh:"坚持就是力量" },
  { jp:"千里の道も一歩から",rn:"せんりのみちもいっぽから",zh:"千里之行始于足下" },
  { jp:"習うより慣れろ",rn:"ならうよりなれろ",zh:"熟能生巧" },
  { jp:"一念岩をも通す",rn:"いちねんいわをもとおす",zh:"精诚所至金石为开" },
  { jp:"明日は明日の風が吹く",rn:"あしたはあしたのかぜがふく",zh:"明天自有明天的风，顺其自然" },
  { jp:"塵も積もれば山となる",rn:"ちりもつもればやまとなる",zh:"积少成多" },
  { jp:"石の上にも三年",rn:"いしのうえにもさんねん",zh:"功到自然成" },
  { jp:"急がば回れ",rn:"いそがばまわれ",zh:"欲速则不达" },
  { jp:"七転び八起き",rn:"ななころびやおき",zh:"百折不挠" },
  { jp:"自業自得",rn:"じごうじとく",zh:"自作自受" },
  { jp:"猿も木から落ちる",rn:"さるもきからおちる",zh:"智者千虑必有一失" },
  { jp:"犬も歩けば棒に当たる",rn:"いぬもあるけばぼうにあたる",zh:"多行必有所获" },
  { jp:"二兎を追う者は一兎をも得ず",rn:"にとをおうものはいっとをもえず",zh:"贪多嚼不烂" },
  { jp:"花より団子",rn:"はなよりだんご",zh:"务实不务虚" },
  { jp:"能ある鷹は爪を隠す",rn:"のうあるたかはつめをかくす",zh:"真人不露相" },
  { jp:"朱に交われば赤くなる",rn:"しゅにまじわればあかくなる",zh:"近朱者赤" },
  { jp:"良薬は口に苦し",rn:"りょうやくはくちににがし",zh:"良药苦口" },
  { jp:"言わぬが花",rn:"いわぬがはな",zh:"沉默是金" },
  { jp:"残り物には福がある",rn:"のこりものにはふくがある",zh:"剩下的往往是最好的" },
  { jp:"若い時の苦労は買ってでもせよ",rn:"わかいときのくろうはかってでもせよ",zh:"年轻时应该多吃苦" },
  { jp:"棚からぼたもち",rn:"たなからぼたもち",zh:"天上掉馅饼" },
  { jp:"郷に入っては郷に従え",rn:"ごうにいってはごうにしたがえ",zh:"入乡随俗" },
  { jp:"苦あれば楽あり",rn:"くあればらくあり",zh:"先苦后甜" },
  { jp:"一石二鳥",rn:"いっせきにちょう",zh:"一石二鸟" },
  { jp:"十人十色",rn:"じゅうにんといろ",zh:"十人十色" },
  { jp:"住めば都",rn:"すめばみやこ",zh:"久居则安" },
  { jp:"時は金なり",rn:"ときはかねなり",zh:"时间就是金钱" },
  { jp:"口は災いの元",rn:"くちはわざわいのもと",zh:"祸从口出" },
  { jp:"井の中の蛙大海を知らず",rn:"いのなかのかわずたいかいをしらず",zh:"井底之蛙" },
  { jp:"雨降って地固まる",rn:"あめふってじかたまる",zh:"不打不相识" },
  { jp:"帯に短し襷に長し",rn:"おびにみじかしたすきにながし",zh:"高不成低不就" },
  { jp:"早起きは三文の徳",rn:"はやおきはさんもんのとく",zh:"早起三分利" },
  { jp:"好きこそ物の上手なれ",rn:"すきこそもののじょうずなれ",zh:"兴趣是最好的老师" },
  { jp:"馬には乗ってみよ人には添うてみよ",rn:"うまにはのってみよひとにはそうてみよ",zh:"路遥知马力日久见人心" },
  { jp:"終わり良ければすべて良し",rn:"おわりよければすべてよし",zh:"结局好一切皆好" },
  { jp:"明日のことを言えば鬼が笑う",rn:"あしたのことをいえばおにがわらう",zh:"未来不可预知" },
  { jp:"知らぬが仏",rn:"しらぬがほとけ",zh:"眼不见为净" },
  { jp:"老いては子に従え",rn:"おいてはこにしたがえ",zh:"老了要听儿女的话" },
  { jp:"百聞は一見に如かず",rn:"ひゃくぶんはいっけんにしかず",zh:"百闻不如一见" },
  { jp:"備えあれば憂いなし",rn:"そなえあればうれいなし",zh:"有备无患" },
  { jp:"蒔かぬ種は生えぬ",rn:"まかぬたねははえぬ",zh:"不种则无获" },
  { jp:"可愛い子には旅をさせよ",rn:"かわいいこにはたびをさせよ",zh:"要让心爱的孩子去历练" },
  { jp:"触らぬ神に祟りなし",rn:"さわらぬかみにたたりなし",zh:"多一事不如少一事" },
  { jp:"弘法も筆の誤り",rn:"こうぼうもふでのあやまり",zh:"智者千虑必有一失" },
  { jp:"四十にして惑わず",rn:"しじゅうにしてまどわず",zh:"四十不惑" },
  { jp:"天は自ら助くる者を助く",rn:"てんはみずからたすくるものをたすく",zh:"天助自助者" },
  { jp:"楽あれば苦あり",rn:"らくあればくあり",zh:"有乐必有苦" },
  { jp:"負けるが勝ち",rn:"まけるがかち",zh:"以退为进" },
  { jp:"人間万事塞翁が馬",rn:"にんげんばんじさいおうがうま",zh:"塞翁失马焉知非福" },
  { jp:"若いうちの苦労は買ってでもしろ",rn:"わかいうちのくろうはかってでもしろ",zh:"年轻时多吃苦是好事" },
  { jp:"初心忘るべからず",rn:"しょしんわするべからず",zh:"勿忘初心" },
  { jp:"努力は必ず報われる",rn:"どりょくはかならずむくわれる",zh:"努力必有回报" },
  { jp:"人生は一期一会",rn:"じんせいはいちごいちえ",zh:"人生只有一次相遇" },
  { jp:"鉄は熱いうちに打て",rn:"てつはあついうちにうて",zh:"趁热打铁" },
];

const weekDays = ["月","火","水","木","金","土","日"];

export default function Home({ onNavigate }: HomeProps) {
  const dailyGoal = parseInt(localStorage.getItem("dailyGoal")||"15");
  const sourceIds = new Set(getWordSource().map(w => w.id));
  const totalLearned = Object.keys(loadProgress()).filter(id => sourceIds.has(id)).length;
  const totalWords = getWordSource().length;
  const remaining = Math.max(0, totalWords - totalLearned);
  const studyDays = parseInt(localStorage.getItem("studyDays")||"0");
  const todayWord = quotes[new Date().getDate() % quotes.length];
  const todayDow = new Date().getDay();
  // Build set of studied dates for weekly calendar
  const studiedDates = (() => { try { return new Set(JSON.parse(localStorage.getItem("studyDates")||"[]")); } catch { return new Set<string>(); } })();
  // Generate this week's dates (Mon-Sun) — use local date strings to avoid UTC offset issues
  const weekDates = (() => {
    const today = new Date();
    const monOffset = todayDow === 0 ? -6 : 1 - todayDow;
    const mon = new Date(today.getFullYear(), today.getMonth(), today.getDate() + monOffset);
    return Array.from({length:7},(_,i)=>{
      const d = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + i);
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    });
  })();

  const handleStart = () => {
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    const last = localStorage.getItem("lastStudyDate")||"";
    onNavigate(last===today?"rest":"study");
  };

  return (<div className="flex-1 min-h-0 overflow-y-auto scroll-area bg-bg">
    {/* ── Hero Panel (ink background) ── */}
    <header className="bg-primary text-white flex flex-col rounded-b-[2rem] px-6 pt-6 pb-9 relative">
      <span
        className="absolute top-3 right-5 text-white select-none pointer-events-none"
        style={{ fontFamily: "Sacramento, cursive", fontSize: 28 }}
      >
        kotodama
      </span>
      <div>
        <p className="text-white/30 text-[11px] tracking-[0.32em]">DAILY TARGET</p>
        <h1 className="mt-3 font-serif leading-tight" style={{fontSize:"clamp(1.4rem, 5vw, 2rem)"}}>今日の学習目標</h1>
      </div>

      <dl className="mt-8 flex items-end gap-10">
        {[{label:"NEW",v:dailyGoal,u:""},{label:"WORDS",v:totalLearned,u:"",dim:true},{label:"DAYS",v:studyDays,u:"",dim:true},{label:"LEFT",v:remaining,u:"",dim:true,lastColor:true}].map(s=>(
          <div key={s.label}>
            <dt className="text-white/30 text-[10px] tracking-[0.24em]">{s.label}</dt>
            <dd className="mt-1 flex items-baseline gap-1.5">
              <span className={`font-serif leading-none ${s.dim && !(s as any).lastColor ? "text-white/30" : "text-white"}`} style={{fontSize:"clamp(1.6rem, 7vw, 2.5rem)"}}>
                {(s as any).lastColor
                  ? <>{String(s.v).slice(0, -1)}<span style={{color:"var(--color-gold)"}}>{String(s.v).slice(-1)}</span></>
                  : s.v}
              </span>
              <span className="text-white/30 text-[11px]">{s.u}</span>
            </dd>
          </div>
        ))}
      </dl>

      <button onClick={handleStart} className="bg-white text-primary hover:bg-white/90 mt-9 w-full rounded-full py-4 text-base font-semibold tracking-wide transition-colors">学習を始める</button>

      <div className="text-white/30 mt-5 flex items-center gap-4 text-[11px]">
        <button onClick={()=>onNavigate("settings")} className="hover:text-white/70 transition-colors">目标设定</button>
      </div>
    </header>

    {/* ── Quote ── */}
    <section className="px-6 pt-8">
      <p className="text-main text-xs font-semibold tracking-[0.2em]">今日の一言</p>
      <div className="mt-4 flex items-start justify-between gap-5">
        <div>
          <p className="text-hint text-xs">{todayWord.rn}</p>
          <p className="text-main mt-1.5 font-serif text-2xl leading-snug text-balance">{todayWord.jp}</p>
          <p className="text-hint mt-3 text-xs">{todayWord.zh}</p>
        </div>
        <img src={`${import.meta.env.BASE_URL}icons/d${new Date().getDay()}.svg`} alt="" className="h-14 w-[72px] object-contain shrink-0"/>
      </div>
    </section>

    {/* ── Study Modes ── */}
    <section className="mt-8 px-6">
      <p className="text-main border-border border-b pb-3 text-xs font-semibold tracking-[0.2em]">学習モード</p>
      <ul>
        {[
          {icon:BookOpen,title:"列表学习",sub:"单词列表",meta:"自主",a:"wordlist"as Page},
          {icon:Layers,title:"记忆卡片",sub:"滑动记忆",meta:"翻卡",a:"cardmatch"as Page},
          {icon:Swords,title:"单词修罗",sub:"游戏挑战",meta:"修炼",a:"practice"as Page},
        ].map(({icon:Icon,title,sub,meta,a})=>(
          <li key={title} className="border-border border-b last:border-b-0">
            <button onClick={()=>onNavigate(a)} className="hover:bg-surface/60 -mx-2 flex w-[calc(100%+1rem)] items-center gap-4 rounded-lg px-2 py-4 text-left transition-colors">
              <Icon size={20} strokeWidth={1.5} className="text-main shrink-0"/>
              <span className="min-w-0 flex-1">
                <span className="text-main block font-serif text-base leading-snug">{title}</span>
                <span className="text-hint mt-0.5 block text-xs">{sub}</span>
              </span>
              <span className="text-hint text-xs">{meta}</span>
              <ChevronRight size={16} strokeWidth={1.5} className="text-hint shrink-0"/>
            </button>
          </li>
        ))}
      </ul>
    </section>

    {/* ── Study Record ── */}
    <button className="mt-9 px-6 mb-6 w-full text-left" onClick={() => onNavigate("calendar")}>
      <div className="flex items-baseline justify-between">
        <p className="text-main text-xs font-semibold tracking-[0.2em]">学習の記録</p>
        <p className="text-hint text-[11px]">连续 {studyDays} 天</p>
      </div>

      <ul className="mt-5 grid grid-cols-7 gap-2">
        {weekDays.map((d,i)=>{
          const todayIdx = (todayDow + 6) % 7;
          const studied = studiedDates.has(weekDates[i]);
          const state = i === todayIdx ? "today" : studied ? "done" : "rest";
          return (<li key={d} className="flex flex-col items-center gap-3">
            <span className={`text-xs ${state==="rest"?"text-hint/50":"text-main"}`}>{d}</span>
            <span className={state==="today"?"bg-main h-8 w-[3px] rounded-full":state==="done"?"bg-red-500 h-8 w-[3px] rounded-full":"bg-gray-300 h-8 w-[3px] rounded-full"}/>
          </li>);
        })}
      </ul>

    </button>

    <footer className="border-border mt-14 flex flex-col items-center gap-2 pb-8 md:mt-auto md:border-t md:pt-8">
      <p className="text-hint text-[10px] tracking-[0.36em]">日 課 学 習</p>
      <p className="text-main font-serif text-sm">継続は力なり</p>
    </footer>

  </div>);
}
