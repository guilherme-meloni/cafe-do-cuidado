// src/components/ContatoCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { LuPhone, LuMessageSquare } from "react-icons/lu";

const ContatoCard = ({ contato, onEdit, onDelete, onWhatsappClick }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ type: 'spring', duration: 0.4 }}
            whileTap={{ scale: 0.98 }}
            drag="x" dragConstraints={{ left: 0, right: 0 }} dragElasticity={0.2}
            onDragEnd={(e, i) => { if (i.offset.x < -80) onDelete(); else if (i.offset.x > 80) onEdit(); }}
            // APLICAÇÃO DO GLOW: Adicionamos a borda e a sombra aqui
            className="bg-surface rounded-2xl p-4 cursor-grab active:cursor-grabbing border-l-4 border-primary shadow-glow-primary transition-all duration-300"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-on-surface">{contato.nome}</h3>
                    <p className="text-on-surface-variant flex items-center gap-2 text-sm"><LuPhone size={14} /> {contato.celular}</p>
                </div>
                <motion.div 
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => { e.stopPropagation(); onWhatsappClick(); }}
                    className="bg-tertiary p-3 rounded-full text-on-tertiary"
                >
                    <LuMessageSquare size={20} />
                </motion.div>
            </div>
        </motion.div>
    );
};

export default ContatoCard;