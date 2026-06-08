import React, { useState } from 'react';
import { ArrowRight, Check, Sparkles, AlertCircle, Play } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

export const YNSAStudyPage = () => {
    const { t } = useLanguage();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [issue, setIssue] = useState('menopause');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const { error } = await supabase
                .from('ynsa_study_waitlist')
                .insert([
                    { name, email, hormonal_issue: issue }
                ]);

            if (error) {
                if (error.code === '23505') throw new Error('Este email já está na lista!');
                throw error;
            }

            setStatus('success');
            // Reset form
            setName('');
            setEmail('');
        } catch (err: any) {
            console.error('Error signing up:', err);
            setStatus('error');
            setErrorMsg(err.message || 'Erro ao salvar inscrição. Tente novamente.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans">
            {/* Hero Section */}
            <div className="relative pt-24 pb-16 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/30 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        {/* Text Content */}
                        <div className="flex-1 text-center lg:text-left">
                            <div className="inline-flex items-center space-x-2 bg-purple-500/20 text-purple-200 px-4 py-2 rounded-full mb-6 border border-purple-500/30">
                                <Sparkles className="w-4 h-4" />
                                <span className="text-sm font-semibold uppercase tracking-wider">XZenPress & Neurociência</span>
                            </div>

                            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                                <span className="bg-gradient-to-r from-white via-purple-100 to-purple-200 bg-clip-text text-transparent">
                                    O "Ponto Mágico"<br />Precisa de Prova.
                                </span>
                            </h1>

                            <p className="text-xl text-blue-100 mb-6 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                                Há 18 anos, cientistas alemães relataram <strong>99% de eficácia</strong> em distúrbios hormonais com um único ponto (YNSA).<br />
                                Na ciência, isso é "bom demais para ser verdade".
                            </p>

                            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light border-l-4 border-purple-500 pl-4">
                                Nós não queremos apenas acreditar. Queremos provar. O XZenPress está montando o primeiro grupo digital para validar se o "Ponto ZS" pode realmente reiniciar seu eixo hormonal.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <a href="#join-form" className="bg-white text-purple-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-white/20 flex items-center justify-center gap-2">
                                    Quero participar da História
                                    <ArrowRight className="w-5 h-5" />
                                </a>
                                <a href="/" className="border border-white/30 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/10 transition-all">
                                    Conhecer Plataforma
                                </a>
                            </div>
                        </div>

                        {/* Image/Visual */}
                        <div className="flex-1 relative max-w-lg lg:max-w-none">
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10"></div>
                                <img
                                    src="/ynsa_study_invitation_1770126730762.png"
                                    alt="YNSA ZS Point Visualization"
                                    className="w-full h-auto transform group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute bottom-6 left-6 z-20">
                                    <p className="text-white font-bold text-lg">Estudo de Replicação ZS-2026</p>
                                    <p className="text-purple-300 text-sm">Protocolo Digital Exclusivo</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Section */}
            <div id="join-form" className="py-20 bg-slate-900 border-t border-white/5">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 md:p-12 shadow-2xl border border-purple-500/20">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold mb-4">Você é elegível?</h2>
                            <p className="text-slate-400 mb-6">
                                Procuramos mulheres visionárias que sofram com Fogachos, Libido Baixa, TPM severa ou Amenorreia. Ajudem-nos a testar a neurofisiologia sem remédios.
                            </p>
                            <div className="inline-block bg-purple-900/30 text-purple-300 px-4 py-1 rounded-lg text-sm font-mono border border-purple-500/30">
                                VAGAS LIMITADAS: FASE 1 (500 PESSOAS)
                            </div>
                        </div>

                        {status === 'success' ? (
                            <div className="text-center py-10 animate-fade-in">
                                <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Check className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">Inscrição Confirmada!</h3>
                                <p className="text-slate-300 mb-8 max-w-md mx-auto">
                                    Você está oficialmente na lista de espera. Fique atenta ao seu e-mail para próximas instruções sobre o início do protocolo.
                                </p>

                                <div className="bg-slate-800/50 rounded-xl p-6 border border-white/10">
                                    <h4 className="text-lg font-semibold text-purple-300 mb-3">Enquanto você aguarda...</h4>
                                    <p className="text-slate-400 text-sm mb-4">
                                        Nossa plataforma já oferece 22 jornadas clínicas completas para ansiedade, sono e bem-estar.
                                    </p>
                                    <a href="/" className="text-white bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg font-medium transition-colors inline-block">
                                        Acessar Plataforma Agora
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">Nome Completo</label>
                                        <input
                                            type="text"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
                                            placeholder="Seu nome"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">E-mail Principal</label>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
                                            placeholder="seu@email.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Qual seu principal interesse?</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {[
                                            { id: 'menopause', label: 'Fogachos / Menopausa' },
                                            { id: 'pms', label: 'TPM Severa' },
                                            { id: 'libido', label: 'Aumento de Libido' },
                                            { id: 'other', label: 'Outro / Curiosidade' }
                                        ].map((option) => (
                                            <div
                                                key={option.id}
                                                onClick={() => setIssue(option.id)}
                                                className={`cursor-pointer px-4 py-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-between ${issue === option.id
                                                    ? 'bg-purple-600 border-purple-500 text-white'
                                                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-purple-500/50'
                                                    }`}
                                            >
                                                {option.label}
                                                {issue === option.id && <Check className="w-4 h-4" />}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {status === 'error' && (
                                    <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl text-sm flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        {errorMsg}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {status === 'loading' ? (
                                        <span className="animate-pulse">Processando...</span>
                                    ) : (
                                        <>Entrar na Lista de Espera <ArrowRight className="w-5 h-5" /></>
                                    )}
                                </button>

                                <p className="text-center text-xs text-slate-500">
                                    Seus dados estão protegidos pela nossa Política de Privacidade. Nenhuma promessa de cura é feita neste estudo experimental.
                                </p>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Simple */}
            <div className="border-t border-white/5 py-8 text-center text-slate-500 text-sm">
                <p>
                    "Na XZenPress, nós não seguimos tendências. Nós as testamos."<br />
                    © 2026 XZenPress Research Labs.
                </p>
            </div>
        </div>
    );
};
