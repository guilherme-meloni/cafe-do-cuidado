// src/utils/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("URL ou Chave Anon do Supabase não encontradas. Verifique o arquivo .env.local ou as configurações de ambiente.")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)