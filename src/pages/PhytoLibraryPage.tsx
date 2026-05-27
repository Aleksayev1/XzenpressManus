import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
    ArrowLeft, Leaf, Search, MapPin, AlertTriangle, BookOpen, Activity, 
    Heart, Sprout, Dna, ShoppingCart, Sparkles, Brain, Compass, Clock, 
    Utensils, ChevronDown, ChevronUp, Loader, RotateCcw, Shield, HelpCircle,
    ZoomIn, X
} from 'lucide-react';
import { HERB_DATABASE, Herb } from '../data/herbLibrary';
import { acupressurePoints } from '../data/points/index';

interface PhytoLibraryPageProps {
    onPageChange?: (page: string) => void;
}

interface OracleProtocol {
    titulo: string;
    visaoIntegrativa: string;
    deficiencias: Array<{
        nutriente: string;
        probabilidade: string;
        mecanismo: string;
        evidencia: string;
    }>;
    protocolo: {
        alimentacao: {
            priorizar: string[];
            evitar: string[];
            receitaMTC: string;
        };
        suplementos: Array<{
            nome: string;
            dose: string;
            timing: string;
            sinergia: string;
        }>;
        fitoterapia: {
            plantasBrasileiras: string[];
            plantasMTC: string[];
        };
        peptideos?: {
            indicados: string[];
            nota: string;
        };
        pontosYNSA?: string[];
        pontosMTC?: string[];
        praticasComplementares?: string[];
    };
    epigenetica: string;
    almaEmocional: string;
    alertas: string[];
    fontes: string[];
}

export const PhytoLibraryPage: React.FC<PhytoLibraryPageProps> = ({ onPageChange }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'Todos' | 'Brasil' | 'China (MTC)' | 'Peptídeos'>('Todos');
    
    // Estados do Oráculo de Deficiências
    const [oracleResult, setOracleResult] = useState<OracleProtocol | null>(null);
    const [isOracleLoading, setIsOracleLoading] = useState(false);
    const [oracleError, setOracleError] = useState<string | null>(null);
    const [showOracleDetails, setShowOracleDetails] = useState(true);

    // Estados do Zoom Modal de Imagens
    const [showZoomModal, setShowZoomModal] = useState(false);
    const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);

    // Helper de segurança de URLs para WebView de celular (Android/iOS)
    const getSafeImagePath = (path: string | undefined | null): string => {
        if (!path) return '';
        return encodeURI(path);
    };

    // Helper para cruzar texto do Oráculo com dados reais dos pontos estáticos
    const getMatchingPoint = (pointStr: string) => {
        if (!pointStr) return undefined;
        const cleanStr = pointStr.toLowerCase();
        
        // Casos especiais de correspondência para Ponto ZS da Craniopuntura
        if (cleanStr.includes('zs') || cleanStr.includes('zeise-suess') || cleanStr.includes('zeise suess')) {
            return acupressurePoints.find(p => p.id === 'ynsa-zs-point' || p.id === 'hormonal-feminino-zs');
        }
        
        // Busca por correspondência exata do ID
        for (const point of acupressurePoints) {
            const pid = point.id.toLowerCase();
            if (cleanStr.includes(pid)) return point;
            
            // Tratamento para prefixos de meridianos tradicionais em Português vs Inglês
            // ex: R3 -> KD3, E36 -> ST36, IG4 -> LI4, BP6 -> SP6, VG20 -> GV20, VC17 -> CV17, ID3 -> SI3
            const pidMtc = pid
                .replace('kd', 'r')
                .replace('st', 'e')
                .replace('li', 'ig')
                .replace('sp', 'bp')
                .replace('gv', 'vg')
                .replace('cv', 'vc')
                .replace('si', 'id');
            
            if (cleanStr.includes(pidMtc)) return point;
        }
        
        // Busca por correspondência de termos do nome (ex: "Zusanli", "Sanyinjiao", "Hegu")
        for (const point of acupressurePoints) {
            const nameParts = point.name.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
            for (const part of nameParts) {
                if (part.length > 3 && cleanStr.includes(part)) {
                    return point;
                }
            }
        }
        
        return undefined;
    };

    const matchesSearch = (herb: Herb) =>
        herb.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        herb.scientificName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        herb.indications.some(i => i.toLowerCase().includes(searchTerm.toLowerCase()));

    const filteredHerbs = HERB_DATABASE.filter(herb => {
        let matchesTab = true;
        if (activeTab === 'Brasil') matchesTab = herb.origin === 'Brasil';
        if (activeTab === 'China (MTC)') matchesTab = herb.origin === 'China (MTC)';
        if (activeTab === 'Peptídeos') matchesTab = herb.origin === 'Peptídeo (Sintético/Bio-idêntico)';
        return matchesSearch(herb) && matchesTab;
    });

    // Grupos ordenados para a aba "Todos"
    const brasilHerbs = HERB_DATABASE.filter(h => h.origin === 'Brasil' && matchesSearch(h));
    const mtcHerbs = HERB_DATABASE.filter(h => h.origin === 'China (MTC)' && matchesSearch(h));
    const peptideHerbs = HERB_DATABASE.filter(h => h.origin === 'Peptídeo (Sintético/Bio-idêntico)' && matchesSearch(h));
    const isGroupedView = activeTab === 'Todos';

    // Chamada à Netlify Function deficiency-oracle
    const handleConsultOracle = async (customTerm?: string) => {
        const query = (customTerm || searchTerm).trim();
        if (!query || query.length < 3) {
            setOracleError('Por favor, digite um sintoma ou queixa com pelo menos 3 caracteres.');
            return;
        }

        setIsOracleLoading(true);
        setOracleError(null);
        setOracleResult(null);

        try {
            // Detecta dinamicamente se está rodando em ambiente mobile nativo (Capacitor/WebView)
            const isNativeMobile = window.location.protocol === 'capacitor:' || 
                                   window.location.protocol === 'file:' || 
                                   (window.hasOwnProperty('Capacitor') && (window as any).Capacitor?.isNativePlatform?.());
            const baseApiUrl = isNativeMobile ? 'https://xzenpress.com' : '';

            const response = await fetch(`${baseApiUrl}/.netlify/functions/deficiency-oracle`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symptom: query })
            });

            if (!response.ok) {
                throw new Error('Não foi possível se conectar com o Oráculo no momento.');
            }

            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }

            if (data.protocol) {
                setOracleResult(data.protocol);
                setShowOracleDetails(true);
            } else {
                throw new Error('Nenhum protocolo foi gerado. Tente reformular a queixa.');
            }
        } catch (err: any) {
            console.error('Erro ao consultar Oráculo:', err);
            setOracleError(err.message || 'Erro ao processar sua consulta de saúde integrativa.');
        } finally {
            setIsOracleLoading(false);
        }
    };

    const HerbCard = ({ herb }: { herb: Herb }) => {
        const isBrasil = herb.origin === 'Brasil';
        const isPeptide = herb.origin === 'Peptídeo (Sintético/Bio-idêntico)';

        let bgGradient = 'bg-gradient-to-r from-red-600 to-orange-500';
        let IconCard = Leaf;
        let iconColor = 'text-red-100';

        if (isBrasil) {
            bgGradient = 'bg-gradient-to-r from-emerald-600 to-green-500';
            IconCard = Sprout;
            iconColor = 'text-emerald-100';
        } else if (isPeptide) {
            bgGradient = 'bg-gradient-to-r from-indigo-600 to-blue-500';
            IconCard = Dna;
            iconColor = 'text-indigo-100';
        }

        return (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all flex flex-col">
                <div className={`p-4 text-white flex justify-between items-start ${bgGradient}`}>
                    <div>
                        <h3 className="text-xl font-bold">{herb.name}</h3>
                        <p className="text-sm opacity-90 italic">{herb.scientificName}</p>
                    </div>
                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                        <IconCard className={`w-6 h-6 ${iconColor}`} />
                    </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">
                        <MapPin className="w-4 h-4 mr-1" />
                        {herb.origin} • {herb.partUsed}
                    </div>

                    <div className="mb-4">
                        <h4 className="text-sm font-bold text-gray-900 flex items-center mb-1">
                            <Activity className="w-4 h-4 mr-1 text-blue-500" /> Ação Principal
                        </h4>
                        <p className="text-sm text-gray-700">{herb.mainAction}</p>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 flex-1">
                        {herb.description}
                    </p>

                    {/* MTC Specifics */}
                    {!isBrasil && !isPeptide && herb.nature && herb.tropism && (
                        <div className="mb-4 bg-orange-50 rounded-xl p-3 border border-orange-100">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="font-bold text-orange-900">Natureza:</span>
                                    <span className="ml-1 text-orange-800">{herb.nature}</span>
                                </div>
                                <div>
                                    <span className="font-bold text-orange-900">Sabor:</span>
                                    <span className="ml-1 text-orange-800">{herb.flavor?.join(', ')}</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="font-bold text-orange-900">Tropismo:</span>
                                    <span className="ml-1 text-orange-800">{herb.tropism.join(', ')}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        <div>
                            <h4 className="text-xs font-bold text-green-700 mb-1 flex items-center">
                                <Heart className="w-3 h-3 mr-1" /> Indicações
                            </h4>
                            <div className="flex flex-wrap gap-1">
                                {herb.indications.map(ind => (
                                    <span 
                                        key={ind} 
                                        onClick={() => {
                                            setSearchTerm(ind);
                                            // Rola para a busca
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="bg-green-50 text-green-700 text-[10px] px-2 py-1 rounded-md border border-green-200 cursor-pointer hover:bg-green-100 hover:text-green-800 transition-colors"
                                        title={`Buscar por ${ind}`}
                                    >
                                        {ind}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-red-700 mb-1 flex items-center">
                                <AlertTriangle className="w-3 h-3 mr-1" /> Contraindicações
                            </h4>
                            <ul className="text-xs text-red-600 space-y-1 pl-4 list-disc marker:text-red-300">
                                {herb.contraindications.map(contra => (
                                    <li key={contra}>{contra}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Mockup de Parceiro (Apenas para demonstração comercial) */}
                    <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between group hover:bg-indigo-50 transition-colors -mx-5 -mb-5">
                        <div className="flex items-center">
                            <div className="w-9 h-9 bg-white border border-dashed border-gray-300 rounded-xl flex items-center justify-center mr-3 group-hover:border-indigo-300 group-hover:bg-indigo-100 transition-all">
                                <ShoppingCart className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-[9px] text-gray-400 uppercase font-bold tracking-widest leading-none mb-1 group-hover:text-indigo-400">Oportunidade de Marca</p>
                                <p className="text-xs font-bold text-gray-500 group-hover:text-indigo-700 italic">Espaço para Parceiro Premium</p>
                            </div>
                        </div>
                        <div className="bg-white border border-gray-200 text-gray-400 text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-tighter group-hover:border-indigo-200 group-hover:text-indigo-600">
                            Disponível
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header / Back Button */}
                <div className="flex items-center mb-8">
                    {onPageChange && (
                        <button
                            onClick={() => onPageChange('home')}
                            className="p-2 mr-4 bg-white hover:bg-gray-100 rounded-full shadow-sm hover:shadow transition-all border border-gray-200"
                            title="Voltar"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                    )}
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                            <BookOpen className="w-8 h-8 mr-3 text-emerald-600 animate-[pulse_3s_infinite]" />
                            Biblioteca Integrativa (Botânica & Biohacking)
                        </h1>
                        <p className="text-gray-500 mt-1">Herbário completo com Fitoterapia, Peptídeos e Consulta ao Oráculo de Deficiências.</p>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
                    {/* Tabs */}
                    <div className="flex space-x-2 bg-gray-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
                        {['Todos', 'Brasil', 'China (MTC)', 'Peptídeos'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab
                                        ? 'bg-white text-emerald-700 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Search Bar & Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto items-stretch">
                        <div className="relative flex-1 md:w-80">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Busque planta ou digite sintoma..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 sm:text-sm transition-all"
                            />
                        </div>
                        {searchTerm.trim().length >= 3 && (
                            <button
                                onClick={() => handleConsultOracle()}
                                disabled={isOracleLoading}
                                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 text-sm shrink-0 active:scale-95 disabled:opacity-50"
                            >
                                {isOracleLoading ? (
                                    <Loader className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Sparkles className="w-4 h-4 text-amber-200" />
                                )}
                                <span>Perguntar ao Oráculo AI</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Banner de atalho para consulta ao Oráculo */}
                {searchTerm.trim().length > 0 && searchTerm.trim().length < 3 && (
                    <div className="mb-6 p-3 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-between text-xs text-purple-800 animate-fadeIn">
                        <span className="flex items-center"><HelpCircle className="w-4 h-4 mr-1 text-purple-500" /> Digite pelo menos 3 caracteres para liberar a consulta de sintomas via Oráculo de Deficiências AI.</span>
                    </div>
                )}

                {/* AREA DE EXIBIÇÃO DE RESULTADO DO ORÁCULO DE DEFICIÊNCIAS (AI) */}
                {isOracleLoading && (
                    <div className="mb-10 bg-slate-900 border border-purple-500/30 rounded-3xl p-8 text-center text-white relative overflow-hidden shadow-xl shadow-purple-500/5">
                        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-purple-500 via-pink-500 to-emerald-500 animate-pulse" />
                        <Loader className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2 text-purple-200 animate-pulse">Oráculo Xzenpress Recalibrando Frequências...</h3>
                        <p className="text-sm text-slate-400 max-w-md mx-auto">
                            Consultando literatura científica, bases clínicas e a sabedoria da Medicina Tradicional Chinesa para formular o Protocolo Integral 360°...
                        </p>
                    </div>
                )}

                {oracleError && (
                    <div className="mb-10 bg-red-50 border border-red-200 rounded-3xl p-6 flex items-start space-x-3 max-w-2xl mx-auto shadow-sm">
                        <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-lg font-bold text-red-900">Erro na Análise de Sintomas</h3>
                            <p className="text-sm text-red-700 mt-1">{oracleError}</p>
                            <button 
                                onClick={() => handleConsultOracle()} 
                                className="mt-3 bg-red-100 hover:bg-red-200 text-red-800 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center space-x-1"
                            >
                                <RotateCcw className="w-3 h-3" />
                                <span>Tentar novamente</span>
                            </button>
                        </div>
                    </div>
                )}

                {oracleResult && (
                    <div className="mb-12 bg-slate-950 border border-purple-900/50 rounded-3xl shadow-2xl overflow-hidden animate-fadeIn relative">
                        {/* Glow decorativo de fundo */}
                        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />
                        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

                        {/* Top Banner */}
                        <div className="p-6 sm:p-8 bg-gradient-to-r from-purple-950 via-slate-900 to-emerald-950 border-b border-purple-900/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-3 bg-purple-900/40 rounded-2xl border border-purple-500/30 text-purple-300">
                                    <Brain className="w-8 h-8 animate-pulse" />
                                </div>
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <span className="bg-purple-900/60 text-purple-200 text-[10px] font-black px-2 py-0.5 rounded border border-purple-500/30 uppercase tracking-widest">Protocolo 360° Gerado</span>
                                        <span className="bg-emerald-950/60 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-widest flex items-center gap-0.5"><Sparkles className="w-2.5 h-2.5" /> IA Viva</span>
                                    </div>
                                    <h2 className="text-2xl font-black text-white mt-1">{oracleResult.titulo}</h2>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handleConsultOracle()}
                                    className="p-2 bg-slate-900 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white border border-slate-850 transition-colors flex items-center space-x-1 text-xs font-bold"
                                    title="Recalcular Análise"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    <span className="hidden sm:inline">Recalcular</span>
                                </button>
                                <button
                                    onClick={() => setOracleResult(null)}
                                    className="p-2 bg-slate-900 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-red-400 border border-slate-850 transition-colors text-xs font-bold"
                                >
                                    Fechar Diagnóstico
                                </button>
                            </div>
                        </div>

                        {/* Corpo do Resultado */}
                        <div className="p-6 sm:p-8 space-y-8">
                            
                            {/* Visão Integrativa */}
                            <div className="bg-slate-900/50 border border-slate-850 rounded-2xl p-5 sm:p-6">
                                <h3 className="text-sm font-black text-purple-400 uppercase tracking-widest mb-2 flex items-center"><Compass className="w-4 h-4 mr-1" /> Visão Sistêmica & Causalidade</h3>
                                <p className="text-sm sm:text-base text-slate-200 leading-relaxed italic">
                                    "{oracleResult.visaoIntegrativa}"
                                </p>
                            </div>

                            {/* Grid de Informações */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                
                                {/* Coluna 1: Deficiências Prováveis & Bioquímica */}
                                <div className="space-y-6 lg:col-span-2">
                                    
                                    {/* Deficiências */}
                                    <div>
                                        <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-4 flex items-center"><Activity className="w-4 h-4 mr-1.5" /> Deficiências Nutricionais Rastreadas</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {oracleResult.deficiencias.map((def, idx) => (
                                                <div key={idx} className="bg-slate-900/40 border border-slate-850 hover:border-emerald-500/20 p-4 rounded-2xl transition-all">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <h4 className="text-sm font-bold text-white">{def.nutriente}</h4>
                                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${
                                                            def.probabilidade === 'alta' ? 'bg-red-950/40 text-red-400 border-red-500/20' :
                                                            def.probabilidade === 'moderada' ? 'bg-amber-950/40 text-amber-400 border-amber-500/20' :
                                                            'bg-emerald-950/40 text-emerald-400 border-emerald-500/20'
                                                        }`}>
                                                            Probabilidade {def.probabilidade}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-300 leading-relaxed mb-3">{def.mecanismo}</p>
                                                    <p className="text-[10px] text-slate-500 italic bg-black/30 p-2 rounded-lg border border-slate-900">📚 Evidência: {def.evidencia}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Alimentação Funcional e Receita MTC */}
                                    <div>
                                        <h3 className="text-xs font-black text-orange-400 uppercase tracking-widest mb-4 flex items-center"><Utensils className="w-4 h-4 mr-1.5" /> Nutrição Funcional & Culinária Terapêutica</h3>
                                        <div className="bg-slate-900/30 border border-slate-850 rounded-2xl p-5 space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <h4 className="text-xs font-bold text-emerald-400 mb-1 flex items-center">✓ Alimentos para Priorizar:</h4>
                                                    <ul className="text-xs text-slate-300 space-y-1 list-disc pl-4 marker:text-emerald-500">
                                                        {oracleResult.protocolo.alimentacao.priorizar.map((item, idx) => <li key={idx}>{item}</li>)}
                                                    </ul>
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-bold text-rose-400 mb-1 flex items-center">✗ Alimentos para Evitar:</h4>
                                                    <ul className="text-xs text-slate-300 space-y-1 list-disc pl-4 marker:text-rose-500">
                                                        {oracleResult.protocolo.alimentacao.evitar.map((item, idx) => <li key={idx}>{item}</li>)}
                                                    </ul>
                                                </div>
                                            </div>
                                            <div className="border-t border-slate-950 pt-4">
                                                <h4 className="text-xs font-bold text-orange-300 mb-1">🍵 Receita Baseada nos 5 Elementos da MTC:</h4>
                                                <p className="text-xs text-slate-300 leading-relaxed bg-orange-950/10 p-3 rounded-xl border border-orange-950/20">{oracleResult.protocolo.alimentacao.receitaMTC}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Acupressão (MTC & YNSA) */}
                                    {((oracleResult.protocolo.pontosYNSA && oracleResult.protocolo.pontosYNSA.length > 0) || 
                                      (oracleResult.protocolo.pontosMTC && oracleResult.protocolo.pontosMTC.length > 0)) && (
                                        <div>
                                            <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-4 flex items-center"><MapPin className="w-4 h-4 mr-1.5" /> Pontos de Acupressão Recomendados</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {oracleResult.protocolo.pontosYNSA && oracleResult.protocolo.pontosYNSA.length > 0 && (
                                                    <div className="bg-slate-900/30 border border-slate-850 p-4 rounded-2xl">
                                                        <h4 className="text-xs font-bold text-purple-300 mb-3 uppercase tracking-wide">Craniopuntura de Yamamoto (YNSA)</h4>
                                                        <div className="space-y-4">
                                                            {oracleResult.protocolo.pontosYNSA.map((p, idx) => {
                                                                const matchedPoint = getMatchingPoint(p);
                                                                return (
                                                                    <div key={idx} className="border-b border-slate-900/40 last:border-0 pb-3 last:pb-0">
                                                                        <div className="text-xs text-slate-300 leading-relaxed font-semibold mb-2">• {p}</div>
                                                                        {matchedPoint && matchedPoint.image && (
                                                                            <div 
                                                                                className="relative mt-2 rounded-xl overflow-hidden cursor-pointer border border-slate-800 hover:border-purple-500/50 transition-all max-w-[280px]"
                                                                                onClick={() => {
                                                                                    console.log('Oráculo YNSA image click:', matchedPoint.image);
                                                                                    setZoomImageUrl(getSafeImagePath(matchedPoint.image));
                                                                                    setShowZoomModal(true);
                                                                                }}
                                                                            >
                                                                                <img 
                                                                                    src={getSafeImagePath(matchedPoint.image)} 
                                                                                    alt={matchedPoint.name} 
                                                                                    className="w-full h-32 object-contain bg-slate-950 p-1 rounded-xl"
                                                                                    onError={(e) => {
                                                                                        e.currentTarget.style.display = 'none';
                                                                                    }}
                                                                                />
                                                                                <div className="absolute inset-0 bg-black/45 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                                                                                    <span className="text-[10px] text-white font-bold bg-purple-600/80 px-2 py-1 rounded-full flex items-center gap-1">
                                                                                        <ZoomIn className="w-3 h-3" /> Ampliar
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                                {oracleResult.protocolo.pontosMTC && oracleResult.protocolo.pontosMTC.length > 0 && (
                                                    <div className="bg-slate-900/30 border border-slate-850 p-4 rounded-2xl">
                                                        <h4 className="text-xs font-bold text-orange-300 mb-3 uppercase tracking-wide">Meridianos da Medicina Tradicional Chinesa</h4>
                                                        <div className="space-y-4">
                                                            {oracleResult.protocolo.pontosMTC.map((p, idx) => {
                                                                const matchedPoint = getMatchingPoint(p);
                                                                return (
                                                                    <div key={idx} className="border-b border-slate-900/40 last:border-0 pb-3 last:pb-0">
                                                                        <div className="text-xs text-slate-300 leading-relaxed font-semibold mb-2">• {p}</div>
                                                                        {matchedPoint && matchedPoint.image && (
                                                                            <div 
                                                                                className="relative mt-2 rounded-xl overflow-hidden cursor-pointer border border-slate-800 hover:border-orange-500/50 transition-all max-w-[280px]"
                                                                                onClick={() => {
                                                                                    console.log('Oráculo MTC image click:', matchedPoint.image);
                                                                                    setZoomImageUrl(getSafeImagePath(matchedPoint.image));
                                                                                    setShowZoomModal(true);
                                                                                }}
                                                                            >
                                                                                <img 
                                                                                    src={getSafeImagePath(matchedPoint.image)} 
                                                                                    alt={matchedPoint.name} 
                                                                                    className="w-full h-32 object-contain bg-slate-950 p-1 rounded-xl"
                                                                                    onError={(e) => {
                                                                                        e.currentTarget.style.display = 'none';
                                                                                    }}
                                                                                />
                                                                                <div className="absolute inset-0 bg-black/45 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                                                                                    <span className="text-[10px] text-white font-bold bg-orange-600/80 px-2 py-1 rounded-full flex items-center gap-1">
                                                                                        <ZoomIn className="w-3 h-3" /> Ampliar
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Coluna 2: Suplementos, Peptídeos & Mente */}
                                <div className="space-y-6">
                                    
                                    {/* Suplementação Orientada */}
                                    <div>
                                        <h3 className="text-xs font-black text-purple-400 uppercase tracking-widest mb-4 flex items-center"><Heart className="w-4 h-4 mr-1.5" /> Suplementação Integrativa</h3>
                                        <div className="space-y-3">
                                            {oracleResult.protocolo.suplementos.map((sup, idx) => (
                                                <div key={idx} className="bg-slate-900/30 border border-slate-850 p-4 rounded-xl flex items-start space-x-2">
                                                    <div className="p-1.5 bg-purple-950 text-purple-400 border border-purple-500/20 rounded-lg text-xs font-bold mt-0.5">S{idx+1}</div>
                                                    <div>
                                                        <h4 className="text-xs font-bold text-white">{sup.nome}</h4>
                                                        <div className="flex flex-wrap gap-1 my-1 text-[9px] text-slate-400">
                                                            <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-850 flex items-center gap-0.5"><Compass className="w-2.5 h-2.5" /> {sup.dose}</span>
                                                            <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-850 flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {sup.timing}</span>
                                                        </div>
                                                        <p className="text-[10px] text-slate-500 italic mt-1 leading-tight"><span className="text-emerald-400 font-bold">✨ Sinergia:</span> {sup.sinergia}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Fitoterapia Complementar */}
                                    <div>
                                        <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-4 flex items-center"><Sprout className="w-4 h-4 mr-1.5" /> Fitoterapia Personalizada</h3>
                                        <div className="bg-slate-900/30 border border-slate-850 p-4 rounded-2xl space-y-3">
                                            <div>
                                                <h4 className="text-xs font-bold text-emerald-400">🇧🇷 Plantas Brasileiras Comprovadas:</h4>
                                                <ul className="text-xs text-slate-300 space-y-1 list-disc pl-4 mt-1 marker:text-emerald-500">
                                                    {(oracleResult.protocolo.fitoterapia?.plantasBrasileiras || []).map((p, idx) => <li key={idx}>{p}</li>)}
                                                </ul>
                                            </div>
                                            <div className="border-t border-slate-950 pt-3">
                                                <h4 className="text-xs font-bold text-orange-400">🏮 Fitoterapia Chinesa (Pinyin):</h4>
                                                <ul className="text-xs text-slate-300 space-y-1 list-disc pl-4 mt-1 marker:text-orange-500">
                                                    {(oracleResult.protocolo.fitoterapia?.plantasMTC || []).map((p, idx) => <li key={idx}>{p}</li>)}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Peptídeos & Biohacking Epigenético */}
                                    {oracleResult.protocolo.peptideos && oracleResult.protocolo.peptideos.indicados.length > 0 && (
                                        <div className="bg-slate-900/30 border border-slate-850 p-4 rounded-2xl relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-12 h-12 bg-indigo-500/10 rounded-full blur-lg" />
                                            <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center"><Dna className="w-4 h-4 mr-1.5 animate-pulse" /> Peptídeos de Biohacking</h3>
                                            <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4 marker:text-indigo-500">
                                                {oracleResult.protocolo.peptideos.indicados.map((pep, idx) => <li key={idx}>{pep}</li>)}
                                            </ul>
                                            <p className="text-[9px] text-slate-500 italic mt-3 bg-black/30 p-2 rounded-lg border border-slate-950/50">🔬 {oracleResult.protocolo.peptideos.nota}</p>
                                        </div>
                                    )}

                                    {/* Psicossomática e Alma Emocional */}
                                    <div className="bg-slate-900/30 border border-slate-850 p-4 rounded-2xl">
                                        <h3 className="text-xs font-black text-rose-400 uppercase tracking-widest mb-2 flex items-center"><Brain className="w-4 h-4 mr-1.5" /> Psicossomática & Campo Emocional</h3>
                                        <p className="text-xs text-slate-300 leading-relaxed italic">
                                            {oracleResult.almaEmocional}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Epigenética e Visão Científica */}
                            <div className="bg-slate-900/20 border border-slate-850 rounded-2xl p-5 flex flex-col md:flex-row gap-4 items-start">
                                <div className="p-2.5 bg-indigo-950 text-indigo-300 border border-indigo-500/20 rounded-xl shrink-0">
                                    <Dna className="w-6 h-6 animate-pulse" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-1">Mecanismo Epigenético e Reversibilidade</h4>
                                    <p className="text-xs text-slate-400 leading-relaxed">{oracleResult.epigenetica}</p>
                                </div>
                            </div>

                            {/* Alertas de Segurança */}
                            <div className="bg-red-950/20 border border-red-500/20 rounded-2xl p-5 space-y-2">
                                <h4 className="text-xs font-black text-red-400 uppercase tracking-widest flex items-center"><Shield className="w-4 h-4 mr-1.5" /> Alertas de Segurança & Interações</h4>
                                <ul className="text-xs text-red-300 space-y-1 list-disc pl-4 marker:text-red-500">
                                    {oracleResult.alertas.map((alerta, idx) => <li key={idx}>{alerta}</li>)}
                                </ul>
                            </div>

                            {/* Fontes Científicas */}
                            <div className="text-[10px] text-slate-500 space-y-1">
                                <p className="font-bold">🔬 Referências Científicas e Literárias:</p>
                                <div className="flex flex-wrap gap-x-3 gap-y-1">
                                    {oracleResult.fontes.map((f, idx) => <span key={idx} className="hover:text-slate-400 transition-colors">[{idx+1}] {f}</span>)}
                                </div>
                            </div>

                        </div>
                    </div>
                )}

                {/* Herbs Grid */}
                {isGroupedView ? (
                    // Vista agrupada por categoria na aba "Todos"
                    <div className="space-y-12">
                        {brasilHerbs.length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="flex items-center gap-2 bg-emerald-100 border border-emerald-200 rounded-full px-4 py-1.5">
                                        <Sprout className="w-5 h-5 text-emerald-700" />
                                        <span className="font-bold text-emerald-800 text-sm uppercase tracking-widest">Fitoterapia Brasileira</span>
                                    </div>
                                    <span className="text-xs text-gray-400 font-mono">{brasilHerbs.length} plantas</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {brasilHerbs.map(herb => <HerbCard key={herb.id} herb={herb} />)}
                                </div>
                            </section>
                        )}
                        {mtcHerbs.length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="flex items-center gap-2 bg-orange-100 border border-orange-200 rounded-full px-4 py-1.5">
                                        <Leaf className="w-5 h-5 text-orange-700" />
                                        <span className="font-bold text-orange-800 text-sm uppercase tracking-widest">Medicina Tradicional Chinesa</span>
                                    </div>
                                    <span className="text-xs text-gray-400 font-mono">{mtcHerbs.length} ervas</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {mtcHerbs.map(herb => <HerbCard key={herb.id} herb={herb} />)}
                                </div>
                            </section>
                        )}
                        {peptideHerbs.length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="flex items-center gap-2 bg-indigo-100 border border-indigo-200 rounded-full px-4 py-1.5">
                                        <Dna className="w-5 h-5 text-indigo-700" />
                                        <span className="font-bold text-indigo-800 text-sm uppercase tracking-widest">Peptídeos & Biohacking</span>
                                    </div>
                                    <span className="text-xs text-gray-400 font-mono">{peptideHerbs.length} compostos</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {peptideHerbs.map(herb => <HerbCard key={herb.id} herb={herb} />)}
                                </div>
                            </section>
                        )}
                        {brasilHerbs.length === 0 && mtcHerbs.length === 0 && peptideHerbs.length === 0 && (
                            <div className="text-center py-20 bg-white rounded-3xl border border-gray-200">
                                <Leaf className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum item encontrado na Biblioteca</h3>
                                <p className="text-gray-500 mb-4">Que tal perguntar diretamente ao Oráculo de Deficiências Xzenpress AI?</p>
                                
                                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                                    <button 
                                        onClick={() => setSearchTerm('')} 
                                        className="text-gray-500 font-bold hover:text-gray-700 text-sm border border-gray-300 px-4 py-2 rounded-xl"
                                    >
                                        Limpar busca
                                    </button>
                                    
                                    {searchTerm.trim().length >= 3 && (
                                        <button 
                                            onClick={() => handleConsultOracle()}
                                            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold px-5 py-2 rounded-xl transition-all shadow-md flex items-center space-x-2 text-sm shrink-0 active:scale-95"
                                        >
                                            <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
                                            <span>Consultar Oráculo AI para "{searchTerm}"</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ) : filteredHerbs.length > 0 ? (
                    // Vista filtrada por aba específica
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredHerbs.map(herb => (
                            <HerbCard key={herb.id} herb={herb} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-200">
                        <Leaf className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhuma planta encontrada</h3>
                        <p className="text-gray-500 mb-4">Tente buscar por outros termos ou consulte o Oráculo AI para uma análise sistêmica.</p>
                        
                        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                            <button
                                onClick={() => { setSearchTerm(''); setActiveTab('Todos'); }}
                                className="text-gray-500 font-bold hover:text-gray-700 text-sm border border-gray-300 px-4 py-2 rounded-xl"
                            >
                                Limpar busca
                            </button>
                            {searchTerm.trim().length >= 3 && (
                                <button 
                                    onClick={() => handleConsultOracle()}
                                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold px-5 py-2 rounded-xl transition-all shadow-md flex items-center space-x-2 text-sm shrink-0 active:scale-95"
                                >
                                    <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
                                    <span>Consultar Oráculo AI para "{searchTerm}"</span>
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Rodapé Legal / Disclaimer */}
                <div className="mt-16 pt-8 border-t border-gray-200">
                    <div className="bg-gray-100 rounded-2xl p-6 border border-gray-200">
                        <div className="flex items-start gap-4">
                            <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wider">Isenção de Responsabilidade Legal</h4>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    O **Xzenpress** atua exclusivamente como uma plataforma de curadoria, informação e educação em medicina integrativa. 
                                    Não fabricamos, comercializamos ou garantimos a entrega de quaisquer produtos aqui listados. As indicações de parceiros 
                                    "Hors-Concours" são baseadas em critérios técnicos de qualidade e reputação de mercado, mas a relação de consumo, 
                                    logística e garantia é de responsabilidade exclusiva da empresa fabricante/vendedora.
                                </p>
                                <p className="text-xs text-gray-600 mt-3 font-semibold italic">
                                    Atenção: O conteúdo desta biblioteca não substitui a consulta médica. Jamais inicie o uso de fitoterápicos ou 
                                    peptídeos sem a orientação de um profissional de saúde qualificado.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="text-center mt-6 text-[10px] text-gray-400">
                        © {new Date().getFullYear()} Xzenpress - Inteligência em Saúde Integrativa. Todos os direitos reservados.
                    </div>
                </div>

                <ImageZoomModal
                    isVisible={showZoomModal}
                    imageUrl={zoomImageUrl}
                    onClose={() => {
                        console.log('🚪 Fechando modal oráculo');
                        setShowZoomModal(false);
                        setZoomImageUrl(null);
                    }}
                />
            </div>
        </div>
    );
};

const ImageZoomModal: React.FC<{
    isVisible: boolean;
    imageUrl: string | null;
    onClose: () => void;
}> = ({ isVisible, imageUrl, onClose }) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    console.log('🔍 ImageZoomModal oráculo render:', { isVisible, imageUrl, imageLoaded });

    useEffect(() => {
        if (isVisible) {
            console.log('✅ Modal oráculo visível, resetando imageLoaded');
            setImageLoaded(false);
        }
    }, [isVisible, imageUrl]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isVisible) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isVisible, onClose]);

    if (!isVisible || !imageUrl) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-90 transition-opacity duration-300 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-6xl max-h-[95vh] flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
            >
                {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-white text-sm">Carregando imagem...</span>
                        </div>
                    </div>
                )}

                <img
                    src={imageUrl}
                    alt="Ponto de acupressão ampliado"
                    className={`max-w-full max-h-[95vh] object-contain rounded-xl shadow-2xl transition-opacity duration-300 cursor-pointer ${imageLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                    onClick={onClose}
                    onLoad={() => {
                        console.log('Imagem oráculo carregada com sucesso!');
                        setImageLoaded(true);
                    }}
                    onError={(e) => {
                        console.error('Erro ao carregar imagem oráculo:', imageUrl);
                        e.currentTarget.style.display = 'none';
                        setImageLoaded(true);
                    }}
                />

                <button
                    onClick={onClose}
                    className="absolute -top-14 right-0 bg-red-500 hover:bg-red-600 text-white transition-colors p-3 rounded-full shadow-lg hover:scale-110 transform duration-200"
                    aria-label="Fechar"
                    title="Fechar (ESC)"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="absolute -bottom-14 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 px-6 py-3 rounded-full">
                    <div className="flex items-center gap-3 text-white text-sm">
                        <span className="opacity-90">💡 Clique na imagem ou pressione ESC para fechar</span>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
