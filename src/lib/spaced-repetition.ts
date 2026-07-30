import { getItem, setItem } from "./store";

// SM-2 Spaced Repetition Algorithm

export interface WordProgress {
  ease: number;       // 2.5 default, min 1.3
  interval: number;   // days
  reps: number;       // consecutive correct answers
  nextReview: string; // ISO date
  lastReview: string; // ISO date
  totalCorrect: number;
  totalWrong: number;
}

const STORAGE_KEY = "word_progress";
let cache: Record<string, WordProgress> | null = null;

export function loadProgress(): Record<string, WordProgress> {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    cache = raw ? JSON.parse(raw) : {};
  } catch { cache = {}; }
  // Load from IndexedDB async — update cache when ready
  getItem(STORAGE_KEY).then(raw => {
    if (raw) { cache = JSON.parse(raw); localStorage.setItem(STORAGE_KEY, raw); }
  }).catch(()=>{});
  return cache || {};
}

function saveProgress(p: Record<string, WordProgress>) {
  cache = p;
  const raw = JSON.stringify(p);
  localStorage.setItem(STORAGE_KEY, raw);
  setItem(STORAGE_KEY, raw).catch(() => {});
}

export function initWord(wordId: string): WordProgress {
  return { ease: 2.5, interval: 0, reps: 0, nextReview: todayISO(), lastReview: "", totalCorrect: 0, totalWrong: 0 };
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso); d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function answerWord(wordId: string, correct: boolean, forcedNextReview?: string): WordProgress {
  const all = loadProgress();
  const p = all[wordId] || initWord(wordId);
  const today = todayISO();

  p.lastReview = today;
  if (correct) {
    p.totalCorrect++;
    if (p.reps === 0) p.interval = 1;
    else if (p.reps === 1) p.interval = 6;
    else p.interval = Math.round(p.interval * p.ease);
    p.reps++;
  } else {
    p.totalWrong++;
    p.reps = 0;
    p.interval = 1;
    p.ease = Math.max(1.3, p.ease - 0.2);
  }
  p.nextReview = forcedNextReview || addDays(today, p.interval);

  all[wordId] = p;
  saveProgress(all);
  return p;
}

export function getReviewCount(): number {
  const all = loadProgress();
  const today = todayISO();
  return Object.values(all).filter(p => p.nextReview <= today).length;
}

export function getNewWordsToLearn(dailyGoal: number, totalAvailable: number): { newCount: number; reviewCount: number } {
  const reviewCount = getReviewCount();
  const newCount = Math.max(0, dailyGoal - reviewCount);
  return { newCount, reviewCount };
}
