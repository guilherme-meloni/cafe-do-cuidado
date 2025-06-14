// src/components/SkeletonCard.jsx

import React from 'react';
import { motion } from 'framer-motion';

const SkeletonCard = () => {
  return (
    // A estrutura do card "fantasma"
    <div className="bg-surface rounded-2xl p-4 w-full h-[170px] border-l-4 border-surface-container">
      <div className="flex flex-row items-start justify-between">
        <div>
          {/* Linha do título */}
          <motion.div className="h-6 w-32 bg-surface-container rounded-md mb-4" />
          {/* Linhas de texto */}
          <div className="space-y-2">
            <motion.div className="h-4 w-40 bg-surface-container rounded-md" />
            <motion.div className="h-4 w-48 bg-surface-container rounded-md" />
            <motion.div className="h-4 w-44 bg-surface-container rounded-md" />
          </div>
        </div>
        {/* Ícone */}
        <motion.div className="h-8 w-8 bg-surface-container rounded-full" />
      </div>
      {/* Botão "fantasma" */}
      <motion.div className="h-10 w-full bg-surface-container rounded-lg mt-4" />
    </div>
  );
};

// Animação de pulso para todos os elementos internos
const SkeletonWrapper = () => (
    <motion.div
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    >
        <SkeletonCard />
    </motion.div>
);


export default SkeletonWrapper;