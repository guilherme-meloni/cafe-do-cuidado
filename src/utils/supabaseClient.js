// src/utils/supabaseClient.js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Esta verificação vai nos dar um erro muito mais claro se as chaves não forem encontradas
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("URL ou Chave Anon do Supabase não encontradas. Verifique as variáveis de ambiente.")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)