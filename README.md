<p align="center">
  <img src="public/icons/app-icon.png" alt="言霊 Kotodama" width="120" />
</p>

<h1 align="center">言霊 Kotodama</h1>

<p align="center">
  <strong>日本語を学ぶ、一語ずつ</strong><br />
  一个简约、专注的日语单词记忆应用
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite" alt="Vite 6" />
  <img src="https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Capacitor-6-119EFF?logo=capacitor" alt="Capacitor 6" />
</p>

---

## ✨ 功能特性

| 模块 | 说明 |
|------|------|
| 📚 **单词本** | 多册教材、按课分类，左滑标记熟记/编辑 |
| 🤖 **AI 对话** | DeepSeek 驱动的日语会话练习，SSE 流式响应 |
| ⚡ **闪卡复习** | 翻转卡片 + 对/错判定 + 统计面板 |
| 📖 **文法练习** | 助詞選択、動詞変形、文型パターン |
| 🎮 **卡片配对** | 单词匹配小游戏，边玩边记 |
| 📊 **学习日历** | 每日学习记录、进度可视化 |
| ❤️ **收藏夹** | 重点单词收藏回顾 |
| 🔍 **单词搜索** | 全局搜索已学单词 |
| ☕ **休息提醒** | 定时休息，保护视力 |
| 🌙 **暗色模式** | 支持亮色/暗色主题切换 |
| 📱 **PWA + Android** | 支持安装到桌面，Capacitor 原生打包 |

## 🛠 技术栈

| 层 | 技术 |
|----|------|
| 前端框架 | React 19 + TypeScript |
| 构建工具 | Vite 6 |
| 样式 | Tailwind CSS 3.4 |
| 图标 | lucide-react |
| 日历 | react-day-picker |
| 移动端 | Capacitor 6 (Android) |
| 后端 | Express.js |
| AI | DeepSeek API (SSE 流式) |

## 📁 项目结构

```
src/
├── App.tsx                  # 根组件（页面路由 + 返回栈 + 启动屏）
├── main.tsx                 # React 入口
├── index.css                # 全局样式 / CSS 变量 / 动画
├── lib/
│   └── utils.ts             # cn() 工具函数
├── components/
│   ├── BottomNav.tsx        # 底部 4 Tab 导航
│   ├── StatusBar.tsx        # 状态栏
│   ├── SplashScreen.tsx     # 启动屏
│   ├── Loader.tsx           # 加载动画
│   └── ui/calendar.tsx      # 日历组件封装
├── pages/
│   ├── Home.tsx             # 首页（今日统计 + 快捷入口）
│   ├── LandingPage.tsx      # 引导页
│   ├── StudyPage.tsx        # AI 对话学习
│   ├── WordDetail.tsx       # 文法练习（助詞/変形/文型）
│   ├── WordList.tsx         # 单词列表
│   ├── VocabularyGrid.tsx   # 我的页面
│   ├── WordBooksPage.tsx    # 单词本管理
│   ├── FlashReview.tsx      # 闪卡复习（已内置到 StudyPage）
│   ├── CardMatch.tsx        # 卡片配对游戏
│   ├── PracticePage.tsx     # 练习页
│   ├── SearchPage.tsx       # 单词搜索
│   ├── FavoritesPage.tsx    # 收藏夹
│   ├── LearnedWords.tsx     # 已学单词
│   ├── ListReview.tsx       # 列表复习
│   ├── StudyCalendar.tsx    # 学习日历
│   ├── WordRecord.tsx       # 单词记录
│   ├── SettingsPage.tsx     # 设置
│   ├── ProfileEdit.tsx      # 个人资料编辑
│   ├── RestPage.tsx         # 休息提醒
│   └── FeedbackPage.tsx     # 意见反馈
├── data/
│   └── book2.ts             # 第二册单词数据（6课 ~500词）
└── server/
    ├── api.js               # Express API（用户数据持久化）
    └── package.json
```

## 🚀 快速开始

### 前置要求

- Node.js ≥ 18
- npm

### 安装运行

```bash
# 1. 安装前端依赖
npm install

# 2. 安装后端依赖
cd server && npm install && cd ..

# 3. 启动后端（端口 3002）
cd server && node api.js &

# 4. 启动前端开发服务器
npm run dev
```

浏览器打开 `http://localhost:5173/KOTODOMA/`

### 构建生产版本

```bash
npm run build     # 输出到 dist/
npx cap sync      # 同步 Capacitor 原生项目
npx cap open android  # 打开 Android Studio
```

## 🎨 配色

| 用途 | 色值 |
|------|------|
| 页面背景 | `#F5F3FF` |
| 卡片 | `#FFFFFF` |
| 主色 | `#8B5CF6` / `#A78BFA` |
| 深紫 | `#6D28D9` |
| 文字主 | `#1A1A1A` |
| 文字辅 | `#666666` |
| 成功 | `#4CAF50` |
| 警告 | `#F97316` |
| 危险 | `#EF4444` |

## 📄 许可证

MIT License

---

<p align="center">
  <sub>言葉には力がある — 言霊</sub>
</p>
