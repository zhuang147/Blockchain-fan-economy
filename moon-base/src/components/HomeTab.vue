<template>
  <div class="space-y-6 text-left animate-[fadeIn_0.5s_ease-out]">
    
    <div class="glass p-8 rounded-3xl border border-stone-200/50 relative overflow-hidden shadow-sm">
      <div class="relative z-10">
        <h1 class="text-3xl font-black text-stone-900 tracking-tight mb-2">
          歡迎歸隊，{{ state.currentUser.name }} 探員
        </h1>
        <p class="text-stone-500 font-bold text-sm">目前連線狀態：穩定 🟢 | 基地權限：Level 1</p>
      </div>
      <div class="absolute right-0 top-0 w-64 h-64 bg-stone-300 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/4"></div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="glass p-8 rounded-3xl border border-stone-200/50 flex flex-col justify-between shadow-sm">
        <div>
          <h2 class="text-xl font-black text-stone-900 mb-2">📅 每日簽到</h2>
          <p class="text-stone-500 text-sm mb-8">每日同步可獲取 10 PTS，累積點數可兌換數位門票。</p>
        </div>
        
        <button
          @click="handleCheckIn"
          :disabled="hasCheckedIn"
          :class="hasCheckedIn ? 'bg-stone-200 text-stone-400 cursor-not-allowed' : 'bg-stone-900 text-white hover:bg-stone-800 hover:scale-[0.98] shadow-xl shadow-stone-900/20'"
          class="w-full font-black py-4 rounded-2xl transition-all transform"
        >
          {{ hasCheckedIn ? '✅ 今日已完成同步' : '開始同步 (獲取 10 PTS)' }}
        </button>
      </div>

      <div class="glass p-8 rounded-3xl border border-stone-200/50 shadow-sm">
         <h2 class="text-xl font-black text-stone-900 mb-4">📢 最新任務指令</h2>
         <ul class="space-y-3">
           <li class="flex items-start gap-4 p-4 bg-white/50 rounded-2xl border border-white">
             <span class="text-2xl mt-1">🎬</span>
             <div>
               <p class="text-sm font-black text-stone-900">觀看《會發光的安靜》前導預告</p>
               <p class="text-[10px] font-bold text-stone-500 uppercase tracking-wide mt-1">獎勵: 50 PTS | 狀態: 未完成</p>
             </div>
           </li>
         </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { state, logAction } from '../store.js';
import { supabase } from '../supabase.js';

const hasCheckedIn = ref(false);

onMounted(() => {
  // 檢查今天是否簽到過
  const today = new Date().toDateString();
  const lastDate = localStorage.getItem(`checkin_date_${state.currentUser.id}`);
  if (lastDate === today) {
    hasCheckedIn.value = true;
  }
});

const handleCheckIn = async () => {
  if (hasCheckedIn.value) return;

  state.balance += 10;
  
  const { error } = await supabase
    .from('profiles')
    .update({ balance: state.balance })
    .eq('id', state.currentUser.id);

  if (!error) {
    hasCheckedIn.value = true;
    localStorage.setItem(`checkin_date_${state.currentUser.id}`, new Date().toDateString());
    logAction("完成每日簽到", true);
    alert("簽到成功！獲取 10 PTS");
  } else {
    alert("連線失敗，請重試");
  }
};
</script>