<template>
  <div class="space-y-8 text-left animate-[fadeIn_0.5s_ease-out]">
    
    <div class="glass p-8 rounded-3xl border border-stone-200/50 shadow-sm">
      <h2 class="text-2xl font-black text-stone-900 mb-6">💎 我的數位資產 (Verified Assets)</h2>
      
      <div v-if="state.myTickets.length === 0" class="text-center py-12 bg-black/5 rounded-2xl border border-dashed border-stone-300">
        <p class="text-stone-500 font-bold">目前背包空空如也，快去數位門票區兌換吧！</p>
      </div>

      <div v-else class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        <div 
          v-for="ticket in state.myTickets" 
          :key="ticket.id" 
          @click="openDetail(ticket)"
          class="ticket-card bg-stone-900 rounded-2xl text-white shadow-xl relative overflow-hidden group transition-all cursor-pointer hover:scale-[1.02] flex min-h-[160px]"
        >
          
          <div class="flex-1 p-7 flex flex-col justify-between z-10 relative bg-stone-900">
            <div>
              <p class="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 opacity-80">Verified NFT (SBT)</p>
              <h3 class="text-xl md:text-2xl font-black mb-1 leading-tight tracking-tight">
                {{ getDisplayTicketName(ticket) }}
              </h3>
            </div>
            
            <div class="flex items-center gap-2 mt-4">
              <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <p class="text-[11px] text-green-400 font-bold tracking-wide">● 點擊出示動態憑證與管理</p>
            </div>
          </div>

          <div class="w-[160px] h-[160px] shrink-0 relative overflow-hidden bg-black">
            
            <img 
              :src="getTicketImg(ticket)" 
              alt="Ticket Glow" 
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ticket-image"
            />
            
            <div class="absolute inset-0 bg-gradient-to-r from-stone-900 via-stone-900/30 to-transparent"></div>
          </div>

          <div class="absolute -right-10 -top-10 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'; 
import { state, logAction } from '../store.js';

// 安全解析票券並取得名稱的函數
const getDisplayTicketName = (ticket) => {
  if (!ticket) return '';
  let parsedTicket = ticket;
  if (typeof ticket === 'string') {
    try {
      parsedTicket = JSON.parse(ticket);
    } catch (e) {
      console.error("解析票券失敗:", e);
      return '未知票券';
    }
  }
  return parsedTicket.name || parsedTicket.ticket_name || '';
};

// 函數有沒有正確改變 state
const openDetail = (ticket) => {
  state.selectedTicket = ticket; 
  state.showTicketModal = true; // 確認這個變數名稱跟你 Modal 用的是一樣的
};

// 動態決定圖片路徑的函數 
const getTicketImg = (ticket) => {
  const name = getDisplayTicketName(ticket);
  if (name.includes('VIP')) {
    return '/glowvip.jpg';
  } else {
    return '/glowgenerally.jpg';
  }
};


</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.ticket-card {
  contain: paint; 
}

/* 👇 直接把下面這兩段貼在 style 區塊的最底下 */
.ticket-image {
  /* 亮度提高 20%，對比度提高 10% */
  filter: brightness(1.2) contrast(1.1);
}

.ticket-card:hover .ticket-image {
  filter: brightness(1.1) contrast(1.1);
}
</style>