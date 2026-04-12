<template>
  <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-[fadeIn_0.3s_ease-out] p-4">
    
    <div class="relative w-full max-w-4xl animate-[slideUp_0.4s_ease-out]">
      
      <button 
        @click="state.showVideoModal = false" 
        class="absolute -top-12 right-0 text-white/50 hover:text-white text-4xl font-light transition-colors"
      >
        &times;
      </button>

      <div class="bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
        
        <div class="aspect-video bg-black flex items-center justify-center">
          <iframe 
            class="w-full h-full" 
            src="https://www.youtube.com/embed/Sz7HUZMXz9c?si=B5lxsBn1_PZwjH0Q" 
            title="Moon Group Behind The Scenes"
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
          </iframe>
        </div>

        <div class="p-6 text-center bg-gradient-to-b from-stone-900 to-black">
            <div class="flex items-center justify-center gap-2 mb-2">
                <span class="px-2 py-0.5 bg-gold-500/20 text-yellow-500 text-[10px] font-black rounded border border-yellow-500/30">PREMIUM CONTENT</span>
            </div>
            <h3 class="text-white font-black text-xl tracking-tight">《會發光的安靜》巡迴後台花絮</h3>
            <p class="text-stone-500 text-sm mt-1 font-bold italic">僅限「月亮忘了關燈」官方持票探員觀賞</p>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { state } from '../store.js';
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>