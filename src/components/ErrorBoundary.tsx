import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Sparkles, Compass, ChevronDown, ChevronUp, RefreshCw, Heart, Activity } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
    showDetails: boolean;
    meditating: boolean;
    countdown: number;
    meditationPhase: 'inspire' | 'espire' | 'retencao' | 'concluido';
}

export class ErrorBoundary extends Component<Props, State> {
    private timer: NodeJS.Timeout | null = null;

    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
        showDetails: false,
        meditating: false,
        countdown: 10,
        meditationPhase: 'inspire'
    };

    public static getDerivedStateFromError(error: Error): State {
        return { 
            hasError: true, 
            error, 
            errorInfo: null,
            showDetails: false,
            meditating: false,
            countdown: 10,
            meditationPhase: 'inspire'
        };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error in Xzenpress:', error, errorInfo);
        this.setState({ errorInfo });
    }

    componentWillUnmount() {
        if (this.timer) clearInterval(this.timer);
    }

    startMeditation = () => {
        if (this.timer) clearInterval(this.timer);
        this.setState({ meditating: true, countdown: 10, meditationPhase: 'inspire' });

        this.timer = setInterval(() => {
            this.setState((prevState) => {
                const nextCount = prevState.countdown - 1;
                
                // Determina a fase da respiração com base nos segundos restantes
                let phase: 'inspire' | 'espire' | 'retencao' | 'concluido' = 'inspire';
                if (nextCount > 6) {
                    phase = 'inspire';
                } else if (nextCount > 3) {
                    phase = 'retencao';
                } else if (nextCount > 0) {
                    phase = 'espire';
                } else {
                    phase = 'concluido';
                }

                if (nextCount <= 0) {
                    if (this.timer) clearInterval(this.timer);
                    // Recarrega a página automaticamente ao concluir a meditação
                    setTimeout(() => window.location.reload(), 1000);
                    return { countdown: 0, meditationPhase: 'concluido' };
                }

                return { countdown: nextCount, meditationPhase: phase };
            });
        }, 1000);
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
                    {/* Efeitos de Fundo Orgânicos/Neon */}
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-[100px] animate-pulse delay-700" />
                    
                    <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative z-10 text-center">
                        
                        {/* Ícone Zen / Mandala Animada */}
                        <div className="flex justify-center mb-6 relative">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 relative">
                                <Compass className={`w-10 h-10 text-white ${this.state.meditating ? 'animate-spin' : 'animate-[spin_10s_linear_infinite]'}`} style={{ animationDuration: this.state.meditating ? '3s' : '15s' }} />
                                
                                {this.state.meditating && (
                                    <span className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping" />
                                )}
                            </div>
                        </div>

                        {/* Título & Mensagem Personalizada */}
                        <h1 className="text-2xl font-black text-slate-100 mb-3 tracking-tight">
                            Desculpe o Desequilíbrio... 🧘
                        </h1>
                        <p className="text-sm text-slate-400 leading-relaxed mb-6 px-2">
                            Parece que nossos osciladores quânticos de vitalidade ou os canais de fluxo de Chi sofreram um desalinhamento temporário. Nossos peptídeos de cura virtuais já foram acionados para restaurar o equilíbrio celular do sistema!
                        </p>

                        {/* Status da Manutenção / Alinhamento */}
                        <div className="bg-slate-950/60 rounded-2xl p-4 mb-6 border border-slate-800 text-left space-y-2">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Relatório de Bio-Harmonização:</p>
                            <div className="flex items-center space-x-2 text-xs">
                                <span className="text-emerald-400 font-bold">✓</span>
                                <span className="text-slate-300">Recalibrando Mitocôndrias</span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs">
                                <span className="text-amber-400 animate-pulse">●</span>
                                <span className="text-slate-300">Desobstruindo Canais de Chi (Fluxo Vital)</span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs">
                                <span className="text-slate-600">○</span>
                                <span className="text-slate-500">Alinhando Expressão Epigenética da Página</span>
                            </div>
                        </div>

                        {/* Mini Game / Meditação Interativa */}
                        {this.state.meditating ? (
                            <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-2xl p-6 mb-6 animate-fadeIn">
                                <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Exercício de Coerência Cardíaca</p>
                                
                                <div className="text-2xl font-black text-white my-3 animate-pulse">
                                    {this.state.meditationPhase === 'inspire' && '💨 Inspire Profundamente...'}
                                    {this.state.meditationPhase === 'retencao' && '🧘 Segure o ar...'}
                                    {this.state.meditationPhase === 'espire' && '🌬️ Espire Lentamente...'}
                                    {this.state.meditationPhase === 'concluido' && '✨ Conectando canais...'}
                                </div>

                                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-4">
                                    <div 
                                        className="bg-emerald-400 h-full transition-all duration-1000 ease-linear"
                                        style={{ width: `${(this.state.countdown / 10) * 100}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-slate-500 mt-2">Auto-reconexão em {this.state.countdown}s</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-95"
                                >
                                    <RefreshCw className="w-4 h-4 animate-[spin_4s_linear_infinite]" />
                                    <span>Harmonizar Canais</span>
                                </button>

                                <button
                                    onClick={this.startMeditation}
                                    className="flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold py-3 px-4 rounded-xl border border-slate-700 transition-all active:scale-95"
                                >
                                    <Heart className="w-4 h-4 text-rose-400 animate-pulse" />
                                    <span>Meditar por 10s</span>
                                </button>
                            </div>
                        )}

                        {/* Botão de Retorno */}
                        {!this.state.meditating && (
                            <button
                                onClick={() => {
                                    this.setState({ hasError: false });
                                    window.location.href = '/';
                                }}
                                className="text-xs text-slate-500 hover:text-slate-300 transition-colors underline block mx-auto mb-6"
                            >
                                Voltar para a Home (Retornar à Terra)
                            </button>
                        )}

                        {/* Diagnóstico Técnico (Expansível / Modo Dev) */}
                        {this.state.error && (
                            <div className="border-t border-slate-800 pt-4 text-left">
                                <button
                                    onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                                    className="w-full flex items-center justify-between text-xs text-slate-500 hover:text-slate-300 font-bold focus:outline-none"
                                >
                                    <span className="flex items-center"><Activity className="w-3.5 h-3.5 mr-1 text-slate-500" /> Diagnóstico de Bio-Ressonância (Modo Dev)</span>
                                    {this.state.showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>

                                {this.state.showDetails && (
                                    <div className="bg-black/50 p-4 rounded-xl overflow-auto mt-3 border border-red-950 max-h-48 text-left">
                                        <p className="text-red-400 font-mono text-xs font-bold mb-1">
                                            {this.state.error.toString()}
                                        </p>
                                        {this.state.errorInfo && (
                                            <pre className="text-slate-600 font-mono text-[9px] leading-tight">
                                                {this.state.errorInfo.componentStack}
                                            </pre>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
