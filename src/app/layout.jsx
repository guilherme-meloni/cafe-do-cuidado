// src/app/layout.jsx (VERSÃO CORRETA E FINAL)

// 1. IMPORTA O CSS GLOBAL (ESSA LINHA É ESSENCIAL)
import "./globals.css";

import Script from 'next/script'; // Importa o componente de Script do Next.js

// 2. O OBJETO DE METADADOS (JÁ ESTAVA CORRETO)
export const metadata = {
  title: "Café do Cuidado",
  description: "Seu assistente pessoal para gerenciar suas rotinas.",
  manifest: "/manifest.json",
};

// 3. O LAYOUT COM A ESTRUTURA COMPLETA
export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Ícones para a aba do navegador e para PWA */}
        <link rel="icon" href="/icon-192x192.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body>
        {children}
        
        {/* SCRIPTS DO ONESIGNAL (adicionados da forma correta) */}
        <Script 
          src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" 
          strategy="afterInteractive" 
          defer 
        />
        <Script id="onesignal-init" strategy="afterInteractive">
          {`
            window.OneSignalDeferred = window.OneSignalDeferred || [];
            OneSignalDeferred.push(function(OneSignal) {
              OneSignal.init({
                appId: "d19614d4-ce34-4d7e-88ac-8a7e375278b9",
                allowLocalhostAsSecureOrigin: true, // Importante para testes locais
              });
            });
          `}
        </Script>
      </body>
    </html>
  );
}
