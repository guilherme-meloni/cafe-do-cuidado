// src/app/page.jsx (COM LÓGICA DE HISTÓRICO)
'use client';

import React, { useState, useEffect } from 'react';
import { getLocalData, setLocalData } from '../utils/localStorage';
import Modal from '../components/Modal';
import PedidoCard from '../components/PedidoCard';
import ContatoCard from '../components/ContatoCard';
import WhatsappModal from '../components/WhatsappModal';
import { AnimatePresence, motion } from 'framer-motion';
import { LuPlus, LuChefHat, LuClipboardList } from "react-icons/lu";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const calcularDiasRestantes = (q, d) => (d > 0 ? Math.floor(q / d) : 0);

const HomePage = () => {
    const [pedidos, setPedidos] = useState(() => getLocalData('pedidos') || []);
    const [contatos, setContatos] = useState(() => getLocalData('contatos') || []);
    // Estados dos modais
    const [modalPedidoOpen, setModalPedidoOpen] = useState(false);
    const [modalContatoOpen, setModalContatoOpen] = useState(false);
    const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
    const [historyModalOpen, setHistoryModalOpen] = useState(false); // NOVO ESTADO
    // Estados de dados
    const [editIndex, setEditIndex] = useState(null);
    const [formData, setFormData] = useState({ nome: "", quantidade: "", doses: "", horario: "", tipoImagem: "coffee" });
    const [editContatoIndex, setEditContatoIndex] = useState(null);
    const [contatoFormData, setContatoFormData] = useState({ nome: "", celular: "" });
    const [selectedContact, setSelectedContact] = useState(null);
    const [viewingHistoryFor, setViewingHistoryFor] = useState(null); // NOVO ESTADO

    useEffect(() => { setLocalData('pedidos', pedidos); }, [pedidos]);
    useEffect(() => { setLocalData('contatos', contatos); }, [contatos]);

    const handleFormChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const resetPedidoForm = () => {
        setModalPedidoOpen(false);
        setEditIndex(null);
        setFormData({ nome: "", quantidade: "", doses: "", horario: "", tipoImagem: "coffee" });
    };

    const handleOpenPedidoModal = (index = null) => {
        if (index !== null) {
            setEditIndex(index);
            setFormData(pedidos[index]);
        } else {
            setEditIndex(null);
            setFormData({ nome: "", quantidade: "", doses: "", horario: "", tipoImagem: "coffee" });
        }
        setModalPedidoOpen(true);
    };

    const handleSalvarPedido = () => {
        const { nome, quantidade, doses } = formData;
        if (!nome.trim() || !quantidade || !doses) return;
        
        let novoPedido;
        if (editIndex !== null) {
            novoPedido = { ...pedidos[editIndex], ...formData, quantidade: parseFloat(quantidade), doses: parseFloat(doses), diasRestantes: calcularDiasRestantes(parseFloat(quantidade), parseFloat(doses)) };
        } else {
            // Ao criar um novo pedido, inicializa o histórico como um array vazio
            novoPedido = { ...formData, quantidade: parseFloat(quantidade), doses: parseFloat(doses), diasRestantes: calcularDiasRestantes(parseFloat(quantidade), parseFloat(doses)), historico: [] };
        }

        const updated = editIndex !== null ? pedidos.map((p, i) => (i === editIndex ? novoPedido : p)) : [...pedidos, novoPedido];
        setPedidos(updated);
        resetPedidoForm();
    };

    const handleServirPedido = (index) => {
        const p = pedidos[index];
        if (p.quantidade >= p.doses) {
            const novaQtd = parseFloat((p.quantidade - p.doses).toFixed(2));
            
            // Cria um novo registro de histórico
            const novoRegistro = { data: new Date().toISOString() };
            // Garante que o array de histórico exista antes de adicionar
            const historicoAtual = p.historico || [];

            const updated = pedidos.map((item, i) => (i === index ? { 
                ...item, 
                quantidade: novaQtd, 
                diasRestantes: calcularDiasRestantes(novaQtd, p.doses),
                historico: [...historicoAtual, novoRegistro] // Adiciona o novo registro
            } : item));
            
            setPedidos(updated);
            return true;
        } else {
            return false;
        }
    };
    const handleApagarPedido = (index) => setPedidos(pedidos.filter((_, i) => i !== index));

    const handleOpenHistoryModal = (index) => {
        setViewingHistoryFor(pedidos[index]);
        setHistoryModalOpen(true);
    };

    // ... resto das funções de contato ...
    const handleContatoFormChange = (e) => setContatoFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const resetContatoForm = () => { /* ... */ };
    const handleOpenContatoModal = (index = null) => { /* ... */ };
    const handleSalvarContato = () => { /* ... */ };
    const handleApagarContato = (index) => setContatos(contatos.filter((_, i) => i !== index));
    const handleWhatsappClick = (contato) => { /* ... */ };


    return (
        <main className="p-4 font-sans min-h-screen">
            {/* ... cabeçalho e lista de pedidos ... */}
            <div className="grid grid-cols-1 gap-4">
                <AnimatePresence>
                    {pedidos.map((p, index) => (
                        <PedidoCard 
                            key={p.nome + index}
                            pedido={p} 
                            onServe={() => handleServirPedido(index)} 
                            onEdit={() => handleOpenPedidoModal(index)} 
                            onDelete={() => handleApagarPedido(index)}
                            onViewHistory={() => handleOpenHistoryModal(index)} // NOVO
                        />
                    ))}
                </AnimatePresence>
            </div>
            {/* ... resto do conteúdo ... */}

            {/* --- MODAIS --- */}
            <AnimatePresence mode="wait">
                {/* ... modais de pedido e contato ... */}

                {/* NOVO MODAL DE HISTÓRICO */}
                {historyModalOpen && (
                    <Modal key="history-modal" onClose={() => setHistoryModalOpen(false)}>
                        <div className="bg-surface-container-high rounded-t-2xl p-6 pt-12 relative w-full max-w-md mx-auto">
                            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-outline-variant rounded-full" />
                            <h2 className="text-2xl font-bold text-center mb-1 text-primary">Histórico</h2>
                            <p className="text-center text-on-surface-variant mb-4 text-lg">{viewingHistoryFor?.nome}</p>
                            <div className="max-h-[50vh] overflow-y-auto space-y-2">
                                {viewingHistoryFor?.historico && viewingHistoryFor.historico.length > 0 ? (
                                    viewingHistoryFor.historico
                                        .slice() // Cria uma cópia para não mutar o original
                                        .reverse() // Mostra os mais recentes primeiro
                                        .map((reg, idx) => (
                                            <div key={idx} className="bg-surface p-3 rounded-lg text-on-surface text-center">
                                                Servido em: {format(new Date(reg.data), "dd 'de' MMMM, yyyy 'às' HH:mm", { locale: ptBR })}
                                            </div>
                                        ))
                                ) : (
                                    <p className="text-on-surface-variant text-center p-4">Nenhum registro encontrado.</p>
                                )}
                            </div>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>
        </main>
    );
};

export default HomePage;
