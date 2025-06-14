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
import { LuPlus, LuChefHat } from "react-icons/lu";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const HomePage = () => {
    // ESTADOS
    const [pedidos, setPedidos] = useState([]);
    const [contatos, setContatos] = useState(() => getLocalData('contatos') || []);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSavingContato, setIsSavingContato] = useState(false);
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

    // EFEITO: Buscar dados iniciais
    useEffect(() => {
        fetchPedidos();
    }, []);

    // EFEITO: Salvar contatos no localStorage
    useEffect(() => {
        setLocalData('contatos', contatos);
    }, [contatos]);

    // EFEITO: Inicializar OneSignal
    useEffect(() => {
        if (typeof window !== 'undefined' && 'OneSignal' in window) {
            window.OneSignal.push(function() {
                OneSignal.init({
                    // IMPORTANTE: Troque pela sua chave real do OneSignal!
                    appId: "d19614d4-ce34-4d7e-88ac-8a7e375278b9", 
                });

                OneSignal.getUserId(function(playerId) {
                    if (playerId) {
                        console.log("OneSignal Player ID:", playerId);
                        localStorage.setItem('oneSignalPlayerId', playerId);
                    }
                });
            });
        }
    }, []);

    // FUNÇÕES GERAIS
    const triggerHapticFeedback = () => { if (navigator?.vibrate) navigator.vibrate(50); };

    const fetchPedidos = async () => {
        setIsLoading(true);
        const { data, error } = await supabase.from('pedidos').select('*').order('created_at', { ascending: false });
        if (error) {
            console.error("Erro ao buscar pedidos:", error);
            alert("Não foi possível carregar os pedidos.");
        } else {
            setPedidos(data || []);
        }
        setIsLoading(false);
    };
    
    // FUNÇÕES DE PEDIDO
    const handleFormChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    
    const resetPedidoForm = () => {
        setModalPedidoOpen(false);
        setEditPedido(null);
        setFormData({ nome: "", quantidade: "", doses: "", horario: "", tipoImagem: "coffee" });
    };

    const handleOpenPedidoModal = (pedido = null) => {
        triggerHapticFeedback();
        if (pedido) {
            setEditPedido(pedido);
            setFormData({
                nome: pedido.nome || "",
                quantidade: pedido.quantidade || "",
                doses: pedido.doses || "",
                horario: pedido.horario || "",
                tipoImagem: pedido.tipoImagem || "coffee"
            });
        } else {
            setEditPedido(null);
            setFormData({ nome: "", quantidade: "", doses: "", horario: "", tipoImagem: "coffee" });
        }
        setModalPedidoOpen(true);
    };

    const handleSalvarPedido = async () => {
        triggerHapticFeedback();
        const { nome, quantidade, doses, horario, tipoImagem } = formData;
        if (!nome.trim() || !quantidade || !doses) {
            alert("Por favor, preencha nome, quantidade e doses.");
            return;
        }

        setIsSaving(true);
        const pedidoData = {
            nome: nome.trim(),
            quantidade: parseFloat(quantidade),
            doses: parseFloat(doses),
            horario: horario || null,
            tipoImagem
        };

        let error;
        if (editPedido) {
            const { error: updateError } = await supabase.from('pedidos').update(pedidoData).eq('id', editPedido.id);
            error = updateError;
        } else {
            const { error: insertError } = await supabase.from('pedidos').insert([{ ...pedidoData, historico: [] }]);
            error = insertError;
        }

        if (error) {
            setIsSaving(false);
            console.error("Erro ao salvar pedido:", error);
            alert(`Falha ao salvar o pedido: ${error.message}`);
        } else {
            await fetchPedidos();
            
            // --- LÓGICA DE NOTIFICAÇÃO ---
            // Apenas agenda se for um NOVO pedido e tiver horário
            if (!editPedido && formData.horario) {
                await scheduleNotification(formData);
            }
            
            setIsSaving(false);
            resetPedidoForm();
        }
    };

    const scheduleNotification = async (pedidoData) => {
        const playerId = localStorage.getItem('oneSignalPlayerId');
        if (!playerId) {
            alert("Não foi possível encontrar o ID para notificações. Por favor, habilite as notificações nas configurações do site.");
            return;
        }

        try {
            console.log(`Tentando agendar notificação para ${pedidoData.nome} às ${pedidoData.horario}`);
            const hoje = new Date();
            const [horas, minutos] = pedidoData.horario.split(':');
            hoje.setHours(horas, minutos, 0, 0);

            // Se o horário já passou hoje, agenda para amanhã
            if (hoje < new Date()) {
                hoje.setDate(hoje.getDate() + 1);
            }

            const ano = hoje.getFullYear();
            const mes = String(hoje.getMonth() + 1).padStart(2, '0');
            const dia = String(hoje.getDate()).padStart(2, '0');
            
            // Formato: "2025-06-15 14:30:00 GMT-0300" (Fuso de Brasília)
            const sendAfter = `${ano}-${mes}-${dia} ${pedidoData.horario}:00 GMT-0300`;

            const { data, error: invokeError } = await supabase.functions.invoke('schedule-notification', {
                body: {
                    playerId: playerId,
                    horario: sendAfter,
                    nomeMedicamento: pedidoData.nome,
                },
            });

            if (invokeError) throw invokeError;

            console.log("Resposta da Edge Function:", data);
            alert("Pedido salvo e notificação agendada com sucesso!");

        } catch (error) {
            console.error("Erro ao chamar a Edge Function de notificação:", error);
            alert("O pedido foi salvo, mas houve uma falha ao agendar a notificação.");
        }
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
        if (!confirm(`Tem certeza que deseja apagar o pedido "${pedido.nome}"?`)) return;
        const { error } = await supabase.from('pedidos').delete().eq('id', pedido.id);
        if (error) console.error("Erro ao apagar pedido:", error);
        else await fetchPedidos();
    };

    const handleOpenHistoryModal = (pedido) => { setViewingHistoryFor(pedido); setHistoryModalOpen(true); triggerHapticFeedback(); };
    
    // FUNÇÕES DE CONTATO
    const handleContatoFormChange = (e) => setContatoFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const resetContatoForm = () => { setModalContatoOpen(false); setEditContatoIndex(null); setContatoFormData({ nome: "", celular: "" }); };
    const handleOpenContatoModal = (index = null) => { triggerHapticFeedback(); if (index !== null) { setEditContatoIndex(index); setContatoFormData(contatos[index]); } else { setEditContatoIndex(null); setContatoFormData({ nome: "", celular: "" }); } setModalContatoOpen(true); };
    const handleSalvarContato = () => {
        triggerHapticFeedback();
        setIsSavingContato(true);
        const { nome, celular } = contatoFormData;
        if (!nome.trim() || !celular.trim()) {
             alert("Nome e celular são obrigatórios.");
             setIsSavingContato(false);
             return;
        }
        const updated = editContatoIndex !== null ? contatos.map((c, i) => (i === editContatoIndex ? contatoFormData : c)) : [...contatos, contatoFormData];
        setContatos(updated);
        setLocalData('contatos', updated);
        setIsSavingContato(false);
        resetContatoForm();
    };
    const handleApagarContato = (index) => {
        triggerHapticFeedback();
        if (!confirm(`Tem certeza que deseja apagar o contato "${contatos[index].nome}"?`)) return;
        const newContatos = contatos.filter((_, i) => i !== index);
        setContatos(newContatos);
        setLocalData('contatos', newContatos);
    };
    const handleWhatsappClick = (contato) => { triggerHapticFeedback(); setSelectedContact(contato); setWhatsappModalOpen(true); };

    // RENDERIZAÇÃO DO COMPONENTE
    return (
        <main className="p-4 font-sans min-h-screen bg-surface">
            {/* ... o resto do seu JSX (return) permanece igual ... */}
            {/* Copie e cole a partir daqui o seu return original, pois ele não precisa de mudanças */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-on-surface">Café do Cuidado</h1>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleOpenPedidoModal(null)} className="bg-primary text-on-primary font-bold py-2 px-4 rounded-full flex items-center gap-2 text-sm shadow-lg">
                    <LuPlus /> Pedido
                </motion.button>
            </div>

            {/* Botão para pedir permissão (opcional, mas recomendado) */}
            <button onClick={() => OneSignal.showNativePrompt()} className="w-full mb-4 p-2 bg-secondary text-on-secondary rounded-lg">
                Ativar Notificações
            </button>

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
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleOpenContatoModal(null)} className="bg-secondary text-on-secondary font-bold py-2 px-4 rounded-full flex items-center gap-2 text-sm shadow-lg">
                    <LuPlus /> Contato
                </motion.button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <AnimatePresence>{contatos.map((c, index) => (c && <ContatoCard key={c.nome + index} contato={c} onEdit={() => handleOpenContatoModal(index)} onDelete={() => handleApagarContato(index)} onWhatsappClick={() => handleWhatsappClick(c)} />))}</AnimatePresence>
            </div>
            {!isLoading && contatos.length === 0 && <p className="text-on-surface-variant text-center mt-4">Nenhum barista adicionado.</p>}
            
            <AnimatePresence mode="wait">
                {modalPedidoOpen && (
                    <Modal key="pedido-modal" onClose={resetPedidoForm}>
                        <div className="bg-surface-container-high rounded-t-2xl p-6 pt-12 relative w-full max-w-md mx-auto">
                            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-outline-variant rounded-full" />
                            <h2 className="text-2xl font-bold text-center mb-4 text-primary">{editPedido ? 'Editando Pedido' : 'Anotar Novo Pedido'}</h2>
                            <div className="space-y-4">
                                <input type="text" name="nome" value={formData.nome} onChange={handleFormChange} placeholder="Nome (Ex: Expresso Duplo)" className="w-full p-3 bg-surface border-2 border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                                <input type="number" name="quantidade" value={formData.quantidade} onChange={handleFormChange} placeholder="Quantidade em estoque" className="w-full p-3 bg-surface border-2 border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                                <input type="number" name="doses" value={formData.doses} onChange={handleFormChange} placeholder="Doses por dia" className="w-full p-3 bg-surface border-2 border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                                <input type="time" name="horario" value={formData.horario} onChange={handleFormChange} className="w-full p-3 bg-surface border-2 border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-on-surface-variant" />
                                <select name="tipoImagem" value={formData.tipoImagem} onChange={handleFormChange} className="w-full p-3 bg-surface border-2 border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                                    <option value="coffee">Café</option>
                                    <option value="cup">Copo</option>
                                    <option value="bean">Grão</option>
                                </select>
                                <motion.button whileTap={{ scale: 0.98 }} onClick={handleSalvarPedido} disabled={isSaving} className="w-full bg-primary text-on-primary font-bold py-3 rounded-lg disabled:bg-primary/50">
                                    {isSaving ? 'Salvando...' : 'Salvar Pedido'}
                                </motion.button>
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
                                <motion.button whileTap={{ scale: 0.98 }} onClick={handleSalvarContato} disabled={isSavingContato} className="w-full bg-primary text-on-primary font-bold py-3 rounded-lg disabled:bg-primary/50">
                                    {isSavingContato ? 'Salvando...' : 'Salvar Contato'}
                                </motion.button>
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