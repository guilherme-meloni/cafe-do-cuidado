// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // IMPLEMENTAÇÃO: Adicionando sombras coloridas para o efeito de "glow"
      boxShadow: {
        // Glow para o estado de SUCESSO/OK (verde)
        'glow-tertiary': '0 0 15px -3px rgba(166, 227, 161, 0.4)',
        // Glow para o estado de ERRO/ALERTA (vermelho)
        'glow-error': '0 0 15px -3px rgba(237, 135, 150, 0.4)',
        // Glow para os cards de CONTATO (roxo)
        'glow-primary': '0 0 15px -3px rgba(198, 160, 246, 0.4)',
      },
      colors: {
        'primary': '#c6a0f6',
        'on-primary': '#1e2030',
        'primary-container': '#363a4f',
        'on-primary-container': '#c6a0f6',

        'secondary': '#f5a97f',
        'on-secondary': '#1e2030', // Alterado para Mantle
        'secondary-container': '#363a4f',
        'on-secondary-container': '#f5a97f',

        'tertiary': '#a6e3a1',
        'on-tertiary': '#1e2030', // Alterado para Mantle
        'tertiary-container': '#363a4f',
        'on-tertiary-container': '#a6e3a1',

        'error': '#ed8796',
        'on-error': '#1e2030', // Alterado para Mantle
        'error-container': '#363a4f',
        'on-error-container': '#ed8796',

        'background': '#1e2030',      // M3: Background (Mantle)
        'on-background': '#cad3f5',   // M3: On Background (Text)
        
        'surface': '#24273a',         // M3: Surface (Base)
        'on-surface': '#cad3f5',      // M3: On Surface (Text)
        'on-surface-variant': '#a6adc8', // M3: On Surface Variant (Subtext0)

        'surface-container': '#363a4f', // M3: Surface Container (Surface0)
        'surface-container-high': '#494d64', // M3: Surface Container High (Surface1)
        'surface-container-highest': '#5b6078', // M3: Surface Container Highest (Surface2)

        'outline': '#8087a2',         // M3: Outline (Overlay1)
        'outline-variant': '#494d64', // M3: Outline Variant (Surface1)

        // Cores originais mantidas para referência ou uso específico se necessário
        'rosewater': '#f4dbd6',
        'flamingo': '#f0c6c6',
        'pink': '#f5bde6',
        'mauve': '#c6a0f6',
        'red': '#ed8796',
        'maroon': '#ee99a0',
        'peach': '#f5a97f',
        'yellow': '#eed49f',
        'green': '#a6e3a1',
        'teal': '#8bd5ca',
        'sky': '#91d7e3',
        'sapphire': '#7dc4e4',
        'blue': '#89b4fa',
        'lavender': '#b7bdf8',
        'text': '#cad3f5',
        'subtext1': '#b8c0e0',
        'subtext0': '#a6adc8',
      }
    },
  },
  plugins: [
    // O plugin do Catppuccin não é mais estritamente necessário,
    // pois definimos as cores manualmente, mas pode ser mantido se desejar.
  ],
};
