import { useState, useRef } from "react";
import { ArrowLeft, Upload, Trash2, Plus, FileText, BookOpen, Pencil } from "lucide-react";
import type { Page } from "../components/BottomNav";

interface WordBook { id: string; name: string; words: Word[]; }
interface Word { word: string; reading: string; meaning: string; pos: string; }

import { setItem } from "../lib/store";
function loadBooksSync(): WordBook[] { try { return JSON.parse(localStorage.getItem("wordbooks") || "[]"); } catch { return []; } }
function saveBooks(b: WordBook[]) { const s = JSON.stringify(b); localStorage.setItem("wordbooks", s); setItem("wordbooks", s).catch(()=>{}); }
function parseCSV(text: string): Word[] {
  const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];
  return lines.slice(1).map(l => { const c = l.split(/[,\t]/).map(x => x.trim().replace(/^["']|["']$/g, '')); return { word: c[0] || "", reading: c[1] || "", meaning: c[2] || "", pos: c[3] || "" }; }).filter(w => w.word);
}

interface Props { onNavigate?: (p: Page) => void; }

export default function WordLibrary({ onNavigate }: Props) {
  const [books, setBooks] = useState<WordBook[]>(loadBooksSync);
  const [viewBook, setViewBook] = useState<WordBook | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [newName, setNewName] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [sortBy, setSortBy] = useState<"time" | "time-r" | "alpha" | "alpha-r">("time");
  const [editingName, setEditingName] = useState(false);
  const [editName, setEditName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const addBook = () => { if (!newName.trim()) return; const b: WordBook = { id: Date.now().toString(36), name: newName.trim(), words: [] }; const updated = [...books, b]; setBooks(updated); saveBooks(updated); setNewName(""); setShowAdd(false); };
  const deleteBook = (id: string) => { const updated = books.filter(b => b.id !== id); setBooks(updated); saveBooks(updated); setViewBook(null); };

  const importWords = () => {
    if (!viewBook || !pasteText.trim()) return;
    const words = parseCSV(pasteText);
    if (!words.length) { return; }
    const updated = books.map(b => b.id === viewBook.id ? { ...b, words: [...b.words, ...words] } : b);
    setBooks(updated); saveBooks(updated);
    setViewBook({ ...viewBook, words: [...viewBook.words, ...words] });
    setPasteText(""); setShowImport(false);
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => { setPasteText(reader.result as string); };
    reader.readAsText(file);
  };

  const sortedWords = viewBook ? [...viewBook.words].sort((a, b) => {
    if (sortBy === "alpha") return a.word.localeCompare(b.word, "ja");
    if (sortBy === "alpha-r") return b.word.localeCompare(a.word, "ja");
    return 0; // time order = keep original
  }) : [];

  const gradientColors = ["#B3D9FF,#9CC7FF,#007AFF", "#C4F5D0,#A7E9C6,#00C48C", "#FFD6E0,#FFB3C6,#FF6B8A", "#FFEAA7,#FFD93D,#F59E0B"];

  // ── Book Detail View ──
  if (viewBook) {
    const g = gradientColors[books.findIndex(b => b.id === viewBook.id) % gradientColors.length].split(",");
    return (<div className="fixed inset-0 z-50 bg-bg flex flex-col">
      <div className="flex-1 min-h-0 overflow-y-auto scroll-area">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2">
          <button onClick={() => setViewBook(null)} className="flex items-center gap-1 text-hint text-sm font-bold active:opacity-60">
            <ArrowLeft size={16} stroke="var(--color-text-tertiary)" strokeWidth={2} /><span>戻る</span>
          </button>
          <button onClick={() => setShowImport(true)} className="text-hint active:opacity-60"><Plus size={22} /></button>
        </div>

        {/* Book Info Card */}
        <div className="px-4 pb-3 flex items-center gap-4">
          <div className="w-[60px] h-[60px] rounded-2xl shrink-0 relative overflow-hidden flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${g[0]}, ${g[1]})` }}>
            <BookOpen size={20} stroke="white" />
            <div className="absolute -bottom-1 -right-1 w-12 h-3 rounded-full" style={{ background: g[2], opacity: 0.4, transform: "rotate(-15deg)" }} />
          </div>
          <div>
            {editingName ? (
              <div className="flex items-center gap-2">
                <input autoFocus value={editName} onChange={e => setEditName(e.target.value)}
                  className="w-[120px] px-2 py-1 rounded-lg bg-primary-subtle text-main text-sm font-bold outline-none" />
                <button onClick={() => {
                  const updated = books.map(b => b.id === viewBook.id ? { ...b, name: editName || b.name } : b);
                  setBooks(updated); saveBooks(updated);
                  setViewBook({ ...viewBook, name: editName || viewBook.name });
                  setEditingName(false);
                }} className="text-primary text-xs font-bold">确定</button>
                <button onClick={() => setEditingName(false)} className="text-hint text-xs">取消</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-main">{viewBook.name}</h2>
                <button onClick={() => { setEditingName(true); setEditName(viewBook.name); }} className="text-hint active:text-primary">
                  <Pencil size={14} />
                </button>
              </div>
            )}
            <p className="text-sm text-hint">单词数：{viewBook.words.length}</p>
          </div>
        </div>

        {/* Word List or Empty State */}
        {viewBook.words.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-8">
            <BookOpen size={48} className="text-primary-subtle mb-4" strokeWidth={1.5} />
            <p className="text-sm text-hint font-bold">暂无单词</p>
            <p className="text-xs text-hint mt-1">点击右上角 ... 按钮去添加单词吧 ~</p>
          </div>
        ) : (
          <div className="px-4 space-y-1 pb-4">
            {sortedWords.map((w, i) => (
              <div key={i} className="bg-surface rounded-xl p-3 shadow-sm border border-border flex items-center justify-between">
                <div>
                  <p className="text-sm font-extrabold text-main">{w.word}</p>
                  <p className="text-xs text-primary mt-0.5">{w.reading}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-sub">{w.meaning}</p>
                  {w.pos && <p className="text-[10px] text-hint mt-0.5">{w.pos}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Import Modal */}
        {showImport && (
          <div className="absolute inset-0 z-50 flex flex-col">
            <div className="flex-1 bg-black/20 transition-opacity duration-300" onClick={() => setShowImport(false)} />
            <div className="bg-surface rounded-t-2xl shadow-xl animate-[slideUp_0.3s_ease-out]" onClick={e => e.stopPropagation()}>
              <div className="p-5">
                <h3 className="font-bold text-main text-lg mb-1">単語を追加</h3>
                <p className="text-xs text-hint mb-4">CSV形式: 単語,読み,意味,品詞</p>
                <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
                  className={`border-2 border-dashed rounded-2xl p-3 text-center transition-colors ${dragOver ? "border-primary bg-primary-subtle" : "border-border"}`}>
                  <Upload size={20} className="text-hint mx-auto mb-1" />
                  <p className="text-xs text-hint mb-2">ファイルをドラッグ</p>
                  <button onClick={() => fileRef.current?.click()} className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold active:scale-95">
                    <FileText size={14} className="inline mr-1" />CSV 選択
                  </button>
                  <input ref={fileRef} type="file" accept=".csv,.tsv,.txt" className="hidden" onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
                </div>
                <textarea className="w-full h-[80px] mt-3 p-2 rounded-xl bg-primary-subtle text-main text-xs outline-none resize-none" value={pasteText} onChange={e => setPasteText(e.target.value)} placeholder="単語,読み,意味,品詞" />
                <button onClick={importWords} className="w-full mt-2 py-2.5 rounded-xl bg-primary text-white text-sm font-bold active:scale-95">追加</button>
              </div>
              <button onClick={() => setShowImport(false)} className="w-full py-3 text-sub text-sm font-bold border-t border-border">閉じる</button>
            </div>
          </div>
        )}
      </div>
    </div>);
  }

  // ── Book List View ──
  return (<>
    <div className="flex-1 min-h-0 overflow-y-auto scroll-area">
      <div className="flex items-center justify-between px-4 py-2">
        <button onClick={() => onNavigate?.("vocab")} className="flex items-center gap-1 text-hint text-sm font-bold active:opacity-60">
          <ArrowLeft size={16} stroke="var(--color-text-tertiary)" strokeWidth={2} /><span>戻る</span>
        </button>
        <span className="text-lg font-bold text-main">单词本</span>
        <div className="w-10" />
      </div>

      <div className="px-4 pb-4 space-y-3">
        {books.length === 0 ? (
          <div className="text-center py-16 text-hint text-sm">まだ单词本がありません</div>
        ) : books.map((b, i) => {
          const g = gradientColors[i % gradientColors.length].split(",");
          return (
            <div key={b.id} onClick={() => setViewBook(b)} className="bg-surface rounded-2xl p-4 shadow-sm border border-border flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-all">
              <div className="w-[60px] h-[60px] rounded-2xl shrink-0 relative overflow-hidden flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${g[0]}, ${g[1]})` }}>
                <BookOpen size={20} stroke="white" />
                <div className="absolute -bottom-1 -right-1 w-12 h-3 rounded-full" style={{ background: g[2], opacity: 0.4, transform: "rotate(-15deg)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-extrabold text-main">{b.name}</p>
                <p className="text-xs text-hint mt-0.5">共 {b.words.length} 词</p>
              </div>
              <button onClick={e => { e.stopPropagation(); deleteBook(b.id); }} className="text-xs text-hint font-bold active:text-danger flex items-center gap-1 shrink-0">
                <Trash2 size={13} />删除
              </button>
            </div>
          );
        })}
      </div>
    </div>

    <div className="px-4 pb-4 bg-bg">
      <button onClick={() => setShowAdd(true)} className="w-full py-3.5 rounded-xl bg-primary text-white font-extrabold text-sm active:scale-[0.98] shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
        <Plus size={18} />新建单词本
      </button>
    </div>

    {showAdd && (
      <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setShowAdd(false)}>
        <div className="bg-surface rounded-t-2xl w-full p-5 shadow-xl" onClick={e => e.stopPropagation()}>
          <h3 className="font-bold text-main text-lg mb-3">新建单词本</h3>
          <input autoFocus value={newName} onChange={e => setNewName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-primary-subtle text-main outline-none text-sm mb-3" placeholder="单词本名称" />
          <div className="flex gap-2">
            <button onClick={() => setShowAdd(false)} className="flex-1 py-3 rounded-xl bg-gray-100 text-main text-sm font-bold">取消</button>
            <button onClick={addBook} className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-bold">作成</button>
          </div>
        </div>
      </div>
    )}
  </>);
}
