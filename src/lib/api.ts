const API = "http://localhost:3002";

async function get<T>(path: string): Promise<T> { const r = await fetch(API + path); return r.json(); }
async function put(path: string, data: any): Promise<void> { await fetch(API + path, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }); }

// Word Books
export function loadBooks() { return get<any[]>("/api/wordbooks"); }
export function saveBooks(books: any[]) { return put("/api/wordbooks", books); }

// Profile
export function loadProfile() { return get<{ nickname: string; gender: string; avatar: string }>("/api/profile"); }
export function saveProfile(p: any) { return put("/api/profile", p); }

// Progress (spaced repetition)
export function loadProgress() { return get<Record<string, any>>("/api/progress"); }
export function saveProgress(p: Record<string, any>) { return put("/api/progress", p); }

// Settings
export function loadSettings() { return get<{ dailyGoal: number; selectedBook: string }>("/api/settings"); }
export function saveSettings(s: any) { return put("/api/settings", s); }

// Stats
export function loadStats() { return get<{ studyDays: number; lastStudyDate: string }>("/api/stats"); }
export function saveStats(s: any) { return put("/api/stats", s); }
