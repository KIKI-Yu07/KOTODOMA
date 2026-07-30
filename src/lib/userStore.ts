import { getItem, setItem } from "./store";

const KEY = "user_profile";
export interface UserProfile { nickname: string; gender: string; avatar: string; }

let cache: UserProfile | null = null;

export function loadProfile(): UserProfile {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? JSON.parse(raw) : {} as UserProfile;
  } catch { cache = {} as UserProfile; }
  getItem(KEY).then(raw => {
    if (raw) { cache = JSON.parse(raw); localStorage.setItem(KEY, raw); }
  }).catch(()=>{});
  return cache || {} as UserProfile;
}
export async function saveProfile(p: Partial<UserProfile>) {
  const existing = loadProfile();
  const merged = { ...existing, ...p };
  cache = merged;
  const s = JSON.stringify(merged);
  localStorage.setItem(KEY, s);
  setItem(KEY, s).catch(()=>{});
}
export function getNickname(): string { return loadProfile().nickname || "小明"; }
export function getGender(): string { return loadProfile().gender || "保密"; }
export function getAvatar(): string { return loadProfile().avatar || ""; }
