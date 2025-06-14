// src/components/PedidoCard.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, addDays } from 'date-fns'; 
import { ptBR } from 'date-fns/locale';
import { LuCupSoda, LuCoffee, LuBean, LuClipboardList } from "react-icons/lu";

const getIcon = (tipo) => {
    const iconProps = { size: 32, className: "text-secondary" };
    switch (tipo) {
        case 'coffee': return <LuCoffee {...iconProps} />;
        case 'cup': return <LuCupSoda {...iconProps} />;
        case 'bean': return <LuBean {...iconProps} />;
        default: return <LuCoffee {...iconProps} />;
    }
};

const PedidoCard = ({ pedido, onServe, onEdit, onDelete, onViewHistory }) => {
    const [dataTermino, setDataTermino] = useState('');
    const [isMounted, setIsMounted] = useState(false);
    const diasRestantes = (pedido.doses > 0) ? Math.floor(pedido.quantidade / pedido.doses) : 0;
    const isLow = diasRestantes <= 3 && diasRestantes > 0;
    const isOutOfStock = pedido.quantidade <= 0;

    useEffect(() => { setIsMounted(true); }, []);

    useEffect(() => {
        if (diasRestantes > 0) {
            const diasParaAdicionar = diasRestantes - 1;
            const dataCalculada = addDays(new Date(), diasParaAdicionar);
            setDataTermino(format(dataCalculada, "dd 'de' MMMM", { locale: ptBR }));
        }
    }, [diasRestantes]);

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ type: 'spring', duration: 0.5 }} className="cursor-grab active:cursor-grabbing">
            <motion.div whileTap={{ scale: 0.98 }} drag="x" dragConstraints={{ left: -100, right: 100 }} dragElasticity={0.2} onDragEnd={(e, i) => { if (i.offset.x < -80) onDelete(); else if (i.offset.x > 80) onEdit(); }} className={`bg-surface rounded-2xl p-4 flex flex-col justify-between border-l-4 transition-all duration-300 ${isOutOfStock ? 'opacity-50 grayscale' : ''} ${isLow ? 'border-error shadow-glow-error' : 'border-tertiary shadow-glow-tertiary'}`}>
                <div className="flex flex-row items-start justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-on-surface">{pedido.nome}</h2>
                        <div className="text-on-surface-variant text-sm mt-2 space-y-1">
                            <p>Estoque: <span className="font-semibold text-on-surface">{isOutOfStock ? "Esgotado!" : `${pedido.quantidade} un.`}</span></p>
                            <p>Dose: <span className="font-semibold text-on-surface">{pedido.doses} / dia</span></p>
                            {isMounted ? (
                                <>
                                    <p>Duração: <span className="font-bold text-on-surface">{diasRestantes} dias</span></p>
                                    {!isOutOfStock && <p>Término: <span className={`font-bold ${isLow ? 'text-error animate-pulse' : 'text-on-surface'}`}>{dataTermino}</span></p>}
                                </>
                            ) : <div className="h-10 w-full bg-surface-container rounded-md animate-pulse mt-1"></div> }
                            {pedido.horario && <p>Horário: <span className="font-semibold text-on-surface">{pedido.horario}</span></p>}
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-3 shrink-0">
                        {getIcon(pedido.tipoImagem)}
                        <motion.button whileTap={{ scale: 0.9 }} onClick={onViewHistory} className="p-2 bg-surface-container rounded-full text-on-surface-variant" aria-label="Ver histórico"><LuClipboardList size={20} /></motion.button>
                    </div>
                </div>
                <motion.button whileTap={{ scale: 0.95 }} onClick={onServe} disabled={isOutOfStock} className="w-full bg-tertiary text-on-tertiary font-bold py-2 rounded-lg mt-4 disabled:opacity-40 disabled:grayscale text-sm">Servir</motion.button>
            </motion.div>
        </motion.div>
    );
};

export default PedidoCard;