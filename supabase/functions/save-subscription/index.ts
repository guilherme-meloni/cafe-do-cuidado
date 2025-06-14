// supabase/functions/save-subscription/index.ts (VERSÃO CORRIGIDA)

import { serve } from "std/http/server.ts";
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const subscription = await req.json();

    if (!subscription || !subscription.endpoint) {
      throw new Error("Inscrição inválida recebida.");
    }

    // CORREÇÃO: Usa Deno.env.get para ler a URL e a CHAVE DE SERVIÇO dos secrets/env.
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error } = await supabaseClient
      .from("subscriptions")
      .insert({ subscription_data: subscription });

    if (error) {
      if (error.code === '23505') { // Inscrição já existe
        console.log("Inscrição já existe, tratando como sucesso.");
      } else {
        throw error;
      }
    }

    return new Response(JSON.stringify({ message: "Inscrição salva com sucesso!" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (err) {
    return new Response(String(err?.message ?? err), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});