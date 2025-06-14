// src/components/PedidoCard.jsx
import React, { useState, useEffect } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LuCupSoda, LuCoffee, LuBean } from "react-icons/lu";

const getIcon = (tipo) => {
    const iconProps = { size: 32, className: "text-secondary" };
    switch (tipo) {
        case 'coffee': return <LuCoffee {...iconProps} />;
        case 'cup': return <LuCupSoda {...iconProps} />;
        case 'bean': return <LuBean {...iconProps} />;
        default: return <LuCoffee {...iconProps} />;
    }
};

const PedidoCard = ({ pedido, onServe, onEdit, onDelete }) => {
    const [dataTermino, setDataTermino] = useState('...');
    const isLow = pedido.diasRestantes <= 3 && pedido.quantidade > 0;
    const isOutOfStock = pedido.quantidade === 0;
    const controls = useAnimationControls();

    useEffect(() => {
        if (pedido.diasRestantes > 0) {
            const dataCalculada = new Date(Date.now() + pedido.diasRestantes * 24 * 60 * 60 * 1000);
            setDataTermino(format(dataCalculada, "dd 'de' MMMM", { locale: ptBR }));
        } else {
            setDataTermino("Hoje!");
        }
    }, [pedido.diasRestantes]);
    const handleServeClick = () => {
        const success = onServe();
        if (!success) {
            controls.start({ x: [-8, 8, -5, 5, 0], transition: { duration: 0.4, ease: "easeInOut" } });
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="cursor-grab active:cursor-grabbing"
            whileTap={{ scale: 0.98 }}
        >
            <motion.div
                animate={controls}
                drag="x" dragConstraints={{ left: 0, right: 0 }} dragElasticity={0.2}
                onDragEnd={(e, i) => { if (i.offset.x < -80) onDelete(); else if (i.offset.x > 80) onEdit(); }}
                // APLICAÇÃO DO GLOW: Adicionamos a classe de sombra condicional aqui
                className={`bg-surface rounded-2xl p-4 flex flex-col justify-between border-l-4 transition-all duration-300 ${isOutOfStock ? 'opacity-50 grayscale' : ''} ${isLow ? 'border-error shadow-glow-error' : 'border-tertiary shadow-glow-tertiary'}`}
            >
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-on-surface">{pedido.nome}</h2>
                        <div className="text-on-surface-variant text-sm mt-2 space-y-1">
                            <p>Estoque: <span className={`font-semibold ${isOutOfStock ? 'text-error' : 'text-on-surface'}`}>{isOutOfStock ? "Esgotado!" : pedido.quantidade}</span></p>
                            <p>Dose: <span className="font-semibold text-on-surface">{pedido.doses}</span> por dia</p>
                            <p>Acaba em: <span className={`font-bold ${isLow ? 'text-error animate-pulse' : 'text-on-surface'}`}>{pedido.diasRestantes} dias ({dataTermino})</span></p>
                            {pedido.horario && <p>Hora de servir: <span className="font-semibold text-on-surface">{pedido.horario}</span></p>}
                        </div>
                    </div>
                    {getIcon(pedido.tipoImagem)}
                </div>
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleServeClick} disabled={isOutOfStock}
                    className="w-full bg-tertiary text-on-tertiary font-bold py-2 rounded-lg mt-4 disabled:opacity-40 disabled:grayscale text-sm"
                >
                    Servir
                </motion.button>
            </motion.div>
        </motion.div>
    );
};

export default PedidoCard;