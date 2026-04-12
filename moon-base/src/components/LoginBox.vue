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
        <input 
          v-model="email" 
          type="email" 
          required
          class="w-full bg-white/50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-bold text-stone-700 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-all"
          placeholder="agent@moon.com"
        >
      </div>
      
      <div>
        <label class="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-1">Passcode (Password)</label>
        <input 
          v-model="password" 
          type="password" 
          required
          class="w-full bg-white/50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-bold text-stone-700 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-all"
          placeholder="••••••••"
        >
      </div>

      <button 
        type="submit" 
        :disabled="loading"
        class="w-full bg-stone-900 text-white font-black text-xs px-4 py-3.5 rounded-xl hover:bg-stone-800 hover:scale-[0.98] transition-all disabled:opacity-50 mt-4"
      >
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
import { supabase } from '../supabase.js'; // 🔑 引入我們剛設定好的連線檔案

const email = ref('');
const password = ref('');
const isRegister = ref(false); // 控制畫面顯示登入還是註冊
const loading = ref(false);

const handleAuth = async () => {
  loading.value = true;

  try {
    if (isRegister.value) {
      // 🚀 執行註冊
      const { data, error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
      });

      if (error) throw error;
      
      alert("🎉 註冊成功！請直接登入進入基地。");
      isRegister.value = false; // 切換回登入畫面
      password.value = ''; // 清空密碼欄位

    } else {
      // 🚀 執行登入
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      });

      if (error) throw error;

      // 登入成功，更新全域狀態
      state.isLoggedIn = true;
      state.currentUser.email = data.user.email;
      // 暫時用 Email 的前綴當作名字 (例如 agent@moon.com 名字就是 agent)
      state.currentUser.name = data.user.email.split('@')[0]; 
      
      logAction(`[AUTH] 探員 ${state.currentUser.name} 已上線`, true);
    }
  } catch (error) {
    alert("❌ 授權失敗：" + error.message);
    console.error(error);
  } finally {
    loading.value = false;
  }
};
</script>