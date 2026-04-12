<template>
  <div class="space-y-8 text-left animate-[fadeIn_0.5s_ease-out]">
    
    <div class="glass p-8 rounded-3xl border border-stone-200/50 shadow-sm relative overflow-hidden">
      <div class="absolute right-0 top-0 w-64 h-64 bg-stone-900/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      
      <div class="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
        
        <div class="flex flex-col items-center gap-3">
          <div class="w-32 h-32 rounded-full bg-stone-900 p-1 shadow-xl">
            <div class="w-full h-full rounded-full border border-stone-700 bg-stone-800 flex items-center justify-center overflow-hidden relative">
              <span class="text-5xl">🧑‍🚀</span>
              <div class="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
          </div>
          <div 
            :class="isAdmin ? 'bg-red-600' : 'bg-stone-900'" 
            class="text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest transition-colors"
          >
            {{ isAdmin ? '系統管理員 (ADMIN)' : '一級探員 (L1 AGENT)' }}
          </div>
        </div>

        <div class="flex-1 space-y-6 w-full">
          <div>
            <p class="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Agent Identity (公開探員代號)</p>
            <div class="flex flex-col sm:flex-row gap-2">
              <input 
                v-model="newName" 
                class="bg-white/50 border border-stone-200 rounded-lg px-4 py-2 text-xl font-black text-stone-900 focus:outline-none focus:border-stone-900 w-full sm:w-auto transition-all"
                placeholder="輸入新代號"
              >
              <button @click="updateNickname" class="bg-stone-900 text-white text-[10px] px-6 py-2.5 rounded-lg font-black hover:bg-stone-700 transition-all shadow-md">
                更新代號
              </button>
            </div>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="bg-black/5 p-4 rounded-xl border border-stone-100">
              <p class="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">基地通訊頻率 (聯絡信箱)</p>
              <p class="font-bold text-stone-700 text-sm truncate">{{ state.currentUser.email }}</p>
            </div>
            
            <div class="bg-white/60 p-4 rounded-xl border border-white">
              <p class="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Web3 Wallet</p>
              <p v-if="state.walletAddress" class="font-mono text-xs text-stone-700 truncate">{{ state.walletAddress }}</p>
              <p v-else class="font-bold text-red-500 text-xs">未綁定區塊鏈錢包</p>
            </div>
          </div>
        </div>

      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="glass p-6 rounded-2xl border border-stone-200/50 flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-transform cursor-default">
        <span class="text-3xl mb-2">💎</span>
        <h3 class="text-2xl font-black text-stone-900">{{ state.balance }}</h3>
        <p class="text-[10px] font-black text-stone-400 uppercase tracking-widest mt-1">Available PTS</p>
      </div>
      
      <div class="glass p-6 rounded-2xl border border-stone-200/50 flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-transform cursor-default">
        <span class="text-3xl mb-2">🎫</span>
        <h3 class="text-2xl font-black text-stone-900">{{ state.myTickets.length }}</h3>
        <p class="text-[10px] font-black text-stone-400 uppercase tracking-widest mt-1">SBT Assets</p>
      </div>

      <div class="glass p-6 rounded-2xl border border-stone-200/50 flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-transform cursor-default">
        <span class="text-3xl mb-2">⏱️</span>
        <h3 class="text-xl font-black text-stone-900">{{ loginDays }} 天</h3>
        <p class="text-[10px] font-black text-stone-400 uppercase tracking-widest mt-1">Active Duration</p>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { state } from '../store.js';
import { supabase } from '../supabase.js';

// 綁定暱稱輸入框
const newName = ref(state.currentUser.name);

// 儲存從 Supabase 抓到的使用者詳細資訊
const userData = ref(null);

onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    userData.value = user;
    // 確保組件掛載時，輸入框顯示目前的名稱
    newName.value = state.currentUser.name;
  }
});

// 執行更新暱稱到資料庫
const updateNickname = async () => {
  if (!newName.value.trim()) {
    alert("暱稱不能為空！");
    return;
  }

  const { error } = await supabase
    .from('profiles')
    .update({ username: newName.value })
    .eq('id', state.currentUser.id);

  if (error) {
    alert("更新失敗：" + error.message);
  } else {
    state.currentUser.name = newName.value;
    alert("🚀 探員代號已同步至基地伺服器！");
  }
};

// 真實計算登入天數
const loginDays = computed(() => {
  if (!userData.value || !userData.value.created_at) return 1;

  const signUpDate = new Date(userData.value.created_at); // 註冊日期
  const today = new Date(); // 今天
  
  // 計算兩個日期之間的毫秒差
  const diffTime = Math.abs(today - signUpDate);
  // 轉換為天數 (毫秒 / 1000秒 / 60分 / 60時 / 24天)
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays + 1; // 包含註冊當天
});

// 判斷是否為管理者
const isAdmin = computed(() => {
  return state.currentUser.email === 'admin@moon.com';
});
</script>