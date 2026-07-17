import { useState } from "react";
import BottomNav, { type Page } from "./components/BottomNav";
import Home from "./pages/Home";
import WordDetail from "./pages/WordDetail";
import WordList from "./pages/WordList";
import FlashReview from "./pages/FlashReview";
import CourseBrowser from "./pages/CourseBrowser";
import VocabularyGrid from "./pages/VocabularyGrid";

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [darkMode, setDarkMode] = useState(false);

  // Keep chat page alive across page switches so conversation isn't lost
  const chatPage = (
    <div className={page === "course" ? "flex flex-col flex-1 overflow-hidden" : "hidden"}>
      <CourseBrowser onNavigate={setPage} darkMode={darkMode} />
    </div>
  );

  return (
    <div className={`flex justify-center items-center sm:min-h-screen sm:bg-[#F5F3FF] transition-colors ${darkMode ? "dark sm:bg-[#0E0A1A]" : ""}`}>
      <div className="phone flex flex-col">
        <div key={page === "course" ? undefined : page} className={page === "course" ? "" : "page-enter flex flex-col flex-1 overflow-hidden"}>
          {page === "home" && <Home onNavigate={setPage} darkMode={darkMode} onToggleDark={() => setDarkMode(!darkMode)} />}
          {page === "word" && <WordDetail onNavigate={setPage} darkMode={darkMode} />}
          {page === "vocab" && <VocabularyGrid onNavigate={setPage} darkMode={darkMode} />}
          {page === "wordlist" && <WordList onNavigate={setPage} darkMode={darkMode} />}
        {page === "flashreview" && <FlashReview onNavigate={setPage} darkMode={darkMode} />}
        </div>
        {chatPage}
        <BottomNav active={page} onNavigate={setPage} darkMode={darkMode} />
      </div>
    </div>
  );
}
