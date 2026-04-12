<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-[fadeIn_0.3s_ease-out] p-4">
    <div class="relative w-full max-w-md animate-[slideUp_0.4s_ease-out]">
      
      <button @click="closeModal" class="absolute -top-12 right-0 text-white/70 hover:text-white text-4xl font-light z-50 transition-colors">
        &times;
      </button>

      <div class="glass p-6 rounded-3xl shadow-2xl border border-white/20 relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full bg-green-500/20 border-b border-green-500/30 text-green-400 text-[10px] font-black text-center py-2 tracking-widest">
          🔒 SOULBOUND TOKEN (SBT) 已綁定
        </div>

        <div class="mt-8 text-center">
          <h3 class="text-2xl font-black text-stone-900">{{ state.selectedTicket }}</h3>
          <p class="text-stone-500 text-xs font-bold mt-1">持票人：{{ state.currentUser.name || '探員' }}</p>
        </div>

        <div class="my-6 flex flex-col items-center">
          <div class="relative w-44 h-44 bg-white p-2 rounded-2xl shadow-inner border-4 border-stone-100 overflow-hidden">
            <div class="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMWMxOTE3IiBvcGFjaXR5PSIwLjgiLz4KPC9zdmc+')] opacity-80"></div>
            <div class="absolute top-0 left-0 w-full h-1 bg-green-400 shadow-[0_0_15px_3px_rgba(74,222,128,0.6)] animate-scan"></div>
          </div>
          <div class="mt-4 bg-stone-100 px-4 py-1.5 rounded-full border border-stone-200">
            <span class="text-[10px] font-black text-stone-600">憑證更新中：{{ countdown }}s</span>
          </div>
        </div>

        <div class="border-t border-stone-200/50 pt-6 space-y-3">
          <p class="text-[10px] font-black text-stone-400 uppercase tracking-widest text-center mb-2">Smart Contract Actions</p>
          
          <button @click="handleTransfer" class="w-full bg-stone-900 text-white text-xs font-black py-3 rounded-xl hover:bg-stone-800 transition-all flex items-center justify-center gap-2">
            <span>🔗</span> 指定親友轉讓 (扣 5% 手續費)
          </button>
          
          <button @click="handleRelease" class="w-full bg-white border border-stone-200 text-stone-700 text-xs font-black py-3 rounded-xl hover:bg-stone-50 transition-all flex items-center justify-center gap-2">
            <span>♻️</span> 官方退票釋出 (扣 5% 手續費)
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { state, logAction } from '../store.js';

const countdown = ref(30);
let timer;

onMounted(() => {
  timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) countdown.value = 30;
  }, 1000);
});

onUnmounted(() => clearInterval(timer));

const closeModal = () => {
  state.showTicketModal = false;
  state.selectedTicket = null;
};

// 3. 修正：點擊自動複製功能
const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text);
  alert("📋 候補碼已複製到剪貼簿！");
};

// 2. 修正：退款邏輯 (回到錢包 + 扣手續費)
const processRefund = (price = 150) => {
  const fee = price * 0.05;
  const refundAmount = price - fee;
  state.balance += refundAmount; // 款項回到錢包
  return { refundAmount, fee };
};

const handleTransfer = () => {
  if (confirm('【合約確認】\n銷毀票券後將退還 95% 款項至錢包，並生成候補碼。確定執行？')) {
    const { refundAmount } = processRefund(150); // 假設票價 150
    const code = "MOON-" + Math.random().toString(36).substr(2, 9).toUpperCase();
    removeTicket();
    
    // 彈窗顯示並提供複製
    const wantsCopy = confirm(`✅ 退款 ${refundAmount} PTS 已入帳。\n專屬候補碼：${code}\n\n點擊「確定」立即複製候補碼。`);
    if (wantsCopy) copyToClipboard(code);
    
    logAction(`[CONTRACT] 指定轉讓，退回 ${refundAmount} PTS`, true);
    closeModal();
  }
};

const handleRelease = () => {
  if (confirm('【合約確認】\n銷毀票券並釋出座位，將退還 95% 款項。確定執行？')) {
    const { refundAmount } = processRefund(150);
    removeTicket();
    alert(`♻️ 票券已釋出，${refundAmount} PTS 已退還至錢包。`);
    logAction(`[CONTRACT] 釋出票券，退回 ${refundAmount} PTS`, true);
    closeModal();
  }
};

const removeTicket = () => {
  const index = state.myTickets.indexOf(state.selectedTicket);
  if (index > -1) state.myTickets.splice(index, 1);
};
</script>

<style scoped>
@keyframes scan { 0% { top: 0%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
.animate-scan { animation: scan 2s ease-in-out infinite; }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
</style>