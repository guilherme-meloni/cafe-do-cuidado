// src/app/page.jsx (VERSÃO FINAL COMPLETA - CONECTADO AO SUPABASE)
'use client';

import React, { useState, useEffect } from 'react';
import { getLocalData, setLocalData } from '../utils/localStorage';
import { supabase } from '../utils/supabaseClient';
import Modal from '../components/Modal';
import PedidoCard from '../components/PedidoCard';
import ContatoCard from '../components/ContatoCard';
import WhatsappModal from '../components/WhatsappModal';
import SkeletonCard from '../components/SkeletonCard';
import { AnimatePresence, motion } from 'framer-motion';
import { LuPlus, LuChefHat, LuBell, LuBellRing, LuBellOff } from "react-icons/lu"; 
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const VAPID_PUBLIC_KEY = 'BP7JRgSu5mlL4Pm5kr_JG4TQzQYHNhhxDbPlRLQkw_zI-gMB5L-AHPATO3iAf5xdZrRODHCx06lGMazbErRtOlk';
const SUPABASE_FUNCTION_URL = 'https://hzblgsovbgllcfqxeszn.supabase.co/functions/v1/save-subscription';

const calcularDiasRestantes = (q, d) => (d > 0 ? Math.floor(q / d) : 0);

const HomePage = () => {
    // ESTADOS
    const [pedidos, setPedidos] = useState([]);
    const [contatos, setContatos] = useState(() => getLocalData('contatos') || []);
    const [isLoading, setIsLoading] = useState(true);
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
    const [isSubscribing, setIsSubscribing] = useState(false);

    // EFEITOS
    useEffect(() => {
        fetchPedidos();
        if (typeof window !== 'undefined') {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js').catch(err => console.error('Service Worker não registrado', err));
            }
            if ('Notification' in window) {
                setNotificationPermission(Notification.permission);
            }
        }
    }, []);

    useEffect(() => { setLocalData('contatos', contatos); }, [contatos]);

    // FUNÇÕES
    const triggerHapticFeedback = () => { if (navigator?.vibrate) navigator.vibrate(50); };

    const fetchPedidos = async () => {
        setIsLoading(true);
        const { data, error } = await supabase.from('pedidos').select('*').order('created_at', { ascending: false });
        if (error) {
            console.error("Erro ao buscar pedidos:", error);
            alert("Não foi possível carregar os pedidos.");
        } else {
            setPedidos(data);
        }
        setIsLoading(false);
    };

    const handleRequestNotificationPermission = async () => {
        triggerHapticFeedback();
        setIsSubscribing(true);
        try {
            if (!('Notification' in window) || !navigator.serviceWorker) throw new Error('Notificações não suportadas');
            const permission = await Notification.requestPermission();
            setNotificationPermission(permission);
            if (permission === 'granted') {
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true, applicationServerKey: VAPID_PUBLIC_KEY
                });
                const response = await fetch(SUPABASE_FUNCTION_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(subscription)
                });
                if (!response.ok) throw new Error('Falha ao salvar inscrição no servidor.');
                new Notification('Inscrição Concluída!', {
                    body: 'Ótimo! As notificações push estão ativadas.', icon: '/icon-192x192.png'
                });
            }
        } catch (error) {
            console.error('Falha ao se inscrever:', error);
            alert('Não foi possível se inscrever. Verifique o console.');
        } finally {
            setIsSubscribing(false);
        }
    };

    const handleFormChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const resetPedidoForm = () => { setModalPedidoOpen(false); setEditIndex(null); setFormData({ nome: "", quantidade: "", doses: "", horario: "", tipoImagem: "coffee" }); };
    
    const handleOpenPedidoModal = (index = null) => {
        if (index !== null) {
            const itemParaEditar = pedidos[index];
            if (itemParaEditar) {
                 setEditIndex(index); 
                 // Garante que todos os campos do formulário existam no estado
                 setFormData({
                    nome: itemParaEditar.nome || "",
                    quantidade: itemParaEditar.quantidade || "",
                    doses: itemParaEditar.doses || "",
                    horario: itemParaEditar.horario || "",
                    tipoImagem: itemParaEditar.tipoImagem || "coffee"
                 });
            } else {
                 console.error("Item inválido para edição"); 
                 resetPedidoForm(); 
            }
        } else {
            setEditIndex(null);
            setFormData({ nome: "", quantidade: "", doses: "", horario: "", tipoImagem: "coffee" });
        }
        setModalPedidoOpen(true);
        triggerHapticFeedback();
    };

    const handleSalvarPedido = async () => {
        triggerHapticFeedback();
        const { nome, quantidade, doses, horario, tipoImagem } = formData;
        if (!nome.trim() || !quantidade || !doses) return;
        
        let pedidoData;
        if (editIndex !== null) {
            const pedidoOriginal = pedidos[editIndex];
            pedidoData = { ...pedidoOriginal, nome, quantidade: parseFloat(quantidade), doses: parseFloat(doses), horario, tipoImagem };
        } else {
            pedidoData = { nome, quantidade: parseFloat(quantidade), doses: parseFloat(doses), horario, tipoImagem, historico: [] };
        }

        const { error } = await supabase.from('pedidos').upsert(pedidoData).select();
        
        if (error) {
            console.error("Erro ao salvar pedido:", error);
            alert("Falha ao salvar o pedido.");
        } else {
            await fetchPedidos();
            resetPedidoForm();
        }
    };

    const handleServirPedido = async (index) => {
        triggerHapticFeedback();
        const p = pedidos[index];
        if (p && p.quantidade >= p.doses) {
            const novaQtd = parseFloat((p.quantidade - p.doses).toFixed(2));
            const novoRegistro = { data: new Date().toISOString() };
            const historicoAtual = p.historico || [];
            
            const { error } = await supabase.from('pedidos').update({ 
                quantidade: novaQtd, 
                historico: [...historicoAtual, novoRegistro] 
            }).eq('id', p.id);

            if (error) {
                console.error("Erro ao servir pedido:", error);
                return false;
            } else {
                await fetchPedidos();
                return true;
            }
        }
        return false;
    };

    const handleApagarPedido = async (index) => {
        triggerHapticFeedback();
        const pedidoParaApagar = pedidos[index];
        const { error } = await supabase.from('pedidos').delete().eq('id', pedidoParaApagar.id);
        if (error) {
            console.error("Erro ao apagar pedido:", error);
        } else {
            await fetchPedidos();
        }
    };

    const handleOpenHistoryModal = (index) => { const item = pedidos[index]; if (item) { setViewingHistoryFor(item); setHistoryModalOpen(true); triggerHapticFeedback(); } };
    const handleContatoFormChange = (e) => setContatoFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const resetContatoForm = () => { setModalContatoOpen(false); setEditContatoIndex(null); setContatoFormData({ nome: "", celular: "" }); };
    const handleOpenContatoModal = (index = null) => { if (index !== null) { const item = contatos[index]; if (item) { setEditContatoIndex(index); setContatoFormData(item); } } else { setEditContatoIndex(null); setContatoFormData({ nome: "", celular: "" }); } setModalContatoOpen(true); triggerHapticFeedback(); };
    const handleSalvarContato = () => { const { nome, celular } = contatoFormData; if (!nome.trim() || !celular.trim()) return; const updated = editContatoIndex !== null ? contatos.map((c, i) => (i === editContatoIndex ? contatoFormData : c)) : [...contatos, contatoFormData]; setContatos(updated); setLocalData('contatos', updated); resetContatoForm(); triggerHapticFeedback(); };
    const handleApagarContato = (index) => { const newContatos = contatos.filter((_, i) => i !== index); setContatos(newContatos); setLocalData('contatos', newContatos); triggerHapticFeedback(); };
    const handleWhatsappClick = (contato) => { setSelectedContact(contato); setWhatsappModalOpen(true); triggerHapticFeedback(); };

    const renderNotificationButton = () => {
        if (!isMounted) return <div className="p-2.5 w-[40px] h-[40px]"></div>;
        if (isSubscribing) {
            return <div title="Inscrevendo..." className="bg-secondary text-on-secondary p-2.5 rounded-full animate-spin"><LuPlus className="rotate-45" /></div>;
        }
        switch (notificationPermission) {
            case 'granted': return <div title="Notificações ativas" className="bg-tertiary text-on-tertiary p-2.5 rounded-full flex items-center justify-center"><LuBellRing /></div>;
            case 'denied': return <motion.button whileTap={{ scale: 0.95 }} title="Notificações bloqueadas" onClick={() => alert('As notificações foram bloqueadas. Você precisa ir nas configurações do seu navegador para permitir.')} className="bg-error text-on-error p-2.5 rounded-full"><LuBellOff /></motion.button>;
            default: return <motion.button whileTap={{ scale: 0.95 }} title="Ativar Notificações" onClick={handleRequestNotificationPermission} className="bg-secondary text-on-secondary p-2.5 rounded-full animate-pulse"><LuBell /></motion.button>;
        }
    };

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
                {isLoading ? (
                    <><SkeletonCard /><SkeletonCard /></>
                ) : (
                    <AnimatePresence>
                        {pedidos.map((p, index) => (
                            <PedidoCard 
                                key={p.id}
                                pedido={{...p, diasRestantes: calcularDiasRestantes(p.quantidade, p.doses)}} 
                                onServe={() => handleServirPedido(index)} 
                                onEdit={() => handleOpenPedidoModal(index)} 
                                onDelete={() => handleApagarPedido(index)}
                                onViewHistory={() => handleOpenHistoryModal(index)} 
                            />
                        ))}
                    </AnimatePresence>
                )}
            </div>
            { !isLoading && pedidos.length === 0 && <p className="text-on-surface-variant text-center mt-4">Nenhum pedido anotado ainda.</p>}

            <div className="flex justify-between items-center my-8 mt-12">
                <h1 className="text-xl font-bold text-on-surface flex items-center gap-3"><LuChefHat /> Baristas</h1>
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