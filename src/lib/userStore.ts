import { loadProfile as apiLoad, saveProfile as apiSave } from "./api";
import { getItem, setItem } from "./store";

const KEY = "user_profile";
export interface UserProfile { nickname: string; gender: string; avatar: string; }

let cache: UserProfile | null = null;
let apiLoaded = false;

export function loadProfile(): UserProfile {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? JSON.parse(raw) : {} as UserProfile;
  } catch { cache = {} as UserProfile; }
  getItem(KEY).then(raw => {
    if (raw) { cache = JSON.parse(raw); localStorage.setItem(KEY, raw); }
  }).catch(()=>{});
  if (!apiLoaded) {
    apiLoaded = true;
    apiLoad().then(p => { if (p && Object.keys(p).length) { cache = p as UserProfile; const s = JSON.stringify(p); localStorage.setItem(KEY, s); setItem(KEY, s); } }).catch(()=>{});
  }
  return cache || {} as UserProfile;
}
export async function saveProfile(p: Partial<UserProfile>) {
  const existing = loadProfile();
  const merged = { ...existing, ...p };
  cache = merged;
  const s = JSON.stringify(merged);
  localStorage.setItem(KEY, s);
  setItem(KEY, s).catch(()=>{});
  try { await apiSave(merged); } catch {}
}
export function getNickname(): string { return loadProfile().nickname || "小明"; }
export function getGender(): string { return loadProfile().gender || "保密"; }
export function getAvatar(): string { return loadProfile().avatar || ""; }
