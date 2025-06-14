// src/components/Modal.jsx (A VERSÃO DEFINITIVA)
import React from 'react';
import { motion } from 'framer-motion';

const Modal = ({ children, onClose }) => {
  return (
    // O fundo escuro que cobre a tela inteira
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose} // Permite fechar clicando no fundo
    >
      {/* O painel de conteúdo que desliza de baixo para cima */}
      <motion.div
        // Impede que o clique no conteúdo feche o modal
        onClick={(e) => e.stopPropagation()}
        className="w-full"
        // Variantes da animação
        initial={{ y: "100%" }}
        animate={{ y: "0%" }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 400, damping: 40 }}
        // Gestos para fechar no celular
        drag="y"
        dragConstraints={{ top: 0 }}
        onDragEnd={(event, info) => {
          if (info.offset.y > 200) {
            onClose();
          }
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

export default Modal;