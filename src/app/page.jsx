// src/app/page.jsx (COM A CORREÇÃO FINAL PARA OS MODAIS)
'use client';

import React, { useState, useEffect } from 'react';
import { getLocalData, setLocalData } from '../utils/localStorage';
import Modal from '../components/Modal';
import PedidoCard from '../components/PedidoCard';
import ContatoCard from '../components/ContatoCard';
import WhatsappModal from '../components/WhatsappModal';
import { AnimatePresence, motion } from 'framer-motion';
import { LuPlus, LuChefHat } from "react-icons/lu";

const calcularDiasRestantes = (q, d) => (d > 0 ? Math.floor(q / d) : 0);

const HomePage = () => {
    const [pedidos, setPedidos] = useState(() => getLocalData('pedidos') || []);
    const [contatos, setContatos] = useState(() => getLocalData('contatos') || []);
    const [modalPedidoOpen, setModalPedidoOpen] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [formData, setFormData] = useState({ nome: "", quantidade: "", doses: "", horario: "", tipoImagem: "coffee" });
    const [modalContatoOpen, setModalContatoOpen] = useState(false);
    const [editContatoIndex, setEditContatoIndex] = useState(null);
    const [contatoFormData, setContatoFormData] = useState({ nome: "", celular: "" });
    const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);

    useEffect(() => { setLocalData('pedidos', pedidos); }, [pedidos]);
    useEffect(() => { setLocalData('contatos', contatos); }, [contatos]);

    const handleFormChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const resetPedidoForm = () => {
        setModalPedidoOpen(false);
        setEditIndex(null);
        setFormData({ nome: "", quantidade: "", doses: "", horario: "", tipoImagem: "coffee" });
    };

    const handleOpenPedidoModal = (index = null) => {
        triggerHapticFeedback();
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
        const novoPedido = { ...formData, quantidade: parseFloat(quantidade), doses: parseFloat(doses), diasRestantes: calcularDiasRestantes(parseFloat(quantidade), parseFloat(doses)) };
        const updated = editIndex !== null ? pedidos.map((p, i) => (i === editIndex ? novoPedido : p)) : [...pedidos, novoPedido];
        setPedidos(updated);
        resetPedidoForm();
        triggerHapticFeedback();
    };

    const handleServirPedido = (index) => {
        const p = pedidos[index];
        if (p.quantidade >= p.doses) {
            const novaQtd = parseFloat((p.quantidade - p.doses).toFixed(2));
            const updated = pedidos.map((item, i) => (i === index ? { ...item, quantidade: novaQtd, diasRestantes: calcularDiasRestantes(novaQtd, p.doses) } : item));
            triggerHapticFeedback();
            setPedidos(updated);
            return true;
        } else {
            return false;
        }
        
    };
    const handleApagarPedido = (index) => setPedidos(pedidos.filter((_, i) => i !== index));

    const handleContatoFormChange = (e) => setContatoFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const resetContatoForm = () => {
        setModalContatoOpen(false);
        setEditContatoIndex(null);
        setContatoFormData({ nome: "", celular: "" });
        
    };

    const handleOpenContatoModal = (index = null) => {
        if (index !== null) {
            setEditContatoIndex(index);
            setContatoFormData(contatos[index]);
        } else {
            setEditContatoIndex(null);
            setContatoFormData({ nome: "", celular: "" });
        }
        setModalContatoOpen(true);
        triggerHapticFeedback();
    };

    const handleSalvarContato = () => {
        const { nome, celular } = contatoFormData;
        if (!nome.trim() || !celular.trim()) return;
        const updated = editContatoIndex !== null ? contatos.map((c, i) => (i === editContatoIndex ? contatoFormData : c)) : [...contatos, contatoFormData];
        setContatos(updated);
        resetContatoForm();
    };
    
    const handleApagarContato = (index) => setContatos(contatos.filter((_, i) => i !== index));
    const handleWhatsappClick = (contato) => {
        setSelectedContact(contato);
        setWhatsappModalOpen(true);
        triggerHapticFeedback();
    };

    const triggerHapticFeedback = () => {
  // Verifica se o navegador suporta a API de vibração
  if (navigator && navigator.vibrate) {
    navigator.vibrate(50); // Uma vibração curta de 50ms
  }
};

    return (
        <main className="p-4 font-sans min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-on-surface">Café do Cuidado</h1>
                <motion.button whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 17 }} onClick={() => handleOpenPedidoModal()} className="bg-primary text-on-primary font-bold py-2 px-4 rounded-full flex items-center gap-2 text-sm">
                    <LuPlus /> Pedido
                </motion.button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
                <AnimatePresence>
                    {pedidos.map((p, index) => (
                        <PedidoCard 
                            key={p.nome + index}
                            pedido={p} 
                            onServe={() => handleServirPedido(index)} 
                            onEdit={() => handleOpenPedidoModal(index)} 
                            onDelete={() => handleApagarPedido(index)}
                        />
                    ))}
                </AnimatePresence>
            </div>
            {pedidos.length === 0 && <p className="text-on-surface-variant text-center mt-4">Nenhum pedido anotado ainda.</p>}

            <div className="flex justify-between items-center my-8 mt-12">
                <h1 className="text-xl font-bold text-on-surface flex items-center gap-3"><LuChefHat /> Baristas</h1>
                <motion.button whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 17 }} onClick={() => handleOpenContatoModal()} className="bg-primary text-on-primary font-bold py-2 px-4 rounded-full flex items-center gap-2 text-sm">
                    <LuPlus /> Contato
                </motion.button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <AnimatePresence>
                    {contatos.map((c, index) => (
                        <ContatoCard 
                            key={c.nome + index}
                            contato={c} 
                            onEdit={() => handleOpenContatoModal(index)} 
                            onDelete={() => handleApagarContato(index)} 
                            onWhatsappClick={() => handleWhatsappClick(c)}
                        />
                    ))}
                </AnimatePresence>
            </div>
            
            {/* CORREÇÃO PRINCIPAL: Um AnimatePresence para todos os modais */}
            <AnimatePresence mode="wait">
                {modalPedidoOpen && (
                    <Modal key="pedido-modal" onClose={resetPedidoForm}>
                        <div className="bg-surface-container-high rounded-t-2xl p-6 pt-12 relative w-full max-w-md mx-auto">
                            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-outline-variant rounded-full" />
                            <h2 className="text-2xl font-bold text-center mb-4 text-primary">{editIndex !== null ? 'Editando Pedido' : 'Anotar Novo Pedido'}</h2>
                            <div className="space-y-4">
                                <input type="text" name="nome" value={formData.nome} onChange={handleFormChange} placeholder="Nome (Ex: Expresso Duplo)" className="w-full p-3 bg-surface border-2 border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                                <input type="number" name="quantidade" value={formData.quantidade} onChange={handleFormChange} placeholder="Quantidade" className="w-full p-3 bg-surface border-2 border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                                <input type="number" name="doses" value={formData.doses} onChange={handleFormChange} placeholder="Doses por dia" className="w-full p-3 bg-surface border-2 border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                                <input type="time" name="horario" value={formData.horario} onChange={handleFormChange} className="w-full p-3 bg-surface border-2 border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-on-surface-variant" />
                                <select name="tipoImagem" value={formData.tipoImagem} onChange={handleFormChange} className="w-full p-3 bg-surface border-2 border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                                    <option value="coffee">Café</option><option value="cup">Copo</option><option value="bean">Grão</option>
                                </select>
                                <motion.button whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 17 }} onClick={handleSalvarPedido} className="w-full bg-primary text-on-primary font-bold py-3 rounded-lg">Salvar Pedido</motion.button>
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
                                <motion.button whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 17 }} onClick={handleSalvarContato} className="w-full bg-primary text-on-primary font-bold py-3 rounded-lg">Salvar Contato</motion.button>
                            </div>
                        </div>
                    </Modal>
                )}

                 {/* CORREÇÃO: Chamando o Modal do WhatsApp da forma correta */}
                {whatsappModalOpen && (
                    <Modal key="whatsapp-modal" onClose={() => setWhatsappModalOpen(false)}>
                        <WhatsappModal 
                            contato={selectedContact}
                            onClose={() => setWhatsappModalOpen(false)} 
                        />
                    </Modal>
                )}
            </AnimatePresence>
        </main>
    );
};

export default HomePage;