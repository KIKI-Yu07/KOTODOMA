import { useState, useRef } from "react";
import { ArrowLeft, Trash2, Plus, BookOpen, Pencil, X, Upload, FileText } from "lucide-react";
import type { Page } from "../components/BottomNav";
import { setItem } from "../lib/store";

interface WordBook { id: string; name: string; words: Word[]; }
interface Word { word: string; reading: string; meaning: string; pos: string; }

function loadBooksSync(): WordBook[] { try { return JSON.parse(localStorage.getItem("wordbooks") || "[]"); } catch { return []; } }
function saveBooks(b: WordBook[]) { const s = JSON.stringify(b); localStorage.setItem("wordbooks", s); setItem("wordbooks", s).catch(()=>{}); }
function parseCSV(text: string): Word[] {
  const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];
  return lines.slice(1).map(l => { const c = l.split(/[,\t]/).map(x => x.trim().replace(/^["']|["']$/g, '')); return { word: c[0] || "", reading: c[1] || "", meaning: c[2] || "", pos: c[3] || "" }; }).filter(w => w.word);
}

// ── AddWordModal (bottom sheet) ──
function AddWordModal({ onClose, onAdd }: { onClose: () => void; onAdd: (w: Word) => void }) {
  const [word, setWord] = useState("");
  const [reading, setReading] = useState("");
  const [meaning, setMeaning] = useState("");
  const [pos, setPos] = useState("");
  const [mode, setMode] = useState<"single" | "batch">("single");
  const [pasteText, setPasteText] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => { if (!word.trim() || !meaning.trim()) return; onAdd({ word: word.trim(), reading: reading.trim(), meaning: meaning.trim(), pos: pos.trim() }); };
  const handleBatchImport = () => { const words = parseCSV(pasteText); if (!words.length) return; words.forEach(w => onAdd(w)); setPasteText(""); onClose(); };
  const handleFile = (file: File) => { const r = new FileReader(); r.onload = () => setPasteText(r.result as string); r.readAsText(file); };

  return (
    <div className="absolute inset-0 z-50 flex flex-col">
      <div className="flex-1 bg-black/20" onClick={onClose} />
      <div className="bg-white rounded-t-2xl shadow-xl max-h-[85%] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 rounded-full bg-border" /></div>
        <div className="px-5 pb-3">
          <div className="flex items-center justify-between">
            <div><h3 className="text-base font-bold text-main">录入单词</h3><p className="text-sm text-sub mt-0.5">支持读音、释义、词性</p></div>
            <button onClick={onClose} className="size-8 flex items-center justify-center rounded-lg text-hint hover:bg-surface-subtle"><X size={18} strokeWidth={2} /></button>
          </div>
          <div className="flex mt-3 bg-surface-subtle rounded-lg p-0.5">
            {([["single","逐个录入"],["batch","批量导入"]] as const).map(([k,l]) => (
              <button key={k} onClick={() => setMode(k)} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${mode === k ? "bg-white text-main shadow-sm" : "text-sub"}`}>{l}</button>
            ))}
          </div>
        </div>
        {mode === "single" ? (
          <div className="px-5 pb-6">
            <div className="flex gap-3">
              <div className="flex-1"><label className="text-sm font-bold text-main">单词 <span className="text-danger">*</span></label><input value={word} onChange={e => setWord(e.target.value)} className="w-full h-10 mt-1.5 px-3 rounded-lg border border-border text-sm text-main outline-none focus:border-primary" placeholder="例: 生活" /></div>
              <div className="flex-1"><label className="text-sm font-bold text-main">读音</label><input value={reading} onChange={e => setReading(e.target.value)} className="w-full h-10 mt-1.5 px-3 rounded-lg border border-border text-sm text-main outline-none focus:border-primary" placeholder="例: せいかつ" /></div>
            </div>
            <div className="mt-4"><label className="text-sm font-bold text-main">释义 <span className="text-danger">*</span></label><input value={meaning} onChange={e => setMeaning(e.target.value)} className="w-full h-10 mt-1.5 px-3 rounded-lg border border-border text-sm text-main outline-none focus:border-primary" placeholder="例: 生活" /></div>
            <div className="mt-4"><label className="text-sm font-bold text-main">词性</label>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {["名詞","動詞","形容詞","副詞","連体詞","その他"].map(t => (
                  <button key={t} onClick={() => setPos(pos === t ? "" : t)} className={`px-3 py-1 text-xs rounded-full border ${pos === t ? "bg-primary text-white border-primary" : "bg-white text-sub border-border"}`}>{t}</button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-main hover:bg-surface-subtle">取消</button>
              <button onClick={handleAdd} disabled={!word.trim() || !meaning.trim()} className={`flex-1 py-2.5 rounded-lg text-sm font-medium ${word.trim() && meaning.trim() ? "bg-primary text-white" : "bg-disabled text-white cursor-not-allowed"}`}>添加到词库</button>
            </div>
          </div>
        ) : (
          <div className="px-5 pb-6">
            <p className="text-xs text-sub mb-3">CSV形式: 単語,読み,意味,品詞</p>
            <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={e => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }} className={`border-2 border-dashed rounded-xl p-4 text-center ${dragOver ? "border-primary bg-surface-subtle" : "border-border"}`}>
              <Upload size={20} className="text-hint mx-auto mb-1" /><p className="text-xs text-hint mb-2">拖拽CSV文件</p>
              <button onClick={() => fileRef.current?.click()} className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-bold"><FileText size={14} className="inline mr-1" />选择文件</button>
              <input ref={fileRef} type="file" accept=".csv,.tsv,.txt" className="hidden" onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
            </div>
            <textarea className="w-full h-[80px] mt-3 p-3 rounded-lg bg-surface-subtle text-main text-xs outline-none resize-none" value={pasteText} onChange={e => setPasteText(e.target.value)} placeholder={"単語,読み,意味,品詞\n例: 生活,せいかつ,生活,名詞"} />
            <button onClick={handleBatchImport} disabled={!pasteText.trim()} className={`w-full mt-3 py-2.5 rounded-lg text-sm font-medium ${pasteText.trim() ? "bg-primary text-white" : "bg-disabled text-white cursor-not-allowed"}`}>批量追加</button>
          </div>
        )}
      </div>
    </div>
  );
}

interface Props { onNavigate?: (p: Page) => void; }

export default function WordBooksPage({ onNavigate }: Props) {
  const [books, setBooks] = useState<WordBook[]>(loadBooksSync);
  const [viewBook, setViewBook] = useState<WordBook | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [editName, setEditName] = useState("");

  const addBook = () => { if (!newName.trim()) return; const b: WordBook = { id: Date.now().toString(36), name: newName.trim(), words: [] }; const updated = [...books, b]; setBooks(updated); saveBooks(updated); setNewName(""); setShowAdd(false); };
  const deleteBook = (id: string) => { const updated = books.filter(b => b.id !== id); setBooks(updated); saveBooks(updated); setViewBook(null); };
  const deleteWord = (idx: number) => {
    if (!viewBook) return;
    const newWords = viewBook.words.filter((_, i) => i !== idx);
    const updated = books.map(b => b.id === viewBook.id ? { ...b, words: newWords } : b);
    setBooks(updated); saveBooks(updated);
    setViewBook({ ...viewBook, words: newWords });
  };

  // ── Book Detail ──
  if (viewBook) return (
    <div className="flex-1 min-h-0 flex flex-col bg-bg">
      <div className="flex items-center justify-between px-4 py-2">
        <button onClick={() => setViewBook(null)} className="flex items-center gap-1 text-hint text-sm font-bold active:opacity-60">
          <ArrowLeft size={16} strokeWidth={2} />
        </button>
        <span className="text-2xl font-semibold tracking-tight text-main">{viewBook.name}</span>
        <button onClick={() => setShowImport(true)} className="size-8 flex items-center justify-center rounded-lg text-hint hover:bg-white active:scale-90">
          <Plus size={20} strokeWidth={2} />
        </button>
      </div>

      <div className="flex items-center justify-between px-4 pb-2">
        {editingName ? (
          <div className="flex items-center gap-2">
            <input value={editName} onChange={e => setEditName(e.target.value)} className="w-[140px] px-3 py-1.5 rounded-lg border border-border text-sm outline-none focus:border-primary" />
            <button onClick={() => { const u = books.map(b => b.id === viewBook.id ? { ...b, name: editName || b.name } : b); setBooks(u); saveBooks(u); setViewBook({ ...viewBook, name: editName || viewBook.name }); setEditingName(false); }} className="text-xs font-bold text-main">确定</button>
            <button onClick={() => setEditingName(false)} className="text-xs text-hint">取消</button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <p className="text-sm text-sub">共 {viewBook.words.length} 词</p>
            <button onClick={() => { setEditingName(true); setEditName(viewBook.name); }} className="text-hint"><Pencil size={13} /></button>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scroll-area px-4 pb-4">
        {viewBook.words.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BookOpen size={44} className="text-hint/30 mb-3" strokeWidth={1.5} />
            <p className="text-sm font-bold text-sub mb-1">暂无单词</p>
            <p className="text-xs text-hint">点击右上角 + 添加单词</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {viewBook.words.map((w, i) => (
              <div key={i} className="bg-white rounded-xl px-4 py-3 flex items-center justify-between group">
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] text-sub block">{w.reading}</span>
                  <span className="text-[15px] font-bold text-main block leading-tight">{w.word}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-[13px] font-medium text-sub">{w.meaning}</p>
                    {w.pos && <p className="text-[10px] text-hint mt-0.5">{w.pos}</p>}
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); deleteWord(i); }} className="size-6 rounded-full flex items-center justify-center text-hint/30 hover:text-danger hover:bg-danger/5 transition-colors shrink-0 ml-1">
                    <X size={14} strokeWidth={2} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showImport && <AddWordModal onClose={() => setShowImport(false)} onAdd={(w) => { const u = books.map(b => b.id === viewBook.id ? { ...b, words: [...b.words, w] } : b); setBooks(u); saveBooks(u); setViewBook({ ...viewBook, words: [...viewBook.words, w] }); setShowImport(false); }} />}
    </div>
  );

  // ── Book List ──
  return (
    <div className="flex-1 min-h-0 flex flex-col bg-bg">
      <div className="flex items-center justify-between px-4 py-2">
        <button onClick={() => onNavigate?.("vocab")} className="flex items-center gap-1 text-hint text-sm font-bold active:opacity-60">
          <ArrowLeft size={16} strokeWidth={2} />
        </button>
        <span className="text-2xl font-semibold tracking-tight text-main">单词本</span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scroll-area px-4 pb-4">
        {books.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BookOpen size={44} className="text-hint/30 mb-3" strokeWidth={1.5} />
            <p className="text-sm font-bold text-sub mb-1">还没有单词本</p>
            <p className="text-xs text-hint">点击下方按钮创建第一个单词本</p>
          </div>
        ) : (
          <div className="space-y-2">
            {books.map(b => (
              <button key={b.id} onClick={() => setViewBook(b)} className="w-full bg-white rounded-xl px-4 py-4 flex items-center gap-4 active:bg-surface-subtle transition-colors text-left">
                <div className="size-11 rounded-xl bg-primary flex items-center justify-center shrink-0">
                  <span className="text-white text-base font-semibold">{b.name[0] || "词"}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-main">{b.name}</p>
                  <p className="text-[13px] text-sub mt-0.5">共 {b.words.length} 词</p>
                </div>
                <Trash2 size={15} className="text-hint/40 shrink-0" onClick={e => { e.stopPropagation(); deleteBook(b.id); }} />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 pb-4">
        <button onClick={() => setShowAdd(true)} className="w-full py-3.5 rounded-xl bg-primary text-white text-sm font-semibold active:scale-[0.98] flex items-center justify-center gap-2">
          <Plus size={18} strokeWidth={2} />新建单词本
        </button>
      </div>

      {showAdd && (
        <div className="absolute inset-0 z-50 flex items-end bg-black/40" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-t-2xl w-full p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold text-main mb-4">新建单词本</h3>
            <input value={newName} onChange={e => setNewName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-surface-subtle text-main outline-none text-sm mb-4" placeholder="输入单词本名称" />
            <div className="flex gap-3">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-3 rounded-xl border border-border text-sm font-medium text-main">取消</button>
              <button onClick={addBook} className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-medium">创建</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
