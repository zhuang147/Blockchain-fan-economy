<template>
  <div class="animate-[fadeIn_0.5s_ease-out] pb-20">
    
    <div class="relative w-full h-[30vh] md:h-[40vh] rounded-b-3xl overflow-hidden shadow-lg mb-8">
      <img :src="eventData.coverImage" class="w-full h-full object-cover" />
      <div class="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent"></div>
      
      <div class="absolute bottom-6 left-6 md:left-12 text-white">
        <span class="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-3 inline-block">
          {{ eventData.status === 'ended' ? '已結束 Archive' : '進行中 Live' }}
        </span>
        <h1 class="text-3xl md:text-5xl font-black mb-2">{{ eventData.title }}</h1>
        <p class="text-stone-300 font-bold">{{ eventData.date }} | {{ eventData.location }}</p>
      </div>
    </div>

    <div class="px-4 md:px-12 max-w-7xl mx-auto">
      
      <div v-if="!hasTicket" class="mb-8 bg-stone-100 border border-stone-200 p-4 rounded-xl flex items-center gap-4">
        <span class="text-2xl">🔒</span>
        <div>
          <p class="font-black text-stone-900 text-sm">尚未解鎖完整體驗</p>
          <p class="text-xs text-stone-500 font-bold mt-0.5">獲取本場活動數位票券，即可解鎖幕後花絮與專屬觀後感功能。</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div class="lg:col-span-2 space-y-6">
          
          <section v-if="hasTicket" class="glass p-6 rounded-2xl border border-stone-200/50">
            <h2 class="text-lg font-black text-stone-900 mb-4 flex items-center gap-2">🎫 我的數位票券</h2>
            </section>

          <section class="glass p-6 rounded-2xl border border-stone-200/50">
            <div class="flex justify-between items-end mb-4">
              <h2 class="text-lg font-black text-stone-900 flex items-center gap-2">🎬 專屬幕後花絮</h2>
              <span v-if="hasTicket" class="text-[10px] font-black text-green-600 bg-green-100 px-2 py-1 rounded">🔓 VIP 已解鎖</span>
            </div>
            
            <div v-if="hasTicket" class="aspect-video bg-stone-900 rounded-xl flex items-center justify-center text-stone-500">
              ▶ 點擊播放 {{ eventData.title }} 花絮
            </div>
            <div v-else class="aspect-video bg-stone-200 rounded-xl flex items-center justify-center text-stone-400 font-bold flex-col gap-2">
              <span>🔒</span>
              <span>需持有門票才可觀看</span>
            </div>
          </section>
        </div>

        <div class="space-y-6">
          
          <section class="glass p-6 rounded-2xl border border-stone-200/50">
            <h2 class="text-lg font-black text-stone-900 mb-4 flex items-center gap-2">🏆 任務紀錄</h2>
            <ul class="space-y-3">
              <li class="flex items-center gap-3 text-sm font-bold text-stone-600">
                <span class="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-xs">✓</span>
                購買數位專輯
              </li>
              <li class="flex items-center gap-3 text-sm font-bold text-stone-400">
                <span class="w-5 h-5 rounded-full border-2 border-stone-300 flex items-center justify-center"></span>
                活動當日現場打卡
              </li>
            </ul>
          </section>

          <section class="glass p-6 rounded-2xl border border-stone-200/50">
            <h2 class="text-lg font-black text-stone-900 mb-4 flex items-center gap-2">✍️ 光留下的痕跡</h2>
            <div v-if="hasTicket">
              <p class="text-xs text-stone-500 font-bold mb-4">寫下專屬於你的共鳴與感動...</p>
              <button class="w-full bg-stone-900 text-white font-black py-3 rounded-xl hover:bg-stone-800 transition-colors">
                撰寫心情日記
              </button>
            </div>
            <div v-else class="text-center py-6 text-stone-400 font-bold text-sm">
              參與活動後即可解鎖專屬日記功能
            </div>
          </section>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// 模擬資料 (之後由路由參數取得活動 ID，再從 Supabase 撈取)
const hasTicket = ref(true); // 測試用：切換 true/false 看看 UI 變化
const eventData = ref({
  id: 'evt-001',
  title: '《會發光的安靜》巡迴演唱會',
  date: '2025.10.15',
  location: '台北小巨蛋',
  status: 'ended',
  coverImage: '/glow.jpg' // 換成你的圖
});
</script>