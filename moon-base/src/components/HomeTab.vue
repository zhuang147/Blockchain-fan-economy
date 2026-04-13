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
          :class="[
            'px-6 py-3 rounded-2xl font-black transition-all',
            hasCheckedIn ? 'bg-stone-200 text-stone-400 cursor-not-allowed' : 'bg-stone-900 text-white hover:scale-105 shadow-lg'
          ]"
        >
          {{ hasCheckedIn ? '✦ 今日已領取' : '✦ 每日簽到 (+10 PTS)' }}
        </button>
      </div>

      <div class="glass p-8 rounded-3xl border border-stone-200/50 shadow-sm">
         <h2 class="text-xl font-black text-stone-900 mb-4">📢 限時任務</h2>
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
import { computed, onMounted } from 'vue';
import { state, logAction } from '../store.js';
import { supabase } from '../supabase.js';

// 改用 computed：即時偵測全域狀態，判斷今天是否已經簽到
const hasCheckedIn = computed(() => {
  if (!state.currentUser?.id) return false;
  return state.lastCheckInDate === new Date().toDateString();
});

onMounted(() => {
  // 檢查本機有沒有今天的簽到紀錄，有的話同步到 store 讓全站共用
  if (state.currentUser?.id) {
    const lastDate = localStorage.getItem(`checkin_date_${state.currentUser.id}`);
    if (lastDate) {
      state.lastCheckInDate = lastDate;
    }
  }
});

const handleCheckIn = async () => {
  console.log("點擊了簽到按鈕！目前 hasCheckedIn 的值是：", hasCheckedIn.value);
  
  if (hasCheckedIn.value) {
    alert("系統判定你今天已經簽到過囉！"); 
    return;
  }

  const previousBalance = state.balance;
  state.balance += 10; // UI 先加分，反應更即時
  
  const today = new Date().toDateString();

  const { error } = await supabase
    .from('profiles')
    .update({ balance: state.balance })
    .eq('id', state.currentUser.id);

  if (!error) {
    // 更新全域狀態與本機儲存 (這樣個人中心才會同步變色)
    state.lastCheckInDate = today;
    localStorage.setItem(`checkin_date_${state.currentUser.id}`, today);
    
    logAction("完成每日簽到", true);
    alert("簽到成功！獲取 10 PTS");
  } else {
    // 如果連線失敗，把分數扣回來防呆
    state.balance = previousBalance;
    alert("連線失敗，請重試");
  }
};
</script>