// Shared word source — supports both textbooks (第一册/第二册) and custom wordbooks.
import { book2Data } from "../data/book2";
import { book1Chapters } from "../data/book1";

export interface WordEntry {
  id: string;
  w: string;   // word (kanji)
  r: string;   // reading (kana)
  m: string;   // meaning
  p: string;   // part of speech
}

const book1Words: WordEntry[] = book1Chapters.flatMap(ch => ch.words.map(w => ({ id:w.id, w:w.word, r:w.reading, m:w.meaning, p:w.pos })));
const book2Words: WordEntry[] = book2Data.flatMap(ch => ch.words.map(w => ({ id:w.id, w:w.word, r:w.reading, m:w.meaning, p:w.pos })));
const totalBook1 = book1Words.length;
const totalBook2 = book2Words.length;

export function getAllTextbookWords(): WordEntry[] {
  return [...book1Words, ...book2Words];
}

export function getVol1Words(): WordEntry[] { return book1Words; }
export function getVol2Words(): WordEntry[] { return book2Words; }

export function getWordSource(): WordEntry[] {
  const selectedBook = localStorage.getItem("selectedBook") || "all";

  // Textbook options
  if (selectedBook === "vol1") return book1Words;
  if (selectedBook === "vol2") return book2Words;
  if (selectedBook === "all") return getAllTextbookWords();

  // Custom wordbook
  if (selectedBook) {
    try {
      const wbs = JSON.parse(localStorage.getItem("wordbooks") || "[]") as {
        id: string; name: string; words: { word: string; reading: string; meaning: string; pos: string }[];
      }[];
      const wb = wbs.find(b => b.id === selectedBook);
      if (wb && wb.words.length > 0) {
        return wb.words.map((w, i) => ({
          id: `wb_${selectedBook}_${i}`,
          w: w.word, r: w.reading, m: w.meaning, p: w.pos || "",
        }));
      }
    } catch {}
    return [];
  }

  return getAllTextbookWords();
}

export function getWordById(id: string): WordEntry | undefined {
  return getWordSource().find(w => w.id === id);
}

export function isCustomBookSelected(): boolean {
  const selectedBook = localStorage.getItem("selectedBook") || "all";
  return !["vol1", "vol2", "all", ""].includes(selectedBook);
}

// For WordList: chapter-structured book data
export interface WordChapter { id: string; name: string; words: WordEntry[]; }
export interface WordBook { id: string; name: string; chapters: WordChapter[]; }

export function getTextbookChapters(): WordBook[] {
  return [
    {
      id: "vol1", name: "第一册",
      chapters: book1Chapters.map(ch => ({
        id: ch.id, name: ch.name,
        words: ch.words.map(w => ({ id: w.id, w: w.word, r: w.reading, m: w.meaning, p: w.pos })),
      })),
    },
    {
      id: "vol2", name: "第二册",
      chapters: book2Data.map(ch => ({
        id: ch.id, name: ch.name,
        words: ch.words.map(w => ({ id: w.id, w: w.word, r: w.reading, m: w.meaning, p: w.pos })),
      })),
    },
  ];
}

export function getBook1WordCount(): number { return totalBook1; }
export function getBook2WordCount(): number { return totalBook2; }
