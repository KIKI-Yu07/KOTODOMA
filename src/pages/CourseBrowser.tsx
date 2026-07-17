import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, Plus, Trash2, MessageSquare, ChevronRight } from "lucide-react";
import type { Page } from "../components/BottomNav";
import StatusBar from "../components/StatusBar";

interface CourseBrowserProps {
  onNavigate: (page: Page) => void;
  darkMode?: boolean;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ConvoMeta {
  id: string;
  title: string;
  updatedAt: string;
  messageCount: number;
}

const WELCOME: Message = {
  role: "assistant",
  content: "こんにちは！日本語先生です〜\n\n我是你的专属日语学习助手。语法、单词、翻译、学习建议……任何日语问题都可以问我哦！一緒に頑張りましょう！",
};

const API = "http://localhost:3001";

export default function CourseBrowser({ onNavigate, darkMode }: CourseBrowserProps) {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [convos, setConvos] = useState<ConvoMeta[]>([]);
  const [convoId, setConvoId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef("");
  const [welcomeAnim, setWelcomeAnim] = useState<string | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      const full = WELCOME.content;
      let i = 0;
      setWelcomeAnim("");
      const timer = setInterval(() => {
        i++;
        setWelcomeAnim(full.slice(0, i));
        if (i >= full.length) {
          clearInterval(timer);
          setWelcomeAnim(null);
          setMessages([{ ...WELCOME, content: full }]);
        }
      }, 35);
      return () => clearInterval(timer);
    }
    loadConvos();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streamingText]);

  const loadConvos = async () => {
    try {
      const res = await fetch(`${API}/api/conversations`);
      if (res.ok) setConvos(await res.json());
    } catch {}
  };

  const newChat = async () => {
    setMessages([WELCOME]);
    setConvoId(null);
    setSidebarOpen(false);
    streamRef.current = "";
    try {
      const res = await fetch(`${API}/api/conversations`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setConvoId(data.id);
        loadConvos();
      }
    } catch {}
  };

  const switchChat = async (id: string) => {
    try {
      const res = await fetch(`${API}/api/conversations/${id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages && data.messages.length > 0 ? data.messages : [WELCOME]);
        setConvoId(id);
        setSidebarOpen(false);
      }
    } catch {}
  };

  const deleteChat = async (id: string) => {
    await fetch(`${API}/api/conversations/${id}`, { method: "DELETE" });
    if (convoId === id) newChat();
    loadConvos();
  };

  const hlColors = [
    { text: "#A78BFA", bg: "#F3EEFF", darkText: "#DDD6FE", darkBg: "#1F1A2E" },
    { text: "#D34947", bg: "#FBEAE9", darkText: "#E8908E", darkBg: "#3D1C1C" },
    { text: "#018B8D", bg: "#D5F5F3", darkText: "#5CC4C0", darkBg: "#1A3D2C" },
    { text: "#EB5C20", bg: "#FDEEE5", darkText: "#F09060", darkBg: "#3D2418" },
    { text: "#7C3AED", bg: "#F3EEFF", darkText: "#DDD6FE", darkBg: "#1F1A2E" },
  ];
  const hlIdx = useRef(0);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setLoading(true);

    if (!convoId) {
      try {
        const res = await fetch(`${API}/api/conversations`, { method: "POST" });
        if (res.ok) {
          const data = await res.json();
          setConvoId(data.id);
          await saveAndStream(data.id, newMessages, text);
          return;
        }
      } catch {}
    }
    await saveAndStream(convoId!, newMessages, text);
  }, [input, loading, messages, convoId]);

  const saveAndStream = async (id: string, msgs: Message[], userText: string) => {
    try {
      const res = await fetch(`${API}/api/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: msgs, conversationId: id }),
      });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let full = "";
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;
          const data = trimmed.slice(6);
          if (data === "[DONE]") continue;
          try {
            const json = JSON.parse(data);
            if (json.delta) { full += json.delta; setStreamingText(full); }
            if (json.done) {
              setMessages([...msgs, { role: "assistant", content: json.full || full }]);
              setStreamingText("");
              streamRef.current = "";
              loadConvos();
            }
            if (json.title) loadConvos();
            if (json.error) {
              setMessages([...msgs, { role: "assistant", content: "エラーが発生しました。もう一度お試しください。" }]);
              setStreamingText("");
            }
          } catch {}
        }
      }
    } catch {
      setMessages([...msgs, { role: "assistant", content: "接続エラーです。ネットワークを確認してください。" }]);
      setStreamingText("");
    }
    setLoading(false);
  };

  const fmtTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000) return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <>
      <StatusBar darkMode={darkMode} />

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div className="absolute inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-[280px] h-full bg-white dark:bg-[#111019] shadow-2xl z-50 flex flex-col animate-slide-in-left">
            <div className="p-4 border-b border-[#F3EEFF] dark:border-[#1F1A2E]">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[15px] text-[#1A1C22] dark:text-[#E0E0E0]">历史对话</h3>
                <button onClick={() => setSidebarOpen(false)} className="w-6 h-6 rounded-full bg-[#F3EEFF] dark:bg-[#1F1A2E] flex items-center justify-center">
                  <ChevronRight size={12} stroke="#4A4A50" />
                </button>
              </div>
              <button onClick={newChat}
                className="w-full py-2.5 rounded-xl bg-[#A78BFA] text-white text-sm font-semibold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform mt-3">
                <Plus size={15} />新しい会話
              </button>
            </div>
            <div className="flex-1 overflow-y-auto scroll-area">
              {convos.length === 0 ? (
                <div className="text-center py-12 text-[#999AA0] text-xs">暂无对话记录</div>
              ) : (
                convos.map((c) => (
                  <div key={c.id}
                    className={`w-full px-4 py-3 text-left flex items-center gap-3 border-b border-[#F3EEFF] dark:border-[#1F1A2E] hover:bg-[#F5F3FF] dark:hover:bg-[#1C1828] transition-colors ${
                      convoId === c.id ? "bg-[#F3EEFF] dark:bg-[#1C1828]" : ""}`}>
                    <button onClick={() => switchChat(c.id)} className="flex-1 min-w-0 text-left">
                      <p className="text-xs font-medium text-[#1A1C22] dark:text-[#E0E0E0] truncate">{c.title}</p>
                      <p className="text-[10px] text-[#999AA0] mt-0.5">{fmtTime(c.updatedAt)} · {c.messageCount}条</p>
                    </button>
                    <button onClick={() => deleteChat(c.id)}
                      className="w-6 h-6 rounded-full flex items-center justify-center active:bg-[#FEE2E2] transition-all">
                      <Trash2 size={12} stroke="#D34947" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2">
        <button onClick={() => setSidebarOpen(true)}
          className="flex items-center gap-2 bg-white dark:bg-[#1C1828] rounded-full pl-2 pr-4 py-1.5 shadow-sm card-hover">
          <div className="w-7 h-7 rounded-full bg-[#F3EEFF] dark:bg-[#1F1A2E] flex items-center justify-center">
            <MessageSquare size={13} stroke="#A78BFA" />
          </div>
          <span className="text-[13px] font-semibold text-[#1A1C22] dark:text-[#E0E0E0]">历史</span>
        </button>
        <div className="flex items-center gap-2">
          <button onClick={newChat}
            className="w-8 h-8 rounded-full bg-[#F3EEFF] dark:bg-[#1F1A2E] flex items-center justify-center active:scale-95 transition-transform">
            <Plus size={14} stroke="#A78BFA" />
          </button>
          <div className="w-8 h-8 rounded-full bg-[#A78BFA] flex items-center justify-center">
            <Bot size={16} stroke="#fff" />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-area px-4 space-y-3 pb-2">
        {messages.map((msg, i) => {
          const displayContent =
            msg === messages[0] && welcomeAnim !== null && msg.role === "assistant"
              ? welcomeAnim : msg.content;
          if (!displayContent) return null;

          const isUser = msg.role === "user";
          const c = hlColors[hlIdx.current % hlColors.length];
          if (!isUser && i > 0) hlIdx.current++;

          return (
            <div key={i} className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : ""} ${isUser ? "msg-user-in" : "msg-ai-in"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                isUser ? "bg-[#A78BFA]" : "bg-[#D34947]"
              }`}>
                {isUser ? <User size={14} stroke="#fff" fill="#fff" /> : <Bot size={14} stroke="#fff" />}
              </div>
              <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 ${
                isUser
                  ? "bg-[#A78BFA] text-white"
                  : "bg-white dark:bg-[#1C1828] text-[#1A1C22] dark:text-[#E0E0E0] shadow-sm"
              }`}>
                <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{displayContent}</p>
              </div>
            </div>
          );
        })}
        {/* Streaming indicator */}
        {streamingText && (
          <div className="flex gap-2.5 msg-ai-in">
            <div className="w-8 h-8 rounded-full bg-[#D34947] flex items-center justify-center shrink-0">
              <Bot size={14} stroke="#fff" />
            </div>
            <div className="max-w-[75%] rounded-2xl px-3.5 py-2.5 bg-white dark:bg-[#1C1828] text-[#1A1C22] dark:text-[#E0E0E0] shadow-sm">
              <p className="text-[14px] leading-relaxed whitespace-pre-wrap">
                {streamingText}<span className="streaming-cursor-bar" />
              </p>
            </div>
          </div>
        )}
        {/* Loading dots */}
        {loading && !streamingText && (
          <div className="flex gap-2.5 msg-ai-in">
            <div className="w-8 h-8 rounded-full bg-[#D34947] flex items-center justify-center shrink-0">
              <Bot size={14} stroke="#fff" />
            </div>
            <div className="bg-white dark:bg-[#1C1828] rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#F3EEFF] animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-[#F3EEFF] animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-[#F3EEFF] animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-white dark:bg-[#1C1828] border-t border-[#F3EEFF] dark:border-[#1F1A2E]">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2.5">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="質問を入力..."
            className="flex-1 bg-[#F5F3FF] dark:bg-[#1F1A2E] rounded-full px-4 py-2.5 text-sm text-[#1A1C22] dark:text-[#E0E0E0] outline-none placeholder-[#C4B5FD]"
          />
          <button type="submit" disabled={loading || !input.trim()}
            className="w-10 h-10 rounded-full bg-[#A78BFA] flex items-center justify-center shrink-0 active:scale-95 transition-transform disabled:opacity-40">
            <Send size={16} stroke="#fff" />
          </button>
        </form>
      </div>
    </>
  );
}
