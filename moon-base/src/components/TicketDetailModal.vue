<template>
  <div class="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" @click.self="emit('close')">
    
    <div class="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
      
      <button @click="emit('close')" class="absolute top-4 right-4 w-8 h-8 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center text-white transition-colors z-50">
        <span class="text-lg leading-none font-bold mt-[-2px]">✕</span>
      </button>

      <div class="bg-stone-900 pt-8 pb-6 px-6 text-center text-white relative shrink-0">
        <p class="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Valid Ticket</p>
        <h3 class="text-xl font-black leading-tight">{{ ticket.name }}</h3>
      </div>

      <div class="p-6 space-y-6 overflow-y-auto">
        
        <div class="text-center">
          <p class="text-xs text-stone-400 font-bold">持票探員 (Agent)</p>
          <p class="text-lg font-black text-stone-900">{{ state.currentUser.name || state.currentUser.email }}</p>
        </div>

        <div class="flex flex-col items-center justify-center bg-stone-50 p-4 rounded-2xl border border-stone-100">
          <div class="w-40 h-40 bg-stone-900 rounded-xl mb-3 flex items-center justify-center relative overflow-hidden shadow-inner">
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
              placeholder="輸入對方信箱" 
              class="flex-1 bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-stone-900"
            />
            <button 
              @click="handleTransfer" 
              class="bg-stone-900 text-white px-4 py-2 rounded-lg text-xs font-black hover:bg-stone-700 transition-colors"
            >
              送出
            </button>
          </div>
          <div v-if="generatedCodeDisplay" class="mt-3 p-3 bg-green-100 border border-green-300 rounded-lg text-center cursor-pointer hover:bg-green-200 transition" @click="copyCode">
            <p class="text-[10px] text-green-700 font-bold mb-1">✅ 驗證成功！(點擊複製)</p>
            <p class="text-lg font-black text-green-800 tracking-widest">{{ generatedCodeDisplay }}</p>
          </div>
        </div>

        <button 
          @click="handleRefund"
          class="w-full bg-white border-2 border-stone-200 text-stone-500 text-xs font-black py-3 rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors"
        >
          官方退票釋出 (收取5%手續費，退回 95%)
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// (這裡保留你原本 TicketDetailModal.vue 的 <script setup> 邏輯，完全不用動！)
import { ref, onMounted, onUnmounted, defineProps, defineEmits } from 'vue';
import { state, logAction } from '../store.js';
import { supabase } from '../supabase.js';

const props = defineProps({ ticket: Object });
const emit = defineEmits(['close']);

const transferEmailInput = ref('');
const generatedCodeDisplay = ref('');
const refreshCountdown = ref(30);
let timerInterval = null;

onMounted(() => {
  timerInterval = setInterval(() => {
    refreshCountdown.value--;
    if (refreshCountdown.value <= 0) refreshCountdown.value = 30;
  }, 1000);
});

onUnmounted(() => clearInterval(timerInterval));

const copyCode = () => {
  navigator.clipboard.writeText(generatedCodeDisplay.value);
  alert("📋 候補碼已複製到剪貼簿！");
};

const removeTicketAndRefund = async () => {
  const ticketPrice = Number(props.ticket.price);
  const fee = ticketPrice * 0.05;
  const refundAmount = ticketPrice - fee;

  const updatedTickets = state.myTickets.filter(t => t.serial !== props.ticket.serial);
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

  state.myTickets = updatedTickets;
  state.balance = newBalance;
  return refundAmount;
};

const handleRefund = async () => {
  const fee = Number(props.ticket.price) * 0.05;
  const refundAmount = Number(props.ticket.price) - fee;
  if(!confirm(`【官方退票】\n票券：${props.ticket.name}\n將收取 5% 手續費 (${fee} PTS)\n您將退回：${refundAmount} PTS 到您的帳戶\n確定要退票嗎？`)) return;

  const successAmount = await removeTicketAndRefund();
  if (successAmount !== false) {
    const { data: stockData } = await supabase.from('global_tickets').select('remaining').eq('ticket_name', props.ticket.name).single();
    if (stockData) await supabase.from('global_tickets').update({ remaining: stockData.remaining + 1 }).eq('ticket_name', props.ticket.name);
    
    alert(`✅ 退票成功！已扣除 5% 手續費，成功將 ${successAmount} PTS 退回至您的帳戶。`);
    logAction(`官方退票 ${props.ticket.serial}，退回 ${successAmount} PTS`, true);
    emit('close'); 
  }
};

const handleTransfer = async () => {
  const targetEmail = transferEmailInput.value.trim().toLowerCase();
  if (!targetEmail) return alert("請輸入對方的信箱！");
  if (targetEmail === state.currentUser.email.toLowerCase()) return alert("❌ 不能轉讓給自己！");

  const { data: targetUser, error: searchError } = await supabase.from('profiles').select('email').ilike('email', targetEmail).maybeSingle();
  if (searchError || !targetUser) return alert("⚠️ 系統警告：無此帳戶！\n請確認親友是否已註冊，或信箱是否輸入正確。");

  const fee = Number(props.ticket.price) * 0.05;
  const refundAmount = Number(props.ticket.price) - fee;
  if (!confirm(`【帳戶驗證成功】\n確定要轉讓給 ${targetUser.email} 嗎？\n這將收取 5% 手續費，退款 ${refundAmount} PTS。\n(對方須使用候補碼購買)`)) return;

  const candidateCode = 'CODE-' + Math.random().toString(36).substr(2, 8).toUpperCase();
  const safeSerialNumber = props.ticket.serial || 'LEGACY-TICKET-NO-SERIAL';

  const { error: codeError } = await supabase.from('ticket_codes').insert([{
    code: candidateCode, target_email: targetUser.email, ticket_name: props.ticket.name,
    original_price: Number(props.ticket.price), serial_number: safeSerialNumber, is_used: false
  }]);

  if (codeError) return alert("⚠️ 產生候補碼失敗。");

  const successAmount = await removeTicketAndRefund();
  if (successAmount !== false) {
    generatedCodeDisplay.value = candidateCode;
    transferEmailInput.value = ''; 
    alert(`✅ 轉讓手續完成！\n已退回 ${successAmount} PTS。\n請複製畫面上的候補碼交給親友！`);
    logAction(`產生候補碼 ${candidateCode} 給 ${targetUser.email}`, true);
  }
};
</script>

<style>
@keyframes scan {
  0% { transform: translateY(-100%); }
  50% { transform: translateY(4000%); }
  100% { transform: translateY(-100%); }
}
</style>