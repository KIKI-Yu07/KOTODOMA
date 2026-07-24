import { useState } from "react";
import BottomNav, { type Page } from "./components/BottomNav";
import Home from "./pages/Home";
import WordDetail from "./pages/WordDetail";
import WordList from "./pages/WordList";
import FlashReview from "./pages/FlashReview";
import WordLibrary from "./pages/WordLibrary";
import WordBooksPage from "./pages/WordBooksPage";
import VocabularyGrid from "./pages/VocabularyGrid";
import SettingsPage from "./pages/SettingsPage";
import StudyPage from "./pages/StudyPage";
import ProfileEdit from "./pages/ProfileEdit";
import SearchPage from "./pages/SearchPage";
import MatchGame from "./pages/MatchGame";
import RestPage from "./pages/RestPage";
import PracticePage from "./pages/PracticePage";

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={`flex justify-center items-center sm:min-h-screen sm:bg-bg transition-colors ${darkMode ? "dark" : ""}`}>
      <div className="phone flex flex-col">
        <div key={page} className="page-enter flex flex-col flex-1 overflow-hidden">
          {page === "home" && <Home onNavigate={setPage} darkMode={darkMode} onToggleDark={() => setDarkMode(!darkMode)} />}
          {page === "word" && <WordDetail darkMode={darkMode} />}
          {page === "vocab" && <VocabularyGrid onNavigate={setPage} darkMode={darkMode} />}
          {page === "wordlist" && <WordList onNavigate={setPage} darkMode={darkMode} />}
        {page === "flashreview" && <FlashReview onNavigate={setPage} darkMode={darkMode} />}
        {page === "settings" && <SettingsPage onNavigate={setPage} darkMode={darkMode} />}
        {page === "study" && <StudyPage onNavigate={setPage} darkMode={darkMode} />}
        {page === "profile" && <ProfileEdit onNavigate={setPage} darkMode={darkMode} />}
        {page === "course" && <WordLibrary />}
        {page === "search" && <SearchPage onNavigate={setPage} darkMode={darkMode} />}
        {page === "wordbooks" && <WordBooksPage onNavigate={setPage} />}
        {page === "practice" && <PracticePage onNavigate={setPage} darkMode={darkMode} />}
        {page === "rest" && <RestPage onNavigate={setPage} />}
        </div>
        <BottomNav active={page} onNavigate={setPage} darkMode={darkMode} />
      </div>
    </div>
  );
}
