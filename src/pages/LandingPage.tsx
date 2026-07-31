import { useState, useEffect, useMemo } from "react";
import { Download, Monitor, ChevronRight, Copy, Check, Chrome, Compass, Smartphone } from "lucide-react";

const APK_DOWNLOAD_URL = "https://github.com/KIKI-Yu07/KOTODOMA/releases/latest";

interface Props {
  onEnter: () => void;
}

const APP_NAME = "言霊";
const APP_URL = "kiki-yu07.github.io/KOTODOMA";

const FEATURES = [
  { title: "间隔记忆", desc: "SM-2 算法智能安排复习" },
  { title: "语法闯关", desc: "由易到难，阶段式学习" },
  { title: "游戏模式", desc: "假名选词 · 假名补完 · 单词找茬" },
  { title: "离线可用", desc: "安装后可离线使用" },
];

type BrowserKind = "chrome" | "samsung" | "edge" | "firefox" | "qq" | "uc" | "baidu" | "wechat" | "other";

function detectBrowser(): BrowserKind {
  const ua = navigator.userAgent.toLowerCase();
  if (/micromessenger/.test(ua)) return "wechat";
  if (/qqbrowser|mqqbrowser/.test(ua)) return "qq";
  if (/ucbrowser|ucweb/.test(ua)) return "uc";
  if (/baiduboxapp|baidubrowser/.test(ua)) return "baidu";
  if (/samsungbrowser/.test(ua)) return "samsung";
  if (/edg/.test(ua)) return "edge";
  if (/firefox/.test(ua)) return "firefox";
  if (/chrome/.test(ua)) return "chrome";
  return "other";
}

const BROWSER_LABELS: Record<BrowserKind, string> = {
  chrome: "Chrome",
  samsung: "三星浏览器",
  edge: "Edge",
  firefox: "Firefox",
  qq: "QQ 浏览器",
  uc: "UC 浏览器",
  baidu: "百度浏览器",
  wechat: "微信",
  other: "浏览器",
};

const PWA_BROWSERS: BrowserKind[] = ["chrome", "samsung", "edge"];

export default function LandingPage({ onEnter }: Props) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installStatus, setInstallStatus] = useState<"idle" | "installing" | "done">("idle");
  const [showGuide, setShowGuide] = useState(false);
  const [copied, setCopied] = useState(false);
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
  const browser = useMemo(detectBrowser, []);
  const supportsPWA = PWA_BROWSERS.includes(browser);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    if (isStandalone) onEnter();
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
    } else {
      setShowGuide(true);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`https://${APP_URL}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isStandalone) return null;

  // ── Install instruction per platform ──
  const installSteps = isIOS
    ? [
        "在 Safari 中打开本页面",
        "点击底部 分享按钮",
        "滑动找到「添加到主屏幕」",
        "点击右上角「添加」完成",
      ]
    : supportsPWA
    ? [
        `在 ${BROWSER_LABELS[browser]} 中打开本页面`,
        "点击右上角菜单 ⋮",
        `选择「添加到主屏幕」或「安装应用」`,
        "点击安装，桌面出现图标即完成",
      ]
    : [
        "点击下方按钮复制链接",
        "打开 Chrome 浏览器",
        "粘贴链接并打开",
        "按右上角菜单 →「安装应用」",
      ];

  const showCopyHint = isAndroid && !supportsPWA && browser !== "wechat";

  return (
    <div className="flex-1 min-h-0 overflow-y-auto scroll-area bg-bg">
      {/* ── Hero ── */}
      <header className="bg-primary text-white flex flex-col items-center rounded-b-[2.5rem] px-6 pt-12 pb-10 relative pattern-hero">
        <img
          src={`${import.meta.env.BASE_URL}icons/app-icon.png`}
          alt="言霊"
          className="w-20 h-20 rounded-2xl shadow-lg mb-5 object-cover"
        />
        <h1 className="font-serif text-3xl tracking-[0.08em]">{APP_NAME}</h1>
        <p className="mt-2 text-white/50 text-xs tracking-[0.2em]">ことだま — 日语单词背诵学习</p>
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

      {/* ── Browser hint (unsupported browsers) ── */}
      {isAndroid && !supportsPWA && (
        <section className="px-6 mt-6">
          <div className="bg-warning-subtle border border-warning/20 rounded-2xl px-4 py-3.5 flex items-start gap-3">
            <Compass size={18} className="text-warning shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-warning">
                {browser === "wechat"
                  ? "微信内无法安装，请用浏览器打开"
                  : `${BROWSER_LABELS[browser]} 不支持安装应用`}
              </p>
              <p className="mt-1 text-xs text-warning/70 leading-relaxed">
                {browser === "wechat"
                  ? "点击右上角 ··· →「在浏览器中打开」→ 推荐用 Chrome"
                  : "请用 Chrome 浏览器打开本页面，即可安装到桌面"}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── Buttons ── */}
      <section className="px-6 mt-6 pb-8">
        <div className="flex flex-col gap-3">
          {/* Android APK download — primary */}
          {isAndroid && (
            <a
              href={APK_DOWNLOAD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-primary text-white rounded-2xl py-4 font-bold text-base tracking-wide
                active:scale-[0.98] transition-all flex items-center justify-center gap-2.5"
            >
              <Download size={20} strokeWidth={2} />
              下载 APK 安装包
            </a>
          )}

          {/* iOS guide / PWA install */}
          {isIOS ? (
            <button
              onClick={() => setShowGuide(true)}
              className="w-full bg-surface border border-border rounded-2xl py-3.5 text-main font-medium text-sm
                active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Smartphone size={18} strokeWidth={1.5} />
              添加到主屏幕（Safari）
              <ChevronRight size={16} strokeWidth={1.5} className="text-hint" />
            </button>
          ) : supportsPWA && !isAndroid ? (
            <button
              onClick={handleInstall}
              disabled={installStatus === "done"}
              className="w-full bg-surface border border-border rounded-2xl py-3.5 text-main font-medium text-sm
                active:scale-[0.98] transition-all flex items-center justify-center gap-2
                disabled:opacity-50 disabled:pointer-events-none"
            >
              {installStatus === "done" ? (
                "安装完成 ✓"
              ) : (
                <>
                  <Download size={18} strokeWidth={1.5} />
                  安装到桌面
                </>
              )}
            </button>
          ) : null}

          {/* Enter web version */}
          <button
            onClick={onEnter}
            className="w-full bg-surface border border-border rounded-2xl py-3.5 text-main font-medium text-sm
              active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Monitor size={18} strokeWidth={1.5} />
            直接使用网页版
            <ChevronRight size={16} strokeWidth={1.5} className="text-hint" />
          </button>
        </div>

        {/* Platform info */}
        <p className="mt-5 text-center text-[10px] text-hint/50">
          {isAndroid
            ? "下载 APK 安装后即可离线使用 · 网页版无需安装也可使用"
            : isIOS
            ? "iOS 需要通过 Safari 添加到主屏幕"
            : "网页版所有功能均可正常使用"}
        </p>
      </section>

      {/* ── Install Guide Bottom Sheet ── */}
      {showGuide && (
        <div
          className="absolute inset-0 z-50 flex items-end justify-center bg-black/40"
          onClick={() => setShowGuide(false)}
        >
          <div
            className="bg-white rounded-t-[2rem] w-full max-w-[430px] px-6 pt-8 pb-10"
            style={{ paddingBottom: "calc(2.5rem + env(safe-area-inset-bottom, 0px))" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-border mx-auto mb-6" />
            <h3 className="font-serif text-lg font-bold text-main text-center">
              {isIOS ? "iOS 安装指南" : supportsPWA ? "安装到桌面" : "用 Chrome 安装"}
            </h3>
            <ol className="mt-6 space-y-4">
              {installSteps.map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="text-sm text-main leading-relaxed pt-0.5">{text}</span>
                </li>
              ))}
            </ol>

            {showCopyHint && (
              <div className="mt-5 flex items-center gap-2 bg-surface-gray rounded-xl px-4 py-3">
                <Chrome size={18} className="text-primary shrink-0" />
                <span className="text-xs text-main font-mono break-all select-all">{`https://${APP_URL}`}</span>
                <button
                  onClick={handleCopy}
                  className="ml-auto shrink-0 text-xs font-bold text-primary active:text-primary/70"
                >
                  {copied ? "已复制 ✓" : "复制"}
                </button>
              </div>
            )}

            <button
              onClick={() => setShowGuide(false)}
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
