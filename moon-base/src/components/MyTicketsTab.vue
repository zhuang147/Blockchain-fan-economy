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
          @click="openTicketModal(ticket)"
          class="bg-stone-900 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden group transition-all cursor-pointer hover:scale-[1.02]"
        >
          <div class="absolute -right-4 -top-4 w-16 h-16 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all"></div>
          <p class="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Verified NFT (SBT)</p>
          
          <h3 class="text-xl font-black mb-1">{{ ticket.name }}</h3>
          
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

    <div v-if="activeTicket" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div class="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl relative flex flex-col">
        
        <button @click="closeTicketModal" class="absolute top-4 right-4 w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center text-stone-500 hover:bg-stone-200 transition-colors z-10">
          ✕
        </button>

        <div class="bg-stone-900 p-6 text-center text-white">
          <p class="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Valid Ticket</p>
          <h3 class="text-xl font-black">{{ activeTicket.name }}</h3>
        </div>

        <div class="p-6 space-y-6 flex-1 overflow-y-auto">
          <div class="text-center">
            <p class="text-xs text-stone-400 font-bold">持票探員 (Agent)</p>
            <p class="text-lg font-black text-stone-900">{{ state.currentUser.name || state.currentUser.email }}</p>
          </div>

          <div class="flex flex-col items-center justify-center bg-stone-50 p-4 rounded-2xl border border-stone-100">
            <div class="w-40 h-40 bg-stone-900 rounded-xl mb-3 flex items-center justify-center relative overflow-hidden">
              <div class="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg')] bg-cover opacity-80 mix-blend-screen"></div>
              <div class="absolute top-0 left-0 w-full h-1 bg-green-400 animate-[scan_2s_ease-in-out_infinite]"></div>
            </div>
            <p class="text-xs font-bold text-stone-500 flex items-center gap-1">
              <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              憑證動態更新: 還有 <span class="text-stone-900 font-black">{{ refreshCountdown }}</span> 秒
            </p>
          </div>

          <hr class="border-stone-100" />

          <div class="bg-stone-50 p-4 rounded-xl border border-stone-200">
            <p class="text-xs font-black text-stone-700 mb-2">指定親友轉讓 (收取5%手續費)</p>
            <div class="flex gap-2">
              <input 
                v-model="transferEmailInput" 
                placeholder="輸入對方註冊信箱" 
                class="flex-1 bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-stone-900"
              />
              <button 
                @click="handleTransfer(activeTicket)" 
                class="bg-stone-900 text-white px-3 py-2 rounded-lg text-xs font-black hover:bg-stone-700 transition-colors"
              >
                送出
              </button>
            </div>
            <div v-if="generatedCodeDisplay" class="mt-3 p-3 bg-green-100 border border-green-300 rounded-lg text-center">
              <p class="text-[10px] text-green-700 font-bold mb-1">✅ 驗證成功！請交給親友此候補碼：</p>
              <p class="text-lg font-black text-green-800 tracking-widest">{{ generatedCodeDisplay }}</p>
            </div>
          </div>

          <button 
            @click="handleRefund(activeTicket)"
            class="w-full bg-white border-2 border-stone-200 text-stone-500 text-xs font-black py-3 rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors"
          >
            官方退票釋出 (收取5%手續費，退回 95%)
          </button>
        </div>
      </div>
    </div>
    
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue';
import { state, logAction } from '../store.js';
import { supabase } from '../supabase.js';

// Modal 控制狀態
const activeTicket = ref(null);
const transferEmailInput = ref('');
const generatedCodeDisplay = ref('');
const refreshCountdown = ref(30);
let timerInterval = null;

// 開啟與關閉 Modal
const openTicketModal = (ticket) => {
  activeTicket.value = ticket;
  transferEmailInput.value = '';
  generatedCodeDisplay.value = '';
  startTimer();
};

const closeTicketModal = () => {
  activeTicket.value = null;
  clearInterval(timerInterval);
};

// 模擬 QR Code 倒數計時器
const startTimer = () => {
  refreshCountdown.value = 30;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    refreshCountdown.value--;
    if (refreshCountdown.value <= 0) refreshCountdown.value = 30; // 歸零後重置
  }, 1000);
};

onUnmounted(() => {
  clearInterval(timerInterval);
});

// 共同邏輯：移除票券並更新資料庫 (包含退款 95%)
const removeTicketAndRefund = async (ticket) => {
  const ticketPrice = Number(ticket.price);
  const fee = ticketPrice * 0.05; // 5% 手續費
  const refundAmount = ticketPrice - fee; // 退回 95%

  // 過濾掉這張特定序號的票
  const updatedTickets = state.myTickets.filter(t => t.serial !== ticket.serial);
  
  // 💡 修正 3：加上 Number() 強制轉換為數字，防止字串相加 (例如 "100" + 95)
  const currentBalance = Number(state.balance) || 0;
  const newBalance = currentBalance + refundAmount;

  const { error } = await supabase
    .from('profiles')
    .update({ balance: newBalance, my_tickets: updatedTickets })
    .eq('id', state.currentUser.id);

  if (error) {
    alert("⚠️ 同步資料庫失敗，請重試！");
    return false;
  }

  // 更新前端錢包與票匣
  state.myTickets = updatedTickets;
  state.balance = newBalance;
  return refundAmount;
};

// 【功能 1：官方退票】
const handleRefund = async (ticket) => {
  const fee = Number(ticket.price) * 0.05;
  const refundAmount = Number(ticket.price) - fee;
  
  if(!confirm(`【官方退票】\n票券：${ticket.name}\n將收取 5% 手續費 (${fee} PTS)\n您將退回：${refundAmount} PTS 到您的帳戶\n確定要退票嗎？`)) return;

  const successAmount = await removeTicketAndRefund(ticket);
  
  if (successAmount !== false) {
    // 釋出票：將 1 張票還給官方票池
    const { data: stockData } = await supabase.from('global_tickets').select('remaining').eq('ticket_name', ticket.name).single();
    if (stockData) {
      await supabase.from('global_tickets').update({ remaining: stockData.remaining + 1 }).eq('ticket_name', ticket.name);
    }
    
    alert(`✅ 退票成功！已扣除 5% 手續費，成功將 ${successAmount} PTS 退回至您的帳戶。`);
    logAction(`官方退票 ${ticket.serial}，退回 ${successAmount} PTS`, true);
    closeTicketModal(); // 退票成功後自動關閉視窗
  }
};

// 【功能 2：指定親友轉讓】
const handleTransfer = async (ticket) => {
  const targetEmail = transferEmailInput.value.trim().toLowerCase();
  
  if (!targetEmail) return alert("請輸入對方的信箱！");
  if (targetEmail === state.currentUser.email.toLowerCase()) return alert("❌ 不能轉讓給自己！");

  console.log(`🔍 正在資料庫中尋找探員信箱：${targetEmail}...`);

  // 1. 搜尋對方帳戶
  const { data: targetUser, error: searchError } = await supabase
    .from('profiles')
    .select('email')
    .ilike('email', targetEmail) 
    .maybeSingle();

  if (searchError) {
    console.error("資料庫查詢發生錯誤:", searchError);
    return alert("⚠️ 資料庫連線異常，請打開 F12 查看錯誤訊息。");
  }

  if (!targetUser) {
    return alert("⚠️ 系統警告：無此帳戶！\n請確認親友是否已註冊，或信箱是否輸入正確。");
  }

  const fee = Number(ticket.price) * 0.05;
  const refundAmount = Number(ticket.price) - fee;

  if (!confirm(`【帳戶驗證成功】\n確定要將這張票轉讓給 ${targetUser.email} 嗎？\n這將收取 5% 手續費，您會先收到 ${refundAmount} PTS 的退款。\n(對方須使用候補碼以原價購買)`)) return;

  // 2. 準備寫入資料
  const candidateCode = 'CODE-' + Math.random().toString(36).substr(2, 8).toUpperCase();
  const safeSerialNumber = ticket.serial || 'LEGACY-TICKET-NO-SERIAL'; // 防呆：處理舊票券沒序號的問題

  // 3. 寫入候補碼資料庫 (注意：這裡只會宣告一次 codeError)
  const { error: codeError } = await supabase.from('ticket_codes').insert([{
    code: candidateCode,
    target_email: targetUser.email,
    ticket_name: ticket.name,
    original_price: Number(ticket.price),
    serial_number: safeSerialNumber,
    is_used: false
  }]);

  if (codeError) {
    console.error("寫入候補碼失敗的真正原因:", codeError.message, codeError.details); 
    return alert("⚠️ 產生候補碼失敗，請打開 F12 查看錯誤訊息。");
  }

  // 4. A 扣除該張票，並獲得 95% 退款回帳戶
  const successAmount = await removeTicketAndRefund(ticket);

  if (successAmount !== false) {
    generatedCodeDisplay.value = candidateCode;
    transferEmailInput.value = ''; 
    
    alert(`✅ 轉讓手續完成！\n已退回 ${successAmount} PTS 至您的帳戶。\n請將畫面上的候補碼交給您的親友！`);
    logAction(`產生候補碼 ${candidateCode} 給 ${targetUser.email}`, true);
  }
};

// 判定是否持有特權票
const hasLuminousSilence = computed(() => {
  return state.myTickets.some(ticket => 
    ticket.name && (ticket.name.includes('VIP') || ticket.name.includes('一般票') || ticket.name.includes('會發光的安靜'))
  );
});

// 開啟影片 Modal
const openVideo = () => {
  if (hasLuminousSilence.value) {
    state.showVideoModal = true; // 需確保外層 App.vue 仍支援此狀態
    logAction("進入後台花絮區", true);
  }
};
</script>

<style>
/* 簡單的 QR Code 掃描線動畫 */
@keyframes scan {
  0% { transform: translateY(-100%); }
  50% { transform: translateY(4000%); }
  100% { transform: translateY(-100%); }
}
</style>