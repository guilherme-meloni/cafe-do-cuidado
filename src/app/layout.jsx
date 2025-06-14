// ----- ARQUIVO 1: src/app/layout.jsx -----

import Script from 'next/script'; // Importa o componente de Script

export const metadata = {
  title: "Café do Cuidado",
  description: "Seu assistente pessoal para gerenciar suas rotinas.",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/icon-192x192.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body>
        {children}
        
        {/* SCRIPT DO ONESIGNAL (jeito correto para Next.js) */}
        <Script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" strategy="afterInteractive" defer />
        <Script id="onesignal-init" strategy="afterInteractive">
          {`
            window.OneSignalDeferred = window.OneSignalDeferred || [];
            OneSignalDeferred.push(function(OneSignal) {
              OneSignal.init({
                appId: "d19614d4-ce34-4d7e-88ac-8a7e375278b9",
              });
            });
          `}
        </Script>
      </body>
    </html>
  );
}
