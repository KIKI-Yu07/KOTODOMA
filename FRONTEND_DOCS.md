# 日本語単語暗記 App — 前端页面文档

> 日期: 2026-07-17 (当前版本)  
> 技术栈: React 19 + TypeScript + Vite 6 + Tailwind CSS 3.4 + lucide-react 0.468  
> 后端: Express.js (localhost:3001) + DeepSeek API (SSE)

---

## 1. 项目结构

```
src/
├── App.tsx                   # 根组件 (路由 + 暗色模式)
├── main.tsx                  # React 入口
├── index.css                 # 全局样式
├── lib/utils.ts              # cn() 工具
├── components/
│   ├── BottomNav.tsx         # 4 Tab 导航
│   ├── StatusBar.tsx         # 状态栏
│   ├── Loader.tsx            # 加载动画
│   └── ui/calendar.tsx       # react-day-picker
├── pages/
│   ├── Home.tsx              # 首页
│   ├── CourseBrowser.tsx     # AI 对话
│   ├── WordDetail.tsx        # 文法練習
│   ├── VocabularyGrid.tsx    # 我的页面
│   ├── WordList.tsx          # 単語リスト
│   └── FlashReview.tsx       # 瞬間レビュー
└── data/
    └── book2.ts              # 第二册单词
```

## 2. 路由

```typescript
type Page = "home" | "course" | "word" | "vocab" | "wordlist" | "flashreview"
```

App.tsx 中 useState<Page> 条件渲染。wordlist/flashreview 无底部导航。

## 3. 配色

### 亮色
| 用途 | 色值 |
|------|------|
| 页面背景 | #F5F3FF |
| 卡片 | #FFFFFF |
| 主色 | #8B5CF6 / #A78BFA |
| 浅底 | #F3EEFF |
| 深紫 | #6D28D9 |
| 文字主 | #1A1C22 |
| 文字辅 | #4A4A50 |
| 提示 | #999AA0 |
| 橙色 | #EB5C20 + #FDEEE5 |
| 青色 | #018B8D + #D5F5F3 |
| 红色 | #D34947 / #C8161D + #FBEAE9 |

### 暗色
| 用途 | 色值 |
|------|------|
| 根背景 | #0E0A1A |
| 卡片 | #1C1828 |
| 次级表 | #1F1A2E |
| Header渐变 | #0B1525→#1A1133→#0E0A1A |
| 文字主 | #E0E0E0 |
| 紫强 | #A78BFA / #DDD6FE |

## 4. 全局 CSS 类

### 卡片
- `.card` — 白底 18px 圆角; 暗色 #1C1828
- `.card-interactive` — active:scale(0.98)
- `.card-lift` — hover translateY(-2px)
- `.card-action` — 彩色入口 + 右上水印

### 装饰
- `.accent-bar` — 左 3px 紫线
- `.progress-gradient` — #8B5CF6→#A78BFA
- `.glow-primary` / `.today-glow` — 紫柔光
- `.pattern-dots` — 点阵纹理
- `.quote-mark` — 72px 引号

### 动画 (统一 cubic-bezier(0.16,1,0.3,1))
- `.page-enter` 0.3s — 右滑入场
- `.word-slide-*` 0.4s — 列表交错
- `.dropdown-menu` 0.4s — clip-path
- `.picker-bar` 0.4s — 汉堡→箭头
- `.msg-user-in` 0.5s / `.msg-ai-in` 0.35s
- `.streaming-cursor-bar` 0.8s blink
- `.word-loader` 0.5s 方块跳跃

### 布局
- `.phone` — 移动端100dvh; ≥640px: 375×812
- `.scroll-area` — 隐藏滚动条
- `.btn-press` — active:scale(0.95)

## 5. 页面详情

### Home.tsx
渐变Header → 今日学習卡片(重叠) → [瞬間][単語帳]入口 → [学習時間][今日単語]统计 → 日历 → 谚语

### CourseBrowser.tsx
[☰历史]侧边栏 + 对话区(AI气泡/用户气泡/流式光标) + 输入框
API: localhost:3001, SSE流式, 打字机欢迎效果

### WordDetail.tsx
[助詞][変形][文型]三个Tab, 助詞有14选多选+子Tab过滤

### WordList.tsx
书本/课程下拉, 单词左滑露出[标记][编辑][熟记], 第一册硬编码+book2.ts

### FlashReview.tsx
闪卡翻转(8词), 答对/答错反馈, 统计面板

### VocabularyGrid.tsx
头像+统计+学習データ/設定/表示三组列表

## 6. 数据
- book2.ts: 6课~500词
- 第一册: WordList.tsx硬编码2课

## 7. 升级注意事项
1. Hex散落JSX: text-[#xxx]/bg-[#xxx]/stroke="#xxx"
2. lucide stroke/fill用hex字符串, 不支持Tailwind class
3. wordlist/flashreview无底部导航, 需单独测暗色
4. CourseBrowser SSE逻辑复杂, 改样式谨慎
5. 项目无git, 改前先commit备份
