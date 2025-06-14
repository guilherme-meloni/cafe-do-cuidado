// ----- ARQUIVO 2: src/app/page.jsx (VERSÃO LIMPA E ATUALIZADA) -----

'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { getLocalData, setLocalData } from '../utils/localStorage';
import Modal from '../components/Modal';
import PedidoCard from '../components/PedidoCard';
import ContatoCard from '../components/ContatoCard';
import WhatsappModal from '../components/WhatsappModal';
import SkeletonCard from '../components/SkeletonCard';
import { AnimatePresence, motion } from 'framer-motion';
import { LuPlus, LuChefHat } from "react-icons/lu"; 
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const HomePage = () => {
    // ESTADOS (Simplificados - sem a lógica de notificação manual)
    const [pedidos, setPedidos] = useState([]);
    const [contatos, setContatos] = useState(() => getLocalData('contatos') || []);
    const [isLoading, setIsLoading] = useState(true);
    const [modalPedidoOpen, setModalPedidoOpen] = useState(false);
    const [modalContatoOpen, setModalContatoOpen] = useState(false);
    const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [editPedido, setEditPedido] = useState(null);
    const [formData, setFormData] = useState({ nome: "", quantidade: "", doses: "", horario: "", tipoImagem: "coffee" });
    const [editContatoIndex, setEditContatoIndex] = useState(null);
    const [contatoFormData, setContatoFormData] = useState({ nome: "", celular: "" });
    const [selectedContact, setSelectedContact] = useState(null);
    const [viewingHistoryFor, setViewingHistoryFor] = useState(null);

    // EFEITOS
    const fetchPedidos = async () => {
        setIsLoading(true);
        const { data, error } = await supabase.from('pedidos').select('*').order('created_at', { ascending: false });
        if (error) console.error("Erro ao buscar pedidos:", error);
        else setPedidos(data || []);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchPedidos();
    }, []);

    useEffect(() => { setLocalData('contatos', contatos); }, [contatos]);

    // FUNÇÕES
    const triggerHapticFeedback = () => { if (navigator?.vibrate) navigator.vibrate(50); };
    
    // As funções de notificação foram REMOVIDAS. O OneSignal cuida de tudo.

    const handleFormChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const resetPedidoForm = () => { setModalPedidoOpen(false); setEditPedido(null); setFormData({ nome: "", quantidade: "", doses: "", horario: "", tipoImagem: "coffee" }); };
    
    const handleOpenPedidoModal = (pedido = null) => {
        triggerHapticFeedback();
        if (pedido) {
            setEditPedido(pedido);
            setFormData({ nome: pedido.nome || "", quantidade: pedido.quantidade || "", doses: pedido.doses || "", horario: pedido.horario || "", tipoImagem: pedido.tipoImagem || "coffee" });
        } else {
            setEditPedido(null);
            setFormData({ nome: "", quantidade: "", doses: "", horario: "", tipoImagem: "coffee" });
        }
        setModalPedidoOpen(true);
    };

    const handleSalvarPedido = async () => {
        triggerHapticFeedback();
        const { nome, quantidade, doses, horario, tipoImagem } = formData;
        if (!nome.trim() || !quantidade || !doses) return;
        const pedidoData = { nome, quantidade: parseFloat(quantidade), doses: parseFloat(doses), horario: horario || null, tipoImagem };
        if (editPedido) {
            pedidoData.id = editPedido.id;
        } else {
            pedidoData.historico = [];
        }
        const { error } = await supabase.from('pedidos').upsert(pedidoData).select();
        if (error) console.error("Erro ao salvar pedido:", error);
        else { await fetchPedidos(); resetPedidoForm(); }
    };

    const handleServirPedido = async (pedido) => {
        triggerHapticFeedback();
        if (pedido && pedido.quantidade >= pedido.doses) {
            const novaQtd = parseFloat((pedido.quantidade - pedido.doses).toFixed(2));
            const novoRegistro = { data: new Date().toISOString() };
            const historicoAtual = pedido.historico || [];
            const { error } = await supabase.from('pedidos').update({ quantidade: novaQtd, historico: [...historicoAtual, novoRegistro] }).eq('id', pedido.id);
            if (error) console.error("Erro ao servir pedido:", error);
            else await fetchPedidos();
        }
    };

    const handleApagarPedido = async (pedido) => {
        triggerHapticFeedback();
        const { error } = await supabase.from('pedidos').delete().eq('id', pedido.id);
        if (error) console.error("Erro ao apagar pedido:", error);
        else await fetchPedidos();
    };

    const handleOpenHistoryModal = (pedido) => { setViewingHistoryFor(pedido); setHistoryModalOpen(true); triggerHapticFeedback(); };
    const handleContatoFormChange = (e) => setContatoFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const resetContatoForm = () => { setModalContatoOpen(false); setEditContatoIndex(null); setContatoFormData({ nome: "", celular: "" }); };
    const handleOpenContatoModal = (index = null) => { triggerHapticFeedback(); if (index !== null) { setEditContatoIndex(index); setContatoFormData(contatos[index]); } else { setEditContatoIndex(null); setContatoFormData({ nome: "", celular: "" }); } setModalContatoOpen(true); };
    const handleSalvarContato = () => { triggerHapticFeedback(); const { nome, celular } = contatoFormData; if (!nome.trim() || !celular.trim()) return; const updated = editContatoIndex !== null ? contatos.map((c, i) => (i === editContatoIndex ? contatoFormData : c)) : [...contatos, contatoFormData]; setContatos(updated); setLocalData('contatos', updated); resetContatoForm(); };
    const handleApagarContato = (index) => { triggerHapticFeedback(); const newContatos = contatos.filter((_, i) => i !== index); setContatos(newContatos); setLocalData('contatos', newContatos); };
    const handleWhatsappClick = (contato) => { triggerHapticFeedback(); setSelectedContact(contato); setWhatsappModalOpen(true); };

    return (
        <main className="p-4 font-sans min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-on-surface">Café do Cuidado</h1>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleOpenPedidoModal(null)} className="bg-primary text-on-primary font-bold py-2 px-4 rounded-full flex items-center gap-2 text-sm">
                    <LuPlus /> Pedido
                </motion.button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
                {isLoading ? <><SkeletonCard /><SkeletonCard /></> : (
                    <AnimatePresence>
                        {pedidos.map((p) => (
                            <PedidoCard key={p.id} pedido={p} onServe={() => handleServirPedido(p)} onEdit={() => handleOpenPedidoModal(p)} onDelete={() => handleApagarPedido(p)} onViewHistory={() => handleOpenHistoryModal(p)} />
                        ))}
                    </AnimatePresence>
                )}
            </div>
            {!isLoading && pedidos.length === 0 && <p className="text-on-surface-variant text-center mt-4">Nenhum pedido anotado ainda.</p>}

            <div className="flex justify-between items-center my-8 mt-12">
                <h1 className="text-xl font-bold text-on-surface flex items-center gap-3"><LuChefHat /> Baristas</h1>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleOpenContatoModal(null)} className="bg-primary text-on-primary font-bold py-2 px-4 rounded-full flex items-center gap-2 text-sm">
                    <LuPlus /> Contato
                </motion.button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
                <AnimatePresence>{contatos.map((c, index) => (c && <ContatoCard key={c.nome + index} contato={c} onEdit={() => handleOpenContatoModal(index)} onDelete={() => handleApagarContato(index)} onWhatsappClick={() => handleWhatsappClick(c)} />))}</AnimatePresence>
            </div>
            
            <AnimatePresence mode="wait">
                {modalPedidoOpen && (
                    <Modal key="pedido-modal" onClose={resetPedidoForm}>
                        <div className="bg-surface-container-high rounded-t-2xl p-6 pt-12 relative w-full max-w-md mx-auto">
                            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-outline-variant rounded-full" />
                            <h2 className="text-2xl font-bold text-center mb-4 text-primary">{editPedido ? 'Editando Pedido' : 'Anotar Novo Pedido'}</h2>
                            <div className="space-y-4">
                                <input type="text" name="nome" value={formData.nome} onChange={handleFormChange} placeholder="Nome (Ex: Vitamina D)" className="w-full p-3 bg-surface border-2 border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                                <input type="number" name="quantidade" value={formData.quantidade} onChange={handleFormChange} placeholder="Quantidade em estoque" className="w-full p-3 bg-surface border-2 border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                                <input type="number" name="doses" value={formData.doses} onChange={handleFormChange} placeholder="Doses por dia" className="w-full p-3 bg-surface border-2 border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                                <input type="time" name="horario" value={formData.horario} onChange={handleFormChange} className="w-full p-3 bg-surface border-2 border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-on-surface-variant" />
                                <select name="tipoImagem" value={formData.tipoImagem} onChange={handleFormChange} className="w-full p-3 bg-surface border-2 border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                                    <option value="coffee">Pílula</option><option value="cup">Líquido</option><option value="bean">Outro</option>
                                </select>
                                <motion.button whileTap={{ scale: 0.98 }} onClick={handleSalvarPedido} className="w-full bg-primary text-on-primary font-bold py-3 rounded-lg">Salvar Pedido</motion.button>
                            </div>
                        </div>
                    </Modal>
                )}
                {modalContatoOpen && (
                     <Modal key="contato-modal" onClose={resetContatoForm}>
                        <div className="bg-surface-container-high rounded-t-2xl p-6 pt-12 relative w-full max-w-md mx-auto">
                            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-outline-variant rounded-full" />
                            <h2 className="text-2xl font-bold text-center mb-4 text-primary">{editContatoIndex !== null ? 'Editar Contato' : 'Adicionar Barista'}</h2>
                            <div className="space-y-4">
                                <input type="text" name="nome" value={contatoFormData.nome} onChange={handleContatoFormChange} placeholder="Nome do Contato" className="w-full p-3 bg-surface border-2 border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                                <input type="tel" name="celular" value={contatoFormData.celular} onChange={handleContatoFormChange} placeholder="Celular (Ex: 11987654321)" className="w-full p-3 bg-surface border-2 border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                                <motion.button whileTap={{ scale: 0.98 }} onClick={handleSalvarContato} className="w-full bg-primary text-on-primary font-bold py-3 rounded-lg">Salvar Contato</motion.button>
                            </div>
                        </div>
                    </Modal>
                )}
                {whatsappModalOpen && (
                    <Modal key="whatsapp-modal" onClose={() => setWhatsappModalOpen(false)}>
                        <WhatsappModal contato={selectedContact} onClose={() => setWhatsappModalOpen(false)} />
                    </Modal>
                )}
                {historyModalOpen && (
                    <Modal key="history-modal" onClose={() => setHistoryModalOpen(false)}>
                        <div className="bg-surface-container-high rounded-t-2xl p-6 pt-12 relative w-full max-w-md mx-auto">
                            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-outline-variant rounded-full" />
                            <h2 className="text-2xl font-bold text-center mb-1 text-primary">Histórico</h2>
                            <p className="text-center text-on-surface-variant mb-4 text-lg">{viewingHistoryFor?.nome}</p>
                            <div className="max-h-[50vh] overflow-y-auto space-y-2">
                                {viewingHistoryFor?.historico && viewingHistoryFor.historico.length > 0 ? (
                                    viewingHistoryFor.historico.slice().reverse().map((reg, idx) => (
                                        <div key={idx} className="bg-surface p-3 rounded-lg text-on-surface text-center">
                                            Servido em: {format(new Date(reg.data), "dd 'de' MMMM, HH:mm'h'", { locale: ptBR })}
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