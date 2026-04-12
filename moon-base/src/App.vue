<template>
  <div class="min-h-screen bg-[#f5f5f4]">
    
    <div v-if="state.isLoggedIn" class="marquee-container w-full border-b border-[#B59A7D]/30 shadow-lg bg-white z-50 relative">
      <div class="animate-marquee font-black italic text-[11px] uppercase tracking-[0.2em] py-2">
        ✦ 基地廣播：[{{ currentTime }}] 歡迎來到《月亮忘了關燈》成員數據中心 ✦ 當前同步區塊: #{{ state.currentBlock }} ✦ 
        新成員註冊通道已開啟 ✦ [任務更新]：觀看預告片任務獎勵已提升至 50 PTS ✦ 
      </div>
    </div>

    <div v-if="!state.isLoggedIn" class="min-h-screen flex items-center justify-center p-6 bg-stone-100">
      <LoginBox />
    </div>

    <div v-else class="flex min-h-screen overflow-hidden">
      
      <aside class="w-72 glass border-r border-stone-200 flex-col hidden md:flex sticky top-0 h-screen">
        <div class="p-8">
          <div class="flex items-center gap-3 mb-10 font-black italic text-lg tracking-tighter uppercase text-stone-900">
            🌙 MOON BASE
          </div>
          
          <nav class="space-y-2 text-left">
            <button 
              v-for="tab in [
                { id: 'base', label: '🌕 首頁' },
                { id: 'tickets', label: '🎫 數位門票' },
                { id: 'mytickets', label: '💎 我的資產' },
                { id: 'profile', label: '👤 個人中心' },
                { id: 'monitor', label: '⛓️ 監控節點' }
              ]" 
              :key="tab.id"
              @click="state.activeTab = tab.id" 
              :class="['w-full flex items-center gap-4 px-5 py-4 font-black text-sm rounded-2xl transition-all', 
                       state.activeTab === tab.id ? 'bg-stone-900 text-white shadow-lg' : 'text-stone-600 hover:bg-black/5']"
            >
              {{ tab.label }}
            </button>
          </nav>
        </div>
        
        <div class="mt-auto p-8 border-t border-stone-100">
          <div class="bg-black/5 p-4 rounded-2xl text-left">
            <p class="text-[10px] font-black text-stone-500 uppercase mb-1">鏈上錢包 (Mainnet)</p>
            <div class="flex flex-col gap-2">
              <p v-if="!state.walletAddress" class="text-xs font-bold text-red-500">未連接錢包</p>
              <p v-else class="text-[10px] font-mono break-all text-stone-600 leading-tight">{{ state.walletAddress }}</p>
              
              <button v-if="!state.walletAddress" @click="connectWallet" class="w-full bg-stone-900 text-white text-[10px] py-2 rounded-lg font-black hover:bg-stone-800 transition-all">
                連接錢包
              </button>
              
              <div class="flex justify-between items-center mt-2">
                <p class="text-xl font-black italic text-stone-900">{{ state.balance }} <span class="text-xs">PTS</span></p>
                <button @click="state.showDepositModal = true" class="bg-stone-900 text-white text-[10px] px-3 py-1.5 rounded-lg font-black hover:bg-stone-800">儲值</button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div class="flex-1 flex flex-col h-screen overflow-y-auto bg-stone-50/50">
        
        <header class="h-20 bg-white/80 backdrop-blur-md border-b border-stone-200 flex items-center justify-between px-10 sticky top-0 z-40">
          <div class="news-slide-container overflow-hidden w-96 text-left text-stone-400 italic font-black text-[10px] tracking-widest">
            📡 NODE SYNCED ... BLOCK #{{ state.currentBlock }} ... {{ state.currentUser.email }} 已連線 ...
          </div>
          
          <div class="flex items-center gap-4">
            <div class="text-right hidden sm:block">
              <p class="text-[10px] font-black uppercase text-stone-400">Security Clearance: L1</p>
              <p class="text-xs font-bold text-stone-900">{{ state.currentUser.name || '探員' }}</p> 
            </div>
            <button @click="handleLogout" class="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center hover:bg-red-100 transition-all border border-stone-200 shadow-sm">🚪</button>
          </div>
        </header>

        <main class="p-8 md:p-12 max-w-6xl mx-auto w-full">
          <HomeTab v-if="state.activeTab === 'base'" />
          <TicketsTab v-else-if="state.activeTab === 'tickets'" />
          <MyTicketsTab v-else-if="state.activeTab === 'mytickets'" />
          <ProfileTab v-else-if="state.activeTab === 'profile'" />
          
          <div v-else class="text-left animate-[fadeIn_0.3s_ease-out] glass p-10 rounded-3xl border border-stone-200">
            <h2 class="text-2xl font-black text-stone-900 italic uppercase">Section: {{ state.activeTab }}</h2>
            <div class="mt-6 flex items-center gap-3">
              <span class="w-3 h-3 bg-yellow-500 rounded-full animate-ping"></span>
              <p class="text-stone-500 font-bold">該區域模組正在同步建置中，請稍後再試 🛠️ ...</p>
            </div>
          </div>
        </main>

        <footer class="p-10 text-center opacity-20 text-[10px] font-black tracking-[0.5em] uppercase">
          Moon Base Alpha - All Rights Reserved 2026
        </footer>
      </div>
    </div>

    <VideoModal 
      v-if="state.showVideoModal" 
      @close="state.showVideoModal = false" 
    />

    <TicketDetailModal 
      v-if="state.showTicketModal && state.selectedTicket" 
      :ticket="state.selectedTicket"
      @close="closeTicketDetail"
    />
    
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { state, logAction, fetchUserProfile } from './store.js';
import { supabase } from './supabase.js';

// 引入組件
import LoginBox from './components/LoginBox.vue';
import HomeTab from './components/HomeTab.vue';
import TicketsTab from './components/TicketsTab.vue';
import MyTicketsTab from './components/MyTicketsTab.vue';
import VideoModal from './components/VideoModal.vue';
import TicketDetailModal from './components/TicketDetailModal.vue';
import ProfileTab from './components/ProfileTab.vue';

// 狀態計時器
const currentTime = ref(new Date().toLocaleTimeString());

// ✨ 新增：專門處理關閉票券視窗的函數
const closeTicketDetail = () => {
  state.showTicketModal = false;
  state.selectedTicket = null;
};

// 登出函數
const handleLogout = async () => {
  if(!confirm("確定要切斷連線並離開基地嗎？")) return;
  try {
    await supabase.auth.signOut();
    logAction("登出基地", true);
    // 重設前端狀態
    state.isLoggedIn = false;
    state.currentUser = { id: null, email: '', name: '' };
    state.balance = 0;
    state.myTickets = [];
    localStorage.clear();
    alert("👋 已成功登出，期待探員再次歸隊！");
  } catch (error) {
    console.error("登出錯誤:", error);
  }
};

// 錢包連線
const connectWallet = async () => {
  if (window.ethereum) {
    try {
      const accs = await window.ethereum.request({ method: 'eth_requestAccounts' });
      state.walletAddress = accs[0];
      logAction(`已連接錢包: ${accs[0].substring(0,6)}...`, true);
    } catch (e) {
      console.error("連線失敗", e);
    }
  } else {
    alert("請安裝 MetaMask 錢包");
  }
};

// 🚀 ✨ 關鍵：生命週期監控與資料恢復
onMounted(async () => {
  // 1. 啟動計時器
  setInterval(() => { currentTime.value = new Date().toLocaleTimeString(); }, 1000);
  setInterval(() => { state.currentBlock++; }, 4000);

  // 2. 🚀 解決刷新跑掉的問題：手動檢查一次 Session
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    console.log("🔄 偵測到現有 Session，正在恢復資料...");
    state.isLoggedIn = true;
    state.currentUser.id = session.user.id;
    state.currentUser.email = session.user.email;
    await fetchUserProfile(session.user.id); // 從資料庫拉回 myTickets 和 balance
  }

  // 3. 監聽登入/登出狀態變化
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session) {
      state.isLoggedIn = true;
      state.currentUser.id = session.user.id;
      state.currentUser.email = session.user.email;
      await fetchUserProfile(session.user.id);
    } else if (event === 'SIGNED_OUT') {
      state.isLoggedIn = false;
      state.currentUser = { id: null, email: '', name: '' };
      state.balance = 0;
      state.myTickets = [];
    }
  });
});
</script>

<style>
/* 保持你原本的樣式不變... */
@keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
.animate-marquee { display: inline-block; white-space: nowrap; animation: marquee 20s linear infinite; }
.marquee-container { overflow: hidden; background: white; }
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #e7e5e4; border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: #d6d3d1; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>