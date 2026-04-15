<template>
  <div class="glass p-10 rounded-3xl border border-stone-200/50 shadow-2xl max-w-sm w-full relative overflow-hidden animate-[fadeIn_0.5s_ease-out]">
    <div class="absolute top-0 left-0 w-full h-1 bg-stone-900"></div>
    
    <div class="text-center mb-8">
      <h2 class="text-3xl font-black text-stone-900 italic tracking-tighter uppercase mb-1">
        Moon Base
      </h2>
      <p class="text-[10px] font-black text-stone-400 tracking-widest uppercase">
        {{ isRegister ? 'New Agent Registration' : 'Agent Authorization' }}
      </p>
    </div>

    <form @submit.prevent="handleAuth" class="space-y-4">
      <div>
        <label class="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-1">Comm Link (Email)</label>
        <input v-model="email" type="email" required placeholder="agent@moon.com"
          class="w-full bg-white/50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-bold text-stone-700 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-all">
      </div>
      
      <div>
        <label class="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-1">Passcode (Password)</label>
        <input v-model="password" type="password" required placeholder="••••••••"
          class="w-full bg-white/50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-bold text-stone-700 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-all">
      </div>

      <div v-if="isRegister" class="space-y-4 animate-[fadeIn_0.3s_ease-out]">
        <div>
          <label class="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-1">Mobile (手機號碼)</label>
          <input v-model="phone" type="tel" required placeholder="0912345678"
            class="w-full bg-white/50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-bold text-stone-700 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-all">
        </div>
        <div>
          <label class="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-1">Identity Code (身分證字號)</label>
          <input v-model="idNumber" type="text" required placeholder="A123456789"
            class="w-full bg-white/50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-bold text-stone-700 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-all">
        </div>
      </div>

      <button type="submit" :disabled="loading"
        class="w-full bg-stone-900 text-white font-black text-xs px-4 py-3.5 rounded-xl hover:bg-stone-800 hover:scale-[0.98] transition-all disabled:opacity-50 mt-4">
        {{ loading ? '連線中...' : (isRegister ? '建立探員檔案' : '授權登入') }}
      </button>
    </form>

    <div class="mt-6 text-center">
      <button @click="isRegister = !isRegister" type="button" class="text-[10px] font-black text-stone-500 hover:text-stone-900 transition-colors uppercase underline underline-offset-4">
        {{ isRegister ? '已有通行證？切換至登入' : '尚未註冊？申請探員資格' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { state, logAction } from '../store.js';
import { supabase } from '../supabase.js';

const email = ref('');
const password = ref('');
const phone = ref('');      // 🌟 新增
const idNumber = ref('');   // 🌟 新增
const isRegister = ref(false);
const loading = ref(false);

const handleAuth = async () => {
  loading.value = true;

  try {
    if (isRegister.value) {
      // 🚀 執行註冊 (包含額外 metadata)
      const { data, error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
        options: {
          data: {
            phone: phone.value,
            id_number: idNumber.value
          }
        }
      });

      if (error) throw error;
      
      alert("🎉 註冊成功！探員資料已建檔，請登入。");
      isRegister.value = false;
      password.value = '';

    } else {
      // 🚀 執行登入 (維持原樣)
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      });

      if (error) throw error;

      state.isLoggedIn = true;
      state.currentUser.id = data.user.id; // 重要：存入 ID
      state.currentUser.email = data.user.email;
      
      // 從 metadata 或 profiles 抓取暱稱 (這裡先用 email 預設)
      state.currentUser.name = data.user.user_metadata?.username || data.user.email.split('@')[0]; 
      
      logAction(`[AUTH] 探員 ${state.currentUser.name} 已上線`, true);
    }
  } catch (error) {
    alert("❌ 授權失敗：" + error.message);
  } finally {
    loading.value = false;
  }
};
</script>