<template>
  <div class="space-y-8 text-left animate-[fadeIn_0.5s_ease-out]">
    
    <div class="glass p-8 rounded-3xl border border-stone-200/50 shadow-sm">
      <h2 class="text-2xl font-black text-stone-900 mb-6">💎 我的數位資產</h2>
      
      <div v-if="state.myTickets.length === 0" class="text-center py-10 bg-black/5 rounded-2xl border border-dashed border-stone-300">
        <p class="text-stone-500 font-bold">目前背包空空如也，快去數位門票區兌換吧！</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div 
    v-for="ticket in state.myTickets" 
    :key="ticket.serial" 
    @click="activeTicket = ticket"
    class="bg-stone-900 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden group transition-all cursor-pointer hover:scale-[1.02] flex flex-col justify-between min-h-[140px]"
  >
    <div class="absolute -right-4 -top-4 w-16 h-16 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all"></div>
    
    <div>
      <p class="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Verified NFT (SBT)</p>
      <h3 class="text-xl font-black mb-1 leading-snug">{{ ticket.name }}</h3>
    </div>
    
    <p class="text-[10px] text-green-400 mt-4 animate-pulse">● 點擊出示動態憑證與管理票券</p>
  </div>
</div>
    </div>

    <div class="glass p-8 rounded-3xl border border-stone-200/50 shadow-sm">
      <h2 class="text-xl font-black text-stone-900 mb-2">🗂️ 基地典藏館 (Archive)</h2>
      <p class="text-stone-500 text-sm mb-6">過往活動紀錄。持有專屬通行證者，可進入後台花絮區域。</p>

      <div class="flex flex-col md:flex-row gap-6 bg-white/50 p-6 rounded-2xl border border-white">
        <div class="w-48 h-48 shrink-0 bg-stone-900 rounded-xl flex items-center justify-center text-white font-black italic shadow-inner relative overflow-hidden">
          <div class="absolute inset-0 bg-[url('/glow.jpg')] bg-cover bg-center"></div>
        </div>
        
        <div class="flex-1 flex flex-col justify-center">
          <div class="flex items-center gap-3 mb-2">
            <h3 class="text-xl font-black text-stone-900">《會發光的安靜》演唱會</h3>
            <span class="px-2 py-1 bg-stone-200 text-stone-500 text-[10px] font-black rounded-md">已結束</span>
          </div>
          <p class="text-sm text-stone-600 font-bold mb-4">
            月亮忘了關燈 2026 巡迴演出。在這場安靜的革命中，我們用光影與頻率，找到了彼此的座標。
          </p>
          
          <div v-if="hasLuminousSilence" class="bg-green-50 p-4 rounded-xl border border-green-200">
            <p class="text-green-700 font-black text-sm mb-2">✅ 已驗證持有權限：您可存取隱藏內容</p>
            <div class="flex gap-2">
              <button @click="openVideo" class="bg-stone-900 text-white text-xs font-black px-4 py-2 rounded-lg hover:bg-stone-800 transition-all">觀看幕後花絮</button>
              <button class="bg-white border border-stone-200 text-stone-700 text-xs font-black px-4 py-2 rounded-lg hover:bg-stone-50 transition-all">下載實況音檔</button>
            </div>
          </div>
          
          <div v-else class="bg-stone-100 p-4 rounded-xl border border-stone-200">
            <p class="text-stone-500 font-bold text-sm mb-2">🔒 未持有此活動通行證，僅供檢視基本資訊。</p>
            <button disabled class="bg-stone-300 text-stone-500 text-xs font-black px-4 py-2 rounded-lg cursor-not-allowed">內容已鎖定</button>
          </div>
        </div>
      </div>
    </div>

    <TicketDetailModal 
      v-if="activeTicket" 
      :ticket="activeTicket" 
      @close="activeTicket = null" 
    />
    
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { state, logAction } from '../store.js';
import TicketDetailModal from './TicketDetailModal.vue'; // 引入外部元件

const activeTicket = ref(null);

// 判定是否持有特權票
const hasLuminousSilence = computed(() => {
  return state.myTickets.some(ticket => 
    ticket.name && (ticket.name.includes('VIP') || ticket.name.includes('一般票') || ticket.name.includes('會發光的安靜'))
  );
});

const openVideo = () => {
  if (hasLuminousSilence.value) {
    state.showVideoModal = true; 
    logAction("進入後台花絮區", true);
  }
};
</script>