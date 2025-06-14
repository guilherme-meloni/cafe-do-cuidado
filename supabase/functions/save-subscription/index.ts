// supabase/functions/save-subscription/index.ts
import { serve } from "std/http/server.ts";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push"; // Importa usando o import_map

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
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error } = await supabaseClient
      .from("subscriptions")
      .insert({ subscription_data: subscription });

    if (error && error.code !== '23505') { // Ignora erro se a inscrição já existir
      throw error;
    }

    return new Response(JSON.stringify({ message: "Inscrição salva!" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    return new Response(String(err?.message ?? err), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});