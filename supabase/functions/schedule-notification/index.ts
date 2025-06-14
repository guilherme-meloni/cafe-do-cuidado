// supabase/functions/schedule-notification/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ONESIGNAL_APP_ID = Deno.env.get("ONESIGNAL_APP_ID");
const ONESIGNAL_REST_API_KEY = Deno.env.get("ONESIGNAL_REST_API_KEY");

serve(async (req) => {
  // 1. Validação do CORS e do método
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" } });
  }
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    // 2. Extrai os dados do corpo da requisição
    const { playerId, horario, nomeMedicamento } = await req.json();

    if (!playerId || !horario || !nomeMedicamento) {
      return new Response(JSON.stringify({ error: "playerId, horario, e nomeMedicamento são obrigatórios." }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    // 3. Monta a requisição para a API do OneSignal
    const notification = {
      app_id: ONESIGNAL_APP_ID,
      include_player_ids: [playerId], // Envia para um usuário específico
      headings: { "en": "Hora do seu café!", "pt": "Hora do seu café!" },
      contents: { "en": `Está na hora de tomar seu ${nomeMedicamento}`, "pt": `Está na hora de tomar seu ${nomeMedicamento}` },
      // A MÁGICA ACONTECE AQUI
      send_after: `${horario}`, // Formato "YYYY-MM-DD HH:MM:SS Timezone"
    };

    // 4. Envia a requisição para agendar
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": `Basic ${ONESIGNAL_REST_API_KEY}`
      },
      body: JSON.stringify(notification)
    });

    const responseData = await response.json();

    if (response.status >= 400) {
        console.error("Erro do OneSignal:", responseData);
        return new Response(JSON.stringify({ error: "Falha ao agendar notificação", details: responseData }), { status: 500 });
    }

    // 5. Retorna sucesso
    return new Response(JSON.stringify({ success: true, oneSignalResponse: responseData }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" },
      status: 200,
    });

  } catch (error) {
    console.error("Erro na Edge Function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" },
      status: 500,
    });
  }
});