<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center px-4 bg-stone-900/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
    <div class="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
      
      <div class="p-6 border-b border-stone-100 bg-stone-50 flex justify-between items-center shrink-0">
        <div>
          <span class="px-2 py-1 bg-stone-200 text-stone-600 text-[10px] font-black rounded-md mb-2 inline-block">加值中心</span>
          <h2 class="text-xl font-black text-stone-900">補充 PTS 星幣</h2>
        </div>
        <button @click="$emit('close')" class="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center hover:bg-stone-300 transition-colors">
          <span class="text-stone-500 font-black">✕</span>
        </button>
      </div>

      <div class="p-6 space-y-6">
        <div>
          <label class="block text-xs font-black text-stone-500 mb-2">儲值金額 (TWD)</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-black">NT$</span>
            <input 
              v-model="amount" 
              type="number" 
              placeholder="1000" 
              class="w-full border border-stone-300 rounded-xl pl-12 pr-4 py-3 text-stone-900 font-black text-lg focus:outline-none focus:border-stone-900 transition-colors"
            >
          </div>
          <p class="text-[10px] text-stone-400 mt-2 font-bold text-right">兌換比例：1 TWD = 1 PTS</p>
        </div>

        <div>
          <label class="block text-xs font-black text-stone-500 mb-2">選擇支付方式</label>
          <div class="grid grid-cols-2 gap-3">
            <button 
              v-for="method in paymentMethods" 
              :key="method.id" 
              @click="selectedMethod = method.id"
              :class="[
                'p-4 rounded-xl border-2 text-left transition-all group', 
                selectedMethod === method.id ? 'border-stone-900 bg-stone-50 shadow-sm' : 'border-stone-100 hover:border-stone-300'
              ]"
            >
              <div class="font-black text-stone-900 text-sm mb-1 group-hover:text-stone-700">{{ method.name }}</div>
              <div class="text-[10px] text-stone-500 font-bold">{{ method.desc }}</div>
            </button>
          </div>
        </div>
      </div>

      <div class="p-4 border-t border-stone-100 bg-stone-50 flex justify-end gap-3 shrink-0">
        <button @click="$emit('close')" class="px-6 py-2.5 rounded-xl font-black text-stone-500 hover:bg-stone-200 transition-colors text-sm">
          取消
        </button>
        <button 
          @click="processPayment" 
          :disabled="!amount || !selectedMethod" 
          class="px-6 py-2.5 rounded-xl font-black bg-stone-900 text-white hover:bg-stone-800 transition-all text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span v-if="isProcessing" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          {{ isProcessing ? '處理中...' : '前往付款' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { state, logAction } from '../store.js'; // 引入全域狀態以便加分

const emit = defineEmits(['close']);
const amount = ref('');
const selectedMethod = ref('');
const isProcessing = ref(false);

const paymentMethods = [
  { id: 'credit_card', name: '💳 信用卡', desc: 'VISA / Mastercard / JCB' },
  { id: 'line_pay', name: '📱 LINE Pay', desc: '可使用 Points 折抵' },
  { id: 'apple_pay', name: '🍎 Apple Pay', desc: '快速安全支付' },
  { id: 'jko_pay', name: '🟢 街口支付', desc: '支援銀行帳戶扣款' }
];

const processPayment = () => {
  if (!amount.value || amount.value <= 0) {
    alert("請輸入有效的金額！");
    return;
  }
  
  isProcessing.value = true;
  
  // 這裡模擬串接綠界或藍新金流的等待時間 (0.8秒)
  setTimeout(() => {
    const addedPts = parseInt(amount.value);
    state.balance += addedPts; // 增加使用者的 PTS 餘額
    
    // 如果你有寫紀錄 action 的函數，這裡也可以觸發
    if (typeof logAction === 'function') {
      logAction(`使用 ${paymentMethods.find(m => m.id === selectedMethod.value).name} 儲值 ${addedPts} PTS`, true);
    }
    
    alert(`✅ 交易成功！已將 ${addedPts} PTS 匯入您的帳戶。`);
    isProcessing.value = false;
    emit('close'); // 關閉 Modal
  }, 800);
};
</script>