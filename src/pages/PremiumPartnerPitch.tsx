import React from 'react';
import { Shield, TrendingUp, Cpu, Award, ArrowRight, Dna, Bot, Zap, ArrowLeft, Star, Users, CheckCircle2 } from 'lucide-react';

interface PremiumPartnerPitchProps {
    onPageChange?: (page: string) => void;
}

export const PremiumPartnerPitch: React.FC<PremiumPartnerPitchProps> = ({ onPageChange }) => {
    
    const waLink = "https://wa.me/5562983316363?text=Ol%C3%A1%20Aleksayev,%20vi%20a%20apresenta%C3%A7%C3%A3o%20do%20Xzenpress%20e%20tenho%20interesse%20na%20parceria%20exclusiva.";
    const emailLink = "mailto:Aleksayev@gmail.com?subject=Parceria%20Exclusiva%20-%20Xzenpress";

    return (
        <div className="min-h-screen bg-slate-900 font-sans text-slate-200 selection:bg-indigo-500/30">
            {/* Header */}
            <div className="absolute top-0 left-0 w-full p-6 z-50 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Dna className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">XZENPRESS</span>
                </div>
                {onPageChange && (
                    <button onClick={() => onPageChange('home')} className="text-slate-400 hover:text-white transition-colors flex items-center text-sm font-medium">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao App
                    </button>
                )}
            </div>

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden border-b border-slate-800">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-[40%] -right-[20%] w-[70%] h-[100%] rounded-full bg-gradient-to-br from-indigo-600/20 to-purple-800/20 blur-3xl" />
                    <div className="absolute -bottom-[40%] -left-[20%] w-[70%] h-[100%] rounded-full bg-gradient-to-tr from-emerald-600/10 to-teal-800/10 blur-3xl" />
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center rounded-full px-4 py-1.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-sm font-semibold mb-8 uppercase tracking-widest backdrop-blur-sm">
                        <Star className="w-4 h-4 mr-2 fill-indigo-300" />
                        Apenas para Convidados Hors-Concours
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
                        A Próxima Era da <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400">
                            Medicina Integrativa
                        </span>
                    </h1>
                    <p className="mt-6 max-w-3xl mx-auto text-xl md:text-2xl text-slate-400 leading-relaxed font-light">
                        Junte-se à primeira plataforma guiada por Inteligência Artificial (Self Oracle) que conecta pacientes de alta performance aos <b>melhores laboratórios e farmácias magistrais</b> do país.
                    </p>
                    <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
                        <a href={waLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-2xl text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] hover:shadow-[0_0_60px_-15px_rgba(79,70,229,0.7)] hover:-translate-y-1">
                            Reservar Exclusividade <ArrowRight className="ml-2 w-5 h-5" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Platform Preview Section */}
            <div className="py-24 bg-slate-900/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-white mb-4">A Vitrine Perfeita para sua Marca</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto text-lg">Nosso ecossistema não exibe anúncios aleatórios. Nós recomendamos sua marca de forma inteligente através do nosso Herbário e IA.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50 backdrop-blur-md">
                                <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-4 border border-emerald-500/30">
                                    <Bot className="w-6 h-6 text-emerald-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Recomendação Contextual por IA</h3>
                                <p className="text-slate-400 leading-relaxed">Quando nosso <i>Self Oracle</i> orientar um paciente sobre Peptídeos ou Fitoterápicos, sua farmácia será a recomendação número 1 de onde adquirir com segurança e laudo de pureza.</p>
                            </div>
                            
                            <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50 backdrop-blur-md">
                                <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-4 border border-purple-500/30">
                                    <TrendingUp className="w-6 h-6 text-purple-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Tráfego Altamente Qualificado</h3>
                                <p className="text-slate-400 leading-relaxed">Usuários da Xzenpress são biohackers e pacientes focados em performance e longevidade. O ticket médio e a taxa de recompra deste público são exponencialmente maiores.</p>
                            </div>
                        </div>

                        {/* Mockup UI */}
                        <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-50"><Shield className="w-32 h-32 text-slate-700" /></div>
                            <div className="relative z-10">
                                <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-4 rounded-xl text-white mb-4">
                                    <h4 className="font-bold text-lg">CJC-1295 / Ipamorelin</h4>
                                    <p className="text-xs opacity-80">Peptídeo Bio-idêntico</p>
                                </div>
                                <div className="space-y-3 mb-6">
                                    <div className="h-2 w-3/4 bg-slate-700 rounded-full"></div>
                                    <div className="h-2 w-full bg-slate-700 rounded-full"></div>
                                    <div className="h-2 w-5/6 bg-slate-700 rounded-full"></div>
                                </div>
                                <div className="p-4 bg-slate-900/80 rounded-xl border border-indigo-500/30 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-indigo-500/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-semibold">Parceiro Oficial</p>
                                            <p className="font-bold text-white flex items-center">
                                                <Award className="w-4 h-4 mr-1 text-yellow-400" /> [Sua Marca Aqui]
                                            </p>
                                        </div>
                                        <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold py-2 px-4 rounded-lg transition-colors">
                                            Adquirir Fórmula
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Metrics & Authority */}
            <div className="py-24 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-white mb-16">Por que ser o Parceiro Fundador?</h2>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-8">
                            <Cpu className="w-12 h-12 text-indigo-400 mx-auto mb-6" />
                            <h3 className="text-xl font-bold text-white mb-3">Tecnologia Proprietária</h3>
                            <p className="text-slate-400 text-sm">IA treinada especificamente em Medicina Tradicional Chinesa, Fitoterapia e Protocolos de Biohacking.</p>
                        </div>
                        <div className="p-8 relative">
                            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent rounded-3xl border border-indigo-500/10"></div>
                            <Shield className="w-12 h-12 text-emerald-400 mx-auto mb-6 relative z-10" />
                            <h3 className="text-xl font-bold text-white mb-3 relative z-10">Monopólio de Nicho</h3>
                            <p className="text-slate-400 text-sm relative z-10">Selecionamos apenas UM parceiro oficial por categoria (Ex: Apenas uma farmácia de manipulação master).</p>
                        </div>
                        <div className="p-8">
                            <Users className="w-12 h-12 text-purple-400 mx-auto mb-6" />
                            <h3 className="text-xl font-bold text-white mb-3">Retenção Absoluta</h3>
                            <p className="text-slate-400 text-sm">O usuário cria vínculo com seu Assistente IA, garantindo acesso diário à plataforma e LTV altíssimo para as suas fórmulas.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA / Footer */}
            <div className="relative py-24 overflow-hidden border-t border-slate-800 bg-slate-900">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-900/20 pointer-events-none"></div>
                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <h2 className="text-4xl font-bold text-white mb-6">Assuma a Liderança do Mercado</h2>
                    <p className="text-xl text-slate-400 mb-10">Não seja mais uma marca brigando por preço no Google Ads. Posicione-se como autoridade científica dentro do Xzenpress.</p>
                    
                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center bg-slate-800/80 p-8 rounded-3xl border border-slate-700/80 backdrop-blur-sm">
                        <div className="text-left flex-1">
                            <h3 className="text-white font-bold text-lg mb-2">Fale com Aleksayev</h3>
                            <div className="space-y-2">
                                <p className="text-slate-400 flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400"/> Vagas Hors-Concours limitadas</p>
                                <p className="text-slate-400 flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400"/> Integração imediata na plataforma</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 w-full sm:w-auto">
                            <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center px-6 py-3 text-sm font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 transition-colors w-full">
                                Chamar no WhatsApp
                            </a>
                            <a href={emailLink} className="flex items-center justify-center px-6 py-3 text-sm font-bold rounded-xl text-slate-300 bg-slate-700 hover:bg-slate-600 hover:text-white transition-colors w-full">
                                Enviar E-mail
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
