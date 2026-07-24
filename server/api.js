import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3002;
const DATA_DIR = path.join(__dirname, "data");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

app.use(cors());
app.use(express.json({ limit: "10mb" }));

function readJSON(file, fallback = {}) {
  const p = path.join(DATA_DIR, file);
  try { return JSON.parse(fs.readFileSync(p, "utf-8")); } catch { return fallback; }
}
function writeJSON(file, data) {
  fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2), "utf-8");
}

// ═══ Word Books ═══
app.get("/api/wordbooks", (req, res) => res.json(readJSON("wordbooks.json", [])));
app.put("/api/wordbooks", (req, res) => { writeJSON("wordbooks.json", req.body); res.json({ ok: true }); });

// ═══ User Profile ═══
app.get("/api/profile", (req, res) => res.json(readJSON("profile.json", { nickname: "小明", gender: "保密", avatar: "" })));
app.put("/api/profile", (req, res) => { writeJSON("profile.json", req.body); res.json({ ok: true }); });

// ═══ Learning Progress ═══
app.get("/api/progress", (req, res) => res.json(readJSON("progress.json", {})));
app.put("/api/progress", (req, res) => { writeJSON("progress.json", req.body); res.json({ ok: true }); });

// ═══ Settings ═══
app.get("/api/settings", (req, res) => res.json(readJSON("settings.json", { dailyGoal: 15, selectedBook: "all" })));
app.put("/api/settings", (req, res) => { writeJSON("settings.json", req.body); res.json({ ok: true }); });

// ═══ Study Stats ═══
app.get("/api/stats", (req, res) => res.json(readJSON("stats.json", { studyDays: 0, lastStudyDate: "" })));
app.put("/api/stats", (req, res) => { writeJSON("stats.json", req.body); res.json({ ok: true }); });

app.listen(PORT, () => console.log(`API server running on http://localhost:${PORT}`));
