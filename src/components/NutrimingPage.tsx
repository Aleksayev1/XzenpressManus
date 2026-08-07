import React, { useState, useEffect } from 'react';
import { Clock, Brain, Sparkles, ArrowLeft, Plus, Trash2, Info, AlertCircle, Sun, Moon, Activity, Zap, Shield, Pill, ChevronDown, ChevronUp, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { findSupplementInfo, SUPPLEMENT_CATEGORY_STYLE } from '../data/supplementDatabase';

interface NutrimingPageProps {
    onPageChange: (page: string) => void;
}

interface Supplement {
    id?: string;
    name: string;
    dosage: string;
    timing: 'morning' | 'afternoon' | 'evening' | 'night' | 'with-meal' | 'empty-stomach' | 'anytime';
    notes?: string;
}

interface UserProfile {
    age: number;
    gender: 'male' | 'female' | 'other';
    symptoms: string[];
}

const SUPPLEMENT_DATABASE = {
    // Interações conhecidas (simplificado para MVP)
    conflicts: {
        'Cálcio': ['Ferro', 'Zinco'],
        'Ferro': ['Cálcio', 'Zinco', 'Chá Verde'],
        'Zinco': ['Cálcio', 'Ferro', 'Cobre'],
        'Magnésio': ['Antibióticos (tetraciclina)'],
        'Vitamina C': ['Vitamina B12 (alta dose)'],
    },
    // Timing otimizado (com variações comuns)
    optimalTiming: {
        // Vitaminas
        'Vitamina D': 'morning',
        'Vitamina D3': 'morning',
        'D3': 'morning',
        'Colecalciferol': 'morning',
        'Vitamina B12': 'morning',
        'B12': 'morning',
        'Cobalamina': 'morning',
        'B-Complex': 'morning',
        'Vitaminas do Complexo B': 'morning',
        'Complexo B': 'morning',
        'Vitamina C': 'morning',
        'Ácido Ascórbico': 'morning',

        // Minerais
        'Ferro': 'empty-stomach',
        'Sulfato Ferroso': 'empty-stomach',
        'Magnésio': 'evening',
        'Cloreto de Magnésio': 'evening',
        'Cloreto Magnésio': 'evening',
        'Magnésio Dimalato': 'evening',
        'Magnésio Quelado': 'evening',
        'Cálcio': 'evening',
        'Citrato de Cálcio': 'evening',
        'Carbonato de Cálcio': 'evening',
        'Zinco': 'with-meal',
        'Zinco Quelado': 'with-meal',

        // Ômega e Gorduras
        'Ômega-3': 'with-meal',
        'Ômega 3': 'with-meal',
        'Omega-3': 'with-meal',
        'Omega 3': 'with-meal',
        'Óleo de Peixe': 'with-meal',

        // Probióticos
        'Probióticos': 'morning',
        'Probiótico': 'morning',
        'Lactobacillus': 'morning',

        // Antioxidantes
        'Coenzima Q10': 'with-meal',
        'CoQ10': 'with-meal',
        'Ubiquinol': 'with-meal',
        'Curcumina': 'with-meal',
        'Cúrcuma': 'with-meal',

        // Aminoácidos
        'N-Acetilcisteína': 'morning',
        'N acetilcisteína': 'morning',
        'NAC': 'morning',
        'L-Teanina': 'evening',
        'Glicina': 'evening',

        // Adaptógenos e Fitoterápicos (MTC & Brasileiros)
        'Ashwagandha': 'evening',
        'Rhodiola': 'morning',
        'Ginseng': 'morning',
        'Panax Ginseng': 'morning',
        'Ginkgo Biloba': 'morning',
        'Cordyceps': 'morning',
        'Reishi': 'evening',
        'Maca Peruana': 'morning',
        'Guaraná': 'morning',
        'Catuaba': 'morning',
        'Marapuama': 'morning',
        'Espinheira Santa': 'with-meal',
        'Erva-Baleeira': 'with-meal',
        'Unha de Gato': 'with-meal',
        'Passiflora': 'evening',
        'Mulungu': 'evening',
        'Valeriana': 'evening',
        'Goji Berry': 'morning',

        // Sono
        'Melatonina': 'evening',
    } as Record<string, string>,
    // Recomendações por idade
    ageRecommendations: {
        'child': ['Vitamina D', 'Ômega-3', 'Probióticos'], // 2-17 anos
        '18-30': ['B-Complex', 'Vitamina D', 'Ômega-3', 'Probióticos'],
        '30-45': ['B-Complex', 'Vitamina D', 'Ômega-3', 'Magnésio', 'Coenzima Q10'],
        '45-60': ['Vitamina D', 'Ômega-3', 'Magnésio', 'Coenzima Q10', 'Curcumina'],
        '60+': ['Vitamina D', 'Vitamina B12', 'Ômega-3', 'Magnésio', 'Coenzima Q10', 'Curcumina']
    } as Record<string, string[]>,
    // Recomendações por sexo
    genderRecommendations: {
        male: ['Zinco', 'Vitamina D', 'Magnésio', 'Creatina'],
        female: ['Ferro', 'Cálcio', 'Ácido Fólico', 'Vitamina B12'],
        other: ['Vitamina D', 'Ômega-3', 'B-Complex']
    } as Record<string, string[]>,
    // Suplementos e Fito por sintoma
    symptomSupplements: {
        'Ansiedade': ['Magnésio', 'L-Teanina', 'Ashwagandha', 'Passiflora', 'Mulungu'],
        'Insônia': ['Magnésio', 'Melatonina', 'Valeriana', 'Reishi', 'Mulungu'],
        'Fadiga': ['Coenzima Q10', 'Ginseng', 'Cordyceps', 'Maca Peruana', 'Guaraná'],
        'Dor nas articulações': ['Curcumina', 'Erva-Baleeira', 'Unha de Gato', 'Ômega-3'],
        'Imunidade baixa': ['Vitamina D', 'Vitamina C', 'Zinco', 'Unha de Gato', 'Astragalus'],
        'Estresse': ['Ashwagandha', 'Rhodiola', 'Reishi', 'Passiflora'],
        'Problemas Digestivos': ['Probióticos', 'Espinheira Santa', 'Gengibre'],
        'Foco e Memória': ['Ginkgo Biloba', 'Rhodiola', 'Maca Peruana', 'B-Complex']
    } as Record<string, string[]>
};

import { getNutrientLimit } from '../data/nutrientLimits';
import { NutrimingSafetyModal } from './NutrimingSafetyModal';
import { CriticalSafetyModal } from './CriticalSafetyModal';
import { analyzeInteractions } from '../data/supplementInteractions';

export const NutrimingPage: React.FC<NutrimingPageProps> = ({ onPageChange }) => {
    const { user } = useAuth();
    const [supplements, setSupplements] = useState<Supplement[]>([]);
    const [userProfile, setUserProfile] = useState<UserProfile>({ age: 35, gender: 'other', symptoms: [] });
    const [showAddForm, setShowAddForm] = useState(false);
    const [newSupplement, setNewSupplement] = useState({ name: '', dosage: '', notes: '' });
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [contextBanner, setContextBanner] = useState<{
        organ: string;
        element: string;
        emotionName: string;
        symptom: string | null;
    } | null>(null);

    // Novo Estado para Segurança
    const [showSafetyModal, setShowSafetyModal] = useState(false);
    // Pending supplement for override scenario
    const [pendingSupplement, setPendingSupplement] = useState<{ name: string, dosage: string, notes: string } | null>(null);

    // Estado para Alerta Crítico (Popup)
    const [criticalAlert, setCriticalAlert] = useState<{
        isOpen: boolean;
        type: 'dosage' | 'interaction';
        title: string;
        message: string;
        details?: string;
    }>({ isOpen: false, type: 'dosage', title: '', message: '' });

    // === VERIFICADOR DE INTERAÇÕES AI ===
    const [medications, setMedications] = useState<string[]>([]);
    const [newMedication, setNewMedication] = useState('');
    const [interactionReport, setInteractionReport] = useState<any>(null);
    const [interactionLoading, setInteractionLoading] = useState(false);
    const [interactionError, setInteractionError] = useState('');
    const [showInteractionChecker, setShowInteractionChecker] = useState(false);
    const [showReportDetails, setShowReportDetails] = useState(false);

    const addMedication = () => {
        const m = newMedication.trim();
        if (m && !medications.includes(m)) setMedications(prev => [...prev, m]);
        setNewMedication('');
    };

    const runInteractionCheck = async () => {
        if (supplements.length === 0 && medications.length === 0) return;
        setInteractionLoading(true);
        setInteractionError('');
        setInteractionReport(null);
        setShowReportDetails(false);
        try {
            const { getBaseApiUrl } = await import('../lib/api');
            const res = await fetch(`${getBaseApiUrl()}/.netlify/functions/interaction-checker`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    medications, 
                    supplements: supplements.map(s => s.name),
                    userEmail: user?.email || null,
                    isPremium: user?.isPremium || false
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Erro na análise');
            setInteractionReport(data.report);
            setShowReportDetails(true);
        } catch (err: any) {
            setInteractionError(err.message || 'Erro ao verificar interações.');
        } finally {
            setInteractionLoading(false);
        }
    };

    const riskColor: Record<string, string> = {
        grave:        'bg-red-50 border-red-300 text-red-900',
        moderada:     'bg-orange-50 border-orange-300 text-orange-900',
        leve:         'bg-yellow-50 border-yellow-300 text-yellow-900',
        segura:       'bg-emerald-50 border-emerald-300 text-emerald-900',
        desconhecida: 'bg-gray-50 border-gray-300 text-gray-700',
    };

    // Verificar consentimento legal ao carregar
    useEffect(() => {
        const consent = localStorage.getItem('nutriming_legal_consent');
        if (consent !== 'accepted_v1') {
            setShowSafetyModal(true);
        }
    }, []);

    // Função para solicitar permissão de notificações
    const requestNotificationPermission = async () => {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                setNotificationsEnabled(true);
                scheduleNotifications();
                localStorage.setItem('nutriming_notifications', 'enabled');
            }
        } else {
            alert('Seu navegador não suporta notificações.');
        }
    };

    // Função de Teste de Notificação
    const testNotification = async () => {
        if (!notificationsEnabled) {
            const granted = await Notification.requestPermission();
            if (granted !== 'granted') {
                alert('⚠️ Permissão de notificação negada. Verifique as configurações do seu navegador.');
                return;
            }
        }

        const { NutrimingNotificationService } = await import('../services/nutrimingNotificationService');
        await NutrimingNotificationService.showNotification(
            '🔔 Teste do Nutriming',
            'Se você está vendo isso, as notificações estão funcionando perfeitamente!',
            '/robo-zen-meditando.png'
        );
        alert('Notificação de teste enviada! Verifique sua área de notificações (ou Central de Ações no Windows).');
    };

    // Agendar notificações usando o serviço
    const scheduleNotifications = async () => {
        if (!notificationsEnabled) return;

        const { NutrimingNotificationService } = await import('../services/nutrimingNotificationService');
        await NutrimingNotificationService.scheduleNotifications(supplements);
    };

    // Agendar notificação específica
    const scheduleNotification = (time: string, title: string, body: string) => {
        const [hours, minutes] = time.split(':').map(Number);
        const now = new Date();
        const scheduledTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

        if (scheduledTime < now) {
            scheduledTime.setDate(scheduledTime.getDate() + 1);
        }

        const timeUntilNotification = scheduledTime.getTime() - now.getTime();

        setTimeout(() => {
            if (notificationsEnabled && Notification.permission === 'granted') {
                new Notification(title, {
                    body,
                    icon: '/robo-zen-meditando.png',
                    badge: '/robo-zen-meditando.png'
                });
            }
            // Re-agendar para amanhã
            setTimeout(() => scheduleNotification(time, title, body), 24 * 60 * 60 * 1000);
        }, timeUntilNotification);
    };

    // Calcular hidratação recomendada
    const calculateHydration = () => {
        const baseWater = 2; // Litros base
        const supplementBonus = supplements.length * 0.2; // 200ml por suplemento
        return Math.round((baseWater + supplementBonus) * 10) / 10; // Arredondar para 1 casa decimal
    };

    // Verificar autenticação - redirecionar para login se não estiver logado
    useEffect(() => {
        if (!user) {
            alert('⚠️ Acesso Restrito\n\nFaça login para acessar o Nutriming AI.');
            onPageChange('login');
        }
    }, [user, onPageChange]);

    // ⚠️ TRIAL DESABILITADO TEMPORARIAMENTE - SOFT LAUNCH
    // TODO: Reativar após implementar Stripe Webhook + Renovação Automática

    /* CÓDIGO DE TRIAL COMENTADO - Será reativado após finalizar sistema de pagamentos
    
    // Verificar trial status e incrementar contador
    useEffect(() => {
        if (!user) return;

        const checkTrialStatus = async () => {
            const status = await NutrimingTrialService.canAccessNutriming(user.id, user.isPremium);

            if (!status.allowed) {
                // Redirecionar para Premium se esgotou usos
                alert('🎁 Teste Grátis Esgotado!\n\nVocê usou seus 3 testes gratuitos do Nutriming AI.\n\nAssine Premium para acesso ilimitado!');
                onPageChange('premium');
                return;
            }

            setTrialStatus(status);

            // Incrementar contador apenas se não for Premium
            if (!user.isPremium) {
                await NutrimingTrialService.incrementUsage(user.id);
                // Atualizar status após incremento
                const updatedStatus = await NutrimingTrialService.canAccessNutriming(user.id, user.isPremium);
                setTrialStatus(updatedStatus);
            }
        };

        checkTrialStatus();
    }, [user]);
    
    */

    // Verificar permissão ao carregar (Service Worker)
    useEffect(() => {
        const saved = localStorage.getItem('nutriming_notifications');
        if (saved === 'enabled' && Notification.permission === 'granted') {
            setNotificationsEnabled(true);
            scheduleNotifications();
        }
    }, []);

    // Re-agendar quando suplementos mudarem
    useEffect(() => {
        if (notificationsEnabled) {
            scheduleNotifications();
        }
    }, [supplements, notificationsEnabled]);

    // Carregar dados do Supabase ao montar componente
    useEffect(() => {
        if (!user?.id) return;

        const loadUserData = async () => {
            // Carregar suplementos do Supabase
            const { NutrimingStorageService } = await import('../services/nutrimingStorageService');
            const savedSupplements = await NutrimingStorageService.loadSupplements(user.id);
            const savedProfile = await NutrimingStorageService.loadProfile(user.id);

            setSupplements(savedSupplements);

            // ── Ler nutriming_context ──────────────────────────────────────
            let updatedSymptoms = savedProfile.symptoms || [];
            try {
                const raw = localStorage.getItem('nutriming_context');
                if (raw) {
                    const context = JSON.parse(raw);
                    localStorage.removeItem('nutriming_context'); // Clear it immediately

                    const emotionToSymptomMap: Record<string, string> = {
                        anxiety: 'Ansiedade',
                        stress: 'Estresse',
                        insomnia: 'Insônia',
                        fatigue: 'Fadiga',
                        anger: 'Estresse',
                        sadness: 'Estresse',
                        grief: 'Estresse',
                    };

                    const symptom = emotionToSymptomMap[context.emotionId];
                    if (symptom && !updatedSymptoms.includes(symptom)) {
                        updatedSymptoms = [...updatedSymptoms, symptom];

                        // Save profile with new symptom
                        await NutrimingStorageService.saveProfile(user.id, {
                            ...savedProfile,
                            symptoms: updatedSymptoms
                        });
                    }

                    // Set context banner state
                    const emotionNames: Record<string, string> = {
                        anxiety: 'Ansiedade',
                        stress: 'Estresse',
                        insomnia: 'Insônia',
                        fatigue: 'Fadiga',
                        anger: 'Raiva',
                        sadness: 'Tristeza',
                        grief: 'Luto/Pesar'
                    };
                    const emotionName = emotionNames[context.emotionId] || context.emotionId || '';

                    setContextBanner({
                        organ: context.organ || '',
                        element: context.element || '',
                        emotionName,
                        symptom: symptom || null
                    });
                }
            } catch (err) {
                console.error('Error reading nutriming_context:', err);
            }

            // Garantir que profile tenha todos os campos
            setUserProfile({
                age: savedProfile.age || 35,
                gender: (savedProfile.gender as any) || 'other',
                symptoms: savedProfile.symptoms || []
            });
        };

        loadUserData();
    }, [user?.id]);

    // Salvar dados no Supabase sempre que mudarem
    const saveData = async (sups: Supplement[], profile: UserProfile) => {
        if (!user?.id) return;

        const { NutrimingStorageService } = await import('../services/nutrimingStorageService');

        // Salvar no Supabase (permanente)
        await NutrimingStorageService.saveSupplements(user.id, sups);

        // Salvar perfil no Supabase (Agora com tabela dedicada)
        await NutrimingStorageService.saveProfile(user.id, profile);
    };

    // Função auxiliar para matching inteligente
    const findOptimalTiming = (supplementName: string): Supplement['timing'] => {
        // 1. Busca exata
        if (SUPPLEMENT_DATABASE.optimalTiming[supplementName]) {
            return SUPPLEMENT_DATABASE.optimalTiming[supplementName] as Supplement['timing'];
        }

        // 2. Normalizar e buscar (remove acentos, lowercase)
        const normalize = (str: string) => str.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim();

        const normalizedInput = normalize(supplementName);

        // 3. Busca parcial (ex: "Cloreto Magnésio" contém "Magnésio")
        for (const [key, value] of Object.entries(SUPPLEMENT_DATABASE.optimalTiming)) {
            const normalizedKey = normalize(key);
            // Match se input contém a palavra-chave OU palavra-chave contém input
            if (normalizedInput.includes(normalizedKey) || normalizedKey.includes(normalizedInput)) {
                return value as Supplement['timing'];
            }
        }

        // 4. Default: manhã
        return 'morning';
    };

    const finalizeAddSupplement = (supData: { name: string, dosage: string, notes: string }) => {
        const timing = findOptimalTiming(supData.name);
        const supplement: Supplement = {
            id: Date.now().toString(),
            name: supData.name,
            dosage: supData.dosage || '1x ao dia',
            timing,
            notes: supData.notes || ''
        };

        const updated = [...supplements, supplement];
        setSupplements(updated);
        saveData(updated, userProfile);
        setNewSupplement({ name: '', dosage: '', notes: '' });
        setShowAddForm(false);
        setPendingSupplement(null);
    };

    const handleForceAdd = () => {
        if (pendingSupplement) {
            finalizeAddSupplement(pendingSupplement);
        }
    };

    const addSupplement = () => {
        if (!newSupplement.name) return;

        // 0. Verificação de Limite Gratuito (Regra de 3)
        if (!user?.isPremium && supplements.length >= 3) {
            alert('🔒 Limite Gratuito Atingido\n\nVocê já adicionou seus 3 suplementos gratuitos do Nutriming. Para otimizar toda sua rotina, torne-se Premium.');
            return;
        }

        // 1. Verificação de Segurança (Dosagem)
        const limit = getNutrientLimit(newSupplement.name);
        const doseValue = parseFloat((newSupplement.dosage || '').replace(/[^0-9.]/g, ''));

        if (limit && doseValue > limit.maxDaily) {
            setPendingSupplement(newSupplement); // Store for potential override
            setCriticalAlert({
                isOpen: true,
                type: 'dosage',
                title: `Dose Excessiva de ${limit.names[0]}`,
                message: `A dose de ${newSupplement.dosage} excede o limite seguro de ${limit.maxDaily}${limit.unit}.`,
                details: limit.warning
            });
            return; // Bloqueia adição direta, mas permite override via modal
        }

        // 2. Verificação de Interação Crítica
        const currentNames = supplements.map(s => s.name);
        const potentialInteractions = analyzeInteractions([...currentNames, newSupplement.name]);
        const criticalInteraction = potentialInteractions.find(i => i.severity === 'high');

        if (criticalInteraction) {
            setPendingSupplement(newSupplement); // Store for potential override
            setCriticalAlert({
                isOpen: true,
                type: 'interaction',
                title: criticalInteraction.title,
                message: criticalInteraction.description,
                details: criticalInteraction.source
            });
            return; // Bloqueia adição direta, mas permite override
        }

        // Se passar nas verificações, adiciona direto
        finalizeAddSupplement(newSupplement);
    };

    const removeSupplement = (id?: string) => {
        if (!id) return;
        const updated = supplements.filter(s => s.id !== id);
        setSupplements(updated);
        saveData(updated, userProfile);
    };

    const updateTiming = (id: string | undefined, timing: Supplement['timing']) => {
        if (!id) return;
        const updated = supplements.map(s => s.id === id ? { ...s, timing } : s);
        setSupplements(updated);
        saveData(updated, userProfile);
    };

    const toggleSymptom = (symptom: string) => {
        const updated = userProfile.symptoms.includes(symptom)
            ? userProfile.symptoms.filter(s => s !== symptom)
            : [...userProfile.symptoms, symptom];
        const newProfile = { ...userProfile, symptoms: updated };
        setUserProfile(newProfile);
        saveData(supplements, newProfile);
    };

    const getInteractions = () => {
        const names = supplements.map(s => s.name);
        return analyzeInteractions(names);
    };

    const getRecommendations = () => {
        // Determinar grupo etário
        const ageGroup = userProfile.age < 18 ? 'child' :
            userProfile.age < 30 ? '18-30' :
                userProfile.age < 45 ? '30-45' :
                    userProfile.age < 60 ? '45-60' : '60+';

        const ageRecommended = SUPPLEMENT_DATABASE.ageRecommendations[ageGroup] || [];
        const genderRecommended = SUPPLEMENT_DATABASE.genderRecommendations[userProfile.gender] || [];
        const symptomRecommended = userProfile.symptoms.flatMap(symptom =>
            SUPPLEMENT_DATABASE.symptomSupplements[symptom] || []
        );

        const all = [...ageRecommended, ...genderRecommended, ...symptomRecommended];
        const missing = [...new Set(all)].filter(rec => !supplements.some(s => s.name === rec));

        return missing;
    };

    const groupByTiming = () => {
        const groups = {
            morning: supplements.filter(s => s.timing === 'morning'),
            afternoon: supplements.filter(s => s.timing === 'afternoon'), // Added
            evening: supplements.filter(s => s.timing === 'evening' || s.timing === 'night'), // Handle legacy 'night'
            'with-meal': supplements.filter(s => s.timing === 'with-meal'),
            'empty-stomach': supplements.filter(s => s.timing === 'empty-stomach'), // Added
            // Catch-all for any legacy/undefined timings to avoid hidden items
            others: supplements.filter(s => !['morning', 'afternoon', 'evening', 'night', 'with-meal', 'empty-stomach'].includes(s.timing))
        };
        return groups;
    };

    const groups = groupByTiming();
    const interactions = getInteractions();
    const recommendations = getRecommendations();

    const timingLabels = {
        morning: { icon: Sun, label: 'Manhã (6h-10h)', color: 'text-yellow-600' },
        afternoon: { icon: Sun, label: 'Tarde (12h-16h)', color: 'text-orange-600' },
        evening: { icon: Moon, label: 'Noite (18h-22h)', color: 'text-indigo-600' },
        'with-meal': { icon: Clock, label: 'Com refeição', color: 'text-green-600' },
        'empty-stomach': { icon: Clock, label: 'Estômago vazio', color: 'text-purple-600' },
        others: { icon: Info, label: 'Outros Horários', color: 'text-gray-600' },
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
            <NutrimingSafetyModal isOpen={showSafetyModal} onClose={() => setShowSafetyModal(false)} />

            <CriticalSafetyModal
                isOpen={criticalAlert.isOpen}
                onClose={() => {
                    setCriticalAlert(prev => ({ ...prev, isOpen: false }));
                    setPendingSupplement(null);
                }}
                onConfirm={handleForceAdd}
                alertType={criticalAlert.type}
                title={criticalAlert.title}
                message={criticalAlert.message}
                details={criticalAlert.details}
            />

            <div className="max-w-6xl mx-auto">
                {/* Back to Home Button */}
                <div className="flex items-center mb-8 relative">
                    <button
                        onClick={() => onPageChange('home')}
                        className="p-2 mr-4 bg-white/80 hover:bg-white rounded-full shadow-sm hover:shadow transition-all group border border-gray-100"
                        title="Voltar ao Início"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-green-600 transition-colors" />
                    </button>
                    {/* Visual Cue - Drawing */}
                    <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400 font-handwriting opacity-80 animate-fade-in select-none">
                        <span>↵ Menu Principal</span>
                    </div>
                </div>

                {/* Header */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
                    <div className="bg-gradient-to-r from-green-600 to-teal-600 p-8 text-white text-center">
                        <div className="flex justify-center mb-4">
                            <div className="p-4 bg-white/20 rounded-full backdrop-blur-md">
                                <Sparkles className="w-12 h-12 text-yellow-300" />
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold mb-2">Nutriming AI</h1>
                        <p className="text-xl text-green-100 mb-4">Timing perfeito para sua suplementação</p>

                        {!user?.isPremium && (
                            <div className="max-w-md mx-auto bg-white/20 backdrop-blur-sm rounded-lg p-2 border border-white/30">
                                <div className="flex justify-between text-xs font-bold text-white mb-1 px-1">
                                    <span>Plano Gratuito</span>
                                    <span>{supplements.length} / 3 Suplementos</span>
                                </div>
                                <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${supplements.length >= 3 ? 'bg-red-400' : 'bg-yellow-400'} transition-all duration-500`}
                                        style={{ width: `${Math.min((supplements.length / 3) * 100, 100)}%` }}
                                    />
                                </div>
                                {supplements.length >= 3 && (
                                    <p className="text-xs text-red-100 mt-1 font-semibold">
                                        Limite atingido. Assine Premium para ilimitado.
                                    </p>
                                )}
                            </div>
                        )}

                        {/* BANNER DE TRIAL DESABILITADO temporariamente */}
                        {/* 
            {trialStatus && !user?.isPremium && (
                <div className={`p-4 rounded-xl mb-6 ${trialStatus.usesLeft === 0
                    ? 'bg-red-100 border-2 border-red-400'
                    : 'bg-yellow-100 border-2 border-yellow-400'
                    }`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <span className="text-2xl">🎁</span>
                            <div>
                                <div className="font-bold text-gray-800">
                                    {trialStatus.usesLeft === 0
                                        ? 'Teste Grátis Esgotado'
                                        : `Teste Grátis: ${trialStatus.usesLeft} ${trialStatus.usesLeft === 1 ? 'uso restante' : 'usos restantes'}`
                                    }
                                </div>
                                <div className="text-sm text-gray-600">
                                    {trialStatus.usesLeft === 0
                                        ? 'Assine Premium para acesso ilimitado'
                                        : 'Aproveite enquanto você testa o Nutriming AI'
                                    }
                                </div>
                            </div>
                        </div>
                        {trialStatus.usesLeft === 0 && (
                            <button
                                onClick={() => onPageChange('premium')}
                                className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                            >
                                Assinar Premium
                            </button>
                        )}
                    </div>
                </div>
            )}
            */}
                    </div>

                    {/* DISCLAIMER LEGAL E FONTES */}
                    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 mt-6">
                        <div className="flex items-start space-x-3">
                            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-yellow-900">
                                <p className="font-bold mb-2">⚠️ IMPORTANTE - Informações Educacionais</p>
                                <p className="mb-3">
                                    Este sistema fornece <strong>orientações gerais educacionais</strong> baseadas em literatura científica.
                                    <strong className="block mt-2">NÃO substitui consulta médica ou nutricional.</strong>
                                </p>
                                <p className="text-xs text-yellow-800 mb-2">
                                    <strong>Fontes:</strong> Timing baseado em estudos de cronobiologia nutricional, absorção de nutrientes e interações documentadas em:
                                </p>
                                <ul className="text-xs text-yellow-800 space-y-1 ml-4">
                                    <li>• National Institutes of Health (NIH) - Office of Dietary Supplements</li>
                                    <li>• Journal of the International Society of Sports Nutrition</li>
                                    <li>• European Journal of Clinical Nutrition</li>
                                    <li>• American Journal of Clinical Nutrition</li>
                                </ul>
                                <p className="text-xs text-yellow-800 mt-3 font-semibold">
                                    Sempre consulte seu médico antes de iniciar qualquer suplementação.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contextual Onboarding/Oficina Banner */}
                {contextBanner && (
                    <div className="max-w-6xl mx-auto mb-8 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top duration-300">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-emerald-100 rounded-xl shrink-0 text-emerald-600 text-xl font-bold">
                                🥗
                            </div>
                            <div className="text-left">
                                <h4 className="font-bold text-emerald-900 text-sm">Oficina Terapêutica — Conexão Ativa</h4>
                                <p className="text-xs text-gray-600 mt-0.5">
                                    Identificamos que você concluiu o trabalho para o órgão <strong>{contextBanner.organ}</strong> (Elemento {contextBanner.element}) decorrente do estado de <strong>{contextBanner.emotionName}</strong>. Carregamos recomendações alimentares e nutricionais específicas para este pilar.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Perfil do Usuário */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Seu Perfil</h3>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Idade</label>
                                <input
                                    type="number"
                                    value={userProfile.age}
                                    onChange={(e) => {
                                        const newProfile = { ...userProfile, age: parseInt(e.target.value) || 0 };
                                        setUserProfile(newProfile);
                                        saveData(supplements, newProfile);
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
                                />
                            </div>

                            {/* Campo Sexo */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Sexo</label>
                                <select
                                    value={userProfile.gender}
                                    onChange={(e) => {
                                        const newProfile = { ...userProfile, gender: e.target.value as UserProfile['gender'] };
                                        setUserProfile(newProfile);
                                        saveData(supplements, newProfile);
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
                                >
                                    <option value="male">Masculino</option>
                                    <option value="female">Feminino</option>
                                    <option value="other">Outro/Prefiro não informar</option>
                                </select>
                            </div>

                            {/* Alerta Pediátrico */}
                            {userProfile.age < 18 && (
                                <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 mb-4">
                                    <div className="flex items-start space-x-2">
                                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                        <div className="text-sm text-red-900">
                                            <p className="font-bold">⚠️ ATENÇÃO: Menor de 18 anos</p>
                                            <p className="mt-1">
                                                Suplementação pediátrica requer <strong>acompanhamento médico obrigatório</strong>.
                                                Doses e necessidades são diferentes de adultos.
                                            </p>
                                        </div>
                                    </div>
                                </div>


                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Sintomas/Objetivos</label>
                                <div className="space-y-2">
                                    {Object.keys(SUPPLEMENT_DATABASE.symptomSupplements).map(symptom => (
                                        <label key={symptom} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={userProfile.symptoms.includes(symptom)}
                                                onChange={() => toggleSymptom(symptom)}
                                                className="mr-2"
                                            />
                                            <span className="text-sm text-gray-700">{symptom}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Botão de Teste de Notificação (Posicionamento Correto) */}
                            <div className="mt-6 border-t pt-4">
                                <button
                                    onClick={testNotification}
                                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-sm transition-colors border border-gray-200"
                                >
                                    <span className="text-xl">🔔</span>
                                    <span className="font-medium">Testar Notificação</span>
                                </button>
                                <p className="text-xs text-gray-500 mt-2 text-center">
                                    Receber um aviso de teste agora
                                </p>
                            </div>
                        </div>

                        {/* Recommendations */}
                        {recommendations.length > 0 && (
                            <div className="bg-blue-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                                <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                                    <Info className="w-5 h-5 mr-2" />
                                    Recomendações para Você
                                </h3>
                                <p className="text-sm text-blue-700 mb-3">Baseado na sua idade ({userProfile.age} anos) e sintomas:</p>
                                <ul className="space-y-2">
                                    {recommendations.map(rec => (
                                        <li key={rec} className="text-sm text-blue-800 flex items-center">
                                            <Sparkles className="w-4 h-4 mr-2 text-yellow-500" />
                                            {rec}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Interactions Analysis (Synergies & Conflicts) */}
                        {interactions.length > 0 && (
                            <div className="space-y-4 mb-6">
                                {interactions.map((interaction, idx) => (
                                    <div
                                        key={interaction.id + idx}
                                        className={`rounded-2xl shadow-lg p-6 border ${interaction.type === 'synergy'
                                            ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200'
                                            : interaction.severity === 'high'
                                                ? 'bg-red-50 border-red-200'
                                                : 'bg-orange-50 border-orange-200'
                                            }`}
                                    >
                                        <div className="flex items-start">
                                            <div className={`p-2 rounded-full mr-4 ${interaction.type === 'synergy' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                                                }`}>
                                                {interaction.type === 'synergy' ? <Sparkles className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                                            </div>
                                            <div>
                                                <h3 className={`text-lg font-bold mb-1 ${interaction.type === 'synergy' ? 'text-emerald-900' : 'text-red-900'
                                                    }`}>
                                                    {interaction.title}
                                                </h3>
                                                <p className={`text-sm mb-2 ${interaction.type === 'synergy' ? 'text-emerald-800' : 'text-red-800'
                                                    }`}>
                                                    {interaction.description}
                                                </p>
                                                {interaction.source && (
                                                    <p className="text-xs font-semibold opacity-75">
                                                        Fonte: {interaction.source}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}





                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Add Supplement */}
                        {!showAddForm ? (
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Adicionar Suplemento
                            </button>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Adicionar Novo Suplemento</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <input
                                        type="text"
                                        placeholder="Nome (ex: Vitamina D)"
                                        value={newSupplement.name}
                                        onChange={(e) => setNewSupplement({ ...newSupplement, name: e.target.value })}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 bg-white placeholder-gray-500"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Dosagem (ex: 5000 UI)"
                                        value={newSupplement.dosage}
                                        onChange={(e) => setNewSupplement({ ...newSupplement, dosage: e.target.value })}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 bg-white placeholder-gray-500"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Notas (opcional)"
                                        value={newSupplement.notes}
                                        onChange={(e) => setNewSupplement({ ...newSupplement, notes: e.target.value })}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 bg-white placeholder-gray-500"
                                    />
                                </div>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={addSupplement}
                                        className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                                    >
                                        Adicionar
                                    </button>
                                    <button
                                        onClick={() => setShowAddForm(false)}
                                        className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Schedule by Timing */}
                        {supplements.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                                <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">Adicione seus suplementos para ver o cronograma personalizado</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {Object.entries(groups).map(([timing, sups]) => {
                                    if (sups.length === 0) return null;
                                    const TimingIcon = timingLabels[timing as keyof typeof timingLabels].icon;
                                    return (
                                        <div key={timing} className="bg-white rounded-2xl shadow-lg p-6">
                                            <h3 className={`text-lg font-bold mb-4 flex items-center ${timingLabels[timing as keyof typeof timingLabels].color}`}>
                                                <TimingIcon className="w-6 h-6 mr-2" />
                                                {timingLabels[timing as keyof typeof timingLabels].label}
                                            </h3>
                                            <div className="space-y-3">
                                                {sups.map(sup => (
                                                    <div key={sup.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                         <div className="flex-1">
                                                            <p className="font-semibold text-gray-900">{sup.name}</p>
                                                            {/* Ação Principal - mesmo padrão da PhytoLibrary */}
                                                            {(() => {
                                                                const info = findSupplementInfo(sup.name);
                                                                if (info) {
                                                                    const style = SUPPLEMENT_CATEGORY_STYLE[info.category];
                                                                    return (
                                                                        <div className="mt-1 mb-1">
                                                                            <span className={`inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full border ${style.bg} ${style.color} uppercase tracking-wider mr-2`}>
                                                                                {style.label}
                                                                            </span>
                                                                            <span className="text-xs font-medium text-blue-700 flex items-center mt-1">
                                                                                <Activity className="w-3 h-3 mr-1 shrink-0" />
                                                                                {info.mainAction}
                                                                            </span>
                                                                            {info.warnings && (
                                                                                <p className="text-[10px] text-amber-700 mt-0.5 flex items-center">
                                                                                    <Zap className="w-3 h-3 mr-1 shrink-0" />
                                                                                    {info.warnings}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                }
                                                                return null;
                                                            })()}
                                                            <div className="flex flex-col">
                                                                <p className="text-sm text-gray-500">{sup.dosage}</p>
                                                                {(() => {
                                                                    const limit = getNutrientLimit(sup.name);
                                                                    if (limit) {
                                                                        return (
                                                                            <div className="mt-1 flex items-start space-x-1 text-xs bg-yellow-50 p-1.5 rounded border border-yellow-200">
                                                                                <Info className="w-3 h-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                                                                                <span className="text-yellow-800">
                                                                                    <strong>Ref. Segurança:</strong> Max {limit.maxDaily}{limit.unit} ({limit.source}).
                                                                                </span>
                                                                            </div>
                                                                        );
                                                                    }
                                                                    return null;
                                                                })()}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <select
                                                                value={sup.timing}
                                                                onChange={(e) => updateTiming(sup.id, e.target.value as Supplement['timing'])}
                                                                className="text-sm px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
                                                            >
                                                                <option value="morning">Manhã</option>
                                                                <option value="afternoon">Tarde</option>
                                                                <option value="evening">Noite</option>
                                                                <option value="with-meal">Com refeição</option>
                                                                <option value="empty-stomach">Estômago vazio</option>
                                                            </select>
                                                            <button
                                                                onClick={() => removeSupplement(sup.id)}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* MOVIDO: Grid 2 Colunas Desktop - Hidratação + Notificações */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            {/* Hydration Card - Coluna 1 */}
                            <div className="bg-cyan-50 rounded-2xl shadow-lg p-6 border border-cyan-200">
                                <h3 className="text-lg font-bold text-cyan-900 mb-4 flex items-center">
                                    💧 Hidratação Importante
                                </h3>
                                <p className="text-sm text-cyan-800 mb-3">
                                    {supplements.length > 0
                                        ? <span>Você está tomando <strong>{supplements.length} suplemento{supplements.length > 1 ? 's' : ''}</strong>.</span>
                                        : <span>Mantenha-se hidratado para melhor saúde.</span>
                                    }
                                </p>
                                <div className="bg-white rounded-lg p-4 mb-3">
                                    <p className="text-2xl font-bold text-cyan-600 mb-1">
                                        🚰 {calculateHydration()}L de água/dia
                                    </p>
                                    <p className="text-xs text-cyan-700">
                                        Base: 2L {supplements.length > 0 && `+ ${(supplements.length * 0.2).toFixed(1)}L (${supplements.length} × 200ml)`}
                                    </p>
                                </div>
                                <p className="text-xs text-cyan-800 mb-3">
                                    <strong>Por quê?</strong> Água ajuda na absorção de nutrientes e previne sobrecarga renal.
                                    <span className="block mt-1 font-semibold">Grande parte das doenças se originam da desidratação crônica.</span>
                                </p>
                                <p className="text-xs text-cyan-800 italic mb-4 p-2 bg-cyan-100 rounded-lg">
                                    "Energize sua água com bons pensamentos antes de beber."
                                    <br /><span className="font-bold not-italic">- Dr. Masaru Emoto 💧✨</span>
                                </p>


                                {/* Water Reminders Toggle */}
                                <div className="bg-cyan-100 rounded-lg p-3 text-xs border border-cyan-300">
                                    <p className="text-cyan-900 mb-2 font-semibold">💡 Lembretes de Água</p>
                                    <p className="text-cyan-800 mb-3">
                                        Para {calculateHydration()}L: <strong>{Math.ceil(calculateHydration() / 0.5)} copos</strong>
                                        {' '}(500ml a cada {Math.floor(12 / Math.ceil(calculateHydration() / 0.5))}h)
                                    </p>
                                    <button
                                        onClick={() => {
                                            alert('🚰 Em breve!\n\nSistema de lembretes de hidratação será ativado na próxima versão.');
                                        }}
                                        className="w-full bg-cyan-600 text-white py-2 rounded-lg font-semibold hover:bg-cyan-700 transition-colors"
                                    >
                                        Ativar Lembretes de Água
                                    </button>
                                </div>
                            </div>

                            {/* Notification Card - Coluna 2 */}
                            <div className="bg-purple-50 rounded-2xl shadow-lg p-6 border border-purple-200">
                                <h3 className="text-lg font-bold text-purple-900 mb-2">
                                    🔔 Lembretes de Suplementos
                                </h3>
                                <p className="text-sm text-purple-700 mb-3">
                                    Receba <strong>3 notificações consolidadas</strong> por dia
                                </p>
                                <div className="bg-purple-100 rounded-lg p-3 mb-3 text-xs text-purple-800">
                                    <p className="font-semibold mb-1">📱 Como funciona:</p>
                                    <ul className="space-y-1 ml-4">
                                        <li>• <strong>Notificação Web Push</strong> (via navegador)</li>
                                        <li>• Funciona mesmo com site fechado</li>
                                        <li>• Padrão: 8h, 13h, 19h</li>
                                    </ul>
                                </div>
                                <p className="text-xs text-purple-600 mb-4">
                                    Exemplo: "🌅 Suplementos Matinais (3)" às 8h
                                </p>
                                <button
                                    onClick={notificationsEnabled
                                        ? () => {
                                            setNotificationsEnabled(false);
                                            localStorage.removeItem('nutriming_notifications');
                                        }
                                        : requestNotificationPermission
                                    }
                                    className={`w-full px-6 py-3 rounded-xl font-semibold transition-all ${notificationsEnabled
                                        ? 'bg-green-500 text-white hover:bg-green-600'
                                        : 'bg-purple-600 text-white hover:bg-purple-700'
                                        }`}
                                >
                                    {notificationsEnabled ? '✅ Lembretes Ativos' : 'Ativar Lembretes'}
                                </button>
                                {notificationsEnabled && (
                                    <div className="bg-green-100 border border-green-300 rounded-lg p-3 text-xs text-green-800 mt-3">
                                        ✅ Você receberá notificações nos horários dos suplementos!
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Alerta Polypharmacy (> 8 suplementos) - FORA DO GRID */}
                        {supplements.length > 8 && (
                            <div className="bg-orange-50 rounded-2xl shadow-lg p-6 border border-orange-200 mt-6">
                                <div className="flex items-start space-x-3">
                                    <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-orange-900">
                                        <p className="font-bold mb-2">⚠️ Muitos Suplementos Simultâneos</p>
                                        <p className="mb-2">
                                            Você está tomando <strong>{supplements.length} suplementos</strong>.
                                            Estudos indicam que <strong>mais de 8 suplementos diários</strong> podem:
                                        </p>
                                        <ul className="text-xs space-y-1 ml-4 mb-3">
                                            <li>• Aumentar risco de interações não documentadas</li>
                                            <li>• Sobrecarregar fígado e rins</li>
                                            <li>• Dificultar adesão ao tratamento</li>
                                        </ul>
                                        <p className="text-xs font-semibold">
                                            Recomendação: Consulte um nutricionista para priorizar os mais importantes.
                                        </p>
                                        <p className="text-xs text-orange-700 mt-2">
                                            Fonte: J Am Geriatr Soc. 2019; European J Clin Nutr. 2020
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Wellness Awareness Section - Pilares Naturais */}
<div className="bg-emerald-50 rounded-2xl shadow-lg p-6 border border-emerald-200 mt-6">
                            <h3 className="text-lg font-bold text-emerald-900 mb-4 flex items-center">
                                🌿 Pilares do Bem-Estar (Além da Suplementação)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Movimento */}
                                <div className="bg-white p-4 rounded-xl text-center border border-emerald-100 hover:shadow-md transition-shadow">
                                    <span className="text-3xl mb-3 block">🧘</span>
                                    <p className="font-bold text-emerald-800 mb-1">Movimento Diário</p>
                                    <p className="text-xs text-emerald-600">
                                        <strong>Alongue seu corpo 1x ao dia.</strong>
                                        <br />Ativa a circulação e reduz o estresse físico.
                                    </p>
                                </div>

                                {/* Sol */}
                                <div className="bg-white p-4 rounded-xl text-center border border-emerald-100 hover:shadow-md transition-shadow">
                                    <span className="text-3xl mb-3 block">☀️</span>
                                    <p className="font-bold text-emerald-800 mb-1">Vitamina D Natural</p>
                                    <p className="text-xs text-emerald-600">
                                        <strong>15 min de sol pela manhã.</strong>
                                        <br />Melhor que qualquer pílula para imunidade e humor.
                                    </p>
                                </div>

                                {/* Sono */}
                                <div className="bg-white p-4 rounded-xl text-center border border-emerald-100 hover:shadow-md transition-shadow">
                                    <span className="text-3xl mb-3 block">📵</span>
                                    <p className="font-bold text-emerald-800 mb-1">Higiene do Sono</p>
                                    <p className="text-xs text-emerald-600">
                                        <strong>Zero telas 1h antes de dormir.</strong>
                                        <br />Luz azul bloqueia sua Melatonina natural.
                                    </p>
                                </div>
                            </div>
                            <p className="text-xs text-emerald-700 text-center mt-4 italic">
                                "O melhor remédio é um estilo de vida consciente."
                            </p>
                        </div>

                    </div>
                </div>

                {/* ═══ VERIFICADOR DE SEGURANÇA AI ═══ */}
                <div className="mt-10 bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                    <button
                        onClick={() => setShowInteractionChecker(v => !v)}
                        className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-md">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Verificador de Segurança AI</h3>
                                <p className="text-sm text-slate-500">Analisa interações entre seus suplementos e medicamentos com base em literatura científica</p>
                            </div>
                        </div>
                        {showInteractionChecker ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                    </button>

                    {showInteractionChecker && (
                        <div className="px-6 pb-6 border-t border-slate-100 pt-5 space-y-5">
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3">
                                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-800">
                                    <strong>Ferramenta educacional.</strong> Baseada em literatura científica. Não substitui avaliação médica ou farmacêutica. Nem todas as interações são conhecidas — o relatório inclui essa honestidade.
                                </p>
                            </div>

                            {supplements.length > 0 && (
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Suplementos do Nutriming (incluídos automaticamente)</p>
                                    <div className="flex flex-wrap gap-2">
                                        {supplements.map(s => (
                                            <span key={s.id} className="inline-flex items-center text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full border border-green-200 font-medium">
                                                <Activity className="w-3 h-3 mr-1" />{s.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Adicione seus medicamentos convencionais</p>
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={newMedication}
                                        onChange={e => setNewMedication(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && addMedication()}
                                        placeholder="Ex: Losartana, Metformina, Rivotril..."
                                        className="flex-1 px-4 py-2 border border-slate-300 rounded-xl text-sm text-slate-900 bg-white placeholder-slate-400 focus:ring-2 focus:ring-rose-400 focus:outline-none"
                                    />
                                    <button onClick={addMedication} className="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-700 flex items-center">
                                        <Pill className="w-4 h-4 mr-1" /> Adicionar
                                    </button>
                                </div>
                                {medications.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {medications.map(m => (
                                            <span key={m} className="inline-flex items-center text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200 font-medium">
                                                <Pill className="w-3 h-3 mr-1" />{m}
                                                <button onClick={() => setMedications(prev => prev.filter(x => x !== m))} className="ml-2 text-slate-400 hover:text-red-500">✕</button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={runInteractionCheck}
                                disabled={interactionLoading || (supplements.length === 0 && medications.length === 0)}
                                className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2 shadow-md"
                            >
                                {interactionLoading
                                    ? <><Loader className="w-5 h-5 animate-spin" /><span>Analisando com IA...</span></>
                                    : <><Shield className="w-5 h-5" /><span>Verificar Segurança do Protocolo</span></>
                                }
                            </button>

                            {interactionError && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{interactionError}</div>
                            )}

                            {interactionReport && showReportDetails && (
                                <div className="space-y-4 mt-2">
                                    <div className="bg-slate-800 text-white p-4 rounded-xl">
                                        <p className="text-sm font-semibold">{interactionReport.resumoGeral}</p>
                                        <p className="text-xs text-slate-400 mt-1">{interactionReport.totalInteracoes} combinações analisadas</p>
                                    </div>
                                    {interactionReport.alertasMedicos?.length > 0 && (
                                        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4">
                                            <p className="font-bold text-red-800 mb-2 flex items-center"><AlertCircle className="w-4 h-4 mr-2" />Atenção Médica Necessária</p>
                                            {interactionReport.alertasMedicos.map((a: string, i: number) => (
                                                <p key={i} className="text-sm text-red-700 mb-1">• {a}</p>
                                            ))}
                                        </div>
                                    )}
                                    {interactionReport.interacoes?.map((inter: any, i: number) => (
                                        <div key={i} className={`rounded-xl p-4 border ${riskColor[inter.nivel] || riskColor['desconhecida']}`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="font-bold text-sm">{inter.emoji} {inter.substancia1} + {inter.substancia2}</p>
                                                <span className="text-xs font-black uppercase tracking-wider opacity-70">{inter.nivel}</span>
                                            </div>
                                            <p className="text-xs mb-1"><strong>Efeito:</strong> {inter.efeito}</p>
                                            <p className="text-xs mb-1"><strong>Mecanismo:</strong> {inter.mecanismo}</p>
                                            <p className="text-xs font-semibold">💡 {inter.recomendacao}</p>
                                            {inter.fonte && <p className="text-[10px] opacity-60 mt-1">Fonte: {inter.fonte}</p>}
                                        </div>
                                    ))}
                                    {interactionReport.combinacoesDesconhecidas?.length > 0 && (
                                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                            <p className="font-bold text-gray-700 text-sm mb-2">⚪ Combinações sem Dados Suficientes</p>
                                            {interactionReport.combinacoesDesconhecidas.map((c: string, i: number) => (
                                                <p key={i} className="text-xs text-gray-600 mb-1">• {c}</p>
                                            ))}
                                        </div>
                                    )}
                                    {interactionReport.recomendacoesGerais?.length > 0 && (
                                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                                            <p className="font-bold text-emerald-800 text-sm mb-2">✅ Recomendações para Otimizar Segurança</p>
                                            {interactionReport.recomendacoesGerais.map((r: string, i: number) => (
                                                <p key={i} className="text-xs text-emerald-700 mb-1">• {r}</p>
                                            ))}
                                        </div>
                                    )}
                                    {interactionReport.disclaimer && (
                                        <p className="text-[10px] text-slate-400 text-center italic">{interactionReport.disclaimer}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};
