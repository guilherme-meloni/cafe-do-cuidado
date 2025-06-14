// src/app/layout.jsx
import "./globals.css";

export const metadata = {
  title: "Café do Cuidado",
  description: "Seu assistente pessoal para gerenciar seus 'pedidos' diários.",
  manifest: "/manifest.json",
};

// ESTA É A VERSÃO CORRETA E SIMPLES
export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
      </body>
    </html>
  );
}