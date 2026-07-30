import { setLocal } from "./store";

// Word record — track remembered/forgotten words from CardMatch and other sessions

const KEY_REMEMBERED = "word_record_remembered";
const KEY_FORGOTTEN = "word_record_forgotten";

export interface WordRecord {
  w: string;   // word
  r: string;   // reading
  m: string;   // meaning
  date: string; // ISO date
}

export function getRemembered(): WordRecord[] {
  try { return JSON.parse(localStorage.getItem(KEY_REMEMBERED) || "[]"); } catch { return []; }
}
export function getForgotten(): WordRecord[] {
  try { return JSON.parse(localStorage.getItem(KEY_FORGOTTEN) || "[]"); } catch { return []; }
}

export function addRemembered(word: { w: string; r: string; m: string }) {
  const list = getRemembered();
  const filtered = list.filter(w => w.w !== word.w);
  filtered.unshift({ ...word, date: new Date().toISOString().slice(0, 10) });
  setLocal(KEY_REMEMBERED, JSON.stringify(filtered.slice(0, 200)));
}

export function addForgotten(word: { w: string; r: string; m: string }) {
  const list = getForgotten();
  const filtered = list.filter(w => w.w !== word.w);
  filtered.unshift({ ...word, date: new Date().toISOString().slice(0, 10) });
  setLocal(KEY_FORGOTTEN, JSON.stringify(filtered.slice(0, 200)));
}
