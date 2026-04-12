import { reactive } from 'vue';
import { supabase } from './supabase.js';

export const state = reactive({
  isLoggedIn: false,
  currentUser: {
    id: null,
    email: '',
    name: '' 
  },
  balance: 0,
  myTickets: [],
  activeTab: 'base',
  currentBlock: 840000,
  showVideoModal: false,
  showTicketModal: false,
  selectedTicket: null,
  walletAddress: ''
});

// 🚀 強化的資料讀取函數：確保不會因為找不到資料而當機
export const fetchUserProfile = async (userId) => {
  if (!userId) return;

  try {
    // 1. 先嘗試抓取資料
    let { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // 2. 如果找不到資料 (PGRST116) 或資料不存在，就建立一筆
    if (error || !data) {
      console.log("偵測到新探員，正在建立初始檔案...");
      
      // 預設暱稱取 Email 前綴，如果 Email 還沒進來就叫 "New Agent"
      const defaultName = state.currentUser.email ? state.currentUser.email.split('@')[0] : 'New Agent';
      
      const { data: newData, error: insertError } = await supabase
        .from('profiles')
        .upsert([{ 
          id: userId, 
          username: defaultName, 
          balance: 100,
          my_tickets: []
        }], { onConflict: 'id' }) // 如果 ID 衝突就忽略，確保不報錯
        .select()
        .single();
      
      data = newData;
      if (insertError) throw insertError;
    }

    // 3. 將資料同步到前端 state
    if (data) {
      state.balance = data.balance || 0;
      state.myTickets = data.my_tickets || [];
      state.currentUser.name = data.username || '探員';
      console.log("✅ 資料同步完成", state.balance, state.myTickets);
    }
  } catch (err) {
    console.error("❌ 讀取探員資料失敗，請檢查網路或 Supabase 設定:", err);
  }
};

export const logAction = (msg) => {
  console.log(`[LOG]: ${msg}`);
};