import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://nsdnazynpwohxjlgmtvj.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_f_0UewplDfJr4C_Kv2CpQQ_nGP_5lVX";

console.log("SUPABASE_URL_CHECK", supabaseUrl);
console.log("SUPABASE_KEY_CHECK", supabaseAnonKey ? "KEY 있음" : "KEY 없음");

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase 환경변수가 비어 있습니다. .env.local을 확인하세요.");
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);



