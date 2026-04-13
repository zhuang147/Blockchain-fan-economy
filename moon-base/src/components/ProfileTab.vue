<template>
  <div class="space-y-8 text-left animate-[fadeIn_0.5s_ease-out] pb-10">
    
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
          <div :class="isAdmin ? 'bg-red-600' : 'bg-stone-900'" class="text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest transition-colors">
            {{ isAdmin ? '系統管理員 (ADMIN)' : '一級探員 (L1 AGENT)' }}
          </div>
        </div>

        <div class="flex-1 space-y-6 w-full pt-2">
          <div>
            <p class="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Agent Identity (公開探員代號)</p>
            <div class="flex flex-col sm:flex-row gap-2">
              <input v-model="newName" class="bg-white/50 border border-stone-200 rounded-lg px-4 py-2 text-xl font-black text-stone-900 focus:outline-none focus:border-stone-900 w-full sm:w-auto transition-all" placeholder="輸入新代號">
              <button @click="updateNickname" class="bg-stone-900 text-white text-[10px] px-6 py-2.5 rounded-lg font-black hover:bg-stone-700 transition-all shadow-md">更新代號</button>
            </div>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-0 md:pr-24">
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

    <div class="bg-white p-6 md:p-8 rounded-3xl border border-stone-200 shadow-sm">
      <div class="flex justify-between items-end mb-6 border-b border-stone-100 pb-4">
        <div>
          <h3 class="text-xl font-black text-stone-900">與月同行 (Check-in Record)</h3>
          <p class="text-sm text-stone-500 font-bold mt-1">你的基地活躍紀錄，點亮了無數個夜晚。</p>
        </div>
        <div class="text-right">
          <p class="text-[10px] font-black text-stone-400 uppercase tracking-widest">本月累計</p>
          <p class="text-2xl font-black text-stone-900">{{ checkedInDays.length }} <span class="text-sm font-bold text-stone-500">天</span></p>
        </div>
      </div>

      <div class="grid grid-cols-7 gap-2 md:gap-4 text-center mt-4">
        <div v-for="day in ['日', '一', '二', '三', '四', '五', '六']" :key="day" class="text-xs font-black text-stone-400 pb-2">
          {{ day }}
        </div>
        
        <div v-for="empty in 3" :key="'empty-'+empty"></div>
        
        <div v-for="date in 30" :key="date" class="aspect-square relative flex items-center justify-center rounded-xl border border-stone-100 bg-stone-50 overflow-hidden">
          <span v-if="!checkedInDays.includes(date)" class="text-stone-400 font-bold z-10">{{ date }}</span>
          
          <div v-else class="absolute inset-1 bg-stone-900 rounded-full flex items-center justify-center shadow-inner z-20">
            <span class="text-yellow-100 text-lg md:text-2xl drop-shadow-[0_0_8px_rgba(254,240,138,0.8)]">🌙</span>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { state } from '../store.js';
import { supabase } from '../supabase.js';

// === 使用者資訊邏輯 ===
const newName = ref(state.currentUser.name);
const userData = ref(null);

onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    userData.value = user;
    newName.value = state.currentUser.name;
  }
});

const updateNickname = async () => {
  if (!newName.value.trim()) {
    alert("暱稱不能為空！");
    return;
  }
  const { error } = await supabase.from('profiles').update({ username: newName.value }).eq('id', state.currentUser.id);
  if (error) alert("更新失敗：" + error.message);
  else {
    state.currentUser.name = newName.value;
    alert("🚀 探員代號已同步至基地伺服器！");
  }
};

const isAdmin = computed(() => state.currentUser.email === 'admin@moon.com');

// === 模擬簽到月曆資料 ===
const checkedInDays = ref([1, 2, 4, 5, 8, 10, 11, 12, 13]); 
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>