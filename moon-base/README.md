# Blockchain Fan Economy (官方基地) 🎟️

[![Deploy with Vercel](https://vercel.com/button)](https://blockchain-fan-economy.vercel.app)
[![Vue](https://img.shields.io/badge/Vue.js-35495E?style=flat&logo=vue.js&logoColor=4FC08D)](https://vuejs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)

本專案是一個結合現代化網頁技術與粉絲經濟概念的「售票與轉讓系統」。透過本系統，使用者可以進行票券管理、指定親友轉讓（候補碼機制）、以及查看專屬的 PTS 點數與典藏數位內容。

🔗 **線上預覽 (Live Demo):** [https://blockchain-fan-economy.vercel.app](https://blockchain-fan-economy.vercel.app)

---

## 🌟 核心功能 (Features)

- **數位票券管理:** 視覺化的票券夾，使用者可輕鬆查看目前持有的票券、詳細資訊（包含座位、時間、票務規則等）。
- **指定親友轉讓機制:** 為了防堵黃牛，系統設計了「候補碼」機制。使用者可針對特定票券生成專屬候補碼，親友輸入後即可完成點數扣款與票券轉移。
- **PTS 點數經濟:** 內建 PTS 點數錢包，支援模擬扣款、退票還款等資產流動，並具備即時的交易防呆機制（餘額不足無法轉讓）。
- **典藏基地館:** 專屬的粉絲福利區，如「會發光的安靜的花絮入口」，提供持有特定票券的粉絲獨家的數位內容體驗。
- **安全與權限控管:** 整合 Supabase Auth 與 RLS (Row Level Security)，確保跨帳戶交易的安全性，每位使用者僅能操作自身的資產。

---

## 🛠️ 技術架構 (Tech Stack)

### 前端展示層 (Frontend)
- **框架:** Vue 3 (Composition API)
- **建構工具:** Vite
- **樣式與 UI:** Tailwind CSS
- **路由:** Vue Router

### 後端與資料儲存層 (Backend & DB)
- **BaaS 平台:** Supabase
- **資料庫:** PostgreSQL 關聯式資料庫
- **身份驗證:** Supabase Authentication

### 基礎設施與部署 (Infrastructure)
- **託管平台:** Vercel (支援 CI/CD 自動化部署)
- **版本控制:** Git / GitHub

---

## 📂 專案結構 (Directory Structure)

```text
Blockchain-fan-economy/
├── moon-base/                 # Vue 專案主要資料夾 (Root Directory)
│   ├── public/                # 靜態資源 (如: glow.jpg 等圖片)
│   ├── src/                   # 原始碼目錄
│   │   ├── assets/            # CSS 與共用資源
│   │   ├── components/        # Vue UI 元件 (如: MyTicketsTab, TicketDetailModal)
│   │   ├── router/            # 前端路由設定
│   │   ├── views/             # 頁面級別元件
│   │   ├── App.vue            # 應用程式進入點
│   │   └── main.js            # 專案初始化與套件引入
│   ├── index.html             # 網頁入口檔
│   ├── package.json           # npm 依賴套件與指令設定
│   ├── tailwind.config.js     # Tailwind CSS 相關設定
│   └── vite.config.js         # Vite 打包相關設定
└── README.md                  # 專案說明文件
```

## 🚀 本地端開發指南 (Local Setup)
如果你想要在自己的電腦上運行這個專案，請按照以下步驟操作：

1. 複製專案 (Clone the repository)
```text
git clone [https://github.com/zhuang147/Blockchain-fan-economy.git](https://github.com/zhuang147/Blockchain-fan-economy.git)
cd Blockchain-fan-economy/moon-base
```
2. 安裝依賴套件 (Install dependencies)
```text
npm install
```
4. 設定環境變數 (Set up environment variables)
在 moon-base 資料夾根目錄下建立一個 .env 檔案，並填入你的 Supabase 金鑰：

```text
VITE_SUPABASE_URL=你的_SUPABASE_專案網址
VITE_SUPABASE_ANON_KEY=你的_SUPABASE_ANON_KEY
```
4. 啟動開發伺服器 (Run the development server)
```text
npm run dev
```
啟動後，開啟瀏覽器並前往終端機顯示的本地網址（通常為 http://localhost:5173/）即可預覽。

---

## ☁️ 部署指南 (Deployment)
本專案已經設定好可直接部署至 Vercel：
1. 在 Vercel 新增專案並綁定此 GitHub Repository。

2. 將 Root Directory 設定為 moon-base。

3. 在 Environment Variables 中填入上述的 VITE_SUPABASE_URL 與 VITE_SUPABASE_ANON_KEY。

4. 點擊 Deploy，等待 CI/CD 完成自動部署。
