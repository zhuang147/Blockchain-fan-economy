// src/supabase.js
import { createClient } from '@supabase/supabase-js'

// 從環境變數讀取 URL 與 KEY
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 建立並匯出 supabase 客戶端，讓其他檔案可以使用
export const supabase = createClient(supabaseUrl, supabaseAnonKey)