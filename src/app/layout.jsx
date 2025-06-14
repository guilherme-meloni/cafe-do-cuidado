// src/app/layout.jsx (VERSÃO FINAL E COMPLETA)

import "./globals.css";
import Script from 'next/script';

export const metadata = {
  title: "Café do Cuidado",
  description: "Seu assistente pessoal para gerenciar suas rotinas.",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon-192x192.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body>
        {children}
        
        {/* Adiciona o script do OneSignal de forma otimizada */}
        <Script id="onesignal-sdk" strategy="afterInteractive">
          {`
            window.OneSignalDeferred = window.OneSignalDeferred || [];
            OneSignalDeferred.push(function(OneSignal) {
              OneSignal.init({
                appId: "d19614d4-ce34-4d7e-88ac-8a7e375278b9",
                allowLocalhostAsSecureOrigin: true, // Facilita testes locais
              });
            });
          `}
        </Script>
      </body>
    </html>
  );
}