import { useState, useEffect, useRef, useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { setToastHandler } from "./lib/toast";
import BottomNav, { type Page } from "./components/BottomNav";
import SplashScreen from "./components/SplashScreen";
import LandingPage from "./pages/LandingPage";
import Home from "./pages/Home";
import WordDetail from "./pages/WordDetail";
import WordList from "./pages/WordList";
import WordBooksPage from "./pages/WordBooksPage";
import VocabularyGrid from "./pages/VocabularyGrid";
import SettingsPage from "./pages/SettingsPage";
import StudyPage from "./pages/StudyPage";
import ProfileEdit from "./pages/ProfileEdit";
import SearchPage from "./pages/SearchPage";
import RestPage from "./pages/RestPage";
import PracticePage from "./pages/PracticePage";
import FavoritesPage from "./pages/FavoritesPage";
import CardMatch from "./pages/CardMatch";
import FeedbackPage from "./pages/FeedbackPage";
import StudyCalendar from "./pages/StudyCalendar";
import WordRecord from "./pages/WordRecord";
import ListReview from "./pages/ListReview";
import LearnedWords from "./pages/LearnedWords";

// Keep mounted (display:none) to preserve scroll — only 首页/语法/我的
function Keep({ show, children, animate }: { show: boolean; children: React.ReactNode; animate?: boolean }) {
  const [animClass, setAnimClass] = useState("");

  useEffect(() => {
    if (show && animate) {
      setAnimClass("");
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimClass("animate-slide-in-right")));
    }
    if (!show) { setAnimClass(""); }
  }, [show, animate]);

  return (
    <div className={`flex flex-col flex-1 overflow-hidden ${animClass}`} style={{ display: show ? "flex" : "none" }}>
      {children}
    </div>
  );
}

// Unmount when not active — all other pages
function Show({ show, children }: { show: boolean; children: React.ReactNode }) {
  return <>{show ? children : null}</>;
}

// Slide in from right on enter, instant unmount on leave
function SlideIn({ show, children }: { show: boolean; children: React.ReactNode }) {
  if (!show) return null;
  return <div className="animate-slide-in-right flex flex-col flex-1 overflow-hidden">{children}</div>;
}

/* ─── CSS-only fade transition ─── */
function InkTransition({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 600);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className="animate-fade-in"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "#0a0b14",
        pointerEvents: "none",
      }}
    />
  );
}

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [toast, setToast] = useState<string | null>(null);
  const [stage, setStage] = useState<"splash" | "transitioning" | "landing" | "page">("splash");
  const [entered, setEntered] = useState(false);
  setToastHandler(setToast);

  const onSplashDone = useCallback(() => setStage("transitioning"), []);
  const onTransitionDone = useCallback(() => {
    // Skip landing if installed as PWA or running in Capacitor native app
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || Capacitor.isNativePlatform();
    if (isStandalone) {
      setStage("page");
      setTimeout(() => setEntered(true), 60);
    } else {
      setStage("landing");
    }
  }, []);
  const onLandingEnter = useCallback(() => {
    setStage("page");
    setTimeout(() => setEntered(true), 60);
  }, []);

  /* splash + ink transition */
  if (stage === "splash" || stage === "transitioning") {
    return (
      <>
        <div style={{ position: "fixed", inset: 0, zIndex: 10 }}>
          <SplashScreen onDone={onSplashDone} />
        </div>
        {stage === "transitioning" && <InkTransition onDone={onTransitionDone} />}
      </>
    );
  }

  /* landing / download page */
  if (stage === "landing") {
    return (
      <div className="flex justify-center items-center min-h-dvh bg-bg">
        <div className="phone flex flex-col relative">
          <LandingPage onEnter={onLandingEnter} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-dvh bg-bg transition-colors">
      <div
        className="phone flex flex-col relative"
        style={{
          paddingTop: "env(safe-area-inset-top, 20px)",
          opacity: entered ? 1 : 0,
          transform: entered ? "translateY(0)" : "translateY(28px)",
          transition: entered
            ? "opacity 0.7s ease, transform 0.7s ease"
            : "none",
        }}
      >
        {toast && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[999] bg-[#1A1A1A] text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-lg animate-pop-in pointer-events-none">
            {toast}
          </div>
        )}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Keep mounted — only Home for scroll preservation */}
          <Keep show={page === "home"}><Home onNavigate={setPage} /></Keep>

          {/* Unmount when inactive — saves memory */}
          <SlideIn show={page === "word"}><WordDetail /></SlideIn>
          <SlideIn show={page === "vocab"}><VocabularyGrid onNavigate={setPage} /></SlideIn>
          <SlideIn show={page === "wordlist"}><WordList onNavigate={setPage} /></SlideIn>
          <SlideIn show={page === "settings"}><SettingsPage onNavigate={setPage} /></SlideIn>
          <Show show={page === "study"}><StudyPage onNavigate={setPage} /></Show>
          <SlideIn show={page === "profile"}><ProfileEdit onNavigate={setPage} /></SlideIn>
          <Show show={page === "search"}><SearchPage onNavigate={setPage} /></Show>
          <SlideIn show={page === "wordbooks"}><WordBooksPage onNavigate={setPage} /></SlideIn>
          <SlideIn show={page === "practice"}><PracticePage onNavigate={setPage} /></SlideIn>
          <Show show={page === "rest"}><RestPage onNavigate={setPage} /></Show>
          <SlideIn show={page === "favorites"}><FavoritesPage onNavigate={setPage} /></SlideIn>
          <SlideIn show={page === "cardmatch"}><CardMatch onNavigate={setPage} /></SlideIn>
          <SlideIn show={page === "feedback"}><FeedbackPage onNavigate={setPage} /></SlideIn>
          <SlideIn show={page === "calendar"}><StudyCalendar onNavigate={setPage} /></SlideIn>
          <SlideIn show={page === "wordrecord"}><WordRecord onNavigate={setPage} /></SlideIn>
          <SlideIn show={page === "listreview"}><ListReview onNavigate={setPage} /></SlideIn>
          <SlideIn show={page === "learned"}><LearnedWords onNavigate={setPage} /></SlideIn>
        </div>
        <BottomNav active={page} onNavigate={setPage} />
      </div>
    </div>
  );
}
