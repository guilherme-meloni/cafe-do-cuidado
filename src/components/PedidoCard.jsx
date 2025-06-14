// src/components/PedidoCard.jsx
// ... imports
import { LuCupSoda, LuCoffee, LuBean, LuClipboardList } from "react-icons/lu"; // Adicione LuClipboardList

const PedidoCard = ({ pedido, onServe, onEdit, onDelete, onViewHistory }) => { // Adicione onViewHistory
    // ...
    return (
        <motion.div /* ... */ >
            <motion.div /* ... */ >
                <div className="flex items-start justify-between">
                    {/* ... */}
                    <div className="flex flex-col items-center gap-2">
                         {getIcon(pedido.tipoImagem)}
                         {/* NOVO BOTÃO DE HISTÓRICO */}
                         <motion.button 
                            whileTap={{ scale: 0.9 }}
                            onClick={onViewHistory}
                            className="p-2 bg-surface-container rounded-full text-on-surface-variant"
                            aria-label="Ver histórico"
                         >
                             <LuClipboardList size={20} />
                         </motion.button>
                    </div>
                </div>
                {/* ... resto do card ... */}
            </motion.div>
        </motion.div>
    );
};

export default PedidoCard;
