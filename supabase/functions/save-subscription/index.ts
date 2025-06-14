// supabase/functions/save-subscription/index.ts

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Lida com a requisição preflight do CORS, necessária para a comunicação
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const subscription = await req.json();

    // Validação básica para garantir que a inscrição tem o formato esperado
    if (!subscription || !subscription.endpoint) {
      throw new Error("Inscrição inválida recebida.");
    }

    // Usa as variáveis de ambiente do Supabase para criar um cliente com privilégios de administrador
    // Isso é necessário para escrever no banco de dados a partir de uma função de servidor.
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6Ymxnc292YmdsbGNmcXhlc3puIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTkyMDA3NSwiZXhwIjoyMDY1NDk2MDc1fQ.C1zwpijoRMzd9Po3PXb5xkFIv6FvzHp3EvefKCDyqyk")!
    );

    // Insere os dados na nossa tabela 'subscriptions'
    const { error } = await supabaseClient
      .from("subscriptions")
      .insert({ subscription_data: subscription });

    if (error) {
      // Se já existir uma inscrição igual, o Supabase pode dar um erro de duplicata.
      // Podemos tratar isso como sucesso para não confundir o usuário.
      if (error.code === '23505') { // Código de violação de unicidade
        console.log("Inscrição já existe, tratando como sucesso.");
      } else {
        throw error;
      }
    }

    console.log("Inscrição salva com sucesso:", subscription.endpoint);
    return new Response(JSON.stringify({ message: "Inscrição salva com sucesso!" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (err) {
    console.error("Erro ao salvar inscrição:", err);
    return new Response(String(err?.message ?? err), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});