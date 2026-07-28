import { setLocal } from "./store";

const KEY = "favorite_words";

export function getFavorites(): string[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}

export function toggleFavorite(wordId: string): boolean {
  const list = getFavorites();
  const idx = list.indexOf(wordId);
  if (idx >= 0) list.splice(idx, 1);
  else list.push(wordId);
  setLocal(KEY, JSON.stringify(list));
  return idx < 0; // true = added, false = removed
}

export function isFavorite(wordId: string): boolean {
  return getFavorites().includes(wordId);
}

export function getFavoriteCount(): number {
  return getFavorites().length;
}
