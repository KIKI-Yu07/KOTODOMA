import { useState, useEffect } from "react";
import { Download, Smartphone, Monitor, ChevronRight, ExternalLink } from "lucide-react";

interface Props {
  onEnter: () => void;
}

const APP_NAME = "言霊";
const APP_SUBTITLE = "ことだま — 日语单词背诵学习";
const APP_DESC = "基于间隔重复算法的日语学习应用，支持课本词汇、自定义单词本、语法闯关等多种学习模式";
const FEATURES = [
  { title: "间隔记忆", desc: "SM-2 算法智能安排复习" },
  { title: "语法闯关", desc: "由易到难，阶段式学习" },
  { title: "游戏模式", desc: "假名选词 · 假名补完 · 单词找茬" },
  { title: "离线可用", desc: "安装后可离线使用" },
];

export default function LandingPage({ onEnter }: Props) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installStatus, setInstallStatus] = useState<"idle" | "installing" | "done">("idle");
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Auto-enter if already installed as PWA
  useEffect(() => {
    if (isStandalone) {
      onEnter();
    }
  }, [isStandalone, onEnter]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      setInstallStatus("installing");
      try {
        await deferredPrompt.prompt();
        const result = await deferredPrompt.userChoice;
        if (result.outcome === "accepted") {
          setInstallStatus("done");
          setTimeout(() => onEnter(), 600);
        } else {
          setInstallStatus("idle");
        }
      } catch {
        setInstallStatus("idle");
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // Fallback: just enter the app
      onEnter();
    }
  };

  if (isStandalone) return null;

  return (
    <div className="flex-1 min-h-0 overflow-y-auto scroll-area bg-bg">
      {/* ── Hero ── */}
      <header className="bg-primary text-white flex flex-col items-center rounded-b-[2.5rem] px-6 pt-12 pb-12 relative pattern-hero">
        <span
          className="text-white select-none pointer-events-none mb-4"
          style={{ fontFamily: "Sacramento, cursive", fontSize: 48 }}
        >
          kotodama
        </span>
        <h1 className="font-serif text-3xl tracking-[0.08em]">{APP_NAME}</h1>
        <p className="mt-2 text-white/50 text-xs tracking-[0.2em]">{APP_SUBTITLE}</p>
        <p className="mt-6 text-white/60 text-sm leading-relaxed text-center max-w-[280px]">
          {APP_DESC}
        </p>
      </header>

      {/* ── Features ── */}
      <section className="px-6 pt-8">
        <p className="text-main text-xs font-semibold tracking-[0.2em]">学習機能</p>
        <ul className="mt-4 grid grid-cols-2 gap-3">
          {FEATURES.map((f) => (
            <li key={f.title} className="card px-4 py-3.5">
              <p className="font-serif text-sm font-semibold text-main">{f.title}</p>
              <p className="mt-1 text-[11px] text-hint leading-relaxed">{f.desc}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Install Button ── */}
      <section className="px-6 mt-8 pb-8">
        {!isStandalone && (
          <div className="flex flex-col gap-3">
            {/* Primary install button */}
            <button
              onClick={handleInstall}
              disabled={installStatus === "done"}
              className="w-full bg-primary text-white rounded-2xl py-4 font-bold text-base tracking-wide
                active:scale-[0.98] transition-all flex items-center justify-center gap-2.5
                disabled:opacity-50 disabled:pointer-events-none"
            >
              {installStatus === "done" ? (
                "安装完成 ✓"
              ) : (
                <>
                  <Download size={20} strokeWidth={2} />
                  {deferredPrompt ? "安装应用" : isIOS ? "添加到主屏幕" : "安装应用"}
                </>
              )}
            </button>

            {/* Enter web version */}
            <button
              onClick={onEnter}
              className="w-full bg-surface border border-border rounded-2xl py-3.5 text-main font-medium text-sm
                active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Monitor size={18} strokeWidth={1.5} />
              进入网页版
              <ChevronRight size={16} strokeWidth={1.5} className="text-hint" />
            </button>
          </div>
        )}

        {/* Platform hints */}
        <div className="mt-6 flex items-center justify-center gap-6 text-[10px] text-hint/50">
          <span className="flex items-center gap-0.5">
            <Smartphone size={12} /> iPhone / Android
          </span>
          <span>离线使用 · 自动更新</span>
        </div>
      </section>

      {/* ── iOS Guide Modal ── */}
      {showIOSGuide && (
        <div
          className="absolute inset-0 z-50 flex items-end justify-center bg-black/40"
          onClick={() => setShowIOSGuide(false)}
        >
          <div
            className="bg-white rounded-t-[2rem] w-full max-w-[430px] px-6 pt-8 pb-10"
            style={{ paddingBottom: "calc(2.5rem + env(safe-area-inset-bottom, 0px))" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-border mx-auto mb-6" />
            <h3 className="font-serif text-lg font-bold text-main text-center">iOS 安装指南</h3>
            <ol className="mt-6 space-y-4">
              {[
                { step: "1", text: "在 Safari 浏览器中打开本页面" },
                { step: "2", text: "点击底部工具栏的", icon: true },
                { step: "3", text: "滑动找到并点击“添加到主屏幕”" },
                { step: "4", text: "点击右上角“添加”，完成安装" },
              ].map((s) => (
                <li key={s.step} className="flex items-start gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
                    {s.step}
                  </span>
                  <span className="text-sm text-main leading-relaxed pt-0.5">
                    {s.text}
                    {s.icon && (
                      <span className="inline-flex items-center mx-1 px-1.5 py-0.5 rounded bg-surface-gray border border-border">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
                        </svg>
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ol>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full mt-8 bg-primary text-white rounded-2xl py-3.5 font-bold text-sm tracking-wide active:scale-[0.98] transition-all"
            >
              知道了
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
