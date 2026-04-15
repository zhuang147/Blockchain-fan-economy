import { reactive, watch } from 'vue'; // ✨ 記得加上 watch
import { supabase } from './supabase.js';

// ✨ 終極修復：安全解析函數，確保票券絕對是物件，而不是字串
const safeParseTicket = (ticket) => {
  if (typeof ticket === 'string') {
    try {
      return JSON.parse(ticket);
    } catch (e) {
      console.error("解析票券字串失敗:", e);
      return ticket; 
    }
  }
  return ticket;
};

// 🚀 嘗試從瀏覽器記憶讀取備份，讀取時順便用 safeParseTicket 確保格式正確
let savedTickets = [];
try {
  const rawBackup = JSON.parse(localStorage.getItem('myTickets_backup')) || [];
  savedTickets = rawBackup.map(safeParseTicket);
} catch (e) {
  savedTickets = [];
}
const savedTab = localStorage.getItem('activeTab_backup') || 'base';

export const state = reactive({
  isLoggedIn: false,
  currentUser: {
    id: null,
    email: '',
    name: '' 
  },
  balance: 0,
  myTickets: savedTickets, // 預設先給本地備份的票券 (已過濾為純物件)
  activeTab: savedTab,     // 預設停留留在上一次的頁籤
  currentBlock: 840000,
  showVideoModal: false,
  showTicketModal: false,
  showDepositModal: false,
  selectedTicket: null,
  walletAddress: '',
  lastCheckInDate: null,
  feedMessages: []
});

export const isTodayCheckedIn = () => {
  if (!state.lastCheckInDate) return false;
  const today = new Date().toLocaleDateString();
  return state.lastCheckInDate === today;
};

// 備份機制 1：只要 myTickets 有變動（例如剛買完票），立刻存進瀏覽器！
watch(() => state.myTickets, (newVal) => {
  localStorage.setItem('myTickets_backup', JSON.stringify(newVal));
}, { deep: true });

// 備份機制 2：記住你目前在哪個分頁，F5 刷新不迷路
watch(() => state.activeTab, (newVal) => {
  localStorage.setItem('activeTab_backup', newVal);
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
      
      // ✨ 關鍵修復：抓下來的瞬間，如果是字串就自動 parse 回物件！
      state.myTickets = (data.my_tickets || []).map(safeParseTicket);
      
      state.currentUser.name = data.username || '探員';
      state.isLoggedIn = true;
      console.log("✅ 資料庫同步完成", state.balance, state.myTickets);
    }
  } catch (err) {
    console.error("❌ 讀取探員資料失敗，請檢查網路或 Supabase 設定:", err);
  }
};

export const logAction = (msg) => {
  console.log(`[LOG]: ${msg}`);
};