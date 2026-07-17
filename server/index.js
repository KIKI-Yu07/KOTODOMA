import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const DATA_DIR = path.join(__dirname, "conversations");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

app.use(cors());
app.use(express.json());

const SYSTEM_PROMPT = `你是「日本語先生」,一位专业、耐心、友好的日语教师。
你的职责是帮助用户解决日语学习中的各种问题,包括但不限于：
- 语法解释（用中文讲解,给出日语例句和翻译）
- 单词释义和用法辨析
- 日语句子翻译（中日互译）
- 日语学习方法和建议
- 日本文化相关问题

交流规则：
1. 用中文回答,但涉及日语内容时必须标注**日语假名读音**（平假名/片假名）和中文翻译，**禁止使用拼音或罗马字注音**
2. 语法解释要举例句,例句格式: 「日本語の例文」(读音) → 中文翻译
3. 回答简洁,每次控制在 200 字以内
4. 语气亲切,适当使用"〜です"、"〜ましょう"等日语表达
5. 回答中的关键语法点、重要单词、重点结论用 **语法点** 或 **单词** 标记,在最后的反问用户问题是不要标注`;

// ── Conversation helpers ──

function convoPath(id) {
  return path.join(DATA_DIR, `${id}.json`);
}

function readConvo(id) {
  const p = convoPath(id);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

function writeConvo(id, data) {
  fs.writeFileSync(convoPath(id), JSON.stringify(data, null, 2), "utf-8");
}

// ── Routes ──

// List all conversations
app.get("/api/conversations", (req, res) => {
  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"));
  const list = files
    .map((f) => {
      const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), "utf-8"));
      return {
        id: data.id,
        title: data.title || "新しい会話",
        updatedAt: data.updatedAt,
        messageCount: data.messages ? data.messages.filter(m => m.id !== 0).length : 0,
      };
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  res.json(list);
});

// Get one conversation
app.get("/api/conversations/:id", (req, res) => {
  const convo = readConvo(req.params.id);
  if (!convo) return res.status(404).json({ error: "Not found" });
  res.json(convo);
});

// Create new conversation
app.post("/api/conversations", (req, res) => {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const convo = {
    id,
    title: "新しい会話",
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  writeConvo(id, convo);
  res.json(convo);
});

// Save/update conversation
app.put("/api/conversations/:id", (req, res) => {
  const { messages, title } = req.body;
  const convo = readConvo(req.params.id);
  if (!convo) return res.status(404).json({ error: "Not found" });

  if (messages) convo.messages = messages;
  if (title) convo.title = title;
  convo.updatedAt = new Date().toISOString();

  // Auto-generate title from first user message
  if (!convo.title || convo.title === "新しい会話") {
    const firstUser = messages?.find((m) => m.role === "user");
    if (firstUser) {
      convo.title = firstUser.content.slice(0, 30) + (firstUser.content.length > 30 ? "..." : "");
    }
  }

  writeConvo(req.params.id, convo);
  res.json(convo);
});

// Delete conversation
app.delete("/api/conversations/:id", (req, res) => {
  const p = convoPath(req.params.id);
  if (fs.existsSync(p)) fs.unlinkSync(p);
  res.json({ ok: true });
});

// ── SSE Streaming Chat ──

app.post("/api/chat/stream", async (req, res) => {
  const { messages, conversationId } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "messages array required" });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }

  // Save user message + placeholder AI message to disk immediately
  if (conversationId) {
    const convo = readConvo(conversationId);
    if (convo) {
      convo.messages = messages;
      convo.updatedAt = new Date().toISOString();
      writeConvo(conversationId, convo);
    }
  }

  // SSE headers
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });

  try {
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 800,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      res.write(`data: ${JSON.stringify({ error: "AI service error" })}\n\n`);
      res.end();
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = "";
    let buffer = "";

    while (true) {
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
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) {
            fullContent += delta;
            res.write(`data: ${JSON.stringify({ delta })}\n\n`);
          }
        } catch {
          // skip unparseable chunks
        }
      }
    }

    // Final chunk with full content for saving
    res.write(`data: ${JSON.stringify({ done: true, full: fullContent })}\n\n`);

    // Save to disk after streaming completes
    if (conversationId && fullContent) {
      const convo = readConvo(conversationId);
      if (convo) {
        convo.messages = [
          ...messages,
          { role: "assistant", content: fullContent },
        ];
        convo.updatedAt = new Date().toISOString();
        // Auto title
        const firstUser = messages.find((m) => m.role === "user");
        if (firstUser && (!convo.title || convo.title === "新しい会話")) {
          convo.title = firstUser.content.slice(0, 30) + (firstUser.content.length > 30 ? "..." : "");
        }
        writeConvo(conversationId, convo);
        // Also send the updated title
        res.write(`data: ${JSON.stringify({ title: convo.title })}\n\n`);
      }
    }

    res.end();
  } catch (error) {
    console.error("Stream error:", error);
    res.write(`data: ${JSON.stringify({ error: "Stream error" })}\n\n`);
    res.end();
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
