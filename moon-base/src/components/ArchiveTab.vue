<template>
  <div class="space-y-10 text-left animate-[fadeIn_0.5s_ease-out] pb-20">
    
    <div class="mb-8">
      <h2 class="text-3xl font-black text-stone-900">基地典藏館</h2>
      <p class="text-stone-500 font-bold mt-2">那些光留下的痕跡，都在這裡為你永久保存。</p>
    </div>

    <div v-if="!selectedArchiveEvent" class="space-y-6">
      <div 
        v-for="event in pastEventsList" 
        :key="event.id"
        @click="openEventArchive(event)"
        class="bg-white rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col md:flex-row overflow-hidden group"
      >
        <div class="w-full md:w-1/3 h-48 md:h-auto shrink-0 relative overflow-hidden bg-stone-900">
          <div class="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" :style="{ backgroundImage: `url(${event.image})` }"></div>
        </div>
        
        <div class="p-6 md:p-8 flex flex-col justify-center flex-1">
          <div class="mb-3">
            <span class="px-2 py-1 bg-stone-100 text-stone-500 text-[10px] font-black rounded-md mb-2 inline-block">Archived Event</span>
            <h3 class="text-2xl font-black text-stone-900 group-hover:text-stone-600 transition-colors">{{ event.name }}</h3>
          </div>
          <p class="text-sm text-stone-500 font-bold leading-relaxed">
            {{ event.description }}
          </p>
          <div class="mt-6 flex items-center gap-2 text-xs font-black text-stone-400">
            <span>查看專屬紀錄與花絮</span>
            <span>→</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="animate-[fadeIn_0.3s_ease-out]">
      <button @click="closeEventArchive" class="flex items-center gap-2 text-stone-500 hover:text-stone-900 font-black mb-6 transition-colors">
        <span>←</span> 返回活動列表
      </button>

      <div class="mb-8 p-6 bg-stone-900 rounded-2xl text-white flex items-center gap-6 overflow-hidden relative">
        <div class="absolute inset-0 bg-cover bg-center opacity-30" :style="{ backgroundImage: `url(${selectedArchiveEvent.image})` }"></div>
        <div class="relative z-10">
          <h3 class="text-2xl font-black mb-1">{{ selectedArchiveEvent.name }}</h3>
          <p class="text-stone-400 text-sm font-bold">專屬檔案庫已開啟</p>
        </div>
      </div>

      <section class="bg-white p-6 md:p-8 rounded-3xl border border-stone-200 shadow-sm mb-8">
        <div class="mb-8 border-b border-stone-100 pb-4">
          <h3 class="text-xl font-black text-stone-900 flex items-center gap-2">
            <span>📖</span> 光留下的痕跡
          </h3>
          <p class="text-sm text-stone-500 font-bold mt-1">你在這場活動中留下的座標。</p>
        </div>
        
        <div v-if="currentEventTickets.length > 0" class="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div 
            v-for="ticket in currentEventTickets" 
            :key="ticket.id" 
            @click="openDiaryModal(ticket)"
            class="ticket-card bg-stone-900 rounded-2xl text-white shadow-xl relative overflow-hidden group transition-all cursor-pointer hover:scale-[1.02] flex min-h-[160px]"
          >
            <div class="flex-1 p-7 flex flex-col justify-between z-10 relative bg-stone-900">
              <div>
                <p class="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 opacity-80">Verified Asset</p>
                <h3 class="text-xl md:text-2xl font-black mb-1 leading-tight tracking-tight">
                  {{ ticket.name }}
                </h3>
              </div>
              <div class="flex items-center gap-2 mt-4">
                <span class="text-lg">✍️</span>
                <p class="text-[11px] text-stone-300 font-bold tracking-wide">點擊撰寫 / 查看專屬觀後感</p>
              </div>
            </div>

            <div class="w-[160px] h-[160px] shrink-0 relative overflow-hidden bg-black">
              <img 
                :src="ticket.image || getTicketImg(ticket)" 
                alt="Ticket Glow" 
                class="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ticket-image"
              />
              <div class="absolute inset-0 bg-gradient-to-r from-stone-900 via-stone-900/30 to-transparent"></div>
            </div>
          </div>
        </div>

        <div v-else class="py-12 text-center border-2 border-dashed border-stone-100 rounded-2xl">
           <p class="text-stone-300 font-black italic">「這裡目前空無一物，等待著你的第一次共鳴。」</p>
        </div>
      </section>

      <div class="glass p-8 rounded-3xl border border-stone-200/50 shadow-sm">
        <h2 class="text-xl font-black text-stone-900 mb-2">🗂️ 幕後微光</h2>
        <p class="text-stone-500 text-sm mb-6">本場演出紀錄與幕後片段，僅限持有該場門票者開啟。</p>

        <div class="flex flex-col md:flex-row gap-6 bg-white/50 p-6 rounded-2xl border border-white">
          <div class="w-48 h-48 shrink-0 bg-stone-900 rounded-xl flex items-center justify-center text-white font-black italic shadow-inner relative overflow-hidden">
            <div class="absolute inset-0 bg-cover bg-center" :style="{ backgroundImage: `url(${selectedArchiveEvent.image})` }"></div>
          </div>
          
          <div class="flex-1 flex flex-col justify-center">
            <div class="flex items-center gap-3 mb-2">
              <h3 class="text-xl font-black text-stone-900">{{ selectedArchiveEvent.name }}</h3>
              <span class="px-2 py-1 bg-stone-200 text-stone-500 text-[10px] font-black rounded-md">已結束</span>
            </div>
            
            <div v-if="checkIfOwned(selectedArchiveEvent)" class="bg-green-50 p-4 rounded-xl border border-green-200 shadow-inner mt-4">
              <p class="text-green-700 font-black text-sm mb-2">✅ 已驗證持有權限：您可存取隱藏內容</p>
              <div class="flex gap-2">
                <button @click="openVideo(selectedArchiveEvent)" class="bg-stone-900 text-white text-xs font-black px-4 py-2 rounded-lg hover:bg-stone-800 transition-all shadow-md">
                  觀看幕後花絮
                </button>
                <button class="bg-white border border-stone-200 text-stone-700 text-xs font-black px-4 py-2 rounded-lg hover:bg-stone-50 transition-all shadow-sm">
                  下載實況音檔
                </button>
              </div>
            </div>
            <div v-else class="bg-stone-100 p-4 rounded-xl border border-stone-200 mt-4">
              <p class="text-stone-500 font-bold text-sm mb-2">🔒 未持有此活動通行證，僅供檢視基本資訊。</p>
              <button disabled class="bg-stone-300 text-stone-500 text-xs font-black px-4 py-2 rounded-lg cursor-not-allowed">
                內容已鎖定
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showDiaryModal" class="fixed inset-0 z-50 flex items-center justify-center px-4 bg-stone-900/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div class="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div class="p-6 border-b border-stone-100 bg-stone-50 flex justify-between items-center shrink-0">
          <div>
            <span class="px-2 py-1 bg-stone-200 text-stone-600 text-[10px] font-black rounded-md mb-2 inline-block">專屬回憶錄</span>
            <h2 class="text-xl font-black text-stone-900">{{ selectedTicket?.name }}</h2>
          </div>
          <button @click="closeDiaryModal" class="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center hover:bg-stone-300 transition-colors">
            <span class="text-stone-500 font-black">✕</span>
          </button>
        </div>

        <div class="p-6 space-y-5 overflow-y-auto">
          <div>
            <label class="block text-xs font-black text-stone-500 mb-1">日記標題</label>
            <input v-model="diaryData.title" type="text" placeholder="那晚的燈光與頻率..." class="w-full border border-stone-300 rounded-xl px-4 py-3 text-stone-900 font-bold focus:outline-none focus:border-stone-900 transition-colors">
          </div>
          <div>
            <label class="block text-xs font-black text-stone-500 mb-1">心情內文</label>
            <textarea v-model="diaryData.content" rows="6" placeholder="寫下專屬於你的共鳴與感動..." class="w-full border border-stone-300 rounded-xl px-4 py-3 text-stone-900 focus:outline-none focus:border-stone-900 transition-colors resize-none"></textarea>
          </div>
          <div class="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-100">
            <div>
              <p class="text-sm font-black text-stone-900">發佈至全體聊天室</p>
              <p class="text-xs text-stone-500 mt-0.5">設為公開後，官方與所有探員都能看見你的紀錄。</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="diaryData.isPublic" class="sr-only peer">
              <div class="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-stone-900"></div>
              <span class="ml-3 text-sm font-black" :class="diaryData.isPublic ? 'text-green-600' : 'text-stone-400'">{{ diaryData.isPublic ? '公開' : '私人' }}</span>
            </label>
          </div>
        </div>

        <div class="p-4 border-t border-stone-100 bg-stone-50 flex justify-end gap-3 shrink-0">
          <button @click="closeDiaryModal" class="px-6 py-2.5 rounded-xl font-black text-stone-500 hover:bg-stone-200 transition-colors text-sm">關閉</button>
          <button @click="saveDiary" class="px-6 py-2.5 rounded-xl font-black bg-stone-900 text-white hover:bg-stone-800 transition-all text-sm shadow-md">儲存變更</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { state } from '../store.js';

// ==========================================
// 1. 票券與 UI 輔助邏輯
// ==========================================
const getTicketImg = (ticket) => {
  const name = ticket.name || '';
  if (name.includes('VIP')) return '/glowvip.jpg';
  return '/glowgenerally.jpg';
};

// ==========================================
// 2. 歷史活動清單與層級切換邏輯 (🌟 新增)
// ==========================================
const pastEventsList = ref([
  {
    id: 'event-glow',
    name: '《會發光的安靜》專輯演唱會',
    matchKeyword: '會發光的安靜',
    description: '月亮忘了關燈2026巡迴演出。月光照亮每個陰影，我們以頻率找到彼此座標',
    image: '/glow.jpg'
  },
  {
    id: 'walk-light',
    name: '《與光共行》首場專輯演唱會',
    matchKeyword: '與光共行',
    description: '月亮忘了關燈2025巡迴演出。僅限100人的秘密集會，當光慢慢變得明顯，我們剛好沒有錯過彼此。',
    image: '/light.jpg'
  }
]);

// 記錄當前點擊進入的活動，null 表示在第一層列表
const selectedArchiveEvent = ref(null);

const openEventArchive = (event) => {
  selectedArchiveEvent.value = event;
};

const closeEventArchive = () => {
  selectedArchiveEvent.value = null;
};

// ==========================================
// 3. 專屬內容邏輯 (日記 & 花絮)
// ==========================================

// 🌟 動態計算屬性：只抓取「當前選擇活動」的相關票券
const currentEventTickets = computed(() => {
  if (!state.myTickets || !selectedArchiveEvent.value) return [];
  return state.myTickets.filter(ticket => 
    ticket.name.includes(selectedArchiveEvent.value.matchKeyword)
  );
});

// 動態比對：檢查使用者是否有該場活動的票 (花絮解鎖用)
const checkIfOwned = (event) => {
  if (!state.myTickets || state.myTickets.length === 0) return false;
  return state.myTickets.some(ticket => ticket.name.includes(event.matchKeyword));
};

// 觸發觀看影片 Modal
const openVideo = (event) => {
  state.showVideoModal = true;
  console.log(`準備播放花絮：${event.name}`);
};

// ==========================================
// 4. 光留下的痕跡：觀後感日記 Modal 邏輯
// ==========================================
const showDiaryModal = ref(false);
const selectedTicket = ref(null);
const diaryData = ref({ title: '', content: '', isPublic: false });

const openDiaryModal = (ticket) => {
  selectedTicket.value = ticket;
  diaryData.value = { title: '', content: '', isPublic: false };
  showDiaryModal.value = true;
};

const closeDiaryModal = () => {
  showDiaryModal.value = false;
  selectedTicket.value = null;
};

const saveDiary = () => {
  console.log("儲存日記：", diaryData.value);
  alert(`✅ 日記已暫時記錄！狀態：${diaryData.value.isPublic ? '公開發佈' : '僅限自己可見'}`);
  closeDiaryModal();
};

const saveMemoir = async (title, content, isPublic) => {
  // 1. 存入個人回憶錄資料庫
  const { data, error } = await supabase.from('memoirs').insert([
    { user_id: state.currentUser.id, title, content, is_public: isPublic }
  ]);

  if (error) return alert("儲存失敗");

  // 2. 如果使用者勾選「公開」，同步發送到 LIVE FEED
  if (isPublic) {
    await supabase.from('feed_messages').insert([
      {
        user_id: state.currentUser.id,
        type: 'memoir',
        content: `【回憶錄：${title}】\n${content}`
      }
    ]);
  }
  
  alert(isPublic ? "已公開發佈至 Live Feed！" : "已收藏至個人典藏館。");
};
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>