// src/app/page.jsx (COM CORREÇÃO NO BOTÃO DE CRIAR CONTATO)
'use client';

import React, { useState, useEffect } from 'react';
import { getLocalData, setLocalData } from '../utils/localStorage';
import Modal from '../components/Modal';
import PedidoCard from '../components/PedidoCard';
import ContatoCard from '../components/ContatoCard';
import WhatsappModal from '../components/WhatsappModal';
import { AnimatePresence, motion } from 'framer-motion';
import { LuPlus, LuChefHat, LuBell, LuBellRing, LuBellOff } from "react-icons/lu"; 
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const calcularDiasRestantes = (q, d) => (d > 0 ? Math.floor(q / d) : 0);

const HomePage = () => {
    const [pedidos, setPedidos] = useState(() => getLocalData('pedidos') || []);
    const [contatos, setContatos] = useState(() => getLocalData('contatos') || []);
    const [modalPedidoOpen, setModalPedidoOpen] = useState(false);
    const [modalContatoOpen, setModalContatoOpen] = useState(false);
    const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [formData, setFormData] = useState({ nome: "", quantidade: "", doses: "", horario: "", tipoImagem: "coffee" });
    const [editContatoIndex, setEditContatoIndex] = useState(null);
    const [contatoFormData, setContatoFormData] = useState({ nome: "", celular: "" });
    const [selectedContact, setSelectedContact] = useState(null);
    const [viewingHistoryFor, setViewingHistoryFor] = useState(null);
    const [notificationPermission, setNotificationPermission] = useState('default');
    const [notificationTimers, setNotificationTimers] = useState({});

    useEffect(() => { setLocalData('pedidos', pedidos); }, [pedidos]);
    useEffect(() => { setLocalData('contatos', contatos); }, [contatos]);
    useEffect(() => {
        if ('Notification' in window) {
            setNotificationPermission(Notification.permission);
        }
    }, []);

    const triggerHapticFeedback = () => {
      if (navigator && navigator.vibrate) {
        navigator.vibrate(50);
      }
    };
    
    useEffect(() => {
        Object.values(notificationTimers).forEach(clearTimeout);
        const newTimers = {};
        if (notificationPermission === 'granted') {
            pedidos.forEach(pedido => {
                if (pedido && pedido.horario && pedido.id) {
                    const [horas, minutos] = pedido.horario.split(':');
                    const agora = new Date();
                    let dataNotificacao = new Date();
                    dataNotificacao.setHours(horas, minutos, 0, 0);

                    if (dataNotificacao <= agora) {
                        dataNotificacao.setDate(dataNotificacao.getDate() + 1);
                    }
                    const delay = dataNotificacao.getTime() - agora.getTime();
                    if (delay > 0) {
                        const timerId = setTimeout(() => {
                            new Notification('Hora do seu Cuidado!', {
                                body: `Está na hora de servir: ${pedido.nome}`,
                                icon: '/icon-192x192.png',
                                vibrate: [200, 100, 200]
                            });
                        }, delay);
                        newTimers[pedido.id] = timerId;
                    }
                }
            });
        }
        setNotificationTimers(newTimers);
        return () => {
            Object.values(newTimers).forEach(clearTimeout);
        };
    }, [pedidos, notificationPermission]);

    const handleRequestNotificationPermission = () => {
        triggerHapticFeedback();
        if (!('Notification' in window)) {
            alert('Este navegador não suporta notificações.');
            return;
        }
        Notification.requestPermission().then(permission => {
            setNotificationPermission(permission);
            if (permission === 'granted') {
                new Notification('Café do Cuidado', {
                    body: 'Ótimo! As notificações estão ativadas.',
                    icon: '/icon-192x192.png'
                });
            }
        });
    };

    const handleFormChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const resetPedidoForm = () => { setModalPedidoOpen(false); setEditIndex(null); setFormData({ nome: "", quantidade: "", doses: "", horario: "", tipoImagem: "coffee" }); };
    
    const handleOpenPedidoModal = (index = null) => {
        if (index !== null) {
            const itemParaEditar = pedidos[index];
            if (itemParaEditar) { setEditIndex(index); setFormData(itemParaEditar); } 
            else { console.error("Item inválido"); resetPedidoForm(); }
        } else {
            setEditIndex(null);
            setFormData({ nome: "", quantidade: "", doses: "", horario: "", tipoImagem: "coffee" });
        }
        setModalPedidoOpen(true);
        triggerHapticFeedback();
    };

    const handleSalvarPedido = () => {
        const { nome, quantidade, doses } = formData;
        if (!nome.trim() || !quantidade || !doses) return;
        let novoPedido;
        if (editIndex !== null) {
            novoPedido = { ...pedidos[editIndex], ...formData, quantidade: parseFloat(quantidade), doses: parseFloat(doses), diasRestantes: calcularDiasRestantes(parseFloat(quantidade), parseFloat(doses)) };
        } else {
            novoPedido = { ...formData, id: Date.now(), quantidade: parseFloat(quantidade), doses: parseFloat(doses), diasRestantes: calcularDiasRestantes(parseFloat(quantidade), parseFloat(doses)), historico: [] };
        }
        const updated = editIndex !== null ? pedidos.map((p, i) => (i === editIndex ? novoPedido : p)) : [...pedidos, novoPedido];
        setPedidos(updated);
        resetPedidoForm();
        triggerHapticFeedback();
    };

    const handleServirPedido = (index) => {
        const p = pedidos[index];
        if (p && p.quantidade >= p.doses) {
            const novaQtd = parseFloat((p.quantidade - p.doses).toFixed(2));
            const novoRegistro = { data: new Date().toISOString() };
            const historicoAtual = p.historico || [];
            const updated = pedidos.map((item, i) => (i === index ? { ...item, quantidade: novaQtd, diasRestantes: calcularDiasRestantes(novaQtd, p.doses), historico: [...historicoAtual, novoRegistro] } : item));
            setPedidos(updated);
            triggerHapticFeedback();
            return true;
        } else { return false; }
    };

    const handleApagarPedido = (index) => { setPedidos(pedidos.filter((_, i) => i !== index)); triggerHapticFeedback(); };
    const handleOpenHistoryModal = (index) => { const item = pedidos[index]; if (item) { setViewingHistoryFor(item); setHistoryModalOpen(true); triggerHapticFeedback(); } };
    
    const handleContatoFormChange = (e) => setContatoFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const resetContatoForm = () => { setModalContatoOpen(false); setEditContatoIndex(null); setContatoFormData({ nome: "", celular: "" }); };
    
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
        triggerHapticFeedback(); 
    };
    
    const handleApagarContato = (index) => { setContatos(contatos.filter((_, i) => i !== index)); triggerHapticFeedback(); };
    const handleWhatsappClick = (contato) => { setSelectedContact(contato); setWhatsappModalOpen(true); triggerHapticFeedback(); };

    const renderNotificationButton = () => {
        switch (notificationPermission) {
            case 'granted': return <div title="Notificações ativas" className="bg-tertiary text-on-tertiary p-2.5 rounded-full flex items-center justify-center"><LuBellRing /></div>;
            case 'denied': return <motion.button whileTap={{ scale: 0.95 }} title="Notificações bloqueadas" onClick={() => alert('As notificações foram bloqueadas. Você precisa ir nas configurações do seu navegador para permitir.')} className="bg-error text-on-error p-2.5 rounded-full"><LuBellOff /></motion.button>;
            default: return <motion.button whileTap={{ scale: 0.95 }} title="Ativar Notificações" onClick={handleRequestNotificationPermission} className="bg-secondary text-on-secondary p-2.5 rounded-full animate-pulse"><LuBell /></motion.button>;
        }
    }

    return (
        <main className="p-4 font-sans min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-on-surface">Café do Cuidado</h1>
                <div className="flex items-center gap-2">
                    {renderNotificationButton()}
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleOpenPedidoModal()} className="bg-primary text-on-primary font-bold py-2 px-4 rounded-full flex items-center gap-2 text-sm">
                        <LuPlus /> Pedido
                    </motion.button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
                <AnimatePresence>
                    {pedidos.map((p, index) => (
                        p && <PedidoCard key={p.id || index} pedido={p} onServe={() => handleServirPedido(index)} onEdit={() => handleOpenPedidoModal(index)} onDelete={() => handleApagarPedido(index)} onViewHistory={() => handleOpenHistoryModal(index)} />
                    ))}
                </AnimatePresence>
            </div>

            <div className="flex justify-between items-center my-8 mt-12">
                <h1 className="text-xl font-bold text-on-surface flex items-center gap-3"><LuChefHat /> Baristas</h1>
                {/* CORREÇÃO AQUI */}
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleOpenContatoModal()} className="bg-primary text-on-primary font-bold py-2 px-4 rounded-full flex items-center gap-2 text-sm">
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
                            <h2 className="text-2xl font-bold text-center mb-4 text-primary">{editIndex !== null ? 'Editando Pedido' : 'Anotar Novo Pedido'}</h2>
                            <div className="space-y-4">
                                <input type="text" name="nome" value={formData.nome} onChange={handleFormChange} placeholder="Nome (Ex: Expresso Duplo)" className="w-full p-3 bg-surface border-2 border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                                <input type="number" name="quantidade" value={formData.quantidade} onChange={handleFormChange} placeholder="Quantidade" className="w-full p-3 bg-surface border-2 border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                                <input type="number" name="doses" value={formData.doses} onChange={handleFormChange} placeholder="Doses por dia" className="w-full p-3 bg-surface border-2 border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                                <input type="time" name="horario" value={formData.horario} onChange={handleFormChange} className="w-full p-3 bg-surface border-2 border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-on-surface-variant" />
                                <select name="tipoImagem" value={formData.tipoImagem} onChange={handleFormChange} className="w-full p-3 bg-surface border-2 border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                                    <option value="coffee">Café</option><option value="cup">Copo</option><option value="bean">Grão</option>
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
                                            Servido em: {format(new Date(reg.data), "dd 'de' MMMM, HH:mm 'h'", { locale: ptBR })}
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