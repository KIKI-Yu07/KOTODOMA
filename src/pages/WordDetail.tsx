import { useState } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import type { Page } from "../components/BottomNav";
import StatusBar from "../components/StatusBar";

interface WordDetailProps {
  onNavigate: (page: Page) => void;
  darkMode?: boolean;
}

const allParticles = [
  { id: "は", label: "は" },
  { id: "が", label: "が" },
  { id: "に", label: "に" },
  { id: "で", label: "で" },
  { id: "を", label: "を" },
  { id: "も", label: "も" },
  { id: "と", label: "と" },
  { id: "や", label: "や" },
  { id: "から", label: "から" },
  { id: "まで", label: "まで" },
  { id: "へ", label: "へ" },
  { id: "より", label: "より" },
  { id: "の", label: "の" },
  { id: "か", label: "か" },
];

const compareItems = [
  { label: "は vs が", desc: "主題と主語の使い分け · 20問", color: "#A78BFA", bg: "var(--[#F3EEFF])", particles: ["は", "が"] },
  { label: "に vs で", desc: "場所・手段の表現 · 18問", color: "#D34947", bg: "var(--red-bg)", particles: ["に", "で"] },
  { label: "を vs が", desc: "目的語と自動詞 · 15問", color: "#D34947", bg: "var(--orange-bg)", particles: ["を", "が"] },
  { label: "も・と・や", desc: "並列助詞の比較 · 12問", color: "#018B8D", bg: "var(--teal-bg)", particles: ["も", "と", "や"] },
  { label: "から vs まで", desc: "起点と終点 · 10問", color: "#018B8D", bg: "var(--[#F3EEFF])", particles: ["から", "まで"] },
  { label: "へ vs に", desc: "方向表現 · 10問", color: "#7C3AED", bg: "var(--[#F3EEFF])", particles: ["へ", "に"] },
  { label: "より vs の", desc: "比較と所属 · 8問", color: "#EB5C20", bg: "var(--orange-bg)", particles: ["より", "の"] },
];

const positionItems = [
  { label: "主題の「は」", desc: "文頭付近 · 主題の提示位置 · 15問", color: "#A78BFA", bg: "var(--[#F3EEFF])", particles: ["は"] },
  { label: "主語の「が」", desc: "述語の直前 · 主格の位置 · 15問", color: "#A78BFA", bg: "var(--[#F3EEFF])", particles: ["が"] },
  { label: "目的語の「を」", desc: "動詞の直前 · 対象の位置 · 15問", color: "#D34947", bg: "var(--red-bg)", particles: ["を"] },
  { label: "場所の「に/で」", desc: "動詞の前 · 動作の場所 · 18問", color: "#D34947", bg: "var(--red-bg)", particles: ["に", "で"] },
  { label: "時間の「に」", desc: "文頭または動詞前 · 時点の位置 · 12問", color: "#018B8D", bg: "var(--teal-bg)", particles: ["に"] },
  { label: "手段の「で」", desc: "動詞の前 · 方法・道具 · 12問", color: "#018B8D", bg: "var(--teal-bg)", particles: ["で"] },
  { label: "到達点の「へ/に」", desc: "移動動詞の前 · 方向・目的地 · 10問", color: "#7C3AED", bg: "var(--[#F3EEFF])", particles: ["へ", "に"] },
  { label: "起点〜終点", desc: "から/まで の語順 · 範囲表現 · 10問", color: "#018B8D", bg: "var(--[#F3EEFF])", particles: ["から", "まで"] },
  { label: "並列の「と/や」", desc: "名詞の間 · 並列接続の位置 · 8問", color: "#EB5C20", bg: "var(--orange-bg)", particles: ["と", "や"] },
  { label: "所属の「の」", desc: "名詞と名詞の間 · 修飾関係 · 10問", color: "#A78BFA", bg: "var(--[#F3EEFF])", particles: ["の"] },
];

const conjugateItems = [
  { label: "て形変換", desc: "動詞→て形 · 30問", color: "#A78BFA", bg: "var(--[#F3EEFF])" },
  { label: "た形変換", desc: "動詞→た形 · 30問", color: "#D34947", bg: "var(--red-bg)" },
  { label: "ない形変換", desc: "動詞→ない形 · 25問", color: "#D34947", bg: "var(--orange-bg)" },
  { label: "辞書形↔ます形", desc: "相互変換 · 28問", color: "#018B8D", bg: "var(--teal-bg)" },
  { label: "受身形・使役形", desc: "上級変形 · 20問", color: "#018B8D", bg: "var(--[#F3EEFF])" },
];

const sentenceItems = [
  { label: "〜てください", desc: "依頼表現 · 15問", color: "#A78BFA", bg: "var(--[#F3EEFF])" },
  { label: "〜てもいい", desc: "許可表現 · 12問", color: "#D34947", bg: "var(--red-bg)" },
  { label: "〜なければならない", desc: "義務表現 · 10問", color: "#D34947", bg: "var(--orange-bg)" },
  { label: "〜たことがある", desc: "経験表現 · 14問", color: "#018B8D", bg: "var(--teal-bg)" },
  { label: "条件表現", desc: "と・ば・たら・なら · 20問", color: "#018B8D", bg: "var(--[#F3EEFF])" },
];

export default function WordDetail({ onNavigate, darkMode }: WordDetailProps) {
  const [tab, setTab] = useState<"particle" | "conjugate" | "sentence">("particle");
  const [particleSubTab, setParticleSubTab] = useState<"compare" | "position">("compare");
  const [selectedParticles, setSelectedParticles] = useState<Set<string>>(new Set());

  const toggleParticle = (id: string) => {
    setSelectedParticles((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAllParticles = () => setSelectedParticles(new Set(allParticles.map((p) => p.id)));
  const clearParticles = () => setSelectedParticles(new Set());

  const activeParticleItems = particleSubTab === "compare" ? compareItems : positionItems;

  const filteredParticleItems =
    selectedParticles.size === 0
      ? activeParticleItems
      : activeParticleItems.filter((item) => item.particles.some((p) => selectedParticles.has(p)));

  const currentItems = tab === "particle" ? filteredParticleItems : tab === "conjugate" ? conjugateItems : sentenceItems;

  return (
    <>
      <StatusBar darkMode={darkMode} />
      <div className="flex items-center gap-3 px-4 py-2">
        <button
          onClick={() => onNavigate("home")}
          className="w-8 h-8 bg-white dark:[#1C1828] rounded-full flex items-center justify-center shadow-sm card-hover"
        >
          <ArrowLeft size={16} stroke="var(--[#1A1C22])" strokeWidth={2.5} className="dark:stroke-[#E0E0E0]" />
        </button>
        <span className="text-[15px] font-semibold text-[#1A1C22] dark:text-[#1A1C22]">文法練習</span>
      </div>

      <div className="flex-1 overflow-y-auto scroll-area px-4 pb-4 space-y-4">
        {/* Tab Selector */}
        <div className="card rounded-2xl p-1.5 flex">
          {([
            { id: "particle" as const, label: "助詞", icon: "を" },
            { id: "conjugate" as const, label: "変形", icon: "変" },
            { id: "sentence" as const, label: "文型", icon: "文" },
          ]).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${
                tab === t.id
                  ? "[#A78BFA] text-white shadow-sm glow-primary"
                  : "text-[#4A4A50] dark:text-[#999AA0]"
              }`}
            >
              <span className="text-xs font-bold">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Particle Selector */}
        {tab === "particle" && (
          <div className="card rounded-2xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#4A4A50] dark:text-[#999AA0]">助詞を選択</span>
              <div className="flex gap-2">
                <button
                  onClick={selectAllParticles}
                  className="text-[11px] font-medium [#A78BFA]"
                >
                  全選択
                </button>
                <button
                  onClick={clearParticles}
                  className="text-[11px] font-medium [#D34947]"
                >
                  クリア
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {allParticles.map((p) => {
                const active = selectedParticles.has(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => toggleParticle(p.id)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
                      active
                        ? "[#A78BFA] text-white shadow-sm"
                        : "[#F3EEFF] dark:[#F3EEFF] text-[#4A4A50] dark:text-[#999AA0]"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
            {selectedParticles.size > 0 && (
              <p className="text-[10px] text-[#4A4A50] dark:text-[#999AA0] mt-2">
                {selectedParticles.size}個選択中 · {filteredParticleItems.length}件ヒット
              </p>
            )}
          </div>
        )}

        {/* Particle Sub-tabs */}
        {tab === "particle" && (
          <div className="card rounded-2xl p-1.5 flex">
            {([
              { id: "compare" as const, label: "助詞比較", icon: "比" },
              { id: "position" as const, label: "文中位置", icon: "位" },
            ]).map((st) => (
              <button
                key={st.id}
                onClick={() => { setParticleSubTab(st.id); setSelectedParticles(new Set()); }}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  particleSubTab === st.id
                    ? "bg-[#D34947] text-white shadow-sm glow-primary"
                    : "text-[#4A4A50] dark:text-[#999AA0]"
                }`}
              >
                <span className="text-xs font-bold">{st.icon}</span>
                {st.label}
              </button>
            ))}
          </div>
        )}

        {/* Practice Items */}
        <div className="space-y-2">
          {currentItems.length === 0 ? (
            <div className="text-center py-8 text-[#4A4A50] dark:text-[#999AA0] text-sm">
              該当する練習がありません
            </div>
          ) : (
            currentItems.map((item, i) => (
            <div
              key={i}
              className="card card-interactive rounded-2xl p-3 flex items-center gap-3 cursor-pointer"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0"
                style={{ backgroundColor: item.bg, color: item.color }}
              >
                {item.label.slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-[#1A1C22] dark:text-[#1A1C22] block">{item.label}</span>
                <p className="text-[11px] text-[#4A4A50] dark:text-[#999AA0]">{item.desc}</p>
              </div>
              <ChevronRight size={14} stroke="var(--primary-50)" />
            </div>
            ))
          )}
        </div>

        <div className="h-2" />
      </div>
    </>
  );
}
