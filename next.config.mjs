// next.config.mjs

import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Suas outras configurações do Next.js podem vir aqui
};

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

export default pwaConfig(nextConfig);