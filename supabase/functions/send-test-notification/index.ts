// supabase/functions/send-test-notification/index.ts (VERSÃO CORRIGIDA)

import { createClient } from "@supabase/supabase-js";
import webpush from "web-push"; // CORREÇÃO: Usando o import map

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (_req) => {
  try {
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY")!;
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY")!;

    webpush.setVapidDetails(
      "mailto:seu-email@exemplo.com",
      vapidPublicKey,
      vapidPrivateKey
    );

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: subscriptions, error } = await supabaseClient
      .from("subscriptions")
      .select("subscription_data");

    if (error) throw error;
    if (!subscriptions || subscriptions.length === 0) {
      return new Response("Nenhuma inscrição encontrada.", { status: 404, headers: corsHeaders });
    }

    const payload = JSON.stringify({
      title: "Café do Cuidado ☕",
      body: "Esta é uma notificação de teste! O sistema funciona!",
      icon: "https://cafe-do-cuidado.pages.dev/icon-192x192.png",
    });

    const promises = subscriptions.map(sub => 
        webpush.sendNotification(sub.subscription_data, payload)
          .catch(err => console.error(`Falha ao enviar para ${sub.subscription_data.endpoint.slice(0, 40)}...`, err.body))
    );

    await Promise.all(promises);

    return new Response(JSON.stringify({ message: `${subscriptions.length} notificações de teste enviadas!` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (err) {
    console.error("Erro ao enviar notificações:", err);
    return new Response(String(err?.message ?? err), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});