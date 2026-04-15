<template>
  <div class="space-y-6">
    <div class="glass p-6 rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50/50">
      <p class="text-[10px] font-black text-stone-500 uppercase tracking-widest mb-3">Secret Code Redemption (候補碼兌換)</p>
      <div class="flex flex-col sm:flex-row gap-2">
        <input 
          v-model="inputCode" 
          placeholder="輸入專屬候補碼 (例如: CODE-XXXX)" 
          class="flex-1 bg-white border border-stone-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-stone-900"
        />
        <button @click="handleCodeRedeem" class="bg-stone-900 text-white px-6 py-2 rounded-lg text-xs font-black hover:bg-stone-700 transition-all shadow-md">
          識別並兌換
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div v-for="ticket in availableTickets" :key="ticket.name" 
           class="glass p-6 rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
        <div class="relative z-10">
          <div class="flex justify-between items-start mb-4">
            <span class="text-3xl">{{ ticket.icon }}</span>
            <div class="text-right">
              <span class="bg-stone-100 text-[10px] font-black px-2 py-1 rounded tracking-tighter">{{ ticket.type }}</span>
              <p class="text-xs font-bold text-stone-500 mt-2">剩餘: <span class="text-stone-900">{{ globalStock[ticket.name] ?? '--' }}</span> 張</p>
            </div>
          </div>
          
          <h3 class="text-xl font-black text-stone-900 mb-1">{{ ticket.name }}</h3>
          <p class="text-xs text-stone-500 mb-6 leading-relaxed">{{ ticket.desc }}</p>
          
          <div class="flex flex-col gap-4">
            <div class="flex items-center justify-between border-t border-stone-100 pt-4">
              <label class="text-xs font-bold text-stone-500">購買張數:</label>
              <select v-model="selectedQuantity[ticket.name]" class="bg-white border border-stone-200 rounded-lg px-2 py-1 text-sm font-black focus:outline-none">
                <option :value="1">1 張</option>
                <option :value="2">2 張</option>
                <option :value="3">3 張</option>
                <option :value="4">4 張</option>
              </select>
            </div>

            <div class="flex items-center justify-between bg-stone-50 p-3 rounded-xl border border-stone-100">
              <div class="flex items-center gap-1">
                <span class="text-xs text-stone-500 font-bold">總計:</span>
                <span class="text-lg font-black text-stone-900">{{ ticket.price * selectedQuantity[ticket.name] }}</span>
                <span class="text-[10px] font-bold text-stone-400">PTS</span>
              </div>
              <button 
                @click="buyTicket(ticket, selectedQuantity[ticket.name])"
                :disabled="globalStock[ticket.name] <= 0"
                class="px-6 py-2 rounded-xl font-black text-xs transition-all bg-stone-900 text-white hover:scale-[1.02] shadow-lg shadow-stone-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ globalStock[ticket.name] > 0 ? '立即購買' : '已售罄' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { state, logAction } from '../store.js';
import { supabase } from '../supabase.js';

const inputCode = ref('');
const globalStock = ref({});
const selectedQuantity = ref({
  '《會發光的安靜》VIP票': 1,
  '《會發光的安靜》一般票': 1
});

const availableTickets = [
  { name: '《會發光的安靜》VIP票', price: 500, icon: '✨', type: 'VIP ACCESS', desc: '最高權限票券。包含完整花絮內容、數位探員手冊及限定身份標識。' },
  { name: '《會發光的安靜》一般票', price: 200, icon: '🎟️', type: 'STANDARD', desc: '基礎權限票券。可解鎖花絮影片觀看權限，進入基地核心區域。' }
];

// 產生獨立票券序號的輔助函數 (例如: TKT-0412-A8B2)
const generateSerialNumber = () => {
  const datePart = new Date().toISOString().replace(/[-:T.]/g, '').slice(4, 8); // 取月日
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TKT-${datePart}-${randomPart}`;
};

// 載入官方票池剩餘數量
const fetchGlobalStock = async () => {
  const { data } = await supabase.from('global_tickets').select('*');
  if (data) {
    data.forEach(item => {
      globalStock.value[item.ticket_name] = item.remaining;
    });
  }
};

onMounted(() => {
  fetchGlobalStock();
});

// 核心：更新官方庫存 (退票時傳負數即可 + 回去)
const updateGlobalStock = async (ticketName, quantityToDeduct) => {
  const currentStock = globalStock.value[ticketName];
  const newStock = currentStock - quantityToDeduct;
  
  await supabase
    .from('global_tickets')
    .update({ remaining: newStock })
    .eq('ticket_name', ticketName);
    
  globalStock.value[ticketName] = newStock;
};

// 核心：購買與同步 (支援多張購買與轉讓傳承)
const buyTicket = async (ticket, quantity, isRedeeming = false, legacySerial = null) => {
  const totalPrice = ticket.price * quantity;

  // 1. 檢查庫存與餘額
  if (!isRedeeming && globalStock.value[ticket.name] < quantity) {
    alert("❌ 官方庫存不足！");
    return false;
  }

  if (state.balance < totalPrice) {
    alert(`❌ 餘額不足，需要 ${totalPrice} PTS。`);
    return false;
  }

  if (!confirm(`確定花費 ${totalPrice} PTS ${isRedeeming ? '兌換轉讓票' : '購買'} ${quantity} 張「${ticket.name}」嗎？`)) return false;

  // 2. 建立新的票券物件陣列
  const newTickets = [];
  for (let i = 0; i < quantity; i++) {
    newTickets.push({
      serial: legacySerial || generateSerialNumber(),
      name: ticket.name,
      price: ticket.price,
      acquired_at: new Date().toISOString()
    });
  }

  // 3. 更新前端狀態
  const newBalance = state.balance - totalPrice;
  const updatedMyTickets = [...state.myTickets, ...newTickets];

  // 4. 同步到 Supabase Profiles
  const { error } = await supabase
    .from('profiles')
    .update({ balance: newBalance, my_tickets: updatedMyTickets })
    .eq('id', state.currentUser.id);

  if (!error) {
    state.balance = newBalance;
    state.myTickets = updatedMyTickets;

    // 如果是一般購買，扣除官方票池庫存
    if (!isRedeeming) {
      await updateGlobalStock(ticket.name, quantity);
      
      // 🌟 [新增功能] 發送一般購買的廣播訊息
      await supabase.from('feed_messages').insert([
        {
          user_id: state.currentUser.id,
          type: 'transaction',
          content: `探員 ${state.currentUser.name} 購買了 ${quantity} 張「${ticket.name}」門票`,
          metadata: { ticket_name: ticket.name, quantity }
        }
      ]);
    }
    
    logAction(`[SYSTEM] 成功取得 ${quantity} 張 ${ticket.name}`, true);
    alert(`🎉 交易成功！已存入您的數位資產中。`);
    state.activeTab = 'mytickets'; 
    return true;
  } else {
    alert("⚠️ 同步失敗，請稍後再試。");
    return false;
  }
};

// 核心：24小時退票與親友候補碼兌換機制
const handleCodeRedeem = async () => {
  const code = inputCode.value.toUpperCase().trim();
  if (!code) return;

  // 1. 尋找候補碼 (這裡假設 ticket_codes 表有儲存 seller_name)
  const { data, error } = await supabase.from('ticket_codes').select('*').eq('code', code).single();

  if (error || !data) return alert("❌ 找不到此候補碼。");
  if (data.is_used) return alert("❌ 此候補碼已經被兌換過了！");
  
  if (data.target_email.toLowerCase() !== state.currentUser.email.toLowerCase()) {
    return alert("⛔ 權限不足：這個候補碼不是指定給您的信箱！");
  }

  // 2. 【24小時過期判定】
  const now = new Date();
  const createdDate = new Date(data.created_at);
  const hoursDiff = (now - createdDate) / (1000 * 60 * 60);

  if (hoursDiff > 24) {
    alert("⚠️ 您的候補碼已超過 24 小時未兌換！\n此轉讓票券已失效，並流回官方釋出票池中。");
    await supabase.from('ticket_codes').update({ is_used: true }).eq('code', code);
    await updateGlobalStock(data.ticket_name, -1); 
    inputCode.value = '';
    return;
  }

  // 3. 準備票券資料進行購買
  const transferTicketData = { 
    name: data.ticket_name, 
    price: data.original_price 
  };

  // 呼叫購買邏輯
  const isSuccess = await buyTicket(transferTicketData, 1, true, data.serial_number);

  if (isSuccess) {
    // 4. 購買成功後，標記候補碼為已使用
    await supabase.from('ticket_codes').update({ is_used: true }).eq('code', code);
    
    // 🌟 [新增功能] 發送候補碼兌換成功（轉讓成功）的廣播訊息
    // 註：data.seller_name 來自 ticket_codes 資料表
    // 🌟 修正這裡：直接使用資料庫紀錄的賣家暱稱
    // 如果 data.seller_name 真的沒抓到，才退而求其次顯示 "神秘探員"
    const sellerNickname = data.seller_name || "未知探員";

    await supabase.from('feed_messages').insert([
      {
        user_id: state.currentUser.id,
        type: 'transaction',
        content: `探員 ${state.currentUser.name} 使用探員 ${sellerNickname} 的候補碼成功購買「${data.ticket_name}」門票`,
        metadata: { 
          buyer: state.currentUser.name, 
          seller: sellerNickname, 
          ticket_name: data.ticket_name 
        }
      }
    ]);

    inputCode.value = '';
  }
};
</script>