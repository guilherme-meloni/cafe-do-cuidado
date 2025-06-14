// src/components/WhatsappModal.jsx (VERSÃO CORRIGIDA E SIMPLIFICADA)
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const WhatsappModal = ({ contato, onClose }) => {
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (contato) {
            setMessage(`Olá, ${contato.nome}! Preciso da sua ajuda com um dos meus 'pedidos'.`);
        }
    }, [contato]);

    const handleSend = () => {
        if (!contato || !message) return;
        
        const numeroLimpo = contato.celular.replace(/\D/g, '');
        const mensagemCodificada = encodeURIComponent(message);
        const url = `https://wa.me/55${numeroLimpo}?text=${mensagemCodificada}`;
        
        window.open(url, '_blank');
        onClose();
    };

    // Este é apenas o CONTEÚDO do modal, não o modal inteiro.
    return (
        <div className="bg-surface-container-high rounded-t-2xl p-6 pt-12 relative w-full max-w-md mx-auto">
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-outline-variant rounded-full" />
            <h2 className="text-2xl font-bold text-center mb-2 text-tertiary">Enviar Mensagem</h2>
            <p className="text-center text-on-surface-variant mb-4">Para: <span className="font-bold text-on-surface">{contato?.nome}</span></p>
            <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows="4"
                className="w-full p-3 bg-surface border-2 border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-tertiary text-on-surface"
            ></textarea>
            <motion.button 
                whileTap={{ scale: 0.98 }}
                onClick={handleSend}
                className="mt-4 w-full bg-tertiary text-on-tertiary font-bold py-3 rounded-lg"
            >
                Enviar via WhatsApp
            </motion.button>
        </div>
    );
};

export default WhatsappModal;