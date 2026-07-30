import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import type { Page } from "../components/BottomNav";
import { showToast } from "../lib/toast";

// ── EmailJS credentials ──
const EMAILJS_PUBLIC_KEY = "fc5V167_S3rZPu-CU";
const EMAILJS_SERVICE_ID = "service_gv82iq8";
const EMAILJS_TEMPLATE_ID = "template_wg934hv";

interface Props { onNavigate: (p: Page) => void; }

export default function FeedbackPage({ onNavigate }: Props) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const userId = localStorage.getItem("userId") || "";

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);

    let remoteFailed = false;
    try {
      const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: EMAILJS_SERVICE_ID,
          template_id: EMAILJS_TEMPLATE_ID,
          user_id: EMAILJS_PUBLIC_KEY,
          template_params: {
            message: text.trim(),
            userId: userId,
            date: new Date().toLocaleString("zh-CN"),
          },
        }),
      });
      if (!res.ok) remoteFailed = true;
    } catch { remoteFailed = true; }

    try {
      const fb = JSON.parse(localStorage.getItem("feedbacks") || "[]");
      fb.push({ text: text.trim(), date: new Date().toISOString(), userId });
      localStorage.setItem("feedbacks", JSON.stringify(fb));
    } catch {}

    setSending(false);
    setText("");
    showToast(remoteFailed ? "邮件发送失败，已保存到本地" : "感谢反馈，已发送到邮箱");
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto scroll-area bg-bg">
      <div className="flex items-center justify-between px-4 py-2">
        <button onClick={() => onNavigate("vocab")}
          className="flex items-center gap-1 text-hint text-sm font-bold active:opacity-60">
          <ArrowLeft size={16} strokeWidth={2} />
        </button>
        <span className="text-2xl font-semibold tracking-tight text-main">意见反馈</span>
      </div>

      <div className="px-5 pt-6">
        <p className="text-sm text-sub mb-4">希望你能提供天马行空的想法或建议，你我一起参与开发</p>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          disabled={sending}
          className="w-full h-[160px] p-4 text-sm text-main outline-none resize-none bg-white rounded-xl border border-border focus:border-[#1A1A1A] transition-colors disabled:opacity-50"
          placeholder="例如: 希望增加xxx功能 / 某个地方不太好用..."
        />
        <button onClick={handleSend}
          disabled={!text.trim() || sending}
          className={`w-full mt-4 py-3.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            text.trim() && !sending ? "bg-[#1A1A1A] text-white active:scale-[0.98]" : "bg-[#D4D4D4] text-white cursor-not-allowed"
          }`}>
          {sending && (
            <svg className="animate-spin size-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="32" strokeLinecap="round" opacity="0.3"/>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="8" strokeLinecap="round"/>
            </svg>
          )}
          {sending ? "发送中..." : "提交"}
        </button>
      </div>
    </div>
  );
}
