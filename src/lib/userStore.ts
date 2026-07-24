import { loadProfile as apiLoad, saveProfile as apiSave } from "./api";

const KEY = "user_profile";
export interface UserProfile { nickname: string; gender: string; avatar: string; }

export function loadProfile(): UserProfile {
  const local = JSON.parse(localStorage.getItem(KEY) || "{}");
  // Also try API — async but we use cached result
  apiLoad().then(p => { if (p && Object.keys(p).length) localStorage.setItem(KEY, JSON.stringify(p)); }).catch(()=>{});
  return local;
}
export async function saveProfile(p: Partial<UserProfile>) {
  const existing = loadProfile();
  const merged = { ...existing, ...p };
  localStorage.setItem(KEY, JSON.stringify(merged));
  try { await apiSave(merged); } catch {}
}
export function getNickname(): string { return loadProfile().nickname || "小明"; }
export function getGender(): string { return loadProfile().gender || "保密"; }
export function getAvatar(): string { return loadProfile().avatar || ""; }
