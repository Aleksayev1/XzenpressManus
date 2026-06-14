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
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { MapaVivoStorageService } from '../services/mapaVivoStorageService';
import { type GeneticMarkers } from '../data/anamneseProfile';

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
    recPrecisao?: string;
    almaEmocional: string;
    alertas: string[];
    fontes: string[];
}

export const PhytoLibraryPage: React.FC<PhytoLibraryPageProps> = ({ onPageChange }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'Todos' | 'Brasil' | 'China (MTC)' | 'Peptídeos'>('Todos');
    const [fromMapaVivo, setFromMapaVivo] = useState(false);
    const { user } = useAuth();
    const [anamnese, setAnamnese] = useState<any>(null);
    const [geneticMarkers, setGeneticMarkers] = useState<GeneticMarkers | null>(null);

    useEffect(() => {
        setFromMapaVivo(localStorage.getItem('phyto_from_mapa_vivo') === 'true');
        
        const loadUserAnamnese = async () => {
            if (user) {
                const profile = await MapaVivoStorageService.loadAnamneseProfile(user.id);
                if (profile) {
                    setAnamnese(profile);
                    if (profile.geneticMarkers) {
                        setGeneticMarkers(profile.geneticMarkers);
                    }
                }
            } else {
                // Fallback to local anonymous profile
                const saved = localStorage.getItem('xzenpress_anamnese_v1');
                if (saved) {
                    try {
                        const profile = JSON.parse(saved);
                        setAnamnese(profile);
                        if (profile.geneticMarkers) {
                            setGeneticMarkers(profile.geneticMarkers);
                        }
                    } catch (e) {
                        console.error('Erro ao ler anamnese local:', e);
                    }
                }
            }
        };
        loadUserAnamnese();
    }, [user]);

    // Estados do Oráculo de Deficiências
    const [oracleResult, setOracleResult] = useState<OracleProtocol | null>(null);
    const [isOracleLoading, setIsOracleLoading] = useState(false);
    const [oracleError, setOracleError] = useState<string | null>(null);
    const [showOracleDetails, setShowOracleDetails] = useState(true);
    const [chronicity, setChronicity] = useState<'agudo' | 'cronico' | 'misto'>('misto');

    // Estados de Protocolos Dinâmicos acumulados no Supabase
    const [dynamicProtocols, setDynamicProtocols] = useState<Array<{ query: string; protocol: OracleProtocol }>>([]);
    const [isDynamicLoading, setIsDynamicLoading] = useState(false);

    // Efeito de busca de protocolos dinâmicos na base Supabase (Debounced)
    useEffect(() => {
        const fetchDynamicProtocols = async () => {
            if (!supabase || searchTerm.trim().length < 3) {
                setDynamicProtocols([]);
                return;
            }
            
            setIsDynamicLoading(true);
            try {
                const { data, error } = await supabase
                    .from('xzen_oracle_protocols')
                    .select('query, protocol')
                    .ilike('query', `%${searchTerm.trim().toLowerCase()}%`)
                    .limit(6);
                
                if (error) throw error;
                
                if (data) {
                    setDynamicProtocols(data.map(item => ({
                        query: item.query,
                        protocol: item.protocol as unknown as OracleProtocol
                    })));
                } else {
                    setDynamicProtocols([]);
                }
            } catch (err) {
                console.error('Erro ao buscar protocolos dinâmicos:', err);
                setDynamicProtocols([]);
            } finally {
                setIsDynamicLoading(false);
            }
        };

        const timer = setTimeout(() => {
            fetchDynamicProtocols();
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Estados do Zoom Modal de Imagens
    const [showZoomModal, setShowZoomModal] = useState(false);
    const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);

    // Helper de segurança de URLs para WebView de celular (Android/iOS)
    const getSafeImagePath = (path: string | undefined | null): string => {
        if (!path) return '';
        return encodeURI(path);
    };

    // Estado unificado de todas as ervas (estáticas + customizadas do Supabase)
    const [herbs, setHerbs] = useState<Herb[]>(HERB_DATABASE);

    // Carregar ervas customizadas do Supabase ao montar o componente
    useEffect(() => {
        const loadCustomHerbs = async () => {
            if (!supabase) return;
            try {
                const { data, error } = await supabase
                    .from('xzen_custom_herbs')
                    .select('*');
                if (error) throw error;
                if (data && data.length > 0) {
                    const mappedCustom: Herb[] = data.map(row => ({
                        id: row.id,
                        name: row.name,
                        scientificName: row.scientific_name || '',
                        origin: row.origin as any,
                        partUsed: row.part_used || '',
                        mainAction: row.main_action || '',
                        description: row.description || '',
                        flavor: row.flavor || undefined,
                        nature: row.nature as any || undefined,
                        tropism: row.tropism || undefined,
                        indications: row.indications || [],
                        contraindications: row.contraindications || []
                    }));
                    setHerbs(prev => {
                        const merged = [...prev];
                        mappedCustom.forEach(c => {
                            const index = merged.findIndex(h => h.id === c.id);
                            if (index !== -1) {
                                merged[index] = c;
                            } else {
                                merged.push(c);
                            }
                        });
                        return merged;
                    });
                }
            } catch (err) {
                console.error('Erro ao carregar ervas customizadas:', err);
            }
        };
        loadCustomHerbs();
    }, []);

    // Helper para cruzar texto do Oráculo com dados reais dos pontos estáticos
    const getMatchingPoint = (pointStr: string) => {
        if (!pointStr) return undefined;
        const cleanStr = pointStr.toLowerCase();
        
        // 1. CASOS ESPECIAIS DE CORRESPONDÊNCIA YNSA
        // Ponto ZS (Mestre Hormonal Feminino)
        if (cleanStr.includes('zs') || cleanStr.includes('zeise') || cleanStr.includes('suess')) {
            return acupressurePoints.find(p => p.id === 'ynsa-zs-point' || p.id === 'hormonal-feminino-zs');
        }
        
        // Cérebro / Cerebrum (M1)
        if (cleanStr.includes('cérebro') || cleanStr.includes('cerebro') || cleanStr.includes('cerebrum') || cleanStr.includes('brain-m1') || cleanStr.includes('m1')) {
            const matched = acupressurePoints.find(p => p.id === 'ynsa-brain-m1');
            if (matched) return matched;
        }

        // Ponto Ypsilon do Rim (Y-1 / Ypsilon 1)
        if (cleanStr.includes('y-1') || cleanStr.includes('y1') || (cleanStr.includes('ypsilon') && cleanStr.includes('rim'))) {
            const matched = acupressurePoints.find(p => p.id === 'ynsa-kidney-y1');
            if (matched) return matched;
        }

        // Ponto Ypsilon do Pulmão (Y-2 / Ypsilon 2)
        if (cleanStr.includes('y-2') || cleanStr.includes('y2') || (cleanStr.includes('ypsilon') && (cleanStr.includes('pulmão') || cleanStr.includes('pulmao')))) {
            const matched = acupressurePoints.find(p => p.id === 'ynsa-ypsilon-lung');
            if (matched) return matched;
        }

        // Ponto Ypsilon do Pericárdio (Y-3 / Ypsilon 3 / Pericardium)
        if (cleanStr.includes('y-3') || cleanStr.includes('y3') || (cleanStr.includes('ypsilon') && (cleanStr.includes('pericárdio') || cleanStr.includes('pericardio') || cleanStr.includes('circulação') || cleanStr.includes('circulacao')))) {
            const matched = acupressurePoints.find(p => p.id === 'ynsa-ypsilon-pericardium');
            if (matched) return matched;
        }

        // Ponto Ypsilon do Estômago (Y-4 / Ypsilon 4 / Stomach)
        if (cleanStr.includes('y-4') || cleanStr.includes('y4') || (cleanStr.includes('ypsilon') && (cleanStr.includes('estômago') || cleanStr.includes('estomago')))) {
            const matched = acupressurePoints.find(p => p.id === 'ynsa-ypsilon-stomach');
            if (matched) return matched;
        }

        // Ponto Ypsilon do Intestino Delgado (Y-5 / Ypsilon 5 / Small Intestine / SI)
        if (cleanStr.includes('y-5') || cleanStr.includes('y5') || (cleanStr.includes('ypsilon') && (cleanStr.includes('delgado') || cleanStr.includes('intestino delgado')))) {
            const matched = acupressurePoints.find(p => p.id === 'ynsa-ypsilon-si');
            if (matched) return matched;
        }

        // 2. REGRA DE INTERCEPTAÇÃO DE PONTOS BÁSICOS YNSA (A a K)
        // Evita falsos positivos com a palavra "ponto" ou letras soltas nas preposições (como "de", "do").
        // Captura padrões como: "Ponto D (Lombar)", "Ponto A", "Grupo D YNSA", "Yamamoto Ponto B"
        const matchBasic = cleanStr.match(/\b(?:ponto|grupo|ynsa|yamamoto)\s+([a-k])\b|\b([a-k])\s+(?:ynsa|yamamoto|ponto)\b/i);
        if (matchBasic) {
            const letter = (matchBasic[1] || matchBasic[2]).toLowerCase();
            const matched = acupressurePoints.find(p => p.id === `ynsa-${letter}` || p.id === `ynsa-ponto-${letter}`);
            if (matched) return matched;
        }

        // 3. REGRA DE INTERCEPTAÇÃO DE PONTOS MTC MAIS PRESCRITOS
        // Evita colisões no loop genérico de termos
        if (cleanStr.includes('b23') || cleanStr.includes('bl23') || cleanStr.includes('b-23') || cleanStr.includes('bl-23') || cleanStr.includes('shenshu')) {
            const matched = acupressurePoints.find(p => p.id === 'bl23');
            if (matched) return matched;
        }
        if (cleanStr.includes('ig4') || cleanStr.includes('li4') || cleanStr.includes('ig-4') || cleanStr.includes('li-4') || cleanStr.includes('hegu')) {
            const matched = acupressurePoints.find(p => p.id === 'septicemia-hegu-li4');
            if (matched) return matched;
        }
        if (cleanStr.includes('bp6') || cleanStr.includes('sp6') || cleanStr.includes('bp-6') || cleanStr.includes('sp-6') || cleanStr.includes('sanyinjiao')) {
            const matched = acupressurePoints.find(p => p.id === 'sp6-sanyinjiao');
            if (matched) return matched;
        }
        if (cleanStr.includes('bp9') || cleanStr.includes('sp9') || cleanStr.includes('bp-9') || cleanStr.includes('sp-9') || cleanStr.includes('yinlingquan') || cleanStr.includes('yin ling quan')) {
            const matched = acupressurePoints.find(p => p.id === 'sp9-yinlingquan');
            if (matched) return matched;
        }
        if (cleanStr.includes('e36') || cleanStr.includes('st36') || cleanStr.includes('e-36') || cleanStr.includes('st-36') || cleanStr.includes('zusanli')) {
            const matched = acupressurePoints.find(p => p.id === 'septicemia-zusanli-st36');
            if (matched) return matched;
        }
        if (cleanStr.includes('r3') || cleanStr.includes('kd3') || cleanStr.includes('r-3') || cleanStr.includes('kd-3') || cleanStr.includes('taixi')) {
            const matched = acupressurePoints.find(p => p.id === 'kd3' || p.id === 'septicemia-taixi-kd3' || p.id.includes('kd3'));
            if (matched) return matched;
        }
        if (cleanStr.includes('pc6') || cleanStr.includes('neiguan') || cleanStr.includes('neiguan-pc6')) {
            const matched = acupressurePoints.find(p => p.id === 'neiguan-pc6');
            if (matched) return matched;
        }
        if (cleanStr.includes('f3') || cleanStr.includes('lv3') || cleanStr.includes('lr3') || cleanStr.includes('taichong')) {
            const matched = acupressurePoints.find(p => p.id === 'lv3-taichong');
            if (matched) return matched;
        }

        // 4. CORRESPONDÊNCIA POR ID EXATO OU EQUIVALÊNCIAS
        for (const point of acupressurePoints) {
            const pid = point.id.toLowerCase();
            if (cleanStr.includes(pid)) return point;
            
            // Tratamento para prefixos de meridianos tradicionais em Português vs Inglês
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
        
        // 5. CORRESPONDÊNCIA FALLBACK POR TERMOS DO NOME
        for (const point of acupressurePoints) {
            const nameParts = point.name.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
            for (const part of nameParts) {
                // IGNORAR palavras genéricas/comuns que causam falsos positivos
                if (['ponto', 'pontos', 'point', 'points', 'para', 'como', 'com', 'assentamento', 'ypsilon', 'ynsa', 'mtc', 'chinesa'].includes(part)) {
                    continue;
                }
                if (part.length > 3 && cleanStr.includes(part)) {
                    return point;
                }
            }
        }
        
        return undefined;
    };

    const handleSelectRecommendedItem = (itemName: string) => {
        if (!itemName) return;
        
        // Limpa partes extras do texto (como dosagem ou parênteses, ex: "Huang Qi (Astragalus)" -> "Huang Qi" ou "Astragalus")
        const cleanName = itemName.split(/[-–—(]/)[0].trim();
        const searchStr = cleanName.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
        
        // Tenta achar correspondência direta no banco de plantas/peptídeos
        const matched = herbs.find(h => {
            const hName = h.name.toLowerCase().replace(/[^a-z0-9\s]/g, '');
            const hSci = h.scientificName.toLowerCase().replace(/[^a-z0-9\s]/g, '');
            
            return hName.includes(searchStr) || searchStr.includes(hName) || hSci.includes(searchStr);
        });
        
        if (matched) {
            // Define aba e termo de busca correspondente à planta encontrada
            setSearchTerm(matched.name);
            if (matched.origin === 'Brasil') setActiveTab('Brasil');
            else if (matched.origin === 'China (MTC)') setActiveTab('China (MTC)');
            else if (matched.origin.includes('Peptídeo')) setActiveTab('Peptídeos');
        } else {
            // Fallback: faz a busca pelo nome direto
            setSearchTerm(cleanName);
            setActiveTab('Todos');
        }
        
        // Rola a tela suavemente para a seção de pesquisa/biblioteca
        setTimeout(() => {
            document.getElementById('phyto-library-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const matchesSearch = (herb: Herb) =>
        herb.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        herb.scientificName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        herb.indications.some(i => i.toLowerCase().includes(searchTerm.toLowerCase()));

    const filteredHerbs = herbs.filter(herb => {
        let matchesTab = true;
        if (activeTab === 'Brasil') matchesTab = herb.origin === 'Brasil';
        if (activeTab === 'China (MTC)') matchesTab = herb.origin === 'China (MTC)';
        if (activeTab === 'Peptídeos') matchesTab = herb.origin === 'Peptídeo (Sintético/Bio-idêntico)';
        return matchesSearch(herb) && matchesTab;
    });

    // Grupos ordenados para a aba "Todos"
    const brasilHerbs = herbs.filter(h => h.origin === 'Brasil' && matchesSearch(h));
    const mtcHerbs = herbs.filter(h => h.origin === 'China (MTC)' && matchesSearch(h));
    const peptideHerbs = herbs.filter(h => h.origin === 'Peptídeo (Sintético/Bio-idêntico)' && matchesSearch(h));
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

            const getActiveOrganClock = () => {
                const hour = new Date().getHours();
                if (hour >= 1 && hour < 3) {
                    return { organ: 'Fígado', timeRange: '01:00 - 03:00', element: 'Madeira', description: 'Período de desintoxicação profunda do sangue e processamento de emoções como raiva e frustração.' };
                } else if (hour >= 3 && hour < 5) {
                    return { organ: 'Pulmão', timeRange: '03:00 - 05:00', element: 'Metal', description: 'Momento de oxigenação celular profunda, eliminação de resíduos gasosos e processamento de sentimentos de tristeza ou melancolia.' };
                } else if (hour >= 5 && hour < 7) {
                    return { organ: 'Intestino Grosso', timeRange: '05:00 - 07:00', element: 'Metal', description: 'Fase de eliminação de toxinas físicas e desapego emocional.' };
                } else if (hour >= 7 && hour < 9) {
                    return { organ: 'Estômago', timeRange: '07:00 - 09:00', element: 'Terra', description: 'Hora ideal para a primeira refeição, absorção primária de nutrientes e nutrição da clareza mental.' };
                } else if (hour >= 9 && hour < 11) {
                    return { organ: 'Baço-Pâncreas', timeRange: '09:00 - 11:00', element: 'Terra', description: 'Conversão de alimentos em energia vital (Qi) e sangue. Evitar ruminação e preocupação excessiva.' };
                } else if (hour >= 11 && hour < 13) {
                    return { organ: 'Coração', timeRange: '11:00 - 13:00', element: 'Fogo', description: 'Pico da circulação sanguínea, alegria de viver e conexão espiritual.' };
                } else if (hour >= 13 && hour < 15) {
                    return { organ: 'Intestino Delgado', timeRange: '13:00 - 15:00', element: 'Fogo', description: 'Separação do puro e do impuro, tanto dos alimentos quanto dos pensamentos.' };
                } else if (hour >= 15 && hour < 17) {
                    return { organ: 'Bexiga', timeRange: '15:00 - 17:00', element: 'Água', description: 'Período de eliminação de resíduos líquidos e regulação dos fluidos corporais.' };
                } else if (hour >= 17 && hour < 19) {
                    return { organ: 'Rins', timeRange: '17:00 - 19:00', element: 'Água', description: 'Armazenamento da energia essencial (Jing), filtragem do sangue e fortalecimento da força de vontade.' };
                } else if (hour >= 19 && hour < 21) {
                    return { organ: 'Pericárdio (Circulação-Sexo)', timeRange: '19:00 - 21:00', element: 'Fogo', description: 'Proteção do coração físico e emocional, ideal para relaxamento e conexão amorosa.' };
                } else if (hour >= 21 && hour < 23) {
                    return { organ: 'Triplo Aquecedor', timeRange: '21:00 - 23:00', element: 'Fogo', description: 'Harmonização dos três aquecedores (tórax, abdômen superior e inferior), regulação da temperatura e relaxamento para o sono.' };
                } else {
                    return { organ: 'Vesícula Biliar', timeRange: '23:00 - 01:00', element: 'Madeira', description: 'Período de processamento de gorduras, secreção de bile e tomada de decisões conscientes durante o sono.' };
                }
            };

            const organClock = getActiveOrganClock();

            const response = await fetch(`${baseApiUrl}/.netlify/functions/deficiency-oracle`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    symptom: query, 
                    chronicity,
                    geneticMarkers,
                    organClock,
                    anamnese
                })
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
                // Adiciona imediatamente à lista local para aparecer na busca sem recarregar
                setDynamicProtocols(prev => {
                    const queryKey = query.toLowerCase().trim();
                    const exists = prev.some(p => p.query === queryKey);
                    if (!exists) {
                        return [{ query: queryKey, protocol: data.protocol }, ...prev];
                    }
                    return prev;
                });
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

    useEffect(() => {
        const query = localStorage.getItem('phyto_search_query');
        const autoOracle = localStorage.getItem('phyto_auto_oracle');
        if (query) {
            setSearchTerm(query);
            localStorage.removeItem('phyto_search_query');
            if (autoOracle === 'true') {
                localStorage.removeItem('phyto_auto_oracle');
                // Call oracle after component state updates
                setTimeout(() => {
                    handleConsultOracle(query);
                }, 150);
            }
        }
    }, []);

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

    const DynamicProtocolCard = ({ item }: { item: { query: string; protocol: OracleProtocol } }) => {
        return (
            <div 
                onClick={() => {
                    setOracleResult(item.protocol);
                    setShowOracleDetails(true);
                    // Rola para o topo do resultado do oráculo
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-slate-950 rounded-2xl shadow-lg border border-purple-500/25 overflow-hidden hover:border-purple-500 hover:shadow-purple-500/10 transition-all flex flex-col cursor-pointer group transform hover:scale-[1.01]"
            >
                <div className="p-4 bg-gradient-to-r from-purple-950 to-slate-900 text-white flex justify-between items-start border-b border-purple-900/30">
                    <div>
                        <h3 className="text-xl font-bold flex items-center gap-1.5 text-purple-200">
                            {item.protocol.titulo}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">Termo pesquisado: "{item.query}"</p>
                    </div>
                    <div className="bg-purple-900/40 p-2 rounded-lg border border-purple-500/30">
                        <Sparkles className="w-5 h-5 text-amber-300" />
                    </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center text-[10px] font-black text-purple-400 mb-3 uppercase tracking-wider">
                            <Compass className="w-4 h-4 mr-1 text-purple-500 animate-pulse" /> 
                            Conhecimento Sistêmico
                        </div>
                        <p className="text-sm text-slate-300 line-clamp-3 italic mb-4 leading-relaxed">
                            "{item.protocol.visaoIntegrativa}"
                        </p>
                    </div>

                    <div>
                        <div className="space-y-2 border-t border-slate-900 pt-3">
                            {item.protocol.protocolo.fitoterapia && ((item.protocol.protocolo.fitoterapia.plantasBrasileiras && item.protocol.protocolo.fitoterapia.plantasBrasileiras.length > 0) || (item.protocol.protocolo.fitoterapia.plantasMTC && item.protocol.protocolo.fitoterapia.plantasMTC.length > 0)) && (
                                <div className="text-xs flex items-center gap-1.5 text-slate-400">
                                    <Leaf className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                                    <span className="font-semibold text-slate-300">Fitoterapia:</span>
                                    <span className="truncate text-slate-400">
                                        {[...(item.protocol.protocolo.fitoterapia.plantasBrasileiras || []), ...(item.protocol.protocolo.fitoterapia.plantasMTC || [])].slice(0, 2).join(', ')}
                                    </span>
                                </div>
                            )}
                            {item.protocol.protocolo.suplementos && item.protocol.protocolo.suplementos.length > 0 && (
                                <div className="text-xs flex items-center gap-1.5 text-slate-400">
                                    <Activity className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                                    <span className="font-semibold text-slate-300">Suplementos:</span>
                                    <span className="truncate text-slate-400">
                                        {item.protocol.protocolo.suplementos.slice(0, 2).map(s => s.nome).join(', ')}
                                    </span>
                                </div>
                            )}
                        </div>
                        
                        <div className="mt-4 pt-3 border-t border-slate-900/50 flex items-center justify-between text-xs text-purple-400 font-bold group-hover:underline">
                            <span>Acessar Protocolo Completo 360°</span>
                            <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
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
                        <button
                            onClick={() => {
                                if (fromMapaVivo) {
                                    localStorage.removeItem('phyto_from_mapa_vivo');
                                    onPageChange('mapa-vivo');
                                } else {
                                    onPageChange('home');
                                }
                            }}
                            className="p-2 mr-4 bg-white hover:bg-gray-100 rounded-full shadow-sm hover:shadow transition-all border border-gray-200 flex items-center justify-center"
                            title={fromMapaVivo ? "Voltar ao Mapa Vivo" : "Voltar"}
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                            <BookOpen className="w-8 h-8 mr-3 text-emerald-600 animate-[pulse_3s_infinite]" />
                            Biblioteca Integrativa (Botânica & Biohacking)
                        </h1>
                        <p className="text-gray-500 mt-1">Herbário completo com Fitoterapia, Peptídeos e Consulta ao Oráculo de Deficiências.</p>
                    </div>
                </div>

                {/* Search and Filters */}
                <div id="phyto-library-section" className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
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
                    <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto items-center">
                        <div className="relative w-full md:w-80">
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
                            <div className="flex flex-col sm:flex-row items-center gap-3 bg-purple-50 p-2 rounded-xl border border-purple-100 w-full md:w-auto">
                                <div className="flex flex-col items-start gap-1">
                                    <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider px-1">Como descreve o sintoma?</span>
                                    <div className="flex gap-1">
                                        <button
                                            type="button"
                                            onClick={() => setChronicity('agudo')}
                                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                                                chronicity === 'agudo'
                                                    ? 'bg-red-500 text-white border-red-650 shadow-sm'
                                                    : 'bg-white text-gray-700 border-gray-250 hover:bg-gray-50'
                                            }`}
                                        >
                                            🔴 Agudo
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setChronicity('cronico')}
                                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                                                chronicity === 'cronico'
                                                    ? 'bg-blue-500 text-white border-blue-650 shadow-sm'
                                                    : 'bg-white text-gray-700 border-gray-250 hover:bg-gray-50'
                                            }`}
                                        >
                                            🔵 Crônico
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setChronicity('misto')}
                                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                                                chronicity === 'misto'
                                                    ? 'bg-purple-500 text-white border-purple-650 shadow-sm'
                                                    : 'bg-white text-gray-700 border-gray-250 hover:bg-gray-50'
                                            }`}
                                        >
                                            🟣 Misto
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleConsultOracle()}
                                    disabled={isOracleLoading}
                                    className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 text-sm shrink-0 active:scale-95 disabled:opacity-50 self-end"
                                >
                                    {isOracleLoading ? (
                                        <Loader className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Sparkles className="w-4 h-4 text-amber-200" />
                                    )}
                                    <span>Oráculo AI</span>
                                </button>
                            </div>
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
                                                                                className="relative mt-2 rounded-xl overflow-hidden cursor-pointer hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 max-w-[280px] group shadow-md border border-slate-800 hover:border-purple-500/50"
                                                                                onClick={() => {
                                                                                    console.log('Oráculo YNSA image click:', matchedPoint.image);
                                                                                    setZoomImageUrl(getSafeImagePath(matchedPoint.image));
                                                                                    setShowZoomModal(true);
                                                                                }}
                                                                            >
                                                                                <img 
                                                                                    src={getSafeImagePath(matchedPoint.image)} 
                                                                                    alt={matchedPoint.name} 
                                                                                    className="w-full h-36 object-contain bg-gray-50 p-2 rounded-xl border border-gray-200 shadow-inner"
                                                                                    onError={(e) => {
                                                                                        e.currentTarget.style.display = 'none';
                                                                                    }}
                                                                                />
                                                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200 rounded-xl">
                                                                                    <span className="text-[10px] text-white font-bold bg-purple-600/90 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
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
                                                                                className="relative mt-2 rounded-xl overflow-hidden cursor-pointer hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 max-w-[280px] group shadow-md border border-slate-800 hover:border-orange-500/50"
                                                                                onClick={() => {
                                                                                    console.log('Oráculo MTC image click:', matchedPoint.image);
                                                                                    setZoomImageUrl(getSafeImagePath(matchedPoint.image));
                                                                                    setShowZoomModal(true);
                                                                                }}
                                                                            >
                                                                                <img 
                                                                                    src={getSafeImagePath(matchedPoint.image)} 
                                                                                    alt={matchedPoint.name} 
                                                                                    className="w-full h-36 object-contain bg-gray-50 p-2 rounded-xl border border-gray-200 shadow-inner"
                                                                                    onError={(e) => {
                                                                                        e.currentTarget.style.display = 'none';
                                                                                    }}
                                                                                />
                                                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200 rounded-xl">
                                                                                    <span className="text-[10px] text-white font-bold bg-orange-600/90 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
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
                                                <h4 className="text-xs font-bold text-emerald-400 mb-1">🇧🇷 Plantas Brasileiras Comprovadas (Clique para ver):</h4>
                                                <ul className="text-xs text-slate-300 space-y-1.5 pl-1.5">
                                                    {(oracleResult.protocolo.fitoterapia?.plantasBrasileiras || []).map((p, idx) => (
                                                        <li 
                                                            key={idx} 
                                                            onClick={() => handleSelectRecommendedItem(p)}
                                                            className="hover:text-emerald-300 hover:underline cursor-pointer transition-colors duration-150 flex items-center py-0.5 group"
                                                        >
                                                            <span className="mr-2 text-emerald-500">•</span>
                                                            <span>{p}</span>
                                                            <Search className="w-3 h-3 ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400 shrink-0" />
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="border-t border-slate-950 pt-3">
                                                <h4 className="text-xs font-bold text-orange-400 mb-1">🏮 Fitoterapia Chinesa / Pinyin (Clique para ver):</h4>
                                                <ul className="text-xs text-slate-300 space-y-1.5 pl-1.5">
                                                    {(oracleResult.protocolo.fitoterapia?.plantasMTC || []).map((p, idx) => (
                                                        <li 
                                                            key={idx} 
                                                            onClick={() => handleSelectRecommendedItem(p)}
                                                            className="hover:text-orange-300 hover:underline cursor-pointer transition-colors duration-150 flex items-center py-0.5 group"
                                                        >
                                                            <span className="mr-2 text-orange-500">•</span>
                                                            <span>{p}</span>
                                                            <Search className="w-3 h-3 ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-orange-400 shrink-0" />
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Peptídeos & Biohacking Epigenético */}
                                    {oracleResult.protocolo.peptideos && oracleResult.protocolo.peptideos.indicados.length > 0 && (
                                        <div className="bg-slate-900/30 border border-slate-850 p-4 rounded-2xl relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-12 h-12 bg-indigo-500/10 rounded-full blur-lg" />
                                            <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center"><Dna className="w-4 h-4 mr-1.5 animate-pulse" /> Peptídeos de Biohacking</h3>
                                            <ul className="text-xs text-slate-300 space-y-1.5 pl-1.5">
                                                {oracleResult.protocolo.peptideos.indicados.map((pep, idx) => (
                                                    <li 
                                                        key={idx} 
                                                        onClick={() => handleSelectRecommendedItem(pep)}
                                                        className="hover:text-indigo-300 hover:underline cursor-pointer transition-colors duration-150 flex items-center py-0.5 group"
                                                    >
                                                        <span className="mr-2 text-indigo-500">•</span>
                                                        <span>{pep}</span>
                                                        <Search className="w-3 h-3 ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400 shrink-0" />
                                                    </li>
                                                ))}
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

                            {/* Recomendação de Precisão (Epigenética/DNA/OrganClock) */}
                            {oracleResult.recPrecisao && (
                                <div className="bg-gradient-to-br from-indigo-950/20 via-slate-900/30 to-purple-950/20 border border-indigo-500/30 rounded-2xl p-5 flex flex-col md:flex-row gap-4 items-start relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl group-hover:scale-125 transition-transform duration-700" />
                                    <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl shrink-0 shadow-lg shadow-indigo-500/10">
                                        <Dna className="w-6 h-6 animate-pulse" />
                                    </div>
                                    <div className="z-10">
                                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                            <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest">Prescrição e Nutrição de Precisão (DNA)</h4>
                                            <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">Sincronizado via Relógio MTC</span>
                                        </div>
                                        <p className="text-xs text-slate-200 leading-relaxed font-semibold">{oracleResult.recPrecisao}</p>
                                    </div>
                                </div>
                            )}

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
                        {/* Seção de protocolos dinâmicos recuperados do Supabase */}
                        {dynamicProtocols.length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="flex items-center gap-2 bg-purple-950/40 border border-purple-500/30 rounded-full px-4 py-1.5">
                                        <Sparkles className="w-5 h-5 text-purple-400" />
                                        <span className="font-bold text-purple-300 text-sm uppercase tracking-widest text-white">Conhecimento Coletivo Descoberto</span>
                                    </div>
                                    <span className="text-xs text-purple-400 font-mono">{dynamicProtocols.length} protocolos</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {dynamicProtocols.map(item => <DynamicProtocolCard key={item.query} item={item} />)}
                                </div>
                            </section>
                        )}
                        {brasilHerbs.length === 0 && mtcHerbs.length === 0 && peptideHerbs.length === 0 && dynamicProtocols.length === 0 && (
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
                ) : (filteredHerbs.length > 0 || dynamicProtocols.length > 0) ? (
                    // Vista filtrada por aba específica com resultados ou protocolos dinâmicos
                    <div className="space-y-12">
                        {filteredHerbs.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredHerbs.map(herb => (
                                    <HerbCard key={herb.id} herb={herb} />
                                ))}
                            </div>
                        )}
                        {dynamicProtocols.length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="flex items-center gap-2 bg-purple-950/40 border border-purple-500/30 rounded-full px-4 py-1.5">
                                        <Sparkles className="w-5 h-5 text-purple-400" />
                                        <span className="font-bold text-purple-300 text-sm uppercase tracking-widest text-white">Conhecimento Coletivo Descoberto</span>
                                    </div>
                                    <span className="text-xs text-purple-400 font-mono">{dynamicProtocols.length} protocolos</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {dynamicProtocols.map(item => <DynamicProtocolCard key={item.query} item={item} />)}
                                </div>
                            </section>
                        )}
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
