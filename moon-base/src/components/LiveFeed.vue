<template>
  <div class="flex flex-col h-full max-w-4xl mx-auto border-x border-stone-200 bg-white">
    <div class="p-6 border-b border-stone-100 shadow-sm bg-white/80 backdrop-blur-md sticky top-0 z-10">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h3 class="text-2xl font-black italic tracking-tighter flex items-center gap-2">
            LIVE FEED
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          </h3>
          <p class="text-[10px] font-bold text-stone-400 uppercase tracking-widest">基地實時監控系統</p>
        </div>

        <div class="flex gap-1 bg-stone-100 p-1 rounded-xl w-full md:w-auto">
          <button v-for="f in filters" :key="f" @click="activeFilter = f"
            :class="['flex-1 md:flex-none px-3 py-1.5 text-xs font-black rounded-lg transition-all', 
            activeFilter === f ? 'bg-white text-black shadow-sm' : 'text-stone-400 hover:text-stone-600']">
            {{ f }}
          </button>
        </div>
      </div>
    </div>

    <div id="msg-container" class="flex-1 overflow-y-auto p-6 space-y-6 bg-stone-50/30 scroll-smooth">
      <div v-if="isLoading && state.feedMessages.length === 0" class="flex flex-col items-center justify-center h-full text-stone-400 animate-pulse">
        <p class="font-black italic text-sm">基地連線中...</p>
      </div>

      <div v-for="msg in filteredMessages" :key="msg.id" class="animate-[fadeIn_0.3s_ease-out]">
        
        <div v-if="['chat', 'official', 'memoir'].includes(msg.type)" 
             :class="['max-w-[85%] p-4 rounded-2xl shadow-sm relative group', 
             msg.type === 'official' ? 'bg-stone-900 text-white border-l-4 border-yellow-400' : 
             msg.type === 'memoir' ? 'bg-indigo-50 border border-indigo-100 text-stone-800' : 'bg-white border border-stone-200 text-stone-700']">
          
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs font-black" :class="msg.type === 'official' ? 'text-yellow-400' : 'text-stone-900'">
              {{ msg.profiles?.username || '未知探員' }}
            </span>
            <span class="text-[10px] opacity-40 font-bold">{{ formatTime(msg.created_at) }}</span>
            <span v-if="msg.type === 'memoir'" class="text-[9px] font-black bg-indigo-200 text-indigo-700 px-1.5 py-0.5 rounded-full uppercase">回憶錄</span>
          </div>
          
          <p class="text-sm leading-relaxed whitespace-pre-wrap">{{ msg.content }}</p>
        </div>

        <div v-else class="flex items-center gap-4 py-2 opacity-60 hover:opacity-100 transition-opacity">
          <div class="h-[1px] flex-1 bg-stone-200"></div>
          <div class="flex items-center gap-2 text-[10px] font-bold text-stone-400 uppercase tracking-tighter whitespace-nowrap">
            <span>{{ msg.type === 'transaction' ? '💸 TX' : '⚙️ SYS' }}</span>
            <span class="text-stone-500">{{ msg.content }}</span>
            <span>{{ formatTime(msg.created_at) }}</span>
          </div>
          <div class="h-[1px] flex-1 bg-stone-200"></div>
        </div>

      </div>
    </div>

    <div class="p-4 bg-white border-t border-stone-100 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
      <div class="flex gap-2 max-w-4xl mx-auto w-full">
        <input v-model="inputMsg" @keyup.enter="sendMsg" 
               :placeholder="activeFilter === '回憶錄' ? '這格是篩選，請到典藏館發表回憶錄...' : '在此輸入通訊內容...'" 
               :disabled="activeFilter === '回憶錄'"
               class="flex-1 bg-stone-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-black outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed" />
        <button @click="sendMsg" 
                :disabled="activeFilter === '回憶錄' || !inputMsg.trim()"
                class="bg-black text-white px-6 py-3 rounded-xl font-black text-sm hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100">
          傳送
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { state } from '../store.js';
import { supabase } from '../supabase.js';

const activeFilter = ref('全部');
const filters = ['全部', '聊天', '交易', '官方', '回憶錄'];
const inputMsg = ref('');
const isLoading = ref(false);
let subscription = null;

// 自動捲動到底部的工具
const scrollToBottom = async () => {
  await nextTick();
  const container = document.getElementById('msg-container');
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
};

// === 1. 初始化讀取資料庫 (優化版) ===
const fetchMessages = async () => {
  isLoading.value = true;
  
  // 這裡使用了修正後的關聯查詢
  const { data, error } = await supabase
    .from('feed_messages')
    .select(`
      *,
      profiles:user_id ( username )
    `)
    .order('created_at', { ascending: true });

  if (error) {
    console.error("❌ 抓取失敗：", error.message);
    isLoading.value = false;
    return;
  }

  // 將資料存入全域 state 以便持久化
  state.feedMessages = data;
  isLoading.value = false;
  scrollToBottom();
};

// === 2. 設定即時監聽 (Realtime) ===
const setupRealtime = () => {
  subscription = supabase
    .channel('public:feed_messages')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'feed_messages' }, async (payload) => {
      // 收到新訊息時，抓取對應的使用者名稱
      const { data: userData } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', payload.new.user_id)
        .single();
      
      const newMessage = { ...payload.new, profiles: userData };
      
      // 更新全域狀態
      state.feedMessages.push(newMessage);
      scrollToBottom();
    })
    .subscribe();
};

onMounted(async () => {
  // 先顯示 store 裡的舊資料（如果有的話），然後才抓新的
  if (state.feedMessages.length === 0) {
    await fetchMessages();
  } else {
    // 即使有舊資料，背景也偷偷更新一下
    fetchMessages();
  }
  setupRealtime();
});

onUnmounted(() => {
  if (subscription) supabase.removeChannel(subscription);
});

// === 3. 篩選邏輯 (對接 state.feedMessages) ===
const filteredMessages = computed(() => {
  const all = state.feedMessages;
  if (activeFilter.value === '聊天') return all.filter(m => m.type === 'chat');
  if (activeFilter.value === '官方') return all.filter(m => m.type === 'official');
  if (activeFilter.value === '交易') return all.filter(m => m.type === 'transaction' || m.type === 'system');
  if (activeFilter.value === '回憶錄') return all.filter(m => m.type === 'memoir');
  return all;
});

// === 4. 發送聊天訊息 ===
const sendMsg = async () => {
  if (!inputMsg.value.trim() || activeFilter.value === '回憶錄') return;

  const { error } = await supabase.from('feed_messages').insert([
    {
      user_id: state.currentUser.id,
      type: 'chat',
      content: inputMsg.value,
      seller_name: state.currentUser.name,
    }
  ]);

  if (error) {
    alert("傳送失敗：" + error.message);
  } else {
    inputMsg.value = '';
  }
};

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const date = new Date(timeStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 自定義捲動條 */
#msg-container::-webkit-scrollbar {
  width: 5px;
}
#msg-container::-webkit-scrollbar-track {
  background: transparent;
}
#msg-container::-webkit-scrollbar-thumb {
  background: #e7e5e4;
  border-radius: 10px;
}
</style>