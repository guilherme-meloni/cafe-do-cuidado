// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

// Importa o plugin do PWA
import withPWAInit from "@ducanh2912/next-pwa";

// Ativa o PWA
const withPWA = withPWAInit({
  dest: "public", // O Service Worker será gerado na pasta public
  disable: process.env.NODE_ENV === "development", // Desativa o PWA em modo de desenvolvimento para evitar bugs
});

export default withPWA(nextConfig);